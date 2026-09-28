# 앨범 기록 (Album Log) 설계

- 날짜: 2026-09-28
- 목표 범위: 1단계(등록·목록·상세) + 2단계(수정·삭제·검색)
- 범위 밖(3단계): 그룹/플레이리스트, 앨범 사진 첨부, 정렬·통계

## 개요

내가 들은 음악(앨범)을 기록하는 웹 앱. 기존 `my-project`(Next.js 14 App Router + TypeScript + Tailwind) 위에 만들고, 데이터는 MongoDB Atlas의 `album-log` DB에 mongoose로 저장한다.

구현 방식: **서버 컴포넌트가 DB를 직접 읽고, 등록·수정·삭제는 Server Actions로 처리한다.** 별도 REST API는 만들지 않는다.

## 1. 데이터 모델

컬렉션 `albums`, 모델 `Album` (`timestamps: true`로 `createdAt`, `updatedAt` 자동 기록).

| 필드 | 타입 | 규칙 |
|---|---|---|
| `title` 앨범명 | string | 필수, trim, 1~200자 |
| `artist` 아티스트 | string | 필수, trim, 1~200자 |
| `releaseDate` 발매일 | Date | 필수 |
| `listenedDate` 감상일 | Date | 상태가 `들을 예정`이 아니면 필수, `들을 예정`이면 선택 |
| `rating` 평점 | number | 1~5, 0.5 단위. 상태가 `들을 예정`이 아니면 필수, `들을 예정`이면 선택 |
| `status` 상태 | enum | `들을 예정` / `듣는 중` / `다 들음` / `최애 앨범` 중 하나, 필수 |
| `memo` 메모 | string | 선택, trim, 최대 2000자 |

- 날짜는 문자열이 아닌 Date로 저장한다(날짜 선택기 사용, 이후 날짜순 정렬 대비).
- 상태 목록은 `src/models/Album.ts`에서 상수 배열 하나로 정의해 스키마·검증·폼이 함께 쓴다.

## 2. 화면(URL)

| URL | 화면 | 단계 |
|---|---|---|
| `/` | `/albums`로 리다이렉트 | - |
| `/albums` | 목록: 카드/표 전환, 검색창, 등록 버튼 | 1, 2 |
| `/albums/new` | 등록 폼 | 1 |
| `/albums/[id]` | 상세: 전체 정보와 메모, 수정·삭제 버튼 | 1, 2 |
| `/albums/[id]/edit` | 수정 폼 (등록 폼 재사용, 기존 값 채움) | 2 |

- **목록 정렬**: 최신 등록순(`createdAt` 내림차순). 사용자 정렬 기능은 3단계.
- **카드/표 전환**: URL 쿼리 `?view=table`(기본은 카드). 새로고침·뒤로가기에도 유지.
- **검색**: URL 쿼리 `?q=검색어`. 앨범명 또는 아티스트에 검색어가 포함되면 결과에 포함, 대소문자 무시. 검색어의 정규식 특수문자는 이스케이프해서 글자 그대로 찾는다. 검색과 보기 모드는 함께 유지된다.
- **삭제**: 상세 화면의 삭제 버튼 → 브라우저 `confirm` 창 → 확인 시 삭제 후 `/albums`로 이동.
- 등록·수정 성공 시 해당 앨범의 상세 화면으로 이동한다.

## 3. 파일 구조

```
src/
  lib/mongodb.ts                  (기존) DB 연결 connectDB()
  lib/albumSchema.ts              zod 검증 규칙 (서버·테스트 공용)
  lib/albums.ts                   조회 함수: listAlbums(q), getAlbum(id), 검색어 이스케이프
  models/Album.ts                 mongoose 스키마, 상태 상수
  app/page.tsx                    /albums로 리다이렉트
  app/albums/actions.ts           Server Actions: createAlbum, updateAlbum, deleteAlbum
  app/albums/page.tsx             목록
  app/albums/error.tsx            DB 오류 화면 (재시도 버튼)
  app/albums/new/page.tsx         등록
  app/albums/[id]/page.tsx        상세
  app/albums/[id]/edit/page.tsx   수정
  components/AlbumForm.tsx        등록·수정 공용 폼 (클라이언트)
  components/AlbumCards.tsx       카드 보기
  components/AlbumTable.tsx       표 보기
  components/ViewToggle.tsx       카드/표 전환
  components/SearchBar.tsx        검색창
  components/DeleteButton.tsx     삭제 확인 + 실행 (클라이언트)
```

기존 `src/app/api/health/route.ts`는 연결 확인용으로 유지한다.

## 4. 입력 검증

- 규칙은 `src/lib/albumSchema.ts`에 zod로 한 번만 정의한다.
- Server Action은 저장 전에 항상 이 규칙으로 검사한다(브라우저 검사는 우회 가능하므로).
- 폼에는 HTML 속성(`required`, `min`/`max`/`step`, `maxLength`)으로 기본 검사를 건다. 상태가 `들을 예정`이면 평점·감상일 칸을 "선택"으로 표시하고 `required`를 해제한다.
- 상태가 `들을 예정`으로 저장될 때 비어 있는 평점·감상일은 저장하지 않는다(null).

## 5. 에러 처리

| 상황 | 처리 |
|---|---|
| 입력 검증 실패 | 폼 유지, 칸별 오류 문구 표시, 입력값 보존 |
| 없는 앨범 / 잘못된 id 형식 | `notFound()` → 404 |
| DB 연결·조회 실패 | `app/albums/error.tsx`에서 안내 + 재시도 버튼 |
| 검색 결과 없음 | "검색 결과가 없어요" + 검색 초기화 링크 |
| 앨범 0개 | "첫 앨범을 기록해 보세요" + 등록 버튼 |

## 6. 테스트

- **자동 테스트(vitest, `npm test`)**: DB 없이 도는 단위 테스트.
  - 검증 규칙: 필수값 누락, 글자 수 제한, 평점 범위·0.5 단위, `들을 예정` 예외, 잘못된 상태값.
  - 검색어 이스케이프: 특수문자가 글자 그대로 검색되는지.
- **실제 동작 확인**: 개발 서버 + 브라우저로 등록 → 목록(카드/표) → 상세 → 수정 → 검색 → 삭제 한 바퀴. 확인 후 테스트 데이터는 삭제한다.
- **완료 조건**: `tsc`, `npm run lint`, `npm run build`, `npm test` 통과 + 위 동작 확인 완료.

## 7. 추가 의존성

- `zod` (검증), `vitest` (개발용 테스트)
- 스타일은 기존 Tailwind 기본 수준. 별도 디자인 작업은 범위 밖.
