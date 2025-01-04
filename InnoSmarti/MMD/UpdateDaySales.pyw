import logging
import sys
import time

import requests
import json
from Settings import Settings
from RestDB import RestDB
from MMDHandler import Utils


logging.getLogger().setLevel(logging.DEBUG)


def update_day_sales():
    for bill_to_add in bills_to_add:
        bill = {"payment": [], "ticket": [], "mmd": is_mmd}
        bill_date = bill_to_add["ticket"][0]["Created_Date"].split(" ")[0].replace("-", "")
        if bill_date not in bills_per_day:
            bills_per_day[bill_date] = []

        for k in ["Name", "Phone", "TicketID", "TimeMark", "Comments"]:
            bill[k] = bill_to_add["ticket"][0][k]

        for payment in bill_to_add["payment"]:
            np = {}
            for k in ["ChangeAmt", "ModeofPayment", "Tender"]:
                np[k] = payment[k]
            bill["payment"].append(np)

        for ticket in bill_to_add["ticket"]:
            nt = {}
            for k in ["DiscountAmount", "Price", "Qty", "ServiceID", "ServiceName", "Sex", "Total", "empname"]:
                nt[k] = ticket[k]
            bill["ticket"].append(nt)
        bills_per_day[bill_date].append(bill)

    for bill_date, bills in bills_per_day.items():
        rest_db.update_bills_of_day(bill_date, bills)

    rest_db.update_config_value(last_bill_key, next_bill_number)


if __name__ == '__main__':
    bill_number = int(sys.argv[1])
    is_mmd = str(sys.argv[2]).lower() == "true"
    settings = Settings()
    rest_db = RestDB(settings.store_id, settings, logging.getLogger())

    bills_to_add = []
    bills_per_day = {}
    last_bill_key = "mmd_last_bill" if is_mmd else "nrs_last_bill"
    last_bill_number = int(rest_db.get_config_value(last_bill_key))
    next_bill_number = last_bill_number + 1
    if bill_number <= last_bill_number:
        exit(0)
    if is_mmd:
        for mmd_bill in rest_db.get_bills(bill_start=next_bill_number, bill_end=bill_number):
            bills_to_add.append(Utils.get_bill_view_resp(mmd_bill, settings))
        next_bill_number = bill_number
    else:
        url_format = "https://ntlivewebapi.innosmarti.com/api/auth/viewTicketNew/{0},1001,{1}"
        while next_bill_number <= bill_number:
            url = url_format.format(rest_db.store_id, next_bill_number)
            logging.info("Calling - {}".format(url))
            resp = requests.request("GET", url, headers={'Authorization': 'UseLast',
                                                         'Content-Type': 'application/json'}, verify=False)
            logging.info("Resp is - {0} - {1}".format(resp.status_code, resp.text))
            bills_to_add.append(json.loads(resp.text))
            logging.info("Completed - {}".format(next_bill_number))
            next_bill_number += 1
            if len(bills_to_add) > 200:
                update_day_sales()
                bills_to_add = []
                bills_per_day = {}
            time.sleep(1)
        next_bill_number -= 1

    update_day_sales()



