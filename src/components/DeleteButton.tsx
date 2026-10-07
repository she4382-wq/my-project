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
    if (isDeleting) return;
    // 1) 정말 지울지 물어봅니다.
    //    confirm()은 브라우저 기본 확인창을 띄우고, [확인]이면 true, [취소]면 false를 돌려줘요.
    const answer = window.confirm(`"${albumTitle}" 앨범을 삭제할까요?\n삭제하면 되돌릴 수 없어요.`);
    if (!answer) {
      return; // 취소를 눌렀으면 여기서 끝
    }

    // 2) 서버에 삭제를 요청합니다.
    setIsDeleting(true);
    setMessage("");
    try {
      const result = await deleteAlbum(albumId);

      if (result.ok) {
        // 성공 후 목록으로 이동하는 동안에는 중복 삭제를 막습니다.
        router.push("/albums");
        router.refresh();
      } else {
        setIsDeleting(false);
        setMessage(result.message);
      }
    } catch {
      // 연결 실패나 오래된 서버 함수 호출 오류도 화면에서 처리합니다.
      setIsDeleting(false);
      setMessage("삭제 결과를 확인하지 못했어요. 연결 상태를 확인하고, 페이지를 새로고침해 삭제 여부를 확인해 주세요.");
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
      {message && <p role="alert" className="mt-1 text-sm text-red-500">{message}</p>}
    </div>
  );
}
