import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}

