import type { Db, Employee, Project } from "./types";

export type LoadLevel = "free" | "normal" | "busy" | "over";

/** Workload is the number of projects a person is on. Tune the bands here. */
export const LOAD_LEVELS: { level: LoadLevel; label: string; range: string }[] = [
  { level: "free", label: "ว่าง", range: "0" },
  { level: "normal", label: "ปกติ", range: "1–2" },
  { level: "busy", label: "ค่อนข้างเยอะ", range: "3" },
  { level: "over", label: "งานล้น", range: "4+" },
];

export function loadLevel(projectCount: number): LoadLevel {
  if (projectCount === 0) return "free";
  if (projectCount <= 2) return "normal";
  if (projectCount === 3) return "busy";
  return "over";
}

const byThai = (a: string, b: string) => a.localeCompare(b, "th");

export function sortEmployees(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => byThai(a.nickname, b.nickname));
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => byThai(a.name, b.name));
}

export function groupByDepartment(
  employees: Employee[],
): { department: string; employees: Employee[] }[] {
  const groups = new Map<string, Employee[]>();
  for (const employee of employees) {
    groups.set(employee.department, [
      ...(groups.get(employee.department) ?? []),
      employee,
    ]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => byThai(a, b))
    .map(([department, members]) => ({
      department,
      employees: sortEmployees(members),
    }));
}

export function projectsOf(db: Db, employeeId: string): Project[] {
  return sortProjects(
    db.projects.filter((project) => project.memberIds.includes(employeeId)),
  );
}

export function membersOf(db: Db, project: Project): Employee[] {
  return db.employees.filter((employee) =>
    project.memberIds.includes(employee.id),
  );
}

export function uniqueValues(values: string[]): string[] {
  return [...new Set(values)].sort(byThai);
}
