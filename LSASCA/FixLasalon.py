import traceback
import sys
sys.path.extend(['C:\\Users\\user\\Documents\\GitHub\\naturals'])
from LSASCA.Utils import *

if __name__ == "__main__":
    try:
        Utils.set_logging()
        Utils.fix_things_for_las()

    except Exception as e1:
        logging.debug(e1)
        traceback.print_exc()
    finally:
        input("Just waiting for you to see above, click ENTER to close")
