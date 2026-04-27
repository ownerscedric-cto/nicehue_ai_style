# TASKS — AI 패션 큐레이팅 플랫폼 (Mock 데모)

> Claude Code에 순서대로 하나씩 붙여넣기하여 진행하세요.
> 각 TASK는 독립적으로 완결되도록 작성되었습니다.
> PRD.md를 같은 디렉토리에 두고 시작하세요.
> **이 버전은 외부 API 없이 Mock 데이터로만 동작합니다.**

---

## TASK 01 — 프로젝트 초기 세팅

```
PRD.md를 참고해서 Next.js 14 프로젝트를 세팅해줘.

1. 프로젝트 생성:
   npx create-next-app@latest . --typescript --tailwind --app --eslint

2. shadcn/ui 초기화 및 필요한 컴포넌트 설치:
   npx shadcn@latest init
   npx shadcn@latest add button input textarea card badge toast label separator tabs radio-group

3. 추가 패키지 없음 (외부 API/DB/Auth 의존성 모두 제거됨)

4. next.config.ts에 이미지 설정 추가 (로컬 이미지 + placeholder 대비):
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'via.placeholder.com' },
       { protocol: 'https', hostname: 'picsum.photos' },
     ]
   }

5. app/layout.tsx에 Toaster 컴포넌트 추가

완료 후 npm run dev가 정상 실행되는지 확인해줘.
환경변수(.env.local) 설정 불필요.
```

---

## TASK 02 — 공통 타입 정의

```
PRD.md 섹션 7을 참고해서 lib/types.ts를 만들어줘.

정의할 타입:
- Product (id, title, brand, price, image, link, mall, tags, reason?)
- CurationResult (style_summary, keywords_used, products)
- AIModel ('anthropic' | 'openai' | 'gemini')
- User (email, isAdmin)
- WishlistItem (Product에서 reason 제외 + addedAt)

PRD.md 섹션 7의 타입 정의를 그대로 사용.
```

---

## TASK 03 — Mock 상품 데이터 작성

```
public/mock-products.json 파일을 만들어줘.

요구사항:
1. 30~50개의 샘플 상품 데이터
2. 다양한 카테고리 커버: 셔츠, 티셔츠, 슬랙스, 청바지, 블레이저, 원피스, 스니커즈, 후드
3. 다양한 태그 조합: minimal, casual, formal, street, feminine, vintage, spring, summer, fall, winter, date, office, daily
4. 가격대 다양화: 10,000원 ~ 300,000원 범위
5. 브랜드: "무신사 스탠다드", "커버낫", "LMC", "앤더슨벨", "마르지엘라" 등 실제/가상 혼용
6. 이미지 URL: https://picsum.photos/400/400?random={id} 형식 사용
7. link: https://example.com/product/{id} 형식

각 상품 구조:
{
  "id": "mock_001",
  "title": "오버핏 코튼 셔츠",
  "brand": "무신사 스탠다드",
  "price": 39000,
  "image": "https://picsum.photos/400/400?random=1",
  "link": "https://example.com/product/mock_001",
  "mall": "무신사",
  "tags": ["minimal", "daily", "spring", "shirt", "casual"]
}
```

---

## TASK 04 — Mock AI (키워드 매칭)

```
lib/mock-ai.ts 파일을 만들어줘.

1. STYLE_KEYWORDS 상수 (PRD.md 섹션 5.2 참조)
   - 한국어 키워드 → 영문 태그 매핑
   - 카테고리: 스타일 톤, 계절, 상황

2. extractKeywords(prompt: string) 함수
   - 입력 prompt를 소문자화
   - STYLE_KEYWORDS 순회하며 매칭된 태그 수집
   - "n만원" 또는 "n천원" 패턴으로 예산 추출 (정규식)
   - 반환: { keywords: string[], style_tags: string[], budget_max: number | null }

3. getStyleSummary(prompt: string, tags: string[]) 함수
   - 입력 프롬프트에서 핵심 문장 추출 (30자 이내)
   - tags 기반 요약 문구 생성
   - 반환: string

예시:
  입력: "미니멀한 봄 데일리 룩, 10만원 이하"
  출력: {
    keywords: ["미니멀", "봄", "데일리"],
    style_tags: ["minimal", "spring", "daily"],
    budget_max: 100000
  }
```

---

## TASK 05 — Mock 상품 필터링 유틸

```
lib/mock-products.ts 파일을 만들어줘.

1. loadMockProducts(): Promise<Product[]>
   - public/mock-products.json 로드
   - 서버/클라이언트 모두에서 동작하도록
   - 서버: fs로 읽기 또는 import
   - 클라이언트: fetch('/mock-products.json')

2. filterProducts(products: Product[], styleTags: string[], budgetMax: number | null): Product[]
   - styleTags와 product.tags 교집합 크기로 스코어링
   - budgetMax 이하인 상품만 유지
   - 스코어 내림차순 정렬
   - 상위 12개 반환
   - 매칭 상품이 12개 미만이면 랜덤으로 채움

3. assignReasons(products: Product[], styleTags: string[]): Product[]
   - 각 상품의 매칭 태그 기반으로 reason 문구 생성
   - 예: tags에 'minimal' 있으면 "미니멀한 실루엣에 적합"
   - REASON_MAP 상수로 관리
```

---

## TASK 06 — 큐레이션 API 엔드포인트

```
app/api/curate/route.ts를 만들어줘.

POST /api/curate

처리 순서:
1. request body에서 prompt 추출 및 유효성 검사 (빈 문자열 거부 → 400)
2. extractKeywords(prompt)로 키워드 추출
3. loadMockProducts()로 상품 로드
4. filterProducts()로 매칭 상품 필터링
5. assignReasons()로 추천 이유 부여
6. getStyleSummary()로 스타일 요약 생성
7. 2초 지연 (로딩 시뮬레이션): await new Promise(r => setTimeout(r, 2000))
8. CurationResult 형식으로 반환

에러 처리:
- 빈 prompt: 400 + "스타일을 입력해주세요."
- 파싱 실패 시 빈 배열 반환 (throw 금지)
```

---

## TASK 07 — 더미 세션 Context

```
lib/session-context.tsx를 만들어줘.

1. SessionContext 생성
   - 상태: user: User | null, login(email), logout(), isAdmin
   - localStorage 연동: 'styleai_user' 키로 저장/복원
   - 로그인 시: user 저장, 로그아웃 시: 삭제

2. SessionProvider 컴포넌트 (클라이언트 컴포넌트)
   - children 렌더링
   - 마운트 시 localStorage에서 user 복원

3. useSession() 훅
   - Context 소비
   - 반환: { user, login, logout, isAdmin }

4. isAdmin 판별: user?.email === 'admin@demo.com'

5. app/layout.tsx에 SessionProvider 래핑
```

---

## TASK 08 — 회원가입 / 로그인 페이지 (UI만)

```
더미 인증 페이지 2개를 만들어줘.

1. app/(auth)/login/page.tsx
   - 이메일 + 비밀번호 입력 폼
   - 클라이언트 유효성 검증만 (이메일 형식, 비밀번호 최소 8자)
   - 검증 통과 시 useSession().login(email) 호출 → / 이동
   - 실제 서버 요청 없음
   - 하단에 "회원가입" 링크

2. app/(auth)/signup/page.tsx
   - 이메일 + 비밀번호 + 비밀번호 확인 입력 폼
   - 클라이언트 검증: 이메일 형식, 비밀번호 최소 8자, 비밀번호 확인 일치
   - 검증 통과 시 "가입 완료. 로그인해주세요." 토스트 → /login 이동
   - 실제 저장 없음

shadcn Card, Input, Button, Label 컴포넌트 사용.
중앙 정렬 레이아웃, max-w-md 카드.

어드민으로 로그인하려면 'admin@demo.com' 사용 안내를 회원가입 페이지 하단에 작게 표기.
```

---

## TASK 09 — 공통 레이아웃 및 Header

```
서비스 공통 레이아웃을 만들어줘.

1. app/(main)/layout.tsx
   - Header 컴포넌트 포함
   - 상단 고정 헤더

2. components/Header.tsx
   - 좌측: 서비스 로고 텍스트 "StyleAI"
   - 우측:
     - 비로그인: [로그인] [회원가입] 버튼
     - 로그인: [찜 목록] [로그아웃] 버튼
     - 어드민: 추가로 [어드민] 버튼
   - useSession()으로 상태 감지
   - 모바일 대응 (sm: breakpoint에서 텍스트 축약)
   - 로그아웃 클릭 시 logout() 호출 + /로 이동
```

---

## TASK 10 — 홈 화면 (스타일 입력)

```
홈 화면과 StyleInput 컴포넌트를 만들어줘.

1. components/StyleInput.tsx
   - textarea 입력창 (placeholder: "어떤 스타일의 옷을 찾고 계신가요?\n예) 미니멀한 봄 데일리 룩, 예산 10만원 이하")
   - 예시 프롬프트 버튼 3개:
     "캐주얼한 여름 데일리 룩"
     "출근룩 세미 포멀"
     "데이트 룩 페미닌 스타일"
   - 클릭 시 textarea에 자동 입력
   - 큐레이션 시작 버튼 (로딩 중 비활성화)
   - onSubmit prop으로 부모에 값 전달

2. app/(main)/page.tsx
   - StyleInput 렌더링
   - 제출 시 POST /api/curate 호출
   - 로딩 중 단계별 메시지 표시 (setTimeout 타이머):
     0초: "AI가 스타일을 분석하고 있어요..."
     1초: "패션 상품을 검색하고 있어요..."
     1.5초: "딱 맞는 아이템을 골라내고 있어요..."
   - 성공 시 결과를 sessionStorage에 저장 후 /result 이동
   - 실패 시 에러 토스트 표시

페이지 중앙 정렬, 서비스 설명 문구 상단에 크게.
```

---

## TASK 11 — 상품 카드 및 결과 화면

```
1. components/ProductCard.tsx
   - Next.js Image로 상품 이미지 (aspect-square)
   - 상품명 (line-clamp-2)
   - 브랜드 / 판매몰명 (작은 텍스트, text-muted-foreground)
   - 가격 (굵게, toLocaleString())
   - 추천 이유 뱃지 (reason, 한 줄 말줄임)
   - 찜하기 버튼 (하트, 우측 상단 absolute)
   - 카드 클릭 시 link를 새 탭으로 열기 (window.open)
   - props: product: Product, isWishlisted: boolean, onWishlistToggle: () => void

2. components/ProductGrid.tsx
   - ProductCard를 그리드로 배치
   - grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

3. app/(main)/result/page.tsx
   - sessionStorage에서 CurationResult 읽기 (없으면 / 리다이렉트)
   - 상단: style_summary + keywords_used 뱃지
   - ProductGrid 렌더링
   - 찜 상태는 wishlist-storage.ts를 통해 localStorage 연동
   - 하단 "다른 스타일 찾기" 버튼 → /
```

---

## TASK 12 — 찜하기 기능 (localStorage)

```
1. lib/wishlist-storage.ts
   - getWishlist(): WishlistItem[]
     → localStorage 'styleai_wishlist' 키 읽기, 없으면 []
   - addToWishlist(product: Product)
     → 중복 체크 후 addedAt 추가하여 저장
   - removeFromWishlist(productId: string)
   - isWishlisted(productId: string): boolean

2. components/WishlistButton.tsx
   - 하트 아이콘 (lucide-react Heart)
   - isWishlisted에 따라 fill 처리
   - 클릭 시: useSession() 로그인 체크
     - 비로그인: "로그인이 필요합니다" 토스트
     - 로그인: wishlist-storage 함수 호출 + 로컬 상태 업데이트

3. app/(main)/wishlist/page.tsx
   - 비로그인 시 /login 리다이렉트
   - getWishlist() 로드하여 ProductGrid 렌더링
   - 찜 해제 기능 포함
   - 빈 상태: "아직 찜한 아이템이 없어요" + "큐레이션 시작하기" 버튼
```

---

## TASK 13 — 어드민 대시보드 (데모 UI)

```
1. app/admin/layout.tsx
   - useSession()으로 어드민 체크
   - 비어드민 시 redirect('/')
   - 어드민 전용 레이아웃 (헤더: "어드민" 표시 + 서비스로 돌아가기 링크)
   - 탭 네비게이션: [대시보드] [API 키 설정]

2. app/admin/page.tsx
   - StatCard 4개 그리드 (고정 mock 값):
     - 총 가입자: 128명
     - 오늘 큐레이션: 34회
     - 누적 큐레이션: 1,204회
     - API 키 상태: "● Anthropic (사용중) / ● OpenAI / ○ Gemini (미등록)"
   - [API 키 설정으로 이동] 버튼

3. components/admin/StatCard.tsx
   - label, value, sub(선택) props
   - shadcn Card 기반
```

---

## TASK 14 — 어드민 API 키 설정 페이지 (UI Only)

```
UI만 존재하는 데모 페이지. 실제 저장/검증 없음.

1. components/admin/ApiKeySection.tsx
   - provider명 (Anthropic / OpenAI / Gemini / 네이버)
   - 마스킹된 현재값 표시 (하드코딩 예: "sk-ant-••••••••xQ3A")
   - 입력 필드 (type=password, 눈 아이콘 토글)
   - [저장] 버튼: 클릭 시 토스트만 표시 ("저장되었습니다")
   - [검증] 버튼: 2초 지연 후 토스트 ("정상 확인됨")

2. components/admin/ModelSelector.tsx
   - RadioGroup으로 anthropic / openai / gemini 선택
   - 변경 즉시 localStorage.setItem('styleai_active_model', value) 저장
   - 초기값: localStorage에서 로드, 없으면 'anthropic'

3. app/admin/settings/page.tsx
   - ModelSelector 상단 배치
   - 구분선으로 섹션 분리: AI 모델 / Anthropic / OpenAI / Gemini / 네이버
   - ApiKeySection × 5개
   - 하단 안내: "※ 데모 버전입니다. 입력한 키는 저장되지 않습니다."
```

---

## TASK 15 — 마무리 및 Vercel 배포

```
1. 에러 처리
   - app/error.tsx (전역 에러 폴백)
   - app/not-found.tsx

2. 반응형 점검
   - 모바일(375px): 1열 그리드
   - 태블릿(768px): 2열 그리드
   - 데스크탑(1280px): 3열 그리드

3. README.md 업데이트
   - 프로젝트 개요
   - 로컬 실행: npm install && npm run dev
   - 환경변수 불필요 명시
   - Vercel 배포 방법

4. Vercel 배포
   - GitHub에 push
   - Vercel 대시보드에서 Import
   - 환경변수 설정 없이 Deploy

5. 데모 계정 안내를 README에 추가
   - 어드민 로그인: email=admin@demo.com, password=아무거나(8자 이상)
   - 일반 유저: 아무 이메일
```

---

## 작업 순서 요약

| # | TASK | 예상 소요 | 의존성 |
|---|---|---|---|
| 01 | 프로젝트 초기 세팅 | 5분 | 없음 |
| 02 | 공통 타입 정의 | 5분 | 01 |
| 03 | Mock 상품 데이터 | 10분 | 02 |
| 04 | Mock AI (키워드 매칭) | 10분 | 02 |
| 05 | Mock 상품 필터링 | 10분 | 02, 03 |
| 06 | 큐레이션 API | 10분 | 04, 05 |
| 07 | 더미 세션 Context | 10분 | 02 |
| 08 | 회원가입/로그인 페이지 | 10분 | 07 |
| 09 | 공통 레이아웃/Header | 10분 | 07 |
| 10 | 홈 화면 | 10분 | 06, 09 |
| 11 | 상품 카드 + 결과 화면 | 15분 | 09, 10 |
| 12 | 찜하기 기능 | 10분 | 07, 11 |
| 13 | 어드민 대시보드 | 10분 | 07 |
| 14 | 어드민 API 키 설정 UI | 15분 | 13 |
| 15 | 마무리 + Vercel 배포 | 10분 | 전체 |

**총 예상 소요: 약 2~3시간 (Claude Code 기준)**

---

## Claude Code 사용 팁

- 각 TASK 시작 시 **"PRD.md와 TASKS.md를 읽고"** 한 문장 추가하면 맥락 이해도가 올라갑니다.
- TASK가 길면 중간에 끊길 수 있으니 **"계속해줘"**로 이어가세요.
- 에러 메시지는 전체를 붙여넣으세요.
- **실제 API 키 연동이 필요해지면** `PRD.md`의 섹션 11 (추후 확장) 참조.
