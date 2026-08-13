import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { joinSessionSchema, type JoinSessionFormValues } from "@/schemas/session.schema";
import { useJoinSession } from "@/hooks/useSessions";
import { planningRoomPath } from "@/constants/routes";

/**
 * The backend patch made POST /join return the full SessionResponse
 * (previously just a message with no id), so joining now navigates
 * straight into the room like Create Session does — no more "ask your
 * moderator for the link" dead end.
 *
 * Also reads a `?code=` query param, pre-filling the field when someone
 * arrives via a "Copy invite link" URL (see PlanningRoomPage) instead of
 * typing the code by hand. Pre-fills rather than auto-submits, so the
 * person still gets a chance to confirm before joining.
 */
export default function JoinSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromLink = searchParams.get("code");
  const { mutate: joinSession, isPending } = useJoinSession();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JoinSessionFormValues>({
    resolver: zodResolver(joinSessionSchema),
    defaultValues: { sessionCode: codeFromLink?.toUpperCase() ?? "" },
  });

  useEffect(() => {
    if (codeFromLink) {
      setValue("sessionCode", codeFromLink.toUpperCase());
    }
  }, [codeFromLink, setValue]);

  function onSubmit(values: JoinSessionFormValues) {
    joinSession(values, {
      onSuccess: (session) => navigate(planningRoomPath(session.id)),
    });
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Join a session</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-4 pt-0">
          <Input
            label="Session code"
            placeholder="ABC123"
            maxLength={6}
            className="font-mono uppercase tracking-widest"
            error={errors.sessionCode?.message}
            {...register("sessionCode")}
          />
        </CardContent>

        <CardFooter>
          <Button type="submit" isLoading={isPending}>
            Join session
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
