import { afterEach, describe, expect, it, vi } from "vitest";
import { koreaToday, textToDate } from "./dateText";

afterEach(() => { vi.useRealTimers(); });

describe("textToDate", () => {
  it("\"2019-11-18\" → 2019년 11월 18일 (내 컴퓨터 시간 기준 그날 0시)", () => {
    const date = textToDate("2019-11-18")!;
    expect(date.getFullYear()).toBe(2019);
    expect(date.getMonth()).toBe(10); // 자바스크립트는 1월을 0으로 셉니다
    expect(date.getDate()).toBe(18);
  });

  it("빈 글자면 undefined", () => {
    expect(textToDate("")).toBeUndefined();
  });
});

describe("koreaToday", () => {
  it("세계 표준시로는 9월 28일 밤이어도, 한국이 9월 29일이면 29일을 돌려준다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-28T15:30:00Z")); // 한국 시간 9월 29일 0시 30분
    const today = koreaToday();
    expect([today.getFullYear(), today.getMonth() + 1, today.getDate()]).toEqual([2026, 9, 29]);
  });

  it("한국 자정 직전이면 아직 그날이다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-28T14:59:59Z")); // 한국 시간 9월 28일 23시 59분
    const today = koreaToday();
    expect([today.getFullYear(), today.getMonth() + 1, today.getDate()]).toEqual([2026, 9, 28]);
  });
});
