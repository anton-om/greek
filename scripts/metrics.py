#!/usr/bin/env python3
"""Сводка метрик приложения из GoatCounter по API.

Токен: переменная окружения GOATCOUNTER_TOKEN или файл ~/.config/goatcounter/learn-greek.token
(создаётся в панели GoatCounter: меню пользователя → API → New token, право «Read statistics»).

Использование:
  scripts/metrics.py            # последние 7 дней
  scripts/metrics.py --days 30  # последние 30 дней
  scripts/metrics.py --json     # сырой JSON для автоматизации

GoatCounter считает уникальных посетителей: один человек, запустивший режим пять раз за день,
даёт 1 в колонке этого режима за день. Общее число просмотров и событий есть в строке «Итого».
"""
import argparse, datetime as dt, json, os, sys, urllib.parse, urllib.request

SITE = os.environ.get("GOATCOUNTER_SITE", "learn-greek")
BASE = f"https://{SITE}.goatcounter.com/api/v0"
MODES = ["flash-gr", "flash-ru", "quiz-gr", "quiz-ru", "tiles", "type", "plural", "conj"]
SHORT = {"flash-gr": "карт гр", "flash-ru": "карт ру", "quiz-gr": "вар гр", "quiz-ru": "вар ру", "tiles": "плитки", "type": "письмо", "plural": "мн.ч", "conj": "спряж"}


def token():
    t = os.environ.get("GOATCOUNTER_TOKEN")
    if not t:
        p = os.path.expanduser("~/.config/goatcounter/%s.token" % SITE)
        if os.path.exists(p):
            t = open(p).read().strip()
    if not t:
        sys.exit("Нет токена: задайте GOATCOUNTER_TOKEN или положите его в ~/.config/goatcounter/%s.token" % SITE)
    return t


def get(path, **params):
    q = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None}, doseq=True)
    req = urllib.request.Request(f"{BASE}/{path}?{q}", headers={"Authorization": "Bearer " + token(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"GoatCounter {e.code} на {path}: {e.read().decode()[:200]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    end = dt.datetime.now(dt.timezone.utc).replace(minute=0, second=0, microsecond=0)
    start = (end - dt.timedelta(days=a.days)).replace(hour=0)
    fmt = lambda d: d.strftime("%Y-%m-%dT%H:%M:%SZ")
    total = get("stats/total", start=fmt(start), end=fmt(end))
    hits = get("stats/hits", start=fmt(start), end=fmt(end), group="day", limit=100)
    if a.json:
        print(json.dumps({"start": fmt(start), "end": fmt(end), "total": total, "hits": hits}, ensure_ascii=False, indent=1))
        return
    days = sorted({s["day"] for h in hits.get("hits", []) for s in h.get("stats", [])} | {s["day"] for s in total.get("stats", [])})
    per = {}  # day -> path -> visitors
    for h in hits.get("hits", []):
        for s in h.get("stats", []):
            per.setdefault(s["day"], {})[h["path"]] = s.get("daily", 0)
    page_total = {s["day"]: s.get("daily", 0) for s in total.get("stats", [])}
    cols = ["день", "посет", "просм", "нов.устр"] + [SHORT[m] for m in MODES] + ["завершено", "шпарг"]
    rows = []
    for d in days:
        p = per.get(d, {})
        visitors = sum(v for k, v in p.items() if not k.startswith(("mode/", "done/")) and k not in ("cheat", "new-device"))
        done = sum(v for k, v in p.items() if k.startswith("done/"))
        rows.append([d, visitors, page_total.get(d, 0), p.get("new-device", 0)] + [p.get("mode/" + m, 0) for m in MODES] + [done, p.get("cheat", 0)])
    w = [max(len(str(x)) for x in col) for col in zip(cols, *rows)] if rows else [len(c) for c in cols]
    line = lambda r: "  ".join(str(x).rjust(w[i]) if i else str(x).ljust(w[i]) for i, x in enumerate(r))
    print(f"GoatCounter {SITE}, {start.date()} — {end.date()}")
    print(line(cols)); print(line(["-" * n for n in w]))
    for r in rows: print(line(r))
    print(f"Итого: просмотров {total.get('total', 0)}, событий {total.get('total_events', 0)}, посетителей по путям {hits.get('total', 0)}.")
    new_dev = sum(r[3] for r in rows)
    print(f"Новых устройств за период: {new_dev} (событие new-device, один раз на браузер).")
    print("Посетители — уникальные в пределах дня по IP и браузеру; цифры по режимам — уникальные посетители за день, не число запусков.")


if __name__ == "__main__":
    main()
