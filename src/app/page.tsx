import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (error) {
    // Nếu gặp lỗi session hoặc chưa cấu hình auth trên host, chuyển hướng an toàn về trang login
    redirect("/login");
  }
}
