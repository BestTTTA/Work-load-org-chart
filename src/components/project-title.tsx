"use client";

import { useActionState, useState } from "react";
import { renameProject } from "@/lib/actions";
import type { ActionResult } from "@/lib/types";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

export function ProjectTitle({ id, name }: { id: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: ActionResult, formData: FormData) => {
      const result = await renameProject(id, previous, formData);
      if (result.ok) setEditing(false);
      return result;
    },
    { ok: true },
  );

  if (!editing) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 className="min-w-0 text-2xl font-semibold break-words">{name}</h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded px-2 py-1 text-xs text-accent hover:underline"
        >
          เปลี่ยนชื่อ
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-lg space-y-2">
      <div className="flex gap-2">
        <input
          name="name"
          aria-label="ชื่อโปรเจค"
          required
          maxLength={100}
          autoFocus
          autoComplete="off"
          defaultValue={name}
          className={inputClass}
        />
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={secondaryButtonClass}
        >
          ยกเลิก
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
