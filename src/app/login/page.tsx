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

  const [activeTab, setActiveTab] = useState<"credentials" | "magic">(
    "credentials"
  );
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
          setErrorMessage(
            "Too many attempts — try again later or use email sign-in"
          );
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
          setErrorMessage(
            "Email sign-in is not configured — use your password"
          );
        } else {
          setErrorMessage(
            "Email sign-in is not configured — use your password"
          );
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
    <div className="border-brand-green/20 mx-auto w-full max-w-md rounded-lg border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-brand-forest text-2xl font-bold">Sign in</h1>
        <p className="text-brand-forest/70 mt-1 text-sm">
          Access the OCNKS Global operations console
        </p>
      </div>

      {/* Method Tabs */}
      <div className="border-brand-green/20 mb-6 flex border-b" role="tablist">
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
          className={`min-h-[44px] flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors ${
            activeTab === "credentials"
              ? "border-brand-green text-brand-green"
              : "text-brand-forest/60 hover:text-brand-forest border-transparent"
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
          className={`min-h-[44px] flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors ${
            activeTab === "magic"
              ? "border-brand-green text-brand-green"
              : "text-brand-forest/60 hover:text-brand-forest border-transparent"
          }`}
        >
          Email sign-in link
        </button>
      </div>

      {/* Live Error / Success Notifications */}
      <div aria-live="polite" className="mb-4">
        {errorMessage && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="text-brand-green rounded border border-green-200 bg-green-50 p-3 text-sm font-medium">
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
            <label
              htmlFor="login-email"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
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
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
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
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-green hover:bg-brand-forest focus:ring-brand-green min-h-[44px] w-full rounded-md px-4 py-3 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
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
            <label
              htmlFor="magic-email"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
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
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-green hover:bg-brand-forest focus:ring-brand-green min-h-[44px] w-full rounded-md px-4 py-3 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? "Sending link..." : "Email me a sign-in link"}
          </button>
        </form>
      )}

      <div className="border-brand-green/10 mt-6 border-t pt-4 text-center">
        <p className="text-brand-forest/80 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-brand-green font-semibold underline-offset-2 hover:underline"
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
    <div className="bg-brand-paper flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="text-brand-forest py-8 text-center">Loading...</div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
