import logging
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import UnexpectedAlertPresentException, NoAlertPresentException
import json


logging.getLogger().setLevel(logging.DEBUG)
logging.getLogger("selenium").setLevel(logging.ERROR)
logging.getLogger("urllib3").setLevel(logging.ERROR)

# Optional: Chrome options
chrome_options = Options()
chrome_options.add_argument("--start-maximized")

# Launch Chrome
driver = webdriver.Chrome(options=chrome_options)

psw_url = "https://trendscentral.tivplserver.com/pdkncpp.php"
login_url = "https://trendscentral.tivplserver.com/"
series_prefix = "gt-"
current_number = 894

all_data = {}

# Open a webpage
fail_count = 0
while current_number < 2000:
    store_name = "Error"
    store_id = series_prefix + str(current_number)
    logging.debug(f"Working on ID - {store_id}")
    try:
        driver.get(psw_url)
        driver.find_element(By.NAME, "userid").send_keys(store_id)
        driver.find_element(By.NAME, "submit").click()
        time.sleep(2)
        psw = driver.find_element(By.XPATH, "/html/body/table/tbody/tr/td/h4/font").text.strip('"')
        driver.get(login_url)
        driver.find_element(By.NAME, "txtuserid").send_keys(store_id)
        driver.find_element(By.NAME, "txtpasswd").send_keys(psw)

        driver.find_element(By.NAME, "submit").click()
        time.sleep(1)
        psw_changed = True
        try:
            # Example: some action that might trigger an alert

            # Check for alert
            WebDriverWait(driver, 3).until(lambda d: d.switch_to.alert)
            alert = driver.switch_to.alert
            if "Your Current Password will be" in alert.text:
                psw_changed = False
                alert.dismiss()
            alert.accept()  # or alert.dismiss()


        except UnexpectedAlertPresentException as e:
            logging.error(f"UnexpectedAlertPresentException {e}")
            driver.switch_to.alert.accept()  # or .dismiss()

        except NoAlertPresentException as e1:
            psw_changed = False

        if psw_changed:
            raise Exception("Seems like password changed, will go for retry")

        try:
            store_name = driver.find_element(By.XPATH, "/html/body/table/tbody/tr[1]/td/table/tbody/tr[1]/td[1]").text
            time.sleep(1)
            driver.find_element(By.XPATH, "//div[text()='Logout']").click()
            time.sleep(1)
            fail_count = 0
        except Exception as e2:
            logging.info(e2)
            time.sleep(2)
            fail_count += 1
            if fail_count < 5:
                current_number -= 1
            else:
                fail_count = 0
                store_name = "Error in 5 Times"
    except Exception as e1:
        try:
            error = driver.find_element(By.XPATH, "/html/body/table/tbody/tr/td/font")
            if error:
                store_name = "InValidID"
            else:
                store_name = str(e1)
        except Exception as e2:
            logging.error(e2)
            store_name = "Needs Password change"
            driver.quit()
            time.sleep(2)
            driver = webdriver.Chrome(options=chrome_options)

    current_number += 1
    all_data[store_id] = store_name
    json.dump(all_data, open("branches.json", "w"))
    time.sleep(1)



print("Browser launched. Close the Chrome window to end the script.")

# Wait until the user closes the browser window
driver.wait_for_exit = True
while driver.wait_for_exit:
    try:
        # Accessing driver.title will throw an exception once the browser is closed
        _ = driver.title
    except:
        driver.wait_for_exit = False

print("Browser closed. Exiting script.")
