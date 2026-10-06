import { describe, expect, it } from "vitest";
import { toFormValues } from "./albumFormValues";

const album = {
  id: "6abcc60882bb11f8e36d8321",
  title: "Love poem",
  artist: "아이유",
  releaseDate: "2019-11-18",
  listenedDate: "2026-09-28",
  rating: 4.5,
  status: "다 들음",
  memo: "좋아요",
  createdAt: "2026-09-28",
};

describe("toFormValues", () => {
  it("앨범 값을 폼에 넣을 글자로 바꾼다", () => {
    expect(toFormValues(album)).toEqual({
      title: "Love poem",
      artist: "아이유",
      releaseDate: "2019-11-18",
      listenedDate: "2026-09-28",
      rating: "4.5",
      status: "다 들음",
      memo: "좋아요",
    });
  });

  it("평점이 없으면(null) 빈 칸", () => {
    const values = toFormValues({ ...album, rating: null, listenedDate: "" });
    expect(values.rating).toBe("");
    expect(values.listenedDate).toBe("");
  });

  it("5점은 \"5\" (평점 선택 목록의 값과 같아야 함)", () => {
    expect(toFormValues({ ...album, rating: 5 }).rating).toBe("5");
  });
});
