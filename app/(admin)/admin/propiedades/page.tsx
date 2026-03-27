import { getAllProperties } from "@/lib/repositories/property.repository";
import { PropertiesAdminClient } from "@/components/admin/PropertiesAdminClient";

export default async function AdminPropertiesPage() {
  const list = await getAllProperties();
  const rows = list.map((p) => ({
    ...p,
    pricePerNight: Number(p.pricePerNight),
  }));

  return <PropertiesAdminClient initialProperties={rows} />;
}
