"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { SampleProduct, SampleVariant } from "@/features/sampling/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SampleRequestForm({ action, dictionary, product }: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dictionary: Dictionary;
  product: Pick<SampleProduct, "id" | "program_id"> & {
    variants: Array<Pick<SampleVariant, "id" | "label" | "active">>;
  };
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const variants = product.variants.filter((variant) => variant.active);
  return <form action={formAction} className="space-y-4" noValidate>
    <input type="hidden" name="programId" value={product.program_id} />
    <input type="hidden" name="productId" value={product.id} />
    {variants.length > 0 ? <div className="space-y-2"><Label htmlFor={`variant-${product.id}`}>{dictionary.sampling.request.variant}</Label><select id={`variant-${product.id}`} name="variantId" required defaultValue="" className="border-input h-9 w-full rounded-lg border bg-background px-3 text-sm"><option value="" disabled>{dictionary.sampling.request.chooseVariant}</option>{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></div> : <input type="hidden" name="variantId" value="" />}
    <div className="space-y-2"><Label htmlFor={`note-${product.id}`}>{dictionary.sampling.request.creatorNote}</Label><Textarea id={`note-${product.id}`} name="creatorNote" /></div>
    {state.message ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    <Button type="submit" disabled={pending}>{pending ? dictionary.sampling.creator.requesting : dictionary.sampling.creator.request}</Button>
  </form>;
}
