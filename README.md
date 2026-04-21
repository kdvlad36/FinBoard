# FinBoard

Минимальный desktop-сервис для работы с 3-уровневой иерархией профилей и заказов.

## Стек

- **Backend:** NestJS 10 + TypeORM + SQLite (`better-sqlite3`) + class-validator
- **Frontend:** React 18 + Vite + TypeScript + React Router

## Структура проекта

```
FinBoard/
├── backend/                      # NestJS API
│   ├── src/
│   │   ├── profile/              # Модуль Profile (entity, service, controller)
│   │   ├── order/                # Модуль Order (оплата заказов)
│   │   ├── payment/              # Entity Payment (история платежей)
│   │   ├── seed/                 # Автоматическое наполнение демо-данными
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── finboard.sqlite           # локальная БД (создаётся автоматически)
├── frontend/
│   └── app/                      # React-приложение (Vite)
│       ├── src/
│       │   ├── pages/            # ProfileListPage, ProfileDetailsPage
│       │   ├── components/       # Sidebar, Topbar, ProfileSummary, OrdersTable, SubProfilesTable
│       │   ├── api.ts            # HTTP-клиент
│       │   ├── types.ts          # Общие типы DTO
│       │   ├── format.ts         # Хелперы форматирования
│       │   └── styles.css        # Дизайн-токены и компоненты
│       └── vite.config.ts        # прокси /api → :3001
├── Makefile                      # install / build / dev / start / reset-db / clean
└── README.md
```

## Модель данных и связи

### `profiles`
- `id` — UUID
- `type` — `plus | mid | min` (Profile+, Profile, Profile min)
- `parentId` — ссылка на родителя (nullable; null = создан системой)
- `ownerType` — `system | parent` (флаг отображения цепочки владения)
- `commission` — процент комиссии (число)
- `paymentDueDate` — дата срока оплаты (ISO)

Связи:
- Profile+ → parent отсутствует
- Profile может иметь `parent.type = plus` (создан родителем) или `parentId = null` (создан системой)
- Profile min может иметь `parent.type = mid` или `parentId = null`

### `orders`
- `id`, `number`, `profileId`, `amount`, `paid`
- `status` вычисляется из `paid`/`amount`: `unpaid | partial | paid`

### `payments`
- История: `id`, `orderId`, `amount`, `createdAt` (аудит платежей)

### Агрегаты профиля
Считаются на лету по собственным заказам профиля:
- `totalAmount = SUM(orders.amount)`
- `paid = SUM(orders.paid)`
- `rest = totalAmount − paid`
- `ordersCount = COUNT(orders)`
- `subAccountsCount = COUNT(children)` — только прямые потомки

### Логика оплаты
`POST /orders/:id/payments { amount }`:
1. Транзакция: находим заказ, проверяем `0 < amount ≤ rest`
2. Обновляем `order.paid`, сохраняем запись в `payments`
3. Возвращаем заказ с пересчитанным `rest` и `status`

## API

| Метод | Путь                         | Описание                                        |
|-------|------------------------------|-------------------------------------------------|
| GET   | `/profiles?type=plus`        | Список профилей указанного уровня               |
| GET   | `/profiles/:id`              | Карточка: данные + заказы + дети + предки       |
| POST  | `/orders/:id/payments`       | Внести оплату `{ amount }`                      |

## Запуск

Требуется Node.js 18+ и `yarn`. Все команды — через `make` из корня проекта.

```bash
make install     # установить зависимости backend и frontend
make dev         # backend :3001 + frontend :5173 (с hot-reload)
```

*Тк фронт запуститься раньше бека - обновите страницу через пару сек

Открыть `http://localhost:5173`. На первом старте создаётся `backend/finboard.sqlite` с demo-данными.

Другие команды:

```bash
make build       # собрать prod-сборки
make start       # prod-сборка: backend :3001 + preview :4173
make stop        # остановить процессы
make reset-db    # удалить БД (пересоздастся с demo при следующем старте)
make clean       # снести node_modules / dist / БД
make help        # список команд
```

## Проверка руками

1. Открыть `http://localhost:5173` — список Profile+ карточек с агрегатами
2. Кликнуть карточку — откроется карточка профиля с заказами (таблица) и списком вложенных Profile
3. В таблице заказов ввести сумму в строке → «Оплатить» → счётчики профиля и поля заказа пересчитаются автоматически
4. Проваливаться во вложенные профили до Profile min через хлебные крошки и карточки
