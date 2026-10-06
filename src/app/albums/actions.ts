"use server";
// ↑ 이 파일의 함수들은 브라우저가 아니라 "서버"에서만 실행됩니다.
//   그래서 DB 비밀번호 같은 정보가 사용자 브라우저로 새어 나가지 않아요.

import { connectDB } from "@/lib/mongodb";
import { AlbumErrors, AlbumFormValues, validateAlbum } from "@/lib/validateAlbum";
import Album from "@/models/Album";

// 저장 결과: 성공했는지(ok), 오류 안내문(errors), 저장한 앨범의 아이디(id)를 화면에 돌려줍니다.
// id는 저장에 성공했을 때만 채워지고, 실패하면 ""(빈 글자)예요.
export type SaveResult = {
  ok: boolean;
  errors: AlbumErrors;
  id: string;
};

// 앨범 등록: 폼에서 받은 값을 검사하고, 문제가 없으면 DB에 저장합니다.
export async function createAlbum(values: AlbumFormValues): Promise<SaveResult> {
  // 1) 입력 검사. 브라우저에서 한 번 검사했더라도 서버에서 꼭 다시 검사합니다.
  const errors = validateAlbum(values);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors: errors, id: "" };
  }

  // 2) DB에 저장
  let newId = "";
  try {
    await connectDB();
    const saved = await Album.create({
      title: values.title.trim(),
      artist: values.artist.trim(),
      releaseDate: new Date(values.releaseDate),
      listenedDate: toDateOrNull(values.listenedDate),
      rating: toNumberOrNull(values.rating),
      status: values.status,
      memo: values.memo.trim(),
    });
    newId = String(saved._id); // DB가 새로 만들어준 아이디
  } catch (error) {
    console.error("앨범 저장 실패:", error);
    return {
      ok: false,
      errors: { form: "저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
      id: "",
    };
  }

  return { ok: true, errors: {}, id: newId };
}

// 빈 칸이면 null(없음), 아니면 날짜로 바꿉니다.
function toDateOrNull(text: string): Date | null {
  if (text === "") {
    return null;
  }
  return new Date(text);
}

// 빈 칸이면 null(없음), 아니면 숫자로 바꿉니다. 예: "4.5" → 4.5
function toNumberOrNull(text: string): number | null {
  if (text === "") {
    return null;
  }
  return Number(text);
}
