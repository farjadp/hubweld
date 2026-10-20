import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type {
  CartResponse,
  CategoryDto,
  JobDetail,
  JobSummary,
  Me,
  MessageDto,
  MyBid,
  OrderDetail,
  OrderSummary,
  Paged,
  ProductDetail,
  ProductSummary,
  SupplierOrderLine,
  WelderDetail,
  WelderSummary,
} from "@shared/api-types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * Every server read and write the screens use. Keys are grouped so a
 * mutation can invalidate exactly what it changed.
 */

export const keys = {
  me: ["me"] as const,
  cart: (dest?: string) => ["cart", dest ?? ""] as const,
  categories: ["categories"] as const,
  products: (q: string, category: string) => ["products", q, category] as const,
  featured: ["products", "featured"] as const,
  product: (id: string) => ["product", id] as const,
  jobs: (q: string, category: string) => ["jobs", q, category] as const,
  job: (id: string) => ["job", id] as const,
  myJobs: ["myJobs"] as const,
  myBids: ["myBids"] as const,
  messages: (jobId: string) => ["messages", jobId] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  supplierLines: ["supplierLines"] as const,
  supplierProducts: ["supplierProducts"] as const,
  welders: (q: string, verified: boolean) => ["welders", q, verified] as const,
  welder: (id: string) => ["welder", id] as const,
};

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};

function usePaged<T>(key: QueryKey, path: string, params: Record<string, string | undefined>) {
  return useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => api<Paged<T>>(`${path}${qs({ ...params, page: pageParam })}`, { signal }),
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
  });
}

// ── Account ───────────────────────────────────────────────────────────────

export function useMe() {
  const { status } = useAuth();
  return useQuery({ queryKey: keys.me, queryFn: () => api<Me>("/api/me"), enabled: status === "signedIn" });
}

// ── Shop ──────────────────────────────────────────────────────────────────

export const useCategories = () =>
  useQuery({ queryKey: keys.categories, queryFn: () => api<CategoryDto[]>("/api/categories"), staleTime: 60 * 60 * 1000 });

export const useProducts = (q: string, category: string) =>
  usePaged<ProductSummary>(keys.products(q, category), "/api/products", { q, category });

export const useFeatured = () =>
  useQuery({ queryKey: keys.featured, queryFn: () => api<Paged<ProductSummary>>("/api/products?featured=1") });

export const useProduct = (id: string) =>
  useQuery({ queryKey: keys.product(id), queryFn: () => api<ProductDetail>(`/api/products/${encodeURIComponent(id)}`), enabled: !!id });

export function useCart(dest?: { country: string; region: string }) {
  const { status } = useAuth();
  const d = dest ? `${dest.country}|${dest.region}` : undefined;
  return useQuery({
    queryKey: keys.cart(d),
    queryFn: () => api<CartResponse>(`/api/cart${dest ? qs(dest) : ""}`),
    enabled: status === "signedIn",
  });
}

export function useCartMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["cart"] });
    void qc.invalidateQueries({ queryKey: keys.me });
  };
  return {
    add: useMutation({
      mutationFn: (v: { productId: string; quantity: number }) => api("/api/cart", { method: "POST", body: v }),
      onSuccess: refresh,
    }),
    setQty: useMutation({
      mutationFn: (v: { itemId: string; quantity: number }) =>
        api(`/api/cart/${v.itemId}`, { method: "PATCH", body: { quantity: v.quantity } }),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (itemId: string) => api(`/api/cart/${itemId}`, { method: "DELETE" }),
      onSuccess: refresh,
    }),
  };
}

export type CheckoutInput = {
  name: string;
  company: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone: string;
  notes: string;
  paymentMethod: "contact" | "net30";
};

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: CheckoutInput) => api<{ id: string }>("/api/checkout", { method: "POST", body: v }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
      void qc.invalidateQueries({ queryKey: keys.orders });
      void qc.invalidateQueries({ queryKey: keys.me });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────

export const useOrders = () => useQuery({ queryKey: keys.orders, queryFn: () => api<OrderSummary[]>("/api/orders") });
export const useOrder = (id: string) => useQuery({ queryKey: keys.order(id), queryFn: () => api<OrderDetail>(`/api/orders/${id}`) });

export function useOrderAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "cancel" | "receive") => api(`/api/orders/${id}/${action}`, { method: "POST" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.order(id) });
      void qc.invalidateQueries({ queryKey: keys.orders });
    },
  });
}

// ── Jobs ──────────────────────────────────────────────────────────────────

export const useJobs = (q: string, category: string) => usePaged<JobSummary>(keys.jobs(q, category), "/api/jobs", { q, category });
export const useJob = (id: string) => useQuery({ queryKey: keys.job(id), queryFn: () => api<JobDetail>(`/api/jobs/${id}`) });
export const useMyJobs = () => useQuery({ queryKey: keys.myJobs, queryFn: () => api<JobSummary[]>("/api/me/jobs") });
export const useMyBids = () => useQuery({ queryKey: keys.myBids, queryFn: () => api<MyBid[]>("/api/me/bids") });

export function useJobMutations(jobId: string) {
  const qc = useQueryClient();
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: keys.job(jobId) });
    void qc.invalidateQueries({ queryKey: keys.myJobs });
    void qc.invalidateQueries({ queryKey: keys.myBids });
    void qc.invalidateQueries({ queryKey: ["jobs"] });
  };
  return {
    bid: useMutation({
      mutationFn: (v: { amount: number; message: string }) => api(`/api/jobs/${jobId}/bids`, { method: "POST", body: v }),
      onSuccess: refresh,
    }),
    accept: useMutation({
      mutationFn: (bidId: string) => api(`/api/jobs/${jobId}/accept`, { method: "POST", body: { bidId } }),
      onSuccess: refresh,
    }),
    status: useMutation({
      mutationFn: (status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") =>
        api(`/api/jobs/${jobId}/status`, { method: "POST", body: { status } }),
      onSuccess: refresh,
    }),
    review: useMutation({
      mutationFn: (v: { rating: number; comment: string }) => api(`/api/jobs/${jobId}/review`, { method: "POST", body: v }),
      onSuccess: refresh,
    }),
  };
}

export function usePostJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { title: string; description: string; city: string; category: string; budget: number | null; photos: string[] }) =>
      api<{ id: string }>("/api/jobs", { method: "POST", body: v }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.myJobs });
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

/** The thread polls while the chat screen is open; push covers the rest. */
export const useMessages = (jobId: string) =>
  useQuery({
    queryKey: keys.messages(jobId),
    queryFn: () => api<MessageDto[]>(`/api/jobs/${jobId}/messages`),
    refetchInterval: 5000,
  });

export function useSendMessage(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { body: string; toId?: string }) => api<MessageDto>(`/api/jobs/${jobId}/messages`, { method: "POST", body: v }),
    onSuccess: (msg) => {
      qc.setQueryData<MessageDto[]>(keys.messages(jobId), (old) => [...(old ?? []), msg]);
    },
  });
}

// ── Supplier ──────────────────────────────────────────────────────────────

export const useSupplierLines = () =>
  useQuery({ queryKey: keys.supplierLines, queryFn: () => api<SupplierOrderLine[]>("/api/supplier/order-items") });

export const useSupplierProducts = () =>
  useQuery({ queryKey: keys.supplierProducts, queryFn: () => api<(ProductSummary & { status: string })[]>("/api/supplier/products") });

export function useLineStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: "PENDING" | "FULFILLED" | "CANCELLED" }) =>
      api(`/api/supplier/order-items/${v.id}`, { method: "POST", body: { status: v.status } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.supplierLines }),
  });
}

export type ProductInput = {
  name: string;
  brand: string;
  sku: string;
  slug: string;
  categoryId: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
};

export function useSaveProduct(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: ProductInput) =>
      id ? api(`/api/products/${id}`, { method: "PATCH", body: v }) : api<{ id: string }>("/api/products", { method: "POST", body: v }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.supplierProducts });
      void qc.invalidateQueries({ queryKey: ["products"] });
      if (id) void qc.invalidateQueries({ queryKey: keys.product(id) });
    },
  });
}

// ── Welders ───────────────────────────────────────────────────────────────

export const useWelders = (q: string, verified: boolean) =>
  usePaged<WelderSummary>(keys.welders(q, verified), "/api/welders", { q, verified: verified ? "1" : undefined });

export const useWelder = (id: string) => useQuery({ queryKey: keys.welder(id), queryFn: () => api<WelderDetail>(`/api/welders/${id}`) });

export type WelderProfileInput = {
  bio: string;
  skills: string;
  certifications: string;
  serviceArea: string;
  hourlyRate: number | null;
  yearsExp: number | null;
  avatarUrl: string;
  resumeUrl: string;
  galleryJson: string;
  languages: string;
  country: string;
  serviceCountries: string;
};

export function useSaveWelderProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: WelderProfileInput) => api("/api/profile", { method: "POST", body: v }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.me }),
  });
}

export function useSaveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Record<string, string | undefined>) => api("/api/account", { method: "PATCH", body: v }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.me }),
  });
}
