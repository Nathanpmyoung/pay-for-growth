import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Update name and email if they have changed in Clerk
      const clerkName = identity.name ?? "Anonymous";
      const clerkEmail = identity.email ?? "";
      if (existingUser.name !== clerkName || existingUser.email !== clerkEmail) {
        await ctx.db.patch(existingUser._id, { 
          name: clerkName,
          email: clerkEmail 
        });
        return await ctx.db.get(existingUser._id);
      }
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      isMP: false, // Default to false, will be set by admin
      isActive: false, // Default to false
    });

    return await ctx.db.get(userId);
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const listActiveMPs = query({
  args: {},
  handler: async (ctx) => {
    const activeMPs = await ctx.db
      .query("users")
      .withIndex("by_activeMP", (q) => q.eq("isMP", true).eq("isActive", true))
      .collect();
    return activeMPs;
  },
});

export const getCurrentUser = query({
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

    return user;
  },
});

export const updateMPStatus = mutation({
  args: {
    userId: v.id("users"),
    isMP: v.boolean(),
    isActive: v.boolean(),
  },
  handler: async (ctx, { userId, isMP, isActive }) => {
    // TODO: Add admin authorization check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    await ctx.db.patch(userId, {
      isMP,
      isActive,
    });

    return await ctx.db.get(userId);
  },
});

export const updateStripeCustomerId = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { userId, stripeCustomerId }) => {
    await ctx.db.patch(userId, {
      stripeCustomerId,
    });

    return await ctx.db.get(userId);
  },
});
