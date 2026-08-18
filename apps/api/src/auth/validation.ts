export type RegisterUserInput = {
  username: string;
  password: string;
};

export type LoginUserInput = {
  username: string;
  password: string;
};

export function isRegisterUserInput(value: unknown): value is RegisterUserInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.username === "string" &&
    input.username.trim().length >= 3 &&
    typeof input.password === "string" &&
    input.password.length >= 8
  );
}

export function isLoginUserInput(value: unknown): value is LoginUserInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.username === "string" &&
    input.username.trim() !== "" &&
    typeof input.password === "string" &&
    input.password !== ""
  );
}
