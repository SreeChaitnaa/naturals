import logging

import requests
import json
from datetime import date


class RestDB:

    def __init__(self, store_id, settings):
        self.store_id = store_id
        self.url = settings.RestDBData[store_id]["url"]
        self.headers = settings.RestDBData[store_id].copy()

    def do_rest_call(self, method="GET", body=None, url_params=None, table="bills"):
        url = "/".join([self.url, table])
        if url_params:
            url = "?".join([url, url_params])
        url = url.replace(" ", "")
        # url = urllib.parse.urlencode(url)
        logging.debug(url)
        return self._rest_on_url(url, method, body)

    def _rest_on_url(self, url, method="GET", body=None):
        data = json.dumps(body) if body else body
        response = requests.request(method, url, headers=self.headers, data=data)
        if response.status_code > 399:
            raise Exception("Error - {0}-{1}".format(response.status_code, response.text))
        return json.loads(response.text)

    def save_bill(self, bill_data, ph_no):
        date_num = int(date.today().__format__("%Y%m%d"))
        bill_payload = {"bill_data": json.dumps(bill_data), "phone": ph_no, "bill_date": date_num}
        resp = self.do_rest_call("POST", body=bill_payload)
        resp['bill_data'] = json.loads(resp['bill_data'])
        return resp

    def get_bills(self, bill_id=None, phone_num=None, date_start=None, date_end=None):
        query = None
        if bill_id:
            query = {"id": bill_id}
        elif date_start and date_end:
            query = {"bill_date": {"$bt": [int(date_start), int(date_end)]}}
        if query is None:
            raise Exception("Invalid input params")
        url_params = 'q={}'.format(json.dumps(query))
        all_bills = []
        for bill in self.do_rest_call(url_params=url_params):
            bill["bill_data"] = json.loads(bill["bill_data"])
            all_bills.append(bill)
        return all_bills

