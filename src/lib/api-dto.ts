import type { Bid, Order, OrderItem, Product, Review, User, WelderProfile } from "@prisma/client";
import type {
  BidDto,
  OrderDetail,
  OrderSummary,
  ProductSummary,
  ReviewDto,
  WelderProfileDto,
  WelderSummary,
} from "@/lib/api-types";

/**
 * Prisma row → API shape. Kept in one place so the same record looks the same
 * from every endpoint, and so nothing leaks by accident: a mapper lists the
 * fields it sends, where returning a raw row would also send emails, password
 * hashes and whatever column is added next.
 */

export function orderReference(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

export function splitList(s?: string | null): string[] {
  return (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

export function parseGallery(json?: string | null): string[] {
  if (!json) return [];
  try {
    const a = JSON.parse(json);
    return Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  return Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10;
}

export function toProductSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    priceCents: p.priceCents,
    stock: p.stock,
    imageUrl: p.imageUrl,
    featured: p.featured,
  };
}

export function toBid(b: Bid & { welder: Pick<User, "name"> & { welderProfile: Pick<WelderProfile, "approved"> | null } }): BidDto {
  return {
    id: b.id,
    welderId: b.welderId,
    welderName: b.welder.name,
    welderVerified: !!b.welder.welderProfile?.approved,
    amount: b.amount,
    message: b.message,
    status: b.status as BidDto["status"],
    createdAt: b.createdAt.toISOString(),
  };
}

export function toReview(r: Review & { author: Pick<User, "name"> }): ReviewDto {
  return { id: r.id, rating: r.rating, comment: r.comment, authorName: r.author.name, createdAt: r.createdAt.toISOString() };
}

export function toWelderProfile(p: WelderProfile): WelderProfileDto {
  return {
    bio: p.bio,
    skills: splitList(p.skills),
    certifications: p.certifications,
    serviceArea: p.serviceArea,
    hourlyRate: p.hourlyRate,
    yearsExp: p.yearsExp,
    avatarUrl: p.avatarUrl,
    resumeUrl: p.resumeUrl,
    gallery: parseGallery(p.galleryJson),
    languages: splitList(p.languages),
    country: p.country,
    serviceCountries: splitList(p.serviceCountries),
    approved: p.approved,
  };
}

export function toWelderSummary(
  w: User & { welderProfile: WelderProfile | null; receivedReviews: { rating: number }[] }
): WelderSummary {
  return {
    id: w.id,
    name: w.name,
    city: w.city,
    verified: !!w.welderProfile?.approved,
    bio: w.welderProfile?.bio ?? "",
    skills: splitList(w.welderProfile?.skills),
    serviceArea: w.welderProfile?.serviceArea ?? "",
    hourlyRate: w.welderProfile?.hourlyRate ?? null,
    avatarUrl: w.welderProfile?.avatarUrl ?? "",
    rating: averageRating(w.receivedReviews),
    reviewCount: w.receivedReviews.length,
  };
}

export function toOrderSummary(o: Order & { items: Pick<OrderItem, "id">[] }): OrderSummary {
  return {
    id: o.id,
    reference: orderReference(o.id),
    status: o.status as OrderSummary["status"],
    totalCents: o.totalCents,
    itemCount: o.items.length,
    createdAt: o.createdAt.toISOString(),
  };
}

export function toOrderDetail(
  o: Order & {
    items: (OrderItem & { supplier: Pick<User, "name"> & { supplierProfile: { businessName: string } | null } })[];
  }
): OrderDetail {
  return {
    ...toOrderSummary(o),
    paymentMethod: o.paymentMethod as OrderDetail["paymentMethod"],
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    taxCents: o.taxCents,
    ship: {
      name: o.shipName,
      company: o.shipCompany,
      address: o.shipAddress,
      city: o.shipCity,
      region: o.shipRegion,
      postal: o.shipPostal,
      country: o.shipCountry,
      phone: o.shipPhone,
    },
    notes: o.notes,
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.nameSnapshot,
      priceCents: i.priceCents,
      quantity: i.quantity,
      status: i.status as OrderDetail["items"][number]["status"],
      supplierName: i.supplier.supplierProfile?.businessName || i.supplier.name,
    })),
  };
}

/** Read `?page=` against a known page count, clamped to the valid range. */
export function pageParam(url: URL, pageCount: number): number {
  const n = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, pageCount));
}
