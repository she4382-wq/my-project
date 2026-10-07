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

const ALBUM_FIELDS = [
  "title", "artist", "releaseDate", "listenedDate", "rating", "status", "memo",
] as const;

// TypeScript의 타입은 실행 중 외부 입력을 검사하지 않으므로 실제 값을 확인합니다.
export function isAlbumFormValues(values: unknown): values is AlbumFormValues {
  if (typeof values !== "object" || values === null || Array.isArray(values)) {
    return false;
  }
  const record = values as Record<string, unknown>;
  return ALBUM_FIELDS.every((field) => typeof record[field] === "string");
}

// 입력값을 검사해서, 틀린 칸마다 안내문을 담아 돌려줍니다.
// 돌려준 객체가 비어 있으면({}) 모든 입력이 올바르다는 뜻입니다.
// today: 오늘 날짜("2026-09-28"). 안 넘기면 한국 시간 기준 오늘을 씁니다. (테스트에서 날짜를 고정할 때 넘겨요)
export function validateAlbum(values: unknown, today: string = todayInKorea()): AlbumErrors {
  const errors: AlbumErrors = {};

  // 0) 객체와 모든 필드의 타입을 먼저 검사합니다. 실패하면 trim이나 Date 변환을 하지 않습니다.
  if (!isAlbumFormValues(values)) {
    if (typeof values !== "object" || values === null || Array.isArray(values)) {
      return { form: "입력 데이터 형식이 올바르지 않아요." };
    }
    const record = values as Record<string, unknown>;
    for (const field of ALBUM_FIELDS) {
      if (typeof record[field] !== "string") {
        errors[field] = "문자열 형식으로 입력해 주세요.";
      }
    }
    return errors;
  }

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
    errors.releaseDate = values.releaseDate === ""
      ? "발매일을 선택해 주세요."
      : "발매일은 YYYY-MM-DD 형식의 실제 날짜여야 해요.";
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
  } else if (values.listenedDate > today) {
    // "2026-09-29" > "2026-09-28" 처럼, 같은 모양의 날짜 글자는 글자끼리 비교해도 날짜 순서와 같아요.
    errors.listenedDate = "감상일은 오늘 이후일 수 없어요.";
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
  // 같은 형식만 허용해야 이후의 문자열 날짜 비교도 안전합니다.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  const date = new Date(`${text}T00:00:00.000Z`);
  // Invalid Date는 먼저 거르고, 자동 보정된 날짜는 원문과 비교해서 거릅니다.
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

// 한국 시간 기준 오늘 날짜를 "2026-09-28" 모양으로 돌려줍니다.
// 서버 컴퓨터는 세계 표준시(UTC)로 돌 수 있어서, 시간대를 "Asia/Seoul"로 직접 정해줍니다.
// ("en-CA"는 캐나다 날짜 표기인데, 마침 "2026-09-28"처럼 연-월-일 모양으로 나와서 씁니다.)
export function todayInKorea(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}
