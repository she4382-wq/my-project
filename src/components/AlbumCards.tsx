import Link from "next/link";
import { AlbumItem } from "@/lib/albums";
import { formatDate, formatRating } from "@/lib/format";

// 앨범 목록을 카드 모양으로 보여줍니다.
export default function AlbumCards({ albums }: { albums: AlbumItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => (
        <li key={album.id}>
          {/* 카드 전체가 링크라서 어디를 눌러도 상세 화면으로 갑니다 */}
          <Link
            href={`/albums/${album.id}`}
            className="block h-full rounded-lg border p-4 hover:bg-accent"
          >
            <h2 className="truncate text-lg font-bold">{album.title}</h2>
            <p className="truncate text-muted-foreground">{album.artist}</p>
            <p className="mt-3">{formatRating(album.rating)}</p>
            <p className="mt-2 inline-block rounded-full border px-2 py-0.5 text-sm">
              {album.status}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              감상일 {formatDate(album.listenedDate)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
