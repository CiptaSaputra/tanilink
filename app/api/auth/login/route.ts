import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/data/users";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email tidak terdaftar." },
        { status: 404 },
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: "Password salah." },
        { status: 401 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...authUser } = user;

    return NextResponse.json(
      { success: true, user: authUser },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses login" },
      { status: 500 },
    );
  }
}
