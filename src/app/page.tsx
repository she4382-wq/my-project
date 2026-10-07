import { redirect } from "next/navigation";

// 첫 화면(/)으로 들어오면 앨범 목록(/albums)으로 보냅니다.
export default function Home() {
  redirect("/albums");
}
