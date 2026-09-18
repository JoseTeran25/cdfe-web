import { AdminGuard } from "@/components/auth/AdminGuard";

export default function MensajesLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
