# Детекция анти-детект браузера

## Запуск проекта

### Настройка

- В папках `postgres`, `backend` и `frontend` создать файл `.env` по шаблону `.env.dist`

### Запуск одной командой

```shell
docker compose up -d
```

## Используемые технологии:

### Backend:

- NestJS (api + swagger)
- Prisma (ORM)

### Fontend:

- React
- Tanstack Router
- Tanstack Query
- axios
- Tailwind
- ShadcnUI (почти все элементы отсюда)
- Lucide (иконки)

## Задание

### Теория

[Детект анти-детект браузера](https://blog.castle.io/anti-detect-browser-analysis-how-to-detect-the-undetectable-browser/)

---

### Задачи

- [x] Разработка базы данных с таблицами `users` и `scans`
- [x] Разработка backend - REST-full API:
  `POST`, `GET`, `DELETE` для списка сканов
  `GET`, `DELETE` для взаимодействия со сканом по id
- [x] Разработка frontend - 3 страницы:
    1. Главная (запуск формирования скана)
    2. История сканов (отображение истории сканов), поиск по id, сортировка по дате/статусу скана
    3. Подробная информация по скану (клик из истории сканов)

#### Требования

- [x] Приложение обернуто в docker-compose
- [x] Написать `README` с информацией о зависимостях для запуска, процесса запуска приложения и с описанием всех endpoint'ов с их параметрами для правильного использования
  приложения.

#### Технологии

- [x] Backend: `Nest/NodeJS`, `PostgreSQL`
- [x] Frontend: `TypeScript`, `React`, `Tanstack Router`, `Tanstack Query`, `Tailwind`, `ShadcnUI`

#### Ожидаемый результат

Приложение, выявляющее использование анти-детект браузер `Gologin`.

---

### Решение

#### Backend (API)

1. Установил `NestJS`, создал проект, добавил 2 res: users и scans.
2. Добавил `docker-compose` с базой данных.
3. Установил `prisma` и `prisma/client`, инициализировал, создал модели, подключил бд, синхронизировал бд с моделями.
   > добавил `"include": ["src", "generated"],` в `tsconfig.build.json`.
4. Связал `Prisma` с `NestJS`, описал dto, services, REST API методы, добавил *swagger*.
5. Протестировал валидацию api.

#### Frontend

1. Установил vite проект с шаблоном react + tanstackrouter + tailwind. Установил tanstack query.
2. Описал dto для api.
3. Перенес роутер в отдельный файл и настроил маршруты.
4. Добавил страницу сканирования, просмотра 1 скана и просмотра таблицы скана с соотвествующими методами api.

#### Docker

1. Создал миграции в backend локально и создал `Dockerfile` для бэкэнда с автораном миграций.
2. Создал `Dockerfile` для frontend сервиса (работающего через nginx).
3. Создал сервис с базой данных и `docker-compose.yml` файл.

#### Anti-detect check

1. Проанализировал статью, попытался повторить указанные методы в ней - ничего не получилось: использование GoLogin не удается так детектить.
2. Искал другие способы детекции, искал подобные сайты - все проверки на похожих сайтах GoLogin (с прокси) обходит на таком же уровне как и мой повседневный браузер.
3. Изучил что такое JA4 и проверил fingerprint'ы GoLogin и Google Chrome - они идентичныые.
4. Сосредоточился на вычислении использования веб-драйвера. Для тестов использовал сразу 2 версии: дефолтный webdriver, предлагаемый `selenium` и
   библиотеку [undetected webdriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver).
5. Реализовал базовые проверки на inject-кода, поиск подозрительных сигнатур и несостыковок, тест устройств и вычисления на основе этой информации fingerprint. Однако
   задетектить undetected webdriver не удалось.

##### Результат

Страница определяет использование дефолтного webdriver.

> Проверить fingerprint: [ja3.zone](https://ja3.zone/check), [amiunique.org](https://amiunique.org/fingerprint), [iphey.com](https://iphey.com/).

---
#поиск_работы #тестовое #nextjs #nodejs #js #react #анти_детект 