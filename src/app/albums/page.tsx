import Link from "next/link";
import AlbumCards from "@/components/AlbumCards";
import AlbumTable from "@/components/AlbumTable";
import SearchBar from "@/components/SearchBar";
import ViewToggle from "@/components/ViewToggle";
import { listAlbums } from "@/lib/albums";
import { cleanSearchText } from "@/lib/search";

// 접속할 때마다 DB를 새로 읽게 합니다. (미리 만들어둔 옛 목록을 보여주지 않도록)
export const dynamic = "force-dynamic";

// 주소 /albums 의 화면입니다. 이 파일은 서버에서 실행돼요.
// searchParams: 주소의 ? 뒤에 붙은 값.
//   /albums?view=table      → { view: "table" }
//   /albums?q=아이유         → { q: "아이유" }
export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: { view?: string; q?: string };
}) {
  // 보기 모드: 기본은 카드
  let view = "card";
  if (searchParams.view === "table") {
    view = "table";
  }

  // 검색어: 주소에 q가 있으면 정리해서 쓰고, 없으면 ""(검색 안 함)
  let searchText = "";
  if (typeof searchParams.q === "string") {
    searchText = cleanSearchText(searchParams.q);
  }
  const isSearching = searchText !== "";

  // DB에서 앨범 목록을 가져옵니다. (검색어가 있으면 맞는 것만)
  const albums = await listAlbums(searchText);

  // "검색 초기화" 링크: 검색어만 빼고, 보기 모드는 유지합니다.
  let clearSearchHref = "/albums";
  if (view === "table") {
    clearSearchHref = "/albums?view=table";
  }

  // 화면에 보여줄 상황 3가지
  const noAlbumsAtAll = albums.length === 0 && !isSearching; // 기록한 앨범이 아예 없음
  const noSearchResults = albums.length === 0 && isSearching; // 검색했는데 맞는 앨범이 없음
  const hasAlbums = albums.length > 0; // 보여줄 앨범이 있음

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

      {/* 앨범이 아예 없으면 검색창도 필요 없어요 */}
      {!noAlbumsAtAll && <SearchBar searchText={searchText} view={view} />}

      {/* 상황 1: 기록한 앨범이 아예 없을 때 */}
      {noAlbumsAtAll && (
        <div className="rounded-lg border p-10 text-center">
          <p className="mb-4 text-muted-foreground">아직 기록한 앨범이 없어요. 첫 앨범을 기록해 보세요!</p>
          <Link href="/albums/new" className="font-semibold underline">
            앨범 등록하러 가기
          </Link>
        </div>
      )}

      {/* 상황 2: 검색 결과가 없을 때 */}
      {noSearchResults && (
        <div className="rounded-lg border p-10 text-center">
          <p className="mb-4 text-muted-foreground">&quot;{searchText}&quot;에 맞는 앨범이 없어요.</p>
          <Link href={clearSearchHref} className="font-semibold underline">
            검색 초기화
          </Link>
        </div>
      )}

      {/* 상황 3: 보여줄 앨범이 있을 때: 개수 + 보기 전환 버튼 + 카드 또는 표 */}
      {hasAlbums && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {isSearching ? (
              <p className="text-sm text-muted-foreground">
                &quot;{searchText}&quot; 검색 결과 {albums.length}개{" "}
                <Link href={clearSearchHref} className="underline">
                  (검색 초기화)
                </Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">총 {albums.length}개</p>
            )}
            <ViewToggle view={view} searchText={searchText} />
          </div>
          {view === "table" ? <AlbumTable albums={albums} /> : <AlbumCards albums={albums} />}
        </>
      )}
    </main>
  );
}
