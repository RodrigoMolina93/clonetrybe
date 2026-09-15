import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { BrandProgramHeader } from "@/features/programs/brand-program-header";
import {
  resolveSampleIssue,
  toggleSampleProduct,
  transitionSampleRequest,
} from "@/features/sampling/actions";
import { SampleProductImage } from "@/features/sampling/product-image";
import { IssueCancellationForm } from "@/features/sampling/issue-resolution-form";
import { ShipmentForm } from "@/features/sampling/shipment-form";
import { SampleStatusBadge } from "@/features/sampling/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { getBrandProgram, getProgramCreatorManagement } from "@/repositories/program-repository";
import { getFulfillmentAddress, getSampleProducts, getSampleRequests } from "@/repositories/sampling-repository";

const addressStatuses = new Set(["REQUESTED", "APPROVED", "PREPARING", "SHIPPED", "ISSUE"]);

export default async function BrandSamplingPage({ params, searchParams }: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ view?: string; status?: string }>;
}) {
  const [{ programId }, query] = await Promise.all([params, searchParams]);
  const program = await getBrandProgram(programId);
  if (!program) notFound();
  const dictionary = getDictionary();
  const view = query.view === "requests" ? "requests" : "products";
  const [products, requests, management] = await Promise.all([
    getSampleProducts(programId),
    getSampleRequests(programId),
    getProgramCreatorManagement(programId),
  ]);
  const filtered = query.status && query.status !== "all" ? requests.filter((request) => request.status === query.status) : requests;
  const addresses = new Map((await Promise.all(filtered.filter((request) => addressStatuses.has(request.status)).map(async (request) => [request.id, await getFulfillmentAddress(request.id)] as const))).filter((entry) => entry[1]));
  const brand = dictionary.sampling.brand;
  const requestCopy = dictionary.sampling.request;
  const filterStatuses = ["all", "REQUESTED", "APPROVED", "PREPARING", "SHIPPED", "RECEIVED", "ISSUE", "REJECTED", "CANCELLED"] as const;

  return <><BrandProgramHeader program={program} active="sampling" dictionary={dictionary} /><div className="space-y-6">
    <div><h2 className="text-2xl font-semibold">{brand.title}</h2><p className="mt-1 text-muted-foreground">{brand.description}</p></div>
    <nav className="flex gap-2" aria-label={brand.title}><Button asChild variant={view === "products" ? "default" : "outline"}><Link href={`/marca/programas/${programId}/sampling`}>{brand.products}</Link></Button><Button asChild variant={view === "requests" ? "default" : "outline"}><Link href={`/marca/programas/${programId}/sampling?view=requests`}>{brand.requests}</Link></Button></nav>
    {view === "products" ? <section className="space-y-5"><div className="flex justify-end"><Button asChild><Link href={`/marca/programas/${programId}/sampling/nuevo`}><Plus aria-hidden="true" />{brand.newProduct}</Link></Button></div>{products.length === 0 ? <EmptyState title={brand.emptyProductsTitle} description={brand.emptyProductsDescription} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <Card key={product.id}><SampleProductImage url={product.image_url} name={product.name} /><CardHeader><CardTitle>{product.name}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">{product.description}</p><div className="flex flex-wrap gap-2">{product.variants.length ? product.variants.map((variant) => <span key={variant.id} className={`rounded-full bg-muted px-2 py-1 text-xs ${variant.active ? "" : "line-through opacity-60"}`}>{variant.label}</span>) : <span className="text-xs text-muted-foreground">{dictionary.sampling.product.noVariants}</span>}</div><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link href={`/marca/programas/${programId}/sampling/${product.id}/editar`}><Pencil aria-hidden="true" />{dictionary.common.view}</Link></Button><ActionButtonForm action={toggleSampleProduct} fields={{ programId, productId: product.id, active: String(!product.active) }} label={product.active ? dictionary.sampling.product.deactivate : dictionary.sampling.product.activate} variant="secondary" /></div></CardContent></Card>)}</div>}</section> : <section className="space-y-5"><div className="flex gap-2 overflow-x-auto pb-1">{filterStatuses.map((status) => <Button key={status} asChild size="sm" variant={(query.status ?? "all") === status ? "default" : "outline"}><Link href={`/marca/programas/${programId}/sampling?view=requests&status=${status}`}>{dictionary.sampling.filters[status]}</Link></Button>)}</div>{filtered.length === 0 ? <EmptyState title={brand.emptyRequestsTitle} description={brand.emptyRequestsDescription} /> : <div className="space-y-5">{filtered.map((request) => {
      const creator = management.creators.get(request.creator_id);
      const address = addresses.get(request.id);
      const openIssue = request.issues.find((issue) => issue.status === "OPEN");
      return <Card key={request.id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{request.product?.name ?? dictionary.common.notAvailable}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{creator?.public_name ?? request.creator_id}</p></div><SampleStatusBadge status={request.status} dictionary={dictionary} /></div></CardHeader><CardContent className="grid gap-5 lg:grid-cols-[1fr_22rem]"><div className="space-y-4"><dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">{requestCopy.variant}</dt><dd>{request.variant?.label ?? dictionary.sampling.product.noVariants}</dd></div><div><dt className="text-muted-foreground">{requestCopy.requestedAt}</dt><dd>{new Intl.DateTimeFormat(defaultLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.requested_at))}</dd></div></dl>{request.creator_note ? <p className="rounded-lg bg-muted p-3 text-sm">{request.creator_note}</p> : null}{address ? <div className="rounded-lg border p-4"><h3 className="font-medium">{brand.fulfillmentAddress}</h3><p className="mt-2 text-sm">{address.recipient_name}<br />{address.street} {address.street_number}{address.apartment ? `, ${address.apartment}` : ""}<br />{address.postal_code} {address.city}, {address.province}<br />{address.country}{address.phone ? <><br />{address.phone}</> : null}</p>{address.additional_info ? <p className="mt-2 text-sm text-muted-foreground">{address.additional_info}</p> : null}</div> : null}{openIssue ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"><p className="font-medium text-destructive">{dictionary.sampling.issue[openIssue.issue_type]}</p><p className="mt-1 text-sm">{openIssue.description}</p></div> : null}<div><h3 className="font-medium">{requestCopy.timeline}</h3><ol className="mt-2 space-y-2 text-sm">{request.tracking_events.map((event) => <li key={event.id} className="flex justify-between gap-4 border-l-2 pl-3"><span>{dictionary.sampling.events[event.event_type]}</span><time className="text-muted-foreground">{new Intl.DateTimeFormat(defaultLocale, { dateStyle: "short", timeStyle: "short" }).format(new Date(event.created_at))}</time></li>)}</ol></div></div><aside className="space-y-3">{request.status === "REQUESTED" ? <><ActionButtonForm action={transitionSampleRequest} fields={{ programId, requestId: request.id, targetStatus: "APPROVED", brandNote: "", carrierName: "", trackingNumber: "", trackingUrl: "" }} label={requestCopy.approve} /><ActionButtonForm action={transitionSampleRequest} fields={{ programId, requestId: request.id, targetStatus: "REJECTED", brandNote: "", carrierName: "", trackingNumber: "", trackingUrl: "" }} label={requestCopy.reject} variant="outline" /></> : null}{request.status === "APPROVED" ? <><ActionButtonForm action={transitionSampleRequest} fields={{ programId, requestId: request.id, targetStatus: "PREPARING", brandNote: "", carrierName: "", trackingNumber: "", trackingUrl: "" }} label={requestCopy.prepare} /><ActionButtonForm action={transitionSampleRequest} fields={{ programId, requestId: request.id, targetStatus: "CANCELLED", brandNote: "", carrierName: "", trackingNumber: "", trackingUrl: "" }} label={requestCopy.cancel} variant="outline" /></> : null}{request.status === "PREPARING" ? <><ShipmentForm action={transitionSampleRequest} dictionary={dictionary} programId={programId} requestId={request.id} /><ActionButtonForm action={transitionSampleRequest} fields={{ programId, requestId: request.id, targetStatus: "CANCELLED", brandNote: "", carrierName: "", trackingNumber: "", trackingUrl: "" }} label={requestCopy.cancel} variant="outline" /></> : null}{request.status === "ISSUE" && openIssue ? <><ShipmentForm action={resolveSampleIssue} dictionary={dictionary} programId={programId} issueId={openIssue.id} /><IssueCancellationForm action={resolveSampleIssue} dictionary={dictionary} issueId={openIssue.id} programId={programId} /></> : null}</aside></CardContent></Card>;
    })}</div>}</section>}
  </div></>;
}
