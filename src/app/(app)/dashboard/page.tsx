import type { Metadata } from "next";
import { DashboardClient } from "./client";

export default function DashboardPage() {
  return <DashboardClient />;
}

export const metadata: Metadata = {
  title: "Dashboard",
};
