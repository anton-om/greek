# Правила работы над проектом

## Каждое изменение сразу публикуется

После любой правки `index.html`, `words.js`, `sentences.js` или `grammar.js`:

1. Поднять номер сборки в `index.html` в четырёх местах (`<meta name="build">`, `words.js?v=`,
   `sentences.js?v=`, `grammar.js?v=`), формат `ГГГГ-ММ-ДД-N`.
2. Если менялся `words.js`, `sentences.js` или `grammar.js` — прогнать `node scripts/check-words.js`, ошибок быть не должно.
3. Закоммитить и запушить в `main`: сайт публикуется GitHub Pages с этой ветки.
4. Дождаться, пока `https://anton-om.github.io/greek/index.html` отдаст новый номер сборки,
   и назвать его в отчёте. Не сообщать о публикации, пока она не подтверждена.

Правки только документации (`README.md`, `docs/`, `CLAUDE.md`) коммитятся и пушатся без смены
номера сборки. В `sw.js` номера сборки нет, при публикации его не трогают; кеш обновляется сам
по адресам файлов с `?v=`.

## Проверка в браузере

Для проверки поведения использовать Playwright из `~/Projects/web-platform/node_modules`
(WebKit и Chromium) против локального `python3 -m http.server`, так как `fetch` не работает с `file://`.

## Правила для слов и уроков

См. `docs/adding-lessons.md`.
