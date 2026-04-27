# StyleAI - AI 패션 큐레이팅 플랫폼 (Mock 데모)

## Project Entry Point

사용자가 자연어로 스타일을 입력하면 AI가 상품을 큐레이팅해주는 웹 서비스 **데모**.
정부지원사업 발표용 UI 프로토타입 — **외부 API 없이 Mock 데이터로만 동작**.

## Framework References

@PRINCIPLES.md
@RULES.md
@DEVELOPMENT_CHECKLIST.md

## Project Documents

@PRD.md (루트) — 전체 기획서 (Mock 로직, 데이터 구조, 화면 구성)
@TASKS.md (루트) — Claude Code 작업 순서 (TASK 01~15)

## Tech Stack

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript | |
| Styling | Tailwind CSS + shadcn/ui | |
| 상태 관리 | React Context + localStorage | 세션/찜 목록 |
| 데이터 | `public/mock-products.json` | 정적 JSON |
| Deploy | Vercel | 환경변수 불필요 |

**외부 의존성 없음** — AI/DB/Auth 모두 Mock.

## Key Constraints

1. **언어**: 한국어 인터페이스
2. **Mock 데모**: 모든 기능이 "있는 것처럼" 보이면 OK
3. **외부 API 금지**: Anthropic/OpenAI/Gemini/Naver/Supabase 전부 미사용
4. **보안 계층 불필요**: 인증/암호화 없음, UI만 존재

## User Roles

| 역할 | 접근 방식 |
|------|-----------|
| 비로그인 | 큐레이션 시연 가능 |
| 일반 유저 | 로그인 UI 통과 (이메일만 입력) |
| 어드민 | `admin@demo.com` 으로 로그인 시 `/admin` 접근 |

## Data Layer

- **상품 데이터**: `public/mock-products.json` (30~50개 샘플)
- **찜 목록**: `localStorage` (`styleai_wishlist`)
- **세션**: `localStorage` (`styleai_user`) + React Context
- **어드민 모델 선택**: `localStorage` (`styleai_active_model`)

## Deploy

Vercel에 GitHub 연동 후 자동 배포. 환경변수 설정 없음.

## 추후 실제 API 연동 시

`PRD.md` 섹션 11 참조. UI 컴포넌트/페이지 구조는 유지되고, `lib/mock-*` 파일만 교체하면 됨.
