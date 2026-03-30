import { prisma } from "@/lib/prisma";
import { ProjectsAdminClient } from "@/components/admin/ProjectsAdminClient";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { projectImages: { orderBy: { order: "asc" } } },
  });

  return <ProjectsAdminClient initialProjects={projects} />;
}
