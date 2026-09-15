"use client";

import { useActionState } from "react";
import { applyToProgram } from "@/features/programs/actions";
import { initialActionState } from "@/features/auth/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplyForm({ programId, dictionary }: { programId: string; dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(applyToProgram, initialActionState);
  const copy = dictionary.programs.creator;
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="programId" value={programId} />
      <div className="space-y-2"><Label htmlFor="message">{copy.applicationMessage}</Label><Textarea id="message" name="message" placeholder={copy.applicationMessagePlaceholder} maxLength={1000} />{state.fieldErrors?.message?.[0] ? <p role="alert" className="text-sm text-destructive">{state.fieldErrors.message[0]}</p> : null}</div>
      {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
      <Button type="submit" size="lg" disabled={pending}>{pending ? copy.applyPending : copy.apply}</Button>
    </form>
  );
}

