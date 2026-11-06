"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/", segment: null, label: "ผังงาน" },
  { href: "/projects", segment: "projects", label: "โปรเจค" },
  { href: "/employees", segment: "employees", label: "พนักงาน" },
];

function NavLinks({ activeSegment }: { activeSegment?: string | null }) {
  return LINKS.map((link) => {
    const active = link.segment === activeSegment;
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={`border-b-2 px-3 py-3 text-sm font-medium ${
          active
            ? "border-accent text-accent"
            : "border-transparent text-muted hover:text-ink"
        }`}
      >
        {link.label}
      </Link>
    );
  });
}

function CurrentNavLinks() {
  return <NavLinks activeSegment={useSelectedLayoutSegment()} />;
}

export function Nav() {
  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-1 px-4 sm:px-6">
        <span className="mr-4 py-3 font-semibold">Workload</span>
        <Suspense fallback={<NavLinks />}>
          <CurrentNavLinks />
        </Suspense>
      </nav>
    </header>
  );
}
