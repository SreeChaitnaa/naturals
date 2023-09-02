import sys
import operator
sys.path.extend(['C:\\Users\\user\\Documents\\GitHub\\naturals'])

from Utils import *

if __name__ == '__main__':
    Utils.set_logging()
    try:
        if Utils.check_health() != 1:
            raise Exception("MMD Not running, I cant work on Removing last bill")

        last_bill_number = input("Enter last Bill number to remove:")
        fw = open(Strings.stacked_diff_bill_path, "r")
        last_bill_as_per_stacked = fw.read()
        if str(last_bill_number) == last_bill_as_per_stacked:
            logging.debug("Last bill matched, will delete in 10sec...")
            Utils.restore_database(True)
            time.sleep(10)
            logging.debug("Removed as per me, Please check before use")
        else:
            logging.debug("Given - {0}, Known-{1}".format(last_bill_number, last_bill_as_per_stacked))
            logging.debug("SORRY, BILL NUMBER NOT MATCHING, CANT REMOVE")
    except Exception as e1:
        logging.error(e1)
    finally:
        logging.debug("STOP and START MMD AGAIN....")
        input("Press ENTER to close")
