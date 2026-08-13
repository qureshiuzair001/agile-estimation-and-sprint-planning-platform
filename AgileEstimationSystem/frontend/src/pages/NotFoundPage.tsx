import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-felt-texture px-4 text-center">
      <CompassIcon className="size-10 text-chip-400" aria-hidden="true" />
      <h1 className="font-display text-3xl font-semibold text-parchment-50">Page not found</h1>
      <p className="max-w-sm text-sm text-parchment-200/70">
        The page you're looking for doesn't exist, or the link may be out of date.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
