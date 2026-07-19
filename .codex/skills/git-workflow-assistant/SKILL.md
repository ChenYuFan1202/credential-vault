---
name: git-workflow-assistant
description: Inspect current Git work, suggest branch names and commit messages, summarize changes, and perform branch or commit creation only after explicit user confirmation.
---

# Git Workflow Assistant

Use this skill when the user wants help preparing Git work before creating a branch or commit.

## Inputs

Ask for the task purpose if it is not already clear.

## Workflow

1. Inspect the current branch and working tree.
2. Read staged and unstaged diffs.
3. Identify untracked files.
4. Infer the intended base branch only when evidence is available.
5. Suggest 2-4 branch names using `<author>/<category>-<purpose>`.
6. Recommend one branch name and wait for user confirmation before creating it.
7. Suggest a commit category and commit message using `<category>: <purpose>`.
8. Produce a concise commit summary.
9. Clearly distinguish staged changes, unstaged changes, and untracked files.
10. If the user explicitly requests a commit, confirm exactly which files should be included before staging or committing.

## Defaults

- Default author segment: `vick`.
- Branch creation command: `git switch -c <branch-name>`.
- Commit messages: English.
- Commit categories: use the category that matches the actual change, such as `feat`, `fix`, `docs`, `refactor`, `test`, or `chore`.

## Output

Report:

- Current branch
- Suggested branch names
- Recommended branch name
- Suggested commit category
- Suggested commit message
- Commit summary
- Files included
- Files excluded or unrelated
- Risks or unclear changes
- Next action requiring confirmation, if any

## Restrictions

- Do not create or switch branches without explicit user confirmation.
- Do not stage files unless the user explicitly requests it and confirms which files to include.
- Do not commit unless the user explicitly requests it and confirms the message.
- Do not push.
- Do not delete branches.
- Do not rewrite Git history.
- Do not include unrelated files in the recommendation.
- Do not claim a change exists unless it is visible in `git diff`, `git diff --staged`, or the untracked file list.
