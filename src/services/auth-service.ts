import { redirect } from "next/navigation";
import { homeRoute, onboardingRoute } from "@/features/auth/routing";
import { getViewer, type Viewer, type ViewerOrganization } from "@/repositories/viewer-repository";

export type AuthenticatedViewer = Viewer & { organization: ViewerOrganization };

export async function requireViewer(): Promise<AuthenticatedViewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/ingresar");
  if (!viewer.organization) redirect(onboardingRoute);
  return viewer as AuthenticatedViewer;
}

export async function requireOnboarding(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/ingresar");
  if (viewer.organization) redirect(homeRoute);
  return viewer;
}

export async function redirectViewerHome(viewer: Viewer): Promise<never> {
  redirect(viewer.organization ? homeRoute : onboardingRoute);
}
