// "import type"은 모양(타입) 설명만 가져온다는 뜻이에요.
// albums.ts에는 DB 코드가 있지만, 모양만 가져오면 DB 코드는 따라오지 않아요.
import type { AlbumItem } from "./albums";
import type { AlbumFormValues } from "./validateAlbum";

// DB에서 읽은 앨범을 "폼에 채워 넣을 값"으로 바꿉니다.
// 폼의 입력칸은 모두 글자(string)를 쓰기 때문에, 숫자와 null(없음)을 글자로 바꿔줘요.
export function toFormValues(album: AlbumItem): AlbumFormValues {
  // 평점: 4.5 → "4.5", 없음(null) → ""
  let rating = "";
  if (album.rating !== null) {
    rating = String(album.rating);
  }

  return {
    title: album.title,
    artist: album.artist,
    releaseDate: album.releaseDate, // 이미 "2019-11-18" 글자예요
    listenedDate: album.listenedDate, // 없으면 이미 ""예요
    rating: rating,
    status: album.status,
    memo: album.memo,
  };
}
