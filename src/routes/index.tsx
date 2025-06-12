import { createFileRoute } from "@tanstack/react-router";
import { Users, DollarSign, TrendingUp, Star, Award, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="text-center">
      <div className="not-prose flex justify-center mb-4">
        <TrendingUp className="w-16 h-16 text-primary" />
      </div>
      <h1>Pay For Growth</h1>
      <p className="text-lg opacity-80 mb-8">Pay money directly to MPs who support growth</p>

      {/* Show landing page content for everyone (auth disabled) */}
      <div className="max-w-4xl mx-auto">
        <p className="text-lg mb-8">Join our community and support Labour Growth Group MPs with transparent revenue sharing.</p>
        
        {/* Pledge Levels */}
        <div className="not-prose mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Support Level</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Growth Starter - £5 */}
            <div className="card bg-base-200 border-2 border-transparent hover:border-primary transition-colors">
              <div className="card-body text-center">
                <Star className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="card-title justify-center text-2xl">Growth Starter</h3>
                <div className="text-4xl font-bold text-primary mb-2">£5</div>
                <p className="text-sm opacity-70 mb-4">per month</p>
                <p className="mb-6">Start your journey supporting growth-focused MPs. Every contribution matters.</p>
                <button className="btn btn-primary w-full">Choose Plan</button>
              </div>
            </div>

            {/* Growing Strong - £50 */}
            <div className="card bg-base-200 border-2 border-primary scale-105 shadow-lg">
              <div className="card-body text-center">
                <div className="badge badge-primary mb-2">Most Popular</div>
                <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="card-title justify-center text-2xl">Growing Strong</h3>
                <div className="text-4xl font-bold text-primary mb-2">£50</div>
                <p className="text-sm opacity-70 mb-4">per month</p>
                <p className="mb-6">Make a significant impact. Your contribution drives real change in growth policy.</p>
                <button className="btn btn-primary w-full">Choose Plan</button>
              </div>
            </div>

            {/* Growth Champion - £500 */}
            <div className="card bg-base-200 border-2 border-transparent hover:border-accent transition-colors">
              <div className="card-body text-center">
                <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="card-title justify-center text-2xl">Growth Champion</h3>
                <div className="text-4xl font-bold text-accent mb-2">£500</div>
                <p className="text-sm opacity-70 mb-4">per month</p>
                <p className="mb-6">Lead the charge for growth. Maximum impact supporting the movement.</p>
                <button className="btn btn-accent w-full">Choose Plan</button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
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
              <p>See exactly where your contribution goes</p>
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
    </div>
  );
}

