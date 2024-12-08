import json
import logging
import os.path


class Settings:

    def __init__(self, settings=None):
        self.app_path = os.path.dirname(__file__)
        self.settings_file = os.path.join(self.app_path, "Settings.json")
        if settings:
            self.settings = settings
        else:
            self.settings = json.load(open(self.settings_file, "r"))
        self.RestDBData = self.settings["rest_db_data"]
        self.flask_command = self.settings["flask_command"]
        self.bill_prefix = self.settings["bill_prefix"]
        self.chrome_driver = self.settings["chrome_driver"]
        self.bill_url = self.settings["bill_url"]
        self.user = self.settings["user"]
        self.password = self.settings["password"]
        self.login = self.settings["login"]
        self.show_invoices = self.settings["show_invoices"]
        self.hosts_file = self.settings["hosts_file"]
        self.rest_api_host = self.settings["rest_api_host"]
        self.chrome_user_data = self.settings["chrome_user_data"]
        self.is_mac = self.settings["is_mac"]

    def set(self, key, value):
        self.settings[key] = value
        self.__init__(self.settings)

    def save(self):
        json.dump(self.settings, open(self.settings_file, "w"), indent=4)
        logging.debug("Saved settings at {0} - {1}".format(self.settings_file, self.settings))
