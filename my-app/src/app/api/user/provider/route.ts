import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { RowDataPacket } from "mysql2";

interface AccountRow extends RowDataPacket {
  providerId: string;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Get the current session and verify the user is an admin
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the userId from the query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // 3. Get a direct database connection from better-auth
    const db = auth.options.database;
    if (typeof db !== "object" || !("execute" in db)) {
      throw new Error("Database connection is not available");
    }

    // 4. Query with proper mysql2 typing
    const [rows] = await db.execute<AccountRow[]>(
      "SELECT providerId FROM account WHERE userId = ? LIMIT 1",
      [userId],
    );

    // 5. Check if account exists
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: `Account not found for user ID ${userId}` },
        { status: 404 },
      );
    }

    const providerId = rows[0].providerId; // Type-safe access

    // 6. Return the providerId
    return NextResponse.json({ providerId });
  } catch (error) {
    console.error("Error fetching providerId:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
