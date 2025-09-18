from Settings import Settings
from RestDB import RestDB
from MMDHandler import Utils
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
settings = Settings()
rest_db = RestDB(settings.store_id, settings, logger)
print(f"InsertingMissing Bills for Store ID - {settings.store_id}")
print("*****Please open any NRS Bill in InnoSmarti with MMD before giving the Missing Bill IDs******")
bill_id = input("Enter missing Bill Number - ").lower()

logging.info(f"Bill ID {bill_id}")
if bill_id:
    is_mmd = settings.bill_prefix.lower() in bill_id
    bill_number = int(bill_id.replace(settings.bill_prefix.lower(), ""))
    bill_to_add = None
    logging.info(f"Is MMD - {is_mmd} bill number:{bill_number}")
    if is_mmd:
        bill_to_add = Utils.get_bill_view_resp(rest_db.get_bills(bill_number)[0], settings)
    else:
        resp = Utils.get_nrs_bill(settings.store_id, bill_number, logger)
        if '"ticket"' in resp.text:
            parsed_resp = json.loads(resp.text)
            if len(parsed_resp["ticket"]) > 0:
                bill_to_add = parsed_resp
        else:
            logging.info("Resp is - {0} - {1}".format(resp.status_code, resp.text))

    if bill_to_add:
        logging.info(f"Bill to Add - {bill_to_add}")
        logging.info(f"Bill added - {rest_db.update_bills([bill_to_add], is_mmd)}")


input("Press any Key to close")
