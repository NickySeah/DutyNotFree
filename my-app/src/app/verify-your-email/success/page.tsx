// This must be a client component to allow for user interaction (the button click).
// This code is not USED, this is for incase we want a dedicated success page later.
"use client";

import { redirect, RedirectType } from 'next/navigation'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

// The main page component
export default function VerificationSuccessPage() {
  // Get the router instance to handle client-side navigation

  // Handler function to redirect the user to the login page
  const handleRedirectToLogin = () => {
    redirect('/login', RedirectType.replace);
  };

  return (
    <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Successful!
          </CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRedirectToLogin} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

