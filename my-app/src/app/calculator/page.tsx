"use client";

import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";

export default function CalculatorPage() {
  // const session = authClient.useSession();
  const { data: session, isPending } = useSession();
  return (
    <div>
      <h1>Calculator</h1>
      {/* Calculator component will be implemented here */}
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}