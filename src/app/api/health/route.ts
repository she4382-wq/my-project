import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// DB 연결 확인용: GET /api/health
// 이 주소는 로그인 없이 누구나 열 수 있어요.
// 그래서 응답에는 "되는지/안 되는지"(ok)만 담고, DB 이름이나 오류 원문 같은 내부 정보는 담지 않습니다.
export async function GET() {
  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    return NextResponse.json({ ok: true });
  } catch (error) {
    // 오류 원문에는 클러스터 주소 같은 내부 정보가 들어갈 수 있어요.
    // 원인은 서버 로그(내 터미널, Vercel 로그)에만 남기고, 응답은 ok: false만 돌려줍니다.
    console.error("DB 연결 확인 실패:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
