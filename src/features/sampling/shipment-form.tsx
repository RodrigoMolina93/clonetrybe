"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ShipmentForm({ action, dictionary, programId, requestId, issueId }: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dictionary: Dictionary;
  programId: string;
  requestId?: string;
  issueId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const copy = dictionary.sampling.request;
  return <form action={formAction} className="space-y-3 rounded-lg border p-4" noValidate>
    <input type="hidden" name="programId" value={programId} />
    {requestId ? <><input type="hidden" name="requestId" value={requestId} /><input type="hidden" name="targetStatus" value="SHIPPED" /></> : null}
    {issueId ? <><input type="hidden" name="issueId" value={issueId} /><input type="hidden" name="resolutionStatus" value="SHIPPED" /></> : null}
    <div className="space-y-2"><Label htmlFor={`carrier-${requestId ?? issueId}`}>{copy.carrier}</Label><Input id={`carrier-${requestId ?? issueId}`} name="carrierName" /></div>
    <div className="space-y-2"><Label htmlFor={`tracking-${requestId ?? issueId}`}>{copy.trackingNumber}</Label><Input id={`tracking-${requestId ?? issueId}`} name="trackingNumber" /></div>
    <div className="space-y-2"><Label htmlFor={`url-${requestId ?? issueId}`}>{copy.trackingUrl}</Label><Input id={`url-${requestId ?? issueId}`} name="trackingUrl" type="url" /></div>
    <div className="space-y-2"><Label htmlFor={`brand-note-${requestId ?? issueId}`}>{copy.brandNote}</Label><Textarea id={`brand-note-${requestId ?? issueId}`} name="brandNote" /></div>
    {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    <Button type="submit" disabled={pending}>{pending ? dictionary.common.saving : (issueId ? dictionary.sampling.brand.reship : copy.ship)}</Button>
  </form>;
}
