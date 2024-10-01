import logging
import os
import subprocess
import psutil
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from subprocess import CREATE_NO_WINDOW
from Settings import Settings


class Launcher:
    def __init__(self, is_mmd=False, show_invoices=False):
        self.driver = None
        self.is_mmd = is_mmd
        settings = Settings()

        self.service = Service(executable_path=settings.chrome_driver)
        self.service.creation_flags = CREATE_NO_WINDOW
        chrome_options = Options()
        chrome_options.add_argument('--ignore-certificate-errors')
        chrome_options.add_argument("--user-data-dir={0}".format(settings.chrome_user_data))
        chrome_options.add_argument('--profile-directory=chrome_profile')
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--app=" + settings.bill_url)

        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option("detach", True)

        settings.set("show_invoices", show_invoices)
        settings.save()
        self.chrome_options = chrome_options
        self.settings = settings

    def set_hosts(self, set_mmd=False):
        with open(self.settings.hosts_file, "r") as f:
            lines = f.readlines()
        with open(self.settings.hosts_file, "w") as f:
            for line in lines:
                if self.settings.rest_api_host not in line:
                    f.write(line)
            if set_mmd:
                f.write("127.0.0.1    {}".format(self.settings.rest_api_host))

    def set_element(self, element_setting):
        assert isinstance(self.driver, webdriver.Chrome)
        try:
            element = self.driver.find_element(element_setting["by"], element_setting["selector"])
            if element:
                if element_setting["value"] == "click":
                    element.click()
                else:
                    element.send_keys(element_setting["value"])
                return True
        except Exception:
            pass
        return False

    @staticmethod
    def clear_apps():
        for proc in psutil.process_iter():
            # check whether the process to kill name matches
            try:
                cmd_line_params = " ".join(proc.cmdline()).lower()
                if "flask" in cmd_line_params or "innosmarti" in cmd_line_params:
                    proc.kill()
            except:
                pass

    def process(self):
        self.clear_apps()

        if self.is_mmd:
            os.chdir(self.settings.app_path)
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            subprocess.Popen(self.settings.flask_command, startupinfo=startupinfo)

        self.set_hosts(self.is_mmd)

        self.driver = webdriver.Chrome(self.chrome_options, self.service)
        time.sleep(3)

        if self.set_element(self.settings.user):
            self.set_element(self.settings.password)
            self.set_element(self.settings.login)

        if not self.is_mmd:
            return

        while True:
            try:
                _ = self.driver.current_url
            except Exception as exc1:
                logging.info("Browser closed - {}".format(exc1))
                break
            time.sleep(1)

        self.clear_apps()
        self.set_hosts()
