import {
    createCredential,
    fetchCredentials,
    getCredentialSummary,
    maskPassword,
    searchCredentials,
    validateCredential,
    type Credential,
} from "./credential.ts";

const githubCredential: Credential = {
    id: "credential-001",
    platform: "GitHub",
    username: "demo-user",
    password: "fake-password-123",
    createdAt: new Date(),
    updatedAt: new Date()
};

console.log(githubCredential);
console.log(githubCredential.username);
console.log(`${githubCredential.platform}`);

console.log(`Masked Password: ${maskPassword(githubCredential.password)}`);

console.log(getCredentialSummary(githubCredential));

const credentials: Credential[] = [
    githubCredential,
    {
      id: "credential-002",
      platform: "Gmail",
      username: "demo-mail-user",
      password: "fake-password-456",
      notes: "Fake email account for practice.",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
];

console.log(credentials);

console.log(searchCredentials(credentials, "git"));

const discordCredential = createCredential({
    platform: "Discord",
    username: "demo-discord-user",
    password: "fake-password-789",
});

console.log(discordCredential);

const validationResult = validateCredential({
    platform: "GitHub",
    username: "demo-user",
    password: "fake-password-123",
});

if (validationResult.success) {
    console.log("Credential is valid.");
} else {
    console.error(validationResult.message);
}

async function main(): Promise<void> {
    try {
        const fetchedCredentials = await fetchCredentials(credentials);
        console.log("Fetched credentials:");
        console.log(fetchedCredentials);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("An unknown error occurred.");
        }
    }
}

await main();
