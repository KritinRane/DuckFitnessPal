import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type ScrapedItem = {
  date: string;
  mealPeriod: string;
  station: string;
  name: string;
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

// POST /api/menu/sync  — called by the Python scraper
// Body: { items: ScrapedItem[], secret: string }
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.secret !== process.env.SCRAPER_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items: ScrapedItem[] = body.items ?? [];

  // Upsert all scraped items
  const results = await Promise.allSettled(
    items.map((item) =>
      prisma.menuItem.upsert({
        where: {
          date_name_mealPeriod_station: {
            date: item.date,
            name: item.name,
            mealPeriod: item.mealPeriod,
            station: item.station,
          },
        },
        update: {
          servingSize: item.servingSize ?? null,
          calories: item.calories ?? null,
          protein: item.protein ?? null,
          carbs: item.carbs ?? null,
          fat: item.fat ?? null,
        },
        create: {
          date: item.date,
          mealPeriod: item.mealPeriod,
          station: item.station,
          name: item.name,
          servingSize: item.servingSize ?? null,
          calories: item.calories ?? null,
          protein: item.protein ?? null,
          carbs: item.carbs ?? null,
          fat: item.fat ?? null,
        },
      })
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return Response.json({ synced: succeeded, failed });
}
