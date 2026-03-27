import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure your database URL."
  );
}

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.blockedDate.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.project.deleteMany();
  console.log("Cleared existing data");

  await prisma.property.create({
    data: {
      slug: "departamento-centro-santiago",
      name: "Departamento Centro Santiago",
      description:
        "Hermoso departamento en Santiago Centro. Ideal para parejas o familias.",
      location: "Santiago Centro",
      pricePerNight: 45000,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      ],
      amenities: ["WiFi", "TV", "Cocina", "Lavadora"],
      isActive: true,
    },
  });

  await prisma.property.create({
    data: {
      slug: "casa-providencia",
      name: "Casa Moderna Providencia",
      description:
        "Increíble casa de dos pisos en Providencia con jardín y quincho.",
      location: "Providencia",
      pricePerNight: 85000,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      ],
      amenities: ["WiFi", "TV", "Quincho", "Jardín", "Estacionamiento"],
      isActive: true,
    },
  });

  await prisma.property.create({
    data: {
      slug: "depto-vina-del-mar",
      name: "Depto Vista al Mar Viña",
      description: "Precioso departamento frente al mar en Viña del Mar.",
      location: "Viña del Mar",
      pricePerNight: 65000,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 2,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      ],
      amenities: ["WiFi", "Piscina", "Vista al mar", "Terraza"],
      isActive: true,
    },
  });

  console.log("Created 3 properties");

  await prisma.project.create({
    data: {
      slug: "remodelacion-cocina-moderna",
      title: "Remodelación Cocina Moderna",
      description:
        "Remodelación completa de cocina con diseño moderno y materiales de calidad.",
      category: "cocina",
      area: 15,
      duration: 21,
      beforeImages: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200",
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=1200",
      ],
      isActive: true,
    },
  });

  await prisma.project.create({
    data: {
      slug: "bano-principal-elegante",
      title: "Baño Principal Elegante",
      description:
        "Transformación de baño anticuado en espacio moderno y elegante.",
      category: "baño",
      area: 8,
      duration: 14,
      beforeImages: [
        "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200",
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200",
      ],
      isActive: true,
    },
  });

  await prisma.project.create({
    data: {
      slug: "vivienda-familiar-completa",
      title: "Vivienda Familiar Completa",
      description: "Remodelación integral de casa de 120m² para familia.",
      category: "vivienda_completa",
      area: 120,
      duration: 60,
      beforeImages: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      ],
      isActive: true,
    },
  });

  await prisma.project.create({
    data: {
      slug: "terraza-exterior",
      title: "Terraza Exterior Moderna",
      description: "Terraza con deck, pérgola y zona de BBQ.",
      category: "exterior",
      area: 25,
      duration: 18,
      beforeImages: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      ],
      isActive: true,
    },
  });

  console.log("Created 4 projects");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
