import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

export const createPayment = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    stripePaymentIntentId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      splitProcessed: false,
    });

    // Process payment split immediately for now
    if (args.status === "succeeded") {
      await ctx.runMutation(internal.payments.processPaymentSplit, {
        paymentId,
      });
    }

    return await ctx.db.get(paymentId);
  },
});

export const updatePaymentStatus = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, { stripePaymentIntentId, status }) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", stripePaymentIntentId)
      )
      .unique();

    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    await ctx.db.patch(payment._id, { status });

    // Trigger payment splitting if payment succeeded and not already processed
    if (status === "succeeded" && !payment.splitProcessed) {
      await ctx.runMutation(internal.payments.processPaymentSplit, {
        paymentId: payment._id,
      });
    }

    return await ctx.db.get(payment._id);
  },
});

export const processPaymentSplit = internalMutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, { paymentId }) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    if (payment.splitProcessed) {
      return; // Already processed
    }

    // Get all active MPs
    const activeMPs = await ctx.db
      .query("users")
      .withIndex("by_activeMP", (q) => q.eq("isMP", true).eq("isActive", true))
      .collect();

    if (activeMPs.length === 0) {
      throw new ConvexError("No active MPs found for payment split");
    }

    // Calculate split amount (equal distribution)
    const splitAmount = Math.floor(payment.amount / activeMPs.length);
    const remainder = payment.amount % activeMPs.length;

    // Create payment splits for each MP
    const splits = [];
    for (let i = 0; i < activeMPs.length; i++) {
      const mp = activeMPs[i];
      // Give remainder to first MP
      const amount = splitAmount + (i === 0 ? remainder : 0);
      
      const splitId = await ctx.db.insert("paymentSplits", {
        paymentId: payment._id,
        mpId: mp._id,
        amount,
        status: "processed",
        processedAt: Date.now(),
      });
      
      splits.push(await ctx.db.get(splitId));
    }

    // Mark payment as split processed
    await ctx.db.patch(payment._id, { splitProcessed: true });

    return splits;
  },
});

export const getPaymentsBySubscription = query({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, { subscriptionId }) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", subscriptionId))
      .collect();
    return payments;
  },
});

export const getPaymentSplits = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, { paymentId }) => {
    const splits = await ctx.db
      .query("paymentSplits")
      .withIndex("by_paymentId", (q) => q.eq("paymentId", paymentId))
      .collect();
    
    // Enrich with MP details
    const enrichedSplits = [];
    for (const split of splits) {
      const mp = await ctx.db.get(split.mpId);
      enrichedSplits.push({
        ...split,
        mp,
      });
    }
    
    return enrichedSplits;
  },
});

export const getMPEarnings = query({
  args: {
    mpId: v.id("users"),
  },
  handler: async (ctx, { mpId }) => {
    const splits = await ctx.db
      .query("paymentSplits")
      .withIndex("by_mpId", (q) => q.eq("mpId", mpId))
      .collect();

    const totalEarnings = splits.reduce((sum, split) => sum + split.amount, 0);
    const paymentsCount = splits.length;

    return {
      totalEarnings,
      paymentsCount,
      splits,
    };
  },
});

export const getCurrentUserEarnings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.isMP) {
      return null;
    }

    const splits = await ctx.db
      .query("paymentSplits")
      .withIndex("by_mpId", (q) => q.eq("mpId", user._id))
      .collect();

    const totalEarnings = splits.reduce((sum, split) => sum + split.amount, 0);
    const paymentsCount = splits.length;

    return {
      totalEarnings,
      paymentsCount,
      splits,
    };
  },
});

export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();
    
    // Enrich with subscription details
    const enrichedPayments = [];
    for (const payment of payments) {
      const subscription = await ctx.db.get(payment.subscriptionId);
      let user = null;
      if (subscription) {
        user = await ctx.db.get(subscription.userId);
      }
      
      enrichedPayments.push({
        ...payment,
        subscription,
        user,
      });
    }
    
    return enrichedPayments;
  },
});