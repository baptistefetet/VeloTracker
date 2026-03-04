---
description: Auto commit and push to GitHub after every code modification. This workflow MUST be applied automatically after ANY code change requested by the user, without asking for confirmation.
---

# Auto Commit & Push

After every code modification, automatically commit and push changes to GitHub.

**Important:** This project runs on **Windows with PowerShell**. Use `;` to chain commands, NOT `&&`.

## Steps

// turbo-all

1. Stage all changes:
```
git add -A
```

2. Commit with a descriptive message summarizing the change:
```
git commit -m "<type>: <short description>"
```
Use conventional commit types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, etc.

3. Push to remote:
```
git push
```

## Notes

- Do NOT ask the user for confirmation before running these steps.
- Do NOT use `&&` to chain commands — PowerShell does not support it. Use `;` or run commands separately.
- If a push fails (e.g. network issue), inform the user but do not retry automatically.
