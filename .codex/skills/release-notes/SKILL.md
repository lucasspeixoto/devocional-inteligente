---
name: release-notes
description: Generate release notes from git branch differences in this project. Use when the user asks for release notes, changelog text, launch notes, or a summary of changes between the current branch and a base branch such as release/v1.1.0.
---

# Release Notes

## Workflow

1. Identify the comparison base from the user request. If omitted, ask for the base branch before writing release notes.
2. Inspect the branch delta with:
   - `git status --short --branch`
   - `git log --oneline --decorate --no-merges <base>..HEAD`
   - `git diff --stat <base>...HEAD`
   - `git diff --name-status <base>...HEAD`
3. Read the relevant changed files or specs before summarizing. Prefer actual implementation files over commit messages when they disagree.
4. Search for existing release notes or changelog files. If a local pattern exists, follow it. If none exists, use the default format below.
5. Group only user-visible changes under release notes. Mention internal documentation, OpenSpec archive/spec updates, version bumps, and technical cleanup only when they matter to release coordination.
6. Write in Brazilian Portuguese unless the user asks for another language.

## Default Format

Use this structure when no repository-specific release note pattern exists:

```markdown
# Release Notes - vX.Y.Z

## Destaques
- ...

## Novidades
- ...

## Melhorias
- ...

## Ajustes tecnicos
- ...
```

Omit empty sections. Keep bullets short, concrete, and user-centered.

## Style

- Prefer plain product language over implementation jargon.
- Start each bullet with the capability or outcome, not with the file name.
- Include navigation paths when they help the user understand where the feature appears.
- Keep OpenSpec/spec archive changes in `Ajustes tecnicos` or omit them when the audience is end users.
- Avoid claiming tests or validation were run unless they were actually executed.
- If the diff suggests a version bump, state it explicitly.

## Useful Signals

- New `app/(tabs)/*.tsx` files usually indicate new top-level tabs or screens.
- Changes in `app/reading/*` usually affect the Bible reader experience.
- Changes in `services/repositories/*` and `types/*` usually support data loading, persistence, or typed response shapes.
- OpenSpec changes usually document completed scope and should not be framed as user-facing app features by themselves.
