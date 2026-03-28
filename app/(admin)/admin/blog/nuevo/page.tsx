import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostEditor } from "@/components/blog/PostEditor";

export default function AdminBlogNewPage() {
  return (
    <>
      <AdminPageHeader
        title="Nuevo artículo"
        description="El artículo se guarda como borrador hasta que lo publiques desde el listado."
      />
      <PostEditor mode="create" />
    </>
  );
}
