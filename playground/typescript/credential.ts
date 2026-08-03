export type Credential = {
    id: string;
    platform: string;
    username: string;
    password: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateCredentialInput = {
    platform: string;
    username: string;
    password: string;
    notes?: string;
};

export type ValidationResult =
    | {
          success: true;
      }
    | {
          success: false;
          message: string;
      };

export function maskPassword(password: string): string {
    return "*".repeat(password.length);
}

export function getCredentialSummary(credential: Credential): string {
    return `${credential.platform}: ${credential.username}`;
}

export function searchCredentials(
    credentials: Credential[],
    keyword: string,
): Credential[] {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return credentials.filter((credential) =>
        credential.platform.toLowerCase().includes(normalizedKeyword),
    );
}

export function createCredential(input: CreateCredentialInput): Credential {
    const now = new Date();

    return {
        id: crypto.randomUUID(),
        ...input,
        createdAt: now,
        updatedAt: now,
    };
}

export function validateCredential(input: CreateCredentialInput): ValidationResult {
    if (input.platform.trim() === "") {
        return {
            success: false,
            message: "Platform is required.",
        };
    }

    if (input.username.trim() === "") {
        return {
            success: false,
            message: "Username is required.",
        };
    }

    if (input.password.length < 8) {
        return {
            success: false,
            message: "Password must contain at least 8 characters.",
        };
    }

    return {
        success: true,
    };
}

export async function fetchCredentials(
    credentials: Credential[],
): Promise<Credential[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return credentials;
}
