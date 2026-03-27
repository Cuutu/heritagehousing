import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  vivienda_completa: "Vivienda Completa",
  exterior: "Espacios Exteriores",
  oficina: "Oficina",
  comercial: "Espacio Comercial",
  otro: "Otro",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const mainBefore = project.beforeImages[0];
  const mainAfter = project.afterImages[0];

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-[4/3]">
        {mainBefore && mainAfter ? (
          <BeforeAfterSlider
            beforeImage={mainBefore}
            afterImage={mainAfter}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Sin imágenes</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">
            {categoryLabels[project.category] || project.category}
          </Badge>
          {project.area && (
            <Badge variant="outline">{project.area} m²</Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/remodelaciones/${project.slug}`}>Ver Proyecto</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
