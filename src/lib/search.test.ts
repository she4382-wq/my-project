import { describe, expect, it } from "vitest";
import { cleanSearchText, escapeSearchText } from "./search";

describe("cleanSearchText", () => {
  it("앞뒤 공백을 지운다", () => {
    expect(cleanSearchText("  아이유  ")).toBe("아이유");
  });

  it("공백만 있으면 빈 글자", () => {
    expect(cleanSearchText("   ")).toBe("");
  });

  it("100자가 넘으면 100자까지만 쓴다", () => {
    expect(cleanSearchText("가".repeat(150)).length).toBe(100);
  });
});

describe("escapeSearchText", () => {
  it("평범한 글자는 그대로", () => {
    expect(escapeSearchText("아이유 love")).toBe("아이유 love");
  });

  it("특수문자 앞에 \\를 붙인다", () => {
    expect(escapeSearchText("(G)I-DLE")).toBe("\\(G\\)I\\-DLE");
    expect(escapeSearchText("a.b*")).toBe("a\\.b\\*");
  });

  it("바꾼 글자로 검색하면 원래 글자 그대로 찾는다", () => {
    const pattern = new RegExp(escapeSearchText("(G)I-DLE"), "i");
    expect(pattern.test("I feel - (G)I-DLE")).toBe(true);
    expect(pattern.test("GI-DLE")).toBe(false); // 괄호가 없으면 다른 글자
  });
});
