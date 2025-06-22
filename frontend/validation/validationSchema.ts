import * as Yup from "yup";

export const usernameSchema = Yup.string()
  .required("Username is required")
  .min(3, "Username must be at least 3 characters")
  .max(32, "Username can't be over 32 characters");
/* .matches(
    /^[A-Za-z][A-Za-z0-9_]*$/,
    "Username must start with a letter and contain only English letters, numbers, or underscores",
  ); */

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
  .oneOf(["worker", "client"], "Role must be either 'worker' or 'client'");

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
