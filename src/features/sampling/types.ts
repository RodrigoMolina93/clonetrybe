import type { Tables } from "@/types/database";

export type ShippingAddress = Tables<"creator_shipping_addresses">;
export type SampleProduct = Tables<"sample_products">;
export type SampleVariant = Tables<"sample_product_variants">;
export type SampleRequest = Tables<"sample_requests">;
export type SampleRequestPublic = Omit<SampleRequest, "shipping_address_snapshot">;
export type SampleIssue = Tables<"sample_issues">;
export type SampleTrackingEvent = Tables<"sample_tracking_events">;

export type SampleProductWithVariants = SampleProduct & {
  variants: SampleVariant[];
};

export type SampleRequestDetail = SampleRequestPublic & {
  product: Pick<SampleProduct, "name" | "image_url"> | null;
  variant: Pick<SampleVariant, "label"> | null;
  issues: SampleIssue[];
  tracking_events: SampleTrackingEvent[];
};

export type FulfillmentAddress = Pick<ShippingAddress,
  "recipient_name" | "street" | "street_number" | "apartment" | "city" |
  "province" | "postal_code" | "country" | "phone" | "additional_info"
>;
