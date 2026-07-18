# Mail-to-Ticket Converter

Convert incoming emails into trackable support tickets for team triage and resolution.

## Ownership Boundary

All work for this tool must stay inside:

```
tools/v2/team/mail-to-ticket-converter/
```

Do not wire this tool into the main app, routing, inbox architecture, wallet core, Stellar core, database schema, or existing design system unless a future integration issue explicitly allows it.

## Tool Workflow

1. View unconverted emails in the **Inbox** tab
2. Click **Convert** on an email to open the ticket creation form
3. Adjust subject, description, priority, category, and assignee
4. Submit to create a ticket — the email is removed from the inbox
5. View and manage tickets in the **Tickets** tab
6. Advance ticket status (open → in-progress → resolved → closed)
7. Assign tickets to team members
8. View aggregate metrics in the **Metrics** tab

## States

| State   | Appearance                                                                |
| ------- | ------------------------------------------------------------------------- |
| Loading | Centered skeleton text with `aria-busy="true"`                            |
| Empty   | Dashed border container with message (no unconverted emails / no tickets) |
| Error   | Red-tinted banner with error message and Retry button (`role="alert"`)    |
| Success | Fully rendered data with interactive controls                             |

## Accessibility

- `role="tablist"`, `role="tab"`, `role="tabpanel"` for tab navigation
- `role="list"` / `role="listitem"` for lists
- `role="alert"` for error banners
- `aria-selected` on active tab
- `aria-busy` on loading states and submit buttons
- `aria-label` on all interactive controls
- `sr-only` labels on select elements

## Visual Style

Components use Tailwind CSS v4 dark-theme tokens from the global design system:

- `--accent`, `--surface-primary`, `--surface-secondary`, `--border-subtle`
- `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`
- Status badges: yellow (open), blue (in-progress), green (resolved), gray (closed)
- Priority indicators: green (low), yellow (medium), orange (high), red (critical)

## Fixtures

| File                           | Contents                                    |
| ------------------------------ | ------------------------------------------- |
| `fixtures/sample-emails.json`  | 5 synthetic emails from external senders    |
| `fixtures/sample-tickets.json` | 4 pre-converted tickets in various statuses |
| `fixtures/team-members.json`   | 5 team support members                      |

## Documentation Map

- `specs.md` — Data contracts, in/out-of-scope behavior, required issue categories
- `docs/test-plan.md` — Automated test coverage and manual review checklist
- `docs/review-notes.md` — Validated behavior, known limitations, future integration notes

## Tests

Run from repo root:

```bash
node --test "tools/v2/team/mail-to-ticket-converter/tests/*.test.mjs"
```

Tests validate fixture integrity and `computeMetrics` business logic using Node's built-in test runner.

## Known Limitations

- No real email fetching — uses local JSON fixtures
- No database persistence — data is in-memory only
- No authentication or authorization
- No search, filter, or pagination
- No attachment handling beyond the boolean flag
- Not wired into the main application
