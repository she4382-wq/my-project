// "2019-11-18" 같은 날짜 글자와, 달력이 쓰는 Date(날짜 객체) 사이를 바꿔주는 도우미입니다.
// (DB 코드가 없어서 브라우저에서도 쓸 수 있어요)

import { todayInKorea } from "./validateAlbum";

// "2019-11-18" → 2019년 11월 18일 날짜. 비어 있으면 undefined(없음).
// new Date("2019-11-18")을 쓰면 세계 표준시 기준이 되어 한국에서 하루가 밀릴 수 있어서,
// 연·월·일 숫자를 직접 넣어 내 컴퓨터 시간 기준 그날 0시를 만듭니다.
export function textToDate(text: string): Date | undefined {
  if (text === "") {
    return undefined;
  }
  const parts = text.split("-"); // ["2019", "11", "18"]
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1; // 자바스크립트는 월을 0(1월)부터 셉니다
  const day = Number(parts[2]);
  return new Date(year, month, day);
}

// 한국 시간 기준 "오늘"을 달력용 날짜로 돌려줍니다.
// 서버 검사(validateAlbum)도 todayInKorea()를 쓰기 때문에, 달력과 서버의 "오늘"이 항상 같아져요.
export function koreaToday(): Date {
  // todayInKorea()는 항상 "2026-09-28" 같은 글자를 주므로, textToDate 결과가 비어 있을 일은 없어요.
  return textToDate(todayInKorea()) as Date;
}
