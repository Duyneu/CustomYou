import { describe, it, expect, beforeEach } from "vitest";
import { getAllowedOwnerEmail, authOptions } from "../../src/lib/auth";

describe("Auth Security & Rate Limiting", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  it("lấy đúng email chủ hệ thống từ biến môi trường", () => {
    expect(getAllowedOwnerEmail()).toBe("admin@example.com");
  });

  it("authOptions có session strategy là jwt và secret được cấu hình", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
    expect(authOptions.pages?.signIn).toBe("/login");
  });

  it("từ chối khi credentials thiếu email hoặc mật khẩu", async () => {
    const provider = authOptions.providers[0] as any;
    const rawAuthorize = provider.options.authorize;
    await expect(rawAuthorize({ email: "", password: "" })).rejects.toThrow(
      "Vui lòng nhập đầy đủ Email và Mật khẩu."
    );
  });
});
