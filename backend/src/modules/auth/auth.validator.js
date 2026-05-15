const { z } = require("zod");

const signupSchema = z.object({
  regNo: z.string({ required_error: "Registration number is required" }).trim().toUpperCase(),
  name:  z.string({ required_error: "Name is required" }).trim().min(2).max(60),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must have uppercase, lowercase and a number"),
  confirmPassword: z.string({ required_error: "Please confirm password" }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  regNo:    z.string({ required_error: "Registration number is required" }).trim().toUpperCase(),
  password: z.string({ required_error: "Password is required" }),
});

const refreshSchema = z.object({
  refreshToken: z.string({ required_error: "Refresh token is required" }),
});

module.exports = { signupSchema, loginSchema, refreshSchema };
