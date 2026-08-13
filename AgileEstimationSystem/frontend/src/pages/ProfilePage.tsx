import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null; // ProtectedRoute + App's session check guarantee this only renders briefly, if at all.
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4 pt-0">
        <Avatar username={user.username} size="lg" />
        <div>
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-parchment-50">
            {user.username}
          </p>
          <p className="text-sm text-ink-600 dark:text-parchment-200/70">{user.email}</p>
          <Badge tone="info" className="mt-2">
            {user.role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
