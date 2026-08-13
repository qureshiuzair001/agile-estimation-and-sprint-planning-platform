import { HubConnectionState } from "@microsoft/signalr";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useConnectionStore } from "@/store/connectionStore";

export function ConnectionStatusBadge() {
  const status = useConnectionStore((state) => state.status);

  if (status === HubConnectionState.Connected) {
    return (
      <Badge tone="success" className="gap-1">
        <Wifi className="size-3" /> Live
      </Badge>
    );
  }

  if (status === HubConnectionState.Reconnecting || status === HubConnectionState.Connecting) {
    return (
      <Badge tone="gold" className="gap-1">
        <Loader2 className="size-3 animate-spin" /> Reconnecting
      </Badge>
    );
  }

  return (
    <Badge tone="danger" className="gap-1">
      <WifiOff className="size-3" /> Offline
    </Badge>
  );
}
