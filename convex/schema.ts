import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema defines your data model for the database.
// For more information, see https://docs.convex.dev/database/schema
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    stripeCustomerId: v.optional(v.string()),
    isMP: v.boolean(), // Whether user is an MP eligible for payment splits
    isActive: v.boolean(), // Whether MP is active for payment distributions
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_activeMP", ["isMP", "isActive"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    status: v.string(), // active, canceled, past_due, etc.
    priceId: v.string(),
    amount: v.number(), // Amount in pence (£50 = 5000)
    currency: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    subscriptionId: v.id("subscriptions"),
    stripePaymentIntentId: v.string(),
    amount: v.number(), // Total amount received in pence
    currency: v.string(),
    status: v.string(), // succeeded, failed, etc.
    paidAt: v.number(),
    splitProcessed: v.boolean(), // Whether payment has been split among MPs
  })
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"])
    .index("by_splitProcessed", ["splitProcessed"]),

  paymentSplits: defineTable({
    paymentId: v.id("payments"),
    mpId: v.id("users"), // The MP receiving this split
    amount: v.number(), // Amount allocated to this MP in pence
    status: v.string(), // pending, processed, failed
    processedAt: v.optional(v.number()),
  })
    .index("by_paymentId", ["paymentId"])
    .index("by_mpId", ["mpId"])
    .index("by_status", ["status"]),
});
