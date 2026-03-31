import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { clerkConfigured } from "@/lib/clerk-config";

const f = createUploadthing();

async function requireUploaderUserId(): Promise<string> {
  if (!clerkConfigured()) {
    return "admin-no-clerk";
  }
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export const ourFileRouter = {
  propertyImages: f({ image: { maxFileSize: "4MB", maxFileCount: 20 } })
    .middleware(async () => {
      const userId = await requireUploaderUserId();
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),

  projectImages: f({ image: { maxFileSize: "4MB", maxFileCount: 20 } })
    .middleware(async () => {
      const userId = await requireUploaderUserId();
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),

  blogImages: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const userId = await requireUploaderUserId();
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
