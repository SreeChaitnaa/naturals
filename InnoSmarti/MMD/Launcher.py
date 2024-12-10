import logging
import os
import subprocess
import psutil
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from Settings import Settings


class Launcher:
    def __init__(self, is_mmd=False, show_invoices=False, is_mac=False, store_id="1526"):
        self.driver = None
        self.is_mmd = is_mmd
        self.is_mac = is_mac
        self.store_id = store_id
        settings = Settings()

        self.service = Service(executable_path=settings.chrome_driver)
        if not self.is_mac:
            from subprocess import CREATE_NO_WINDOW
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
        settings.set("is_mac", self.is_mac)
        settings.set("store_id", store_id)
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
                elif element_setting["value"] == "set_reports":
                    self.set_reports(element)
                else:
                    element.send_keys(Keys.CONTROL + "a")
                    element.send_keys(Keys.DELETE)
                    element.send_keys(element_setting["value"])
                return True
        except Exception as e2:
            logging.error(e2)
            pass
        return False

    def set_reports(self, element):
        self.driver.execute_script("arguments[0].setAttribute('href', arguments[1]);", element,
                                   "https://sreechaitnaa.github.io/naturals/InnoSmarti/js/Reports.html")
        self.driver.execute_script(
            "arguments[0].parentElement.parentElement.parentElement.innerHTML = arguments[0].parentElement.outerHTML;",
            element)


    @staticmethod
    def clear_flask():
        for proc in psutil.process_iter():
            # check whether the process to kill name matches
            try:
                cmd_line = " ".join(proc.cmdline()).lower()
                if "flask" in cmd_line or "innosmarti" in cmd_line:
                    proc.kill()
            except:
                pass

    def process(self):
        self.clear_flask()

        if self.is_mmd:
            os.chdir(self.settings.app_path)
            if not self.is_mac:
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                subprocess.Popen(self.settings.flask_command, startupinfo=startupinfo)
            else:
                os.system(self.settings.flask_command)

        self.set_hosts(self.is_mmd)

        self.driver = webdriver.Chrome(self.chrome_options, self.service)
        time.sleep(3)

        if self.set_element(self.settings.user):
            self.set_element(self.settings.password)
            self.set_element(self.settings.login)

        if not self.is_mmd:
            return

        prev_url = self.driver.current_url

        while True:
            try:
                current_url = self.driver.current_url
                if self.settings.show_invoices and current_url != prev_url:
                    self.set_element(self.settings.reports_link)
                prev_url = current_url
            except Exception as exc1:
                logging.info("Browser closed - {}".format(exc1))
                break
            time.sleep(1)

        self.clear_flask()
        self.set_hosts()
