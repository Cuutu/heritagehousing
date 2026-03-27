export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Ruler, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BeforeAfterSlider } from "@/components/renovation/BeforeAfterSlider";
import { LeadForm } from "@/components/renovation/LeadForm";
import { prisma } from "@/lib/prisma";

const categoryLabels: Record<string, string> = {
  cocina: "Cocina",
  baño: "Baño",
  vivienda_completa: "Vivienda Completa",
  exterior: "Espacios Exteriores",
  oficina: "Oficina",
  comercial: "Espacio Comercial",
  otro: "Otro",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/remodelaciones"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a remodelaciones
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">
            {categoryLabels[project.category] || project.category}
          </Badge>
          {project.area && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {project.area} m²
            </Badge>
          )}
          {project.duration && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {project.duration} días
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {project.title}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Antes y Después</h2>
            {project.beforeImages[0] && project.afterImages[0] && (
              <div className="mb-6">
                <BeforeAfterSlider
                  beforeImage={project.beforeImages[0]}
                  afterImage={project.afterImages[0]}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div>
                <h3 className="font-medium mb-2">Antes</h3>
                <div className="space-y-2">
                  {project.beforeImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`Antes ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Después</h3>
                <div className="space-y-2">
                  {project.afterImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`Después ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Sobre el Proyecto</h2>
            <div className="prose prose-sm max-w-none">
              {project.description.split("\n\n").map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  ¿Te gustó este proyecto?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Podemos hacer algo similar en tu espacio. Contactanos para
                  discutir tu próximo proyecto.
                </p>
                <Button asChild className="w-full">
                  <Link href="/remodelaciones#contacto">
                    Solicitar Cotización
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">¿Sabías que...?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Diseño personalizado</li>
                <li>✓ Materiales de primera calidad</li>
                <li>✓ Garantía en todos los trabajos</li>
                <li>✓ Presupuesto sin compromiso</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section id="contacto" className="mt-16 scroll-mt-24">
        <div className="bg-muted/50 rounded-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Quiero una cotización para mi proyecto
            </h2>
            <p className="text-muted-foreground">
              Completá el formulario y te respondemos a la brevedad
            </p>
          </div>
          <LeadForm />
        </div>
      </section>
    </div>
  );
}
