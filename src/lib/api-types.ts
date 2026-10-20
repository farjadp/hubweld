/**
 * Response shapes of the JSON API, shared with the mobile app.
 *
 * This file must stay import-free: the app (mobile/) imports these types
 * straight from here with `import type`, and anything this file imported would
 * have to resolve inside the app's build too. Mappers that build these shapes
 * from Prisma rows live in api-dto.ts.
 *
 * Money: `*Cents` fields are CAD cents. Job `budget` and bid `amount` are whole
 * CAD dollars. Dates are ISO strings. Image URLs may be site-relative
 * (`/api/files/...`): resolve them against the API origin.
 */

export type Role = "CUSTOMER" | "WELDER" | "SUPPLIER" | "ADMIN";

export type ApiError = { error: string };

export type Paged<T> = { items: T[]; page: number; pageCount: number; total: number };

// ── Auth ────────────────────────────────────────────────────────────────────

export type SessionUser = { id: string; name: string; email: string; role: Role };

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
};

export type Me = SessionUser & {
  city: string | null;
  phone: string | null;
  cartCount: number;
  welderProfile: WelderProfileDto | null;
  supplierProfile: { businessName: string; description: string; website: string; logoUrl: string; approved: boolean } | null;
};

// ── Shop ────────────────────────────────────────────────────────────────────

export type CategoryDto = { id: string; slug: string; name: string; children: { id: string; slug: string; name: string }[] };

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
  featured: boolean;
};

export type ProductDetail = ProductSummary & {
  sku: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  category: { id: string; slug: string; name: string };
  supplier: { id: string; name: string; city: string | null; approved: boolean; description: string };
  related: ProductSummary[];
};

export type CartResponse = {
  items: CartItemDto[];
  /** Present when ?country= (and ?region=) were given: the same estimate checkout will record. */
  totals?: { subtotalCents: number; shippingCents: number; taxCents: number; totalCents: number; taxLabel: string; taxResolved: boolean };
};

export type CartItemDto = {
  id: string;
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl: string;
  slug: string;
  stock: number;
};

export type OrderItemDto = {
  id: string;
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  supplierName: string;
};

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export type OrderSummary = {
  id: string;
  reference: string;
  status: OrderStatus;
  totalCents: number;
  itemCount: number;
  createdAt: string;
};

export type OrderDetail = OrderSummary & {
  paymentMethod: "contact" | "net30";
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  ship: { name: string; company: string; address: string; city: string; region: string; postal: string; country: string; phone: string };
  notes: string;
  items: OrderItemDto[];
};

export type SupplierOrderLine = {
  id: string;
  orderId: string;
  reference: string;
  name: string;
  priceCents: number;
  quantity: number;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  orderStatus: OrderStatus;
  buyerName: string;
  shipTo: string;
  createdAt: string;
};

// ── Service marketplace ─────────────────────────────────────────────────────

export type JobStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type JobCategory = "mobile" | "fabrication" | "repair" | "structural" | "other";
export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type JobSummary = {
  id: string;
  title: string;
  city: string;
  category: JobCategory;
  budget: number | null;
  status: JobStatus;
  bidCount: number;
  createdAt: string;
};

export type BidDto = {
  id: string;
  welderId: string;
  welderName: string;
  welderVerified: boolean;
  amount: number;
  message: string;
  status: BidStatus;
  createdAt: string;
};

export type ReviewDto = { id: string; rating: number; comment: string; authorName: string; createdAt: string };

export type JobDetail = JobSummary & {
  description: string;
  photos: string[];
  customer: { id: string; name: string };
  bids: BidDto[];
  reviews: ReviewDto[];
  /** What the signed-in viewer may do here. All false when signed out. */
  viewer: {
    isOwner: boolean;
    isAssignedWelder: boolean;
    myBid: BidDto | null;
    canBid: boolean;
    canMessage: boolean;
    canReview: boolean;
  };
};

export type MyBid = BidDto & { job: { id: string; title: string; city: string; status: JobStatus } };

/** As /api/jobs/[id]/messages returns it (shared with the site's message thread). */
export type MessageDto = { id: string; jobId: string; fromId: string; toId: string; body: string; createdAt: string; from: { id: string; name: string } };

// ── Welders ─────────────────────────────────────────────────────────────────

export type WelderProfileDto = {
  bio: string;
  skills: string[];
  certifications: string;
  serviceArea: string;
  hourlyRate: number | null;
  yearsExp: number | null;
  avatarUrl: string;
  resumeUrl: string;
  gallery: string[];
  languages: string[];
  country: string;
  serviceCountries: string[];
  approved: boolean;
};

export type WelderSummary = {
  id: string;
  name: string;
  city: string | null;
  verified: boolean;
  bio: string;
  skills: string[];
  serviceArea: string;
  hourlyRate: number | null;
  avatarUrl: string;
  rating: number | null;
  reviewCount: number;
};

export type WelderDetail = WelderSummary & { profile: WelderProfileDto | null; reviews: ReviewDto[] };
