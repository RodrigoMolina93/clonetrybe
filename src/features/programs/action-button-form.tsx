"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

export function ActionButtonForm({ action, fields, label, pendingLabel, variant = "default" }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  return (
    <form action={formAction} className="space-y-2">
      {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      <Button type="submit" variant={variant} disabled={pending}>{pending ? (pendingLabel ?? label) : label}</Button>
      {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    </form>
  );
}

