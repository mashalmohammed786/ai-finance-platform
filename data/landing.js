import React from "react";
import { BarChart, Receipt, PieChart, Wallet } from "lucide-react";

export const statsData = [
  {
    value: "50K+",
    label: "Active Users",
  },
  {
    value: "$2B+",
    label: "Transactions Tracked",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.9/5",
    label: "User Rating",
  },
];

export const featuresData = [
  {
    icon: <BarChart className="h-6 w-6" />,
    title: "Advanced Analytics",
    description:
      "Get deep insights into your spending patterns with AI-powered analytics and customizable reports.",
  },
  {
    icon: <Receipt className="h-6 w-6" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract transaction details automatically from receipts using Google Gemini AI technology.",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    title: "Budget Planning",
    description:
      "Set intelligent budgets and receive automated alerts when approaching limits.",
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Multi-Account Support",
    description:
      "Manage multiple accounts and track expenses manually or via AI receipt scanning in one place.",
  },
];

export const howItWorksData = [
  {
    icon: "UserPlus",
    title: "1. Create Account",
    description:
      "Sign up in seconds with Clerk and secure your financial data instantly.",
  },
  {
    icon: "Wallet",
    title: "2. Track Expenses",
    description:
      "Set up your financial accounts and log transactions manually or instantly using AI receipt scanning.",
  },
  {
    icon: "Zap",
    title: "3. Get AI Insights",
    description:
      "Receive automated recommendations to optimize your spending and increase savings.",
  },
];

export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "This platform completely transformed how I manage my business expenses. The receipt scanner alone saves me hours every month!",
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "The AI insights are top-notch. It caught recurring subscriptions I had forgotten about and saved me hundreds of dollars.",
  },
];