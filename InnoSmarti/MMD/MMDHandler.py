import logging
import json
import operator
from datetime import date
from RestDB import RestDB
from collections import OrderedDict
import subprocess


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

    @staticmethod
    def add_duplicates_in_dict(input_dicts, dup_list_dict, remove_key_in_input=False):
        for i in range(len(input_dicts)):
            for k in dup_list_dict:
                for dup_k in dup_list_dict[k]:
                    input_dicts[i][dup_k] = input_dicts[i][k]
                if remove_key_in_input:
                    del input_dicts[i][k]
        return input_dicts

    @staticmethod
    def merge_lists(main_list, merge_list, use_main_as_template=True, incremental_key=None):
        next_val = None
        if incremental_key is not None and incremental_key in main_list[-1]:
            next_val = main_list[-1][incremental_key] + 1
        for i in range(len(merge_list)):
            if use_main_as_template:
                template = main_list[0].copy()
                template.update(merge_list[i])
                merge_list[i] = template
            if next_val:
                merge_list[i][incremental_key] = next_val
                next_val += 1

        main_list.extend(merge_list)
        return main_list

    @staticmethod
    def send_whatsapp(text="", phone_num=None):
        wa_cmd = "cmd /C start whatsapp://send?"
        if phone_num:
            wa_cmd = wa_cmd + "phone=91" + phone_num + "&"
        wa_cmd = wa_cmd + "text=" + text.replace(" ", "%20").replace("\n", "%0a")
        subprocess.Popen(wa_cmd)


class MMDStatus:
    NoServerCall = "NoServerCall"
    ReturnServerCall = "ReturnServerCall"
    ReturnPostMerge = "ReturnPostMerge"
    Extend = "Extend"
    Merge = "Merge"


class MMDHandler:
    def __init__(self, request, settings, logger):
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
        self.logger = logger

        handler = None
        code_on_resp = MMDStatus.NoServerCall
        store_id = None

        if request.method == "POST":

            if "/savebill/" in request.url:
                handler = self.save_bill_handler
                store_id = self.get_store_id_from_url()

            elif str(request.url).endswith('/printreceipt'):
                handler = self.print_bill_handler
                store_id = self.get_store_id_from_payload()

            elif str(request.url).endswith('/salesOftheday'):
                handler = self.day_close_handler
                store_id = self.get_store_id_from_payload()
                code_on_resp = MMDStatus.ReturnPostMerge

            elif "/getServices/" in str(self.request.url):
                if self.payload["TypeofService"] == "Normal":
                    handler = self.get_services_handler
                    store_id = self.get_store_id_from_url()
                    code_on_resp = MMDStatus.ReturnPostMerge

            elif str(request.url).endswith("/employeewisesales"):
                handler = self.get_employee_sales_handler
                store_id = self.payload["SoreID"]
                code_on_resp = MMDStatus.ReturnPostMerge
                self.merge_types["data"] = MMDStatus.Merge
                self.merge_keys["data"] = "EmpID"
                self.treat_as_int = ["TotalProductCount", "TotalServiceCount"]

        elif self.settings.show_invoices and request.method == "GET":
            if "/getTodayTicket/" in request.url or "/getTicketByDate/" in request.url:
                handler = self.get_tickets_handler
                store_id = self.get_store_id_from_url()
                code_on_resp = MMDStatus.ReturnPostMerge
                self.merge_types["bills"] = MMDStatus.Extend
                self.post_merge_sort_keys["bills"] = ["Created_Date"]

            if "/viewTicketNew/" in request.url:
                handler = self.view_ticket_handler
                store_id = self.get_store_id_from_url()

        if handler and store_id:
            logger.info("Handling URL is {0}-{1}".format(request.method, str(request.url)))
            self.rest_db = RestDB(store_id, self.settings, logger)
            self.pre_resp = handler()
            if self.pre_resp is not None:
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
                net_value = service["NormalPrice"] * service["Qty"] - service["DiscountAmount"]
                if service["ServiceID"].startswith("SCAP"):
                    all_emp_sales[emp_id]["ProductSales"] += net_value
                    all_emp_sales[emp_id]["TotalProductCount"] += 1
                else:
                    all_emp_sales[emp_id]["NetSalesForServices"] += net_value
                    all_emp_sales[emp_id]["NetSalesForServicesAdjusted"] += net_value
                    all_emp_sales[emp_id]["TotalServiceCount"] += 1
                all_emp_sales[emp_id]["TotalDiscount"] += service["DiscountAmount"]
                all_emp_sales[emp_id]["TotalMemDiscount"] += service["MemDisc"]
                all_emp_sales[emp_id]["TotalOtherDiscount"] += service["OthDisc"]
                all_emp_sales[emp_id]["TotalTax"] += (service["Total"] - net_value)
                all_emp_sales[emp_id]["TotalTicketValue"] += service["Total"]

            for emp_id in emp_ids_in_bill:
                all_emp_sales[emp_id]["TicketCount"] += 1

        data = []
        for emp_dict in all_emp_sales.values():
            for k in emp_dict:
                if type(emp_dict[k]) is not str:
                    emp_dict[k] = int(emp_dict[k])
            data.append(emp_dict)
        return {"data": data}

    def day_close_handler(self):
        req_date = str(self.payload["Date"]).replace("-", "")
        bills_today = self.get_bills_and_summary_of_given_dates(req_date, req_date)
        if bills_today is None:
            bills_today = {}
        return bills_today

    def view_ticket_handler(self):
        bill_id = str(self.get_store_id_from_url(2)).lower()
        is_mmd = self.settings.bill_prefix.lower() in bill_id
        if is_mmd:
            tickets = []
            payments = []
            mmd_bill = self.rest_db.get_bills(bill_id.replace(self.settings.bill_prefix.lower(), ""))[0]
            services = mmd_bill["bill_data"]
            client_id = services[0]['clntid']
            clntname, clntphone = Utils.get_name_and_ph_no(client_id)
            ticket_id = "{0}{1}".format(self.settings.bill_prefix, mmd_bill["id"])
            for tender in services[0]["tender"]:
                payment = {
                    "ChangeAmt": services[0]["changeAmt"] if tender["paytype"] == "Cash" else 0,
                    "ModeofPayment": tender["paytype"],
                    "PayType": tender["paybank"] if tender["paytype"] != "Cash" else None,
                    "PaytypeCardno": tender["paycrd"] if tender["paytype"] not in ["Cash", "EWallet"] else None,
                    "Remarks": tender["finremark"],
                    "Tender": tender["paytender"]
                }
                payments.append(payment)
            for service in services:
                ticket = {
                      "AdvanceAmount": 0,
                      "Comments": None,
                      "Created_Date": service["timemark"] + ":00",
                      "DiscID": None,
                      "DiscPer": None,
                      "DiscValue": None,
                      "DiscountAmount": 50,
                      "DiscountName": None,
                      "ID": client_id,
                      "MemDisc": 50,
                      "MembershipCardNo": None,
                      "Name": clntname,
                      "OrganisationID": 1001,
                      "OthDisc": 0,
                      "Phone": clntphone,
                      "Price": 275,
                      "PrivelageCardNo": "000000000000",
                      "Qty": 1,
                      "Referral": "Request",
                      "ServiceID": "GS00000001",
                      "ServiceName": "HAIR CUT",
                      "Serviceslipno": "0",
                      "Sex": "1",
                      "StoreID": self.rest_db.store_id,
                      "Taxamount": 18,
                      "TicketID": ticket_id,
                      "TimeMark": service["timemark"] + ":00",
                      "Total": 265.5,
                      "VoucherNo": "",
                      "WalletAdvance": None,
                      "clntid": "Prateek9363238467",
                      "currentmemcardno": None,
                      "currentmemcheck": 1,
                      "deldisable": 1,
                      "empid": "700950",
                      "empname": "Meenakshi",
                      "fullname": "{0} - {1}".format(clntphone, clntname),
                      "member_check": 1,
                      "pricedisable": 1,
                      "type": "S"
                }
                for tkey in ticket:
                    if tkey in service:
                        ticket[tkey] = service[tkey]
                tickets.append(ticket)
            view_resp = {"payment": payments, "ticket": tickets}
            return view_resp
        else:
            return None

    def get_tickets_handler(self):
        start_date = date.today().__format__("%Y%m%d")
        end_date = start_date

        if "/getTicketByDate/" in self.request.url:
            start_date = self.get_store_id_from_url(-2).replace("-", "")
            end_date = self.get_store_id_from_url(-1).replace("-", "")

        return self.get_bills_and_summary_of_given_dates(start_date, end_date)

    def get_bills_and_summary_of_given_dates(self, start_date, end_date):
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
            "Created_Date": "timemark",
            "empname": "empname",
            "ChangeAmt": "changeAmt"
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
            "servicedesc": "",
            "ChangeAmt": 0,
            "empname": ""
        }
        sum_keys = ["Mem_disc", "Oth_Disc", "servicedesc", "empname"]
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
            bill_to_add["ClientID"] = clntname + clntphone
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
            map_to_use = resp_bill_map
            for rk in resp:
                if rk in map_to_use:
                    resp[rk] += bill_to_add[map_to_use[rk]]
                elif rk in bill_to_add:
                    resp[rk] += bill_to_add[rk]

            for tender in services[0]["tender"]:
                amt = tender["paytender"]
                if tender["paytype"] == "EWallet":
                    resp[tender["paybank"]] += amt
                    resp["UPI"] += amt
                    resp["ewalletsum"] += amt
                elif tender["paytype"] == "Cash":
                    resp["cash"] += amt - services[0]["changeAmt"]

                else:
                    resp["card"] += amt

            if "MEN" in services[0]["LongGenderName"]:
                resp["Men"] += 1
            else:
                resp["Women"] += 1

            resp["NoOfBills"] += 1
            resp["TotGender"] += 1

            service_exists = False
            product_exists = False
            for service in services:
                if str(service["ServiceID"]).lower().startswith("scap"):
                    product_exists = True
                    prod_gross = service["Total"]
                    prod_net = round(prod_gross / 1.18, 2)
                    resp["Productbillsales"] += prod_gross
                    resp["servicebillsales"] -= prod_gross
                    resp["Productbillsalesnet"] += prod_net
                    resp["servicebillsalesnet"] -= prod_net
                else:
                    service_exists = True

            if service_exists:
                resp["servicebillcount"] += 1
            if product_exists:
                resp["Productbillcount"] += 1

        return resp

    def save_bill_handler(self):
        is_mmd = self.settings.bill_prefix.lower() in self.payload[0].get("Comments", "").lower()
        if not is_mmd:
            for service in self.payload:
                if str(service["ServiceID"]).lower().startswith("sca"):
                    is_mmd = True
                    break
        if is_mmd:
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
                            self.logger.error("Getting {0} from {1}".format(k, keys_map[k]))
                            if keys_map[k] in service:
                                print_svc[k] = service[keys_map[k]]
                        if k == "Created_Date":
                            print_svc[k] = print_svc[k] + ":00"
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

    def get_services_handler(self):
        services = self.rest_db.get_services()
        duplicate_entries = {
            "ServiceID": ["value", "memprodid", "wsmemprodid"],
            "ServiceName": ["label"],
            "NormalPrice": ["Total", "Price"]
        }
        services = Utils.add_duplicates_in_dict(services, duplicate_entries)
        products = [product for product in self.rest_db.get_products() if product.pop("Qty") > 0]
        for product in products:
            product["MRP"] = round(product["MRP"] / 1.18, 2)
        duplicate_entries = {
            "ProductID": ["ServiceID", "value", "memprodid", "wsmemprodid"],
            "ProductName": ["ServiceName", "label"],
            "MRP": ["MemberPrice", "NormalPrice", "Total", "Price"]
        }
        services.extend(Utils.add_duplicates_in_dict(products, duplicate_entries))
        return services

    def merge_json_numbers(self, main_json, merge_json):
        for key in main_json:
            if key in merge_json:
                if type(main_json[key]) is int or type(main_json[key]) is float:
                    main_json[key] = round(main_json[key] + merge_json[key], 2)
                elif key in self.treat_as_int:
                    main_json[key] = str(int(main_json[key]) + int(merge_json[key]))
        return main_json

    def send_day_close(self, orig_resp):
        def get_sum(key):
            return orig_resp[key] + self.pre_resp.get(key, 0)

        day_close_data = OrderedDict()
        day_close_data["Date"] = date.today().__format__("*%d-%B-%Y*")
        day_close_data["NewLine1"] = 1
        day_close_data["No of Clients"] = get_sum("NoOfBills")
        day_close_data["New Clients"] = get_sum("newClient_count")
        day_close_data["NewLine2"] = 1
        sb_count = get_sum("servicebillcount")
        day_close_data["Service Bills"] = sb_count
        day_close_data["Service Sales"] = int(get_sum("servicebillsalesnet"))
        day_close_data["Service ABV"] = int(get_sum("servicebillsalesnet") / max(sb_count, 1))
        day_close_data["NewLine3"] = 1
        day_close_data["Product Bills"] = get_sum("Productbillcount")
        day_close_data["Product Sales"] = int(get_sum("Productbillsalesnet"))
        day_close_data["NewLine4"] = 2
        day_close_data["Net Sales"] = "*{}*".format(get_sum("Net"))
        day_close_data["Cash"] = get_sum("cash")

        message = ""
        for k in day_close_data:
            if k.startswith("NewLine"):
                message = message + "\n" * day_close_data[k]
            else:
                message = "{0}{1}: {2}\n".format(message, k, day_close_data[k])
        message = message + "\nClosing now, Good Night!!!\n"
        self.logger.info("Message is {}".format(message))
        Utils.send_whatsapp(message)
        return message

    def post_handler(self, orig_resp):
        try:
            resp_json_orig = json.loads(orig_resp)
        except:
            return orig_resp

        try:
            resp_json = resp_json_orig.copy()
            if self.pre_resp_code == MMDStatus.ReturnPostMerge:
                if "/getServices/" in str(self.request.url):
                    return json.dumps(Utils.merge_lists(resp_json, self.pre_resp, incremental_key="Row"))
                elif str(self.request.url).endswith('/salesOftheday'):
                    resp_json["MessageSent"] = self.send_day_close(resp_json)
                    return resp_json
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
            return json.dumps(resp_json)
        except Exception as e2:
            self.logger.error(e2)
            resp_json_orig["SCA_Exception"] = str(e2)
            return resp_json_orig
