"use client";

import "@uploadthing/react/styles.css";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/uploadthing-router";

export const UploadButton = generateUploadButton<OurFileRouter>();
