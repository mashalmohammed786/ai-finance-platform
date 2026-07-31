import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const dynamic = "force-dynamic"; // <--- Add this line to prevent static prerendering errors

export const metadata = {
  title: "Wealth AI - Smart Financial Management",
  description: "AI-powered financial platform to track, analyze, and optimize spending.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="scroll-smooth">
        <body className="antialiased bg-background text-foreground min-h-screen selection:bg-blue-500 selection:text-white transition-colors duration-300">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Ambient FinTech Glow Nodes */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] dark:opacity-100 opacity-30" />
              <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] dark:opacity-100 opacity-30" />
            </div>

            {/* Global Background & Layout Container */}
            <div className="relative flex flex-col min-h-screen z-10">
              <Header />
              <main className="flex-1 pt-16">{children}</main>
              <Toaster richColors position="top-right" />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}