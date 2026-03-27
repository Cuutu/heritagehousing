"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";
const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export function WhatsAppButton() {
  return (
    <Button
      asChild
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 shadow-lg z-50"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </a>
    </Button>
  );
}
