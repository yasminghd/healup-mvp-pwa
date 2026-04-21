# Repository Instructions

## Feature Scope Tracking

- Treat `docs/FEATURE_REGISTRY.md` as the source of truth for product scope tracking.
- Keep `config/features.ts` aligned with `docs/FEATURE_REGISTRY.md` as the machine-readable feature status source.
- Every time a feature is added, hidden, restored, disabled, removed, renamed, or moved, update the registry files in the same task.
- When asked to hide or disable a feature for MVP, update both the code and the feature registry automatically.
- Track visible and hidden features, including navigation items, tabs, pages, and major user flows.
- Use explicit statuses unless the implementation clearly requires a better equivalent:
  - `mvp-active`
  - `hidden-kept-for-later`
  - `disabled-no-ui`
  - `deleted`
  - `planned`
  - `needs-review`

## MVP Guardrails

- Future features should usually be hidden or disabled, not deleted.
- Only remove code permanently when the user explicitly requests permanent removal.
- Favor minimal, high-confidence changes that preserve working behavior.
- Keep hidden features easy to restore later.
