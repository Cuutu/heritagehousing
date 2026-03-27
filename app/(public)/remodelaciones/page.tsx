export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
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
    <div>
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Remodelaciones
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Obra y diseño
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Proyectos reales, materiales pensados para durar y un proceso claro
              de principio a fin.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 md:px-6 md:py-20">
        {formattedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 py-20 text-center">
            <p className="text-muted-foreground">
              No hay proyectos disponibles en este momento.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {formattedProjects.length}{" "}
              {formattedProjects.length === 1 ? "proyecto" : "proyectos"}
            </p>
            <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {formattedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>

      <section
        id="contacto"
        className="scroll-mt-24 border-t border-border/40 bg-muted/20"
      >
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Contanos tu idea
            </h2>
            <p className="mt-3 text-muted-foreground">
              Respondemos con una primera lectura del proyecto y próximos pasos.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-10">
            <LeadForm />
          </div>
        </div>
      </section>
    </div>
  );
}
