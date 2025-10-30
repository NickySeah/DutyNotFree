// This file runs *only* on the server.
// It is never sent to the user's browser.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth"; // Using your auth import

/**
 * --- FIX: Force this route to be dynamic ---
 * This prevents Next.js from trying to statically render it,
 * which is likely causing the `params` object to be empty.
 */
export const dynamic = "force-dynamic";

/**
 * --- SECURITY (IMPORTANT!) ---
 * This endpoint should be secured so that only your Java service can call it.
 * We'll check for a "secret API key" in the request headers.
 */
// function isAuthorized(request: NextRequest): boolean {
//   try {
//     const internalApiKey = request.headers.get("x-internal-api-key");
//     const expectedKey = process.env.INTERNAL_API_KEY; // You must set this in your .env.local

//     if (!expectedKey) {
//       // Security is not configured on the server
//       console.error("INTERNAL_API_KEY is not set in environment variables.");
//       return false;
//     }

//     return internalApiKey === expectedKey;
//   } catch (error) {
//     console.error("Error during authorization check:", error);
//     return false;
//   }
// }

/**
 * Handles GET requests to /api/users/[userId]
 * This is called by your Java service to get a user's email.
 */
export async function GET(
  request: NextRequest // <-- 1. Removed the 'context' argument
) {
  try {
    // 1. Check if the request is from a trusted source (your Java service)
    // if (!isAuthorized(request)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // 2. Get the userId from the URL path
    // We are parsing the URL directly because context.params was unreliable.
    const path = request.nextUrl.pathname; // e.g., /api/users/cxkcFQ48nHtc17bc6gD03PGqHllb8JJR
    const segments = path.split('/');      // e.g., ["", "api", "users", "cxkcFQ48nHtc17bc6gD03PGqHllb8JJR"]
    const userId = segments[segments.length - 1]; // Get the last part

    console.log("USER ID from URL:", userId); 

    if (!userId || userId === "users") { // Check if the ID is missing or just 'users'
      console.error("User ID is missing from URL path.");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 3. Connect to your database (using your auth util, like your example)
    const db = auth.options.database;
    if (typeof db !== "object" || !("execute" in db)) {
      throw new Error("Database connection not available");
    }

    // 4. Find the user in your database
    // Adjust this query for your user table structure
    const result: any = await db.execute(
      "SELECT id, email FROM user WHERE id = ?",
      [userId]
    );
    
    // Check if the user was found
    const user = result[0]?.[0];
    console.log(result);

    // 5. Handle "User Not Found"
    if (!user) {
      console.log(`User not found for ID: ${userId}`); // Add a log for clarity
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 6. Send a 200 OK response with the user's data
    // Only send back the data the Java service needs
    const responseBody = {
      userId: user.id,
      email: user.email,
    };

    return NextResponse.json(responseBody, { status: 200 });
    
  } catch (error) {
    // 7. Handle any other server errors
    console.error("Error in /api/users/[userId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

