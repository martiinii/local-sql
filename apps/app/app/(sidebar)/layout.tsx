import { DashboardLayout } from "@/components/layouts/dashboard/dashboard.layout";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
