from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options
from selenium.common import exceptions
import os
import sys
import time
import random
import subprocess

file_path = os.path.realpath(__file__)
current_dir = os.path.dirname(file_path)
current_url = ""
chrome_options = Options()
chrome_options.add_argument("disable-infobars")
chrome_options.add_argument("--start-maximized")
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option("useAutomationExtension", False)
if sys.argv[1].lower() == "naturals":
    chrome_options.add_argument("--app=https://iservenaturals.in/iNaturals/")
    chrome_options.add_argument("--user-data-dir="+current_dir+"/sca_profile"+str(random.randint(1,15)))
elif sys.argv[1].lower() == "appointments":
    chrome_options.add_argument("--app=https://partners.fresha.com/calendar?view=day&location_id=826919")
    chrome_options.add_argument("--user-data-dir=D:\\Murali\\SCA\\apt_profile")
prefs = {"credentials_enable_service": False,
     "profile.password_manager_enabled": False}
chrome_options.add_experimental_option("prefs", prefs)
driver = webdriver.Chrome(chrome_options=chrome_options)
# Now wait if someone closes the window

def load_sca_script():
    driver.execute_script("var script = document.createElement('script'); script.src = 'https://sreechaitnaa.github.io/naturals/sca.js'; document.head.appendChild(script);")

fail_counter = 0
reloader_counter = 0
try:
    while True:
        try:
            wait = WebDriverWait(driver, 1)
            try:
                wait.until(lambda driver: driver.current_url != current_url)
                if driver.current_url != current_url:
                    fail_counter = 0
                    reloader_counter = 0
                    current_url = driver.current_url
                    print("URL changed to - " + current_url)
                    load_sca_script()
            except exceptions.TimeoutException as e1:
                # if 'walkininvoice' in driver.current_url.lower():
                if "fresha" not in driver.current_url and driver.execute_script('return saveInvoice.length') != 2:
                    fail_counter +=1
                    print("length is - " + str(driver.execute_script('return saveInvoice.length')))
                    if fail_counter >= 20:
                        raise "Kill Session"
                    if fail_counter%5 == 0:
                        load_sca_script()
                else:
                    fail_counter = 0
                    if 'walkininvoice' in driver.current_url.lower():
                        reloader_counter +=1
                        if reloader_counter > 20:
                            load_sca_script()
                            reloader_counter = 0

                    wa_div = driver.find_element_by_id("sca_wa_url")
                    wa_msg = wa_div.get_attribute("innerText")
                    if wa_msg != "":
                        driver.execute_script("document.getElementById('sca_wa_url').innerText = ''")
                        wa_url = wa_msg.replace(" ", "%20")
                        wa_url = wa_url.replace("https://api.whatsapp.com/send/?", "start whatsapp://send?")
                        wa_url = wa_url.replace("&text", "^&text")
                        print(wa_url)
                        subprocess.Popen(["cmd", "/C", wa_url], shell=True)
            
        except exceptions.WebDriverException as e:
            print(e)
            if str(e).find("Alert") > -1:
                continue
            elif str(e).find("Unable to locate") > -1:
                continue
            elif str(e).find("saveInvoice is not defined") > -1:
                fail_counter +=1
                if fail_counter > 10:
                    raise "Kill Session"
                continue
            driver.quit()
            break
except Exception as e2:
    print(e2)
finally:
    driver.quit()
