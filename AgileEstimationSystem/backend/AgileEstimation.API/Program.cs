using AgileEstimation.API.Filters;
using AgileEstimation.API.Hubs;
using AgileEstimation.API.Middleware;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Application.Mapping;
using AgileEstimation.Infrastructure.Authentication;
using AgileEstimation.Infrastructure.Services;
using AgileEstimation.Persistence;
using AgileEstimation.Persistence.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Structured logging (Part 1 review: Serilog was in the tech-stack doc
// but never wired up). Reads its sinks/levels from the "Serilog" section
// of appsettings.json (see that file) rather than being hardcoded here,
// so log verbosity can be tuned per-environment without a code change.
builder.Host.UseSerilog((context, services, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// 1. ADD THIS: Register controllers
builder.Services.AddControllers(options =>
{
    // Runs FluentValidation validators against REST action arguments —
    // see FluentValidationActionFilter for why this is a plain filter
    // instead of the FluentValidation.AspNetCore auto-validation package.
    options.Filters.Add<FluentValidationActionFilter>();
});

builder.Services.AddSignalR();

// Registers every AbstractValidator<T> in the Application assembly
// (RegisterRequestValidator, CastVoteRequestValidator, etc. — see
// AgileEstimation.Application.Validators) so both FluentValidationActionFilter
// (REST) and VoteService's manual check (SignalR) can resolve IValidator<T>.
builder.Services.AddValidatorsFromAssemblyContaining<AgileEstimation.Application.Validators.RegisterRequestValidator>();

// AutoMapper (Part 1 review, finding 3.4 — referenced in every .csproj,
// never actually used). One profile, defined in the Application layer
// next to the DTOs it maps (see MappingProfile).
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// Configure Swagger with JWT Support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1",
        new OpenApiInfo
        {
            Title = "Agile Estimation API",
            Version = "v1"
        });

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter JWT Token"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});

// Register Dependencies
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasherService>();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<ISessionParticipantRepository, SessionParticipantRepository>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IVoteRepository, VoteRepository>();
builder.Services.AddScoped<IVoteService, VoteService>();
// Backs the refresh-token flow (Part 1 review, finding 3.2).
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

// Health checks (Part 1 review — requested in the spec, not present).
// Exposed at GET /health; checks the app can actually reach SQL Server,
// not just that the process is running.
builder.Services.AddHealthChecks()
    .AddSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "sql-server");

// Configure JWT Authentication
//
// SECURITY FIX (see backend review, item 1): the signing key was
// previously committed in plain text in appsettings.json. ASP.NET Core
// already layers environment variables into IConfiguration by default,
// so both this file and JwtService.cs (which also reads Jwt:Key via
// IConfiguration) automatically pick up an override from either:
//   setx Jwt__Key "your-long-random-secret-here"     (Windows, then reopen terminal)
//   export Jwt__Key="your-long-random-secret-here"   (macOS/Linux)
// or, for local dev, `dotnet user-secrets set "Jwt:Key" "..."` instead of
// editing appsettings.json at all. The value committed in
// appsettings.json is now just a placeholder that intentionally fails
// the check below so the app won't silently run with a throwaway key.
var jwt = builder.Configuration.GetSection("Jwt");
var jwtKey = jwt["Key"];

if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32 || jwtKey.StartsWith("REPLACE_ME"))
{
    throw new InvalidOperationException(
        "JWT signing key is missing, a placeholder, or too short (must be at least 32 " +
        "characters). Set it via the Jwt__Key environment variable or " +
        "`dotnet user-secrets set \"Jwt:Key\" \"...\"` — do not commit a real key to appsettings.json.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken =
                    context.Request.Query["access_token"];

                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs/planning-poker"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Request logging via Serilog — one structured line per request
// (method, path, status code, elapsed ms) in addition to whatever each
// endpoint logs itself.
app.UseSerilogRequestLogging();

// Registered first (right after request logging) so it wraps everything
// downstream — authentication, authorization, and every controller/hub
// action (see Part 1 review, finding 3.3).
app.UseGlobalExceptionHandling();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // 2. ADD THESE: Enable the Swagger UI middleware
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Agile Estimation API v1");
    });
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

// Authentication MUST come before Authorization
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHub<PlanningPokerHub>("/hubs/planning-poker");

app.MapHealthChecks("/health");

app.Run();
