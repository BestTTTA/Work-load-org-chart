"use client";

import Link from "next/link";
import { useId, useMemo, useState, useTransition } from "react";
import { addMember } from "@/lib/actions";
import type { Employee } from "@/lib/types";
import { LoadBadge } from "./load-badge";
import { inputClass } from "./ui";

export type MemberCandidate = Employee & { projectCount: number };

function matchCandidates(candidates: MemberCandidate[], query: string) {
  const terms = query.toLocaleLowerCase("th").split(/\s+/).filter(Boolean);
  const nicknameStartsWith = (candidate: MemberCandidate) =>
    terms.length > 0 &&
    candidate.nickname.toLocaleLowerCase("th").startsWith(terms[0]);

  return candidates
    .filter((candidate) => {
      const haystack =
        `${candidate.nickname} ${candidate.department} ${candidate.role}`.toLocaleLowerCase(
          "th",
        );
      return terms.every((term) => haystack.includes(term));
    })
    .sort(
      (a, b) => Number(nicknameStartsWith(b)) - Number(nicknameStartsWith(a)),
    );
}

export function MemberSearch({
  projectId,
  candidates,
}: {
  projectId: string;
  candidates: MemberCandidate[];
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const results = useMemo(
    () => matchCandidates(candidates, query),
    [candidates, query],
  );
  const active = Math.min(activeIndex, Math.max(results.length - 1, 0));

  function add(candidate: MemberCandidate) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await addMember(projectId, candidate.id);
      if (result.ok) {
        setQuery("");
        setActiveIndex(0);
      } else {
        setError(result.error);
      }
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // IMEs use Enter and the arrow keys while composing.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        results.length ? (active + step + results.length) % results.length : 0,
      );
    } else if (event.key === "Enter" && open && results[active]) {
      event.preventDefault();
      add(results[active]);
    }
  }

  return (
    <div className="relative max-w-xl">
      <label
        htmlFor={`${listId}-input`}
        className="mb-1 block text-sm font-medium"
      >
        เพิ่มคนเข้าโปรเจค
      </label>
      <input
        id={`${listId}-input`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && results[active] ? `${listId}-${active}` : undefined
        }
        autoComplete="off"
        placeholder="ค้นหาชื่อเล่น สังกัด หรือบทบาท"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={inputClass}
      />
      {error && (
        <p role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="ผลการค้นหาพนักงาน"
          // Keeps focus in the input so several people can be added in a row.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-lg"
        >
          {results.map((candidate, index) => (
            <li
              key={candidate.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => add(candidate)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                index === active ? "bg-accent-soft" : ""
              } ${pending ? "opacity-60" : ""}`}
            >
              <span className="min-w-0">
                <span className="block font-medium break-words">
                  {candidate.nickname}
                </span>
                <span className="block text-xs break-words text-muted">
                  {candidate.role} · {candidate.department}
                </span>
              </span>
              <LoadBadge count={candidate.projectCount} />
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted">
              {candidates.length === 0
                ? "ไม่มีพนักงานให้เพิ่มแล้ว — "
                : `ไม่พบ “${query.trim()}” — `}
              <Link href="/employees" className="text-accent hover:underline">
                เพิ่มพนักงานใหม่
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
