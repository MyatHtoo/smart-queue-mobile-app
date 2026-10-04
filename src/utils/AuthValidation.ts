export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const normalizePhone = (value: string) => {
  const trimmed = value.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  return prefix + trimmed.replace(/\D/g, "");
};
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
export const isValidPhone = (value: string) => /^\+?\d{8,15}$/.test(normalizePhone(value));
export const passwordError = (value: string) => value.length < 8 ? "Password must contain at least 8 characters." : !/[A-Za-z]/.test(value) || !/\d/.test(value) ? "Use at least one letter and one number." : "";

