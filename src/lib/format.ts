// 화면에 보여줄 때 쓰는 도우미 함수들입니다. 카드 보기와 표 보기가 함께 씁니다.

// "2019-11-18" → "2019.11.18". 값이 없으면 "-"
export function formatDate(text: string): string {
  if (text === "") {
    return "-";
  }
  return text.replaceAll("-", ".");
}

// 4.5 → "★ 4.5". 평점이 없으면(null) "-"
export function formatRating(rating: number | null): string {
  if (rating === null) {
    return "-";
  }
  return "★ " + rating;
}
