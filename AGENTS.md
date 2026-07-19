# Repository Instructions

This repository is a personal full-stack credential vault project for learning TypeScript, Vue.js, Bun, REST APIs, database work, RWD, authentication, authorization, and backend encryption.

## Communication

- Use Traditional Chinese when explaining concepts, tradeoffs, and workflow.
- Use English for code, branch names, commit messages, file names, and API names.
- Explain what the user should learn from each small milestone.

## Work Style

- Do not build the whole system at once.
- Work in small milestones.
- Explain the intended change before modifying files.
- Do not introduce large abstractions before the requirement is clear.
- Do not add dependencies without first explaining their purpose.
- Prefer simple, readable TypeScript over clever code.

## Security Boundaries

- This project uses a trusted-backend security model for the first version.
- Do not describe the system as zero-knowledge or end-to-end encrypted.
- The backend may handle plaintext during request processing.
- The backend holds the ability to decrypt stored credential data.
- The database should not store sensitive credential fields as plaintext.
- Do not request or use real account passwords in tests or examples.
- Do not log passwords, encryption keys, tokens, or decrypted credential values.

## Git Safety

- Prefer read-only Git inspection before suggesting actions.
- Do not create branches unless the user confirms the branch name.
- Do not run `git add`, `git commit`, or `git push` unless the user explicitly requests it.
- Do not rewrite history, reset branches, delete branches, or force-push unless explicitly requested.

## Planning

- Read `PLAN.md` before starting project implementation work, if it exists.
- Keep project requirements, architecture notes, security model, and milestones in `PLAN.md` unless the user asks to split docs out.
