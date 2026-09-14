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
      setGeneralError("An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-paper">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-brand-green/20">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-forest">Register Company Account</h1>
          <p className="text-sm text-brand-forest/70 mt-1">
            Create an account for your organization to submit and track requests for quotation
          </p>
        </div>

        <div aria-live="polite" className="mb-4">
          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm font-medium">
              {generalError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-brand-forest mb-1">
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
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
            {fieldErrors.name?.[0] && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-company" className="block text-sm font-medium text-brand-forest mb-1">
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
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
            {fieldErrors.companyName?.[0] && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.companyName[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-brand-forest mb-1">
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
                className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
              />
              {fieldErrors.email?.[0] && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-brand-forest mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
              />
              {fieldErrors.phone?.[0] && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.phone[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-brand-forest mb-1">
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
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
            {fieldErrors.password?.[0] && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirmPassword" className="block text-sm font-medium text-brand-forest mb-1">
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
              className="w-full px-3 py-2.5 border border-brand-green/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-brand-forest text-base min-h-[44px]"
            />
            {fieldErrors.confirmPassword?.[0] && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-brand-green text-white font-semibold rounded-md hover:bg-brand-forest transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-50 min-h-[44px] mt-2"
          >
            {isSubmitting ? "Creating account..." : "Register account"}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-brand-green/10">
          <p className="text-sm text-brand-forest/80">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-green hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
