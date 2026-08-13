import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";

import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Once the login mutation populates the store, isAuthenticated flips
  // true and we send the user on to wherever they were headed.
  //
  // Uses pathname + search (not just pathname) so a query string — e.g.
  // the ?code= on an invite link someone followed while logged out —
  // survives the round trip through /login instead of being silently
  // dropped.
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: Location })?.from;
      const redirectTo = from ? `${from.pathname}${from.search ?? ""}` : ROUTES.DASHBOARD;
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to join or run a planning session">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
          autoComplete="current-password"
          icon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" fullWidth isLoading={isPending}>
          Sign in
        </Button>

        <p className="text-center text-sm text-ink-600 dark:text-parchment-200/70">
          Don't have an account?{" "}
          <Link to={ROUTES.REGISTER} className="font-medium text-chip-600 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
