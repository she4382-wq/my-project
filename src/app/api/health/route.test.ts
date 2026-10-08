import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 진짜 DB 대신 가짜를 씁니다. connect(연결)와 ping(응답 확인)이 성공할지 실패할지 테스트마다 정해요.
const db = vi.hoisted(() => ({ connect: vi.fn(), ping: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: db.connect }));
vi.mock("mongoose", () => ({
  default: { connection: { name: "album-log", db: { admin: () => ({ ping: db.ping }) } } },
}));
import { GET } from "./route";

beforeEach(() => { vi.resetAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

describe("GET /api/health", () => {
  it("연결되면 { ok: true }만 돌려주고 DB 이름은 숨긴다", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("실패하면 { ok: false }만 돌려주고 오류 원문은 서버 로그에만 남긴다", async () => {
    const secret = "querySrv ENOTFOUND _mongodb._tcp.cluster0.secret.mongodb.net";
    db.connect.mockRejectedValueOnce(new Error(secret));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(text)).toEqual({ ok: false });
    expect(text).not.toContain("cluster0"); // 응답에는 클러스터 주소가 없어야 함
    expect(log).toHaveBeenCalled(); // 서버 로그에는 남아야 함
  });
});
