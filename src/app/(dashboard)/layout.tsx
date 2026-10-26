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
      <div className="relative flex min-h-screen bg-background text-foreground overflow-x-clip selection:bg-purple-600 selection:text-white">
        {/* Subtle Ambient Depth Canvas for Believable Glass Frosting (Zero CPU overhead static gradients) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-36 -left-36 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-purple-400/25 via-indigo-300/20 to-transparent blur-[130px] dark:from-purple-700/15 dark:via-indigo-600/10" />
          <div className="absolute top-1/4 -right-44 w-[580px] h-[580px] rounded-full bg-gradient-to-br from-fuchsia-400/20 via-purple-300/18 to-transparent blur-[140px] dark:from-fuchsia-600/12 dark:via-purple-700/10" />
          <div className="absolute -bottom-36 left-1/4 w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-indigo-300/20 via-purple-400/20 to-transparent blur-[150px] dark:from-indigo-700/10 dark:via-purple-800/12" />
        </div>

        <GlobalSearchDialog />

        {/* Persistent Frosted Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col lg:pl-60 min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}
