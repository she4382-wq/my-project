import { notFound } from "next/navigation";
import AlbumForm from "@/components/AlbumForm";
import { getAlbum } from "@/lib/albums";
import { toFormValues } from "@/lib/albumFormValues";

// 접속할 때마다 DB에서 최신 값을 읽어옵니다.
export const dynamic = "force-dynamic";

// 주소 /albums/아이디/edit 의 화면입니다. (서버에서 실행돼요)
export default async function EditAlbumPage({ params }: { params: { id: string } }) {
  const album = await getAlbum(params.id);

  // 앨범이 없으면 "앨범을 찾을 수 없어요" 화면 (../not-found.tsx)
  if (album === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">앨범 수정하기</h1>
      {/* 등록 화면과 같은 폼에, 아이디와 기존 값을 넘겨서 "수정 모드"로 씁니다 */}
      <AlbumForm albumId={album.id} initialValues={toFormValues(album)} />
    </main>
  );
}
