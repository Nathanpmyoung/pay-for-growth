import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth as useClerkAuth,
  useUser,
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
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
  useMutation,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient, convexClient: convex } = Route.useRouteContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useClerkAuth}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col">
            <Authenticated>
              <EnsureUser />
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
                  <UserButton />
                </div>
              </nav>
              <main className="flex-1 container mx-auto p-4 prose prose-invert max-w-none">
                <Outlet />
              </main>
            </Authenticated>
            <Unauthenticated>
              {/* Top bar for unauthenticated users */}
              <nav className="top-bar sticky top-0 z-50 flex items-center justify-between p-4 shadow-md">
                <div className="flex items-center gap-6">
                  <Link to="/" className="text-xl font-bold text-white">
                    PFG
                  </Link>
                  <div className="hidden lg:flex items-center gap-4">
                    <a href="#about" className="text-white hover:text-gray-200">
                      About Us
                    </a>
                    <a href="#pledge" className="text-white hover:text-gray-200">
                      Support Levels
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <SignInButton mode="modal">
                    <button className="text-white hover:text-gray-200 font-medium">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="join-us-btn">
                      Join us
                    </button>
                  </SignInButton>
                </div>
              </nav>
              <main className="flex-1 container mx-auto p-4 prose prose-invert max-w-none">
                <Outlet />
              </main>
            </Unauthenticated>
          </div>
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function EnsureUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      void ensureUser();
    }
  }, [isLoaded, isSignedIn, user, ensureUser]);

  return null;
}
