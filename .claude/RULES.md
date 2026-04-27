# RULES.md - StyleAI 실행 규칙 (Mock 데모)

## Core Operational Rules

### Task Management
- TodoRead() → TodoWrite() → Execute → Track
- 병렬 가능한 작업은 병렬로 실행
- 실행 전 검증, 완료 후 확인
- lint/typecheck 통과 후 완료 처리

### File Operations
- Read → Write/Edit 순서 준수
- 절대 경로 사용
- 자동 커밋 금지 (명시적 요청 시만)

### Framework Compliance
- package.json 확인 후 라이브러리 사용
- 기존 프로젝트 패턴 준수
- Next.js App Router 컨벤션 준수

## StyleAI Specific Rules

### TASK 실행 규칙
- 각 TASK 시작 전 `PRD.md`와 `TASKS.md` 참조 필수
- TASK는 순서대로 진행 (의존성 테이블 확인)
- Mock 데이터 변경 시 `PRD.md` 섹션 7 동시 업데이트

### Component Structure
```
components/
├── ui/              # shadcn/ui 기본 컴포넌트
├── StyleInput.tsx   # 자연어 입력
├── ProductCard.tsx  # 상품 카드
├── ProductGrid.tsx  # 결과 그리드
├── WishlistButton.tsx
├── Header.tsx
└── admin/
    ├── ApiKeySection.tsx   # API 키 입력 UI (데모)
    ├── ModelSelector.tsx
    ├── KeyStatusBadge.tsx
    └── StatCard.tsx
```

### Lib Structure (Mock)
```
lib/
├── mock-ai.ts            # 키워드 매칭 기반 AI 시뮬레이션
├── mock-products.ts      # 상품 JSON 로드 + 필터링
├── session-context.tsx   # 더미 세션 Context (로그인 상태)
├── wishlist-storage.ts   # localStorage 찜 관리
└── types.ts              # 공통 타입
```

### API Route Structure
```
app/api/
└── curate/route.ts       # Mock AI + Mock 상품 통합 (유일한 API)
```

### Mock AI Interface
```typescript
// lib/mock-ai.ts
extractKeywords(prompt: string): {
  keywords: string[],
  style_tags: string[],
  budget_max: number | null
}

getStyleSummary(prompt: string, tags: string[]): string
```

### Mock Products Interface
```typescript
// lib/mock-products.ts
loadMockProducts(): Promise<Product[]>
filterProducts(products, styleTags, budgetMax): Product[]
assignReasons(products, styleTags): Product[]
```

### Authentication Rules (Dummy)
```typescript
// 어드민 체크 (클라이언트)
const { user, isAdmin } = useSession()
if (!isAdmin) router.push('/')

// 어드민 판별 기준
user?.email === 'admin@demo.com'
```

### localStorage Keys
| 키 | 용도 | 데이터 |
|---|---|---|
| `styleai_user` | 로그인 세션 | `User` 객체 |
| `styleai_wishlist` | 찜 목록 | `WishlistItem[]` |
| `styleai_active_model` | 어드민 AI 모델 선택 | `'anthropic' | 'openai' | 'gemini'` |

### Mock Data Rules
- `public/mock-products.json`: 30~50개, 다양한 태그
- 이미지: `https://picsum.photos/400/400?random={id}` 패턴
- link: `https://example.com/product/{id}` 패턴
- 가격대: 10,000원 ~ 300,000원 범위

### UI Simulation Rules
- 큐레이션 API: 2초 지연 (`setTimeout`)
- 키 저장 버튼: 토스트만 표시, 저장 동작 없음
- 키 검증 버튼: 2초 지연 후 "정상 확인됨" 토스트
- 통계: 고정 mock 숫자 (가입자 128, 오늘 34, 누적 1204)

## Quick Reference

### Do
- ✅ TASK 시작 전 PRD.md 참조
- ✅ shadcn/ui 컴포넌트 우선
- ✅ Mock 함수 시그니처를 실제 API 인터페이스와 유사하게 유지
- ✅ localStorage 키 이름에 `styleai_` 프리픽스
- ✅ 절대 경로 사용
- ✅ 로딩 지연 시뮬레이션 (UX)
- ✅ 에러 시 토스트 알림

### Don't
- ❌ 실제 외부 API 호출 (Anthropic/OpenAI/Gemini/Naver/Supabase)
- ❌ bcrypt, NextAuth, 암호화 라이브러리 설치
- ❌ 환경변수 사용 (`.env.local` 작성 금지)
- ❌ 자동 커밋
- ❌ 프로토타입 범위 밖 기능 구현 (실제 인증, 결제 등)

## 추후 실제 API 연동 시 참고

데모 단계를 마치고 실제 서비스로 전환하려면:
1. `lib/mock-ai.ts` → `lib/ai/{claude,openai,gemini}.ts` 로 교체
2. `lib/mock-products.ts` → `lib/naver-shopping.ts` 로 교체
3. `lib/session-context.tsx` → NextAuth로 교체
4. `lib/wishlist-storage.ts` → Supabase 연동

UI 컴포넌트/페이지 구조는 수정 불필요하도록 설계.
