# Mail-to-Ticket Converter Specs

## Purpose

Convert incoming emails into trackable support tickets so team members can triage, assign, prioritize, and resolve issues without leaving the mail tooling ecosystem.

## Scope

- Release tier: V2
- Audience: Team
- Folder ownership: `tools/v2/team/mail-to-ticket-converter/`
- Integration status: Isolated — not wired into main app

This is a self-contained tooling workspace. Do not wire this tool into the main app, routing, inbox architecture, wallet core, Stellar core, or design system unless a future integration issue explicitly allows it.

## In-Scope Behavior

- View a list of unconverted emails from fixtures
- Create a ticket from an email with adjustable subject, description, priority, category, and optional assignee
- View a list of tickets with status, priority, assignment, and resolution info
- Advance ticket status: open → in-progress → resolved → closed (reopenable)
- Assign tickets to team members via a dropdown
- View aggregate metrics: total, by status, by priority, by category, average resolution time
- In-memory state management with loading/empty/error/success states

## Out-of-Scope Behavior

- No real email fetching (SMTP/IMAP) — fixture-only
- No database persistence — ephemeral in-memory data
- No authentication, authorization, or user identity
- No notification system for assignments or status changes
- No search, filter, or pagination
- No undo for ticket creation
- No attachment upload or preview
- No real-time updates or WebSocket
- No integration with the main mail app inbox, routing, or design system

## Data Contract

```typescript
type Priority = "low" | "medium" | "high" | "critical";

type TicketStatus = "open" | "in-progress" | "resolved" | "closed";

type TicketCategory = "bug" | "feature-request" | "support" | "billing" | "other";

interface EmailSender {
  name: string;
  email: string;
}

interface Email {
  id: string;
  threadId: string;
  from: EmailSender;
  to: EmailSender;
  subject: string;
  body: string;
  receivedAt: string; // ISO 8601
  hasAttachments: boolean;
}

interface CreateTicketInput {
  subject: string;
  description: string;
  priority: Priority;
  category: TicketCategory;
  assignedTo?: string; // TeamMember.id
  createdBy: string; // TeamMember.id
}

interface Ticket {
  id: string;
  emailId: string;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  category: TicketCategory;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolution: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<TicketCategory, number>;
  averageResolutionTimeHours: number | null;
}
```

## Required Issue Categories

- Architecture
- Feature
- UI and accessibility
- Security and performance
- Testing and documentation
