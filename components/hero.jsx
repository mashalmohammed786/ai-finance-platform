"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-36 pb-20 px-4 overflow-hidden bg-background text-foreground">
      {/* Background Animated Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto text-center relative z-10 max-w-5xl">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/80 backdrop-blur-md text-xs font-semibold text-blue-600 dark:text-blue-400 mb-8 shadow-sm">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>Next-Gen Smart Wealth Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-[90px] font-extrabold tracking-tight pb-6 text-foreground leading-none">
          Manage Your Finances <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            with Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-8 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base font-semibold border-border bg-background text-foreground hover:bg-muted rounded-xl backdrop-blur-sm"
            >
              Learn More
            </Button>
          </Link>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl border border-border bg-card backdrop-blur-xl hover:border-blue-500/40 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group">
            <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Real-Time Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated category breakdowns and income vs. expense analytics instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card backdrop-blur-xl hover:border-indigo-500/40 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group">
            <div className="p-3 rounded-xl bg-indigo-500/10 w-fit mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">AI Receipt Scanning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Parse receipt details automatically without typing a single field manually.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card backdrop-blur-xl hover:border-cyan-500/40 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 group">
            <div className="p-3 rounded-xl bg-cyan-500/10 w-fit mb-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Multi-Account Sync</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track business vs. personal scopes safely in one dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}