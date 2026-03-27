import Link from "next/link";
import { BeforeAfterSlider } from "@/components/renovation/BeforeAfterSlider";

const categoryLabels: Record<string, string> = {
  cocina: "COCINA",
  baño: "BAÑO",
  living: "LIVING",
  vivienda_completa: "COMPLETA",
  exterior: "EXTERIOR",
  oficina: "OFICINA",
  comercial: "COMERCIAL",
  otro: "PROYECTO",
};

type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  area?: number | null;
  beforeImages: string[];
  afterImages: string[];
};

export function RenovationShowcaseCard({ project }: { project: Project }) {
  const mainBefore = project.beforeImages[0];
  const mainAfter = project.afterImages[0];
  const cat =
    categoryLabels[project.category] ?? project.category.toUpperCase();

  return (
    <article className="group relative h-[min(400px,70vw)] min-h-[320px] overflow-hidden rounded border border-[var(--brand-border)] bg-[var(--bg-surface)]">
      <div className="absolute inset-0">
        {mainBefore && mainAfter ? (
          <BeforeAfterSlider
            beforeImage={mainBefore}
            afterImage={mainAfter}
            className="relative h-full min-h-[280px] w-full cursor-ew-resize select-none overflow-hidden"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--paragraph)]">
            Sin imágenes
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1208]/90 via-[#1a1208]/35 to-transparent transition-opacity duration-500 group-hover:from-[#1a1208]/80" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
          {cat}
        </p>
        <h3 className="mt-2 font-display text-2xl font-light leading-tight text-white sm:text-[30px]">
          <Link
            href={`/remodelaciones/${project.slug}`}
            className="pointer-events-auto transition-colors hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 font-sans text-xs text-white/60">
          {project.area ? `${project.area} m² · ` : ""}
          Antes / después interactivo
        </p>
        <Link
          href={`/remodelaciones/${project.slug}`}
          className="pointer-events-auto mt-4 inline-flex translate-y-2 font-mono text-xs uppercase tracking-wide text-[var(--brand-accent)] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Ver proyecto →
        </Link>
      </div>
    </article>
  );
}
