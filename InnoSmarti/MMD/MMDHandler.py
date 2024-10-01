import logging
import json
import operator
from datetime import date
from RestDB import RestDB


class Utils:
    @staticmethod
    def get_data_json(data):
        try:
            return json.loads(data.decode('utf8').replace("'", '"'))
        except:
            return None

    @staticmethod
    def get_name_and_ph_no(client_id):
        ph_no = client_id[-10:].strip()
        c_name = client_id.replace(ph_no, "").strip()
        return c_name, ph_no


class MMDStatus:
    NoServerCall = "NoServerCall"
    ReturnServerCall = "ReturnServerCall"
    ReturnPostMerge = "ReturnPostMerge"
    Extend = "Extend"
    Merge = "Merge"


class MMDHandler:
    def __init__(self, request, settings):
        self.request = request
        self.settings = settings

        self.payload = Utils.get_data_json(request.data)
        self.pre_resp_code = MMDStatus.ReturnServerCall
        self.pre_resp = None
        self.rest_db = None
        self.merge_types = {}
        self.merge_keys = {}
        self.post_merge_sort_keys = {}
        self.treat_as_int = []

        handler = None
        code_on_resp = MMDStatus.NoServerCall
        store_id = None

        if "/savebill/" in request.url and request.method == "POST":
            handler = self.save_bill_handler
            store_id = self.get_store_id_from_url()

        elif str(request.url).endswith('/printreceipt') and request.method == "POST":
            handler = self.print_bill_handler
            store_id = self.get_store_id_from_payload()

        elif str(request.url).endswith("/employeewisesales") and request.method == "POST":
            handler = self.get_employee_sales_handler
            store_id = self.payload["SoreID"]
            code_on_resp = MMDStatus.ReturnPostMerge
            self.merge_types["data"] = MMDStatus.Merge
            self.merge_keys["data"] = "EmpID"
            self.treat_as_int = ["TotalProductCount", "TotalServiceCount"]

        elif self.settings.show_invoices:
            if "/getTodayTicket/" in request.url or "/getTicketByDate/" in request.url:
                handler = self.get_tickets_handler
                store_id = self.get_store_id_from_url()
                code_on_resp = MMDStatus.ReturnPostMerge
                self.merge_types["bills"] = MMDStatus.Extend
                self.post_merge_sort_keys["bills"] = ["Created_Date"]

        if handler and store_id:
            self.rest_db = RestDB(store_id, self.settings)
            self.pre_resp = handler()
            if self.pre_resp:
                self.pre_resp_code = code_on_resp

    def get_store_id_from_url(self, position=0):
        return self.request.url.split("/")[-1].split(",")[position]

    def get_store_id_from_payload(self, key="StoreID"):
        store_id = self.payload
        for k in key.split(";"):
            store_id = store_id[k]
        return store_id

    def get_employee_sales_handler(self):
        start_date = self.payload["fDate"].replace("-", "")
        end_date = self.payload["tDate"].replace("-", "")
        bills = self.rest_db.get_bills(date_start=start_date, date_end=end_date)
        if len(bills) == 0:
            return None

        emp_record = {
            "AreaofspecialisationName": "SENIOR HAIR & BEAUTY",
            "EmpID": "",
            "FirstName": "",
            "LastName": "L",
            "MembershipCardSales": 0,
            "NetSalesForServices": 0,
            "NetSalesForServicesAdjusted": 0,
            "ProductSales": 0,
            "TicketCount": 0,
            "TotalDiscount": 0,
            "TotalMemDiscount": 0,
            "TotalMembershipCardCount": 0,
            "TotalOtherDiscount": 0,
            "TotalProductCount": 0,
            "TotalServiceCount": 0,
            "TotalTax": 0,
            "TotalTicketValue": 0
        }
        all_emp_sales = {}
        for bill in bills:
            emp_ids_in_bill = set()
            for service in bill["bill_data"]:
                emp_id = service["empid"]
                emp_ids_in_bill.add(emp_id)
                if emp_id not in all_emp_sales:
                    all_emp_sales[emp_id] = emp_record.copy()
                    all_emp_sales[emp_id]["EmpID"] = service["empid"]
                    all_emp_sales[emp_id]["FirstName"] = service["empname"]
                net_value = service["NormalPrice"] - service["DiscountAmount"]
                all_emp_sales[emp_id]["NetSalesForServices"] += net_value
                all_emp_sales[emp_id]["NetSalesForServicesAdjusted"] += net_value
                all_emp_sales[emp_id]["TotalDiscount"] += service["DiscountAmount"]
                all_emp_sales[emp_id]["TotalMemDiscount"] += service["MemDisc"]
                all_emp_sales[emp_id]["TotalOtherDiscount"] += service["OthDisc"]
                all_emp_sales[emp_id]["TotalTax"] += (service["Total"] - net_value)
                all_emp_sales[emp_id]["TotalTicketValue"] += service["Total"]
                all_emp_sales[emp_id]["TotalServiceCount"] += 1

            for emp_id in emp_ids_in_bill:
                all_emp_sales[emp_id]["TicketCount"] += 1

        data = []
        for emp_dict in all_emp_sales.values():
            for k in emp_dict:
                if type(emp_dict[k]) is not str:
                    emp_dict[k] = int(emp_dict[k])
            data.append(emp_dict)
        return {"data": data}

    def get_tickets_handler(self):
        start_date = date.today().__format__("%Y%m%d")
        end_date = start_date

        if "/getTicketByDate/" in self.request.url:
            start_date = self.get_store_id_from_url(-2).replace("-", "")
            end_date = self.get_store_id_from_url(-1).replace("-", "")

        bills = self.rest_db.get_bills(date_start=start_date, date_end=end_date)

        if len(bills) == 0:
            return None
        bill_keys_map = {
            "Advance": "AdvanceAmount",
            "Discount": "sumDiscount",
            "Gross": "sumTotal",
            "Mem_disc": "MemDisc",
            "Oth_Disc": "OthDisc",
            "Tax": "sumGst",
            "Total": "sumNet",
            "servicedesc": "ServiceName",
            "Created_Date": "timemark"
        }
        bill_struct = {
                        "Advance": 0,
                        "Billstatus": "Closed",
                        "ClientID": "",
                        "Created_Date": "",
                        "Discount": 0,
                        "FirstName": "",
                        "Gross": 0,
                        "Mem_disc": 0,
                        "Oth_Disc": 0,
                        "Referral": "Live",
                        "Sex": "1",
                        "StoreID": "1526",
                        "Tax": 0,
                        "TicketID": 0,
                        "Total": 0,
                        "id": 0,
                        "servicedesc": ""
        }
        sum_keys = ["Mem_disc", "Oth_Disc", "servicedesc"]
        resp_bill_map = {
            "Net": "Total",
            "servicebillsalesnet": "Total",
            "servicebillsales": "Gross",
            "Total": "Gross"
        }
        resp = {
            "Advance": 0,
            "Discount": 0,
            "GooglePay": 0,
            "Mem_disc": 0,
            "Men": 0,
            "Net": 0,
            "NoOfBills": 0,
            "Oth_Disc": 0,
            "PayTM": 0,
            "PhonePe": 0,
            "Productbillcount": 0,
            "Productbillsales": 0,
            "Productbillsalesnet": 0,
            "SmartMoney": 0,
            "Tax": 0,
            "TotGender": 0,
            "Total": 0,
            "UPI": 0,
            "Women": 0,
            "advGooglePay": 0,
            "advPayTM": 0,
            "advPhonePe": 0,
            "advSmartMoney": 0,
            "advUPI": 0,
            "advcard": 0,
            "advcash": 0,
            "aptadvance": 0,
            "bills": [],
            "cancelledbills": 0,
            "card": 0,
            "cash": 0,
            "ewalletsum": 0,
            "prepaidredem": 0,
            "prepaidsales": 0,
            "servicebillcount": 0,
            "servicebillsales": 0,
            "servicebillsalesnet": 0,
            "walletredem": 0,
            "walletsales": 0
        }
        for bill in bills:
            bill_to_add = {}
            bill_to_add.update(bill_struct)
            services = bill["bill_data"]
            clntname, clntphone = Utils.get_name_and_ph_no(services[0]['clntid'])
            bill_to_add["ClientID"] = " ".join([clntname, clntphone])
            bill_to_add["FirstName"] = clntname
            bill_to_add["TicketID"] = "{0}{1}".format(self.settings.bill_prefix, bill["id"])
            bill_to_add["StoreID"] = self.rest_db.store_id
            for k in bill_to_add:
                if k in sum_keys:
                    for service in services:
                        if type(bill_to_add[k]) is str:
                            bill_to_add[k] += " " + service[bill_keys_map[k]]
                        else:
                            bill_to_add[k] += service[bill_keys_map[k]]
                elif k in bill_keys_map:
                    bill_to_add[k] = services[0][bill_keys_map[k]]

            bill_to_add["Created_Date"] = bill_to_add["Created_Date"] + ":00"
            resp["bills"].append(bill_to_add)
            resp["bills"].sort(key=operator.itemgetter("TicketID"))
            for rk in resp:
                if rk in resp_bill_map:
                    resp[rk] += bill_to_add[resp_bill_map[rk]]
                elif rk in bill_to_add:
                    resp[rk] += bill_to_add[rk]

            for tender in services[0]["tender"]:
                amt = tender["paytender"]
                if tender["paytype"] == "EWallet":
                    resp[tender["paybank"]] += amt
                    resp["UPI"] += amt
                    resp["ewalletsum"] += amt
                elif tender["paytype"] == "Cash":
                    resp["cash"] += amt
                else:
                    resp["card"] += amt

            if "MEN" in services[0]["LongGenderName"]:
                resp["Men"] += 1
            else:
                resp["Women"] += 1

            resp["NoOfBills"] += 1
            resp["TotGender"] += 1
            resp["servicebillcount"] += 1

        return resp

    def save_bill_handler(self):
        if self.settings.bill_prefix.lower() in self.payload[0].get("Comments", "").lower():
            try:
                _, ph_no = Utils.get_name_and_ph_no(self.payload[0]['clntid'])
                saved_bill = self.rest_db.save_bill(self.payload, ph_no)
                return {
                    "TicketID": "{0}{1}".format(self.settings.bill_prefix, saved_bill["id"]),
                    # "TicketID": 5868,
                    "message": "SUCCESS"
                }
            except Exception as e1:
                return {
                    "TicketID": "Error",
                    "message": str(e1)
                }
        else:
            return None

    def print_bill_handler(self):
        if str(self.payload["billid"]).startswith(self.settings.bill_prefix):
            try:
                bill_id = int(str(self.payload["billid"]).replace(self.settings.bill_prefix, ""))
                mmd_bill = self.rest_db.get_bills(bill_id)[0]["bill_data"]
                print_resp = {
                    "coupon": 0,
                    "merged": [],
                    "paymode": [],
                    "smoney": None,
                    "walletbls": 0
                }
                service_details = {
                    "AddressLine1": "85/3, 1ST FLOOR, KING SPACE MEADOWS APARTMENTS,",
                    "AddressLine2": "THANISANDRA MAIN RD, BENGALURU, KARNATAKA 560077",
                    "AdvanceAmount": 0,
                    "Area": "THANISANDRA",
                    "ChangeAmt": 0,
                    "CompanyNameGST": "",
                    "Created_Date": "2024-08-24 13:07:32",
                    "CustomerGSTNo": "",
                    "DiscID": "0",
                    "DiscPer": "100",
                    "DiscValue": 0,
                    "DiscountAmount": 275,
                    "GSTNo": "29AELFS9751D1ZH",
                    "HSNCode": None,
                    "MemDisc": 0,
                    "OthDisc": 275,
                    "Price": 275,
                    "Qty": 1,
                    "Referral": "Request",
                    "SACCode": "440209",
                    "ServiceDescr": "HAIR CUT",
                    "ServiceID": "GS00000001",
                    "ServiceName": "HAIR CUT",
                    "Sex": "1",
                    "Taxamount": 18,
                    "TicketID": 5868,
                    "Total": 0,
                    "clntid": "MURALI9591312316",
                    "clntname": "MURALI",
                    "clntphone": "9591312316",
                    "empid": "210812945",
                    "empname": "Nagaraj VN",
                    "member_check": 1,
                    "printed": 0,
                    "storePhone": "8.86156755096112e19",
                    "type": "S"
                }
                keys_map = {"Created_Date": "timemark",
                            "ServiceDescr": "ServiceName",
                            "ModeofPayment": "paytype",
                            "PayType": "paybank",
                            "ChangeAmt": "changeAmt",
                            "Tender": "paytender"
                            }

                for service in mmd_bill:
                    print_svc = {"srv": service}
                    print_svc.update(service_details)

                    for k in print_svc:
                        if k in service:
                            if k in service:
                                print_svc[k] = service[k]
                        elif k in keys_map:
                            logging.error("Getting {0} from {1}".format(k, keys_map[k]))
                            if keys_map[k] in service:
                                print_svc[k] = service[keys_map[k]]
                        if k == "Created_Date":
                            print_svc[k] = print_svc[k]+":00"
                        if k == "TicketID":
                            print_svc[k] = bill_id

                    print_svc["clntname"], print_svc["clntphone"] = Utils.get_name_and_ph_no(service['clntid'])
                    print_resp["merged"].append(print_svc)

                payment_details = {
                    "ChangeAmt": 0,
                    "ModeofPayment": "Cash",
                    "PayType": None,
                    "PaytypeCardno": None,
                    "Tender": 0
                }
                for tender in mmd_bill[0]["tender"]:
                    print_pay = {}
                    print_pay.update(payment_details)
                    for k in print_pay:
                        if k in tender:
                            print_pay[k] = tender[k]
                        if k == "ChangeAmt":
                            print_pay[k] = print_resp["merged"][0]["ChangeAmt"]
                        elif k in keys_map:
                            print_pay[k] = tender[keys_map[k]]
                    print_resp["paymode"].append(print_pay)

                return print_resp

            except Exception as e1:
                return {
                    "TicketID": "Error",
                    "message": str(e1)
                }
        else:
            return None

    def merge_json_numbers(self, main_json, merge_json):
        for key in main_json:
            if key in merge_json:
                if type(main_json[key]) is int or type(main_json[key]) is float:
                    main_json[key] = main_json[key] + merge_json[key]
                elif key in self.treat_as_int:
                    main_json[key] = str(int(main_json[key]) + int(merge_json[key]))
        return main_json

    def post_handler(self, orig_resp):
        try:
            resp_json = json.loads(orig_resp)
            if self.pre_resp_code == MMDStatus.ReturnPostMerge:
                resp_json = self.merge_json_numbers(resp_json, self.pre_resp)
                for key in resp_json:
                    if type(resp_json[key]) is list:
                        if key in self.merge_types and key in self.pre_resp:
                            if self.merge_types[key] == MMDStatus.Extend:
                                resp_json[key].extend(self.pre_resp[key])

                            elif self.merge_types[key] == MMDStatus.Merge:
                                for i in range(0, len(resp_json[key])):
                                    rm_obj = None
                                    for resp_entry in self.pre_resp[key]:
                                        if resp_json[key][i][self.merge_keys[key]] == resp_entry[self.merge_keys[key]]:
                                            rm_obj = resp_entry
                                            resp_json[key][i] = self.merge_json_numbers(resp_json[key][i], resp_entry)
                                            break
                                    if rm_obj:
                                        self.pre_resp[key].remove(rm_obj)
                                resp_json[key].extend(self.pre_resp[key])

                        if key in self.post_merge_sort_keys:
                            for sort_key in self.post_merge_sort_keys[key]:
                                resp_json[key].sort(key=operator.itemgetter(sort_key))

                        if len(resp_json[key]) > 0:
                            if "id" in resp_json[key][0]:
                                id_count = 1
                                for item in resp_json[key]:
                                    item["id"] = id_count
                                    id_count = id_count + 1
            return resp_json
        except Exception as e2:
            logging.error(e2)
            return orig_resp
