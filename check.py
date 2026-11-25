"""Run before every publish: python3 check.py. Fails if bank details or budget sums drift."""
import html, pathlib, re

root = pathlib.Path(__file__).parent / "docs"
t = html.unescape((root / "index.html").read_text())
bank = dict(re.findall(r"<dt>(.*?)</dt><dd><span>(.*?)</span>", t))
assert bank == {
    "Account name": "Ochi Onyedikachukwu Ebubechukwu",
    "Bank": "CANADIA BANK PLC",
    "Bank address": "No. 315 Corner St. Ang Duong & Monivong Blvd. Phnom Penh, Cambodia",
    "Account number": "0640000198306",
    "SWIFT/BIC code": "CADIKHPP",
    "Currency": "USD",
    "Reference": "Mission Aid - [your name]",
}, bank
tables = re.findall(r"<tbody>(.*?)</tbody>", t, re.S)
assert len(tables) == 2
for body in tables:
    rows = [(c, int(v.replace(",", ""))) for c, v in re.findall(r'<tr(?: class="(\w+)")?>.*?\$([\d,]+)</td>', body)]
    assert rows[-1][0] == "tot"
    assert sum(v for c, v in rows if c == "sub") == rows[-1][1], "group totals"
    groups = []
    for c, v in rows[:-1]:
        groups.append([v, []]) if c == "sub" else groups[-1][1].append(v)
    assert all(not items or sum(items) == head for head, items in groups), "line items"
for ref in re.findall(r'(?:src|srcset|href)="((?:img|fonts)/[^"]+|\w+\.(?:css|js))"', t):
    assert (root / ref).exists(), ref
assert (root / "CNAME").read_text().strip() == "givemissionaid.org"
print("ok")
