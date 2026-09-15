import dictionary from "@/locales/es-AR.json";

export const defaultLocale = "es-AR" as const;
export type Dictionary = typeof dictionary;

export function getDictionary(): Dictionary {
  return dictionary;
}
