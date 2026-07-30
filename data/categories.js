export const defaultCategories = [
  // Income Categories
  {
    id: "salary",
    name: "Salary",
    type: "INCOME",
    color: "#22c55e", // green-500
    icon: "Briefcase",
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "INCOME",
    color: "#06b6d4", // cyan-500
    icon: "Laptop",
  },
  {
    id: "investments",
    name: "Investments",
    type: "INCOME",
    color: "#6366f1", // indigo-500
    icon: "TrendingUp",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#10b981", // emerald-500
    icon: "PlusCircle",
  },

  // Expense Categories
  {
    id: "housing",
    name: "Housing",
    type: "EXPENSE",
    color: "#ef4444", // red-500
    subcategories: ["Rent", "Mortgage", "Property Tax", "Maintenance"],
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "EXPENSE",
    color: "#f97316", // orange-500
    subcategories: ["Fuel", "Public Transit", "Car Maintenance", "Parking"],
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "EXPENSE",
    color: "#84cc16", // lime-500
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#06b6d4", // cyan-500
    subcategories: ["Electricity", "Water", "Gas", "Internet", "Phone"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    color: "#8b5cf6", // purple-500
    subcategories: ["Movies", "Games", "Streaming Services", "Concerts"],
  },
  {
    id: "food",
    name: "Food & Dining",
    type: "EXPENSE",
    color: "#f43f5e", // rose-500
    subcategories: ["Restaurants", "Fast Food", "Coffee Shops"],
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "EXPENSE",
    color: "#ec4899", // pink-500
    subcategories: ["Clothing", "Electronics", "Home Goods"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    type: "EXPENSE",
    color: "#14b8a6", // teal-500
    subcategories: ["Doctor", "Pharmacy", "Insurance"],
  },
  {
    id: "education",
    name: "Education",
    type: "EXPENSE",
    color: "#3b82f6", // blue-500
    subcategories: ["Tuition", "Books", "Courses"],
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#a855f7", // purple-500
    subcategories: ["Flights", "Hotels", "Activities"],
  },
  {
    id: "other-expense",
    name: "Other Expense",
    type: "EXPENSE",
    color: "#64748b", // slate-500
  },
];

export const categoryColors = defaultCategories.reduce((acc, cat) => {
  acc[cat.id] = cat.color;
  return acc;
}, {});
