// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Find your logged-in user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found. Please log in first.");
    return;
  }

  // Create a default account if none exists
  let account = await prisma.account.findFirst({ where: { userId: user.id } });
  if (!account) {
    account = await prisma.account.create({
      data: {
        name: "Main Checking",
        type: "CHECKING",
        balance: 5000,
        isDefault: true,
        userId: user.id,
      },
    });
  }

  // Add dummy transactions
  await prisma.transaction.createMany({
    data: [
      {
        type: "EXPENSE",
        amount: 120.50,
        description: "Grocery Shopping",
        date: new Date(),
        category: "Groceries",
        userId: user.id,
        accountId: account.id,
      },
      {
        type: "INCOME",
        amount: 3000.00,
        description: "Monthly Salary",
        date: new Date(),
        category: "Salary",
        userId: user.id,
        accountId: account.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());