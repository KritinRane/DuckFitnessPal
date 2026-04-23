import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/menu?date=YYYY-MM-DD  (defaults to today)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? today();

  try {
    const items = await prisma.menuItem.findMany({
      where: { date },
      orderBy: [{ mealPeriod: "asc" }, { station: "asc" }, { name: "asc" }],
    });

    // Group by mealPeriod → station → items[]
    const grouped: Record<string, Record<string, typeof items>> = {};
    for (const item of items) {
      if (!grouped[item.mealPeriod]) grouped[item.mealPeriod] = {};
      if (!grouped[item.mealPeriod][item.station])
        grouped[item.mealPeriod][item.station] = [];
      grouped[item.mealPeriod][item.station].push(item);
    }

    return Response.json({ date, menu: grouped });
  } catch (err) {
    console.error("[/api/menu]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
