# PRD — AI 패션 큐레이팅 플랫폼 (Mock 데모 버전)

> **목적**: 정부지원사업 발표용 UI 데모 프로토타입
> **버전**: v2.0 (Mock Only)
> **작성일**: 2026-04-19

---

## 1. 프로젝트 개요

### 1.1 서비스 한 줄 설명

사용자가 자연어로 원하는 스타일을 입력하면, AI가 해석하여 패션 상품을 큐레이팅해주는 웹 서비스 (데모).

### 1.2 핵심 플로우 (Mock)

```
사용자 자연어 입력
    ↓
[Mock AI] 키워드 매칭 → 스타일 태그 추출
    ↓
[Mock 데이터] public/mock-products.json 에서 매칭 상품 선별
    ↓
큐레이션 결과 카드 UI 표시
    ↓
마음에 드는 상품 클릭 → 외부 링크 (예시 URL)
```

### 1.3 데모 버전 범위

**구현하는 것**
- 회원가입 / 로그인 UI (더미, Context 상태만 관리)
- 자연어 스타일 입력 UI + Mock AI 처리
- Mock 상품 데이터 기반 큐레이션 결과
- 찜하기 기능 (localStorage 저장)
- 어드민 페이지 UI (API 키 입력 UI만, 실제 저장/검증 없음)
- Vercel 배포

**이번 데모에서 제외하는 것**
- 실제 AI API 호출 (Anthropic/OpenAI/Gemini)
- 실제 네이버 쇼핑 API 호출
- Supabase DB
- 실제 인증 (NextAuth, bcrypt)
- 암호화, 보안 처리
- 개인화, 추천 루프

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | |
| 스타일링 | Tailwind CSS + shadcn/ui | |
| 상태 관리 | React Context + localStorage | 세션/찜 목록 |
| 데이터 | `public/mock-products.json` | 정적 JSON |
| 배포 | Vercel | 환경변수 설정 불필요 |

**외부 의존성 없음** — 모든 데이터는 로컬 mock.

---

## 3. 환경변수

**불필요.** 전부 Mock 데이터로 동작하므로 `.env.local` 파일 없이 실행 가능.
Vercel 배포 시에도 환경변수 설정 없음.

---

## 4. 디렉토리 구조

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/
│   │   ├── page.tsx                # 홈 (스타일 입력 화면)
│   │   ├── result/page.tsx         # 큐레이션 결과
│   │   └── wishlist/page.tsx       # 찜 목록
│   ├── admin/
│   │   ├── layout.tsx              # 어드민 레이아웃 (더미 가드)
│   │   ├── page.tsx                # 어드민 대시보드
│   │   └── settings/page.tsx       # API 키 입력 UI (데모)
│   ├── api/
│   │   └── curate/route.ts         # Mock AI + Mock 상품 통합
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn 기본 컴포넌트
│   ├── StyleInput.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── WishlistButton.tsx
│   ├── Header.tsx
│   └── admin/
│       ├── ApiKeySection.tsx       # API 키 입력 UI (데모용)
│       ├── ModelSelector.tsx
│       ├── KeyStatusBadge.tsx
│       └── StatCard.tsx
├── lib/
│   ├── mock-ai.ts                  # 키워드 매칭 Mock AI
│   ├── mock-products.ts            # 상품 데이터 로드 + 필터링 유틸
│   ├── session-context.tsx         # 더미 세션 Context (로그인 상태)
│   ├── wishlist-storage.ts         # localStorage 찜 관리
│   └── types.ts                    # 공통 타입 정의
└── public/
    └── mock-products.json          # 30~50개 샘플 상품 데이터
```

---

## 5. 핵심 로직 (Mock)

### 5.1 POST `/api/curate` — 큐레이션 엔드포인트 (Mock)

**Request**
```json
{
  "prompt": "미니멀한 봄 데일리 룩, 예산 10만원 이하"
}
```

**처리 흐름 (Mock)**
1. 입력 prompt에서 스타일 키워드 감지 (`mock-ai.ts::extractKeywords`)
2. `public/mock-products.json` 로드
3. 키워드와 매칭되는 상품 필터링 (`mock-products.ts::filterProducts`)
4. 상위 12개 반환
5. 2초 지연 후 응답 (로딩 시뮬레이션)

**Response**
```json
{
  "style_summary": "미니멀한 봄 데일리 룩",
  "keywords_used": ["미니멀", "데일리", "봄"],
  "products": [
    {
      "id": "mock_001",
      "title": "오버핏 코튼 셔츠",
      "brand": "무신사 스탠다드",
      "price": 39000,
      "image": "/mock-images/shirt-01.jpg",
      "link": "https://example.com/product/001",
      "mall": "무신사",
      "reason": "미니멀한 실루엣에 적합"
    }
  ]
}
```

### 5.2 Mock AI 로직 (`lib/mock-ai.ts`)

**키워드 매칭 사전** (상수로 관리)

```typescript
const STYLE_KEYWORDS = {
  // 스타일 톤
  '미니멀': ['minimal', 'simple', 'clean'],
  '캐주얼': ['casual', 'daily'],
  '포멀': ['formal', 'business'],
  '스트릿': ['street', 'hiphop'],
  '페미닌': ['feminine', 'girly'],
  '빈티지': ['vintage', 'retro'],

  // 계절
  '봄': ['spring'],
  '여름': ['summer'],
  '가을': ['fall', 'autumn'],
  '겨울': ['winter'],

  // 상황
  '데이트': ['date'],
  '출근': ['office', 'work'],
  '데일리': ['daily'],
}
```

**함수 시그니처**
```typescript
extractKeywords(prompt: string): {
  keywords: string[],
  style_tags: string[],
  budget_max: number | null
}
```

**동작**: 입력 prompt를 소문자화 → STYLE_KEYWORDS 순회하며 매칭된 태그 수집 → "n만원" 패턴으로 예산 추출

### 5.3 Mock 상품 필터링 (`lib/mock-products.ts`)

- `mock-products.json` 로드
- 각 상품에 `tags: string[]` 필드 (사전 정의)
- `style_tags`와 교집합 있는 상품 우선순위 높임
- `budget_max` 이하인 상품만 필터
- 결과 12개로 제한 (부족하면 전체 반환)

### 5.4 어드민 페이지 (UI Only)

어드민 설정 페이지는 **UI만 존재**.

- API 키 입력 필드 (type=password, 입력해도 어디에도 저장되지 않음)
- [저장] 버튼: 클릭 시 "저장되었습니다" 토스트만 표시
- [검증] 버튼: 클릭 시 2초 후 "정상 확인됨" 토스트만 표시
- AI 모델 선택: localStorage에만 저장 (화면 새로고침 후에도 유지)
- 대시보드 통계: 고정 mock 숫자 (예: 가입자 128명, 오늘 큐레이션 34회)

### 5.5 인증 (더미)

**로그인**
- `/login` 폼 제출 → 입력값 검증 없이 `SessionContext.login({email})` 호출
- 홈으로 리다이렉트

**회원가입**
- `/signup` 폼 제출 → 비밀번호 확인만 검증 → "가입 완료" 토스트 → `/login` 이동

**세션 상태**
- `SessionContext`가 로그인 상태 관리
- localStorage에 `user` 키로 저장 → 새로고침해도 유지
- 로그아웃 시 localStorage 삭제 + Context 초기화

**어드민 판별**
- `localStorage.user.email === 'admin@demo.com'` 이면 어드민
- 또는 `/admin` URL 직접 접근 허용 (데모용)

---

## 6. 화면 구성

### 6.1 홈 화면 `/`

- 서비스 로고 + 한 줄 설명
- 스타일 입력창 (textarea)
- 예시 프롬프트 버튼 3개
  - "캐주얼한 여름 데일리 룩"
  - "출근룩 세미 포멀"
  - "데이트 룩 페미닌 스타일"
- 큐레이션 시작 버튼

### 6.2 로딩 화면

큐레이션 버튼 클릭 후 2초간 표시:
1. "AI가 스타일을 분석하고 있어요..." (0초)
2. "패션 상품을 검색하고 있어요..." (1초)
3. "딱 맞는 아이템을 골라내고 있어요..." (1.5초)

### 6.3 결과 화면 `/result`

- 상단: 스타일 요약 + 감지된 키워드 태그
- 상품 카드 그리드 (3열, 최대 12개)
  - 이미지, 상품명, 브랜드, 가격, 찜하기 버튼
  - 카드 클릭 시 `link` 새 탭으로 열기
- 하단: "다른 스타일 찾기" 버튼

### 6.4 찜 목록 `/wishlist`

- localStorage에서 찜 목록 로드
- ProductGrid 렌더링
- 빈 상태: "아직 찜한 아이템이 없어요"

### 6.5 로그인 `/login` / 회원가입 `/signup`

- 이메일 + 비밀번호 입력 필드 (더미)
- 제출 시 형식 검증만 (이메일, 비밀번호 최소 8자)
- 서버 요청 없이 Context 상태만 업데이트

---

## 6-A. 어드민 페이지

### 6-A.1 대시보드 `/admin`

고정 Mock 통계 카드 4개:
- 총 가입자: **128명**
- 오늘 큐레이션: **34회**
- 누적 큐레이션: **1,204회**
- AI 키 상태: Anthropic (사용중) / OpenAI / Gemini (미등록)

### 6-A.2 API 키 설정 `/admin/settings`

- AI 모델 선택 (라디오): Anthropic / OpenAI / Gemini
- API 키 입력 섹션 × 4 (Anthropic, OpenAI, Gemini, 네이버)
- [저장], [검증] 버튼은 토스트만 표시
- 실제 저장 위치: **없음** (새로고침 시 입력값 사라짐)
- 선택된 AI 모델만 localStorage에 저장

---

## 7. Mock 데이터 구조 (TypeScript 타입)

```typescript
// lib/types.ts

export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  link: string;
  mall: string;
  tags: string[];         // 매칭용 태그 (e.g., ['minimal', 'spring', 'shirt'])
  reason?: string;        // 큐레이션 결과에만 존재
}

export interface CurationResult {
  style_summary: string;
  keywords_used: string[];
  products: Product[];
}

export type AIModel = 'anthropic' | 'openai' | 'gemini';

export interface User {
  email: string;
  isAdmin: boolean;
}

export interface WishlistItem extends Omit<Product, 'reason'> {
  addedAt: string;        // ISO timestamp
}
```

### `public/mock-products.json` 샘플

```json
[
  {
    "id": "mock_001",
    "title": "오버핏 코튼 셔츠",
    "brand": "무신사 스탠다드",
    "price": 39000,
    "image": "/mock-images/shirt-01.jpg",
    "link": "https://example.com/product/001",
    "mall": "무신사",
    "tags": ["minimal", "daily", "spring", "shirt", "casual"]
  }
]
```

**권장 데이터 규모**: 30~50개 상품, 다양한 태그 조합으로 구성.

---

## 8. 구현 순서

각 TASK는 `TASKS.md` 참조. 대략적인 순서:

1. Next.js + Tailwind + shadcn 세팅
2. 공통 타입 정의
3. `mock-products.json` 데이터 작성
4. Mock AI + Mock 상품 필터링 로직
5. 큐레이션 API 엔드포인트
6. UI 컴포넌트 (StyleInput, ProductCard, ProductGrid)
7. 홈/결과/찜 페이지
8. 더미 세션 Context + 로그인/회원가입 페이지
9. Header + 공통 레이아웃
10. 어드민 페이지 UI
11. Vercel 배포

---

## 9. 발표 데모 시나리오

**시나리오 1 — 기본 큐레이션**
> 입력: "봄에 입기 좋은 미니멀한 데일리 룩"
> 기대: 화이트/베이지 톤 오버핏 셔츠, 슬랙스 등 12개 표시

**시나리오 2 — 예산 지정**
> 입력: "세미 포멀하게 입고 싶어, 10만원 이하"
> 기대: 블레이저, 슬랙스, 셔츠 위주 + 10만원 이하 상품만

**시나리오 3 — 무드 기반**
> 입력: "뉴욕 감성 스트릿 룩"
> 기대: 후드, 카고 팬츠, 스니커즈 등 스트릿 아이템

**어드민 시연**
- `/admin` 접속 → 대시보드 통계 표시
- `/admin/settings` → API 키 입력 UI + 모델 선택 (데모용)

---

## 10. Vercel 배포

```bash
# 1. GitHub 리포지토리 생성 후 푸시
git init && git add . && git commit -m "init"
git remote add origin <repo-url>
git push -u origin main

# 2. Vercel 대시보드에서 Import → 리포지토리 선택
# 3. 환경변수 설정 불필요
# 4. Deploy 클릭
```

---

## 11. 추후 확장 (Mock → 실제 연동)

현재 구조가 유지되므로 이후 실제 AI/DB 연동 시:
- `lib/mock-ai.ts` → `lib/ai/claude.ts` 등으로 교체
- `lib/mock-products.ts` → `lib/naver-shopping.ts` 호출
- `lib/session-context.tsx` → NextAuth으로 교체
- Supabase 추가 → `users`, `wishlists` 테이블 생성

UI 컴포넌트와 페이지 구조는 변경 불필요.

---

*이 PRD는 데모 프로토타입 제작용입니다. 실제 서비스 런칭 시 v1.x 버전의 보안/인증/DB 스펙을 복원하여 사용하세요.*
