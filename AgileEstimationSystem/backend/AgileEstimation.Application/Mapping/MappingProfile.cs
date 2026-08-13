using AgileEstimation.Application.DTOs.Session;
using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.DTOs.Voting;
using AgileEstimation.Domain.Entities;
using AutoMapper;

namespace AgileEstimation.Application.Mapping;

/// <summary>
/// Replaces the private static Map()/MapVote()/MapParticipants() methods
/// that used to be duplicated (with slightly different shapes) across
/// SessionService, TicketService, and VoteService — one mapping
/// definition per entity/DTO pair instead of three ad hoc ones (see Part
/// 1 review, finding 3.4: AutoMapper was referenced in every .csproj but
/// never actually used anywhere until now).
///
/// SessionResponse.IsCurrentUserModerator needs the acting user's id,
/// which isn't a property of Session — AutoMapper's ResolutionContext
/// carries it via the "currentUserId" item, set explicitly at each call
/// site with `_mapper.Map&lt;SessionResponse&gt;(session, opts =>
/// opts.Items["currentUserId"] = currentUserId)`.
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Session, SessionResponse>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.IsCurrentUserModerator, o => o.MapFrom((src, _, _, context) =>
                context.Items.TryGetValue("currentUserId", out var currentUserId) &&
                src.ModeratorId.Equals(currentUserId)));

        CreateMap<SessionParticipant, ParticipantResponse>()
            .ForMember(d => d.Username, o => o.MapFrom(s => s.User.Username))
            .ForMember(d => d.Role, o => o.MapFrom(s => s.User.Role.ToString()));

        CreateMap<Ticket, TicketResponse>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<Vote, VoteResponse>()
            .ForMember(d => d.Username, o => o.MapFrom(s => s.User.Username))
            .ForMember(d => d.Role, o => o.MapFrom(s => s.User.Role.ToString()));
    }
}
