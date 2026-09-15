"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SampleIssueForm({ action, dictionary, programId, requestId }: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dictionary: Dictionary;
  programId: string;
  requestId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const copy = dictionary.sampling.issue;
  const types = ["NOT_RECEIVED", "WRONG_PRODUCT", "WRONG_VARIANT", "DAMAGED", "OTHER"] as const;
  return <details className="rounded-lg border p-4"><summary className="cursor-pointer font-medium">{copy.title}</summary><form action={formAction} className="mt-4 space-y-3" noValidate>
    <input type="hidden" name="programId" value={programId} /><input type="hidden" name="requestId" value={requestId} />
    <div className="space-y-2"><Label htmlFor={`issue-type-${requestId}`}>{copy.type}</Label><select id={`issue-type-${requestId}`} name="issueType" className="border-input h-9 w-full rounded-lg border bg-background px-3 text-sm">{types.map((type) => <option key={type} value={type}>{copy[type]}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor={`issue-description-${requestId}`}>{copy.description}</Label><Textarea id={`issue-description-${requestId}`} name="description" required /></div>
    {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    <Button type="submit" variant="outline" disabled={pending}>{pending ? copy.submitting : copy.submit}</Button>
  </form></details>;
}
