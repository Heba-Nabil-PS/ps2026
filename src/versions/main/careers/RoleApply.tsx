"use client";

import { fill } from "@/versions/main/copy";
import { useCopy } from "@/versions/main/use-copy";
import { useState } from "react";
import { ApplicationForm } from "./ApplicationForm";

/** The three-step application on a role's own page, with that role preselected. */
export function RoleApply({ role: initial }: { role: string }) {
  const { copy } = useCopy();
  const [role, setRole] = useState(initial);

  return (
    <div id="apply" className="scroll-mt-28">
      <ApplicationForm role={role} onRoleChange={setRole} subjectFor={(title) => fill(copy.careers.apply.email.subject, { role: title })} />
    </div>
  );
}
