"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const urlError = searchParams.get("error");

  const [activeTab, setActiveTab] = useState<"credentials" | "magic">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "CredentialsSignin"
      ? "Invalid email or password"
      : urlError === "EmailSignin"
      ? "Failed to send sign-in email"
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error.includes("Too many attempts")) {
          setErrorMessage("Too many attempts — try again later or use email sign-in");
        } else {
          setErrorMessage("Invalid email or password");
        }
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setErrorMessage("Invalid email or password");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signIn("resend", {
        email: magicEmail,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        if (
          res.error.includes("Email sign-in is not configured") ||
          res.error.includes("not configured")
        ) {
          setErrorMessage("Email sign-in is not configured — use your password");
        } else {
          setErrorMessage("Email sign-in is not configured — use your password");
        }
      } else {
        setSuccessMessage(
          `A sign-in link has been sent to ${magicEmail}. Please check your inbox.`
        );
      }
    } catch {
      setErrorMessage("Email sign-in is not configured — use your password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-brand-green/20">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-forest">Sign in</h1>
        <p className="text-sm text-brand-forest/70 mt-1">
          Access the OCNKS Global operations console
        </p>
      </div>

      {/* Method Tabs */}
      <div className="flex border-b border-brand-green/20 mb-6" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "credentials"}
          aria-controls="credentials-panel"
          id="credentials-tab"
          onClick={() => {
            setActiveTab("credentials");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors min-h-[44px] ${
            activeTab === "credentials"
              ? "border-brand-green text-brand-green"
              : "border-transparent text-brand-forest/60 hover:text-brand-forest"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "magic"}
          aria-controls="magic-panel"
          id="magic-tab"
          onClick={() => {
            setActiveTab("magic");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors min-h-[44px] ${
            activeTab === "magic"
              ? "border-brand-green text-brand-green"
              : "border-transparent text-brand-forest/60 hover:text-brand-forest"
          }`}
        >
          Email sign-in link
        </button>
      </div>

      {/* Live Error / Success Notifications */}
      <div aria-live="polite" className="mb-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-brand-green rounded text-sm font-medium">
            {successMessage}
          </div>
        )}
      </div>

      {/* Password Credentials Panel */}
      {activeTab === "credentials" && (
        <form
          id="credentials-panel"
          role="tabpanel"
          aria-labelledby="credentials-tab"
          onSubmit={handleCredentialsSubmit}
          className="space-y-4"
        >
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-brand-forest mb-1">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-brand-forest mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-brand-green text-white font-semibold rounded-md hover:bg-brand-forest transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-50 min-h-[44px]"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}

      {/* Magic Link Email Panel */}
      {activeTab === "magic" && (
        <form
          id="magic-panel"
          role="tabpanel"
          aria-labelledby="magic-tab"
          onSubmit={handleMagicLinkSubmit}
          className="space-y-4"
        >
          <div>
            <label htmlFor="magic-email" className="block text-sm font-medium text-brand-forest mb-1">
              Email address
            </label>
            <input
              id="magic-email"
              type="email"
              required
              autoComplete="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-brand-green text-white font-semibold rounded-md hover:bg-brand-forest transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-50 min-h-[44px]"
          >
            {isSubmitting ? "Sending link..." : "Email me a sign-in link"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center pt-4 border-t border-brand-green/10">
        <p className="text-sm text-brand-forest/80">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-green hover:underline underline-offset-2"
          >
            Register company account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-paper">
      <Suspense fallback={<div className="text-center text-brand-forest py-8">Loading...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
