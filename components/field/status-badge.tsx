import { Badge } from "@/components/ui/badge";
import type { Lang } from "@/lib/kit/i18n";
import { TEXT } from "@/lib/text";
import type { Status } from "@/lib/work-orders";

const VARIANT: Record<Status, "outline" | "secondary" | "default"> = {
  scheduled: "outline",
  dispatched: "secondary",
  "on-site": "default",
  complete: "secondary",
};

/** A work order's status, the same everywhere it is shown. */
export function StatusBadge({ status, lang }: { status: Status; lang: Lang }) {
  return (
    <Badge variant={VARIANT[status]} data-status={status}>
      {TEXT[lang].statuses[status]}
    </Badge>
  );
}
