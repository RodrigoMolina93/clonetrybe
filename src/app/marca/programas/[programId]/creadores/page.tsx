import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { BrandProgramHeader } from "@/features/programs/brand-program-header";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { cancelInvitation, inviteCreator, reviewApplication } from "@/features/programs/actions";
import { StatusBadge } from "@/features/programs/status-badge";
import type { CreatorSummary } from "@/features/programs/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { getDictionary } from "@/lib/i18n";
import { getBrandProgram, getProgramCreatorManagement, searchCreators } from "@/repositories/program-repository";

function creatorName(creator: CreatorSummary | undefined, fallback: string) {
  if (!creator) return fallback;
  const fullName = [creator.first_name, creator.last_name].filter(Boolean).join(" ");
  return { publicName: creator.public_name, fullName: fullName || fallback };
}

export default async function BrandProgramCreatorsPage({ params, searchParams }: { params: Promise<{ programId: string }>; searchParams: Promise<{ q?: string | string[] }> }) {
  const [{ programId }, queryParams] = await Promise.all([params, searchParams]);
  const query = typeof queryParams.q === "string" ? queryParams.q.trim() : "";
  const [program, management, results] = await Promise.all([
    getBrandProgram(programId),
    getProgramCreatorManagement(programId),
    query ? searchCreators(query) : Promise.resolve([]),
  ]);
  if (!program) notFound();
  const dictionary = getDictionary();
  const copy = dictionary.programs.brand;
  const unavailableCreators = new Set([
    ...management.memberships.filter((row) => row.status === "ACTIVE").map((row) => row.creator_id),
    ...management.invitations.filter((row) => row.status === "PENDING").map((row) => row.creator_id),
  ]);
  return <><BrandProgramHeader program={program} active="creators" dictionary={dictionary} /><div className="space-y-8">
    <Card><CardHeader><CardTitle>{copy.searchCreators}</CardTitle></CardHeader><CardContent><form className="flex flex-col gap-3 sm:flex-row" method="get"><Input name="q" defaultValue={query} placeholder={copy.searchPlaceholder} maxLength={80} /><Button type="submit"><Search aria-hidden="true" />{dictionary.common.search}</Button></form>{query ? <div className="mt-5 space-y-3">{results.length === 0 ? <p className="text-sm text-muted-foreground">{copy.searchEmpty}</p> : results.map((creator) => <div key={creator.creator_id} className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"><div><p className="font-medium">{creator.public_name}</p><p className="text-sm text-muted-foreground">{[creator.first_name, creator.last_name].filter(Boolean).join(" ")}</p></div>{unavailableCreators.has(creator.creator_id) ? <StatusBadge status="PENDING" dictionary={dictionary} /> : <ActionButtonForm action={inviteCreator} fields={{ programId, creatorId: creator.creator_id }} label={copy.invite} pendingLabel={copy.invitePending} />}</div>)}</div> : null}</CardContent></Card>
    <section><h2 className="mb-4 text-xl font-semibold">{copy.applicantsTitle}</h2>{management.applications.length === 0 ? <EmptyState title={copy.applicantsTitle} description={copy.applicantsEmpty} /> : <div className="space-y-3">{management.applications.map((application) => { const name = creatorName(management.creators.get(application.creator_id), dictionary.common.notAvailable); return <Card key={application.id}><CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-medium">{typeof name === "string" ? name : name.publicName}</p>{typeof name !== "string" ? <p className="text-sm text-muted-foreground">{name.fullName}</p> : null}{application.message ? <p className="mt-2 max-w-2xl text-sm">{application.message}</p> : null}</div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={application.status} dictionary={dictionary} />{application.status === "PENDING" ? <><ActionButtonForm action={reviewApplication} fields={{ relationshipId: application.id, programId, decision: "ACCEPTED" }} label={copy.acceptApplication} /><ActionButtonForm action={reviewApplication} fields={{ relationshipId: application.id, programId, decision: "REJECTED" }} label={copy.rejectApplication} variant="outline" /></> : null}</div></CardContent></Card>; })}</div>}</section>
    <section><h2 className="mb-4 text-xl font-semibold">{copy.invitationsTitle}</h2>{management.invitations.length === 0 ? <EmptyState title={copy.invitationsTitle} description={copy.invitationsEmpty} /> : <div className="space-y-3">{management.invitations.map((invitation) => { const name = creatorName(management.creators.get(invitation.creator_id), dictionary.common.notAvailable); return <Card key={invitation.id}><CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-medium">{typeof name === "string" ? name : name.publicName}</p>{typeof name !== "string" ? <p className="text-sm text-muted-foreground">{name.fullName}</p> : null}</div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={invitation.status} dictionary={dictionary} />{invitation.status === "PENDING" ? <ActionButtonForm action={cancelInvitation} fields={{ relationshipId: invitation.id, programId }} label={copy.cancelInvitation} variant="outline" /> : null}</div></CardContent></Card>; })}</div>}</section>
    <section><h2 className="mb-4 text-xl font-semibold">{copy.membersTitle}</h2>{management.memberships.filter((membership) => membership.status === "ACTIVE").length === 0 ? <EmptyState title={copy.membersTitle} description={copy.membersEmpty} /> : <div className="grid gap-3 sm:grid-cols-2">{management.memberships.filter((membership) => membership.status === "ACTIVE").map((membership) => { const name = creatorName(management.creators.get(membership.creator_id), dictionary.common.notAvailable); return <Card key={membership.id}><CardContent><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{typeof name === "string" ? name : name.publicName}</p>{typeof name !== "string" ? <p className="text-sm text-muted-foreground">{name.fullName}</p> : null}</div><StatusBadge status={membership.status} dictionary={dictionary} /></div><p className="mt-3 text-xs text-muted-foreground">{dictionary.programs.membershipSource[membership.source]}</p></CardContent></Card>; })}</div>}</section>
  </div></>;
}

