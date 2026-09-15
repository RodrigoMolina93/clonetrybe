import { describe, expect, it } from "vitest";
import { addressSchema, productSchema, sampleRequestSchema, transitionSchema } from "@/features/sampling/schemas";

const programId = crypto.randomUUID();

describe("sampling validation", () => {
  it("normalizes product variants and accepts only HTTPS images", () => {
    const parsed = productSchema.parse({
      programId,
      name: "Remera Nexo",
      description: "Edición para creators",
      imageUrl: "https://images.example.test/remera.jpg",
      active: "on",
      variants: "Negro / M\nNegro / M\nBlanco / L",
    });
    expect(parsed.variants).toEqual(["Negro / M", "Blanco / L"]);
    expect(parsed.active).toBe(true);
    expect(productSchema.safeParse({ ...parsed, imageUrl: "http://unsafe.test/image.jpg", variants: "" }).success).toBe(false);
  });

  it("validates an Argentine shipping address", () => {
    expect(addressSchema.safeParse({
      programId,
      recipientName: "Clara Prueba",
      street: "Av. Corrientes",
      streetNumber: "1234",
      apartment: "4 B",
      city: "CABA",
      province: "Buenos Aires",
      postalCode: "C1043AAZ",
      country: "Argentina",
      phone: "+54 11 5555 5555",
      additionalInfo: "Timbre 4 B",
    }).success).toBe(true);
    expect(addressSchema.safeParse({ programId, country: "Uruguay" }).success).toBe(false);
  });

  it("accepts requests without variants and restricts brand target states", () => {
    expect(sampleRequestSchema.safeParse({ programId, productId: crypto.randomUUID(), variantId: "", creatorNote: "" }).success).toBe(true);
    expect(transitionSchema.safeParse({ programId, requestId: crypto.randomUUID(), targetStatus: "RECEIVED", brandNote: "", carrierName: "", trackingNumber: "", trackingUrl: "" }).success).toBe(false);
  });
});
