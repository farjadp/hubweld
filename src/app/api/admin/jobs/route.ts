import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  category: z.enum(["mobile", "fabrication", "repair", "structural", "other"]),
  budget: z.number().int().positive().nullable().optional(),
  customerId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
