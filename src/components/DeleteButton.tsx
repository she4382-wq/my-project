"use client";
// ↑ 확인창을 띄우고 클릭에 반응해야 해서 브라우저에서 실행됩니다.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAlbum } from "@/app/albums/actions";

type DeleteButtonProps = {
  albumId: string; // 지울 앨범의 아이디
  albumTitle: string; // 확인창에 보여줄 앨범명
};

export default function DeleteButton({ albumId, albumTitle }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 중인지
  const [message, setMessage] = useState(""); // 실패했을 때 안내문
  const router = useRouter(); // 다른 화면으로 이동할 때 쓰는 도구

  // [삭제] 버튼을 누르면 실행됩니다.
  async function handleClick() {
    // 1) 정말 지울지 물어봅니다.
    //    confirm()은 브라우저 기본 확인창을 띄우고, [확인]이면 true, [취소]면 false를 돌려줘요.
    const answer = window.confirm(`"${albumTitle}" 앨범을 삭제할까요?\n삭제하면 되돌릴 수 없어요.`);
    if (!answer) {
      return; // 취소를 눌렀으면 여기서 끝
    }

    // 2) 서버에 삭제를 요청합니다.
    setIsDeleting(true);
    setMessage("");
    const result = await deleteAlbum(albumId);

    if (result.ok) {
      // 3) 성공: 목록 화면으로 이동합니다. refresh로 지워진 앨범이 목록에 남아 보이지 않게 해요.
      router.push("/albums");
      router.refresh();
    } else {
      // 3) 실패: 안내문을 보여주고 버튼을 다시 누를 수 있게 합니다.
      setIsDeleting(false);
      setMessage(result.message);
    }
  }

  // 버튼에 보여줄 글자
  let buttonText = "삭제";
  if (isDeleting) {
    buttonText = "삭제 중...";
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDeleting}
        className="rounded border border-red-500 px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
      >
        {buttonText}
      </button>
      {message && <p className="mt-1 text-sm text-red-500">{message}</p>}
    </div>
  );
}
