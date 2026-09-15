"use client";

import { useActionState } from "react";
import { saveBrief } from "@/features/programs/actions";
import { initialActionState } from "@/features/auth/types";
import type { ProgramBrief } from "@/features/programs/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BriefForm({ programId, brief, dictionary }: { programId: string; brief: ProgramBrief | null; dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(saveBrief, initialActionState);
  const copy = dictionary.programs.brief;
  const field = (name: string) => state.fieldErrors?.[name]?.[0];
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="programId" value={programId} />
      <div className="space-y-2"><Label htmlFor="title">{copy.title}</Label><Input id="title" name="title" defaultValue={brief?.title} required aria-invalid={Boolean(field("title"))} />{field("title") ? <p role="alert" className="text-sm text-destructive">{field("title")}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="description">{copy.objective}</Label><Textarea id="description" name="description" defaultValue={brief?.description} required aria-invalid={Boolean(field("description"))} />{field("description") ? <p role="alert" className="text-sm text-destructive">{field("description")}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="requirements">{copy.requirements}</Label><Textarea id="requirements" name="requirements" defaultValue={brief?.requirements} className="min-h-36" required aria-invalid={Boolean(field("requirements"))} />{field("requirements") ? <p role="alert" className="text-sm text-destructive">{field("requirements")}</p> : null}</div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="dos">{copy.dos}</Label><Textarea id="dos" name="dos" defaultValue={brief?.dos ?? ""} /></div>
        <div className="space-y-2"><Label htmlFor="donts">{copy.donts}</Label><Textarea id="donts" name="donts" defaultValue={brief?.donts ?? ""} /></div>
      </div>
      <p className="text-sm text-muted-foreground">{copy.privateNotice}</p>
      {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
      <Button type="submit" size="lg" disabled={pending}>{pending ? copy.saving : copy.save}</Button>
    </form>
  );
}

