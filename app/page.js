import React from "react";
import HeroSection from "@/components/hero";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-12 bg-muted/50 border-y border-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, index) => (
            <div key={index} className="p-4">
              <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Futuristic Earth Poster Section */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            Global Scale Intelligence
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mt-3 mb-2">
            Global Financial Awareness
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Monitor and manage your financial assets securely from anywhere across the globe.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card aspect-video group">
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"
              alt="Futuristic Earth from Space"
              fill
              priority
              className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Dashboard Analytics Preview Section */}
      <section className="pb-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Real-Time Insights
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mt-3 mb-2">
            Clarity in Every Transaction
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Get a comprehensive visual breakdown of your income, expenses, and savings goals at a glance.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card aspect-video group">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop"
              alt="Dashboard Analytics Preview"
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Everything You Need To Master Your Money
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Powerful AI-driven features designed to save you time and maximize your savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <Card
              key={index}
              className="p-6 border-border bg-card backdrop-blur-xl hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group"
            >
              <CardContent className="p-0 space-y-4">
                <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-12">
            How Wealth AI Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-2xl border border-border shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all"
              >
                <span className="text-6xl font-black text-muted-foreground/15 absolute right-4 top-2 group-hover:text-blue-500/20 transition-colors">
                  0{index + 1}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-16">
          Loved by Thousands of Users
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 bg-card border-border backdrop-blur-xl shadow-md"
            >
              <CardContent className="p-0 space-y-4">
                <p className="text-muted-foreground italic text-sm">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-950 dark:via-indigo-950 dark:to-slate-950 text-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-blue-100 dark:text-blue-200 text-lg max-w-xl mx-auto">
            Join thousands of smart individuals managing their personal finances effortlessly with Wealth AI.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8 py-6 rounded-xl shadow-xl shadow-black/10 transition-all">
                Start Free Trial Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}