# Buildwise

Praćenje budžeta za gradnju kuće. Spring Boot (Java 21) + PostgreSQL backend, React + TypeScript frontend (Vite).

## Frontend design system — "Nacrt"

The frontend uses one committed light/white visual identity called **Nacrt** (blueprint/technical-drawing inspired). Any new page or component must reuse these tokens instead of introducing new colors, fonts, radii or shadow styles.

### Tokens (`frontend/src/index.css`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#14181f` | primary text |
| `--muted` | `#5b6472` | secondary text |
| `--faint` | `#8a919c` | tertiary text, placeholders |
| `--line` | `#dfe3e8` | all borders/dividers (hairlines, not shadows) |
| `--accent` | `#2b4c7e` | links, active states, primary actions |
| `--accent-tint` | `#eef2f7` | hover backgrounds, progress track |
| `--good` | `#3f7a5c` | positive / paid / under-budget |
| `--danger` | `#b6482f` | destructive actions / over-budget |
| `--bg` | `#ffffff` | page background (always white — no dark mode) |

### Typography

- **IBM Plex Sans** — headings, body, UI text.
- **IBM Plex Mono** — all numbers (money, dates, IDs), section eyebrows, and ghost-button labels. Always `font-variant-numeric: tabular-nums` for money/columns of digits.
- Loaded via Google Fonts `<link>` in `frontend/index.html`.

### Look & feel rules

- **Hairlines, not shadows.** Borders (`1px solid var(--line)`) separate content, not `box-shadow`. Border radius stays small (2–3px) — nothing pill-shaped or heavily rounded.
- **Uppercase mono labels** for section eyebrows (see `.nc-section-label`) and stat/table headers — letter-spacing ~0.1em.
- Money and other tabular figures render in `--mono` with `tabular-nums`.
- Category icons are custom line-art SVGs (`frontend/src/components/CategoryIcon.tsx`), not emoji — consistent rendering across OS/browsers. Add new categories to `ICON_BY_NAME` in that file; unmapped names fall back to `icon-default`.

### Reusable CSS classes (`frontend/src/index.css`)

- `.nc-section-label` — eyebrow + trailing hairline rule, used above any list/grid.
- `.nc-grid` / `.nc-tile` / `.nc-tile-icon` / `.nc-tile-name` / `.nc-add` — the category-style tile grid (shared hairline borders between cells).
- `.nc-detail` / `.nc-detail-head` / `.nc-detail-body` — bordered "spec sheet" detail panel (see `CategoryDetail.tsx`, `ExpenseDetail.tsx`).
- `.nc-stats` / `.nc-stat` — two-column bordered stat block with mono values.
- `.nc-progress` (add `.is-over` when over budget) — thin flat progress bar.
- `.nc-table` / `.nc-row` — bordered row list (subcategories, expense fields).
- `.nc-btn` (add `.nc-btn-danger` for destructive, `.nc-btn-icon` for compact) — ghost mono button, apply via `className` on an AntD `Button`.
- `.nc-tag` (add `.is-good` for paid/positive) — small bordered status tag.
- `.nc-back` — back-link style used at the top of detail pages.

### Ant Design

AntD is the component library for forms, modals, tables, selects, etc. Global tokens are configured once in `frontend/src/App.tsx` (`NACRT_THEME`) — every AntD component picks up the Nacrt palette, font and border radius automatically. Don't override AntD component colors/radius locally; adjust `NACRT_THEME` instead so the change applies app-wide. Use plain AntD `Button` styled with `className="nc-btn"` for the ghost-style actions described above instead of AntD's own button types when matching the spec-sheet look.

No dark mode: the app intentionally commits to one white theme, so don't add `prefers-color-scheme` overrides.
