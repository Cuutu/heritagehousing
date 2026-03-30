import { prisma } from "@/lib/prisma";
import { PropertiesAdminClient } from "@/components/admin/PropertiesAdminClient";

export default async function AdminPropertiesPage() {
  const list = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { propertyImages: { orderBy: { order: "asc" } } },
  });
  const rows = list.map((p) => ({
    ...p,
    pricePerNight: Number(p.pricePerNight),
  }));

  return <PropertiesAdminClient initialProperties={rows} />;
}
