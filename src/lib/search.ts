// 검색어를 다루는 도우미 함수들입니다.

// 검색어 정리: 앞뒤 공백을 지우고, 너무 길면 100자까지만 씁니다.
export function cleanSearchText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length > 100) {
    return trimmed.slice(0, 100); // slice(0, 100): 0번째부터 100글자만 잘라내기
  }
  return trimmed;
}

// DB 검색에 쓰는 "정규식"에서 특별한 뜻이 있는 글자들
// 예: "." = 아무 글자, "*" = 여러 번 반복, "(" ")" = 묶음
const SPECIAL_LETTERS = "\\^$.*+?()[]{}|/-";

// 검색어의 특수문자를 "그냥 글자"로 찾도록 바꿉니다.
// 특수문자 앞에 \ 를 붙이면 "특별한 뜻 말고 이 글자 그대로"라는 뜻이 돼요.
// 예: "(G)I-DLE" → "\(G\)I\-DLE"
export function escapeSearchText(text: string): string {
  let result = "";
  for (const letter of text) {
    if (SPECIAL_LETTERS.includes(letter)) {
      result = result + "\\" + letter; // "\\"는 코드 안에서 \ 한 글자를 뜻해요
    } else {
      result = result + letter;
    }
  }
  return result;
}
