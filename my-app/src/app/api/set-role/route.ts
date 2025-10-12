import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    console.log("Setting role:", role);

    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log("Session:", session);

    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a role (prevent role changes)
    if (
      session.user.role &&
      ["admin", "supplier", "importer"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "User already has a role assigned and cannot change it" },
        { status: 403 }
      );
    }

    // Validate role input
    if (!["supplier", "importer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    console.log("Updating user with ID:", session.user.id);

    // Direct database update
    const db = auth.options.database;

    if (typeof db === "object" && "execute" in db) {
      await db.execute("UPDATE user SET role = ? WHERE id = ?", [
        role,
        session.user.id,
      ]);
    } else {
      throw new Error("Database connection not available");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
