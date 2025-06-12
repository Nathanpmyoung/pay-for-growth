import {
  ClerkProvider,
  useAuth as useClerkAuth,
} from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  ConvexReactClient,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient, convexClient: convex } = Route.useRouteContext();

  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useClerkAuth}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col">
            {/* Temporarily disable authentication - show content for everyone */}
            <div>
              {/* Top bar matching LFG style */}
              <nav className="top-bar sticky top-0 z-50 flex items-center justify-between p-4 shadow-md">
                <div className="flex items-center gap-6">
                  <Link to="/" className="text-xl font-bold text-white">
                    PFG
                  </Link>
                  <div className="hidden lg:flex items-center gap-4">
                    <Link to="/" className="text-white hover:text-gray-200">
                      Dashboard
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Authentication disabled for now */}
                  <span className="text-white text-sm">Coming Soon</span>
                </div>
              </nav>
              <main className="flex-1 container mx-auto p-4 prose prose-invert max-w-none">
                <Outlet />
              </main>
            </div>
          </div>
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

