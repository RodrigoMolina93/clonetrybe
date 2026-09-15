import { createClient } from "@/lib/supabase/server";
import type {
  FulfillmentAddress,
  SampleProductWithVariants,
  SampleRequestDetail,
  ShippingAddress,
} from "@/features/sampling/types";

class SamplingDataError extends Error {
  constructor() {
    super("Unable to load sampling data");
  }
}

function assertNoError(error: unknown): asserts error is null {
  if (error) throw new SamplingDataError();
}

const requestSelection = "id, program_id, product_id, variant_id, creator_id, status, creator_note, brand_note, carrier_name, tracking_number, tracking_url, requested_at, approved_at, rejected_at, preparing_at, shipped_at, received_at, cancelled_at, created_at, updated_at, product:sample_products(name, image_url), variant:sample_product_variants(label), issues:sample_issues(*), tracking_events:sample_tracking_events(*)" as const;

export async function getSampleProducts(programId: string): Promise<SampleProductWithVariants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sample_products")
    .select("*, variants:sample_product_variants(*)")
    .eq("program_id", programId)
    .order("created_at", { ascending: false });
  assertNoError(error);
  return data.map((product) => ({
    ...product,
    variants: [...product.variants].sort((a, b) => a.label.localeCompare(b.label, "es-AR")),
  }));
}

export async function getSampleProduct(productId: string): Promise<SampleProductWithVariants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sample_products")
    .select("*, variants:sample_product_variants(*)")
    .eq("id", productId)
    .maybeSingle();
  assertNoError(error);
  return data ? { ...data, variants: [...data.variants].sort((a, b) => a.label.localeCompare(b.label, "es-AR")) } : null;
}

export async function getCreatorShippingAddress(userId: string): Promise<ShippingAddress | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_shipping_addresses")
    .select("*")
    .eq("creator_id", userId)
    .maybeSingle();
  assertNoError(error);
  return data;
}

export async function getSampleRequests(programId: string, creatorId?: string): Promise<SampleRequestDetail[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sample_requests")
    .select(requestSelection)
    .eq("program_id", programId)
    .order("requested_at", { ascending: false });
  if (creatorId) query = query.eq("creator_id", creatorId);
  const { data, error } = await query;
  assertNoError(error);
  return data.map((request) => ({
    ...request,
    issues: [...request.issues].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    tracking_events: [...request.tracking_events].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
}

export async function getFulfillmentAddress(requestId: string): Promise<FulfillmentAddress | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_sample_request_shipping_address", { p_request_id: requestId });
  if (error) return null;
  return data[0] ?? null;
}
