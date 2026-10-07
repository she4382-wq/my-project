import Link from "next/link";

// [카드 | 표] 전환 버튼. 사실은 주소를 바꾸는 링크 두 개입니다.
// 카드: /albums   표: /albums?view=table
// 검색 중이면 검색어(q)도 주소에 붙여서, 보기를 바꿔도 검색 결과가 유지되게 합니다.
export default function ViewToggle({ view, searchText }: { view: string; searchText: string }) {
  const selected = "bg-primary text-primary-foreground";
  const notSelected = "hover:bg-accent";

  let cardClass = notSelected;
  let tableClass = notSelected;
  if (view === "table") {
    tableClass = selected;
  } else {
    cardClass = selected;
  }

  // 링크 주소 만들기
  // encodeURIComponent: 한글·띄어쓰기·특수문자를 주소에 넣을 수 있는 모양으로 바꿔줍니다. (예: "아이유" → "%EC%95%84...")
  let cardHref = "/albums";
  let tableHref = "/albums?view=table";
  if (searchText !== "") {
    const q = encodeURIComponent(searchText);
    cardHref = "/albums?q=" + q;
    tableHref = "/albums?view=table&q=" + q;
  }

  return (
    <div className="inline-flex overflow-hidden rounded-md border text-sm">
      <Link href={cardHref} className={`px-3 py-1.5 ${cardClass}`}>
        카드
      </Link>
      <Link href={tableHref} className={`border-l px-3 py-1.5 ${tableClass}`}>
        표
      </Link>
    </div>
  );
}
