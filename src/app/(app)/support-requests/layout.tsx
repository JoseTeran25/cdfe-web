import { AdminGuard } from "@/components/auth/AdminGuard";

export default function SupportRequestsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
