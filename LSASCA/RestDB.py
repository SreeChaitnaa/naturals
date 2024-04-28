import requests
from datetime import datetime
from LSASCA.Utils import *


class RestDB(object):
    def __init__(self):
        # self.url = "https://lasnrs-c22b.restdb.io/rest/"
        # x_apikey = "8329f05b6a3b424ee1e476d79740cd0816fc8"
        
        self.url = "https://scanrstsd1-560a.restdb.io/rest/"
        x_apikey = '63c50bd5969f06502871af1d'

        # self.url = "https://lasnrsmayur1-7677.restdb.io/rest/"
        # x_apikey = "662de2879dbf3549ad8faf3a"
        
        self.headers = {'content-type': "application/json",
                        'x-apikey': x_apikey,
                        'cache-control': "no-cache"
                        }
        self.config_ids = {}

    def do_request(self, payload=None, request_type="GET", table_name=Strings.bills_table, object_id=None):
        url = self.url + table_name
        if object_id:
            url += "/{}".format(object_id)
        if payload:
            if request_type == "GET":
                url = "{0}?q={1}".format(url, payload)
                payload = None
            else:
                payload = json.dumps(payload, cls=LSCAJSONEncoder)
                logging.debug("payload - {}".format(payload))
        response = requests.request(request_type, url, headers=self.headers, data=payload)
        resp_json = json.loads(response.text)
        return resp_json

    def get_config(self, config_key):
        config_data = self.get_by_key_value("config_key", config_key, Strings.config_table)
        if config_data:
            self.config_ids[config_data["config_key"]] = config_data["_id"]
            return config_data["config_value"]

    def set_config(self, config_key, config_value):
        payload = {"config_key": config_key, "config_value": config_value}
        return self.do_request(payload, "PUT", Strings.config_table, self.config_ids[config_key])

    @staticmethod
    def get_query_value(value):
        value = str(value)
        value = '"' + value + '"' if not value.isdigit() else value
        return value

    def get_by_key_value(self, key, value, table_name=Strings.bills_table):
        responses = self.get_by_query_string(key, self.get_query_value(value), table_name)
        if type(responses) is list:
            if len(responses) == 1:
                return responses[0]
        return responses

    def get_by_query_string(self, key, query_string, table_name=Strings.bills_table):
        query_str = '{"' + key + '":' + query_string + '}'
        return self.do_request(query_str, table_name=table_name)

    def get_by_query(self, key, query_condition, query_data, table_name=Strings.bills_table):
        if query_condition == "bt":
            query_string = '{"$bt":' + str(query_data).replace("'", '"') + '}'
        else:
            query_string = '{"$' + query_condition + '":' + self.get_query_value(query_data) + '}'
        return self.get_by_query_string(key, query_string, table_name)

    def add_bill(self, bill_num, bill_data):
        date_num = int(bill_data['Ticket'][0]['Created_Date'].strftime("%Y%m%d"))
        phone_no = bill_data['Ticket'][0]['ClientID'][-10:]
        payload = {"bill_no": int(bill_num), "bill_data": json.dumps(bill_data, cls=LSCAJSONEncoder),
                   "date_num": date_num, "is_mmd": Utils.is_mmd_bill(bill_data), "phone": phone_no}
        self.do_request(payload, "POST")


