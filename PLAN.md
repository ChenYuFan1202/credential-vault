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

- Initialize Git before creating project files.
- Keep project documentation lightweight at first.
- Use `PLAN.md` as the main planning document.
- Do not create separate docs files until the content grows enough to justify them.
- Keep the copied `git-workflow-assistant` Skill.
- Remove the copied Git Skill practice plan from `.codex/skill-plans`.
- Use backend encryption for version 1.
- Use a trusted-backend model for version 1.
- Do not describe version 1 as zero-knowledge or end-to-end encrypted.
- Do not use real account passwords in tests or examples.
- Keep platform name plaintext in version 1 to make search simpler.
- Encrypt stored credential username, password, and notes.
- Use English for code, branch names, commit messages, file names, and API names.
- Use Traditional Chinese for explanations and learning notes.

## Tasks

### Milestone 0: Repository Setup

- [x] Initialize Git repository.
- [x] Create `AGENTS.md`.
- [x] Create this `PLAN.md`.
- [x] Remove copied Git Skill practice plan.
- [ ] Create first planning commit.

### Milestone 1: Requirements and Architecture

- [ ] Confirm MVP requirements.
- [ ] Decide database.
- [ ] Decide project structure.
- [ ] Draft basic data model.
- [ ] Draft REST API endpoints.
- [ ] Draft frontend pages and user flow.
- [ ] Record security boundaries.

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

### Milestone 6: Backend Encryption

- [ ] Choose a mature authenticated encryption package.
- [ ] Create crypto service.
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
