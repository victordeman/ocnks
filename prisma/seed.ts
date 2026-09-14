import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const serviceLines = [
  {
    slug: "supplies",
    name: "Supplies",
    summary: "Industrial and drilling chemicals, consumables, and materials.",
    details:
      "Sourcing and supply of industrial and drilling chemicals, site consumables, and materials for oil & gas, utilities, and industrial operations. Direct from producers and vetted OEM partners, with performance, standards, and interoperability evaluated before selection.",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "procurement",
    name: "Procurement & Supplies",
    summary: "Pipes, beams, rods, and irons.",
    details:
      "Procurement and supply of pipes, beams, rods, and irons for construction and industrial projects, sourced directly from producers and OEM partners to specification and schedule.",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "civil-engineering",
    name: "Civil Engineering",
    summary: "Buildings, warehouses, and renovations.",
    details:
      "Design and delivery of buildings, warehouses, and renovation works — from groundwork to handover — with clients involved from the beginning and meticulous, cost-effective execution.",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "electrical-engineering",
    name: "Electrical Engineering",
    summary: "Transformers, fittings, cables, and wirings.",
    details:
      "Supply, installation, and maintenance of transformers, fittings, cables, and wirings for industrial and built-environment clients.",
    active: true,
    sortOrder: 4,
  },
  {
    slug: "mechanical-engineering",
    name: "Mechanical Engineering",
    summary: "Generators and maintenance.",
    details:
      "Generator supply, installation, and preventive/corrective maintenance programs that keep critical plant running.",
    active: true,
    sortOrder: 5,
  },
  {
    slug: "support-services",
    name: "Support Services",
    summary: "Cleaning and launderette.",
    details:
      "Professional cleaning and launderette support services for facilities, camps, and industrial sites, delivered by trained, customer-friendly staff.",
    active: true,
    sortOrder: 6,
  },
  {
    slug: "manpower-development",
    name: "Manpower Development",
    summary: "Personnel, training, and empowerment.",
    details:
      "Provision of personnel, structured training, and empowerment programs that build capable teams for our clients' operations.",
    active: true,
    sortOrder: 7,
  },
  {
    slug: "general-contract",
    name: "General Contract",
    summary: "General contracting across our service lines.",
    details:
      "General contracting that combines our supply, procurement, and engineering capabilities under a single accountable delivery structure.",
    active: true,
    sortOrder: 8,
  },
  {
    slug: "specialist-services",
    name: "Specialist Services",
    summary:
      "Analysis, engineering, procurement, integration, testing, installation, decontamination, industrial cleaning, and commissioning.",
    details:
      "Specialist technical services including analysis, engineering, procurement, integration, testing, installation, biohazard decontamination, industrial cleaning, and commissioning / O&M of ICT and PCII (process control and instrumentation infrastructure), spare parts, and software upgrades.",
    active: true,
    sortOrder: 9,
  },
];

async function main() {
  for (const item of serviceLines) {
    await prisma.serviceLine.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        summary: item.summary,
        details: item.details,
        active: item.active,
        sortOrder: item.sortOrder,
      },
      create: item,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
