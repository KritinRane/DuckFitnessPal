import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/log/[id]  — update multiplier
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { multiplier } = await request.json();

  if (typeof multiplier !== "number" || multiplier <= 0) {
    return Response.json({ error: "multiplier must be a positive number" }, { status: 400 });
  }

  const entry = await prisma.foodLog.update({ where: { id }, data: { multiplier } });
  return Response.json(entry);
}

// DELETE /api/log/[id]
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.foodLog.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
