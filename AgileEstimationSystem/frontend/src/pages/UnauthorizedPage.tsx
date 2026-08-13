import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-felt-texture px-4 text-center">
      <ShieldAlert className="size-10 text-coral-400" aria-hidden="true" />
      <h1 className="font-display text-3xl font-semibold text-parchment-50">Access denied</h1>
      <p className="max-w-sm text-sm text-parchment-200/70">
        You don't have permission to view this page. If you think this is a mistake, ask your
        session moderator.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
