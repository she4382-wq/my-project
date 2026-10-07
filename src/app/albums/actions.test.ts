import { beforeEach, describe, expect, it, vi } from "vitest";

// 실제 MongoDB 대신 호출을 기록하는 가짜 DB를 사용합니다.
const db = vi.hoisted(() => ({ connect: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: db.connect }));
vi.mock("@/models/Album", () => ({ default: { create: db.create, findByIdAndUpdate: db.update } }));
import { createAlbum, updateAlbum } from "./actions";

const id = "507f1f77bcf86cd799439011";
const values = {
  title: " Love poem ", artist: " 아이유 ", releaseDate: "2019-11-18",
  listenedDate: "2024-02-29", rating: "4.5", status: "다 들음", memo: " 좋았어요 ",
};
beforeEach(() => {
  vi.clearAllMocks();
  db.create.mockResolvedValue({ _id: id });
  db.update.mockResolvedValue({ _id: id });
});

describe("서버 저장 흐름의 입력 검사", () => {
  it.each([
    null, {}, { ...values, title: 42 }, { ...values, memo: {} },
    { ...values, releaseDate: "2026-02-30" },
    { ...values, listenedDate: "1/1/2099" },
    { ...values, releaseDate: "0" },
    { ...values, listenedDate: "2099-01-01" },
  ])("잘못된 입력 %j는 등록과 수정 모두 DB 전에 거부한다", async (input) => {
    for (const result of [await createAlbum(input), await updateAlbum(id, input)]) {
      expect(result.ok).toBe(false);
      expect(result.id).toBe("");
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    }
    expect(db.connect).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("정상 입력은 공백을 제거하고 UTC 날짜와 숫자로 변환해 등록·수정한다", async () => {
    const saved = {
      title: "Love poem", artist: "아이유", releaseDate: new Date("2019-11-18T00:00:00Z"),
      listenedDate: new Date("2024-02-29T00:00:00Z"), rating: 4.5, status: "다 들음", memo: "좋았어요",
    };
    expect(await createAlbum(values)).toEqual({ ok: true, errors: {}, id });
    expect(db.create).toHaveBeenCalledWith(saved);
    expect(await updateAlbum(id, values)).toEqual({ ok: true, errors: {}, id });
    expect(db.update).toHaveBeenCalledWith(id, saved, { runValidators: true });
  });

  it("들을 예정의 빈 감상일·평점은 null로 저장한다", async () => {
    expect((await createAlbum({ ...values, status: "들을 예정", listenedDate: "", rating: "" })).ok).toBe(true);
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ listenedDate: null, rating: null }));
  });
});
