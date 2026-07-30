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
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, index) => (
            <div key={index} className="p-4">
              <p className="text-4xl font-extrabold text-blue-600 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Everything You Need To Master Your Money
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Powerful AI-driven features designed to save you time and maximize your savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <Card key={index} className="p-6 border-slate-200/80 hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-0 space-y-4">
                <div className="p-3 w-fit rounded-xl bg-slate-100">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How Wealth AI Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
                <span className="text-5xl font-black text-blue-100 absolute right-6 top-6">
                  0{index + 1}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
          Loved by Thousands of Users
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-white border-slate-200 shadow-sm">
              <CardContent className="p-0 space-y-4">
                <p className="text-slate-600 italic text-sm">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Join thousands of smart individuals managing their personal finances effortlessly with Wealth AI.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 shadow-xl">
                Start Free Trial Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}