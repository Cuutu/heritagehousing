import { prisma } from "@/lib/prisma";
import { PropertyInput, PropertyFilter } from "@/lib/validations/property.schema";
import { PaymentStatus, Prisma } from "@prisma/client";

export async function getActiveProperties() {
  return prisma.property.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllProperties() {
  return prisma.property.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({
    where: { slug, isActive: true },
    include: {
      blockedDates: {
        where: {
          date: { gte: new Date() },
        },
        select: { date: true, source: true },
      },
    },
  });
}

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      blockedDates: true,
      reservations: {
        where: {
          checkOut: { gte: new Date() },
          paymentStatus: PaymentStatus.PAID,
        },
      },
    },
  });
}

export async function getFilteredProperties(filter: PropertyFilter) {
  const { checkIn, checkOut, guests, location } = filter;

  const where: Prisma.PropertyWhereInput = {
    isActive: true,
  };

  if (guests) {
    where.maxGuests = { gte: guests };
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  let propertyIds: string[] | undefined;

  if (checkIn && checkOut) {
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PAID] },
        OR: [
          {
            checkIn: { lte: checkOut },
            checkOut: { gte: checkIn },
          },
        ],
      },
      select: { propertyId: true },
    });

    propertyIds = conflictingReservations.map((r) => r.propertyId);
  }

  const properties = await prisma.property.findMany({
    where: {
      ...where,
      id: propertyIds ? { notIn: propertyIds } : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  if (checkIn && checkOut) {
    const blockedPropertyIds = await prisma.blockedDate.findMany({
      where: {
        date: {
          gte: checkIn,
          lte: checkOut,
        },
      },
      select: { propertyId: true },
    });

    const blockedIds = new Set(blockedPropertyIds.map((b) => b.propertyId));
    return properties.filter((p) => !blockedIds.has(p.id));
  }

  return properties;
}

export async function createProperty(data: PropertyInput) {
  return prisma.property.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      location: data.location,
      mapAddress: data.mapAddress?.trim() || null,
      googleMapsLink: data.googleMapsLink?.trim() || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      pricePerNight: data.pricePerNight,
      maxGuests: data.maxGuests,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      images: data.images,
      amenities: data.amenities,
      airbnbIcalUrl: data.airbnbIcalUrl || null,
      bookingIcalUrl: data.bookingIcalUrl || null,
      isActive: data.isActive,
    },
  });
}

export async function updateProperty(id: string, data: Partial<PropertyInput>) {
  return prisma.property.update({
    where: { id },
    data: {
      ...data,
      mapAddress:
        data.mapAddress === undefined
          ? undefined
          : data.mapAddress?.trim() || null,
      googleMapsLink:
        data.googleMapsLink === undefined
          ? undefined
          : data.googleMapsLink?.trim() || null,
      latitude: data.latitude === undefined ? undefined : data.latitude ?? null,
      longitude:
        data.longitude === undefined ? undefined : data.longitude ?? null,
      airbnbIcalUrl: data.airbnbIcalUrl || null,
      bookingIcalUrl: data.bookingIcalUrl || null,
    },
  });
}

export async function deleteProperty(id: string) {
  return prisma.property.delete({
    where: { id },
  });
}
