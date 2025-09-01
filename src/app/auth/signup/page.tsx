"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg rounded-lg",
          },
        }}
        routing="path"
        path="/auth/signup"
        signInUrl="/auth/signin"
        afterSignUpUrl="/chat"
      />
    </div>
  );
}