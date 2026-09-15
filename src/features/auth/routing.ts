import type { UserType } from "@/types/database";

export function getHomeRoute(userType: UserType): "/admin" | "/marca" | "/creator" {
  if (userType === "ADMIN") return "/admin";
  if (userType === "BRAND") return "/marca";
  return "/creator";
}

export function getOnboardingRoute(userType: UserType): "/onboarding/marca" | "/onboarding/creator" | "/admin" {
  if (userType === "BRAND") return "/onboarding/marca";
  if (userType === "CREATOR") return "/onboarding/creator";
  return "/admin";
}
