"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { SampleProductWithVariants } from "@/features/sampling/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dictionary: Dictionary;
  programId: string;
  product?: SampleProductWithVariants;
};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-destructive" role="alert">{errors[0]}</p> : null;
}

export function SampleProductForm({ action, dictionary, programId, product }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const copy = dictionary.sampling.product;
  return <form action={formAction} className="space-y-6" noValidate>
    <input type="hidden" name="programId" value={programId} />
    {product ? <input type="hidden" name="productId" value={product.id} /> : null}
    <div className="space-y-2"><Label htmlFor="name">{copy.name}</Label><Input id="name" name="name" defaultValue={product?.name} required aria-invalid={Boolean(state.fieldErrors?.name)} /><FieldError errors={state.fieldErrors?.name} /></div>
    <div className="space-y-2"><Label htmlFor="description">{copy.description}</Label><Textarea id="description" name="description" defaultValue={product?.description ?? ""} aria-invalid={Boolean(state.fieldErrors?.description)} /><FieldError errors={state.fieldErrors?.description} /></div>
    <div className="space-y-2"><Label htmlFor="imageUrl">{copy.imageUrl}</Label><Input id="imageUrl" name="imageUrl" type="url" inputMode="url" defaultValue={product?.image_url ?? ""} aria-invalid={Boolean(state.fieldErrors?.imageUrl)} /><p className="text-sm text-muted-foreground">{copy.imageHelp}</p><FieldError errors={state.fieldErrors?.imageUrl} /></div>
    <div className="space-y-2"><Label htmlFor="variants">{copy.variants}</Label><Textarea id="variants" name="variants" defaultValue={product?.variants.filter((variant) => variant.active).map((variant) => variant.label).join("\n") ?? ""} aria-invalid={Boolean(state.fieldErrors?.variants)} /><p className="text-sm text-muted-foreground">{copy.variantHelp}</p><FieldError errors={state.fieldErrors?.variants} /></div>
    <label className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} />{copy.active}</label>
    {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    <div className="flex flex-wrap gap-3"><Button type="submit" disabled={pending}>{pending ? (product ? dictionary.common.saving : copy.creating) : (product ? copy.save : copy.create)}</Button><Button asChild variant="outline"><Link href={`/marca/programas/${programId}/sampling`}>{dictionary.common.cancel}</Link></Button></div>
  </form>;
}
