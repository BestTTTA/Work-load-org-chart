"use client";

import { useActionState } from "react";
import { createProject } from "@/lib/actions";
import { inputClass, primaryButtonClass } from "./ui";

export function ProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, {
    ok: true,
  });

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          <span className="mb-1 block font-medium">ชื่อโปรเจค</span>
          <input
            name="name"
            required
            maxLength={100}
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "กำลังสร้าง…" : "สร้างโปรเจค"}
        </button>
      </div>
      {!state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
