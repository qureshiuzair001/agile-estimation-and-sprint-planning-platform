import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Lock, User } from "lucide-react";

import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useAuth";
import { USER_ROLE_OPTIONS, USER_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: registerAccount, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: USER_ROLES.DEVELOPER },
  });

  function onSubmit(values: RegisterFormValues) {
    registerAccount(
      {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      },
      {
        onSuccess: (data) => {
          if (data.success) navigate(ROUTES.LOGIN, { replace: true });
        },
      }
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join your team's estimation sessions">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Username"
          autoComplete="username"
          icon={<User className="size-4" />}
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium text-ink-700 dark:text-parchment-100">
            Your role
          </label>
          <select
            id="role"
            className="h-10 rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-900 focus:border-chip-400 dark:bg-felt-800 dark:text-parchment-50 dark:border-parchment-50/15"
            {...register("role")}
          >
            {USER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-600/70 dark:text-parchment-200/60">
            {"Moderator"}: creates sessions and tickets, reveals votes, and locks the final
            estimate. {"Developer"} and {"Tester"}: vote secretly on tickets — after a reveal,
            each only sees their own group's votes (plus the moderator's) and average, never the
            other group's.
          </p>
        </div>

        <Button type="submit" fullWidth isLoading={isPending}>
          Create account
        </Button>

        <p className="text-center text-sm text-ink-600 dark:text-parchment-200/70">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="font-medium text-chip-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
