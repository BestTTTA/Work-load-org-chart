import type { ReactNode } from "react";
import { CenteredScroll } from "./centered-scroll";

export type OrgBranch = {
  key: string;
  head: ReactNode;
  leaves: { key: string; node: ReactNode }[];
};

export function OrgChart({
  root,
  branches,
}: {
  root: ReactNode;
  branches: OrgBranch[];
}) {
  return (
    <CenteredScroll>
      <div className="org-tree">
        {root}
        {branches.length > 0 && (
          <ul className="org-branches">
            {branches.map((branch) => (
              <li key={branch.key} className="org-branch">
                {branch.head}
                {branch.leaves.length > 0 && (
                  <ul className="org-leaves">
                    {branch.leaves.map((leaf) => (
                      <li key={leaf.key} className="org-leaf">
                        {leaf.node}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CenteredScroll>
  );
}

export function RootNode({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="max-w-md min-w-56 rounded-lg bg-accent px-5 py-3 text-center text-accent-ink">
      <p className="font-semibold break-words">{title}</p>
      <p className="text-sm opacity-85">{subtitle}</p>
    </div>
  );
}

export function BranchNode({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border border-accent bg-accent-soft px-3 py-2 text-center">
      <p className="font-semibold break-words">{title}</p>
      <p className="text-xs text-muted">{subtitle}</p>
    </div>
  );
}
