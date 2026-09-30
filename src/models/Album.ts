import mongoose from "mongoose";
import { STATUSES } from "@/lib/albumOptions";

// 스키마(schema): DB에 저장할 앨범 한 개가 어떤 칸들로 이루어지는지 정한 설계도입니다.
const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    artist: { type: String, required: true, trim: true, maxlength: 200 },
    releaseDate: { type: Date, required: true },
    // "들을 예정"일 때는 비어 있을 수 있어서 기본값을 null(없음)로 둡니다.
    listenedDate: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: { type: String, required: true, enum: STATUSES },
    memo: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  {
    // createdAt(만든 시각), updatedAt(고친 시각)을 자동으로 기록합니다.
    timestamps: true,
  }
);

// 모델(model): 스키마를 바탕으로 DB에 저장·조회할 때 쓰는 도구입니다.
// 개발 중에는 코드를 고칠 때마다 이 파일이 다시 실행되는데,
// 같은 이름의 모델을 두 번 만들면 오류가 나므로 이미 있으면 그것을 씁니다.
const Album = mongoose.models.Album || mongoose.model("Album", albumSchema);

export default Album;
