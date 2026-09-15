"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/auth/types";
import { initialActionState } from "@/features/auth/types";
import type { ShippingAddress } from "@/features/sampling/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ShippingAddressForm({ action, address, dictionary, programId }: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  address: ShippingAddress | null;
  dictionary: Dictionary;
  programId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const labels = dictionary.sampling.address;
  const field = (name: string) => state.fieldErrors?.[name]?.[0] ? <p className="text-sm text-destructive" role="alert">{state.fieldErrors[name][0]}</p> : null;
  return <form action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
    <input type="hidden" name="programId" value={programId} />
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="recipientName">{labels.recipientName}</Label><Input id="recipientName" name="recipientName" defaultValue={address?.recipient_name} required />{field("recipientName")}</div>
    <div className="space-y-2"><Label htmlFor="street">{labels.street}</Label><Input id="street" name="street" defaultValue={address?.street} required />{field("street")}</div>
    <div className="space-y-2"><Label htmlFor="streetNumber">{labels.streetNumber}</Label><Input id="streetNumber" name="streetNumber" defaultValue={address?.street_number} required />{field("streetNumber")}</div>
    <div className="space-y-2"><Label htmlFor="apartment">{labels.apartment}</Label><Input id="apartment" name="apartment" defaultValue={address?.apartment ?? ""} /></div>
    <div className="space-y-2"><Label htmlFor="postalCode">{labels.postalCode}</Label><Input id="postalCode" name="postalCode" defaultValue={address?.postal_code} required />{field("postalCode")}</div>
    <div className="space-y-2"><Label htmlFor="city">{labels.city}</Label><Input id="city" name="city" defaultValue={address?.city} required />{field("city")}</div>
    <div className="space-y-2"><Label htmlFor="province">{labels.province}</Label><Input id="province" name="province" defaultValue={address?.province} required />{field("province")}</div>
    <div className="space-y-2"><Label htmlFor="country">{labels.country}</Label><Input id="country" name="country" value={labels.countryArgentina} readOnly /></div>
    <div className="space-y-2"><Label htmlFor="phone">{labels.phone}</Label><Input id="phone" name="phone" type="tel" defaultValue={address?.phone ?? ""} /></div>
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="additionalInfo">{labels.additionalInfo}</Label><Textarea id="additionalInfo" name="additionalInfo" defaultValue={address?.additional_info ?? ""} /></div>
    {state.message ? <Alert variant="destructive" className="sm:col-span-2"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    <div className="sm:col-span-2"><Button type="submit" disabled={pending}>{pending ? dictionary.sampling.creator.savingAddress : dictionary.sampling.creator.saveAddress}</Button></div>
  </form>;
}
