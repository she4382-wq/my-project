import { describe, expect, it } from "vitest";
import { isValidId } from "./albumId";

describe("isValidId", () => {
  it("24자리 영문(a~f)+숫자면 통과", () => {
    expect(isValidId("6abcc60882bb11f8e36d8321")).toBe(true);
  });

  it("모양이 다르면 거부", () => {
    expect(isValidId("hello")).toBe(false);
    expect(isValidId("")).toBe(false);
    expect(isValidId("6abcc60882bb11f8e36d832")).toBe(false); // 23자리
    expect(isValidId("zzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false); // z는 쓸 수 없는 글자
  });
});
