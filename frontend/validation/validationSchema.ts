import * as Yup from "yup";
import { SUBCATEGORY_OPTIONS } from "../store/useStore";

export const usernameSchema = Yup.string()
  .required("Username is required")
  .min(3, "Username must be at least 3 characters")
  .max(32, "Username can't be over 32 characters")
  .matches(
    /^(?!.*[\s@#$%^&*!?\/\\])(?!.*[._]{2})[a-zA-Z0-9][a-zA-Z0-9._-]{1,30}[a-zA-Z0-9]$/,
    "Username must start and end with a letter and contain only English letters, numbers, or underscores",
  );

export const passwordSchema = Yup.string()
  .required("Password is required")
  .min(5, "Password must be at least 6 characters")
  .max(32, "Password can't be over 32 characters");
/* .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,32}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  ); */

export const emailSchema = Yup.string()
  .required("Email is required")
  .email("Invalid email address");

export const roleSchema = Yup.string()
  .required("Role is required")
  .oneOf(["client", "tasker", ""], "Role must be either 'client' or 'tasker'");

export const loginSchema = Yup.object().shape({
  username: usernameSchema,
  password: passwordSchema,
});

export const registerSchema = Yup.object().shape({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  role: roleSchema,
});

const anyLanguageRegex = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u;

export const jobPostSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .max(32, "Title must be at most 32 characters")
    .matches(
      anyLanguageRegex,
      "Title can contain letters, numbers, punctuation, and spaces",
    ),

  description: Yup.string()
    .required("Description is required")
    .max(128, "Description must be at most 128 characters")
    .matches(
      /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u,
      "Description can contain letters, numbers, punctuation, and spaces",
    ),

  budget: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === "" ? NaN : Number(originalValue);
    })
    .typeError("Budget must be a number")
    .required("Budget is required")
    .min(50, "Budget must be at least 50 MDL"),

  location: Yup.string()
    .required("Location is required")
    .max(64, "Location must be at most 64 characters")
    .trim("No leading or trailing spaces"),

  urgency: Yup.string()
    .required("Urgency is required")
    .oneOf(["now", "soon", "flexible"]),

  category: Yup.string().required("Category is required"),

  subcategory: Yup.string()
    .default("")
    .when("category", ([category], schema) => {
      if (category !== "other") {
        return schema
          .required("Subcategory is required for this category")
          .oneOf(SUBCATEGORY_OPTIONS[category], "Invalid subcategory");
      }
      return schema.notRequired().default("");
    }),
});
