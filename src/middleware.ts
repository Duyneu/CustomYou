import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/study/:path*",
    "/tracker/:path*",
    "/finance/:path*",
    "/productivity/:path*",
    "/settings/:path*",
  ],
};
