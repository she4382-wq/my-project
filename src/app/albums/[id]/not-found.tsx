import Link from "next/link";

// 상세 화면에서 notFound()를 부르면 이 화면이 대신 나옵니다.
export default function AlbumNotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="mb-2 text-xl font-bold">앨범을 찾을 수 없어요</h1>
      <p className="mb-6 text-muted-foreground">주소가 잘못되었거나 지워진 앨범이에요.</p>
      <Link href="/albums" className="font-semibold underline">
        목록으로 가기
      </Link>
    </main>
  );
}
