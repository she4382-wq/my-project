// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const actions = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), remove: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("@/app/albums/actions", () => ({ createAlbum: actions.create, updateAlbum: actions.update, deleteAlbum: actions.remove }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: actions.push, refresh: actions.refresh }) }));
vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a> }));
vi.mock("@/components/DatePicker", () => ({ default: ({ id, value }: { id: string; value: string }) => <input id={id} value={value} readOnly /> }));
import AlbumForm from "./AlbumForm";
import DeleteButton from "./DeleteButton";

const id = "507f1f77bcf86cd799439011";
const values = { title: "테스트 앨범", artist: "아티스트", releaseDate: "2024-02-29", listenedDate: "", rating: "", status: "들을 예정", memo: "유지할 메모" };
beforeEach(() => { vi.resetAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function submitForm() {
  fireEvent.submit(screen.getByRole("button", { name: /저장하기|수정 완료|저장 중/ }).closest("form")!);
}

describe.each(["등록", "수정"] as const)("%s 요청", (mode) => {
  function showForm() {
    render(<AlbumForm albumId={mode === "수정" ? id : undefined} initialValues={values} />);
    return mode === "수정" ? actions.update : actions.create;
  }
  const buttonText = mode === "수정" ? "수정 완료" : "저장하기";

  it("호출 예외가 나면 버튼을 복구하고 입력을 유지하며 재시도할 수 있다", async () => {
    const request = showForm();
    request.mockRejectedValueOnce(new Error("Failed to find Server Action"));
    submitForm();
    await screen.findByRole("alert");
    expect(screen.getByRole("alert").textContent).toContain("저장 결과를 확인하지 못했어요");
    expect((screen.getByRole("button", { name: buttonText }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByLabelText(/앨범명/) as HTMLInputElement).value).toBe(values.title);
    expect((screen.getByLabelText(/메모/) as HTMLTextAreaElement).value).toBe(values.memo);
    expect(actions.push).not.toHaveBeenCalled();

    let finish!: (result: { ok: boolean; errors: Record<string, string>; id: string }) => void;
    request.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    submitForm();
    expect(screen.queryByRole("alert")).toBeNull();
    expect((screen.getByRole("button", { name: "저장 중..." }) as HTMLButtonElement).disabled).toBe(true);
    // 처리 중 다시 제출해도 서버 요청은 늘어나지 않습니다.
    submitForm();
    expect(request).toHaveBeenCalledTimes(2);
    await act(async () => { finish({ ok: true, errors: {}, id }); });
    expect(actions.push).toHaveBeenCalledWith(`/albums/${id}`);
    expect(actions.refresh).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("button", { name: "저장 중..." }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("서버가 반환한 입력 오류도 표시하고 버튼을 복구한다", async () => {
    const request = showForm();
    request.mockResolvedValueOnce({ ok: false, errors: { title: "앨범명을 확인해 주세요." }, id: "" });
    submitForm();
    await screen.findByText("앨범명을 확인해 주세요.");
    expect((screen.getByRole("button", { name: buttonText }) as HTMLButtonElement).disabled).toBe(false);
    expect(actions.push).not.toHaveBeenCalled();
  });
});

describe("삭제 요청", () => {
  function showDelete() {
    render(<DeleteButton albumId={id} albumTitle={values.title} />);
    return vi.spyOn(window, "confirm").mockReturnValue(true);
  }
  it("호출 예외가 나면 안내하고 버튼을 복구한 뒤 재시도할 수 있다", async () => {
    showDelete();
    actions.remove.mockRejectedValueOnce(new Error("Network error"));
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("alert").textContent).toContain("삭제 결과를 확인하지 못했어요");
    expect((screen.getByRole("button", { name: "삭제" }) as HTMLButtonElement).disabled).toBe(false);
    expect(actions.push).not.toHaveBeenCalled();
    actions.remove.mockResolvedValueOnce({ ok: true, message: "" });
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.queryByRole("alert")).toBeNull();
    await waitFor(() => expect(actions.push).toHaveBeenCalledWith("/albums"));
    expect(actions.remove).toHaveBeenCalledTimes(2);
    expect(actions.refresh).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("button", { name: "삭제 중..." }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("서버가 반환한 삭제 오류도 표시하고 버튼을 복구한다", async () => {
    showDelete();
    actions.remove.mockResolvedValueOnce({ ok: false, message: "삭제하지 못했어요." });
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("alert").textContent).toBe("삭제하지 못했어요.");
    expect((screen.getByRole("button", { name: "삭제" }) as HTMLButtonElement).disabled).toBe(false);
    expect(actions.push).not.toHaveBeenCalled();
  });
  it("확인창을 취소하면 서버에 삭제 요청을 보내지 않는다", () => {
    showDelete().mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(actions.remove).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: "삭제" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
