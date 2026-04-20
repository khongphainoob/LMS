# 📱 Responsive & Mobile App – Chiến Lược Phát Triển Toàn Diện

> **Tài liệu hướng dẫn** biến LMS thành web responsive hoàn chỉnh và native mobile app, dựa trên phân tích codebase hiện tại.  
> Cập nhật: 2026-04-04

---

## 📋 I. PHÂN TÍCH HIỆN TRẠNG FRONTEND

### 1.1 Stack Hiện Tại

| Thành phần | Công nghệ | Phiên bản |
|------------|-----------|-----------|
| Framework | Vue 3 (Composition API) | ^3.5.27 |
| Build tool | Vite | 5.0.11 |
| Routing | Vue Router | ^4.6.4 |
| State | Pinia | 2.0.33 |
| CSS | Tailwind CSS | ^3.4.15 |
| UI Kit | frappe-ui | ^0.1.261 |
| Icons | Lucide Vue Next | 0.383.0 |
| PWA | vite-plugin-pwa | ^0.17.5 |
| Headless UI | Radix Vue, Reka UI | ^1.9.17, ^2.9.2 |
| Animation | tailwindcss-animate | ^1.0.7 |
| Language | TypeScript (partial) | 5.7.2 |

### 1.2 Cấu Trúc Layout Hiện Tại

```
App.vue
├── Tính toán Layout dựa trên useScreenSize()
│   ├── isMobile (width < 640px) → MobileLayout.vue
│   ├── noSidebar (fromLesson / persona) → NoSidebarLayout.vue
│   └── default → DesktopLayout.vue
│
├── DesktopLayout.vue
│   ├── AppSidebar (cố định bên trái, border-r)
│   └── <slot /> (nội dung chính, flex-1 overflow-auto)
│
├── MobileLayout.vue
│   ├── <slot /> (nội dung, pb-10)
│   ├── Fixed bottom tab bar (5 icon chính)
│   └── Dropdown menu (notifications, profile, logout)
│
└── InstallPrompt.vue (PWA install dialog, iOS share-sheet hướng dẫn)
```

### 1.3 Điểm Mạnh ✅
- **Đã có adaptive layout** – `App.vue` auto-switch giữa Desktop/Mobile component dựa trên `isMobile`
- **PWA đã cấu hình** – `vite-plugin-pwa` đã cài, `index.html` có đầy đủ apple-touch-icon, splash screens, manifest link
- **Swipe gesture detection** – `useSwipe()` composable đã có trong `composables.js`
- **Touch-friendly CSS** – Global `active:scale-[0.97]` cho tất cả buttons
- **Icon set thống nhất** – Lucide icons (SVG, nhẹ, đồng bộ)
- **Dark mode CSS variables** – Hệ thống design token hoàn chỉnh (light/dark)

### 1.4 Điểm Yếu ❌

| # | Vấn đề | Chi tiết |
|---|--------|----------|
| 1 | **Breakpoint quá đơn giản** | Chỉ có `< 640px` = mobile. Thiếu tablet (768–1024px) |
| 2 | **Không có responsive cho nhiều page** | `Lesson.vue` (26KB), `BatchForm.vue` (14KB), `Billing.vue` (12KB) dùng layout cứng không responsive |
| 3 | **PWA manifest chưa hoàn chỉnh** | `manifest: false` trong vite config → chỉ dùng server-generated manifest |
| 4 | **Offline mode không hoạt động** | Workbox runtime caching chỉ cache documents, không cache API responses |
| 5 | **Không có native features** | Không camera, push notifications, biometrics, file system access |
| 6 | **Tab bar cứng** | MobileLayout tab bar cứng 5 tabs, không linh hoạt theo role |
| 7 | **Thiếu skeleton/loading states** | Nhiều page không có loading skeleton cho mobile connection chậm |
| 8 | **Font load chậm trên mobile** | Import 4 font families trong `index.css` (Inter, Onest, Outfit, Plus Jakarta Sans) |

---

## 🧭 II. CHIẾN LƯỢC TỔNG THỂ – 3 TẦNG

### Kết Luận Chiến Lược

Sau khi phân tích codebase, stack hiện tại, và so sánh các phương pháp tiếp cận (PWA, Capacitor, React Native), chiến lược tối ưu nhất cho LMS này là:

```
┌─────────────────────────────────────────────────────────────┐
│                   CHIẾN LƯỢC 3 TẦNG                         │
│                                                              │
│  Tầng 1: RESPONSIVE WEB (ngay lập tức)                      │
│  ├── Sửa tất cả page → fully responsive                     │
│  ├── Thêm breakpoint tablet (md: 768px)                      │
│  ├── Cải thiện touch UX                                      │
│  └── Progressive enhancement patterns                        │
│                                                              │
│  Tầng 2: PWA NÂNG CẤP (1-2 tháng)                          │
│  ├── Full offline support (cache API, content)               │
│  ├── Push notifications (Web Push API)                       │
│  ├── Background sync (submit assignments offline)            │
│  ├── App install banner tối ưu                               │
│  └── Performance: < 3s first load, < 1s navigation           │
│                                                              │
│  Tầng 3: NATIVE APP via CAPACITOR (3-4 tháng)               │
│  ├── Wrap Vue app → iOS + Android native shell               │
│  ├── Camera + OCR (AI grading paper photos)                  │
│  ├── Biometric authentication                                │
│  ├── Native push notifications (APNs/FCM)                    │
│  ├── File download/offline course packs                      │
│  └── Publish: App Store + Google Play                        │
└─────────────────────────────────────────────────────────────┘
```

### Tại Sao Chọn Capacitor Thay Vì React Native?

| Tiêu chí | Capacitor | React Native |
|----------|-----------|--------------|
| **Tái sử dụng code** | 100% Vue code hiện tại | Phải viết lại toàn bộ bằng React |
| **Đường cong học** | Gần như zero (vẫn dùng Vue) | Cao (React + native concepts) |
| **Thời gian dev** | 1-2 tháng | 4-6 tháng |
| **Performance** | Rất tốt cho LMS (content-heavy) | Tốt hơn nhưng LMS không cần |
| **Cộng đồng** | Ionic/Capacitor ecosystem mạnh | Lớn hơn, nhưng React-centric |
| **Maintain** | 1 codebase duy nhất | 2 codebases (web Vue + mobile React) |

**Kết luận:** LMS là ứng dụng content-heavy (đọc bài, xem video, làm quiz). Capacitor cho phép tái sử dụng **100% Vue codebase hiện có** mà vẫn truy cập được tất cả native APIs cần thiết.

---

## 🛠️ III. TẦNG 1: RESPONSIVE WEB – Hướng Dẫn Chi Tiết

### 3.1 Nâng Cấp Breakpoint System

**Hiện tại:** Chỉ có 1 breakpoint `< 640px`

**Đề xuất:** Hệ thống 4 breakpoints đồng nhất

```javascript
// src/utils/composables.js – NÂNG CẤP
export function useScreenSize() {
  const size = reactive({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Đồng bộ với Tailwind breakpoints
  const isMobile   = computed(() => size.width < 640)    // sm
  const isTablet   = computed(() => size.width >= 640 && size.width < 1024) // md-lg
  const isDesktop  = computed(() => size.width >= 1024 && size.width < 1536)// lg-2xl
  const isWide     = computed(() => size.width >= 1536)   // 2xl+

  // Shorthand helpers
  const isTouchDevice = computed(() => isMobile.value || isTablet.value)
  const showSidebar   = computed(() => !isMobile.value)

  // ... (giữ nguyên event listeners)

  return { size, isMobile, isTablet, isDesktop, isWide, isTouchDevice, showSidebar }
}
```

### 3.2 Cải Tiến Layout Architecture

**Đề xuất layout mới:**

```
App.vue
├── computed Layout:
│   ├── width < 640   → MobileLayout    (bottom tab bar, full width)
│   ├── width 640-1024 → TabletLayout   (collapsible sidebar, drawer)
│   └── width > 1024  → DesktopLayout   (fixed sidebar, multi-column)
```

**File mới: `src/components/TabletLayout.vue`**
```vue
<template>
  <div class="flex h-screen">
    <!-- Collapsible sidebar -->
    <Transition name="slide-left">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 flex"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/40"
          @click="sidebarOpen = false"
        />
        <!-- Sidebar drawer -->
        <div class="relative w-72 bg-surface-menu-bar shadow-xl">
          <AppSidebar />
        </div>
      </div>
    </Transition>

    <!-- Main content -->
    <div class="flex-1 flex flex-col h-full overflow-auto">
      <!-- Top bar with hamburger -->
      <header class="sticky top-0 z-30 flex items-center gap-3 border-b bg-surface-white px-4 py-3">
        <button @click="sidebarOpen = true">
          <Menu class="h-5 w-5" />
        </button>
        <slot name="header" />
      </header>
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
```

### 3.3 Responsive Grid System

Thêm vào `index.css` một bộ layout utilities:

```css
/* Responsive content container */
.content-container {
  @apply w-full mx-auto px-4;
  @apply sm:px-6 sm:max-w-xl;
  @apply md:px-8 md:max-w-3xl;
  @apply lg:max-w-5xl;
  @apply xl:max-w-6xl;
  @apply 2xl:max-w-7xl;
}

/* Responsive card grid */
.card-grid {
  @apply grid gap-4;
  @apply grid-cols-1;          /* mobile: 1 column */
  @apply sm:grid-cols-2;       /* tablet-sm: 2 columns */
  @apply lg:grid-cols-3;       /* desktop: 3 columns */
  @apply 2xl:grid-cols-4;      /* wide: 4 columns */
}

/* Safe-area insets for notch devices */
.safe-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}
.safe-top {
  padding-top: max(env(safe-area-inset-top), 0px);
}
```

### 3.4 Các Page Cần Fix Responsive (Ưu Tiên Cao)

| Page | Kích cỡ | Vấn đề chính | Fix đề xuất |
|------|---------|---------------|-------------|
| **Lesson.vue** | 26KB | Sidebar outline + video + content cứng side-by-side | Stack xuống dưới trên mobile, collapsible outline |
| **LessonForm.vue** | 16KB | Editor full-width, toolbar overflow | Responsive toolbar, drawer cho settings |
| **BatchForm.vue** | 14KB | Multi-column form cứng | Stack columns trên mobile |
| **Billing.vue** | 12KB | Form thanh toán, address fields | Responsive form grid |
| **CourseOutline.vue** | 10KB | Drag-drop chapter list | Touch-friendly drag handles |
| **Batch.vue** | 10KB | Tab bar + content | Swipeable tabs trên mobile |
| **QuizForm.vue** | 9KB | Question editor complex layout | Simplified mobile editor |
| **Batches.vue** | 9KB | Card grid cứng | Responsive card grid |
| **ProfileEvaluator.vue** | 8KB | Calendar + time slot picker | Mobile-friendly date picker |
| **Notifications.vue** | 8KB | List view | Swipe-to-dismiss notifications |

### 3.5 Component-Level Responsive Patterns

**Pattern 1: Responsive Table → Card List**
```vue
<!-- Bảng trên desktop, card list trên mobile -->
<template>
  <!-- Desktop: Table view -->
  <table v-if="!isMobile" class="hidden sm:table w-full">
    <thead>...</thead>
    <tbody>
      <tr v-for="item in items" :key="item.name">...</tr>
    </tbody>
  </table>

  <!-- Mobile: Card view -->
  <div v-else class="sm:hidden space-y-3 px-4">
    <div
      v-for="item in items"
      :key="item.name"
      class="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <span class="font-medium">{{ item.title }}</span>
        <Badge>{{ item.status }}</Badge>
      </div>
      <p class="text-sm text-muted-foreground mt-1">{{ item.description }}</p>
    </div>
  </div>
</template>
```

**Pattern 2: Drawer thay Dialog trên mobile**
```vue
<template>
  <!-- Desktop: Standard modal -->
  <Dialog v-if="!isMobile" v-model="open">
    <slot />
  </Dialog>

  <!-- Mobile: Bottom sheet drawer -->
  <BottomSheet v-else v-model="open">
    <slot />
  </BottomSheet>
</template>
```

**Pattern 3: Pull-to-refresh**
```vue
<template>
  <div
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      v-if="isPulling"
      class="flex justify-center py-4 transition-transform"
      :style="{ transform: `translateY(${pullDistance}px)` }"
    >
      <Loader2 class="h-5 w-5 animate-spin" />
    </div>
    <slot />
  </div>
</template>
```

---

## 📲 IV. TẦNG 2: PWA NÂNG CẤP – Hướng Dẫn Chi Tiết

### 4.1 Nâng Cấp Vite PWA Config

```javascript
// vite.config.js – CẬP NHẬT
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.png', 'learning.svg'],
  devOptions: {
    enabled: true,  // BẬT cho dev
  },
  workbox: {
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

    // Pre-cache core app shell
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],

    // Runtime caching strategy
    runtimeCaching: [
      // HTML pages - Network First
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'html-cache',
          expiration: { maxEntries: 10 },
        },
      },
      // API calls - Stale While Revalidate
      {
        urlPattern: /\/api\/method\/.*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 300, // 5 minutes
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Images - Cache First
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 3600, // 30 days
          },
        },
      },
      // Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'font-cache' },
      },
    ],
  },

  // Web App Manifest
  manifest: {
    name: 'LMS - Learning Management System',
    short_name: 'LMS',
    description: 'Nền tảng học trực tuyến',
    theme_color: '#FFFFFF',
    background_color: '#FFFFFF',
    display: 'standalone',
    orientation: 'any',
    start_url: '/lms',
    scope: '/lms',
    categories: ['education'],
    icons: [
      { src: '/assets/lms/frontend/manifest/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/lms/frontend/manifest/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/lms/frontend/manifest/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'My Courses', url: '/lms/courses', icons: [{ src: '/assets/lms/frontend/manifest/icon-192.png', sizes: '192x192' }] },
      { name: 'Notifications', url: '/lms/notifications' },
    ],
  },
})
```

### 4.2 Offline Data Strategy

```
┌──────────────────────────────────────────────────────────┐
│              OFFLINE DATA ARCHITECTURE                    │
│                                                           │
│  IndexedDB (via idb-keyval)                              │
│  ├── courses-store                                        │
│  │   ├── enrolled courses (full detail)                   │
│  │   ├── course chapters & lesson titles                  │
│  │   └── quiz questions (pre-cached on enrollment)        │
│  │                                                        │
│  ├── progress-store                                       │
│  │   ├── lesson completion marks (pending sync)           │
│  │   ├── quiz answers (pending submit)                    │
│  │   └── assignment drafts (pending upload)               │
│  │                                                        │
│  └── user-store                                           │
│      ├── profile data                                     │
│      ├── notifications (last 50)                          │
│      └── session & auth tokens                            │
│                                                           │
│  Background Sync API                                      │
│  ├── POST lesson-progress → sync when online              │
│  ├── POST quiz-submission → sync when online              │
│  └── POST assignment-upload → sync when online            │
│                                                           │
│  Service Worker                                           │
│  ├── Precache: app shell, fonts, icons                    │
│  ├── Runtime: API stale-while-revalidate                  │
│  ├── Offline fallback page: "Bạn đang offline"           │
│  └── Push event handler                                   │
└──────────────────────────────────────────────────────────┘
```

**File mới: `src/utils/offlineStore.js`**
```javascript
import { get, set, del, keys } from 'idb-keyval'

export const offlineStore = {
  // Lưu khóa học đã enroll cho offline
  async cacheCourse(courseData) {
    await set(`course:${courseData.name}`, {
      ...courseData,
      cached_at: Date.now(),
    })
  },

  // Queue pending actions khi offline
  async queueAction(action) {
    const queue = (await get('offline-queue')) || []
    queue.push({ ...action, queued_at: Date.now() })
    await set('offline-queue', queue)
  },

  // Sync tất cả pending actions khi online trở lại
  async flushQueue() {
    const queue = (await get('offline-queue')) || []
    for (const action of queue) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: JSON.stringify(action.body),
        })
      } catch (e) {
        // Re-queue failed actions
        console.warn('Sync failed, will retry:', e)
        return
      }
    }
    await del('offline-queue')
  },
}

// Auto-sync khi online trở lại
window.addEventListener('online', () => {
  offlineStore.flushQueue()
})
```

### 4.3 Push Notifications (Web Push API)

```javascript
// src/utils/pushNotifications.js
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push not supported')
    return null
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  // Gửi subscription lên server
  await fetch('/api/method/lms.lms.api.register_push_subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  })

  return subscription
}
```

---

## 📱 V. TẦNG 3: NATIVE APP VIA CAPACITOR

### 5.1 Tổng Quan Kiến Trúc Capacitor

```
┌──────────────────────────────────────────────────────────┐
│                 CAPACITOR ARCHITECTURE                    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │              Vue 3 App (web layer)               │     │
│  │  - Components, Pages, Router, Stores             │     │
│  │  - 100% reuse from web version                   │     │
│  └──────────────────┬──────────────────────────────┘     │
│                     │                                     │
│  ┌──────────────────▼──────────────────────────────┐     │
│  │          Capacitor Bridge (JS ↔ Native)          │     │
│  │  ├── @capacitor/camera       → OCR paper photos  │     │
│  │  ├── @capacitor/push-notif   → FCM / APNs        │     │
│  │  ├── @capacitor/filesystem   → Offline courses    │     │
│  │  ├── @capacitor/haptics      → Touch feedback     │     │
│  │  ├── @capacitor/app          → Deep links         │     │
│  │  ├── @capacitor/browser      → OAuth login        │     │
│  │  ├── @capacitor/status-bar   → Immersive mode     │     │
│  │  ├── @capacitor/keyboard     → Keyboard control   │     │
│  │  ├── @capacitor/splash-screen→ Launch screen      │     │
│  │  └── @capgo/capacitor-updater→ OTA updates        │     │
│  └──────────────────┬──────────────────────────────┘     │
│                     │                                     │
│  ┌──────────────────▼──────────────────────────────┐     │
│  │            Native Platform Layer                 │     │
│  │  ├── Android (Kotlin/Java, WebView)              │     │
│  │  └── iOS (Swift, WKWebView)                      │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Cài Đặt Capacitor Vào Dự Án

```bash
# Bước 1: Cài Capacitor core
cd frontend/
npm install @capacitor/core @capacitor/cli

# Bước 2: Khởi tạo Capacitor
npx cap init "LMS Learning" "com.lms.learning" --web-dir=dist

# Bước 3: Thêm platforms
npx cap add android
npx cap add ios

# Bước 4: Cài plugins cần thiết
npm install @capacitor/camera @capacitor/push-notifications \
            @capacitor/filesystem @capacitor/haptics \
            @capacitor/app @capacitor/browser \
            @capacitor/status-bar @capacitor/keyboard \
            @capacitor/splash-screen @capacitor/network

# Bước 5: Build và sync
npm run build    # Vite build → dist/
npx cap sync     # Copy dist/ → android/ios native projects
```

### 5.3 Capacitor Config

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.lms.learning',
  appName: 'LMS Learning',
  webDir: 'dist',
  server: {
    // Trỏ về backend trong development
    url: process.env.NODE_ENV === 'development'
      ? 'http://192.168.1.x:8080'
      : undefined,
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: true,
      spinnerColor: '#1a1a2e',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
    StatusBar: {
      style: 'light',
    },
  },
}

export default config
```

### 5.4 Platform-Aware Composable

**File mới: `src/utils/platform.js`**
```javascript
import { ref, computed } from 'vue'
import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const platform = Capacitor.getPlatform() // 'web' | 'ios' | 'android'
  const isNative = Capacitor.isNativePlatform()
  const isWeb = platform === 'web'
  const isIOS = platform === 'ios'
  const isAndroid = platform === 'android'

  return { platform, isNative, isWeb, isIOS, isAndroid }
}
```

**Sử dụng trong components:**
```vue
<script setup>
import { usePlatform } from '@/utils/platform'

const { isNative, isIOS } = usePlatform()

// Sử dụng camera native thay vì file input
async function takePhoto() {
  if (isNative) {
    const { Camera, CameraResultType } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
    })
    return photo.dataUrl
  } else {
    // Fallback: web file input
    return openFileDialog()
  }
}
</script>
```

### 5.5 Native Features Cho LMS

| Feature | Plugin | Use Case |
|---------|--------|----------|
| **Camera** | @capacitor/camera | Chụp bài thi cho AI Grading |
| **Push Notifications** | @capacitor/push-notifications | Thông báo bài tập, lớp live, kết quả chấm |
| **Filesystem** | @capacitor/filesystem | Download bài học offline, SCORM packages |
| **Haptics** | @capacitor/haptics | Feedback khi hoàn thành quiz, submission |
| **Network** | @capacitor/network | Detect online/offline, auto-sync |
| **App** | @capacitor/app | Deep links (`lms://courses/abc`), back button Android |
| **Browser** | @capacitor/browser | OAuth login, external links |
| **Share** | @capacitor/share | Chia sẻ khóa học, chứng chỉ |
| **Local Notifications** | @capacitor/local-notifications | Nhắc nhở lịch học, deadline |
| **Biometrics** | capacitor-native-biometric | Login bằng FaceID / TouchID |

---

## 📂 VI. CODEBASE – CẦN THIẾT KẾ THÊM GÌ?

### 6.1 Cấu Trúc Thư Mục Đề Xuất (Post-upgrade)

```
frontend/
├── src/
│   ├── components/
│   │   ├── layouts/                    [NEW] Layout system
│   │   │   ├── DesktopLayout.vue       [REFACTOR] Giữ nguyên
│   │   │   ├── TabletLayout.vue        [NEW] Collapsible sidebar
│   │   │   ├── MobileLayout.vue        [REFACTOR] Nâng cấp tab bar
│   │   │   └── NoSidebarLayout.vue     [GIỮA NGUYÊN]
│   │   │
│   │   ├── responsive/                 [NEW] Responsive primitives
│   │   │   ├── ResponsiveContainer.vue [NEW] Auto-pad, max-width
│   │   │   ├── ResponsiveGrid.vue      [NEW] Smart card grid
│   │   │   ├── BottomSheet.vue         [NEW] Mobile drawer
│   │   │   ├── PullToRefresh.vue       [NEW] Pull-to-refresh
│   │   │   ├── SwipeableList.vue       [NEW] Swipe actions
│   │   │   ├── SkeletonCard.vue        [NEW] Loading skeleton
│   │   │   └── InfiniteScroll.vue      [NEW] Infinite scroll list
│   │   │
│   │   ├── native/                     [NEW] Native-only components
│   │   │   ├── CameraCapture.vue       [NEW] Camera → AI grading
│   │   │   ├── BiometricLogin.vue      [NEW] FaceID/TouchID
│   │   │   ├── NativePushBanner.vue    [NEW] Push permission
│   │   │   └── OfflineIndicator.vue    [NEW] Status bar offline
│   │   │
│   │   ├── Sidebar/                    [GIỮA NGUYÊN]
│   │   ├── Common/                     [GIỮA NGUYÊN]
│   │   ├── Modals/                     [GIỮA NGUYÊN]
│   │   ├── AIGrading/                  [GIỮA NGUYÊN]
│   │   └── ui/                         [EXPAND] Thêm responsive components
│   │
│   ├── composables/                    [NEW → tách ra từ utils/]
│   │   ├── useScreenSize.js            [REFACTOR] 4 breakpoints
│   │   ├── useSwipe.js                 [REFACTOR] Từ composables.js
│   │   ├── usePlatform.js              [NEW] Capacitor platform detect
│   │   ├── useNetwork.js               [NEW] Online/offline detection
│   │   ├── useOfflineStore.js          [NEW] IndexedDB wrapper
│   │   ├── usePushNotifications.js     [NEW] Push subscription
│   │   ├── useHaptics.js               [NEW] Haptic feedback
│   │   ├── useCamera.js                [NEW] Camera abstraction
│   │   └── useLocalStorage.js          [REFACTOR] Từ composables.js
│   │
│   ├── pages/                          [REFACTOR ALL → responsive]
│   │   └── (tất cả pages hiện tại)
│   │
│   ├── stores/                         [EXPAND]
│   │   ├── session.js                  [GIỮA NGUYÊN]
│   │   ├── settings.js                 [GIỮA NGUYÊN]
│   │   ├── sidebar.js                  [GIỮA NGUYÊN]
│   │   ├── user.js                     [GIỮA NGUYÊN]
│   │   ├── offline.js                  [NEW] Offline data store
│   │   └── notifications.js            [NEW] Push notification state
│   │
│   └── utils/                          [GIỮA NGUYÊN + thêm]
│       ├── index.js
│       ├── offlineStore.js             [NEW]
│       ├── pushNotifications.js        [NEW]
│       └── ...
│
├── android/                            [NEW → generated by Capacitor]
│   ├── app/
│   ├── build.gradle
│   └── ...
│
├── ios/                                [NEW → generated by Capacitor]
│   ├── App/
│   ├── Podfile
│   └── ...
│
├── capacitor.config.ts                 [NEW]
├── vite.config.js                      [REFACTOR] PWA nâng cấp
├── tailwind.config.js                  [REFACTOR] Thêm responsive utils
└── package.json                        [UPDATE] Thêm Capacitor deps
```

### 6.2 Scripts Package.json Mới

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --base=/assets/lms/frontend/",

    "mobile:sync": "npx cap sync",
    "mobile:android": "npx cap open android",
    "mobile:ios": "npx cap open ios",
    "mobile:build": "npm run build && npx cap sync",
    "mobile:run:android": "npx cap run android",
    "mobile:run:ios": "npx cap run ios",
    "mobile:live": "npx cap run android --livereload --external"
  }
}
```

---

## 🔄 VII. LUỒNG PHÁT TRIỂN (Development Workflow)

### 7.1 Git Branch Strategy

```
main
 ├── develop
 │   ├── feature/responsive-layouts      ← Tầng 1
 │   ├── feature/pwa-upgrade             ← Tầng 2
 │   ├── feature/capacitor-integration   ← Tầng 3
 │   ├── feature/offline-support         ← Tầng 2+3
 │   └── feature/native-camera           ← Tầng 3
 │
 ├── staging                             ← Test integration
 └── production                          ← Release
```

### 7.2 Development Loop

```
┌────────────────────────────────────────────────────────┐
│               DEV WORKFLOW                              │
│                                                         │
│  1. Code Vue component (responsive-first)               │
│     ↓                                                   │
│  2. Test on browser (desktop → resize → mobile)         │
│     ↓                                                   │
│  3. Test on browser DevTools (device emulation)         │
│     ↓                                                   │
│  4. npm run build                                       │
│     ↓                                                   │
│  5. npx cap sync                                        │
│     ↓                                                   │
│  6. Test on Android Emulator / iOS Simulator            │
│     ↓                                                   │
│  7. Test on physical devices (Android + iPhone)         │
│     ↓                                                   │
│  8. Merge → staging → production                        │
└────────────────────────────────────────────────────────┘
```

### 7.3 Nguyên Tắc Coding (Responsive-First)

**Quy tắc 1: Mobile-First CSS**
```vue
<!-- ✅ ĐÚNG: Mobile first, thêm lên Desktop -->
<div class="flex flex-col gap-3 sm:flex-row sm:gap-6 lg:gap-8">

<!-- ❌ SAI: Desktop first, override xuống Mobile -->
<div class="flex flex-row gap-8 max-sm:flex-col max-sm:gap-3">
```

**Quy tắc 2: Platform-aware logic, nhưng UI lúc nào cũng web-first**
```vue
<script setup>
// Logic: kiểm tra platform cho native features
const { isNative } = usePlatform()
const handleCapture = isNative ? nativeCamera : webFileInput

// UI: LUÔN dùng responsive Tailwind, KHÔNG dùng JS để ẩn/hiện
</script>

<template>
  <!-- ✅ ĐÚNG: Tailwind responsive -->
  <div class="hidden sm:block">Desktop only content</div>
  <div class="sm:hidden">Mobile only content</div>

  <!-- ❌ SAI: JS responsive -->
  <div v-if="!isMobile">Desktop only content</div>
</template>
```

**Quy tắc 3: Touch targets tối thiểu 44×44px**
```css
/* Tất cả interactive elements trên mobile phải >= 44px */
@media (pointer: coarse) {
  button, a, [role="button"], input[type="checkbox"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

**Quy tắc 4: Font size tối thiểu 16px trên mobile (tránh auto-zoom iOS)**
```css
@media (max-width: 640px) {
  input, select, textarea {
    font-size: 16px !important; /* Prevent iOS auto-zoom */
  }
}
```

---

## 📅 VIII. TIMELINE VÀ CHECKLIST

### Phase 1: Responsive Web (Tuần 1-4)

**Tuần 1-2: Foundation**
- [ ] Nâng cấp `useScreenSize()` → 4 breakpoints
- [ ] Tạo `TabletLayout.vue`
- [ ] Tạo responsive primitives: `ResponsiveContainer`, `ResponsiveGrid`, `BottomSheet`
- [ ] Tạo `SkeletonCard.vue`, `PullToRefresh.vue`
- [ ] Thêm responsive CSS utilities vào `index.css`
- [ ] Fix font loading: chỉ load font đang dùng (Onest), preload

**Tuần 3-4: Page Migration**
- [ ] Fix `Lesson.vue` responsive (highest priority – 26KB)
- [ ] Fix `Batches.vue`, `BatchForm.vue` responsive
- [ ] Fix `Billing.vue` responsive
- [ ] Fix `QuizForm.vue`, `QuizPage.vue` responsive
- [ ] Fix `Profile*.vue` responsive
- [ ] Fix `Jobs.vue`, `Notifications.vue` responsive
- [ ] Fix `AIGrading/*.vue` responsive
- [ ] Test tất cả pages trên Chrome DevTools 5+ device sizes

### Phase 2: PWA Upgrade (Tuần 5-8)

- [ ] Cấu hình full web manifest trong `vite.config.js`
- [ ] Implement runtime caching strategies (API, images, fonts)
- [ ] Tạo offline fallback page
- [ ] Implement `offlineStore.js` (IndexedDB)
- [ ] Implement background sync cho lesson progress / quiz submission
- [ ] Implement Web Push subscription
- [ ] Backend: API `register_push_subscription`, `send_push_notification`
- [ ] Test PWA install trên Android Chrome, iOS Safari
- [ ] Lighthouse PWA audit → score ≥ 90

### Phase 3: Capacitor Native App (Tuần 9-16)

**Tuần 9-10: Setup**
- [ ] Install Capacitor, init project
- [ ] Add Android + iOS platforms
- [ ] Configure `capacitor.config.ts`
- [ ] Setup dev workflow (live reload)
- [ ] Create app icons, splash screens

**Tuần 11-12: Native Features**
- [ ] Implement `usePlatform.js` composable
- [ ] Implement `CameraCapture.vue` (AI Grading photo capture)
- [ ] Implement push notifications (FCM for Android, APNs for iOS)
- [ ] Implement biometric login
- [ ] Implement deep linking (`lms://courses/{name}`)
- [ ] Implement network status + offline indicator

**Tuần 13-14: Polish**
- [ ] Haptic feedback trên các interactions quan trọng
- [ ] Status bar styling (iOS safe area, Android immersive)
- [ ] Keyboard handling (resize, auto-dismiss)
- [ ] Back button handling (Android)
- [ ] App lifecycle (pause, resume, state restore)
- [ ] Performance profiling trên physical devices

**Tuần 15-16: Release**
- [ ] Android: Sign APK/AAB, test trên 3+ devices
- [ ] iOS: Xcode signing, TestFlight distribution
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Setup CI/CD cho mobile builds (Fastlane + GitHub Actions)
- [ ] Setup OTA update system (Capgo / custom)

---

## 📊 IX. KPIs VÀ METRICS

| Metric | Mục tiêu | Cách đo |
|--------|---------|---------|
| Lighthouse Performance | ≥ 90 | Chrome DevTools |
| Lighthouse PWA | ≥ 90 | Chrome DevTools |
| First Contentful Paint | < 1.5s | Web Vitals |
| Largest Contentful Paint | < 2.5s | Web Vitals |
| Time to Interactive | < 3.5s | Web Vitals |
| Cumulative Layout Shift | < 0.1 | Web Vitals |
| App Store Rating | ≥ 4.5 | Play/App Store |
| Install Rate (PWA) | > 5% of mobile users | Analytics |
| Offline Usage | > 10% of sessions | Service Worker logs |
| Push Opt-in Rate | > 30% | Backend tracking |

---

## 📚 X. TÀI LIỆU THAM KHẢO

### Official Docs
1. **Capacitor** – [capacitorjs.com/docs](https://capacitorjs.com/docs)
2. **Vite Plugin PWA** – [vite-pwa-org.netlify.app](https://vite-pwa-org.netlify.app)
3. **Tailwind CSS Responsive** – [tailwindcss.com/docs/responsive-design](https://tailwindcss.com/docs/responsive-design)
4. **Vue 3 Composition API** – [vuejs.org/guide/extras/composition-api-faq.html](https://vuejs.org/guide/extras/composition-api-faq.html)

### Best Practices
5. **Google Web Vitals** – [web.dev/vitals](https://web.dev/vitals/)
6. **Responsive Web Design Fundamentals** – [web.dev/responsive-web-design-basics](https://web.dev/responsive-web-design-basics/)
7. **PWA Checklist** – [web.dev/pwa-checklist](https://web.dev/pwa-checklist/)
8. **Material Design 3 — Responsive Layout** – [m3.material.io](https://m3.material.io/foundations/layout/applying-layout/window-size-classes)

### Tools
9. **Capgo** (OTA Updates) – [capgo.app](https://capgo.app)
10. **Fastlane** (CI/CD mobile) – [fastlane.tools](https://fastlane.tools)
11. **BrowserStack** (Device testing) – [browserstack.com](https://browserstack.com)
