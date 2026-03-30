# X (Twitter) Clone — Mobile App

Мобільний застосунок — клон соціальної мережі X (Twitter), створений з використанням Expo, Clerk та Convex.

---

## 👩‍💻 Розробник

| Роль | Ім'я |
|------|------|
| Team Lead / Project Setup | Савчук Юлія |
| Auth Developer | Савчук Юлія |
| Backend Developer | Савчук Юлія |
| UI Developer | Савчук Юлія |

> Проєкт виконано самостійно — всі ролі реалізовано однією особою.

---

## 🛠 Технології

- **Expo Router** — навігація (Stack + Tabs)
- **Clerk** — автентифікація через Google OAuth
- **Convex** — база даних і бекенд
- **TypeScript** — типізація
- **MaterialIcons** — іконки

---

## 🚀 Інструкція запуску

### 1. Клонувати репозиторій
```bash
git clone https://github.com/JuliaSavchuk/x-clone.git
cd x-clone
```

### 2. Встановити залежності
```bash
npm install
```

### 3. Створити файл `.env` у корені проєкту
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx

CONVEX_DEPLOYMENT=dev:xxxxxx

EXPO_PUBLIC_CONVEX_URL=https://xxxxxxxxxxxxxxxx.convex.cloud

EXPO_PUBLIC_CONVEX_SITE_URL=https://xxxxxxxxxxxxxxxx.convex..site

```

### 4. Запустити Convex (в окремому терміналі)
```bash
npx convex dev
```

### 5. Запустити додаток
```bash
npm start
```

Відсканувати QR-код через **Expo Go** або запустити в емуляторі.

---

## ✅ Функціонал

- [x] Екран входу з кнопкою «Continue with Google»
- [x] Google OAuth через Clerk
- [x] Автоматичний редірект після входу на таби
- [x] Захист роутів (незалогінений користувач → login)
- [x] Tab Navigator з 4 вкладками (Feed, Create, Notifications, Profile)
- [x] MaterialIcons іконки на кожному табі
- [x] Темна тема (чорний фон, Twitter Blue акцент)
- [x] Convex база даних з таблицею users
- [x] Clerk Webhook для автоматичного створення юзера в БД

---

## 📁 Структура проєкту
```
x-clone/
├── app/
│   ├── _layout.tsx              # ClerkProvider + ConvexProvider + SafeAreaView
│   ├── index.tsx                # Redirect → login
│   ├── (auth)/
│   │   └── login.tsx            # Google OAuth (useSSO)
│   └── (tabs)/
│       ├── _layout.tsx          # Tab Navigator
│       ├── index.tsx            # Feed
│       ├── create.tsx           # Create
│       ├── notifications.tsx    # Notifications
│       └── profile.tsx          # Profile
├── components/
│   └── InitialLayout.tsx        # Захист роутів
├── constants/
│   └── theme.ts                 # Кольорова палітра
├── convex/
│   ├── auth.config.ts           # Clerk + Convex інтеграція
│   ├── schema.ts                # Схема БД
│   ├── users.ts                 # Мутації для юзерів
│   └── http.ts                  # Webhook обробник
├── providers/
│   └── ClearAndConvexProviders.tsx
├── styles/
│   └── login.styles.ts
└── .env 
```

---

## 🎨 Кольорова палітра

| Змінна | Колір | Призначення |
|--------|-------|-------------|
| `primary` | `#1DA1F2` | Twitter Blue |
| `background` | `#000000` | Фон |
| `surface` | `#16181C` | Картки |
| `surfaceLight` | `#2F3336` | Розділювачі |
| `white` | `#E7E9EA` | Текст |
| `grey` | `#71767B` | Підписи |

---

## 📸 Скріншоти

| Login Screen | Feed Tab |
|---|---|
|<img width="396" height="887" alt="Знімок екрана 2026-03-30 230707" src="https://github.com/user-attachments/assets/043d36f4-e8e6-4b74-a36c-b9e4d4d73720" />|_<img width="398" height="883" alt="Знімок екрана 2026-03-30 230733" src="https://github.com/user-attachments/assets/c21966a5-0ec5-4fbd-9f78-4d488674057d" />
 |
