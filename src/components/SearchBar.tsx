// 검색창입니다. 자바스크립트 없이 평범한 HTML 폼으로 동작해요.
// [검색]이나 엔터를 누르면, 브라우저가 알아서 /albums?q=입력한글자 로 이동합니다.
// (form의 action 주소에, 입력칸의 name="q"와 값을 붙여서 이동하는 게 HTML 폼의 기본 동작이에요)

type SearchBarProps = {
  searchText: string; // 지금 검색 중인 글자 (검색창에 미리 채워둘 값)
  view: string; // 지금 보기 모드 ("card" 또는 "table")
};

export default function SearchBar({ searchText, view }: SearchBarProps) {
  return (
    <form action="/albums" className="mb-4 flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={searchText}
        placeholder="앨범명 또는 아티스트 검색"
        maxLength={100}
        className="min-w-0 flex-1 rounded border border-gray-400 bg-transparent px-3 py-2"
      />

      {/* 표 보기 중이었다면, 검색해도 표 보기가 유지되도록 view=table도 같이 보냅니다.
          type="hidden": 화면에는 안 보이지만 폼과 함께 보내지는 칸 */}
      {view === "table" && <input type="hidden" name="view" value="table" />}

      <button type="submit" className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground">
        검색
      </button>
    </form>
  );
}
