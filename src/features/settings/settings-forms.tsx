"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState, type ActionState } from "@/features/auth/types";
import { updateOrganization, updateProfile } from "@/features/settings/actions";
import type { Dictionary } from "@/lib/i18n";
import type { OrganizationRole } from "@/types/auth";

function Feedback({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return <Alert variant={state.status === "error" ? "destructive" : "default"}><AlertDescription>{state.message}</AlertDescription></Alert>;
}

export function ProfileSettingsForm({ firstName, lastName, dictionary }: { firstName: string | null; lastName: string | null; dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(updateProfile, initialActionState);
  return (
    <Card>
      <CardHeader><CardTitle>{dictionary.settings.profileTitle}</CardTitle><CardDescription>{dictionary.settings.profileDescription}</CardDescription></CardHeader>
      <CardContent>
        <form action={action} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="firstName">{dictionary.common.firstName}</Label><Input id="firstName" name="firstName" defaultValue={firstName ?? ""} required />{state.fieldErrors?.firstName?.[0] ? <p className="text-sm text-destructive" role="alert">{state.fieldErrors.firstName[0]}</p> : null}</div>
            <div className="space-y-2"><Label htmlFor="lastName">{dictionary.common.lastName}</Label><Input id="lastName" name="lastName" defaultValue={lastName ?? ""} required />{state.fieldErrors?.lastName?.[0] ? <p className="text-sm text-destructive" role="alert">{state.fieldErrors.lastName[0]}</p> : null}</div>
          </div>
          <Feedback state={state} />
          <Button disabled={pending} type="submit">{pending ? dictionary.common.saving : dictionary.common.save}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function OrganizationSettingsForm({ organization, dictionary }: { organization: { id: string; name: string; role: OrganizationRole }; dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(updateOrganization, initialActionState);
  const editable = organization.role === "OWNER";
  return (
    <Card>
      <CardHeader><CardTitle>{dictionary.settings.organizationTitle}</CardTitle><CardDescription>{dictionary.settings.organizationDescription}</CardDescription></CardHeader>
      <CardContent>
        <form action={action} className="space-y-5" noValidate>
          <input type="hidden" name="organizationId" value={organization.id} />
          <div className="space-y-2"><Label htmlFor="organizationName">{dictionary.settings.organizationName}</Label><Input id="organizationName" name="organizationName" defaultValue={organization.name} disabled={!editable} required />{state.fieldErrors?.organizationName?.[0] ? <p className="text-sm text-destructive" role="alert">{state.fieldErrors.organizationName[0]}</p> : null}</div>
          {!editable && <p className="text-sm text-muted-foreground">{dictionary.settings.readOnly}</p>}
          <Feedback state={state} />
          {editable && <Button disabled={pending} type="submit">{pending ? dictionary.common.saving : dictionary.common.save}</Button>}
        </form>
      </CardContent>
    </Card>
  );
}
