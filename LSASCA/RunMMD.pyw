import traceback
import sys
sys.path.extend(['C:\\Users\\user\\Documents\\GitHub\\naturals'])
from LSASCA.SQLDB import SQLDB
from LSASCA.RestDB import RestDB
from LSASCA.Utils import *

if __name__ == "__main__":
    all_good = False
    try:
        Utils.set_logging(Strings.log_path)
        # Utils.set_logging()
        Utils.remove_stop_mmd_file()
        Utils.make_las_not_reachable()
        salon_db = SQLDB()
        rest_db = RestDB()
        Utils.take_backup()
        last_bill_number = int(rest_db.get_config(Strings.config_last_bill_no))
        last_bill_number_changed = False
        bills_after_last_bill = salon_db.get_new_bills(last_bill_number)
        for bill_num, bill_data in bills_after_last_bill.items():
            rest_db.add_bill(bill_num, bill_data)
            if last_bill_number < bill_num:
                last_bill_number_changed = True
                last_bill_number = bill_num
        if last_bill_number_changed:
            rest_db.set_config(Strings.config_last_bill_no, str(last_bill_number))

        while not os.path.exists(Strings.stop_file_path):
            new_bills = salon_db.get_new_bills(last_bill_number)
            last_bill_number_before_new_bills = last_bill_number
            if new_bills:
                is_mmd_bill = False
                for bill_num, bill_data in new_bills.items():
                    rest_db.add_bill(bill_num, bill_data)
                    is_mmd_bill = Utils.is_mmd_bill(bill_data)
                    if last_bill_number < bill_num:
                        last_bill_number = bill_num
                if len(new_bills) == 1 and is_mmd_bill:
                    logging.debug("MMD bill found, will replace backup in 60Sec")
                    time.sleep(60)
                    Utils.restore_database()
                    last_bill_number = last_bill_number_before_new_bills
                    logging.debug("Sleeping 30Sec, before talking to DB")
                    time.sleep(30)
                    salon_db = SQLDB()
                else:
                    Utils.take_backup()
                    rest_db.set_config(Strings.config_last_bill_no, str(last_bill_number))
            logging.debug("Waiting for 10sec for new bills")
            time.sleep(10)

        logging.debug("Stop file found")
        Utils.make_las_reachable()
        Utils.remove_stop_mmd_file()
        logging.debug("i am all good")
        all_good = True

    except Exception as e1:
        logging.debug(e1)
        traceback.print_exc()
    finally:
        if not all_good:
            Utils.make_las_reachable()
            Utils.remove_stop_mmd_file()
