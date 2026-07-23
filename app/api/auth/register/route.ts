import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/data/users";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, password, confirmPassword, role, region } = data;

    if (!name?.trim())
      return NextResponse.json(
        { success: false, error: "Nama wajib diisi." },
        { status: 400 },
      );
    if (!email?.trim())
      return NextResponse.json(
        { success: false, error: "Email wajib diisi." },
        { status: 400 },
      );
    if (password.length < 6)
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter." },
        { status: 400 },
      );
    if (password !== confirmPassword)
      return NextResponse.json(
        { success: false, error: "Konfirmasi password tidak cocok." },
        { status: 400 },
      );
    if (!region?.trim())
      return NextResponse.json(
        { success: false, error: "Wilayah wajib diisi." },
        { status: 400 },
      );

    const forbiddenRoles = ["ADMIN", "DINAS"];
    if (forbiddenRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Role Admin dan Dinas tidak dapat mendaftar sendiri.",
        },
        { status: 403 },
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email sudah digunakan akun lain." },
        { status: 409 },
      );
    }

    const newUser = {
      id: `u-${role.toLowerCase()}-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role,
      region: region.trim(),
      createdAt: new Date(),
    };

    await db.insert(users).values(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...authUser } = newUser;

    return NextResponse.json(
      { success: true, user: authUser },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pendaftaran" },
      { status: 500 },
    );
  }
}
