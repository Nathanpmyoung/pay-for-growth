import { SignInButton } from "@clerk/clerk-react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Zap, Users, DollarSign, TrendingUp, Crown } from "lucide-react";
import { api } from "../../convex/_generated/api";

const currentUserQueryOptions = convexQuery(api.users.getCurrentUser, {});
const activeMPsQueryOptions = convexQuery(api.users.listActiveMPs, {});
const userEarningsQueryOptions = convexQuery(api.payments.getCurrentUserEarnings, {});

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(currentUserQueryOptions),
      queryClient.ensureQueryData(activeMPsQueryOptions),
      queryClient.ensureQueryData(userEarningsQueryOptions),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  return (
    <div className="text-center">
      <div className="not-prose flex justify-center mb-4">
        <Crown className="w-16 h-16 text-primary" />
      </div>
      <h1>Pay For Growth</h1>
      <p className="text-lg opacity-80 mb-8">Supporting Labour Growth Group MPs through community subscriptions</p>

      <Unauthenticated>
        <div className="max-w-2xl mx-auto">
          <p className="text-lg mb-6">Join our community and support Labour Growth Group MPs with transparent revenue sharing.</p>
          <div className="not-prose mb-8">
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-lg">Get Started</button>
            </SignInButton>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card bg-base-200">
              <div className="card-body">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="card-title text-center">Community Driven</h3>
                <p>Monthly subscriptions split equally among active MPs</p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="card-title text-center">Transparent</h3>
                <p>See exactly where your £50/month subscription goes</p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="card-title text-center">Growth Focused</h3>
                <p>Supporting MPs who champion economic growth</p>
              </div>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <Dashboard />
      </Authenticated>
    </div>
  );
}

function Dashboard() {
  const { data: currentUser } = useSuspenseQuery(currentUserQueryOptions);
  const { data: activeMPs } = useSuspenseQuery(activeMPsQueryOptions);
  const { data: earnings } = useSuspenseQuery(userEarningsQueryOptions);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const formatCurrency = (amountInPence: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amountInPence / 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-left mb-8">
        <h2>Welcome back, {currentUser.name}!</h2>
        
        {currentUser.isMP ? (
          <div className="alert alert-success mb-6">
            <Crown className="w-5 h-5" />
            <span>You're registered as a Labour Growth Group MP</span>
          </div>
        ) : (
          <div className="alert alert-info mb-6">
            <Users className="w-5 h-5" />
            <span>You're supporting Labour Growth Group MPs</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <h3 className="card-title text-2xl">{activeMPs.length}</h3>
                <p className="opacity-70">Active MPs</p>
              </div>
            </div>
          </div>
        </div>

        {currentUser.isMP && earnings && (
          <>
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-success" />
                  <div>
                    <h3 className="card-title text-2xl">{formatCurrency(earnings.totalEarnings)}</h3>
                    <p className="opacity-70">Total Earnings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="card-title text-2xl">{earnings.paymentsCount}</h3>
                    <p className="opacity-70">Payments Received</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!currentUser.isMP && (
        <div className="card bg-base-200 mb-8">
          <div className="card-body text-center">
            <h3 className="card-title justify-center">Start Supporting MPs</h3>
            <p className="mb-4">Subscribe for £50/month to support active Labour Growth Group MPs</p>
            <button className="btn btn-primary btn-lg">Subscribe Now</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Active MPs</h3>
            <div className="space-y-2 mt-4">
              {activeMPs.length === 0 ? (
                <p className="opacity-70">No active MPs currently</p>
              ) : (
                activeMPs.map((mp) => (
                  <div key={mp._id} className="flex items-center gap-3 p-2 bg-base-100 rounded">
                    <Crown className="w-4 h-4 text-primary" />
                    <span>{mp.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {currentUser.isMP && earnings && earnings.splits.length > 0 && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title">Recent Earnings</h3>
              <div className="space-y-2 mt-4">
                {earnings.splits.slice(-5).map((split) => (
                  <div key={split._id} className="flex justify-between items-center p-2 bg-base-100 rounded">
                    <span>{formatCurrency(split.amount)}</span>
                    <span className="text-sm opacity-70">
                      {new Date(split.processedAt || 0).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
