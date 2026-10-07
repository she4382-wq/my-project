import { describe, expect, it } from "vitest";
import { todayInKorea, validateAlbum } from "./validateAlbum";

// 모든 칸을 올바르게 채운 기본 입력값
const goodValues = {
  title: "Love poem",
  artist: "아이유",
  releaseDate: "2019-11-18",
  listenedDate: "2026-09-28",
  rating: "4.5",
  status: "다 들음",
  memo: "",
};

describe("validateAlbum", () => {
  it("올바른 입력이면 오류가 없다", () => {
    expect(validateAlbum(goodValues)).toEqual({});
  });

  it("앨범명과 아티스트가 비어 있으면 오류", () => {
    const errors = validateAlbum({ ...goodValues, title: "   ", artist: "" });
    expect(errors.title).toBeDefined();
    expect(errors.artist).toBeDefined();
  });

  it("앨범명이 200자를 넘으면 오류", () => {
    const errors = validateAlbum({ ...goodValues, title: "가".repeat(201) });
    expect(errors.title).toBeDefined();
  });

  it("발매일이 비어 있으면 오류", () => {
    const errors = validateAlbum({ ...goodValues, releaseDate: "" });
    expect(errors.releaseDate).toBeDefined();
  });

  it("목록에 없는 상태는 오류", () => {
    const errors = validateAlbum({ ...goodValues, status: "아무거나" });
    expect(errors.status).toBeDefined();
  });

  it("평점은 1~5점, 0.5점 단위만 허용", () => {
    expect(validateAlbum({ ...goodValues, rating: "4.3" }).rating).toBeDefined();
    expect(validateAlbum({ ...goodValues, rating: "6" }).rating).toBeDefined();
    expect(validateAlbum({ ...goodValues, rating: "0.5" }).rating).toBeDefined();
    expect(validateAlbum({ ...goodValues, rating: "1" }).rating).toBeUndefined();
  });

  it("들을 예정이 아니면 평점과 감상일이 필수", () => {
    const errors = validateAlbum({ ...goodValues, rating: "", listenedDate: "" });
    expect(errors.rating).toBeDefined();
    expect(errors.listenedDate).toBeDefined();
  });

  it("들을 예정이면 평점과 감상일을 비워도 된다", () => {
    const errors = validateAlbum({
      ...goodValues,
      status: "들을 예정",
      rating: "",
      listenedDate: "",
    });
    expect(errors).toEqual({});
  });

  it("감상일이 오늘보다 뒤(미래)면 오류", () => {
    // 오늘을 2026-09-28로 정해두고 검사합니다
    const errors = validateAlbum({ ...goodValues, listenedDate: "2026-09-29" }, "2026-09-28");
    expect(errors.listenedDate).toBe("감상일은 오늘 이후일 수 없어요.");
  });

  it("감상일이 오늘이면 통과", () => {
    const errors = validateAlbum({ ...goodValues, listenedDate: "2026-09-28" }, "2026-09-28");
    expect(errors.listenedDate).toBeUndefined();
  });

  it("오늘을 따로 알려주지 않으면 한국 시간 기준 오늘을 쓴다", () => {
    expect(todayInKorea()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("메모가 2000자를 넘으면 오류", () => {
    const errors = validateAlbum({ ...goodValues, memo: "가".repeat(2001) });
    expect(errors.memo).toBeDefined();
  });
});
