import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Anuhas2004",
  database: "dolphin_fitness_center",
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.coach.createMany({
    data: [
      {
        name: "Mr. Yasith",
        phone: "0700000001",
        email: "yasith@dolphinfitness.lk",
        specialty: "Strength Training",
        experience: "5 Years",
        description:
          "Specialized in strength training, muscle building, and beginner fitness plans.",
      },
      {
        name: "Mr. Rusiru",
        phone: "0700000002",
        email: "rusiru@dolphinfitness.lk",
        specialty: "Weight Loss & Cardio",
        experience: "4 Years",
        description:
          "Focused on fat loss, cardio programs, and healthy transformation routines.",
      },
      {
        name: "Mr. Gayan",
        phone: "0700000003",
        email: "gayan@dolphinfitness.lk",
        specialty: "Personal Coaching",
        experience: "6 Years",
        description:
          "Experienced in one-to-one coaching and customized body transformation.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Coaches seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });