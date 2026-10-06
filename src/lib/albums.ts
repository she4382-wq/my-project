// DB에서 앨범을 꺼내오는 함수들입니다. (서버에서만 실행돼요)

import { isValidId } from "@/lib/albumId";
import { connectDB } from "@/lib/mongodb";
import Album from "@/models/Album";

// 화면에서 쓰기 쉬운 앨범 한 개의 모양.
// DB의 특수한 값(아이디 객체, 날짜 객체)을 모두 단순한 글자·숫자로 바꿔둡니다.
export type AlbumItem = {
  id: string;
  title: string;
  artist: string;
  releaseDate: string; // "2019-11-18"
  listenedDate: string; // "2026-09-28", 없으면 ""
  rating: number | null; // 없으면 null
  status: string;
  memo: string;
  createdAt: string; // 기록한 날 "2026-09-28"
};

// 모든 앨범을 최근에 등록한 순서대로 가져옵니다.
export async function listAlbums(): Promise<AlbumItem[]> {
  await connectDB();

  // find(): 전부 찾기 / sort({ createdAt: -1 }): 만든 시각 기준 내림차순(최신이 먼저)
  // lean(): mongoose 기능이 붙지 않은 가벼운 데이터로 받기
  const documents = await Album.find().sort({ createdAt: -1 }).lean();

  const albums: AlbumItem[] = [];
  for (const document of documents) {
    albums.push(toAlbumItem(document));
  }
  return albums;
}

// 아이디로 앨범 하나를 가져옵니다. 없으면 null(없음)을 돌려줘요.
export async function getAlbum(id: string): Promise<AlbumItem | null> {
  // 아이디 모양이 틀리면 DB에 물어볼 필요도 없이 "없음"
  if (!isValidId(id)) {
    return null;
  }

  await connectDB();
  const document = await Album.findById(id).lean();

  if (!document) {
    return null;
  }
  return toAlbumItem(document);
}

// DB에서 꺼낸 앨범 하나를 화면용 모양으로 바꿉니다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAlbumItem(document: any): AlbumItem {
  return {
    id: String(document._id),
    title: document.title,
    artist: document.artist,
    releaseDate: dateToText(document.releaseDate),
    listenedDate: dateToText(document.listenedDate),
    rating: document.rating, // 스키마 기본값이 null이라 없으면 null
    status: document.status,
    memo: document.memo, // 스키마 기본값이 ""
    createdAt: timeToKoreanDate(document.createdAt),
  };
}

// 날짜 → "2019-11-18". 날짜가 없으면 "".
// 저장할 때 세계 표준시(UTC) 자정으로 저장했기 때문에, 같은 기준(toISOString)으로 앞 10글자를 잘라 씁니다.
function dateToText(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

// 기록한 시각 → 한국 시간 기준 날짜 "2026-09-28".
// 발매일·감상일과 달리 createdAt은 "실제로 저장한 순간"이라서, 한국 시간으로 바꿔야 날짜가 맞아요.
// (예: 한국 오전 8시 = 세계 표준시 전날 밤 11시)
function timeToKoreanDate(time: Date): string {
  return time.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}
