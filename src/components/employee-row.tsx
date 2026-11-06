"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteEmployee, updateEmployee } from "@/lib/actions";
import type { Employee, Project } from "@/lib/types";
import { ConfirmButton } from "./confirm-button";
import { EmployeeForm } from "./employee-form";
import { LoadBadge } from "./load-badge";

export function EmployeeRow({
  employee,
  projects,
  departments,
  roles,
}: {
  employee: Employee;
  projects: Project[];
  departments: string[];
  roles: string[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-line">
        <td colSpan={5} className="p-3">
          <EmployeeForm
            action={updateEmployee.bind(null, employee.id)}
            initial={employee}
            departments={departments}
            roles={roles}
            submitLabel="บันทึก"
            onDone={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-line align-top">
      <td className="px-3 py-2 font-medium">{employee.nickname}</td>
      <td className="px-3 py-2">{employee.department}</td>
      <td className="px-3 py-2">{employee.role}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <LoadBadge count={projects.length} />
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded bg-accent-soft px-1.5 py-0.5 text-xs text-accent hover:underline"
            >
              {project.name}
            </Link>
          ))}
        </div>
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded px-2 py-1 text-xs text-accent hover:underline"
        >
          แก้ไข
        </button>
        <ConfirmButton
          action={deleteEmployee.bind(null, employee.id)}
          label="ลบ"
          confirmLabel={
            projects.length > 0
              ? `ยืนยันลบ (ออกจาก ${projects.length} โปรเจค)`
              : "ยืนยันลบ"
          }
        />
      </td>
    </tr>
  );
}
