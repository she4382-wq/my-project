import { describe, expect, it } from "vitest";
import { formatDate, formatRating } from "./format";

describe("formatDate", () => {
  it("2019-11-18 → 2019.11.18", () => {
    expect(formatDate("2019-11-18")).toBe("2019.11.18");
  });

  it("빈 값이면 -", () => {
    expect(formatDate("")).toBe("-");
  });
});

describe("formatRating", () => {
  it("숫자면 별과 함께 표시", () => {
    expect(formatRating(4.5)).toBe("★ 4.5");
    expect(formatRating(3)).toBe("★ 3");
  });

  it("평점이 없으면 -", () => {
    expect(formatRating(null)).toBe("-");
  });
});
