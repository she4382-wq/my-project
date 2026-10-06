import Link from "next/link";

// [카드 | 표] 전환 버튼. 사실은 주소를 바꾸는 링크 두 개입니다.
// 카드: /albums   표: /albums?view=table
export default function ViewToggle({ view }: { view: string }) {
  const selected = "bg-primary text-primary-foreground";
  const notSelected = "hover:bg-accent";

  let cardClass = notSelected;
  let tableClass = notSelected;
  if (view === "table") {
    tableClass = selected;
  } else {
    cardClass = selected;
  }

  return (
    <div className="inline-flex overflow-hidden rounded-md border text-sm">
      <Link href="/albums" className={`px-3 py-1.5 ${cardClass}`}>
        카드
      </Link>
      <Link href="/albums?view=table" className={`border-l px-3 py-1.5 ${tableClass}`}>
        표
      </Link>
    </div>
  );
}
