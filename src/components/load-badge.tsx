import { LOAD_LEVELS, loadLevel, type LoadLevel } from "@/lib/workload";

const LOAD_STYLES: Record<LoadLevel, string> = {
  free: "bg-free-soft text-free",
  normal: "bg-normal-soft text-normal",
  busy: "bg-busy-soft text-busy",
  over: "bg-over-soft text-over",
};

export function LoadBadge({ count }: { count: number }) {
  const level = loadLevel(count);
  const label = LOAD_LEVELS.find((item) => item.level === level)?.label;
  return (
    <span
      title={`${label} · ${count} โปรเจค`}
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${LOAD_STYLES[level]}`}
    >
      {count} โปรเจค
    </span>
  );
}

export function LoadLegend() {
  return (
    <ul className="flex flex-wrap gap-2 text-xs">
      {LOAD_LEVELS.map(({ level, label, range }) => (
        <li
          key={level}
          className={`rounded-full px-2.5 py-1 font-medium ${LOAD_STYLES[level]}`}
        >
          {label} · {range} โปรเจค
        </li>
      ))}
    </ul>
  );
}
