"use client";
// 오류 화면은 "다시 시도" 버튼을 눌러야 해서 브라우저에서 실행됩니다.

// /albums 아래 화면에서 오류가 나면(예: DB 연결 실패) Next.js가 이 화면을 대신 보여줍니다.
// reset: 화면을 다시 그려보는 함수 (Next.js가 넘겨줘요)
export default function AlbumsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="mb-2 text-xl font-bold">앨범을 불러오지 못했어요</h1>
      <p className="mb-6 text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground"
      >
        다시 시도
      </button>
    </main>
  );
}
