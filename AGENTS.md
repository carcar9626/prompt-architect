This project is **not** connected to Lovable — that integration ended 2026-07-26. Development
now happens via Claude Code and Dyad (local `qwen3:coder`), both working directly in this
checkout and pushing to `origin` (`https://github.com/carcar9626/prompt-architect`). Avoid
rewriting published history (force-push, rebase/amend/squash of pushed commits) anyway, since
Dyad reads/writes the same branch and can be running independently of any given session.
