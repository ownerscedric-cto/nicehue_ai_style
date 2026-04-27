# 개발 필수 체크리스트 (Mock 데모)

**새 세션이 시작되면 가장 먼저 이 파일을 읽으세요!**

---

## 세션 시작 시 확인

1. `.claude/CLAUDE.md` — 프로젝트 개요, Mock 데모 범위
2. `.claude/DEVELOPMENT_CHECKLIST.md` (이 파일) — 개발 가이드라인
3. `TASKS.md` — 현재 진행할 TASK 번호 확인
4. `PRD.md` — 해당 TASK 관련 상세 스펙 참조

---

## TASK 시작 전 (MANDATORY)

- [ ] `TASKS.md`에서 현재 TASK 내용과 의존성 확인
- [ ] 의존 TASK가 모두 완료되었는지 확인
- [ ] `PRD.md` 관련 섹션 참조
- [ ] `TodoWrite`로 작업 계획 수립 (3개 이상 세분화)

---

## 코드 작성 중 (MANDATORY)

### 공통

- [ ] **Read before Write/Edit** — 항상 Read 도구 먼저 사용
- [ ] **절대 경로** 사용
- [ ] **기존 패턴 준수** — `lib/types.ts` 타입, `lib/mock-*` 구조
- [ ] 명시적 요청 없이 자동 커밋 금지

### Mock 데이터 / API 개발 시

- [ ] 실제 외부 API 호출 금지 (Anthropic/OpenAI/Gemini/Naver/Supabase)
- [ ] 에러 응답 형식 통일: `{ error: string }`
- [ ] Mock 함수 시그니처는 실제 API 인터페이스와 유사하게 유지 (추후 교체 용이)
- [ ] 로딩 UX를 위한 `setTimeout` 지연 추가 (2초 권장)
- [ ] 파싱 실패 시 throw 하지 않고 빈 배열/기본값 반환

### 프론트엔드 개발 시

- [ ] **shadcn/ui** 컴포넌트 우선 사용
- [ ] **Tailwind CSS** 유틸리티 클래스 사용
- [ ] 반응형: 모바일(375px) 1열 / 태블릿(768px) 2열 / 데스크탑(1280px) 3열
- [ ] 로딩 상태 표시 (특히 큐레이션 단계별 메시지)
- [ ] 에러 시 토스트 알림
- [ ] localStorage 키 네이밍: `styleai_` 프리픽스

### Mock 데이터 변경 시

- [ ] `public/mock-products.json` 수정 시 태그 일관성 유지
- [ ] `lib/mock-ai.ts` STYLE_KEYWORDS 사전 업데이트 시 새 태그가 상품에 존재하는지 확인
- [ ] `PRD.md` 섹션 7 (Mock 데이터 구조) 동시 업데이트

---

## TASK 완료 전 (MANDATORY)

### Quality Gates

1. [ ] **Syntax** — 문법 오류 없음
2. [ ] **Type Check** — TypeScript 타입 오류 없음 (`npx tsc --noEmit`)
3. [ ] **Lint** — ESLint 경고 없음 (`npm run lint`)
4. [ ] **외부 의존성 확인** — `package.json`에 AI/DB/Auth 패키지 없는지 확인
5. [ ] **Build** — 빌드 정상 (`npm run build`)
6. [ ] **Dev** — 개발 서버 정상 (`npm run dev`)

### TodoWrite 업데이트

- [ ] 완료된 작업은 **즉시** `completed` 상태로 변경
- [ ] 새로 발견된 작업은 추가
- [ ] 불필요한 작업은 제거

---

## TASK별 핵심 체크포인트

| TASK | 완료 확인 기준 |
|------|----------------|
| 01 | `npm run dev` 정상 실행, 불필요한 패키지(next-auth, supabase 등) 미설치 확인 |
| 02 | `lib/types.ts` 생성, Product/CurationResult/User/WishlistItem 타입 정의 |
| 03 | `public/mock-products.json` 30~50개 상품, 태그 다양성 확보 |
| 04 | `lib/mock-ai.ts` — 입력 prompt → 키워드/태그/예산 추출 동작 |
| 05 | `lib/mock-products.ts` — 필터링 + 스코어링 + reason 부여 |
| 06 | `POST /api/curate` 정상 응답, 2초 지연 반영 |
| 07 | `SessionContext` 로그인 상태 유지 (새로고침 후에도) |
| 08 | 로그인/회원가입 폼 검증, 제출 시 Context 업데이트 |
| 09 | Header에 로그인 상태별 버튼 표시 |
| 10 | 스타일 입력 → 로딩 → /result 이동 |
| 11 | 상품 카드 3열 그리드, 클릭 시 외부 링크 이동 |
| 12 | 찜 추가/해제 localStorage 반영, 낙관적 업데이트 |
| 13 | 어드민 대시보드 고정 mock 통계 표시 |
| 14 | API 키 입력 UI, 저장/검증 버튼 토스트만 표시 |
| 15 | Vercel 배포 성공 (환경변수 없이) |

---

## 절대 금지 사항

- ❌ 프레임워크 문서를 확인하지 않고 작업 시작
- ❌ Read 없이 Write/Edit 사용
- ❌ **실제 외부 API 호출 (Anthropic/OpenAI/Gemini/Naver/Supabase)**
- ❌ **인증/암호화 라이브러리 설치 (next-auth, bcrypt 등)**
- ❌ `.env.local` 환경변수 설정
- ❌ Quality Gates 생략
- ❌ 명시적 요청 없이 자동 커밋

---

## 핵심 원칙 요약

**"Evidence > assumptions | Code > documentation | Efficiency > verbosity"**

- 데모 우선 — "있는 것처럼" 보이면 OK
- PRD.md가 단일 진실 소스 (Single Source of Truth)
- Mock 함수 시그니처는 실제 API와 유사하게 유지 (추후 교체 대비)
- Vercel 배포 시 환경변수 설정 불필요
