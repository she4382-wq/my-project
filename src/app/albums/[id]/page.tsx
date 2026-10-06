import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbum } from "@/lib/albums";
import { formatDate, formatRating } from "@/lib/format";

// 접속할 때마다 DB를 새로 읽게 합니다.
export const dynamic = "force-dynamic";

// 주소 /albums/아이디 의 화면입니다. 이 파일은 서버에서 실행돼요.
// 폴더 이름이 [id]라서, 주소의 아이디 부분이 params.id 로 들어옵니다.
// 예: /albums/6abcc60882bb11f8e36d8321 → params.id = "6abcc60882bb11f8e36d8321"
export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const album = await getAlbum(params.id);

  // 앨범이 없으면(잘못된 주소, 지워진 앨범) not-found.tsx 화면을 보여줍니다.
  if (album === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* 위쪽 줄: 왼쪽은 목록으로, 오른쪽은 수정 버튼 */}
      <div className="flex items-center justify-between">
        <Link href="/albums" className="text-sm text-muted-foreground hover:underline">
          ← 목록으로
        </Link>
        <Link
          href={`/albums/${album.id}/edit`}
          className="rounded border px-3 py-1.5 text-sm font-semibold hover:bg-accent"
        >
          수정
        </Link>
      </div>

      {/* 앨범명, 아티스트, 상태 */}
      <div className="mb-6 mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold">{album.title}</h1>
          <p className="mt-1 break-words text-lg text-muted-foreground">{album.artist}</p>
        </div>
        <span className="shrink-0 rounded-full border px-3 py-1 text-sm">{album.status}</span>
      </div>

      {/* 기본 정보 */}
      <dl className="grid grid-cols-[6rem_1fr] gap-y-3 rounded-lg border p-5">
        <dt className="text-muted-foreground">평점</dt>
        <dd>{formatRating(album.rating)}</dd>

        <dt className="text-muted-foreground">발매일</dt>
        <dd>{formatDate(album.releaseDate)}</dd>

        <dt className="text-muted-foreground">감상일</dt>
        <dd>{formatDate(album.listenedDate)}</dd>

        <dt className="text-muted-foreground">기록일</dt>
        <dd>{formatDate(album.createdAt)}</dd>
      </dl>

      {/* 메모 */}
      <h2 className="mb-2 mt-8 text-lg font-semibold">메모</h2>
      {album.memo === "" ? (
        <p className="text-muted-foreground">작성한 메모가 없어요.</p>
      ) : (
        // whitespace-pre-wrap: 메모에서 엔터 친 줄바꿈을 그대로 보여줍니다
        // break-words: 아주 긴 단어도 칸 밖으로 넘치지 않게 줄을 바꿉니다
        <p className="whitespace-pre-wrap break-words rounded-lg border p-5">{album.memo}</p>
      )}
    </main>
  );
}
