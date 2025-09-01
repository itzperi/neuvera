"use client";

import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg rounded-lg",
          },
        }}
        routing="path"
        path="/auth/signin"
        signUpUrl="/auth/signup"
        afterSignInUrl="/chat"
      />
    </div>
  );
}