// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

// 화면 이동 도구(useRouter)를 가짜로 바꿔서, refresh가 불렸는지 확인합니다.
const router = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: router.refresh }) }));
import AlbumsError from "./error";

beforeEach(() => { vi.resetAllMocks(); });
afterEach(() => { cleanup(); });

describe("목록 오류 화면", () => {
  it("다시 시도를 누르면 서버에서 다시 읽고(refresh) 화면도 다시 그린다(reset)", () => {
    const reset = vi.fn();
    render(<AlbumsError error={new Error("DB 연결 실패")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(router.refresh).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
