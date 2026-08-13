import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

/**
 * No user-configurable preferences exist in the backend today (no theme,
 * notification, or profile-update endpoints), so there's nothing real to
 * wire this page to yet. Left as an honest placeholder rather than a form
 * that silently does nothing when submitted.
 */
export default function SettingsPage() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-ink-600 dark:text-parchment-200/70">
          There aren't any user-configurable settings on the backend yet — nothing here would
          have anywhere to save to. This page is ready to build out once a preferences endpoint
          exists.
        </p>
      </CardContent>
    </Card>
  );
}
