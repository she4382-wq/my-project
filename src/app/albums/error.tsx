"use client";
// 오류 화면은 "다시 시도" 버튼을 눌러야 해서 브라우저에서 실행됩니다.

import { useTransition } from "react";
import { useRouter } from "next/navigation";

// /albums 아래 화면에서 오류가 나면(예: DB 연결 실패) Next.js가 이 화면을 대신 보여줍니다.
// reset: 오류 화면을 치우고 원래 화면을 다시 그려보는 함수 (Next.js가 넘겨줘요)
export default function AlbumsError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter(); // 서버에 화면을 다시 요청할 때 쓰는 도구
  // useTransition: "시간이 걸리는 화면 바꾸기"를 시작하고, 끝날 때까지 isRetrying이 true가 돼요.
  const [isRetrying, startTransition] = useTransition();

  // [다시 시도] 버튼을 누르면 실행됩니다.
  function handleRetry() {
    startTransition(() => {
      // 1) refresh: 서버에 이 화면을 새로 요청해요. → 서버에서 DB를 다시 읽어요.
      //    (reset만 하면 브라우저가 화면만 다시 그리고 서버에는 묻지 않아서, DB가 살아나도 회복되지 않았어요)
      router.refresh();
      // 2) reset: 오류 화면을 치우고, 새로 받아온 내용으로 다시 그려요.
      reset();
    });
  }

  // 버튼에 보여줄 글자
  let buttonText = "다시 시도";
  if (isRetrying) {
    buttonText = "다시 불러오는 중...";
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="mb-2 text-xl font-bold">앨범을 불러오지 못했어요</h1>
      <p className="mb-6 text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={handleRetry}
        disabled={isRetrying}
        className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
      >
        {buttonText}
      </button>
    </main>
  );
}
