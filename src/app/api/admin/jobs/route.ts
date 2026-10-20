import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  category: z.enum(["mobile", "fabrication", "repair", "structural", "other"]),
  budget: z.number().int().positive().nullable().optional(),
  customerId: z.string().min(1),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return forbidden();

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const customer = await prisma.user.findUnique({ where: { id: parsed.data.customerId } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 400 });

  const job = await prisma.job.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      category: parsed.data.category,
      budget: parsed.data.budget ?? null,
      customerId: parsed.data.customerId,
      status: "OPEN",
    },
  });
  return NextResponse.json({ id: job.id });
}
