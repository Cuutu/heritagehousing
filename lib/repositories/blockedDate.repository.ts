import { prisma } from "@/lib/prisma";

export async function getBlockedDatesForProperty(propertyId: string) {
  return prisma.blockedDate.findMany({
    where: { propertyId },
    orderBy: { date: "asc" },
  });
}

export async function getBlockedDatesInRange(
  propertyId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.blockedDate.findMany({
    where: {
      propertyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { date: true, source: true },
  });
}

export async function addBlockedDate(
  propertyId: string,
  date: Date,
  source: string = "manual"
) {
  return prisma.blockedDate.upsert({
    where: {
      propertyId_date: {
        propertyId,
        date,
      },
    },
    update: { source },
    create: {
      propertyId,
      date,
      source,
    },
  });
}

export async function addBlockedDates(
  propertyId: string,
  dates: Date[],
  source: string
) {
  const result = await prisma.$transaction(
    dates.map((date) =>
      prisma.blockedDate.upsert({
        where: {
          propertyId_date: {
            propertyId,
            date,
          },
        },
        update: { source },
        create: {
          propertyId,
          date,
          source,
        },
      })
    )
  );

  return result;
}

export async function removeBlockedDate(
  propertyId: string,
  date: Date
) {
  return prisma.blockedDate.deleteMany({
    where: {
      propertyId,
      date,
      source: "manual",
    },
  });
}

export async function clearBlockedDatesFromSource(
  propertyId: string,
  source: string
) {
  return prisma.blockedDate.deleteMany({
    where: {
      propertyId,
      source,
    },
  });
}

export async function getAllBlockedDates(startDate: Date, endDate: Date) {
  return prisma.blockedDate.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
