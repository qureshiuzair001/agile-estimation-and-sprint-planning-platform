import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSessionSchema, type CreateSessionFormValues } from "@/schemas/session.schema";
import { useCreateSession } from "@/hooks/useSessions";
import { planningRoomPath } from "@/constants/routes";

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { mutate: createSession, isPending } = useCreateSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSessionFormValues>({ resolver: zodResolver(createSessionSchema) });

  function onSubmit(values: CreateSessionFormValues) {
    createSession(values, {
      onSuccess: (session) => navigate(planningRoomPath(session.id)),
    });
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Create a session</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-4 pt-0">
          <Input
            label="Session title"
            placeholder="Sprint 24 estimation"
            error={errors.title?.message}
            {...register("title")}
          />
        </CardContent>

        <CardFooter>
          <Button type="submit" isLoading={isPending}>
            Create session
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
