"use client";
// ↑ 이 컴포넌트는 브라우저에서 실행됩니다.
//   사용자가 입력할 때마다 화면이 바로 바뀌어야 해서 브라우저에서 돌아가야 해요.

import { useState } from "react";
import { createAlbum } from "@/app/albums/actions";
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

export default function AlbumForm() {
  // useState: 화면이 기억해야 하는 값. 값이 바뀌면 화면이 다시 그려집니다.
  const [values, setValues] = useState<AlbumFormValues>(EMPTY_VALUES); // 입력한 내용
  const [errors, setErrors] = useState<AlbumErrors>({}); // 칸별 오류 안내문
  const [isSaving, setIsSaving] = useState(false); // 저장 중인지
  const [message, setMessage] = useState(""); // 저장 성공 안내문

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

  // 저장 버튼을 누르면 실행됩니다.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 브라우저가 페이지를 새로고침하는 기본 동작을 막습니다.
    setIsSaving(true);
    setMessage("");

    // 서버 함수(createAlbum)를 호출합니다. 서버에서 검사하고 DB에 저장한 뒤 결과를 돌려줘요.
    const result = await createAlbum(values);

    setIsSaving(false);
    setErrors(result.errors);

    if (result.ok) {
      setMessage(`"${values.title.trim()}" 앨범을 저장했어요!`);
      setValues(EMPTY_VALUES); // 다음 앨범을 바로 입력할 수 있게 폼을 비웁니다.
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
        <input
          id="releaseDate"
          name="releaseDate"
          type="date"
          value={values.releaseDate}
          onChange={handleChange}
          required
          className={INPUT_CLASS}
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
        <input
          id="listenedDate"
          name="listenedDate"
          type="date"
          value={values.listenedDate}
          onChange={handleChange}
          required={!isWantToListen}
          className={INPUT_CLASS}
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

      {/* 저장 성공 안내 */}
      {message && <p className="text-green-600">{message}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {isSaving ? "저장 중..." : "저장하기"}
      </button>
    </form>
  );
}
