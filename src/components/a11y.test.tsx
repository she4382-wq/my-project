// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

const actions = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("@/app/albums/actions", () => ({ createAlbum: actions.create, updateAlbum: actions.update }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: actions.push, refresh: actions.refresh }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a>,
}));
import AlbumForm from "./AlbumForm";
import ViewToggle from "./ViewToggle";

beforeEach(() => { vi.resetAllMocks(); });
afterEach(() => { cleanup(); });

// 서버가 7개 칸 모두 틀렸다고 돌려준 상황
const allErrors = {
  title: "앨범명을 입력해 주세요.",
  artist: "아티스트를 입력해 주세요.",
  status: "상태를 골라 주세요.",
  releaseDate: "발매일을 선택해 주세요.",
  listenedDate: "감상일을 선택해 주세요.",
  rating: "평점을 골라 주세요.",
  memo: "메모는 2000자까지 쓸 수 있어요.",
};

describe("입력 오류 접근성", () => {
  it("처음에는 어느 칸도 틀렸다고 표시하지 않는다", () => {
    render(<AlbumForm />);
    for (const field of Object.keys(allErrors)) {
      const input = document.getElementById(field)!;
      expect(input.getAttribute("aria-invalid")).not.toBe("true");
      expect(input.getAttribute("aria-describedby")).toBeNull();
    }
  });

  it("오류가 나면 칸에 aria-invalid를 켜고, aria-describedby로 오류 문구와 연결한다", async () => {
    actions.create.mockResolvedValueOnce({ ok: false, errors: allErrors, id: "" });
    render(<AlbumForm />);
    fireEvent.submit(screen.getByRole("button", { name: "저장하기" }).closest("form")!);
    await screen.findByText(allErrors.title);

    for (const [field, message] of Object.entries(allErrors)) {
      const input = document.getElementById(field)!;
      expect(input.getAttribute("aria-invalid")).toBe("true");
      // aria-describedby에 적힌 아이디의 글자가 그 칸의 오류 문구여야 해요
      const errorId = input.getAttribute("aria-describedby")!;
      expect(document.getElementById(errorId)?.textContent).toBe(message);
    }
  });
});

describe("보기 전환 접근성", () => {
  it("선택된 보기에만 aria-current=page를 붙인다", () => {
    render(<ViewToggle view="table" searchText="" />);
    expect(screen.getByRole("link", { name: "표" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "카드" }).getAttribute("aria-current")).toBeNull();
  });
});
