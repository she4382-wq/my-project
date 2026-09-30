import { RATINGS, STATUSES, WANT_TO_LISTEN } from "./albumOptions";

// 폼에서 넘어오는 값의 모양. 입력칸의 값은 모두 글자(string)로 들어옵니다.
export type AlbumFormValues = {
  title: string;
  artist: string;
  releaseDate: string;
  listenedDate: string;
  rating: string;
  status: string;
  memo: string;
};

// 오류 안내문 모음. 예: { title: "앨범명을 입력해 주세요." }
export type AlbumErrors = {
  [field: string]: string;
};

// 입력값을 검사해서, 틀린 칸마다 안내문을 담아 돌려줍니다.
// 돌려준 객체가 비어 있으면({}) 모든 입력이 올바르다는 뜻입니다.
export function validateAlbum(values: AlbumFormValues): AlbumErrors {
  const errors: AlbumErrors = {};

  // 1) 앨범명: 필수, 200자까지
  const title = values.title.trim();
  if (title === "") {
    errors.title = "앨범명을 입력해 주세요.";
  } else if (title.length > 200) {
    errors.title = "앨범명은 200자까지 쓸 수 있어요.";
  }

  // 2) 아티스트: 필수, 200자까지
  const artist = values.artist.trim();
  if (artist === "") {
    errors.artist = "아티스트를 입력해 주세요.";
  } else if (artist.length > 200) {
    errors.artist = "아티스트는 200자까지 쓸 수 있어요.";
  }

  // 3) 발매일: 필수
  if (!isValidDate(values.releaseDate)) {
    errors.releaseDate = "발매일을 선택해 주세요.";
  }

  // 4) 상태: 정해진 선택지 중 하나여야 함
  if (!STATUSES.includes(values.status)) {
    errors.status = "상태를 골라 주세요.";
  }

  // "들을 예정"이면 아직 안 들었으니 감상일과 평점을 비워도 됩니다.
  const isWantToListen = values.status === WANT_TO_LISTEN;

  // 5) 감상일
  if (values.listenedDate === "") {
    if (!isWantToListen) {
      errors.listenedDate = "감상일을 선택해 주세요.";
    }
  } else if (!isValidDate(values.listenedDate)) {
    errors.listenedDate = "날짜 형식이 올바르지 않아요.";
  }

  // 6) 평점
  if (values.rating === "") {
    if (!isWantToListen) {
      errors.rating = "평점을 골라 주세요.";
    }
  } else if (!RATINGS.includes(values.rating)) {
    errors.rating = "평점은 1~5점, 0.5점 단위로 골라 주세요.";
  }

  // 7) 메모: 선택, 2000자까지
  if (values.memo.trim().length > 2000) {
    errors.memo = "메모는 2000자까지 쓸 수 있어요.";
  }

  return errors;
}

// "2026-09-28" 같은 글자가 올바른 날짜인지 확인합니다.
function isValidDate(text: string): boolean {
  if (text === "") {
    return false;
  }
  const date = new Date(text);
  // 날짜로 바꿀 수 없는 글자면 getTime()이 NaN(숫자 아님)이 됩니다.
  return !isNaN(date.getTime());
}
