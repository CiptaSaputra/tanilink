import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/** GET /api/auth/users/:id — ambil phone user untuk WA link */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      region: users.region,
    }).from(users).where(eq(users.id, id));

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
