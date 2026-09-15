import { redirect } from "next/navigation";
import { getViewer } from "@/repositories/viewer-repository";
import { redirectViewerHome } from "@/services/auth-service";

export default async function HomePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/ingresar");
  await redirectViewerHome(viewer);
}
