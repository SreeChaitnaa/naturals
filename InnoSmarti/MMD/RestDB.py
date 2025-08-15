import time

import requests
import json
from datetime import date


class DBStrings:
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    Table_Bills = "bills"
    Table_Services = "services"
    Table_Products = "products"
    Table_DaySales = "daysales"
    Table_config = "config"
    REST_id = "_id"
    Services_Prefix = "SCAS0"
    Products_Prefix = "SCAP0"
    ServiceID = "ServiceID"
    ProductID = "ProductID"
    ConfigName = "config_name"
    ConfigValue = "config_value"
    Bill_Data = "bill_data"


class RestDB:

    def __init__(self, store_id, settings, logger):
        self.store_id = store_id
        self.logger = logger
        self.url = settings.RestDBData[store_id]["url"]
        self.headers = settings.RestDBData[store_id].copy()

    def do_rest_call(self, method=DBStrings.GET, body=None, url_params=None, table=DBStrings.Table_Bills):
        url = "/".join([self.url, table])
        if body is not None and DBStrings.REST_id in body and method in [DBStrings.PUT, DBStrings.DELETE]:
            url = "/".join([url, body.pop(DBStrings.REST_id)])
        if url_params:
            url = "?".join([url, url_params])
        url = url.replace(" ", "")
        # url = urllib.parse.urlencode(url)
        self.logger.debug(url)
        return self._rest_on_url(url, method, body)

    def _rest_on_url(self, url, method=DBStrings.GET, body=None):
        data = json.dumps(body) if body else body
        response = requests.request(method, url, headers=self.headers, data=data)
        if response.status_code > 399:
            raise Exception("Error - {0}-{1}".format(response.status_code, response.text))
        return json.loads(response.text)

    def save_bill(self, bill_data, ph_no):
        date_num = int(date.today().__format__("%Y%m%d"))
        bill_payload = {DBStrings.Bill_Data: json.dumps(bill_data), "phone": ph_no, "bill_date": date_num}
        for service in bill_data:
            if str(service[DBStrings.ServiceID]).startswith(DBStrings.Products_Prefix):
                self.set_product_sold(service[DBStrings.ServiceID])
        resp = self.do_rest_call(DBStrings.POST, body=bill_payload)
        resp[DBStrings.Bill_Data] = json.loads(resp[DBStrings.Bill_Data])
        return resp

    def get_bills(self, bill_id=None, phone_num=None, date_start=None, date_end=None, bill_start=None, bill_end=None):
        query = None
        if bill_id:
            query = {"id": int(bill_id)}
        elif date_start and date_end:
            query = {"bill_date": {"$bt": [int(date_start), int(date_end)]}}
        elif bill_start and bill_end:
            query = {"id": {"$bt": [int(bill_start), int(bill_end)]}}
        if query is None:
            raise Exception("Invalid input params")
        url_params = 'q={}'.format(json.dumps(query))
        all_bills = []
        for bill in self.do_rest_call(url_params=url_params):
            bill[DBStrings.Bill_Data] = json.loads(bill[DBStrings.Bill_Data])
            all_bills.append(bill)
        return all_bills

    def get_services(self):
        services = self.do_rest_call(table=DBStrings.Table_Services)
        for service in services:
            service[DBStrings.ServiceID] = DBStrings.Services_Prefix + str(service[DBStrings.ServiceID])
        return services

    def get_products(self):
        products = self.do_rest_call(table=DBStrings.Table_Products)
        for product in products:
            product[DBStrings.ProductID] = DBStrings.Products_Prefix + str(product[DBStrings.ProductID])
        return products

    def set_product_sold(self, product_id, qty=1):
        if str(product_id).startswith(DBStrings.Products_Prefix):
            product_id = int(str(product_id).replace(DBStrings.Products_Prefix, ""))
        query = {DBStrings.ProductID: product_id}
        url_params = 'q={}'.format(json.dumps(query))
        bill = self.do_rest_call(url_params=url_params, table=DBStrings.Table_Products)[0]
        bill["Qty"] -= qty
        method = DBStrings.DELETE if bill["Qty"] <= 0 else DBStrings.PUT
        self.do_rest_call(method, bill, table=DBStrings.Table_Products)

    def get_all_dates_sales(self):
        return self.do_rest_call(table=DBStrings.Table_DaySales)

    def get_config(self, config_name):
        url_params = 'q={}'.format(json.dumps({DBStrings.ConfigName: config_name}))
        config = self.do_rest_call(url_params=url_params, table=DBStrings.Table_config)[0]
        return config

    def get_config_value(self, config_name):
        return self.get_config(config_name)[DBStrings.ConfigValue]

    def update_config_value(self, config_name, config_value):
        config = self.get_config(config_name)
        config[DBStrings.ConfigValue] = str(config_value)
        self.do_rest_call(DBStrings.PUT, config, table=DBStrings.Table_config)

    def update_bills(self, bills_to_add, is_mmd, last_bill_key, next_bill_number):
        bills_per_day = {}
        if len(bills_to_add) == 0:
            self.logger.info("Got 0 Bills, returning...")
            return
        self.logger.info(f"Adding {len(bills_to_add)} bills for MMD:{is_mmd}, {last_bill_key}: {next_bill_number}")
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
                for k in ["DiscountAmount", "Price", "Qty", "ServiceID", "ServiceName", "Sex", "Total",
                          "empname"]:
                    nt[k] = ticket[k]
                bill["ticket"].append(nt)
            bills_per_day[bill_date].append(bill)

        for bill_date, bills in bills_per_day.items():
            self.update_bills_of_day(bill_date, bills)

        self.update_config_value(last_bill_key, next_bill_number)
        self.logger.info(f"Added {len(bills_to_add)} bills for MMD:{is_mmd}, {last_bill_key}: {next_bill_number}")

    def update_bills_of_day(self, bill_date, bills):
        query = {"datenum": str(bill_date)}
        url_params = 'q={}'.format(json.dumps(query))
        prev_day_sale = self.do_rest_call(url_params=url_params, table=DBStrings.Table_DaySales)
        task_method = DBStrings.POST
        query["bills"] = bills
        if len(prev_day_sale) > 0:
            prev_day_sale = prev_day_sale[0]
            prev_day_sale["bills"].extend(bills)
            query = prev_day_sale
            task_method = DBStrings.PUT
        self.do_rest_call(task_method, query, table=DBStrings.Table_DaySales)
        time.sleep(1)
