# The Atelier — Mini LMS Mobile App

> A premium learning management system built with React Native Expo, showcasing native features, WebView integration, and sophisticated state management.

## 📱 Features

### Authentication & User Management
- Login/Register with the FreeAPI.app endpoints
- Secure token storage (SecureStore on native, localStorage on web)
- Auto-login on app restart with token validation
- Profile picture update via `PATCH /api/v1/users/avatar`
- User statistics (courses enrolled, bookmarks, learning hours)

### Course Catalog
- Fetch courses from `/api/v1/public/randomproducts`
- Instructor data from `/api/v1/public/randomusers`
- Pull-to-refresh, infinite scroll pagination
- Full-text search with debounced filtering
- Bookmark toggle with local persistence
- Enroll with visual feedback (spring animation)

### WebView Integration
- Embedded course content viewer with custom HTML template
- Native → WebView communication via `injectedJavaScript`
- WebView → Native messaging via `postMessage`
- Error handling for failed WebView loads
- Cross-platform: `iframe` on web, `react-native-webview` on native

### Notifications
- Permission request on first launch
- Milestone notification at 5+ bookmarks
- 24-hour inactivity reminder
- Platform-guarded (skipped on web)

### State Management & Persistence
- Auth state with SecureStore / localStorage (cross-platform)
- Course bookmarks & enrollments with AsyncStorage
- Global state via React Context + custom hooks
- Memoized list items with `React.memo`

### Error Handling
- Axios interceptors with retry logic and timeout
- Error boundary at the root level
- Offline mode detection with `@react-native-community/netinfo`
- Offline banner UI component
- User-friendly toast notifications for all actions
- WebView error state with retry button

---

## 🛠 Technology Stack

| Category | Technology |
|---|---|
| Framework | React Native Expo (SDK 53) |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| Styling | Vanilla StyleSheet (Material Design 3 tokens) |
| Secure Storage | Expo SecureStore + localStorage fallback |
| App Data | AsyncStorage (via Zustand-like persist) |
| Images | Expo Image (with caching + blurhash) |
| Validation | Zod |
| Notifications | Expo Notifications |
| WebView | react-native-webview |
| HTTP | Axios (interceptors, retry, timeout) |
| Icons | lucide-react-native |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- Expo Go app on your device (for mobile testing)

### Installation
```bash
git clone <repo-url>
cd edtech-lms-app
npm install
```

### Environment Variables
No environment variables needed — the app uses the public FreeAPI.app:
```
API_BASE=https://api.freeapi.app
```

### Run Development Server
```bash
# Start Expo dev server
npx expo start

# Web only
npx expo start --web

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android
```

### Build APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build development APK
eas build --platform android --profile development

# Build production APK
eas build --platform android --profile preview
```

---

## 📂 Project Structure

```
edtech-lms-app/
├── app/                        # Expo Router pages
│   ├── (auth)/                 # Auth screens (login, register)
│   ├── (tabs)/                 # Tab screens (home, courses, profile)
│   ├── course/[id].tsx         # Course detail screen
│   ├── webview.tsx             # WebView content viewer
│   └── _layout.tsx             # Root layout with auth guard
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI (Button, Card, Input, Toast, etc.)
│   │   ├── CourseCard.tsx       # Memoized course card component
│   │   ├── ErrorBoundary.tsx    # App-level error boundary
│   │   ├── LoadingSkeleton.tsx  # Skeleton loading states
│   │   └── OfflineBanner.tsx    # Network status banner
│   ├── services/
│   │   ├── api.ts              # Axios instance (interceptors, retry, timeout)
│   │   ├── auth.ts             # Auth API calls
│   │   ├── courses.ts          # Course/instructor API calls
│   │   └── notifications.ts   # Local notification service
│   ├── store/
│   │   ├── auth.tsx            # Auth context (login, register, logout)
│   │   ├── courses.ts          # Course state (bookmarks, enrollments)
│   │   └── StoreProvider.tsx   # Global state provider
│   ├── theme/
│   │   └── index.ts            # Design tokens (Material Design 3)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── utils/
│       ├── images.ts           # Image URL fallback utility
│       ├── storage.ts          # Cross-platform storage adapter
│       └── validation.ts       # Zod schemas for form validation
└── assets/                     # Icons, splash screens
```

---

## 🏗 Key Architectural Decisions

### 1. Cross-Platform Storage Adapter
Expo SecureStore doesn't work on web. Built `src/utils/storage.ts` that abstracts this — uses `SecureStore` on native and `localStorage` on web, providing a single interface for all token operations.

### 2. Image Fallback System
The FreeAPI returns `cdn.dummyjson.com` URLs that 404. Created `src/utils/images.ts` that maps product categories to curated Unsplash images, providing beautiful, reliable thumbnails without requiring API changes.

### 3. WebView Strategy
On web, `react-native-webview` doesn't work. The app conditionally renders an `<iframe srcDoc>` on web and `<WebView source={{html}}>` on native, using the same HTML template for both.

### 4. Toast Notification System
Built a custom animated toast component (`src/components/ui/Toast.tsx`) using React Context. Provides visual feedback for every user action (login, logout, bookmark, enroll, avatar update) without relying on `Alert.alert` which is unreliable on web.

### 5. Zod Validation
Form validation uses Zod schemas (`src/utils/validation.ts`) for type-safe, declarative validation with clear error messages.

---

## ⚠️ Known Issues / Limitations

1. **Image CDN**: The FreeAPI's `cdn.dummyjson.com` URLs return 404. Fallback Unsplash images are used instead.
2. **react-native-svg warning**: Installed v15.15.4 vs expected v15.15.3 (minor, non-breaking).
3. **Token Refresh**: FreeAPI uses HTTP-only cookies for refresh tokens, which can't be accessed from the client. The app handles token expiry by redirecting to login.
4. **Avatar Upload**: The PATCH endpoint works but avatar URLs from FreeAPI point to `localhost:8080`; the app gracefully falls back to local image URI.

---

## 📋 API Endpoints Used

| Method | Endpoint | Usage |
|---|---|---|
| POST | `/api/v1/users/login` | User login |
| POST | `/api/v1/users/register` | User registration |
| GET | `/api/v1/users/current-user` | Auto-login check |
| PATCH | `/api/v1/users/avatar` | Profile picture update |
| GET | `/api/v1/public/randomproducts` | Course catalog |
| GET | `/api/v1/public/randomproducts/:id` | Course details |
| GET | `/api/v1/public/randomusers` | Course instructors |

---

## 📐 Design System

The app uses a custom "Indigo Scholar" design system inspired by Material Design 3:

- **Primary**: `#3730A3` (Indigo)
- **Typography**: Manrope (headings) + Inter (body)
- **Shape**: 16–24px corner radius
- **Cards**: Glass-morphism with subtle shadows
- **Animations**: Spring-based press feedback, pulse-loading skeletons

---

## 📝 License

MIT
