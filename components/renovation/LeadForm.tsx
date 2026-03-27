"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { projectTypes } from "@/lib/validations/lead.schema";
import { submitLead } from "@/app/actions/lead.actions";

export function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(formRef.current!);

    const result = await submitLead(formData);

    if (result.success) {
      setIsSuccess(true);
      formRef.current?.reset();
    } else {
      setError(result.message || "Error al enviar");
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">¡Mensaje enviado!</h3>
        <p className="text-muted-foreground mb-4">
          Gracias por contactarnos. Te responderemos a la brevedad.
        </p>
        <Button variant="outline" onClick={() => setIsSuccess(false)}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="juan@ejemplo.cl"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectType">Tipo de proyecto *</Label>
          <Select name="projectType" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Cuéntanos sobre tu proyecto *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Describe tu idea, el espacio actual, qué te gustaría cambiar..."
          rows={4}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Consulta"
        )}
      </Button>
    </form>
  );
}
