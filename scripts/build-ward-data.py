"""Rebuild src/data/wardData.json from the 20 raw ward survey Excel files.

Reads every "WARD *.xlsx" file in the repo root, applies the same cost-rate
formulas as the reference DVG SOUTH DATA DASHBOAD.html, and writes wards,
roads (per-segment register) and priority (urgent-work items) into
src/data/wardData.json.

Run with: python scripts/build-ward-data.py
"""
import json
import os
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

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
    if c == "Unknown":
        return "Unknown"
    return "Unknown"


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

    # Road
    road_cost, road_action = 0, "No action"
    if material in ("Mud", "Gravel"):
        road_action = "Convert to concrete"
        road_cost = round(area_sqm * RATES["road_convert"])

    # UGD
    ugd_existing = norm_yesno(d.get("UGD Existing"))
    ugd_cond = norm(d.get("UGD Condition"))
    ugd_cost, ugd_action = 0, "No action"
    if ugd_existing == "No":
        ugd_action = "New installation"
        ugd_cost = round(RATES["ugd_new"] * dist)
    elif ugd_cond in UGD_RATE:
        ugd_action = f"Repair ({ugd_cond})"
        ugd_cost = round(UGD_RATE[ugd_cond] * dist)

    # Attachments (4 sides)
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
    att_costs = {k: att_cost(c, w) for k, c, w in att_sides}
    attach_cost = sum(att_costs.values())
    attach_required = any(norm(c) in REQUIRED_TIER for _, c, _ in att_sides)

    # SWG
    def swg_cost_fn(cond):
        cond = norm(cond)
        return round(SWG_RATE[cond] * dist) if cond in SWG_RATE else 0

    swg_ne_cond = norm(d.get("SWG Condition (N/E)"))
    swg_sw_cond = norm(d.get("SWG Condition (S/W)"))
    swg_cost = swg_cost_fn(swg_ne_cond) + swg_cost_fn(swg_sw_cond)
    swg_required = swg_ne_cond in REQUIRED_TIER or swg_sw_cond in REQUIRED_TIER

    # Jalasiri
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

    # Signage
    sign = norm(d.get("Road Sign"))
    signage_cost, sign_action = 0, "No action"
    if sign == "No":
        sign_action = "Installation required"
        signage_cost = RATES["signage"]
    elif sign == "Damaged":
        sign_action = "Replacement required"
        signage_cost = RATES["signage"]

    # Electrical (no rate defined yet)
    elec_cond = norm(d.get("Electrical Condition"))
    elec_bucket = cond_bucket(elec_cond)
    has_light_data = elec_cond is not None or norm(d.get("Light Type")) is not None

    total = road_cost + ugd_cost + attach_cost + swg_cost + jal_cost + signage_cost

    priority_items = []
    area = norm(d.get("Area Name")) or ""
    main = norm(d.get("Road Name (Main)")) or ""
    cross = norm(d.get("Road Name (Cross)")) or ""
    map_link = norm(d.get("Location (Google Maps link)")) or ""

    def add_priority(cat, action, cost):
        priority_items.append({
            "ward": ward, "cat": cat, "area": area, "main": main, "cross": cross,
            "action": action, "cost": cost, "map": map_link,
        })

    if material in ("Mud", "Gravel"):
        add_priority("road", road_action, road_cost)
    if ugd_existing == "No" or ugd_cond in REQUIRED_TIER:
        add_priority("ugd", ugd_action, ugd_cost)
    if attach_required:
        add_priority("attach", "Footpath/attachment repair required", attach_cost)
    if swg_required:
        add_priority("swg", "Storm water drain repair required", swg_cost)
    if jal_existing == "No" or jal_cond in REQUIRED_TIER:
        add_priority("jal", jal_action, jal_cost)
    if elec_cond in REQUIRED_TIER:
        add_priority("elec", f"Electrical: {elec_cond} (rate TBD)", 0)

    return {
        "cost": {"road": road_cost, "ugd": ugd_cost, "attach": attach_cost,
                 "swg": swg_cost, "jal": jal_cost, "signage": signage_cost},
        "total": total,
        "road_cond": road_cond,
        "elec_bucket": elec_bucket,
        "has_light_data": has_light_data,
        "material": material,
        "area_sqm": area_sqm,
        "dist": dist,
        "width": width,
        "area": area, "main": main, "cross": cross, "map": map_link,
        "priority_items": priority_items,
    }


def build():
    wards_out = []
    roads_out = []
    priority_out = []

    for ward in sorted(WARD_FILES):
        rows = read_ward_rows(ward, WARD_FILES[ward])
        segments = 0
        length = 0.0
        area_sqm_total = 0.0
        cost_totals = {"road": 0, "ugd": 0, "attach": 0, "swg": 0, "jal": 0, "signage": 0}
        cond_tally = {"Good": 0, "Maintenance": 0, "Required": 0, "Unknown": 0}
        elec_tally = {"Good": 0, "Maintenance": 0, "Required": 0, "Unknown": 0}
        elec_segments = 0
        materials_tally = {}
        area_agg = {}

        for d in rows:
            r = calc_row(d, ward)
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

        print(f"ward {ward:>2} ({WARD_NAMES[ward]}): {segments} segments, "
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
