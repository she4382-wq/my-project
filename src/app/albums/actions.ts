"use server";
// ↑ 이 파일의 함수들은 브라우저가 아니라 "서버"에서만 실행됩니다.
//   그래서 DB 비밀번호 같은 정보가 사용자 브라우저로 새어 나가지 않아요.

import { isValidId } from "@/lib/albumId";
import { connectDB } from "@/lib/mongodb";
import { AlbumErrors, isAlbumFormValues, validateAlbum } from "@/lib/validateAlbum";
import Album from "@/models/Album";

// 저장 결과: 성공했는지(ok), 오류 안내문(errors), 저장한 앨범의 아이디(id)를 화면에 돌려줍니다.
// id는 저장에 성공했을 때만 채워지고, 실패하면 ""(빈 글자)예요.
export type SaveResult = {
  ok: boolean;
  errors: AlbumErrors;
  id: string;
};

// 앨범 등록: 폼에서 받은 값을 검사하고, 문제가 없으면 DB에 저장합니다.
export async function createAlbum(values: unknown): Promise<SaveResult> {
  // 1) 입력 검사. 브라우저에서 한 번 검사했더라도 서버에서 꼭 다시 검사합니다.
  const errors = validateAlbum(values);
  if (!isAlbumFormValues(values) || Object.keys(errors).length > 0) {
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

// 앨범 수정: 아이디(id)에 해당하는 앨범을 폼에서 받은 값으로 고칩니다.
// 순서는 등록(createAlbum)과 같아요: 검사 → DB 저장 → 결과 돌려주기
export async function updateAlbum(id: string, values: unknown): Promise<SaveResult> {
  // 1) 아이디 모양 확인
  if (!isValidId(id)) {
    return { ok: false, errors: { form: "앨범을 찾을 수 없어요." }, id: "" };
  }

  // 2) 입력 검사
  const errors = validateAlbum(values);
  if (!isAlbumFormValues(values) || Object.keys(errors).length > 0) {
    return { ok: false, errors: errors, id: "" };
  }

  // 3) DB에서 고치기
  try {
    await connectDB();
    // findByIdAndUpdate(아이디, 바꿀 값, 옵션): 아이디로 찾아서 고칩니다.
    // runValidators: true → 고칠 때도 DB 설계도(스키마)의 규칙 검사를 다시 해요. (기본은 꺼져 있어요)
    const updated = await Album.findByIdAndUpdate(
      id,
      {
        title: values.title.trim(),
        artist: values.artist.trim(),
        releaseDate: new Date(values.releaseDate),
        listenedDate: toDateOrNull(values.listenedDate),
        rating: toNumberOrNull(values.rating),
        status: values.status,
        memo: values.memo.trim(),
      },
      { runValidators: true }
    );

    // 찾지 못했으면(그사이 다른 곳에서 지워진 경우) null이 돌아와요.
    if (updated === null) {
      return { ok: false, errors: { form: "이미 삭제된 앨범이에요." }, id: "" };
    }
  } catch (error) {
    console.error("앨범 수정 실패:", error);
    return {
      ok: false,
      errors: { form: "저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
      id: "",
    };
  }

  return { ok: true, errors: {}, id: id };
}

// 삭제 결과: 성공했는지(ok)와, 실패했을 때 보여줄 안내문(message)
export type DeleteResult = {
  ok: boolean;
  message: string;
};

// 앨범 삭제: 아이디(id)에 해당하는 앨범을 DB에서 지웁니다.
export async function deleteAlbum(id: string): Promise<DeleteResult> {
  // 1) 아이디 모양 확인
  if (!isValidId(id)) {
    return { ok: false, message: "앨범을 찾을 수 없어요." };
  }

  // 2) DB에서 지우기
  try {
    await connectDB();
    // findByIdAndDelete: 아이디로 찾아서 지웁니다.
    // 이미 지워진 앨범이어도 오류가 나지 않아요. "없어진 상태"는 같으니 성공으로 봅니다.
    await Album.findByIdAndDelete(id);
  } catch (error) {
    console.error("앨범 삭제 실패:", error);
    return { ok: false, message: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true, message: "" };
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
