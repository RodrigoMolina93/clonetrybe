"use client";

import { useActionState } from "react";
import { completeBrandOnboarding, completeCreatorOnboarding } from "@/features/onboarding/actions";
import { initialActionState } from "@/features/auth/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { mode: "brand" | "creator"; dictionary: Dictionary };

function Field({ name, label, error, autoComplete }: { name: string; label: string; error?: string[]; autoComplete?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required autoComplete={autoComplete} aria-invalid={Boolean(error)} />
      {error?.[0] && <p className="text-sm text-destructive" role="alert">{error[0]}</p>}
    </div>
  );
}

export function OnboardingForm({ mode, dictionary }: Props) {
  const isBrand = mode === "brand";
  const [state, action, pending] = useActionState(isBrand ? completeBrandOnboarding : completeCreatorOnboarding, initialActionState);
  const { common, onboarding } = dictionary;
  return (
    <form action={action} className="space-y-5" noValidate>
      {isBrand && <Field name="brandName" label={onboarding.brandName} error={state.fieldErrors?.brandName} autoComplete="organization" />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label={common.firstName} error={state.fieldErrors?.firstName} autoComplete="given-name" />
        <Field name="lastName" label={common.lastName} error={state.fieldErrors?.lastName} autoComplete="family-name" />
      </div>
      {!isBrand && <Field name="publicName" label={onboarding.publicName} error={state.fieldErrors?.publicName} />}
      {state.message && <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? (isBrand ? onboarding.brandPending : onboarding.creatorPending) : (isBrand ? onboarding.brandAction : onboarding.creatorAction)}
      </Button>
    </form>
  );
}
