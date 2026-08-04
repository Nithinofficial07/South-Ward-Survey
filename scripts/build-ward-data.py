"""Rebuild src/data/wardData.json from the reference dashboard + raw Excel files.

Primary source: the ALL_DATA array embedded in "DVG SOUTH DATA DASHBOAD.html"
(the reference dashboard) — used verbatim, including its already-computed
per-segment costs, for every ward it covers (18 of the 20 wards).

Wards 9 and 21 are not present in that reference file at all, so those two
are parsed from their raw survey Excel files instead, using the exact same
cost-rate formulas as the reference dashboard (DEFAULT_RATES / calcRecordCosts).

Run with: python scripts/build-ward-data.py
"""
import json
import os
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(ROOT, "DVG SOUTH DATA DASHBOAD.html")

# Wards not present in the reference HTML — filled in from their raw Excel files.
EXCEL_ONLY_WARDS = {9, 21}

WARD_FILES = {
    1: "WARD_01.xlsx",
    2: "WARD_02.xlsx",
    3: "WARD 03 (2).xlsx",
    4: "WARD_04.xlsx",
    5: "WARD 05.xlsx",
    6: "WARD_06.xlsx",
    7: "WARD 07 (1).xlsx",
    8: "WARD 08.xlsx",
    9: "WARD 09_ Basha Nagara.xlsx",
    10: "WARD_10.xlsx",
    11: "WARD 11.xlsx",
    12: "WARD 12.xlsx",
    13: "WARD 13.xlsx",
    14: "WARD 14.xlsx",
    18: "WARD 18.xlsx",
    19: "WARD 19.xlsx",
    20: "WARD_20.xlsx",
    21: "WARD_21.xlsx",
    25: "WARD_25.xlsx",
    45: "WARD_45.xlsx",
}

WARD_NAMES = {
    1: "Gandhi Nagar", 2: "S M Nagara", 3: "Layout (Mandakki Bhatti)", 4: "Bhashanagar",
    5: "Jagjivan Ram Nagar", 6: "Kurubarakeri", 7: "Jally Nagar", 8: "Suresh Nagar",
    9: "Azad Nagar", 10: "Ganeshpet", 11: "Basavarajpet", 12: "Ahmednagar",
    13: "Koracharahatti", 14: "Chamarajpet", 18: "Kaipet", 19: "Mandipet",
    20: "Bharat Colony", 21: "Basapura", 25: "K.B.Layout", 45: "S J M Nagar",
}

RATES = dict(
    road_convert=3500,
    ugd_maintenance=320, ugd_outdated=480, ugd_required=800, ugd_additional=1200, ugd_new=1500,
    swg_maintenance=400, swg_outdated=600, swg_required=1000, swg_additional=1500,
    att_maintenance=480, att_outdated=720, att_required=1200, att_additional=1800,
    jal_maintenance=5000, jal_reactivation=10000, jal_new=10000,
    signage=5000,
)

UGD_RATE = {"Maintenance": RATES["ugd_maintenance"], "Outdated": RATES["ugd_outdated"],
            "Required": RATES["ugd_required"], "Additional Required": RATES["ugd_additional"]}
SWG_RATE = {"Maintenance": RATES["swg_maintenance"], "Outdated": RATES["swg_outdated"],
            "Required": RATES["swg_required"], "Additional Required": RATES["swg_additional"]}
ATT_RATE = {"Maintenance": RATES["att_maintenance"], "Outdated": RATES["att_outdated"],
            "Required": RATES["att_required"], "Additional Required": RATES["att_additional"]}

REQUIRED_TIER = {"Required", "Additional Required"}


def norm(v):
    if v is None:
        return None
    s = str(v).strip()
    if s == "" or s.upper() == "N/A":
        return None
    return s


def norm_yesno(v):
    s = norm(v)
    if s is None:
        return None
    return "Yes" if s.strip().lower() == "yes" else ("No" if s.strip().lower() == "no" else s)


def num(v):
    v = norm(v)
    if v is None:
        return 0.0
    try:
        return float(v)
    except ValueError:
        return 0.0


def cond_bucket(c):
    """4-bucket condition used for ward-level tallies (matches condClass in the reference dashboard)."""
    if not c:
        return "Unknown"
    if c == "Good":
        return "Good"
    if c in ("Maintenance", "Outdated", "Maintiance"):
        return "Maintenance"
    if c in ("Required", "Additional Required"):
        return "Required"
    return "Unknown"


def priority_items_for(ward, area, main, cross, map_link, *, material, road_action, road_cost,
                        ugd_existing, ugd_cond, ugd_action, ugd_cost,
                        attach_required, attach_cost,
                        swg_required, swg_cost,
                        jal_existing, jal_cond, jal_action, jal_cost,
                        elec_cond):
    items = []

    def add(cat, action, cost):
        items.append({"ward": ward, "cat": cat, "area": area, "main": main, "cross": cross,
                       "action": action, "cost": cost, "map": map_link})

    if material in ("Mud", "Gravel"):
        add("road", road_action, road_cost)
    if ugd_existing == "No" or ugd_cond in REQUIRED_TIER:
        add("ugd", ugd_action, ugd_cost)
    if attach_required:
        add("attach", "Footpath/attachment repair required", attach_cost)
    if swg_required:
        add("swg", "Storm water drain repair required", swg_cost)
    if jal_existing == "No" or jal_cond in REQUIRED_TIER:
        add("jal", jal_action, jal_cost)
    if elec_cond in REQUIRED_TIER:
        add("elec", f"Electrical: {elec_cond} (rate TBD)", 0)
    return items


# ---------------------------------------------------------------------------
# Source 1: the reference dashboard's embedded ALL_DATA (authoritative for the
# 18 wards it covers — used as-is, including its precomputed per-segment costs)
# ---------------------------------------------------------------------------

def load_html_records():
    with open(HTML_PATH, encoding="utf-8") as f:
        data_line = None
        for line in f:
            if line.startswith("const ALL_DATA = "):
                data_line = line
                break
    if data_line is None:
        raise RuntimeError("Could not find ALL_DATA in the reference HTML")
    start = data_line.index("const ALL_DATA = ") + len("const ALL_DATA = ")
    end = data_line.rindex("];") + 1
    all_data = json.loads(data_line[start:end])
    by_ward = {}
    for rec in all_data:
        by_ward.setdefault(rec["ward"], []).append(rec)
    return by_ward


def adapt_html_record(rec, ward):
    dist = num(rec.get("dist"))
    width = num(rec.get("width"))
    area_sqm = num(rec.get("area_sqm")) or round(dist * width, 2)
    material = norm(rec.get("material"))
    road_cond = cond_bucket(norm(rec.get("cond")))

    ugd_existing = norm_yesno(rec.get("ugd_existing"))
    ugd_cond = norm(rec.get("ugd_cond"))
    jal_existing = norm_yesno(rec.get("jal_existing"))
    jal_cond = norm(rec.get("jal_cond"))
    elec_cond = norm(rec.get("elec_cond"))
    elec_bucket = cond_bucket(elec_cond)
    has_light_data = elec_cond is not None or norm(rec.get("light_type")) is not None

    att_conds = [norm(rec.get("att1_ne_cond")), norm(rec.get("att2_ne_cond")),
                 norm(rec.get("att1_sw_cond")), norm(rec.get("att2_sw_cond"))]
    swg_conds = [norm(rec.get("swg_ne_cond")), norm(rec.get("swg_sw_cond"))]

    area = norm(rec.get("area")) or ""
    main = norm(rec.get("main")) or ""
    cross = norm(rec.get("cross")) or ""
    map_link = norm(rec.get("map")) or ""

    cost = {
        "road": round(num(rec.get("road_cost"))),
        "ugd": round(num(rec.get("ugd_cost"))),
        "attach": round(num(rec.get("attach_cost"))),
        "swg": round(num(rec.get("swg_cost"))),
        "jal": round(num(rec.get("jal_cost"))),
        "signage": round(num(rec.get("signage_cost"))),
    }
    total = round(num(rec.get("total_cost")))

    priority_items = priority_items_for(
        ward, area, main, cross, map_link,
        material=material, road_action=norm(rec.get("road_action")) or "Convert to concrete", road_cost=cost["road"],
        ugd_existing=ugd_existing, ugd_cond=ugd_cond, ugd_action=norm(rec.get("ugd_action")) or "Action required", ugd_cost=cost["ugd"],
        attach_required=any(c in REQUIRED_TIER for c in att_conds), attach_cost=cost["attach"],
        swg_required=any(c in REQUIRED_TIER for c in swg_conds), swg_cost=cost["swg"],
        jal_existing=jal_existing, jal_cond=jal_cond, jal_action=norm(rec.get("jal_action")) or "Action required", jal_cost=cost["jal"],
        elec_cond=elec_cond,
    )

    return {
        "cost": cost, "total": total, "road_cond": road_cond, "elec_bucket": elec_bucket,
        "has_light_data": has_light_data, "material": material, "area_sqm": area_sqm,
        "dist": dist, "width": width, "area": area, "main": main, "cross": cross, "map": map_link,
        "priority_items": priority_items,
    }


# ---------------------------------------------------------------------------
# Source 2: raw Excel, used only for the 2 wards missing from the reference
# ---------------------------------------------------------------------------

def read_ward_rows(ward, filename):
    path = os.path.join(ROOT, filename)
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    sheet_name = next(s for s in wb.sheetnames if s.startswith("Form responses"))
    ws = wb[sheet_name]
    rows_iter = ws.iter_rows(values_only=True)
    headers = list(next(rows_iter))
    rows = []
    for r in rows_iter:
        d = dict(zip(headers, r))
        if not any(v is not None and str(v).strip() != "" for v in r):
            continue
        rows.append(d)
    wb.close()
    return rows


def calc_row(d, ward):
    dist = num(d.get("Dist. (m)"))
    width = num(d.get("Width (m)"))
    area_sqm = round(dist * width, 2)
    material = norm(d.get("Material"))
    road_cond = cond_bucket(norm(d.get("Road Condition")))

    road_cost, road_action = 0, "No action"
    if material in ("Mud", "Gravel"):
        road_action = "Convert to concrete"
        road_cost = round(area_sqm * RATES["road_convert"])

    ugd_existing = norm_yesno(d.get("UGD Existing"))
    ugd_cond = norm(d.get("UGD Condition"))
    ugd_cost, ugd_action = 0, "No action"
    if ugd_existing == "No":
        ugd_action = "New installation"
        ugd_cost = round(RATES["ugd_new"] * dist)
    elif ugd_cond in UGD_RATE:
        ugd_action = f"Repair ({ugd_cond})"
        ugd_cost = round(UGD_RATE[ugd_cond] * dist)

    def att_cost(cond, w):
        cond = norm(cond)
        w = num(w)
        return round(ATT_RATE[cond] * w * dist) if (cond in ATT_RATE and w) else 0

    att_sides = [
        ("att1_ne", d.get("Attachment 1 Condition"), d.get("Attachment 1 Width (m)")),
        ("att2_ne", d.get("Attachment 2 Condition"), d.get("Attachment 2 Width (m)")),
        ("att1_sw", d.get("Attachment 1 Condition (S/W)"), d.get("Attachment 1 Width (m) (S/W)")),
        ("att2_sw", d.get("Attachment 2 Condition (S/W)"), d.get("Attachment 2 Width (m) (S/W)")),
    ]
    attach_cost = sum(att_cost(c, w) for _, c, w in att_sides)
    attach_required = any(norm(c) in REQUIRED_TIER for _, c, _ in att_sides)

    def swg_cost_fn(cond):
        cond = norm(cond)
        return round(SWG_RATE[cond] * dist) if cond in SWG_RATE else 0

    swg_ne_cond = norm(d.get("SWG Condition (N/E)"))
    swg_sw_cond = norm(d.get("SWG Condition (S/W)"))
    swg_cost = swg_cost_fn(swg_ne_cond) + swg_cost_fn(swg_sw_cond)
    swg_required = swg_ne_cond in REQUIRED_TIER or swg_sw_cond in REQUIRED_TIER

    jal_existing = norm_yesno(d.get("Jalasiri Existing"))
    jal_cond = norm(d.get("Jalasiri Condition"))
    jal_cost, jal_action = 0, "No action"
    if jal_existing == "No":
        jal_action = "New installation"
        jal_cost = RATES["jal_new"]
    elif jal_existing == "Yes":
        if jal_cond == "Maintenance":
            jal_action = "Maintenance"
            jal_cost = RATES["jal_maintenance"]
        elif jal_cond in REQUIRED_TIER:
            jal_action = "Reactivation required"
            jal_cost = RATES["jal_reactivation"]

    sign = norm(d.get("Road Sign"))
    signage_cost = 0
    if sign == "No":
        signage_cost = RATES["signage"]
    elif sign == "Damaged":
        signage_cost = RATES["signage"]

    elec_cond = norm(d.get("Electrical Condition"))
    elec_bucket = cond_bucket(elec_cond)
    has_light_data = elec_cond is not None or norm(d.get("Light Type")) is not None

    cost = {"road": road_cost, "ugd": ugd_cost, "attach": attach_cost,
            "swg": swg_cost, "jal": jal_cost, "signage": signage_cost}
    total = sum(cost.values())

    area = norm(d.get("Area Name")) or ""
    main = norm(d.get("Road Name (Main)")) or ""
    cross = norm(d.get("Road Name (Cross)")) or ""
    map_link = norm(d.get("Location (Google Maps link)")) or ""

    priority_items = priority_items_for(
        ward, area, main, cross, map_link,
        material=material, road_action=road_action, road_cost=road_cost,
        ugd_existing=ugd_existing, ugd_cond=ugd_cond, ugd_action=ugd_action, ugd_cost=ugd_cost,
        attach_required=attach_required, attach_cost=attach_cost,
        swg_required=swg_required, swg_cost=swg_cost,
        jal_existing=jal_existing, jal_cond=jal_cond, jal_action=jal_action, jal_cost=jal_cost,
        elec_cond=elec_cond,
    )

    return {
        "cost": cost, "total": total, "road_cond": road_cond, "elec_bucket": elec_bucket,
        "has_light_data": has_light_data, "material": material, "area_sqm": area_sqm,
        "dist": dist, "width": width, "area": area, "main": main, "cross": cross, "map": map_link,
        "priority_items": priority_items,
    }


def build():
    html_records = load_html_records()
    print(f"Reference HTML covers wards: {sorted(html_records.keys())}\n")

    wards_out = []
    roads_out = []
    priority_out = []

    for ward in sorted(WARD_FILES):
        if ward in EXCEL_ONLY_WARDS or ward not in html_records:
            rows = read_ward_rows(ward, WARD_FILES[ward])
            normalized = [calc_row(d, ward) for d in rows]
            source = WARD_FILES[ward]
        else:
            normalized = [adapt_html_record(rec, ward) for rec in html_records[ward]]
            source = "reference HTML"

        segments = 0
        length = 0.0
        area_sqm_total = 0.0
        cost_totals = {"road": 0, "ugd": 0, "attach": 0, "swg": 0, "jal": 0, "signage": 0}
        cond_tally = {"Good": 0, "Maintenance": 0, "Required": 0, "Unknown": 0}
        elec_tally = {"Good": 0, "Maintenance": 0, "Required": 0, "Unknown": 0}
        elec_segments = 0
        materials_tally = {}
        area_agg = {}

        for r in normalized:
            segments += 1
            length += r["dist"]
            area_sqm_total += r["area_sqm"]
            for k in cost_totals:
                cost_totals[k] += r["cost"][k]
            cond_tally[r["road_cond"]] += 1
            if r["has_light_data"]:
                elec_segments += 1
                elec_tally[r["elec_bucket"]] += 1
            if r["material"]:
                materials_tally[r["material"]] = materials_tally.get(r["material"], 0) + 1
            aname = r["area"] or "(unspecified)"
            agg = area_agg.setdefault(aname, {"name": aname, "segments": 0, "cost": 0.0, "length": 0.0})
            agg["segments"] += 1
            agg["cost"] += r["total"]
            agg["length"] += r["dist"]

            roads_out.append({
                "w": ward, "a": r["area"], "m": r["main"], "c": r["cross"],
                "mat": r["material"] or "", "cond": r["road_cond"],
                "d": round(r["dist"], 1), "wd": round(r["width"], 2),
                "cost": round(r["total"]), "map": r["map"],
            })
            priority_out.extend(r["priority_items"])

        total_cost = sum(cost_totals.values())
        areas_sorted = sorted(area_agg.values(), key=lambda a: a["cost"], reverse=True)
        for a in areas_sorted:
            a["cost"] = round(a["cost"])
            a["length"] = round(a["length"], 1)
        materials_sorted = sorted(
            ({"name": k, "count": v} for k, v in materials_tally.items()),
            key=lambda m: m["count"], reverse=True,
        )

        wards_out.append({
            "ward": ward,
            "name": WARD_NAMES[ward],
            "segments": segments,
            "length": round(length, 1),
            "areaSqm": round(area_sqm_total, 1),
            "total": round(total_cost),
            "cost": {k: round(v) for k, v in cost_totals.items()},
            "elecCond": elec_tally,
            "elecSegments": elec_segments,
            "cond": cond_tally,
            "materials": materials_sorted,
            "areas": areas_sorted,
            "areaCount": len(area_agg),
        })

        print(f"ward {ward:>2} ({WARD_NAMES[ward]}, from {source}): {segments} segments, "
              f"{round(length)} m, total {round(total_cost):,}")

    out = {"wards": wards_out, "roads": roads_out, "priority": priority_out}
    out_path = os.path.join(ROOT, "src", "data", "wardData.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\nWrote {out_path}")
    print(f"Total wards: {len(wards_out)}")
    print(f"Total segments: {sum(w['segments'] for w in wards_out)}")
    print(f"Total priority items: {len(priority_out)}")
    print(f"Grand total estimate: {sum(w['total'] for w in wards_out):,}")


if __name__ == "__main__":
    build()
