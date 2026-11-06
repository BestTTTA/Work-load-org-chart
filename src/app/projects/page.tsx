import Link from "next/link";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import { ProjectForm } from "@/components/project-form";
import { readDb } from "@/lib/db";
import { membersOf, sortProjects, uniqueValues } from "@/lib/workload";

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">โปรเจค</h1>
      <section className="rounded-lg border border-line bg-surface p-4">
        <ProjectForm />
      </section>
      <Suspense fallback={<PageSkeleton />}>
        <ProjectList />
      </Suspense>
    </div>
  );
}

async function ProjectList() {
  const db = await readDb();

  if (db.projects.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        ยังไม่มีโปรเจค ตั้งชื่อด้านบนเพื่อสร้างโปรเจคแรก
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sortProjects(db.projects).map((project) => {
        const members = membersOf(db, project);
        const departments = uniqueValues(
          members.map((member) => member.department),
        );
        return (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="block h-full rounded-lg border border-line bg-surface p-4 hover:border-accent"
            >
              <p className="font-semibold break-words">{project.name}</p>
              <p className="mt-1 text-sm text-muted">
                {members.length === 0
                  ? "ยังไม่มีคนในโปรเจค"
                  : `${members.length} คน · ${departments.join(", ")}`}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
