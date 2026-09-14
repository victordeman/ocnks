import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{7,30}$/;

export const rfqSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(2, "Contact name must be at least 2 characters")
    .max(120, "Contact name must not exceed 120 characters"),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(160, "Company name must not exceed 160 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email address must not exceed 254 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(30, "Phone number must not exceed 30 characters")
    .regex(
      phoneRegex,
      "Phone number may only contain digits, spaces, +, -, and parentheses"
    ),
  serviceLineSlug: z
    .string()
    .trim()
    .min(1, "Please select a service line"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must not exceed 200 characters"),
  scope: z
    .string()
    .trim()
    .min(20, "Scope description must be at least 20 characters")
    .max(5000, "Scope description must not exceed 5000 characters"),
  desiredStart: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Desired start date must not be in the past"),
});

export type RfqInput = z.infer<typeof rfqSchema>;
