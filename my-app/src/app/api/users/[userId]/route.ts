import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { auth } from "@/utils/auth";
import type { RowDataPacket } from "mysql2";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const expected = process.env.INTERNAL_API_KEY;
  const provided = request.headers.get("x-internal-api-key");
  if (
    !expected ||
    !provided ||
    Buffer.byteLength(expected) !== Buffer.byteLength(provided) ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userId } = await context.params;
    if (!userId || userId.length > 255)
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    const db = auth.options.database;
    if (!db || typeof db !== "object" || !("execute" in db))
      throw new Error("Database unavailable");
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, email FROM user WHERE id = ?",
      [userId],
    );
    const user = rows[0];
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(
      { userId: user.id, email: user.email },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
