import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.userProfile.findFirst();
    return Response.json(profile ?? null);
  } catch (err) {
    console.error("[/api/profile GET]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = await prisma.userProfile.findFirst();

    const data = {
      weightLbs:     body.weightLbs     ?? null,
      heightFt:      body.heightFt      ?? null,
      heightIn:      body.heightIn      ?? null,
      age:           body.age           ?? null,
      sex:           body.sex           ?? null,
      activityLevel: body.activityLevel ?? null,
      goal:          body.goal          ?? null,
      cutRate:       body.cutRate       ?? null,
      bulkRate:      body.bulkRate      ?? null,
    };

    const profile = existing
      ? await prisma.userProfile.update({ where: { id: existing.id }, data })
      : await prisma.userProfile.create({ data });

    return Response.json(profile);
  } catch (err) {
    console.error("[/api/profile PUT]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
