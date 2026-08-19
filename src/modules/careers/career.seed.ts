import mongoose from "mongoose";
import { connectDatabase } from "../../config/database.js";
import { CareerRole } from "./career.model.js";

const SEED_CAREERS = [
  {
    title: "AI Product Engineer",
    slug: "ai-product-engineer",
    category: "Engineering & Applied AI",
    matchScore: 94,
    description:
      "Bridge model inference and production software systems. Build resilient generative AI agent workflows and delightful UX for enterprise users.",
    salaryRange: "$145,000 - $190,000",
    growthRate: "+38% YoY",
    skills: ["TypeScript", "Python", "LLMs", "Vector DBs", "React"],
    educationLevel: "Bachelor's degree or equivalent proof of work",
    overview:
      "AI Product Engineers work across the full stack to build intelligence-infused software interfaces and autonomous agent pipelines.",
  },
  {
    title: "Lead Design Engineer",
    slug: "lead-design-engineer",
    category: "Product & UI Systems",
    matchScore: 89,
    description:
      "Craft modern, frictionless user interfaces with exceptional craft, mathematical spacing, accessible components, and resilient front-end architecture.",
    salaryRange: "$130,000 - $175,000",
    growthRate: "+24% YoY",
    skills: ["Design Systems", "Tailwind CSS", "React", "Figma", "Accessibility"],
    educationLevel: "Portfolio & technical assessment",
    overview:
      "Design Engineers sit at the intersection of design direction and production engineering, ensuring pixel-level fidelity and design system scalability.",
  },
  {
    title: "Career Growth Strategist",
    slug: "career-growth-strategist",
    category: "Strategy & Advisory",
    matchScore: 82,
    description:
      "Analyze workforce shifts and help professionals navigate industry transitions through data-driven milestone planning.",
    salaryRange: "$110,000 - $155,000",
    growthRate: "+18% YoY",
    skills: ["Workforce Analytics", "Coaching", "Pathway Mapping", "SQL"],
    educationLevel: "Bachelor's or Master's in Business/Social Sciences",
    overview:
      "Career Growth Strategists empower individuals and organizations to adapt to technological shifts through strategic workforce pathway modeling.",
  },
  {
    title: "Cloud Infrastructure Architect",
    slug: "cloud-infrastructure-architect",
    category: "Cloud & DevOps",
    matchScore: 86,
    description:
      "Architect resilient, scalable multi-cloud infrastructure, CI/CD automated deployment pipelines, and high-availability distributed systems.",
    salaryRange: "$150,000 - $205,000",
    growthRate: "+29% YoY",
    skills: ["Kubernetes", "AWS", "Terraform", "Docker", "Security"],
    educationLevel: "Bachelor's degree in CS or equivalent experience",
    overview:
      "Cloud Infrastructure Architects ensure global reliability, automated zero-downtime deployments, and zero-trust security postures.",
  },
];

const runSeed = async () => {
  try {
    console.log("🌱 Connecting to MongoDB for database seed...");
    await connectDatabase();

    console.log("🧹 Clearing existing CareerRole documents...");
    await CareerRole.deleteMany({});

    console.log("🚀 Inserting initial Edupac career roles...");
    await CareerRole.insertMany(SEED_CAREERS);

    console.log(`✅ Seed complete: ${SEED_CAREERS.length} career pathways created successfully!`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

runSeed();
