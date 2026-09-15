import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { CreatorProgramTabs } from "@/features/programs/creator-program-tabs";
import { StatusBadge } from "@/features/programs/status-badge";
import {
  confirmSampleReceived,
  reportSampleIssue,
  requestSample,
  saveShippingAddress,
} from "@/features/sampling/actions";
import { ShippingAddressForm } from "@/features/sampling/address-form";
import { SampleIssueForm } from "@/features/sampling/issue-form";
import { SampleProductImage } from "@/features/sampling/product-image";
import { SampleRequestForm } from "@/features/sampling/request-form";
import { SampleStatusBadge } from "@/features/sampling/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { getCreatorProgram } from "@/repositories/program-repository";
import { getCreatorShippingAddress, getSampleProducts, getSampleRequests } from "@/repositories/sampling-repository";
import { requireRole } from "@/services/auth-service";

export default async function CreatorSamplingPage({ params }: { params: Promise<{ programId: string }> }) {
  const [{ programId }, viewer] = await Promise.all([params, requireRole("CREATOR")]);
  const detail = await getCreatorProgram(programId, viewer.user.id);
  if (!detail || detail.membership?.status !== "ACTIVE") notFound();
  const [products, requests, address] = await Promise.all([
    getSampleProducts(programId),
    getSampleRequests(programId, viewer.user.id),
    getCreatorShippingAddress(viewer.user.id),
  ]);
  const dictionary = getDictionary();
  const available = products.filter((product) => product.active && (product.variants.length === 0 || product.variants.some((variant) => variant.active)));
  const copy = dictionary.sampling.creator;
  const requestCopy = dictionary.sampling.request;

  return <div className="space-y-7"><Link href="/creator/programas/mis-programas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" />{dictionary.navigation.myPrograms}</Link><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="mb-2 font-medium text-primary">{detail.program.organization?.name}</p><h1 className="text-3xl font-semibold tracking-tight">{detail.program.name}</h1></div><StatusBadge status={detail.program.status} dictionary={dictionary} /></div><CreatorProgramTabs programId={programId} active="sampling" dictionary={dictionary} />
    <Card><CardHeader><CardTitle>{copy.addressTitle}</CardTitle><p className="text-sm text-muted-foreground">{copy.addressDescription}</p></CardHeader><CardContent><ShippingAddressForm action={saveShippingAddress} address={address} dictionary={dictionary} programId={programId} /></CardContent></Card>
    <section className="space-y-4"><div><h2 className="text-2xl font-semibold">{copy.availableProducts}</h2><p className="text-muted-foreground">{copy.availableDescription}</p></div>{available.length === 0 ? <EmptyState title={copy.emptyProductsTitle} description={copy.emptyProductsDescription} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{available.map((product) => <Card key={product.id}><SampleProductImage url={product.image_url} name={product.name} /><CardHeader><CardTitle>{product.name}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">{product.description}</p>{address ? <SampleRequestForm action={requestSample} dictionary={dictionary} product={{ id: product.id, program_id: product.program_id, variants: product.variants.map(({ id, label, active }) => ({ id, label, active })) }} /> : <p className="rounded-lg bg-muted p-3 text-sm">{dictionary.sampling.errors.addressRequired}</p>}</CardContent></Card>)}</div>}</section>
    <section className="space-y-4"><h2 className="text-2xl font-semibold">{copy.myRequests}</h2>{requests.length === 0 ? <EmptyState title={copy.emptyRequestsTitle} description={copy.emptyRequestsDescription} /> : <div className="space-y-5">{requests.map((request) => <Card key={request.id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><CardTitle>{request.product?.name ?? dictionary.common.notAvailable}</CardTitle><SampleStatusBadge status={request.status} dictionary={dictionary} /></div></CardHeader><CardContent className="grid gap-5 md:grid-cols-[1fr_20rem]"><div className="space-y-4"><dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">{requestCopy.variant}</dt><dd>{request.variant?.label ?? dictionary.sampling.product.noVariants}</dd></div><div><dt className="text-muted-foreground">{requestCopy.requestedAt}</dt><dd>{new Intl.DateTimeFormat(defaultLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.requested_at))}</dd></div></dl>{request.status === "SHIPPED" && (request.carrier_name || request.tracking_number || request.tracking_url) ? <div className="rounded-lg border p-4"><h3 className="font-medium">{requestCopy.tracking}</h3>{request.carrier_name ? <p className="mt-2 text-sm">{requestCopy.carrier}: {request.carrier_name}</p> : null}{request.tracking_number ? <p className="text-sm">{requestCopy.trackingNumber}: {request.tracking_number}</p> : null}{request.tracking_url ? <Button asChild size="sm" variant="outline" className="mt-3"><a href={request.tracking_url} target="_blank" rel="noreferrer">{requestCopy.viewTracking}<ExternalLink aria-hidden="true" /></a></Button> : null}</div> : null}<div><h3 className="font-medium">{requestCopy.timeline}</h3><ol className="mt-2 space-y-2 text-sm">{request.tracking_events.map((event) => <li key={event.id} className="flex justify-between gap-4 border-l-2 pl-3"><span>{dictionary.sampling.events[event.event_type]}</span><time className="text-muted-foreground">{new Intl.DateTimeFormat(defaultLocale, { dateStyle: "short", timeStyle: "short" }).format(new Date(event.created_at))}</time></li>)}</ol></div>{request.issues.map((issue) => <div key={issue.id} className="rounded-lg border p-4"><p className="font-medium">{dictionary.sampling.issue[issue.issue_type]}</p><p className="mt-1 text-sm">{issue.description}</p><p className="mt-2 text-xs text-muted-foreground">{issue.status === "OPEN" ? dictionary.sampling.issue.open : dictionary.sampling.issue.resolved}</p>{issue.brand_note ? <p className="mt-2 text-sm">{issue.brand_note}</p> : null}</div>)}</div><aside className="space-y-3">{request.status === "SHIPPED" ? <ActionButtonForm action={confirmSampleReceived} fields={{ programId, requestId: request.id }} label={copy.received} /> : null}{request.status === "SHIPPED" || request.status === "RECEIVED" ? <SampleIssueForm action={reportSampleIssue} dictionary={dictionary} programId={programId} requestId={request.id} /> : null}</aside></CardContent></Card>)}</div>}</section>
  </div>;
}
