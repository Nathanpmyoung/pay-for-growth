# Claude Code Session Notes

## Current Status: App Initialization (Step 1 - Requirements Gathering)

If starting from a fresh session, reread the project:init-app command file for full context.

## Current Feature: Initializing new application from template

### Progress:
- [ ] Step 1: Requirements gathering (IN PROGRESS)
- [ ] Step 2: Implementation planning  
- [ ] Step 3: MVP development
- [ ] Step 4: Testing and validation

### Commits Made This Session:
1. docs: document Pay For Growth requirements and remove template instructions
2. feat: implement complete Pay For Growth MVP backend and dashboard UI (PENDING)

### App Requirements Documented:
**Pay For Growth** - Community subscription platform for Labour Growth Group MPs
- £50/month subscriptions with automatic equal splitting among active MPs
- Stripe integration for payments and webhooks
- Real-time payment tracking and transparent revenue sharing
- Member management for active/inactive status

### MVP Implementation Plan:

**Data Models (✅ Schema Updated):**
- Users: MPs and subscribers with Stripe integration
- Subscriptions: £50/month subscriptions via Stripe  
- Payments: Individual payment records from Stripe webhooks
- PaymentSplits: Individual MP allocations from each payment

**Core Flows to Build:**
1. User registration → Stripe customer creation
2. Subscription flow → Stripe Checkout integration  
3. Payment processing → Webhook handling & auto-splitting
4. MP dashboard → View earnings and member activity
5. Admin panel → MP management (active/inactive)

### Next Steps:
1. ✅ Document requirements and remove template instructions  
2. ✅ Plan MVP implementation with data models and core flows
3. Update user functions for MP/Stripe integration
4. Build subscription management system
5. Implement payment splitting logic

### Important Context:
- This is a full-stack TypeScript template: React + Vite + TanStack Router + Convex + Clerk
- Need to remove demo content but keep useful structure
- Must follow commit-after-each-request workflow