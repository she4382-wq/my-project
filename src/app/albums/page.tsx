import Link from "next/link";
import AlbumCards from "@/components/AlbumCards";
import AlbumTable from "@/components/AlbumTable";
import ViewToggle from "@/components/ViewToggle";
import { listAlbums } from "@/lib/albums";

// 접속할 때마다 DB를 새로 읽게 합니다. (미리 만들어둔 옛 목록을 보여주지 않도록)
export const dynamic = "force-dynamic";

// 주소 /albums 의 화면입니다. 이 파일은 서버에서 실행돼요.
// searchParams: 주소의 ? 뒤에 붙은 값. /albums?view=table 이면 { view: "table" }
export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  let view = "card";
  if (searchParams.view === "table") {
    view = "table";
  }

  // DB에서 앨범 목록을 가져옵니다.
  const albums = await listAlbums();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">앨범 기록</h1>
        <Link
          href="/albums/new"
          className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground"
        >
          + 앨범 등록
        </Link>
      </div>

      {albums.length === 0 ? (
        // 앨범이 하나도 없을 때
        <div className="rounded-lg border p-10 text-center">
          <p className="mb-4 text-muted-foreground">아직 기록한 앨범이 없어요. 첫 앨범을 기록해 보세요!</p>
          <Link href="/albums/new" className="font-semibold underline">
            앨범 등록하러 가기
          </Link>
        </div>
      ) : (
        // 앨범이 있을 때: 개수 + 보기 전환 버튼 + 카드 또는 표
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">총 {albums.length}개</p>
            <ViewToggle view={view} />
          </div>
          {view === "table" ? <AlbumTable albums={albums} /> : <AlbumCards albums={albums} />}
        </>
      )}
    </main>
  );
}
