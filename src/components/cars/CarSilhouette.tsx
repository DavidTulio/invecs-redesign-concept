import type { BodyType } from "@/lib/types";

// Simple side profiles used as photo placeholders (Phase 1) and as body-type icons.
const PATHS: Record<BodyType, string> = {
  suv: "M18 74 L24 50 Q28 40 40 38 L70 34 L92 14 Q98 10 108 10 L176 10 Q186 10 192 18 L208 40 L222 46 Q230 50 230 60 L230 76 Q230 82 224 82 L18 82 Q12 82 12 76 Z",
  pickup:
    "M14 76 L20 52 Q24 42 36 40 L74 36 L96 14 Q100 10 110 10 L146 10 Q154 10 156 18 L160 42 L228 42 Q232 42 232 48 L232 76 Q232 82 226 82 L18 82 Q14 82 14 76 Z",
  sedan:
    "M12 74 L18 56 Q22 48 34 46 L76 40 L102 22 Q110 18 122 18 L160 18 Q172 18 180 26 L198 42 L222 48 Q230 50 230 60 L230 76 Q230 82 224 82 L18 82 Q12 82 12 74 Z",
  van: "M14 76 L14 30 Q14 12 32 12 L200 12 Q212 12 218 22 L230 50 Q232 54 232 60 L232 76 Q232 82 226 82 L20 82 Q14 82 14 76 Z",
};

export function CarSilhouette({
  type,
  className,
}: {
  type: BodyType;
  className?: string;
}) {
  const [front, rear] = type === "sedan" ? [58, 188] : [62, 188];
  return (
    <svg viewBox="0 0 244 104" className={className} aria-hidden focusable="false">
      <path fill="currentColor" d={PATHS[type]} />
      {[front, rear].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={84} r={17} fill="currentColor" />
          <circle cx={cx} cy={84} r={8} fill="var(--color-paper)" opacity={0.55} />
        </g>
      ))}
    </svg>
  );
}
