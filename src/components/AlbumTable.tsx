import Link from "next/link";
import { AlbumItem } from "@/lib/albums";
import { formatDate, formatRating } from "@/lib/format";

// 앨범 목록을 표 모양으로 보여줍니다.
export default function AlbumTable({ albums }: { albums: AlbumItem[] }) {
  return (
    // 화면이 좁으면(휴대폰) 표만 옆으로 밀어서 볼 수 있게 합니다
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted">
          <tr>
            <th className="px-3 py-2">앨범명</th>
            <th className="px-3 py-2">아티스트</th>
            <th className="px-3 py-2">상태</th>
            <th className="px-3 py-2">평점</th>
            <th className="px-3 py-2">발매일</th>
            <th className="px-3 py-2">감상일</th>
          </tr>
        </thead>
        <tbody>
          {albums.map((album) => (
            <tr key={album.id} className="border-b last:border-b-0 hover:bg-accent">
              <td className="px-3 py-2 font-semibold">
                {/* 앨범명을 누르면 상세 화면으로 갑니다 */}
                <Link href={`/albums/${album.id}`} className="hover:underline">
                  {album.title}
                </Link>
              </td>
              <td className="px-3 py-2">{album.artist}</td>
              <td className="whitespace-nowrap px-3 py-2">{album.status}</td>
              <td className="whitespace-nowrap px-3 py-2">{formatRating(album.rating)}</td>
              <td className="whitespace-nowrap px-3 py-2">{formatDate(album.releaseDate)}</td>
              <td className="whitespace-nowrap px-3 py-2">{formatDate(album.listenedDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
