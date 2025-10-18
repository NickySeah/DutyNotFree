import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth"; // Make sure this path is correct

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

    console.log("Fetching providerId for userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 3. Get a direct database connection from better-auth
    const db = auth.options.database;
    if (typeof db !== "object" || !("execute" in db)) {
      throw new Error("Database connection is not available");
    }

    // 4. Query the 'account' table for the providerId
    // Note: The result structure might vary based on your DB adapter (e.g., `result[0]`, `result.rows`)
    // This example assumes a structure like { rows: [...] }
    const result: any = await db.execute(
      "SELECT providerId FROM account WHERE userId = ? LIMIT 1",
      [userId]
    );

    const rows = result[0]; // Adjust based on your DB adapter

    // **Corrected Logic:** If no account is found, it's an error.
    if (!rows || rows.length === 0) {
      console.log(
        `No account found for user ID ${userId}`
      );
      return NextResponse.json(
        { error: `Account not found for user ID ${userId}` },
        { status: 404 } // Use 404 Not Found to indicate the resource is missing
      );
    }
    const firstRow = rows[0];
    const providerId = firstRow.providerId;

    // 5. Return the providerId
    return NextResponse.json({ providerId: providerId });
  } catch (error) {
    console.error("Error fetching providerId:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
