<div align="center">
  <img src="./assets/icon.png" width="120" height="120" style="border-radius: 28px" alt="Atelier Logo" />
  <h1>The Atelier</h1>
  <p><strong>A Mini LMS built with React Native Expo</strong></p>
  
  <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
    <img src="https://img.shields.io/badge/Framework-Expo%20SDK%2055-29214D?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Language-TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Build-Android%20APK-FFD700?style=for-the-badge&logo=android&logoColor=black" alt="Android" />
    <img src="https://img.shields.io/badge/Tests-105%20Passed-4CAF50?style=for-the-badge&logo=jest&logoColor=white" alt="Tests" />
  </div>
</div>

---

## 🎨 Project Overview

**The Atelier** is a production-ready Learning Management System (LMS) designed for the learners. Built on the philosophy of "The Digital Curator," the app treats every course as a valuable asset and provides a seamless, high-performance environment for browsing, enrolling, and learning—even in low-connectivity environments.

---

## 🏗 Key Architectural Decisions

<p align="center">
  <img src="./assets/system-architecture.png" alt="System Architecture" width="800" />
</p>

We prioritized **Resilience**, **Security**, and **Performance** in every layer of the application.

### 1. 🌐 Offline-First Resilience (SWR Strategy)

To bridge the gap between native performance and unreliable networks, we implemented a **Stale-While-Revalidate (SWR)** caching layer.

- **Decision**: Use `AsyncStorage` to persist the full course catalog and instructor data.
- **Rationale**: This allows the app to load instantly from cache while refetching the latest content in the background. Users can browse, search, and view bookmarks without a live connection.
- **Experience**: A global "Network State" listener displays a professional offline banner, and technical Axios error overlays are replaced with branded UI components.

### 2. 🔐 Two-Tier Data Persistence (Security-First)

We categorized application data into two tiers to optimize for both security and speed.

- **Tier 1: Sensitive Data**: JWT Authentication tokens and user preferences are stored in **Expo SecureStore**, which uses hardware-backed encryption on-device.
- **Tier 2: Discovery Data**: Course lists and bookmarks are stored in **AsyncStorage** for fast, local-first access (supporting the 100+ item catalog).

### 3. 📉 High-Performance List Optimization

For the course catalog, we moved beyond standard `FlatList`.

- **Decision**: Integrated **LegendList** (`@legendapp/list`).
- **Rationale**: LegendList offers significant memory savings and smoother 60FPS scrolling by optimizing the virtualization of complex items. Combined with `React.memo`, this ensures a jank-free experience on both Android and iOS.

### 🔗 Bi-Directional WebView Bridge

The course content view uses a sophisticated **WebView-to-Native bridge**.

- **Header Injection**: State and authorization are communicated to the embedded HTML content via custom headers.
- **Error Boundaries**: Dedicated logic detects loading failures and provides a "Retry" state, preventing users from ever seeing a blank web view.

### 📡 API & Data Mapping

To fulfill the assignment criteria, the app maps standard FreeAPI endpoints to LMS-specific business logic:

*   **📘 Course Catalog** (`GET /api/v1/public/randomproducts`)  
    *Primary data source for titles, pricing, thumbnails, and descriptions.*
*   **👨‍🏫 Instructor Profiles** (`GET /api/v1/public/randomusers`)  
    *Used to provide professional names and portrait avatars for every course.*
*   **🔐 Authentication** (`POST /api/v1/users/login` / `register`)  
    *Handles secure session management and JWT persistence.*
*   **📸 Profile Sync** (`PATCH /api/v1/users/avatar`)  
    *Syncs local camera/gallery uploads with the remote user profile.*

---

## 🛠 Features Breakdown

*   **🔐 Auth Architecture**  
    JWT persistence, Auto-login on restart, and Hardware-backed Encryption via **SecureStore**.
*   **🎓 High-Speed Catalog**  
    **60FPS LegendList** integration with Debounced Search, Pull-to-refresh, and Skeleton loaders.
*   **🤖 Smart Innovation**  
    **Atelier AI Insights**: Automated, AI-generated course takeaways for streamlined learning.
*   **🔔 Native Engagement**  
    Milestone triggers (5+ bookmarks) and 24-hour smart inactivity reminders.
*   **📸 Premium Profile**  
    Direct Camera/Gallery integration with **Optimistic UI Updates** and signing-out chip.
*   **🛡️ Hardened Security**  
    **Jailbreak Detection**, Zod form validation, and full HTTPS enforcement.

---

## 🔄 Application Flow

<p align="center">
  <img src="./assets/app-flow.png" alt="Application Flow" width="800" />
</p>

---

## 📸 Screenshots & User Flow

<p align="center">
  <img src="https://img.shields.io/badge/-🔐%20Onboarding%20%26%20Core-29214D?style=for-the-badge" alt="Onboarding" />
</p>
<p align="center">
  <img src="./assets/screenshots/1_login.png" width="250" hspace="20" vspace="15" alt="Login Screen" />
  <img src="./assets/screenshots/2_register.png" width="250" hspace="20" vspace="15" alt="Register Screen" />
  <img src="./assets/screenshots/3_home.png" width="250" hspace="20" vspace="15" alt="Home Dashboard" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/-🎓%20Course%20Discovery-29214D?style=for-the-badge" alt="Discovery" />
</p>
<p align="center">
  <img src="./assets/screenshots/4_explore.png" width="250" hspace="20" vspace="15" alt="Explore Catalog" />
  <img src="./assets/screenshots/5_course_detail.png" width="250" hspace="20" vspace="15" alt="Course Details" />
  <img src="./assets/screenshots/10_webview_content.png" width="250" hspace="20" vspace="15" alt="WebView Lessons" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/-👤%20User%20Hub%20%26%20Engagement-29214D?style=for-the-badge" alt="User Hub" />
</p>
<p align="center">
  <img src="./assets/screenshots/11_profile.png" width="250" hspace="20" vspace="15" alt="Profile Screen" />
  <img src="./assets/screenshots/8_enrolled_courses.png" width="250" hspace="20" vspace="15" alt="My Courses" />
  <img src="./assets/screenshots/7_bookmarks.png" width="250" hspace="20" vspace="15" alt="Bookmarks" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/-🛡%EF%B8%8F%20Resilience%20%26%20Native-29214D?style=for-the-badge" alt="Resilience" />
</p>
<p align="center">
  <img src="./assets/screenshots/9_offline_mode.png" width="250" hspace="20" vspace="15" alt="Offline Resilience" />
  <img src="./assets/screenshots/12_notifications.png" width="250" hspace="20" vspace="15" alt="Native Notifications" />
</p>

---

## 📦 Local Setup & Configuration

### Prerequisites

- **Node.js** (LTS version)
- **npm** or **yarn**
- **Expo Go** app installed on your physical device (optional for testing)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/epavan162/edtech-lms-app.git

# Navigate into the project
cd edtech-lms-app

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env` file in the root directory.

```env
# The FreeAPI base URL (Required)
EXPO_PUBLIC_API_URL=https://api.freeapi.app

# Optional Sentry DSN for error tracking
EXPO_PUBLIC_SENTRY_DSN=your_dsn_here
```

### 3. Execution

```bash
# Start the Expo development server
npx expo start

# Interactions:
# Press 'a' to open in Android Emulator
# Press 'i' to open in iOS Simulator
# Press 'w' to open in Web Browser
```

---

## 🧪 Quality Assurance

We maintain a rigorous testing standard. Every major service and state logic is covered by **105 Jest tests**.

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

_Current Coverage Profile: 100% Core Services, >75% UI Components._

---

## 🚀 DevOps & CI/CD Pipeline

<p align="center">
  <img src="./assets/ci-cd-pipeline.png" alt="CI/CD Pipeline" width="800" />
</p>

We utilize **GitHub Actions** for professional-grade distribution:

- **Quality Gate**: Automatic test run on every push; build fails if tests fail or coverage drops below 70%.
- **Automated Builds**: Successful main branch pushes trigger an **Android APK Build** via Gradle.
- **Internal Distribution**: APKs are automatically uploaded to **GitHub Releases** with auto-incrementing tags (e.g., `v0.1`, `v0.2`).

---

## ⚠️ Known Issues & Limitations

1.  **API Rate Limits**: Since we use `api.freeapi.app`, occasional 429 errors may occur during peak hours. We've implemented retry logic to mitigate this.
2.  **Web Support**: While fully functional on Web, native features like `SecureStore` fallback to local storage, and Push Notifications are simulated.
3.  **Avatar Persistence**: Direct file path updates in `AsyncStorage` might require a manual refresh if the native OS clears temp folders (API sync is the primary source of truth).

---

<div align="center">
  <p><b>Developed with precision and care for the React Native Expo Developer Assignment.</b></p>
  <img src="https://img.shields.io/badge/Status-Complete-4CAF50?style=for-the-flat&logo=check" alt="Status" />
</div>
