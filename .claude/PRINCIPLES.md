# PRINCIPLES.md - StyleAI 개발 원칙 (Mock 데모)

## Core Philosophy

**Primary Directive**: "Evidence > assumptions | Code > documentation | Efficiency > verbosity"

## StyleAI Specific Principles

### 1. 데모 우선 — "있는 것처럼" 보이면 OK
- 정부지원사업 발표 데모가 목표 — 완성도보다 UI 플로우 시연
- 실제 작동하는 것처럼 보이면 충분 (토스트, 지연 시뮬레이션 등 활용)
- 과도한 엔지니어링 지양 — 진짜 API 연동, DB, 암호화 전부 제외

### 2. 외부 의존성 제로
- AI API 호출 없음 → `lib/mock-ai.ts` 키워드 매칭
- 상품 API 호출 없음 → `public/mock-products.json` 정적 파일
- DB 없음 → `localStorage` + React Context
- 인증 서버 없음 → 더미 Context 기반 상태

### 3. 미래 확장성 고려한 구조
- `lib/mock-*.ts` 파일 구조를 실제 API 클라이언트와 동일한 인터페이스로 유지
- UI/페이지는 실제 연동 시 수정 불필요해야 함
- `PRD.md` 섹션 11의 교체 경로 확인

## Development Principles

### SOLID (프로젝트 적용)
- **Single Responsibility**: `mock-ai.ts`, `mock-products.ts`, `session-context.tsx`, `wishlist-storage.ts` 역할 분리
- **Open/Closed**: Mock 로직을 실제 API로 교체 시 시그니처 변경 없이 내부만 수정
- **Dependency Inversion**: 페이지/컴포넌트는 mock 함수 시그니처에만 의존

### Code Quality
- **DRY**: 타입은 `lib/types.ts`에 집중, 키워드 매핑/reason 문구는 상수로
- **KISS**: Next.js API Routes로 별도 서버 없이 통합, localStorage로 영속성 대체
- **YAGNI**: 인증/암호화/DB 스키마 등 데모 범위 밖 기능 미구현

### UI 시뮬레이션
- 로딩: `setTimeout` 2초 지연 → "AI 처리 중"처럼 보이게
- 저장/검증: 버튼 클릭 시 토스트만 표시
- 통계: 고정 숫자 하드코딩

## UI/UX Principles

### Design System
- shadcn/ui 컴포넌트 우선 사용
- Tailwind CSS 유틸리티 클래스
- 일관된 카드 레이아웃

### Responsive
- 모바일(375px): 1열 그리드
- 태블릿(768px): 2열 그리드
- 데스크탑(1280px): 3열 그리드

### UX
- 로딩 중 단계별 상태 메시지 표시
- 찜하기 낙관적 업데이트 (즉시 UI 반영)
- 에러 시 토스트 알림

## Data Principles

### Mock Data
- `public/mock-products.json`: 30~50개 다양한 태그 조합
- 태그 시스템: `tags: string[]` 필드로 매칭 스코어링
- 이미지: `picsum.photos` 랜덤 이미지 활용

### localStorage 키 컨벤션
- `styleai_user`: 로그인 세션
- `styleai_wishlist`: 찜 목록
- `styleai_active_model`: 어드민 AI 모델 선택

### API Design
- RESTful 엔드포인트 (`/api/curate` 하나만)
- 일관된 에러 응답 형식 (`{ error: string }`)
- 파싱 실패 시 빈 배열/기본값 반환

## Testing Philosophy (데모 수준)
- 수동 테스트: 발표 시나리오 3개 (`PRD.md` 섹션 9)
- 자동화 테스트 불필요 (데모 범위)
- 빌드/타입체크/린트는 통과 필수
