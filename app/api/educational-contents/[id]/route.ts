import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { educationalContents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await db
      .update(educationalContents)
      .set(body)
      .where(eq(educationalContents.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/educational-contents/[id] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db
      .delete(educationalContents)
      .where(eq(educationalContents.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/educational-contents/[id] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
