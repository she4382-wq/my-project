import AlbumForm from "@/components/AlbumForm";

// 주소 /albums/new 로 들어오면 이 화면이 보입니다.
// (Next.js는 src/app 아래 폴더 이름이 곧 주소가 됩니다: app/albums/new/page.tsx → /albums/new)
export default function NewAlbumPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">앨범 기록하기</h1>
      <AlbumForm />
    </main>
  );
}
