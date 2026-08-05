type Credential = {
    id: string;
    platform: string;
    username: string;
    password: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
};

type CreateCredentialInput = {
    platform: string;
    username: string;
    password: string;
    notes?: string;
};

const credentials: Credential[] = [
    {
        id: "credential-001",
        platform: "GitHub",
        username: "demo-user",
        password: "fake-password-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

function createCredential(input: CreateCredentialInput): Credential {
    const now = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        ...input,
        createdAt: now,
        updatedAt: now,
    };
}

function isCreateCredentialInput(value: unknown): value is CreateCredentialInput {
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
        input.password.length >= 8 &&
        (input.notes === undefined || typeof input.notes === "string")
    );
}

const port = Number(Bun.env.PORT ?? 3000);

const server = Bun.serve({
    port,
    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === "/health") {
            return Response.json({
                status: "ok",
            });
        }

        if (url.pathname === "/credentials" && request.method === "GET") {
            return Response.json({
                data: credentials,
            });
        }

        if (url.pathname === "/credentials" && request.method === "POST") {
            const body = await request.json();

            if (!isCreateCredentialInput(body)) {
                return Response.json(
                    {
                        error: "Invalid credential input",
                    },
                    {
                        status: 400,
                    },
                );
            }

            const credential = createCredential(body);

            credentials.push(credential);

            return Response.json(
                {
                    data: credential,
                },
                {
                    status: 201,
                },
            );
        }

        return Response.json(
            {
                error: "Not found",
            },
            {
                status: 404,
            },
        );
    },
});

console.log(`Server is running on http://localhost:${server.port}`);
