"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUserAction } from "@/lib/auth/actions";
import { registerSchema } from "@/lib/auth/schema";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const parseResult = registerSchema.safeParse(formData);
    if (!parseResult.success) {
      setFieldErrors(parseResult.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUserAction(formData);

      if (!res.ok) {
        if (res.errors) {
          setFieldErrors(res.errors);
        } else if (res.error) {
          setGeneralError(res.error);
        }
      } else {
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
          callbackUrl: "/app",
        });

        if (signInResult?.ok) {
          router.push("/app");
          router.refresh();
        } else {
          router.push("/login?registered=true");
        }
      }
    } catch {
      setGeneralError(
        "An unexpected error occurred during registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-paper flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-brand-green/20 w-full max-w-lg rounded-lg border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-brand-forest text-2xl font-bold">
            Register Company Account
          </h1>
          <p className="text-brand-forest/70 mt-1 text-sm">
            Create an account for your organization to submit and track requests
            for quotation
          </p>
        </div>

        <div aria-live="polite" className="mb-4">
          {generalError && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              {generalError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reg-name"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Amina Bello"
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
            {fieldErrors.name?.[0] && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-company"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
              Company Name <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-company"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Niger Delta Energy Services Ltd"
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
            {fieldErrors.companyName?.[0] && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.companyName[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-email"
                className="text-brand-forest mb-1 block text-sm font-medium"
              >
                Corporate Email <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="amina@company.com"
                className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
              />
              {fieldErrors.email?.[0] && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="text-brand-forest mb-1 block text-sm font-medium"
              >
                Phone Number (Optional)
              </label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
              />
              {fieldErrors.phone?.[0] && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.phone[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
              Password <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 10 characters"
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
            {fieldErrors.password?.[0] && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-confirmPassword"
              className="text-brand-forest mb-1 block text-sm font-medium"
            >
              Confirm Password <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="border-brand-green/30 focus:ring-brand-green text-brand-forest min-h-[44px] w-full rounded-md border px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:outline-none"
            />
            {fieldErrors.confirmPassword?.[0] && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-green hover:bg-brand-forest focus:ring-brand-green mt-2 min-h-[44px] w-full rounded-md px-4 py-3 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Register account"}
          </button>
        </form>

        <div className="border-brand-green/10 mt-6 border-t pt-4 text-center">
          <p className="text-brand-forest/80 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-green font-semibold underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
