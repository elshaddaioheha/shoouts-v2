# Features

Each folder in `src/features` should own one business capability (for example: `auth`, `feed`, `profile`).

Recommended per-feature layout:

- `api/` network clients and request mappers
- `components/` feature-scoped UI parts
- `hooks/` feature-scoped React hooks
- `screens/` route-level screen containers
- `services/` orchestration and business workflows
- `types/` feature types and schemas
- `utils/` pure helper functions

Use `_template` as a copy-ready starting point.
