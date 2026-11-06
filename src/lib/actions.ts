"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutateDb } from "./db";
import type { ActionResult, EmployeeFormState } from "./types";

const MAX_LENGTH = 100;

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function refreshAll() {
  revalidatePath("/", "layout");
}

function readEmployeeForm(formData: FormData) {
  const values = {
    nickname: field(formData, "nickname"),
    department: field(formData, "department"),
    role: field(formData, "role"),
  };
  if (!values.nickname || !values.department || !values.role) {
    return { values, error: "กรุณากรอกชื่อเล่น สังกัด และบทบาทให้ครบ" };
  }
  if (Object.values(values).some((value) => value.length > MAX_LENGTH)) {
    return { values, error: `แต่ละช่องกรอกได้ไม่เกิน ${MAX_LENGTH} ตัวอักษร` };
  }
  return { values };
}

export async function createEmployee(
  _previous: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const { values, error } = readEmployeeForm(formData);
  if (error) return { ok: false, error, values };

  await mutateDb((db) => {
    db.employees.push({ id: crypto.randomUUID(), ...values });
  });
  refreshAll();
  return { ok: true };
}

export async function updateEmployee(
  id: string,
  _previous: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const { values, error } = readEmployeeForm(formData);
  if (error) return { ok: false, error, values };

  const found = await mutateDb((db) => {
    const employee = db.employees.find((item) => item.id === id);
    if (employee) Object.assign(employee, values);
    return Boolean(employee);
  });
  refreshAll();
  return found
    ? { ok: true, values }
    : { ok: false, error: "ไม่พบพนักงานคนนี้แล้ว", values };
}

export async function deleteEmployee(id: string): Promise<void> {
  await mutateDb((db) => {
    db.employees = db.employees.filter((employee) => employee.id !== id);
    for (const project of db.projects) {
      project.memberIds = project.memberIds.filter((member) => member !== id);
    }
  });
  refreshAll();
}

function validateProjectName(name: string): string | null {
  if (!name) return "กรุณากรอกชื่อโปรเจค";
  if (name.length > MAX_LENGTH) {
    return `ชื่อโปรเจคยาวได้ไม่เกิน ${MAX_LENGTH} ตัวอักษร`;
  }
  return null;
}

const sameName = (a: string, b: string) =>
  a.toLocaleLowerCase("th") === b.toLocaleLowerCase("th");

export async function createProject(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = field(formData, "name");
  const invalid = validateProjectName(name);
  if (invalid) return { ok: false, error: invalid };

  const id = crypto.randomUUID();
  const created = await mutateDb((db) => {
    if (db.projects.some((project) => sameName(project.name, name))) {
      return false;
    }
    db.projects.push({ id, name, memberIds: [] });
    return true;
  });
  if (!created) return { ok: false, error: "มีโปรเจคชื่อนี้อยู่แล้ว" };

  refreshAll();
  redirect(`/projects/${id}`);
}

export async function renameProject(
  id: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = field(formData, "name");
  const invalid = validateProjectName(name);
  if (invalid) return { ok: false, error: invalid };

  const error = await mutateDb((db) => {
    const project = db.projects.find((item) => item.id === id);
    if (!project) return "ไม่พบโปรเจคนี้แล้ว";
    const taken = db.projects.some(
      (item) => item.id !== id && sameName(item.name, name),
    );
    if (taken) return "มีโปรเจคชื่อนี้อยู่แล้ว";
    project.name = name;
    return null;
  });
  if (error) return { ok: false, error };

  refreshAll();
  return { ok: true };
}

export async function deleteProject(id: string): Promise<void> {
  await mutateDb((db) => {
    db.projects = db.projects.filter((project) => project.id !== id);
  });
  refreshAll();
  redirect("/projects");
}

export async function addMember(
  projectId: string,
  employeeId: string,
): Promise<ActionResult> {
  const error = await mutateDb((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) return "ไม่พบโปรเจคนี้แล้ว";
    if (!db.employees.some((employee) => employee.id === employeeId)) {
      return "ไม่พบพนักงานคนนี้แล้ว";
    }
    if (!project.memberIds.includes(employeeId)) {
      project.memberIds.push(employeeId);
    }
    return null;
  });
  refreshAll();
  return error ? { ok: false, error } : { ok: true };
}

export async function removeMember(
  projectId: string,
  employeeId: string,
): Promise<void> {
  await mutateDb((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    if (project) {
      project.memberIds = project.memberIds.filter(
        (member) => member !== employeeId,
      );
    }
  });
  refreshAll();
}
