import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/goals
export async function GET() {
  try {
    let goals = await prisma.userGoals.findFirst();
    if (!goals) {
      goals = await prisma.userGoals.create({
        data: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
      });
    }
    return Response.json(goals);
  } catch (err) {
    console.error("[/api/goals]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/goals
export async function PUT(request: NextRequest) {
  const { calories, protein, carbs, fat } = await request.json();

  let goals = await prisma.userGoals.findFirst();
  if (goals) {
    goals = await prisma.userGoals.update({
      where: { id: goals.id },
      data: { calories, protein, carbs, fat },
    });
  } else {
    goals = await prisma.userGoals.create({
      data: { calories, protein, carbs, fat },
    });
  }

  return Response.json(goals);
}
