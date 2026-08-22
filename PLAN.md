# Credential Vault Plan

## Goal

Build a personal full-stack credential vault while learning TypeScript, Vue.js, Bun, REST APIs, database work, RWD, authentication, authorization, and backend encryption.

## Scope

### In Scope

- Personal credential storage and viewing.
- Small milestone-based development.
- Vue.js + TypeScript frontend.
- TypeScript + Bun backend.
- REST API design.
- Database CRUD.
- Basic authentication and authorization.
- Backend encryption for stored credential data.
- Responsive layouts for desktop, tablet, and mobile.

### Out of Scope

- Large-scale multi-user deployment.
- Commercialization.
- Team credential sharing.
- Browser extension autofill.
- Native mobile app.
- Offline sync.
- Zero-knowledge architecture.
- End-to-end encryption.
- OAuth.
- Multi-factor authentication.
- Password recovery.
- CI/CD.
- Docker.
- Production deployment.

## Decisions

### Product

- MVP includes registration, login, logout, credential CRUD, platform search, and credential detail with sensitive fields masked by default.
- Draft data model starts with `User` and `Credential`.
- Draft REST API starts with `/auth/*` and `/credentials/*`.
- Draft frontend flow starts with auth pages and credential list/detail/edit pages.

### Architecture

- Use SQLite for local learning and version 1.
- Consider PostgreSQL later only if deployment becomes a real goal.
- Use a separated frontend/backend architecture.
- Use `apps/web` for the Vue frontend.
- Use `apps/api` for the Bun backend.
- Use REST APIs with JSON between frontend and backend.
- Use session-based authentication with HTTP cookies for version 1.
- Use SQLite-backed sessions for auth version 1.
- Do not use Redis for auth version 1.

### Security

- Version 1 uses a trusted-backend security model.
- Treat version 1 as a learning/demo application, even if deployed for personal testing.
- Do not invite public users or real credential usage for version 1.
- Do not describe version 1 as zero-knowledge or end-to-end encrypted.
- The backend may handle plaintext during request processing.
- The backend holds the ability to decrypt stored credential data.
- Build database CRUD and authentication before hardening stored sensitive data.
- Harden the database after the core data flow works.
- Do not store sensitive credential fields as plaintext.
- Keep credential platform names plaintext in version 1 to make search simpler.
- Encrypt stored credential username, password, and notes.
- Use username/password registration for auth version 1.
- Do not use email for auth version 1.
- Do not add email verification or password recovery for auth version 1.
- Do not add admin/user roles for auth version 1.
- Use ownership-based authorization for credentials.
- Use Argon2id for login password hashing.
- Use NaCl/libsodium authenticated encryption for credential field encryption.
- Store a random session token in the browser cookie.
- Store only `sessionTokenHash`, not the raw session token, in the database.
- Check `expiresAt` on each authenticated request.
- Delete an expired session when it is encountered.
- Logout deletes the current session.
- If email auth is added later, do not store user email as plaintext.
- If email auth is added later, store user email with `emailHash` for lookup and `emailEncrypted` for display.
- Use a keyed hash / blind index for searchable sensitive values if searchable sensitive values are added later.
- Store login passwords with password hashing, not encryption.
- Use precise field suffixes such as `Hash` and `Encrypted` instead of vague names like `Secured`.
- Do not use real account passwords in tests or examples.
- Do not log passwords, encryption keys, tokens, or decrypted credential values.

### Workflow

- Initialize Git before creating project files.
- Keep project documentation lightweight at first.
- Use `PLAN.md` as the main planning document.
- Do not create separate docs files until the content grows enough to justify them.
- Keep the copied `git-workflow-assistant` Skill.
- Remove the copied Git Skill practice plan from `.codex/skill-plans`.
- Use English for code, branch names, commit messages, file names, and API names.
- Use Traditional Chinese for explanations and learning notes.

## Milestones

### Milestone 0: Repository Setup

- [x] Initialize Git repository.
- [x] Create `AGENTS.md`.
- [x] Create this `PLAN.md`.
- [x] Remove copied Git Skill practice plan.
- [x] Create first planning commit.

### Milestone 1: Requirements and Architecture

- [x] Confirm MVP requirements.
- [x] Decide database.
- [x] Decide project structure.
- [x] Draft basic data model.
- [x] Draft REST API endpoints.
- [x] Draft frontend pages and user flow.
- [x] Record security boundaries.

### Milestone 2: Learning Foundations

- [x] Learn TypeScript types and interfaces.
- [x] Learn TypeScript functions and modules.
- [x] Learn TypeScript async/await.
- [x] Learn Bun project basics.
- [x] Learn Bun routing and request handling.
- [x] Learn Bun environment variables.
- [x] Learn Vue components.
- [x] Learn Vue props and emits.
- [x] Learn Vue reactive state and computed values.
- [x] Learn Vue form binding.
- [x] Learn Vue Router.
- [x] Build small isolated exercises before the real app.

### Milestone 3: Minimal App Skeleton

- [x] Scaffold Vue frontend.
- [x] Scaffold Bun backend.
- [x] Add health check API.
- [x] Call health check from frontend.
- [x] Add basic responsive layout.

### Milestone 4: Credential CRUD Without Encryption

- [x] Use fake/test credentials only.
- [x] Build credential model.
- [x] Build CRUD API.
- [x] Build CRUD frontend pages.
- [x] Add validation and error handling.

### Milestone 5: Authentication

- [x] Add users table.
- [x] Add sessions table.
- [x] Add `userId` to credentials.
- [x] Delete existing fake credentials before applying user ownership migration.
- [x] Add username/password registration.
- [x] Add login.
- [x] Add logout.
- [x] Add Argon2id password hashing.
- [x] Add cookie-based session handling.
- [x] Store session token hashes in SQLite.
- [x] Check session expiration on authenticated requests.
- [x] Add ownership checks to credential APIs.
- [x] Add frontend auth pages and state.

### Milestone 6: Database Hardening and Backend Encryption

- [x] Choose a mature authenticated encryption package.
- [x] Create crypto service.
- [x] Encrypt sensitive fields.
- [x] Decrypt sensitive fields.
- [x] Manage nonce correctly.
- [x] Store crypto version.
- [x] Use environment variable encryption key.
- [x] Add tests for security behavior.

### Milestone 7: RWD and Hardening

- [ ] Improve mobile layout.
- [x] Add password visibility toggle.
- [x] Add copy buttons.
- [ ] Add search.
- [ ] Add loading states.
- [ ] Add error states.
- [ ] Add confirmation dialog.
- [ ] Add password change flow.
- [ ] Add manual credential export for user-owned backup.
- [ ] Confirm sensitive data is not logged.
- [ ] Confirm API responses do not expose unnecessary data.
- [ ] Confirm `.env` is ignored.

## Questions and Answers

- Should the project use TypeScript? -- Yes -- both frontend and backend should use TypeScript.
- Should the frontend use Vue.js? -- Yes -- Vue.js is part of the learning goal.
- Should the backend use Bun? -- Yes -- Bun is part of the learning goal.
- Should the first version implement zero-knowledge encryption? -- No -- use backend encryption first.
- Should the first version implement end-to-end encryption? -- No -- keep the security model simpler.
- Should login passwords be used directly as encryption keys? -- No -- login password hashing and stored credential encryption are separate concerns.
- Should real credentials be used during development? -- No -- use fake/test data only.
- Should separate docs files be created now? -- No -- keep the first version in `PLAN.md`.
