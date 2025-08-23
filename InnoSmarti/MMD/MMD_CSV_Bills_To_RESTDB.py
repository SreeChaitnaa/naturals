import csv
import datetime
from collections import defaultdict

def csv_to_dicts_by_day(filename):
    bills = defaultdict(lambda: {
        "payment": [],
        "ticket": [],
        "mmd": True,
        "Name": None,
        "Phone": None,
        "TicketID": None,
        "TimeMark": None,
        "Comments": None
    })

    # Payment mapping
    payment_map = {
        "Cash": "Cash",
        "UPI": "EWallet",
        "Card": "Card"
    }

    with open(filename, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            bill_no = row["Bill No"]
            date_str = row["Date"].replace("/24", "/2024").replace("/25", "/2025")
            time_str = row["Time"]

            # Convert Date + Time → datetime object
            dt = datetime.datetime.strptime(f"{date_str} {time_str}", "%d/%m/%Y %I:%M:%S %p")
            time_mark = dt.strftime("%Y-%m-%d %H:%M:%S")

            bill = bills[bill_no]
            bill["Name"] = row["Name"]
            bill["Phone"] = row["Phone"]
            bill["TicketID"] = f"MMD{bill_no}"   # Prefix MMD
            bill["TimeMark"] = time_mark

            price = float(row["Price"])
            net_price = float(row["Net Price"])
            discount_amount = round(price - net_price, 2)
            total = round(net_price * 1.18, 2)

            ticket_item = {
                "DiscountAmount": discount_amount,
                "Price": price,
                "Qty": 1,
                "ServiceID": row["Service"],
                "ServiceName": row["Service"],
                "Sex": "1",
                "Total": total,
                "empname": row["Smile Provider"]
            }
            bill["ticket"].append(ticket_item)

            # Keep payment info (we'll finalize later)
            bill["_net_sum"] = bill.get("_net_sum", 0) + net_price
            bill["_payment_mode"] = row["Payment"]
            bill["_date"] = dt.date()

    # Finalize payments per bill
    for bill_no, bill in bills.items():
        net_sum = bill["_net_sum"]
        mode = payment_map.get(bill["_payment_mode"], bill["_payment_mode"])
        bill["payment"] = [{
            "ChangeAmt": 0,
            "ModeofPayment": mode,
            "Tender": round(net_sum * 1.18, 2)
        }]
        # remove temp keys
        bill["_date"] = bill["_date"]  # keep for grouping
        bill.pop("_net_sum", None)
        bill.pop("_payment_mode", None)

    # Group bills by day
    days = defaultdict(list)
    for bill in bills.values():
        day = bill["_date"]
        datenum = int(day.strftime("%Y%m%d"))
        days[datenum].append({k: v for k, v in bill.items() if not k.startswith("_")})

    # Format final output
    result = [{"datenum": datenum, "bills": blist} for datenum, blist in sorted(days.items())]
    return result
