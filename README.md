# StyleAI — AI 패션 큐레이팅 (Mock 데모)

자연어로 원하는 스타일을 입력하면 AI가 상품을 큐레이팅해주는 웹 서비스의 **데모 프로토타입**입니다. 외부 API 없이 Mock 데이터만으로 동작합니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Context + localStorage (세션/찜 목록)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

**환경변수 설정 불필요** — `.env.local` 파일 없이 바로 동작합니다.

## 데모 계정

- **일반 유저**: 아무 이메일 (`example@test.com` 등) + 8자 이상 비밀번호
- **어드민**: `admin@demo.com` + 8자 이상 비밀번호 → `/admin` 접근 가능

> 실제 인증은 없습니다. 입력 형식 검증만 수행하고 localStorage에 세션을 저장합니다.

## 주요 화면

| 경로 | 설명 |
|------|------|
| `/` | 스타일 입력 홈 |
| `/result` | 큐레이션 결과 |
| `/wishlist` | 찜 목록 (로그인 필요) |
| `/login`, `/signup` | 더미 인증 |
| `/admin` | 어드민 대시보드 (고정 mock 통계) |
| `/admin/settings` | API 키 입력 UI (저장 동작 없음) |

## Vercel 배포

```bash
git init
git add .
git commit -m "init styleai demo"
# GitHub 리포지토리 생성 후:
git remote add origin <repo-url>
git push -u origin main
```

Vercel 대시보드 → Import → 리포지토리 선택 → Deploy.
환경변수 설정 없이 바로 배포됩니다.

## Mock 로직

- **Mock AI** (`lib/mock-ai.ts`): 한국어 키워드 사전 기반 매칭으로 스타일 태그 추출 + "n만원" 패턴으로 예산 파싱
- **Mock 상품** (`public/mock-products.json`): 40개 샘플 상품, 태그 기반 스코어링으로 필터링
- **API** (`/api/curate`): 2초 지연을 추가하여 실제 AI 처리처럼 보이게 시뮬레이션

## 추후 실제 API 연동

`PRD.md` 섹션 11 참조. UI/페이지 구조는 유지되고 `lib/mock-*` 파일만 교체하면 됩니다.
