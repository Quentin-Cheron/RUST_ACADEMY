import { Info, Lightbulb, TriangleAlert, OctagonX } from "lucide-react";
import { renderInline } from "@/lib/inline";

type Variant = "info" | "tip" | "warning" | "danger";

const styles: Record<
  Variant,
  { border: string; bg: string; icon: React.ReactNode; label: string }
> = {
  info: {
    border: "border-sky-400/40",
    bg: "bg-sky-400/10",
    icon: <Info className="size-4 text-sky-500" />,
    label: "Info",
  },
  tip: {
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/10",
    icon: <Lightbulb className="size-4 text-emerald-500" />,
    label: "Astuce",
  },
  warning: {
    border: "border-amber-400/50",
    bg: "bg-amber-400/10",
    icon: <TriangleAlert className="size-4 text-amber-500" />,
    label: "Attention",
  },
  danger: {
    border: "border-red-400/50",
    bg: "bg-red-400/10",
    icon: <OctagonX className="size-4 text-red-500" />,
    label: "Piege",
  },
};

export default function Callout({
  variant,
  title,
  text,
}: {
  variant: Variant;
  title?: string;
  text: string;
}) {
  const s = styles[variant];
  return (
    <div className={`my-5 rounded-xl border ${s.border} ${s.bg} p-4`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        {s.icon}
        <span>{title ?? s.label}</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{renderInline(text)}</p>
    </div>
  );
}
