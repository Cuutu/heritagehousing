export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Hammer } from "lucide-react";
import { ProjectCard } from "@/components/renovation/ProjectCard";
import { LeadForm } from "@/components/renovation/LeadForm";

export default async function RenovationsPage() {
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedProjects = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    area: p.area,
    beforeImages: p.beforeImages,
    afterImages: p.afterImages,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Hammer className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Remodelaciones</h1>
        </div>
        <p className="text-muted-foreground">
          Conocé nuestros proyectos de remodelación y transformación de espacios
        </p>
      </div>

      {formattedProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No hay proyectos disponibles en este momento.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {formattedProjects.length} proyecto
            {formattedProjects.length !== 1 ? "s" : ""} encontrado
            {formattedProjects.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {formattedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}

      <section id="contacto" className="scroll-mt-24">
        <div className="bg-muted/50 rounded-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              ¿Tenés un proyecto en mente?
            </h2>
            <p className="text-muted-foreground">
              Completá el formulario y te contactamos para discutir tu idea
            </p>
          </div>
          <LeadForm />
        </div>
      </section>
    </div>
  );
}
