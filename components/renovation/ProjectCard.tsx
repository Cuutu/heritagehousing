import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    title: string;
    category: string;
    area?: number | null;
    beforeImages: string[];
    afterImages: string[];
  };
}

const categoryLabels: Record<string, string> = {
  cocina: "Cocina",
  baño: "Baño",
  vivienda_completa: "Vivienda completa",
  exterior: "Exterior",
  oficina: "Oficina",
  comercial: "Comercial",
  otro: "Otro",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const mainBefore = project.beforeImages[0];
  const mainAfter = project.afterImages[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 transition-shadow duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        {mainBefore && mainAfter ? (
          <BeforeAfterSlider
            beforeImage={mainBefore}
            afterImage={mainAfter}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Sin imágenes
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {categoryLabels[project.category] || project.category}
          </span>
          {project.area && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {project.area} m²
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight line-clamp-2">
          <Link
            href={`/remodelaciones/${project.slug}`}
            className="transition-colors hover:text-primary"
          >
            {project.title}
          </Link>
        </h3>

        <Button asChild variant="outline" className="mt-5 w-full rounded-full border-border/80">
          <Link href={`/remodelaciones/${project.slug}`}>Ver proyecto</Link>
        </Button>
      </div>
    </article>
  );
}
