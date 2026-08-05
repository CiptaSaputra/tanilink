/**
 * app/api/auth/profile/route.ts
 * Update profil user: nama, nomor WA, wilayah
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, phone, region } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID wajib diisi." }, { status: 400 });
    }

    // Bersihkan nomor WA — hapus spasi, tanda +, pastikan diawali 62
    let cleanPhone = (phone ?? "").replace(/\s+/g, "").replace(/^\+/, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);

    const updateData: Record<string, string> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (cleanPhone) updateData.phone = cleanPhone;
    if (region?.trim()) updateData.region = region.trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate." }, { status: 400 });
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    // Return updated user
    const [updated] = await db.select().from(users).where(eq(users.id, id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...authUser } = updated;

    return NextResponse.json({ success: true, user: authUser });
  } catch (err) {
    console.error("[PATCH /api/auth/profile]", err);
    return NextResponse.json({ error: "Gagal update profil." }, { status: 500 });
  }
}
