import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { LoadLegend } from "@/components/load-badge";
import { MemberSearch } from "@/components/member-search";
import { BranchNode, OrgChart, RootNode } from "@/components/org-chart";
import { PageSkeleton } from "@/components/page-skeleton";
import { PersonNode } from "@/components/person-node";
import { ProjectTitle } from "@/components/project-title";
import { deleteProject, removeMember } from "@/lib/actions";
import { readDb } from "@/lib/db";
import {
  groupByDepartment,
  membersOf,
  projectsOf,
  sortEmployees,
} from "@/lib/workload";

export default function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  return (
    <div className="space-y-4">
      <Link href="/projects" className="text-sm text-accent hover:underline">
        ← โปรเจคทั้งหมด
      </Link>
      <Suspense fallback={<PageSkeleton />}>
        <ProjectDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProjectDetail({
  params,
}: {
  params: PageProps<"/projects/[id]">["params"];
}) {
  const { id } = await params;
  const db = await readDb();
  const project = db.projects.find((item) => item.id === id);
  if (!project) notFound();

  const members = membersOf(db, project);
  const candidates = sortEmployees(
    db.employees.filter((employee) => !project.memberIds.includes(employee.id)),
  ).map((employee) => ({
    ...employee,
    projectCount: projectsOf(db, employee.id).length,
  }));

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <ProjectTitle id={project.id} name={project.name} />
        <ConfirmButton
          action={deleteProject.bind(null, project.id)}
          label="ลบโปรเจค"
          confirmLabel="ยืนยันลบโปรเจค"
        />
      </div>
      <MemberSearch projectId={project.id} candidates={candidates} />
      <LoadLegend />
      <OrgChart
        root={
          <RootNode title={project.name} subtitle={`ทีม ${members.length} คน`} />
        }
        branches={groupByDepartment(members).map((group) => ({
          key: group.department,
          head: (
            <BranchNode
              title={group.department}
              subtitle={`${group.employees.length} คน`}
            />
          ),
          leaves: group.employees.map((employee) => ({
            key: employee.id,
            node: (
              <PersonNode
                nickname={employee.nickname}
                subtitle={employee.role}
                projectCount={projectsOf(db, employee.id).length}
                action={
                  <ConfirmButton
                    action={removeMember.bind(null, project.id, employee.id)}
                    label="นำออก"
                    confirmLabel="ยืนยันนำออก"
                  />
                }
              />
            ),
          })),
        }))}
      />
      {members.length === 0 && (
        <p className="text-center text-sm text-muted">
          ยังไม่มีคนในโปรเจคนี้ ค้นหาชื่อด้านบนเพื่อเพิ่มเข้าทีม
        </p>
      )}
    </>
  );
}
