import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/header"; // or "@/components/header"
import { Toaster } from "sonner"; 
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}