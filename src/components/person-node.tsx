import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/lib/types";
import { loadLevel } from "@/lib/workload";
import { LoadBadge } from "./load-badge";

export function PersonNode({
  nickname,
  subtitle,
  projectCount,
  projects,
  action,
}: {
  nickname: string;
  subtitle: string;
  projectCount: number;
  projects?: Project[];
  action?: ReactNode;
}) {
  const overloaded = loadLevel(projectCount) === "over";
  return (
    <div
      className={`rounded-lg border bg-surface px-3 py-2 ${
        overloaded ? "border-over" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 font-medium break-words">{nickname}</p>
        <LoadBadge count={projectCount} />
      </div>
      <p className="text-xs break-words text-muted">{subtitle}</p>
      {projects && projects.length > 0 && (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {projects.map((project) => (
            <li key={project.id} className="min-w-0">
              <Link
                href={`/projects/${project.id}`}
                className="block rounded bg-accent-soft px-1.5 py-0.5 text-xs break-words text-accent hover:underline"
              >
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {action && <div className="mt-1 text-right">{action}</div>}
    </div>
  );
}
