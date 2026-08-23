export type CredentialCustomFieldInput = {
  label: string;
  value: string;
};

export type CreateCredentialInput = {
  platform: string;
  username: string;
  password: string;
  notes?: string;
  customFields?: CredentialCustomFieldInput[];
};

export type UpdateCredentialInput = {
  platform?: string;
  username?: string;
  password?: string;
  notes?: string | null;
  customFields?: CredentialCustomFieldInput[];
};

function isCredentialCustomFieldInput(
  value: unknown,
): value is CredentialCustomFieldInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.label === "string" &&
    input.label.trim() !== "" &&
    typeof input.value === "string" &&
    input.value !== ""
  );
}

function isCredentialCustomFieldInputArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(isCredentialCustomFieldInput);
}

export function isCreateCredentialInput(
  value: unknown,
): value is CreateCredentialInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.platform === "string" &&
    input.platform.trim() !== "" &&
    typeof input.username === "string" &&
    input.username.trim() !== "" &&
    typeof input.password === "string" &&
    input.password !== "" &&
    (input.notes === undefined || typeof input.notes === "string") &&
    (input.customFields === undefined ||
      isCredentialCustomFieldInputArray(input.customFields))
  );
}

export function isUpdateCredentialInput(
  value: unknown,
): value is UpdateCredentialInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  const hasPlatform = input.platform !== undefined;
  const hasUsername = input.username !== undefined;
  const hasPassword = input.password !== undefined;
  const hasNotes = input.notes !== undefined;
  const hasCustomFields = input.customFields !== undefined;

  if (
    !hasPlatform &&
    !hasUsername &&
    !hasPassword &&
    !hasNotes &&
    !hasCustomFields
  ) {
    return false;
  }

  return (
    (!hasPlatform ||
      (typeof input.platform === "string" && input.platform.trim() !== "")) &&
    (!hasUsername ||
      (typeof input.username === "string" && input.username.trim() !== "")) &&
    (!hasPassword ||
      (typeof input.password === "string" && input.password !== "")) &&
    (!hasNotes || input.notes === null || typeof input.notes === "string") &&
    (!hasCustomFields ||
      isCredentialCustomFieldInputArray(input.customFields))
  );
}
