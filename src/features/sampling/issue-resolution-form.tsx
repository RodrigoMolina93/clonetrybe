"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function IssueCancellationForm({ action, dictionary, issueId, programId }: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dictionary: Dictionary;
  issueId: string;
  programId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  return <form action={formAction} className="space-y-3 rounded-lg border p-4">
    <input type="hidden" name="programId" value={programId} />
    <input type="hidden" name="issueId" value={issueId} />
    <input type="hidden" name="resolutionStatus" value="CANCELLED" />
    <input type="hidden" name="carrierName" value="" />
    <input type="hidden" name="trackingNumber" value="" />
    <input type="hidden" name="trackingUrl" value="" />
    <div className="space-y-2"><Label htmlFor={`resolution-note-${issueId}`}>{dictionary.sampling.request.brandNote}</Label><Textarea id={`resolution-note-${issueId}`} name="brandNote" /></div>
    {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    <Button type="submit" variant="outline" disabled={pending}>{pending ? dictionary.common.saving : dictionary.sampling.brand.resolveAndCancel}</Button>
  </form>;
}
