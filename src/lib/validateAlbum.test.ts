import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isAlbumFormValues, todayInKorea, validateAlbum } from "./validateAlbum";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-07T00:00:00Z"));
});
afterEach(() => vi.useRealTimers());

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

  it.each([null, undefined, 123, "text", [], true])("잘못된 전체 입력 %j를 안전하게 거부한다", (input) => {
    expect(isAlbumFormValues(input)).toBe(false);
    expect(validateAlbum(input).form).toBeDefined();
  });

  it.each(["title", "artist", "releaseDate", "listenedDate", "rating", "status", "memo"] as const)(
    "%s는 문자열이어야 한다", (field) => {
      for (const input of [42, {}, [], null, undefined, true]) {
        const values = { ...goodValues, [field]: input };
        expect(isAlbumFormValues(values)).toBe(false);
        expect(validateAlbum(values)[field]).toBeDefined();
      }
    }
  );

  it("필드가 빠진 객체는 거부하고 정상 객체는 통과한다", () => {
    expect(isAlbumFormValues(goodValues)).toBe(true);
    expect(Object.keys(validateAlbum({}))).toHaveLength(7);
  });

  it.each([
    "2026-02-30", "2026-02-29", "1900-02-29", "2026-04-31",
    "1/1/2099", "0", "2026-2-01", "2026-02-1", "2026-13-01", "2026-01-00",
    "2026-09-28T00:00:00Z", " 2026-09-28", "2026-09-28 ", "garbage",
  ])("잘못된 날짜 %s는 발매일과 감상일 모두 거부한다", (date) => {
    expect(validateAlbum({ ...goodValues, releaseDate: date }).releaseDate).toBeDefined();
    expect(validateAlbum({ ...goodValues, listenedDate: date }).listenedDate).toBeDefined();
  });

  it.each(["2024-02-29", "2000-02-29", "2026-02-28", "2026-04-30"])(
    "실제로 존재하는 날짜 %s는 통과한다", (date) => {
      expect(validateAlbum({ ...goodValues, releaseDate: date, listenedDate: date })).toEqual({});
    }
  );

  it("발매일은 미래도 허용하고 감상일은 거부한다", () => {
    const errors = validateAlbum({ ...goodValues, releaseDate: "2099-01-01", listenedDate: "2099-01-01" });
    expect(errors.releaseDate).toBeUndefined();
    expect(errors.listenedDate).toBe("감상일은 오늘 이후일 수 없어요.");
  });

  it("들을 예정이어도 입력한 감상일은 실제 날짜여야 한다", () => {
    expect(validateAlbum({ ...goodValues, status: "들을 예정", listenedDate: "2026-02-30", rating: "" }).listenedDate).toBeDefined();
  });

  it("한국 자정 전후로 오늘 날짜와 미래 감상일 판단이 바뀐다", () => {
    vi.setSystemTime(new Date("2026-09-28T14:59:59Z"));
    expect(todayInKorea()).toBe("2026-09-28");
    expect(validateAlbum({ ...goodValues, listenedDate: "2026-09-29" }).listenedDate).toBeDefined();
    vi.setSystemTime(new Date("2026-09-28T15:00:00Z"));
    expect(todayInKorea()).toBe("2026-09-29");
    expect(validateAlbum({ ...goodValues, listenedDate: "2026-09-29" }).listenedDate).toBeUndefined();
  });
});
