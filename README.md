# 웹툰 매니저

여러 플랫폼(네이버, 카카오, 레진)의 웹툰을 한 곳에서 관리하고 읽기 진행상황을 추적하는 크로스플랫폼 모바일 앱입니다.

## 주요 기능

- **멀티 플랫폼 지원**: 네이버웹툰, 카카오페이지, 레진코믹스 웹툰 추적
- **웹뷰 통합**: 앱 내에서 바로 웹툰 읽기
- **자동 회차 감지**: URL 패턴을 분석하여 현재 읽고 있는 회차 자동 인식
- **진행상황 저장**: 각 웹툰별 마지막으로 읽은 회차를 로컬에 저장
- **즐겨찾기**: 자주 보는 웹툰을 즐겨찾기에 추가
- **검색 및 필터**: 제목이나 플랫폼별로 웹툰 검색

## 기술 스택

- **React Native** + **Expo**: 크로스플랫폼 앱 개발
- **TypeScript**: 타입 안정성
- **React Navigation**: 탭 + 스택 네비게이션
- **react-native-webview**: 웹툰 페이지 표시
- **AsyncStorage**: 로컬 데이터 저장

## 프로젝트 구조

```
webtoon-manager/
├── App.tsx                    # 앱 진입점
├── app.json                   # Expo 설정
├── package.json               # 의존성 패키지
├── tsconfig.json              # TypeScript 설정
├── assets/                    # 앱 아이콘, 스플래시 이미지
└── src/
    ├── components/            # 재사용 UI 컴포넌트
    │   ├── WebtoonCard.tsx    # 웹툰 카드 (리스트 아이템)
    │   ├── SearchBar.tsx      # 검색창
    │   └── PlatformFilter.tsx # 플랫폼 필터 칩
    ├── screens/               # 화면 컴포넌트
    │   ├── HomeScreen.tsx     # 홈 (웹툰 목록)
    │   ├── WebViewScreen.tsx  # 웹뷰 (URL 추적 포함)
    │   ├── FavoritesScreen.tsx # 즐겨찾기 목록
    │   └── SettingsScreen.tsx # 설정
    ├── navigation/            # 네비게이션 설정
    │   ├── RootNavigator.tsx  # 메인 스택 네비게이터
    │   └── MainTabs.tsx       # 하단 탭 네비게이터
    ├── services/              # 비즈니스 로직
    │   ├── storage.ts         # AsyncStorage 작업
    │   └── episodeParser.ts   # URL에서 회차 추출
    ├── hooks/                 # 커스텀 React 훅
    │   ├── useProgress.ts     # 읽기 진행상황 관리
    │   └── useFavorites.ts    # 즐겨찾기 관리
    ├── types/                 # TypeScript 타입 정의
    │   └── index.ts
    └── constants/             # 상수 및 설정
        └── index.ts           # 색상, 더미 데이터, 플랫폼 설정
```

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS 시뮬레이터 (Mac) 또는 Android 에뮬레이터

### 설치 및 실행

1. **의존성 설치**:
   ```bash
   cd webtoon-manager
   npm install
   ```

2. **개발 서버 시작**:
   ```bash
   npm start
   # 또는
   npx expo start
   ```

3. **앱 실행**:
   - `i` 키: iOS 시뮬레이터에서 실행
   - `a` 키: Android 에뮬레이터에서 실행
   - QR 코드: 실제 기기의 Expo Go 앱으로 스캔

### 실제 기기에서 실행하기

1. App Store (iOS) 또는 Play Store (Android)에서 **Expo Go** 앱 설치
2. 터미널에서 `npm start` 실행
3. 표시되는 QR 코드를 Expo Go 앱으로 스캔

## 작동 원리

### 회차 감지 방식

웹뷰에서 페이지 이동 시 URL을 분석하여 회차 번호를 자동으로 추출합니다:

```typescript
// 각 웹툰에는 episodePattern (정규식)이 설정되어 있음
// 예: 'no=(\\d+)'는 '...?no=10' 형태의 URL과 매칭

const episode = extractEpisodeFromUrl(url, webtoon);
// 결과: 10
```

**플랫폼별 URL 패턴**:
- **네이버웹툰**: `?no=10` → 10화
- **카카오페이지**: `?episodeId=123` → 123화
- **레진코믹스**: `/episode/5` → 5화

### 데이터 저장

모든 데이터는 AsyncStorage를 사용하여 기기 내에 로컬 저장됩니다:
- 읽기 진행상황 (웹툰별 마지막 회차)
- 즐겨찾기 목록
- 앱 설정

외부 서버로 전송되는 데이터는 없습니다.

## 커스터마이징

### 새 웹툰 추가하기

`src/constants/index.ts` 파일을 수정하세요:

```typescript
export const DUMMY_WEBTOONS: Webtoon[] = [
  {
    id: 'unique-id',           // 고유 ID
    title: '웹툰 제목',         // 표시될 제목
    platform: 'naver',         // 'naver' | 'kakao' | 'lezhin'
    thumbnail: 'https://...',  // 썸네일 이미지 URL
    url: 'https://comic.naver.com/webtoon/detail?titleId=xxx',
    episodePattern: 'no=(\\d+)', // 회차 추출용 정규식
  },
  // 웹툰 추가...
];
```

### 새 플랫폼 추가하기

1. `src/types/index.ts`에서 `Platform` 타입에 추가
2. `src/constants/index.ts`에 플랫폼 설정 추가:
   ```typescript
   export const PLATFORM_CONFIG = {
     // ...기존 플랫폼
     newPlatform: { name: '새 플랫폼', color: '#FF0000' },
   };
   ```

## 법적 고지

이 앱은 개인 사용 목적으로만 사용하세요:
- 각 플랫폼의 이용약관을 준수해주세요
- 웹툰 작가의 저작권을 존중해주세요
- 스크래핑이나 로그인 우회는 하지 않습니다

이 앱은 공식 웹툰 페이지를 웹뷰로 열기만 할 뿐, 콘텐츠를 추출하거나 저장하지 않습니다.

## 향후 개선 계획

- [ ] 다크 모드 지원
- [ ] 새 회차 푸시 알림
- [ ] 데이터 내보내기/가져오기
- [ ] 여러 사용자 프로필
- [ ] 읽기 통계

## 라이선스

MIT License
