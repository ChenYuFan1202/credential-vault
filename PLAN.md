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

### Security

- Version 1 uses a trusted-backend security model.
- Do not describe version 1 as zero-knowledge or end-to-end encrypted.
- The backend may handle plaintext during request processing.
- The backend holds the ability to decrypt stored credential data.
- Build database CRUD and authentication before hardening stored sensitive data.
- Harden the database after the core data flow works.
- Do not store sensitive credential fields as plaintext.
- Keep credential platform names plaintext in version 1 to make search simpler.
- Encrypt stored credential username, password, and notes.
- Do not store user email as plaintext.
- Store user email with `emailHash` for lookup and `emailEncrypted` for display.
- Use a keyed hash / blind index for searchable sensitive values.
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

- [ ] Learn TypeScript types and interfaces.
- [ ] Learn TypeScript functions and modules.
- [ ] Learn TypeScript async/await.
- [ ] Learn Bun project basics.
- [ ] Learn Bun routing and request handling.
- [ ] Learn Bun environment variables.
- [ ] Learn Vue components.
- [ ] Learn Vue props and emits.
- [ ] Learn Vue reactive state and computed values.
- [ ] Learn Vue form binding.
- [ ] Learn Vue Router.
- [ ] Build small isolated exercises before the real app.

### Milestone 3: Minimal App Skeleton

- [ ] Scaffold Vue frontend.
- [ ] Scaffold Bun backend.
- [ ] Add health check API.
- [ ] Call health check from frontend.
- [ ] Add basic responsive layout.

### Milestone 4: Credential CRUD Without Encryption

- [ ] Use fake/test credentials only.
- [ ] Build credential model.
- [ ] Build CRUD API.
- [ ] Build CRUD frontend pages.
- [ ] Add validation and error handling.

### Milestone 5: Authentication

- [ ] Add registration.
- [ ] Add login.
- [ ] Add logout.
- [ ] Add password hashing.
- [ ] Choose session or token handling.
- [ ] Add authorization.
- [ ] Add user ownership checks.

### Milestone 6: Database Hardening and Backend Encryption

- [ ] Choose a mature authenticated encryption package.
- [ ] Create crypto service.
- [ ] Add `emailHash` for user lookup.
- [ ] Add `emailEncrypted` for user display.
- [ ] Encrypt sensitive fields.
- [ ] Decrypt sensitive fields.
- [ ] Manage nonce correctly.
- [ ] Store crypto version.
- [ ] Use environment variable encryption key.
- [ ] Add tests for security behavior.

### Milestone 7: RWD and Hardening

- [ ] Improve mobile layout.
- [ ] Add password visibility toggle.
- [ ] Add copy buttons.
- [ ] Add search.
- [ ] Add loading states.
- [ ] Add error states.
- [ ] Add confirmation dialog.
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
