# Как устроены режимы Quizlet (справка для проекта)

Источники: help-центр Quizlet (2026), архивные версии help 2016–2020 и инженерный блог Quizlet 2017 (через Wayback), сторонние обзоры. quizlet.com напрямую недоступен (капча). **(вывод)** = обобщение, не цитата; **(старое)** = документировано в 2016–2020, в текущем help отсутствует.

## 1. Flashcards
- Тап по карточке — переворот; кнопки/стрелки — вперёд-назад; на мобильном — свайп. Раунд завершён, когда просмотрены все карточки.
- По умолчанию первой показывается definition; опция **Answer with / Card orientation** меняет сторону.
- **Sort (Track progress)**: карточки раскладываются в кучки **Still learning / Know** свайпом. После прохода — экран-итог и возможность учить только still learning.
- **Star**: пометка терминов «на потом», можно учить только starred в любом режиме.
- **Restart** сбрасывает сортировку раунда. **Shuffle**, **Play** (автопрокрутка), динамик — TTS.

## 2. Learn (ядро)
- Вопросы становятся прогрессивно сложнее: multiple choice → письменный ввод (cued recall). True/false и «none of the above» убрали после A/B-тестов (угадываемость).
- Каждый термин должен быть отвечен правильно recall-вопросом до завершения.
- Планировщик — ML-модель, предсказывающая вероятность вспомнить по: правильности последних ответов, времени с последнего ответа, интервалу между ответами, **направлению вопроса** (каждая сторона — отдельный факт; чаще спрашивают слабую сторону). Показывается термин с наименьшей вероятностью → ошибки возвращаются быстро, в том же сеансе.
- **(старое)**: уровни new → seen → familiar → mastered; «обычно нужно дважды правильно ответить письменно, чтобы освоить термин»; после раунда — экран с группами mastered / almost done / in progress / new.
- **Don't know** показывает ответ, затем его нужно перепечатать. Для текста есть **Override: I was correct**.
- **Grading options**: Relaxed (смысл/опечатки), Moderate (прощаются акценты), Strict (только регистр/пунктуация). Для языковых сетов (разные языки на сторонах) по умолчанию Strict → для греческого акценты не прощаются **(вывод)**.
- **Require 1 answer only**: при нескольких ответах через запятую/слэш/точку с запятой достаточно одного.
- **Progress** (Plus): группы Not studied / Still learning / Mastered по всем режимам.
- **Answer Streaks**: после 5 верных подряд с первой попытки.
- Бесплатно: ограниченное число раундов Learn на сет.

## 3. Write (внутри Learn)
- Раунд 1: каждый вопрос один раз; раунд 2 — только пропущенные; чтобы закончить, каждый вопрос нужно ответить верно дважды.
- Don't know → показать ответ и перепечатать; Override: I was correct.

## 4. Spell
- Слушаешь TTS → печатаешь; каждое слово верно дважды; при ошибке пропущенные буквы подсвечиваются и слово диктуется по буквам. Есть замедленное аудио.

## 5. Test
- Выбор числа вопросов и типов: written, matching, multiple choice, true/false. Прогресс не сохраняется; после Submit — оценка и разбор.

## 6. Match
- Сетка из 6 пар на игру, таймер; выбираешь термин, затем пару; +1 секунда за ошибку; результат — время.

## 7. Долгосрочное запоминание
- **Long-Term Learning** (2016–~2020, Plus): классический SRS: несколько новых терминов в день, интервалы ×≈2 (1 → 3 → 7 → 16 дней), ошибка сбрасывает на 1 день. Из текущего help исчез; остались Progress, study path и «Memory Score» без раскрытого алгоритма.

## 8. Anki / Memrise / Duolingo
- **Anki (SM-2)**: ease 2.5 (мин. 1.3), learning steps, интервал ×ease за Good, ошибка → relearn. Реализуется за ~50 строк.
- **Memrise**: лестница 4ч → 12ч → 24ч → 6д → 12д → 48д → 96д → 6мес, ошибка → первая ступень; «Difficult words» — отдельная сессия.
- **Duolingo**: опечатка в 1 букву / пропуск акцента засчитывается с предупреждением, если не образует другое слово (неофициально).

## Что стоит добавить в приложение (сначала дешёвое)
1. Know / Still learning свайп + раунд «только still learning» + Restart. *(есть)*
2. Правило «2 верных recall-ответа» на слово и повтор ошибок в том же сеансе (ошибка → вернуть через 2–3 вопроса).
3. Лестница MC → ввод текста: слово начинает с 4 вариантов, после верного MC — печать; без true/false.
4. Оба направления как отдельные факты; чаще спрашивать слабое. *(сейчас отметка «изучено» одна на слово, без направления)*
5. Проверка ввода: нормализация регистра/пунктуации/пробелов; Strict / без ударений / Левенштейн ≤1 с пометкой «опечатка»; альтернативы через `/ , ;` — достаточно одной; кнопка «Я был прав»; «Не знаю» → перепечатать. *(частично есть)*
6. Звёзды + режим «только отмеченные»; «отметить ошибки и начать заново».
7. Match: 6 пар, таймер, +1 с за ошибку.
8. Spell: TTS + подсветка неверных букв. *(TTS есть)*
9. Межсессионный SRS (Leitner 1→3→7→16 дней или SM-2) с экраном «сегодня к повторению: N» — главная добавка для долгосрочной памяти, которой у Quizlet сейчас нет.
10. Мелочи: streak из 5 верных, итоги раунда по группам, автопрокрутка.

## Источники
- https://help.quizlet.com/hc/en-us/articles/360030988091-Studying-with-Flashcards
- https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn
- https://help.quizlet.com/hc/en-us/articles/360030990531-Studying-with-Write-mode
- https://help.quizlet.com/hc/en-us/articles/360030645752-Studying-with-Spell-mode
- https://help.quizlet.com/hc/en-us/articles/360030642972-Studying-with-Test
- https://help.quizlet.com/hc/en-us/articles/360031183611-Playing-Match
- https://help.quizlet.com/hc/en-us/articles/360048313652-Using-grading-options-US
- https://help.quizlet.com/hc/en-us/articles/360048803491-Using-Progress-for-targeted-studying
- https://help.quizlet.com/hc/en-us/articles/360031172312-Studying-most-missed-terms-with-stars
- https://help.quizlet.com/hc/en-us/articles/40011154960653-Studying-with-Answer-Streaks
- https://web.archive.org/web/20180310011643/https://quizlet.com/help/2762234/studying-with-learn
- https://web.archive.org/web/20190822134659/https://help.quizlet.com/hc/en-us/articles/360030429692-Studying-with-Long-Term-Learning
- https://web.archive.org/web/20180301/https://quizlet.com/blog/spaced-repetition-for-all-cognitive-science-meets-big-data-in-a-procrastinating-world
- https://web.archive.org/web/20180601/https://quizlet.com/blog/selecting-question-formats-to-maximize-the-testing-effect
- https://medium.com/tech-quizlet/improving-learn-ing-quizlets-new-memory-model-3c2271e5eaf4
- https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm
- https://www.memrise.com/blog/february-product-roundup
