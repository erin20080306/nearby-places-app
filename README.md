# 附近探索 - 美食 · 加油站 · 店家 PWA App

一款精緻的手機版 PWA App，免費查詢附近美食、加油站、便利商店、咖啡廳等店家資訊。使用 OpenStreetMap 地圖與 Overpass API，完全不依賴 Google 付費 API。

## 功能說明

### 核心功能
- **即時定位**：自動取得使用者位置，顯示附近店家
- **分類搜尋**：美食、加油站、咖啡廳、便利商店、一般店家
- **地圖顯示**：Leaflet + OpenStreetMap 互動式地圖
- **店家列表**：卡片式列表，依距離排序
- **導航功能**：一鍵開啟 Apple Maps（iOS）或 Google Maps 導航
- **地址搜尋**：輸入地名或地址，搜尋該地點附近店家
- **半徑切換**：500m / 1km / 3km / 5km
- **收藏管理**：收藏喜愛的店家
- **搜尋紀錄**：保留最近搜尋紀錄

### 會員機制
- **免費試用 2 天**：首次使用自動啟動
- **月付 NT$30**：試用到期後可透過 PayPal 付款升級
- **自動開通**：PayPal 付款成功後自動開通會員
- **狀態管理**：trial / paid / expired 完整狀態流程

### PWA 支援
- 可安裝到手機桌面
- 離線快取支援
- 原生 App 體驗

## 技術架構

| 項目 | 技術 |
|------|------|
| 前端框架 | React 18 + Vite |
| 樣式 | Tailwind CSS |
| 地圖 | Leaflet + React-Leaflet |
| 地圖底圖 | OpenStreetMap |
| 店家資料 | Overpass API |
| 地址搜尋 | Nominatim |
| 圖示 | Lucide React |
| 付款 | PayPal Hosted Button |
| 後端 | Vercel Serverless Functions |
| 資料儲存 | Upstash Redis（推薦）/ In-memory（開發用）|
| 部署 | Vercel |

## 安裝方式

```bash
# 1. 進入專案目錄
cd nearby-places-app

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 開啟瀏覽器
# http://localhost:3000
```

### 使用 Vercel Dev（含 API Routes）

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 啟動開發伺服器（含 serverless functions）
vercel dev
```

## 打包方式

```bash
npm run build
npm run preview  # 預覽打包結果
```

## 環境變數設定

### 前端可公開設定（VITE_ 前綴）

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `VITE_PAYPAL_CLIENT_ID` | PayPal Client ID（公開） | 已設定 |
| `VITE_PAYPAL_HOSTED_BUTTON_ID` | PayPal Hosted Button ID | BZ35QKTX6LBF4 |

### 後端私密設定（僅限 Vercel Server Environment Variables）

| 變數 | 說明 | 必要性 |
|------|------|--------|
| `PAYPAL_CLIENT_ID` | PayPal REST API Client ID | 付款驗證必要 |
| `PAYPAL_SECRET` | PayPal REST API Secret | 付款驗證必要 |
| `PAYPAL_WEBHOOK_ID` | PayPal Webhook ID | Webhook 驗證必要 |
| `PAYPAL_API_BASE` | PayPal API 網址 | 預設 `https://api-m.paypal.com` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | 正式部署必要 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | 正式部署必要 |

> ⚠️ `PAYPAL_SECRET` 和 `UPSTASH_REDIS_REST_TOKEN` 等敏感資訊**絕對不可**放在前端或 `.env` 中 commit 到 Git。

## PayPal 自動開通設定

### 流程說明

```
使用者付款 → PayPal Webhook → /api/paypal/webhook → 更新會員狀態 → 前端輪詢偵測 → 自動開通
                                                                    ↓
                                            使用者手動驗證 → /api/paypal/verify → PayPal API 查詢 → 開通
```

### 設定步驟

1. **登入 [PayPal Developer Dashboard](https://developer.paypal.com/)**
2. **建立 REST API App**，取得 Client ID 和 Secret
3. **建立 Webhook**：
   - URL: `https://your-domain.vercel.app/api/paypal/webhook`
   - 訂閱事件: `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.COMPLETED`
4. **設定 Vercel 環境變數**（見上方表格）
5. **部署後測試付款流程**

### 錯誤處理
- 付款成功但 webhook 延遲：前端顯示「正在確認付款」
- 使用者可手動輸入 PayPal email 驗證
- 後端透過 PayPal API 交叉驗證交易紀錄
- 付款失敗：顯示友善提示，不會誤開通

## GitHub 上傳

### 方法一：使用 GitHub CLI

```bash
# 登入 GitHub
gh auth login

# 建立 repo 並推送
gh repo create nearby-places-app --public --source=. --remote=origin --push
```

### 方法二：手動設定 remote

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit: 附近探索 PWA App"
git branch -M main

# 在 GitHub 建立新 repo 後，設定 remote
git remote add origin https://github.com/YOUR_USERNAME/nearby-places-app.git
git push -u origin main
```

### 後續更新

```bash
git add .
git commit -m "your commit message"
git push
```

## Vercel 部署

### 方法一：Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 首次部署（預覽）
vercel

# 正式部署
vercel --prod
```

### 方法二：連接 GitHub 自動部署

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊「Import Project」
3. 選擇 GitHub repo `nearby-places-app`
4. Framework Preset 選擇 `Vite`
5. 設定環境變數（見上方表格）
6. 點擊 Deploy

### 設定 Upstash Redis（推薦）

1. 在 Vercel Dashboard 進入專案 → Integrations
2. 搜尋「Upstash」→ 點擊安裝
3. 建立免費 Redis 資料庫
4. 環境變數 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 會自動設定

## PWA 安裝方式

### iPhone / iPad
1. 使用 Safari 開啟 App 網址
2. 點擊底部「分享」按鈕
3. 選擇「加入主畫面」
4. 點擊「新增」

### Android
1. 使用 Chrome 開啟 App 網址
2. 點擊上方「安裝」橫幅
3. 或點擊右上角選單 → 「安裝應用程式」

## 專案結構

```
nearby-places-app/
├── api/                          # Vercel Serverless Functions
│   ├── membership/
│   │   ├── status.js             # GET  取得會員狀態
│   │   └── start-trial.js        # POST 啟動免費試用
│   ├── paypal/
│   │   ├── webhook.js            # POST PayPal webhook 接收
│   │   └── verify.js             # POST 手動驗證付款
│   └── payment/
│       └── status.js             # GET  查詢付款狀態
├── lib/
│   └── storage.js                # 資料儲存抽象層
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   ├── favicon.svg               # App icon
│   └── icons/                    # PWA icons
├── src/
│   ├── main.jsx                  # 入口
│   ├── App.jsx                   # 主應用
│   ├── index.css                 # 全域樣式
│   ├── config/
│   │   ├── constants.js          # 常數定義
│   │   ├── paypal.js             # PayPal 設定
│   │   └── membership.js         # 會員方案設定
│   ├── data/
│   │   ├── categories.js         # 分類定義
│   │   └── radiusOptions.js      # 半徑選項
│   ├── utils/
│   │   ├── distance.js           # 距離計算
│   │   ├── platform.js           # 平台偵測
│   │   └── storage.js            # localStorage 工具
│   ├── services/
│   │   ├── overpassService.js    # Overpass API
│   │   ├── nominatimService.js   # Nominatim API
│   │   └── membershipService.js  # 會員 API
│   ├── hooks/
│   │   ├── useGeolocation.js     # 定位
│   │   ├── useStores.js          # 店家搜尋
│   │   ├── useFavorites.js       # 收藏
│   │   ├── useMembership.js      # 會員狀態
│   │   └── usePayPalScript.js    # PayPal SDK
│   ├── components/
│   │   ├── AppLayout.jsx         # 版面佈局
│   │   ├── SearchBar.jsx         # 搜尋列
│   │   ├── CategoryChips.jsx     # 分類按鈕
│   │   ├── RadiusSelector.jsx    # 半徑選擇
│   │   ├── MapView.jsx           # 地圖元件
│   │   ├── StoreCard.jsx         # 店家卡片
│   │   ├── StoreList.jsx         # 店家列表
│   │   ├── StoreDetailModal.jsx  # 詳情彈窗
│   │   ├── BottomNav.jsx         # 底部導覽
│   │   ├── EmptyState.jsx        # 空狀態
│   │   ├── LoadingState.jsx      # 載入狀態
│   │   ├── ErrorBanner.jsx       # 錯誤提示
│   │   ├── TrialBanner.jsx       # 試用提示
│   │   ├── PricingCard.jsx       # 方案卡片
│   │   ├── PayPalSection.jsx     # PayPal 元件
│   │   ├── UpgradeModal.jsx      # 升級彈窗
│   │   ├── MembershipStatusCard.jsx  # 會員狀態卡
│   │   ├── PaymentPendingState.jsx   # 付款確認中
│   │   ├── PaymentSuccessState.jsx   # 付款成功
│   │   └── OnboardingGuide.jsx   # 首次使用引導
│   └── pages/
│       ├── HomePage.jsx          # 首頁
│       ├── NearbyPage.jsx        # 附近頁
│       ├── FavoritesPage.jsx     # 收藏頁
│       └── UpgradePage.jsx       # 升級頁
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .gitignore
├── .env.example
└── README.md
```

## API 說明

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/membership/status?userId=xxx` | GET | 取得會員狀態 |
| `/api/membership/start-trial` | POST | 啟動免費試用 |
| `/api/paypal/webhook` | POST | PayPal webhook 接收端點 |
| `/api/paypal/verify` | POST | 手動驗證付款並開通 |
| `/api/payment/status?userId=xxx` | GET | 查詢付款狀態（輪詢用） |

## 資料儲存限制說明

- **開發模式**：使用 in-memory Map，函式重啟後資料清空
- **正式部署**：建議使用 Upstash Redis（免費方案：10K commands/day）
- **未來擴充**：可改接 MongoDB Atlas、PlanetScale、Supabase 等正式資料庫

## 後續可擴充方向

1. **正式會員系統**：加入 Email / 手機號碼註冊登入
2. **OAuth 登入**：Google / Apple / LINE 登入
3. **正式資料庫**：MongoDB Atlas / Supabase
4. **深色模式**：加入暗色主題切換
5. **多語言**：i18n 國際化支援
6. **店家評論**：使用者評分與留言
7. **推播通知**：附近新店通知
8. **分享功能**：分享店家資訊給好友
9. **路線規劃**：整合更多導航選項
10. **營業時間顯示**：即時判斷店家是否營業中
11. **PayPal 訂閱**：改為自動續約訂閱制
12. **Webhook 簽名驗證**：加入正式的 PayPal webhook 簽名驗證

## License

MIT
