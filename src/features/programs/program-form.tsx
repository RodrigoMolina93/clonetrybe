"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { Program } from "@/features/programs/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dictionary: Dictionary;
  program?: Program;
};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-destructive" role="alert">{errors[0]}</p> : null;
}

export function ProgramForm({ action, dictionary, program }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [compensationType, setCompensationType] = useState(program?.compensation_type ?? "FIXED");
  const { fields, form, compensation, visibility } = dictionary.programs;
  const fixedAmount = program?.fixed_amount ? (program.fixed_amount / 100).toFixed(2) : "";
  return (
    <form action={formAction} className="space-y-6" noValidate>
      {program ? <input type="hidden" name="programId" value={program.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="name">{fields.name}</Label>
        <Input id="name" name="name" defaultValue={program?.name} required aria-invalid={Boolean(state.fieldErrors?.name)} />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{fields.description}</Label>
        <Textarea id="description" name="description" defaultValue={program?.description} required aria-invalid={Boolean(state.fieldErrors?.description)} />
        <FieldError errors={state.fieldErrors?.description} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="visibility">{fields.visibility}</Label>
          <select id="visibility" name="visibility" defaultValue={program?.visibility ?? "PRIVATE"} className="border-input h-9 w-full rounded-lg border bg-background px-3 text-sm">
            <option value="PRIVATE">{visibility.PRIVATE}</option>
            <option value="PUBLIC">{visibility.PUBLIC}</option>
          </select>
        </div>
        <label className="flex items-center gap-3 self-end rounded-lg border p-3 text-sm font-medium">
          <input type="checkbox" name="applicationsEnabled" defaultChecked={program?.applications_enabled} />
          {fields.applicationsEnabled}
        </label>
        <div className="space-y-2">
          <Label htmlFor="startDate">{fields.startDate}</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={program?.start_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">{fields.endDate}</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={program?.end_date ?? ""} aria-invalid={Boolean(state.fieldErrors?.endDate)} />
          <FieldError errors={state.fieldErrors?.endDate} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{form.dateHelp}</p>
      <div className="space-y-2">
        <Label htmlFor="compensationType">{fields.compensationType}</Label>
        <select id="compensationType" name="compensationType" value={compensationType} onChange={(event) => setCompensationType(event.target.value as "FIXED" | "REVENUE_SHARE")} className="border-input h-9 w-full rounded-lg border bg-background px-3 text-sm">
          <option value="FIXED">{compensation.FIXED}</option>
          <option value="REVENUE_SHARE">{compensation.REVENUE_SHARE}</option>
        </select>
      </div>
      {compensationType === "FIXED" ? (
        <div className="space-y-2">
          <Label htmlFor="fixedAmount">{fields.fixedAmount}</Label>
          <Input id="fixedAmount" name="fixedAmount" inputMode="decimal" defaultValue={fixedAmount} aria-invalid={Boolean(state.fieldErrors?.fixedAmount)} />
          <p className="text-sm text-muted-foreground">{form.fixedHelp}</p>
          <FieldError errors={state.fieldErrors?.fixedAmount} />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="revenueSharePercentage">{fields.revenueShare}</Label>
          <Input id="revenueSharePercentage" name="revenueSharePercentage" type="number" min="0.01" max="100" step="0.01" defaultValue={program?.revenue_share_percentage ?? ""} aria-invalid={Boolean(state.fieldErrors?.revenueSharePercentage)} />
          <p className="text-sm text-muted-foreground">{form.revenueHelp}</p>
          <FieldError errors={state.fieldErrors?.revenueSharePercentage} />
        </div>
      )}
      <div className="grid gap-3 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
        <p><span className="text-muted-foreground">{fields.currency}:</span> {dictionary.programs.values.currencyArs}</p>
        <p><span className="text-muted-foreground">{fields.platformFee}:</span> {dictionary.programs.values.platformFee}</p>
      </div>
      {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
      <Button type="submit" size="lg" disabled={pending}>{pending ? (program ? dictionary.common.saving : form.createPending) : (program ? form.saveAction : form.createAction)}</Button>
    </form>
  );
}
