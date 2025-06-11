import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    priceId: v.string(),
    amount: v.number(),
    currency: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const subscriptionId = await ctx.db.insert("subscriptions", args);
    return await ctx.db.get(subscriptionId);
  },
});

export const updateSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, { stripeSubscriptionId, ...updates }) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId)
      )
      .unique();

    if (!subscription) {
      throw new ConvexError("Subscription not found");
    }

    await ctx.db.patch(subscription._id, updates);
    return await ctx.db.get(subscription._id);
  },
});

export const getUserSubscriptions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return subscriptions;
  },
});

export const getCurrentUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return subscriptions;
  },
});

export const getActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return activeSubscriptions;
  },
});

export const getSubscriptionByStripeId = query({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId)
      )
      .unique();
    return subscription;
  },
});