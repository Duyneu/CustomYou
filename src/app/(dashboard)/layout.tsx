import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { GlobalSearchDialog } from "@/components/layout/global-search-dialog";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect("/login");
    }

    return (
      <div className="flex min-h-screen">
        <GlobalSearchDialog />
        {/* Sidebar cố định */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}
