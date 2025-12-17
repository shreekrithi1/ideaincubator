# The Innovation Pipeline - Architectural Blueprint

System designed to move abstract concepts through a rigid "Innovation Funnel" — from raw thought to shipped product.

## 1. System Architecture

The application is built as a **Next.js** application integrated with **Prisma ORM** for database management.

### Workflow Stages (Innovation Funnel)
1. **01 Ideation**: Employee submits idea via Spark Portal. AI checks duplicates (Simulated). Status: `DRAFT`.
2. **02 Curation**: Moderator reviews in Control Tower. Status: `MODERATED`.
3. **03 Strategy**: CIO/CTO approves. Status: `EXECUTIVE_REVIEW` -> `IN_DEV`. (To be implemented: Boardroom).
4. **04 Execution**: Synced to JIRA. Status: `IN_DEV`.
5. **05 G2M**: Market Launch methods. Status: `LAUNCHED`.

## 2. Module Implementations

### Module A: The "Spark" Portal
- **Location**: `/` (Home Page)
- **Features**:
  - **Hero Section**: Inspiring entry point.
  - **Idea Feed**: Pinterest-style masonry grid (CSS Grid implemented) displaying latest ideas.
  - **Spark Dialog**: An interactive modal (Framer Motion) that simulates AI duplicate detection as you type.
  - **Gamification**: Visual feedback for innovation points.

### Module B: The "Control Tower"
- **Location**: `/moderator`
- **Features**:
  - **Dashboard**: High-level stats of pending ideas.
  - **Moderator Table**: Bulk actions, status updates, and filtering.
  - **Actions**: Approve (Move to Curated), Reject (Delete), Merge (Simulated).

## 3. Data Model (SQL/Prisma)
Defined in `prisma/schema.prisma`.
- **Idea**: Core entity with `UUID`, `status`, `submitterId`, and `businessValueScore`.
- **Review**: Linked to ideas for audit trails of decisions.

## 4. Technology Stack
- **Frontend**: Next.js 15+ (App Router), React, Framer Motion for animations.
- **Styling**: Vanilla CSS Modules with a "Premium" Design System (Variables in global.css).
- **Backend**: Next.js Server Actions (Node.js runtime).
- **Database**: SQLite (Local Dev) / PostgreSQL (Production Ready).
- **Icons**: Lucide React.

## 5. Next Steps for Integration
1. **Connect JIRA**: Implement Module D (Integrator) using standard REST APIs in `src/lib/jira.ts`.
2. **SSO Integration**: Connect to Enterprise HR module for real `submitterId`.
3. **Vector DB**: Replace simulated `checkDuplicates` with Pinecone/Weaviate integration.
