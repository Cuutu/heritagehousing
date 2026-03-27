"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface PropertyGalleryProps {
  images: string[];
  propertyName: string;
}

export function PropertyGallery({ images, propertyName }: PropertyGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-2 h-[400px]">
        <div
          className="col-span-4 md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden rounded-lg"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0] || "/placeholder.jpg"}
            alt={`${propertyName} - Imagen 1`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="hidden md:block relative cursor-pointer overflow-hidden rounded-lg"
            onClick={() => openLightbox(index + 1)}
          >
            <Image
              src={image || "/placeholder.jpg"}
              alt={`${propertyName} - Imagen ${index + 2}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}

        {images.length > 5 && (
          <Button
            variant="secondary"
            className="absolute bottom-4 right-4"
            onClick={() => openLightbox(0)}
          >
            Ver todas las {images.length} fotos
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <DialogTitle className="sr-only">
            Galería de {propertyName}
          </DialogTitle>

          <div className="relative h-[80vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex] || "/placeholder.jpg"}
                alt={`${propertyName} - Imagen ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
