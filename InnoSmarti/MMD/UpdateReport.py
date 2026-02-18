import sys

from playwright.sync_api import sync_playwright
from RestDB import RestDB
from Settings import Settings
from MMDHandler import Utils
import logging
import time


def run_browser_and_capture_headers(config):
    captured_headers = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,  # 🔥 browser hidden
            args=["--disable-gpu", "--no-sandbox"]
        )

        context = browser.new_context()
        page = context.new_page()

        def on_request(request):
            if "/api/auth/getServices" in request.url and request.method == "POST":
                logger.info("Captured API call: {}".format(request.url))
                captured_headers.update(request.headers)

        page.on("request", on_request)

        # --- Open login page ---
        page.goto(config.bill_url, timeout=60000)

        # --- Login ---
        page.wait_for_selector('input[formcontrolname="email"]')

        page.fill('input[formcontrolname="email"]', config.user["value"])
        page.fill('input[formcontrolname="password"]', config.password["value"])

        page.click('button:has-text("Log In")')

        # Wait until login completes
        page.wait_for_load_state("networkidle")

        # --- Open Billing and wait ---
        page.goto(config.bill_url + "/#/User/Billing", timeout=60000)

        #wait for captured_headers to be populated
        retries = 0
        while not captured_headers:
            time.sleep(500)
            retries += 1
            if retries > 10:
                print("Timed out waiting for API headers")
                break

        browser.close()

    if not captured_headers:
        raise Exception("Failed to capture API headers")

    return captured_headers


if __name__ == '__main__':
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    handler = logging.FileHandler('update_task.log')  # Log to a file
    handler.setLevel(logging.INFO)
    # Formatter with date, time, and log level
    formatter = logging.Formatter(
        '%(asctime)s [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    handler.setFormatter(formatter)
    logger.addHandler(handler)
    # Add console handler as well
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    store_id = None
    if len(sys.argv) > 1:
        store_id = sys.argv[1]
        logger.info("Store ID provided as argument: {}".format(store_id))

    settings = Settings(store_id=store_id)
    rest_db = RestDB(settings.store_id, settings, logger)
    logger.info("Starting Browser to get Auth headers for Store ID - {}".format(settings.store_id))
    headers = run_browser_and_capture_headers(settings)
    latest_bill_number = Utils.get_latest_bill_number(settings.store_id, headers)
    logger.info("Latest Bill Number - {}".format(latest_bill_number))
    Utils.update_rest_db(settings.store_id, latest_bill_number,logger, settings, rest_db, headers)

