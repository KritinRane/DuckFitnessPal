import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/log?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? today();

  try {
    const entries = await prisma.foodLog.findMany({
      where: { date },
      orderBy: { loggedAt: "asc" },
    });

    type Totals = { calories: number; protein: number; carbs: number; fat: number };
    const totals = entries.reduce<Totals>(
      (acc, e) => ({
        calories: acc.calories + scaled(e.calories, e.multiplier),
        protein: acc.protein + scaled(e.protein, e.multiplier),
        carbs: acc.carbs + scaled(e.carbs, e.multiplier),
        fat: acc.fat + scaled(e.fat, e.multiplier),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return Response.json({ date, entries, totals });
  } catch (err) {
    console.error("[/api/log]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/log  — quick-add an item
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { menuItemId, multiplier = 1 } = body;

  if (!menuItemId) {
    return Response.json({ error: "menuItemId required" }, { status: 400 });
  }

  const source = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!source) {
    return Response.json({ error: "MenuItem not found" }, { status: 404 });
  }

  const entry = await prisma.foodLog.create({
    data: {
      date: today(),
      menuItemId: source.id,
      itemName: source.name,
      servingSize: source.servingSize,
      multiplier,
      calories: source.calories,
      protein: source.protein,
      carbs: source.carbs,
      fat: source.fat,
    },
  });

  return Response.json(entry, { status: 201 });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function scaled(val: number | null, multiplier: number): number {
  return val != null ? val * multiplier : 0;
}
