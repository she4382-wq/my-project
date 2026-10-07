"use client";
// ↑ 이 컴포넌트는 브라우저에서 실행됩니다.
//   사용자가 입력할 때마다 화면이 바로 바뀌어야 해서 브라우저에서 돌아가야 해요.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAlbum, SaveResult, updateAlbum } from "@/app/albums/actions";
import DatePicker from "@/components/DatePicker";
import { RATINGS, STATUSES, WANT_TO_LISTEN } from "@/lib/albumOptions";
import { AlbumErrors, AlbumFormValues } from "@/lib/validateAlbum";

// 폼의 처음 상태 (모든 칸이 비어 있음)
const EMPTY_VALUES: AlbumFormValues = {
  title: "",
  artist: "",
  releaseDate: "",
  listenedDate: "",
  rating: "",
  status: "",
  memo: "",
};

// 입력칸에 공통으로 쓰는 모양(Tailwind 클래스)
const INPUT_CLASS = "w-full rounded border border-gray-400 bg-transparent px-3 py-2";

// 이 폼은 "등록"과 "수정"에 함께 씁니다.
// - 등록: <AlbumForm />                       → 빈 폼, 저장하면 새 앨범을 만듭니다
// - 수정: <AlbumForm albumId="..." initialValues={...} /> → 기존 값이 채워진 폼, 저장하면 그 앨범을 고칩니다
type AlbumFormProps = {
  albumId?: string; // 수정할 앨범의 아이디 (등록일 때는 없음)
  initialValues?: AlbumFormValues; // 처음에 채워둘 값 (등록일 때는 없음)
};

export default function AlbumForm({ albumId, initialValues }: AlbumFormProps) {
  // 아이디를 받았으면 수정, 아니면 등록
  let isEditing = false;
  if (albumId) {
    isEditing = true;
  }

  // 처음 값: 수정이면 기존 값, 등록이면 빈 값
  let startValues = EMPTY_VALUES;
  if (initialValues) {
    startValues = initialValues;
  }

  // useState: 화면이 기억해야 하는 값. 값이 바뀌면 화면이 다시 그려집니다.
  const [values, setValues] = useState<AlbumFormValues>(startValues); // 입력한 내용
  const [errors, setErrors] = useState<AlbumErrors>({}); // 칸별 오류 안내문
  const [isSaving, setIsSaving] = useState(false); // 저장 중인지
  const router = useRouter(); // 다른 화면으로 이동할 때 쓰는 도구

  // 저장 버튼에 보여줄 글자
  let buttonText = "저장하기";
  if (isEditing) {
    buttonText = "수정 완료";
  }
  if (isSaving) {
    buttonText = "저장 중...";
  }

  // 상태가 "들을 예정"이면 평점·감상일을 비워도 됩니다.
  const isWantToListen = values.status === WANT_TO_LISTEN;

  // 어떤 입력칸이든 글자가 바뀌면 실행됩니다.
  // 입력칸의 name(예: "title")을 보고, values 안의 같은 이름 칸만 새 값으로 바꿉니다.
  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const name = event.target.name;
    const value = event.target.value;
    setValues({ ...values, [name]: value });
  }

  // 달력(DatePicker)은 일반 입력칸이 아니라서, 어느 칸(name)을 바꿀지 직접 알려줍니다.
  function handleDateChange(name: string, value: string) {
    setValues({ ...values, [name]: value });
  }

  // 저장 버튼을 누르면 실행됩니다.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 브라우저가 페이지를 새로고침하는 기본 동작을 막습니다.
    setIsSaving(true);

    // 서버 함수를 호출합니다. 서버에서 검사하고 DB에 저장한 뒤 결과를 돌려줘요.
    // 수정이면 updateAlbum(고치기), 등록이면 createAlbum(새로 만들기)
    let result: SaveResult;
    if (isEditing && albumId) {
      result = await updateAlbum(albumId, values);
    } else {
      result = await createAlbum(values);
    }

    if (result.ok) {
      // 저장 성공: 그 앨범의 상세 화면으로 이동합니다.
      // (이동하는 동안 버튼이 다시 눌리지 않도록 "저장 중..." 상태를 그대로 둡니다)
      router.push(`/albums/${result.id}`);
      // refresh: 상세 화면을 예전에 본 적이 있어도, 고친 내용으로 새로 그리게 합니다
      router.refresh();
    } else {
      // 저장 실패: 오류 안내문을 보여주고 다시 입력할 수 있게 합니다.
      setIsSaving(false);
      setErrors(result.errors);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* 앨범명 */}
      <div>
        <label htmlFor="title" className="mb-1 block font-semibold">
          앨범명 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          required
          maxLength={200}
          className={INPUT_CLASS}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* 아티스트 */}
      <div>
        <label htmlFor="artist" className="mb-1 block font-semibold">
          아티스트 <span className="text-red-500">*</span>
        </label>
        <input
          id="artist"
          name="artist"
          type="text"
          value={values.artist}
          onChange={handleChange}
          required
          maxLength={200}
          className={INPUT_CLASS}
        />
        {errors.artist && <p className="mt-1 text-sm text-red-500">{errors.artist}</p>}
      </div>

      {/* 상태 */}
      <div>
        <label htmlFor="status" className="mb-1 block font-semibold">
          상태 <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={values.status}
          onChange={handleChange}
          required
          className={INPUT_CLASS}
        >
          <option value="">선택하세요</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
      </div>

      {/* 발매일 */}
      <div>
        <label htmlFor="releaseDate" className="mb-1 block font-semibold">
          발매일 <span className="text-red-500">*</span>
        </label>
        <DatePicker
          id="releaseDate"
          value={values.releaseDate}
          onChange={(value) => handleDateChange("releaseDate", value)}
        />
        {errors.releaseDate && (
          <p className="mt-1 text-sm text-red-500">{errors.releaseDate}</p>
        )}
      </div>

      {/* 감상일: "들을 예정"이면 선택 */}
      <div>
        <label htmlFor="listenedDate" className="mb-1 block font-semibold">
          감상일{" "}
          {isWantToListen ? (
            <span className="text-sm font-normal text-gray-500">(선택)</span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>
        <DatePicker
          id="listenedDate"
          value={values.listenedDate}
          onChange={(value) => handleDateChange("listenedDate", value)}
          disableFuture
        />
        {errors.listenedDate && (
          <p className="mt-1 text-sm text-red-500">{errors.listenedDate}</p>
        )}
      </div>

      {/* 평점: "들을 예정"이면 선택 */}
      <div>
        <label htmlFor="rating" className="mb-1 block font-semibold">
          평점{" "}
          {isWantToListen ? (
            <span className="text-sm font-normal text-gray-500">(선택)</span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>
        <select
          id="rating"
          name="rating"
          value={values.rating}
          onChange={handleChange}
          required={!isWantToListen}
          className={INPUT_CLASS}
        >
          <option value="">선택하세요</option>
          {RATINGS.map((rating) => (
            <option key={rating} value={rating}>
              {rating}점
            </option>
          ))}
        </select>
        {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating}</p>}
      </div>

      {/* 메모 */}
      <div>
        <label htmlFor="memo" className="mb-1 block font-semibold">
          메모 <span className="text-sm font-normal text-gray-500">(선택)</span>
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={5}
          value={values.memo}
          onChange={handleChange}
          maxLength={2000}
          className={INPUT_CLASS}
        />
        {errors.memo && <p className="mt-1 text-sm text-red-500">{errors.memo}</p>}
      </div>

      {/* DB 오류처럼 특정 칸이 아닌 오류 */}
      {errors.form && <p className="text-red-500">{errors.form}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {buttonText}
      </button>

      {/* 수정 중일 때만: 저장하지 않고 상세 화면으로 돌아가기 */}
      {isEditing && (
        <Link href={`/albums/${albumId}`} className="text-center text-sm text-muted-foreground hover:underline">
          취소
        </Link>
      )}
    </form>
  );
}
