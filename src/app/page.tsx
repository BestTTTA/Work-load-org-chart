import Link from "next/link";
import { Suspense } from "react";
import { LoadLegend } from "@/components/load-badge";
import { BranchNode, OrgChart, RootNode } from "@/components/org-chart";
import { PageSkeleton } from "@/components/page-skeleton";
import { PersonNode } from "@/components/person-node";
import { readDb } from "@/lib/db";
import type { Db } from "@/lib/types";
import {
  groupByDepartment,
  loadLevel,
  membersOf,
  projectsOf,
  sortEmployees,
  sortProjects,
} from "@/lib/workload";

type View = "department" | "project";

const VIEWS: { view: View; label: string; href: string }[] = [
  { view: "department", label: "ตามสังกัด", href: "/" },
  { view: "project", label: "ตามโปรเจค", href: "/?view=project" },
];

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">ผังงาน Workload</h1>
      <Suspense fallback={<PageSkeleton />}>
        <Overview searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Overview({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const { view: requested } = await searchParams;
  const view: View = requested === "project" ? "project" : "department";
  const db = await readDb();

  if (db.employees.length === 0 && db.projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
        <p className="font-medium">ยังไม่มีข้อมูลในผังงาน</p>
        <p className="mt-1 text-sm text-muted">
          เริ่มจาก
          <Link href="/employees" className="mx-1 text-accent hover:underline">
            เพิ่มพนักงาน
          </Link>
          แล้ว
          <Link href="/projects" className="mx-1 text-accent hover:underline">
            สร้างโปรเจค
          </Link>
        </p>
      </div>
    );
  }

  const overloaded = db.employees.filter(
    (employee) => loadLevel(projectsOf(db, employee.id).length) === "over",
  ).length;

  return (
    <>
      <p className="text-sm text-muted">
        พนักงาน {db.employees.length} คน · {db.projects.length} โปรเจค · งานล้น{" "}
        {overloaded} คน
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-line bg-surface p-0.5">
          {VIEWS.map((item) => (
            <Link
              key={item.view}
              href={item.href}
              aria-current={item.view === view ? "page" : undefined}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                item.view === view
                  ? "bg-accent text-accent-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <LoadLegend />
      </div>
      {view === "department" ? (
        <DepartmentChart db={db} />
      ) : (
        <ProjectChart db={db} />
      )}
    </>
  );
}

function DepartmentChart({ db }: { db: Db }) {
  return (
    <OrgChart
      root={
        <RootNode
          title="ทั้งองค์กร"
          subtitle={`พนักงาน ${db.employees.length} คน`}
        />
      }
      branches={groupByDepartment(db.employees).map((group) => ({
        key: group.department,
        head: (
          <BranchNode
            title={group.department}
            subtitle={`${group.employees.length} คน`}
          />
        ),
        leaves: group.employees.map((employee) => {
          const projects = projectsOf(db, employee.id);
          return {
            key: employee.id,
            node: (
              <PersonNode
                nickname={employee.nickname}
                subtitle={employee.role}
                projectCount={projects.length}
                projects={projects}
              />
            ),
          };
        }),
      }))}
    />
  );
}

function ProjectChart({ db }: { db: Db }) {
  return (
    <OrgChart
      root={
        <RootNode title="ทุกโปรเจค" subtitle={`${db.projects.length} โปรเจค`} />
      }
      branches={sortProjects(db.projects).map((project) => {
        const members = sortEmployees(membersOf(db, project));
        return {
          key: project.id,
          head: (
            <BranchNode
              title={
                <Link
                  href={`/projects/${project.id}`}
                  className="hover:underline"
                >
                  {project.name}
                </Link>
              }
              subtitle={`${members.length} คน`}
            />
          ),
          leaves: members.map((employee) => ({
            key: employee.id,
            node: (
              <PersonNode
                nickname={employee.nickname}
                subtitle={`${employee.role} · ${employee.department}`}
                projectCount={projectsOf(db, employee.id).length}
              />
            ),
          })),
        };
      })}
    />
  );
}
