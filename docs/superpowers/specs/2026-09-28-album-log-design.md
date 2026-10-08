# 앨범 기록 (Album Log) 설계

- 작성: 2026-09-28 / 최종 수정: 2026-10-08 (구현 완료 상태 반영)
- 상태: **1단계(등록·목록·상세) + 2단계(수정·삭제·검색) 구현 완료**, PR #2 리뷰 피드백 반영 완료
- 범위 밖(3단계): 그룹/플레이리스트, 앨범 사진 첨부, 정렬·통계, 목록 페이지 나누기, 로그인

## 개요

내가 들은 음악(앨범)을 기록하는 웹 앱. `my-project`(Next.js 14 App Router + TypeScript + Tailwind) 위에 만들고, 데이터는 MongoDB Atlas의 `album-log` DB에 mongoose로 저장한다.

구현 방식: **서버 컴포넌트가 DB를 직접 읽고, 등록·수정·삭제는 Server Actions로 처리한다.** 별도 REST API는 만들지 않는다(연결 확인용 `/api/health`만 예외).

## 1. 데이터 모델

컬렉션 `albums`, 모델 `Album` (`timestamps: true`로 `createdAt`, `updatedAt` 자동 기록).

| 필드 | 타입 | 규칙 |
|---|---|---|
| `title` 앨범명 | string | 필수, trim, 1~200자 |
| `artist` 아티스트 | string | 필수, trim, 1~200자 |
| `releaseDate` 발매일 | Date | 필수. 미래 날짜 허용(발매 예정 앨범) |
| `listenedDate` 감상일 | Date \| null | 상태가 `들을 예정`이 아니면 필수. 오늘(한국 시간) 이후 불가 |
| `rating` 평점 | number \| null | 1~5, 0.5 단위. 상태가 `들을 예정`이 아니면 필수 |
| `status` 상태 | enum | `들을 예정` / `듣는 중` / `다 들음` / `최애 앨범` 중 하나, 필수 |
| `memo` 메모 | string | 선택, trim, 최대 2000자 |

- 상태·평점 선택지는 `src/lib/albumOptions.ts`에 한 번만 정의해 스키마·검증·폼이 함께 쓴다(폼은 브라우저에서 돌기 때문에 mongoose 모델 파일을 불러올 수 없음).
- **날짜 저장 규칙**
  - 폼과 서버 함수 사이에서는 날짜를 `"YYYY-MM-DD"` 글자로 주고받는다.
  - 발매일·감상일은 "날짜만" 있는 값이라 **UTC 자정**으로 저장하고, 읽을 때도 UTC 기준(`toISOString().slice(0, 10)`)으로 글자로 되돌린다. 시간대 때문에 하루씩 밀리지 않게 하기 위해서다.
  - `createdAt`은 "실제로 저장한 순간"이라 화면에 보여줄 때 **한국 시간**으로 바꾼다.
- 화면에는 DB 값을 그대로 넘기지 않고, 아이디·날짜를 글자로 바꾼 `AlbumItem` 모양으로 넘긴다(`src/lib/albums.ts`).

## 2. 화면(URL)

| URL | 화면 | 단계 |
|---|---|---|
| `/` | `/albums`로 리다이렉트 | - |
| `/albums` | 목록: 검색창, 카드/표 전환, 등록 버튼 | 1, 2 |
| `/albums/new` | 등록 폼 | 1 |
| `/albums/[id]` | 상세: 전체 정보·메모·기록일, 수정·삭제 버튼 | 1, 2 |
| `/albums/[id]/edit` | 수정 폼 (등록 폼 재사용, 기존 값 채움) | 2 |
| `/api/health` | DB 연결 확인. `{ ok: true }` / `{ ok: false }`만 응답 | - |

- **목록 정렬**: 최신 등록순(`createdAt` 내림차순). 사용자 정렬 기능은 3단계.
- **카드/표 전환**: URL 쿼리 `?view=table`(기본은 카드). 새로고침·뒤로가기에도 유지. 검색 중이면 검색어도 함께 유지.
- **검색**: URL 쿼리 `?q=검색어`. 앨범명 또는 아티스트에 검색어가 포함되면 결과에 포함, 대소문자 무시. 앞뒤 공백 제거·100자 제한, 정규식 특수문자는 이스케이프해서 글자 그대로 찾는다. 검색창은 자바스크립트 없는 HTML 폼(`<form action="/albums">`)이다.
- **삭제**: 상세 화면의 삭제 버튼 → 브라우저 `confirm` 창(앨범명 표시) → 확인 시 DB에서 완전히 삭제 후 `/albums`로 이동. 이미 없는 앨범을 지우면 성공으로 처리.
- **등록·수정 성공 시** 해당 앨범의 상세 화면으로 이동한다(`router.push` + `router.refresh`).
- **날짜 입력**: shadcn Calendar + Popover로 만든 `DatePicker`. 달력 위에 연·월 선택 목록(`captionLayout="dropdown"`, 1950년~내년), 한국어 표시. 감상일은 오늘(한국 시간) 이후를 고를 수 없다.

## 3. 파일 구조

```
src/
  app/
    page.tsx                    / → /albums 리다이렉트
    api/health/route.ts         DB 연결 확인 (내부 정보 없이 ok만 응답)
    albums/
      actions.ts                Server Actions: createAlbum, updateAlbum, deleteAlbum
      page.tsx                  목록 (검색, 카드/표)
      error.tsx                 DB 오류 화면 (다시 시도 = refresh + reset)
      new/page.tsx              등록
      [id]/page.tsx             상세
      [id]/not-found.tsx        없는 앨범 안내
      [id]/edit/page.tsx        수정
  components/
    AlbumForm.tsx               등록·수정 공용 폼 (클라이언트)
    AlbumCards.tsx              카드 보기
    AlbumTable.tsx              표 보기
    ViewToggle.tsx              카드/표 전환
    SearchBar.tsx               검색창
    DatePicker.tsx              달력 날짜 선택 (클라이언트)
    DeleteButton.tsx            삭제 확인 + 실행 (클라이언트)
    ui/                         shadcn 컴포넌트 (button, calendar, popover)
  lib/
    mongodb.ts                  DB 연결 connectDB() (연결 캐시)
    albums.ts                   조회: listAlbums(searchText), getAlbum(id), AlbumItem 변환
    albumOptions.ts             상태·평점 선택지 (폼·검증·모델 공용)
    validateAlbum.ts            입력 검사 validateAlbum(), isAlbumFormValues(), todayInKorea()
    albumFormValues.ts          AlbumItem → 폼 값 변환 (수정 화면용)
    albumId.ts                  아이디 모양 검사 isValidId()
    search.ts                   검색어 정리 cleanSearchText(), 이스케이프 escapeSearchText()
    format.ts                   화면 표시 formatDate(), formatRating()
    dateText.ts                 날짜 글자 ↔ Date: textToDate(), koreaToday()
    utils.ts                    shadcn 도우미 cn()
  models/
    Album.ts                    mongoose 스키마
```

## 4. 입력 검증

- 규칙은 `src/lib/validateAlbum.ts`에 if문으로 된 함수 하나로 정의한다(초보자가 읽기 쉽도록 zod 대신 직접 작성).
- Server Action은 저장 전에 항상 이 규칙으로 검사한다(브라우저 검사는 우회 가능하므로). 수정 시에는 `runValidators: true`로 스키마 규칙도 다시 검사한다.
- **타입 검사**: 서버 함수는 `unknown`으로 값을 받고, `isAlbumFormValues`로 7개 칸이 모두 글자인지 먼저 확인한다. 아니면 `.trim()` 등을 하지 않고 안내문을 돌려준다.
- **날짜 검사**: `YYYY-MM-DD` 모양만 허용하고, 날짜로 바꿨다가 다시 글자로 되돌렸을 때 원문과 같아야 한다(2월 30일 같은 없는 날짜 거부).
- **감상일 미래 금지**: "오늘"은 `todayInKorea()`(Asia/Seoul) 기준. 달력(`koreaToday()`)과 서버가 같은 함수를 써서 기준이 어긋나지 않는다.
- **아이디 검사**: 주소의 아이디는 24자리 0-9a-f인지 먼저 확인한다(`isValidId`). 모양이 틀리면 DB에 묻지 않고 404/안내문으로 처리한다.
- 폼에는 HTML 속성(`required`, `maxLength`)으로 기본 검사를 건다. 상태가 `들을 예정`이면 평점·감상일 칸을 "선택"으로 표시하고 `required`를 해제한다.
- 상태가 `들을 예정`으로 저장될 때 비어 있는 평점·감상일은 null로 저장한다.

## 5. 에러 처리

| 상황 | 처리 |
|---|---|
| 입력 검증 실패 | 폼 유지, 칸별 오류 문구 표시, 입력값 보존 |
| 서버 함수 호출 자체 실패 (연결 끊김, 배포 직후 옛 화면) | `try/catch`로 버튼 복구 + "결과를 확인하지 못했어요" 안내(`role="alert"`) |
| 없는 앨범 / 잘못된 id 형식 | `notFound()` → "앨범을 찾을 수 없어요" |
| 수정 중 앨범이 지워짐 | "이미 삭제된 앨범이에요" |
| DB 연결·조회 실패 | `app/albums/error.tsx`에서 안내 + 다시 시도(`router.refresh()` + `reset()`) |
| 검색 결과 없음 | "'검색어'에 맞는 앨범이 없어요" + 검색 초기화 링크 |
| 앨범 0개 | "첫 앨범을 기록해 보세요" + 등록 버튼 |
| health 확인 실패 | 응답은 `{ ok: false }`(500)만, 오류 원문은 `console.error`로 서버 로그에만 |

- 저장·삭제·다시 시도 중에는 버튼을 잠가 중복 요청을 막는다.

## 6. 접근성

- 입력칸 7개에 `aria-invalid`(틀린 칸)와 `aria-describedby`(오류 문구 `id`)를 연결해, 화면 낭독기가 "칸 이름, 잘못된 입력, 오류 문구"를 함께 읽는다. 달력 칸은 `DatePicker`가 받아서 안쪽 버튼에 붙인다.
- 카드/표 전환은 `<nav aria-label="보기 방식">`으로 묶고, 선택된 링크에 `aria-current="page"`를 붙인다.

## 7. 테스트

- **자동 테스트(vitest, `npm test`)**: 89개
  - 순수 함수: 입력 검증(타입·날짜·미래 감상일·한국 자정 전후), 아이디 검사, 검색어 정리·이스케이프, 표시 형식, 폼 값 변환, 날짜 글자 변환.
  - 서버 함수: `actions.test.ts`(DB를 가짜로 바꿔 저장 흐름 확인), `/api/health` 응답에 내부 정보가 없는지.
  - 화면(jsdom + Testing Library): 요청 실패 시 버튼 복구, 오류 화면 다시 시도, 접근성 속성.
- **실제 동작 확인**: 개발 서버 + 브라우저로 등록 → 목록(카드/표) → 상세 → 수정 → 검색 → 삭제. Atlas 확인용 데이터는 `__CHECK__` 이름으로 만들고 확인 후 삭제한다.
- **완료 조건**: `tsc`, `npm run lint`, `npm run build`, `npm test` 통과 + 위 동작 확인 완료.

## 8. 의존성

- 앱: `next@14`, `react@18`, `mongoose`, shadcn 관련(`react-day-picker`, `date-fns`, `@radix-ui/react-popover`, `@radix-ui/react-slot`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate`)
- 개발: `vitest@4`(v5는 @types/node 20과 호환되지 않음), `@testing-library/react`, `jsdom`
- **shadcn 설정 주의**: 프로젝트는 Tailwind v3이라 `shadcn@2.3.0`(v3 지원판)으로 설정했다. 색상 변수가 `oklch(...)` 형식이라 `tailwind.config.ts`에서는 `hsl()`로 감싸지 않고 `var(--x)`로 그대로 쓴다(감싸면 색이 무효가 되어 달력 배경이 투명해짐). 그 대신 `bg-popover/50` 같은 `/숫자` 투명도 문법은 shadcn 색상에서 동작하지 않는다.

## 9. 보안·운영 메모

- **로그인 없음**: 구현하지 않기로 결정했다. 배포 주소를 아는 누구나 수정·삭제할 수 있으므로, Vercel의 **Deployment Protection**으로 접근을 막는다.
- `.env.local`(MONGODB_URI)은 git에 올리지 않고, `.env.example`에 형식만 둔다.
- Atlas 무료(M0)는 자동 백업이 없어 삭제한 데이터는 복구할 수 없다.

## 10. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-09-28 | 최초 설계 (1·2단계 범위, 서버 컴포넌트 + Server Actions) |
| 2026-09-30 | 발매일·감상일 입력을 shadcn 달력으로 변경 |
| 2026-10-01 ~ 10-07 | 목록, 상세, 수정, 삭제, 검색 구현 (2단계 완성) |
| 2026-10-07 ~ 10-08 | PR #2 리뷰 반영: 날짜·입력 타입 검사 강화, 요청 실패 처리, 오류 화면 다시 시도, health 정보 숨김, 접근성, 달력 오늘 기준 통일 (PR #3) |
