#!/usr/bin/env python3
"""Reads the day's benchmark gold, silver and platinum rates from IBJA
(ibjarates.com) and writes them to calco/rates/ibja.json for the Calco app.

IBJA publishes twice on working days (AM about noon, PM about 5 pm IST),
without GST or making charges. Gold and platinum are per 10 g, silver per kg.
The file is only rewritten when the rates change, so a run on a weekend or
holiday leaves it alone. Bad or missing numbers stop the run instead of
replacing good data.

Usage: ibja_rates.py <output.json> [saved_page.html]
"""
import datetime as dt
import json
import re
import sys
import urllib.request

URL = "https://ibjarates.com/"
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
# (key in the file, label on IBJA's page, plausible range per unit)
ITEMS = [
    ("gold999", "Gold999", (20_000, 1_000_000)),
    ("gold995", "Gold995", (20_000, 1_000_000)),
    ("gold916", "Gold916", (15_000, 1_000_000)),
    ("gold750", "Gold750", (10_000, 1_000_000)),
    ("gold585", "Gold585", (8_000, 1_000_000)),
    ("silver999", "Silver999", (20_000, 2_000_000)),
    ("platinum999", "Platinum999", (10_000, 1_000_000)),
]


def fetch() -> str:
    req = urllib.request.Request(URL, headers={"User-Agent": "Calco rates job (+https://mak-cell.github.io/calco/)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def number(page: str, label: str):
    m = re.search(r'id="lbl%s"[^>]*>\s*([\d,.]*)\s*<' % re.escape(label), page)
    if not m or not m.group(1).strip():
        return None
    return float(m.group(1).replace(",", ""))


def parse(page: str) -> dict:
    sessions = {}
    for session in ("AM", "PM"):
        row = {}
        for key, label, (lo, hi) in ITEMS:
            value = number(page, f"{label}_{session}")
            if value is None or value == 0:
                continue
            if not lo <= value <= hi:
                raise SystemExit(f"{key} {session} looks wrong: {value}")
            row[key] = value
        if row:
            sessions[session] = row
    if "AM" not in sessions or "gold999" not in sessions["AM"]:
        raise SystemExit("No AM gold rate found: IBJA's page may have changed")
    # A session missing gold is treated as not yet published.
    return {s: r for s, r in sessions.items() if "gold999" in r}


def latest_past_row(page: str):
    """The newest earlier day in IBJA's history table: (date, gold999)."""
    m = re.search(r'<strong>(\d{2}/\d{2}/\d{4})</strong></td>\s*<td[^>]*data-label="Gold 999"[^>]*>\s*([\d,]+)', page)
    if not m:
        return None
    return dt.datetime.strptime(m.group(1), "%d/%m/%Y").date(), float(m.group(2).replace(",", ""))


def main() -> None:
    out = sys.argv[1]
    page = open(sys.argv[2], encoding="utf-8").read() if len(sys.argv) > 2 else fetch()
    sessions = parse(page)
    try:
        old = json.load(open(out, encoding="utf-8"))
    except (OSError, ValueError):
        old = None
    if old and old.get("sessions") == sessions:
        print("Unchanged:", old["date"])
        return
    now = dt.datetime.now(IST)
    date = now.date()
    past = latest_past_row(page)
    if past and past[1] == sessions["AM"]["gold999"]:
        date = past[0]  # Still showing an earlier day's rates.
    elif old and old.get("date") and old.get("sessions", {}).get("AM") == sessions["AM"]:
        date = dt.date.fromisoformat(old["date"])  # Same day; PM was added.
    data = {
        "source": "IBJA (India Bullion and Jewellers Association), ibjarates.com",
        "note": "Benchmark rates without GST and making charges. Gold and platinum per 10 g, silver per kg.",
        "date": date.isoformat(),
        "checkedAt": now.isoformat(timespec="seconds"),
        "sessions": sessions,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1)
        f.write("\n")
    print("Wrote", out, date, sorted(sessions))


if __name__ == "__main__":
    main()
