import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Sparkles } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "./theme-toggle"; // Import ThemeToggle

export default async function Header() {
  // Automatically syncs user with database on header load
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 transition-colors duration-300">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
            <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-blue-600 dark:from-white dark:via-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
            Wealth
          </span>
        </Link>

        {/* Navigation & Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* 🟢 Shown ONLY when user is logged in */}
          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl backdrop-blur-sm transition-all"
              >
                <LayoutDashboard size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="hidden md:inline font-medium">Dashboard</span>
              </Button>
            </Link>

            <Link href="/transaction/create">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/20">
                <PenBox size={18} />
                <span className="hidden md:inline font-medium">Add Transaction</span>
              </Button>
            </Link>

            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border border-slate-200 dark:border-slate-700/80 rounded-full",
                },
              }}
            />
          </SignedIn>

          {/* ❌ Shown ONLY when user is logged out */}
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="outline"
                className="border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl"
              >
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton forceRedirectUrl="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/20">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}