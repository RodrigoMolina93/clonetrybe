import type { PostgrestError } from "@supabase/supabase-js";
import { getDictionary } from "@/lib/i18n";

export function getSamplingErrorMessage(error: Pick<PostgrestError, "code" | "message">): string {
  const messages = getDictionary().sampling.errors;
  if (error.message.includes("invalid_address")) return messages.invalidAddress;
  if (error.message.includes("invalid_product")) return messages.invalidProduct;
  if (error.message.includes("shipping_address_required")) return messages.addressRequired;
  if (error.message.includes("duplicate_active_sample_request")) return messages.duplicateRequest;
  if (error.message.includes("sample_product_not_available")) return messages.inactiveProduct;
  if (error.message.includes("sample_variant_not_available")) return messages.invalidVariant;
  if (error.message.includes("invalid_sample_status_transition")) return messages.invalidTransition;
  if (error.message.includes("open_sample_issue_exists")) return messages.openIssue;
  if (error.message.includes("sample_issue") || error.message.includes("invalid_issue")) return messages.invalidIssue;
  if (error.code === "42501") return messages.forbidden;
  return messages.generic;
}
