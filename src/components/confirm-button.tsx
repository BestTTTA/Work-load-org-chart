"use client";

import { useState, useTransition } from "react";

export function ConfirmButton({
  action,
  label,
  confirmLabel,
}: {
  action: () => Promise<unknown>;
  label: string;
  confirmLabel: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        startTransition(async () => {
          await action();
        });
      }}
      className={`rounded px-2 py-1 text-xs text-danger hover:underline disabled:opacity-50 ${
        armed ? "bg-over-soft font-medium" : ""
      }`}
    >
      {pending ? "กำลังดำเนินการ…" : armed ? confirmLabel : label}
    </button>
  );
}
