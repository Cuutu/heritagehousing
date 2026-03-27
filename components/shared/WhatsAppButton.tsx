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
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] shadow-[0_8px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-[1.03] hover:bg-[#20bd5a]"
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
