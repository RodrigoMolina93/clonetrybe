"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/features/auth/types";
import { completeOnboarding } from "@/features/onboarding/actions";
import type { Dictionary } from "@/lib/i18n";

function Field({ name, label, error, autoComplete }: { name: string; label: string; error?: string[]; autoComplete?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required autoComplete={autoComplete} aria-invalid={Boolean(error)} />
      {error?.[0] && <p className="text-sm text-destructive" role="alert">{error[0]}</p>}
    </div>
  );
}

export function OnboardingForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(completeOnboarding, initialActionState);
  const { common, onboarding } = dictionary;
  return (
    <form action={action} className="space-y-5" noValidate>
      <Field name="organizationName" label={onboarding.organizationName} error={state.fieldErrors?.organizationName} autoComplete="organization" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label={common.firstName} error={state.fieldErrors?.firstName} autoComplete="given-name" />
        <Field name="lastName" label={common.lastName} error={state.fieldErrors?.lastName} autoComplete="family-name" />
      </div>
      {state.message && <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>}
      <Button className="w-full" disabled={pending} type="submit">{pending ? onboarding.pending : onboarding.action}</Button>
    </form>
  );
}
