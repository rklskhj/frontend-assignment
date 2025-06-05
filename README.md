# 프론트엔드 개발자 채용 과제 - 이슈 관리 대시보드

## 시작하기 전에 (중요)

### 코드 실행 방법

1. **의존성 설치**

   ```bash
   npm install
   ```

2. **개발 서버 실행**

   ```bash
   npm run dev
   ```

3. **브라우저에서 확인**
   - 브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)로 접속하여 확인

### 제출 시 주의사항 ⚠️

- **제한 시간**: 메일을 보낸 시간으로부터 **정확히 1시간 이내**에 완성하여 메일로 제출해야 함
  ex) 메일을 보낸 시간이 2025-06-02 10:00:00 이라면, 2025-06-02 11:00:00 이내에 제출해야 함
- **제출 형태**: 개인 GitHub 레포지토리에 코드를 업로드하고, 해당 레포지토리 주소를 메일로 제출
- **제출 내용**: GitHub 레포지토리 링크 (예: https://github.com/username/frontend-assignment)

---

## 과제 개요

이슈 관리 대시보드의 핵심 기능을 구현하는 과제입니다.
**제한 시간: 1시간**

## 기술 스택

- Vue 3 (Composition API, Options API 모두 사용 가능)
- 필요하다고 판단되면 Vuex 사용 가능
- 그 외 스타일 관련 라이브러리는 자유롭게 사용 가능

### 스타일링 가이드

- **CSS 디자인 자유도**: CSS 파일은 별도로 제공되지 않으므로, 개발자가 자유롭게 디자인할 수 있습니다
- **스타일링 방법**:
  - 순수 CSS, SCSS, CSS In JS 등 원하는 방식 사용 가능

## 개발 환경 설정

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하여 개발 모드를 설정할 수 있습니다.

```bash
# .env 파일
VITE_MODE=DEV     # 개발 모드 (Mock 데이터 사용)
# VITE_MODE=PROD  # 운영 모드 (실제 API 서버 연동)
```

### 데이터 소스 설정

#### 개발 모드 (VITE_MODE=DEV)

- `src/data/mockData.js`에 정의된 Mock 데이터 사용
- 실제 HTTP 요청 없이 로컬 데이터로 개발 진행

#### 운영 모드 (VITE_MODE=PROD)

- `http://localhost:8080` 서버로 실제 API 요청 전송
- **주의:** 실제 백엔드 서버는 제공되지 않음. 백엔드 API가 구동되어 있다고 가정하고 개발 필요
- API 연동 로직을 구현하되, 실제 테스트는 개발 모드(Mock 데이터)를 사용 권장

### Mock 데이터 활용

`src/data/mockData.js` 파일에는 다음이 포함되어 있습니다:

```javascript
// 미리 정의된 사용자 목록
export const users = [
  { id: 1, name: '김개발' },
  { id: 2, name: '이디자인' },
  { id: 3, name: '박기획' },
]

// 샘플 이슈 데이터 (4개의 서로 다른 상태)
export const issues = [
  // ... 이슈 목록
]
```

**개발 시 Mock 데이터를 적극 활용하여 빠른 개발을 진행하시기 바랍니다.**

## 백엔드 API 데이터 모델

### Issue 데이터 모델

```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "status": "string" // "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  "user": {
    "id": "number",
    "name": "string"
  },
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### 미리 정의된 사용자 목록 (담당자 지정 시 사용)

담당자 지정 시 사용할 수 있는 사용자 목록:

```json
[
  { "id": 1, "name": "김개발" },
  { "id": 2, "name": "이디자인" },
  { "id": 3, "name": "박기획" }
]
```

## 구현해야 할 화면

### 1. 이슈 목록 페이지 (필수)

#### 필수 기능

- [ ] 이슈 목록 표시 (제목, 상태, 담당자, 생성일)
- [ ] 상태별 필터링 (전체, PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- [ ] 새 이슈 생성 버튼
- [ ] 각 이슈 클릭 시 상세 페이지로 이동

### 2. 이슈 생성/상세/수정 페이지 (필수)

#### 필수 기능

- [ ] 이슈 정보 표시 및 편집 (제목, 설명, 상태)
- [ ] 담당자 지정 기능 (드롭다운: 김개발, 이디자인, 박기획 중 선택)
- [ ] 상태 변경 기능 (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- [ ] 저장 기능
- [ ] 목록으로 돌아가기

## API 연동

**Base URL (운영 모드):** `http://localhost:8080`

> **참고:** 실제 백엔드 서버는 제공되지 않습니다. API 연동 코드를 작성할 때는 백엔드 서버가 정상적으로 구동되어 있다고 가정하고 개발해 주세요. 실제 기능 테스트는 개발 모드의 Mock 데이터를 활용하시기 바랍니다.

### 1. 이슈 목록 조회

**Query Parameters:**

- `status` (선택사항): 필터링할 상태값
  - `PENDING`: 대기 중인 이슈만 조회
  - `IN_PROGRESS`: 진행 중인 이슈만 조회
  - `COMPLETED`: 완료된 이슈만 조회
  - `CANCELLED`: 취소된 이슈만 조회
  - 파라미터 없음: 전체 이슈 조회

```javascript
// Request Examples
GET /issues                    // 전체 이슈 조회
GET /issues?status=PENDING     // 대기 중인 이슈만 조회
GET /issues?status=IN_PROGRESS // 진행 중인 이슈만 조회
GET /issues?status=COMPLETED   // 완료된 이슈만 조회
GET /issues?status=CANCELLED   // 취소된 이슈만 조회

// Success Response (200)
{
  "issues": [
    {
      "id": 1234,
      "title": "버그 수정 필요",
      "description": "로그인 페이지에서 오류 발생",
      "status": "PENDING",
      "user": { "id": 1, "name": "김개발" },
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}

// Error Response (400)
{
  "error": "잘못된 status 쿼리 파라미터",
  "code": 400
}
```

### 2. 이슈 상세 조회

```javascript
// Request
GET /issue/:id

// Success Response (200)
{
  "id": 1234,
  "title": "버그 수정 필요",
  "description": "로그인 페이지에서 오류 발생",
  "status": "IN_PROGRESS",
  "user": { "id": 1, "name": "김개발" },
  "createdAt": "2025-05-28T09:30:00Z",
  "updatedAt": "2025-05-28T14:20:00Z"
}

// Error Response (404)
{
  "error": "이슈를 찾을 수 없음",
  "code": 404
}
```

### 3. 이슈 생성

```javascript
// Request
POST /issue
Content-Type: application/json

{
  "title": "버그 수정 필요",
  "description": "로그인 페이지에서 오류 발생",
  "userId": 1  // 선택사항: 생성 시 담당자 할당
}

// Success Response (201)
{
  "id": 1234,
  "title": "버그 수정 필요",
  "description": "로그인 페이지에서 오류 발생",
  "status": "IN_PROGRESS",
  "user": { "id": 1, "name": "김개발" },
  "createdAt": "2025-05-28T09:30:00Z",
  "updatedAt": "2025-05-28T14:20:00Z"
}

// Error Response (400)
{
  "error": "필수 필드 누락",
  "code": 400
}
```

### 4. 이슈 수정

```javascript
// Request
PATCH /issue/:id
Content-Type: application/json

{
  "title": "로그인 버그 수정",
  "description": "로그인 페이지 오류 상세 내용",
  "status": "COMPLETED",
  "userId": 2  // 담당자 할당/변경
}

// Success Response (200)
{
  "id": 1234,
  "title": "로그인 버그 수정",
  "description": "로그인 페이지 오류 상세 내용",
  "status": "COMPLETED",
  "user": { "id": 2, "name": "이디자인" },
  "createdAt": "2025-05-28T09:30:00Z",
  "updatedAt": "2025-05-28T14:20:00Z"
}

// Error Response (400)
{
  "error": "완료된 이슈에 담당자 변경 불가",
  "code": 400
}
```

## 비즈니스 로직 요구사항

### 백엔드 처리 로직 (API 응답에 반영됨)

- **이슈 생성 시**: `userId`가 제공되면 상태를 `IN_PROGRESS`로, 없으면 `PENDING`으로 설정
- **담당자 최초 할당**: `PENDING` → `IN_PROGRESS` 자동 변경

### 프론트엔드 처리 로직 (UI 제약사항)

- **상태 변경 제약**: 담당자가 지정되어 있지 않다면 이슈의 상태를 변경할 수 없음
- **완료/취소된 이슈**: `COMPLETED` 또는 `CANCELLED` 상태에서는 담당자/상태 변경 불가

### UI 구현 가이드

#### 상태 드롭다운 제어

- 담당자가 `null`인 경우: `PENDING` 상태만 선택 가능, 다른 상태는 비활성화
- 담당자가 있는 경우: 모든 상태 선택 가능

#### 담당자 드롭다운 제어

- `COMPLETED` 또는 `CANCELLED` 상태인 경우: 담당자 드롭다운 비활성화
- 다른 상태인 경우: 담당자 변경 가능
