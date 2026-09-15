import { redirect } from "next/navigation";
import { getHomeRoute, getOnboardingRoute } from "@/features/auth/routing";
import { getViewer, hasCompletedOnboarding, type Viewer } from "@/repositories/viewer-repository";
import type { UserType } from "@/types/auth";

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/ingresar");
  return viewer;
}

export async function requireRole(expected: UserType): Promise<Viewer> {
  const viewer = await requireViewer();
  if (viewer.userType !== expected) redirect(getHomeRoute(viewer.userType));
  if (!(await hasCompletedOnboarding(viewer)) && expected !== "ADMIN") redirect(getOnboardingRoute(viewer.userType));
  return viewer;
}

export async function requireOnboardingRole(expected: UserType): Promise<Viewer> {
  const viewer = await requireViewer();
  if (viewer.userType !== expected) redirect(getHomeRoute(viewer.userType));
  if (await hasCompletedOnboarding(viewer)) redirect(getHomeRoute(viewer.userType));
  return viewer;
}

export async function redirectViewerHome(viewer: Viewer): Promise<never> {
  const complete = await hasCompletedOnboarding(viewer);
  redirect(complete ? getHomeRoute(viewer.userType) : getOnboardingRoute(viewer.userType));
}
