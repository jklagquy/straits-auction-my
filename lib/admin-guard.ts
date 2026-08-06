import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function requireAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}
