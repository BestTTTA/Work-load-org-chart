"use client";

import { useActionState, useRef } from "react";
import type { Employee, EmployeeFormState } from "@/lib/types";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

export function EmployeeForm({
  action,
  initial,
  departments,
  roles,
  submitLabel,
  onDone,
  onCancel,
}: {
  action: (
    previous: EmployeeFormState,
    formData: FormData,
  ) => Promise<EmployeeFormState>;
  initial?: Employee;
  departments: string[];
  roles: string[];
  submitLabel: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const nicknameRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    async (previous: EmployeeFormState, formData: FormData) => {
      const result = await action(previous, formData);
      if (result.ok) {
        onDone?.();
        nicknameRef.current?.focus();
      }
      return result;
    },
    { ok: true },
  );
  // React resets the form after every action, so failed input is restored from state.
  const values = state.values ?? initial;
  const idPrefix = initial?.id ?? "new";

  return (
    <form action={formAction} className="space-y-2">
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">ชื่อเล่น</span>
          <input
            ref={nicknameRef}
            name="nickname"
            required
            maxLength={100}
            autoComplete="off"
            defaultValue={values?.nickname}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">สังกัด</span>
          <input
            name="department"
            required
            maxLength={100}
            autoComplete="off"
            list={`${idPrefix}-departments`}
            defaultValue={values?.department}
            className={inputClass}
          />
          <datalist id={`${idPrefix}-departments`}>
            {departments.map((department) => (
              <option key={department} value={department} />
            ))}
          </datalist>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">บทบาท</span>
          <input
            name="role"
            required
            maxLength={100}
            autoComplete="off"
            list={`${idPrefix}-roles`}
            defaultValue={values?.role}
            className={inputClass}
          />
          <datalist id={`${idPrefix}-roles`}>
            {roles.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "กำลังบันทึก…" : submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={secondaryButtonClass}
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>
      {!state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
