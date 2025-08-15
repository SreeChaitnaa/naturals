import socket
import time
import win32serviceutil
import win32service
import win32event
from multiprocessing.connection import Listener
import logging
import os

from MMDHandler import Utils
from RestDB import RestDB
from Settings import Settings


class MMDService(win32serviceutil.ServiceFramework):
    _svc_name_ = "MMDService"
    _svc_display_name_ = "MMDService"
    _svc_description_ = "For MMD Tasks"

    def __init__(self, args):
        super().__init__(args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.is_running = True

        # Logging
        log_path = os.path.join(os.path.dirname(__file__), "mmd_service.log")
        logging.basicConfig(
            filename=log_path,
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        logging.info("MMDService initialized.")

    def SvcStop(self):
        self.is_running = False
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        logging.info("MMDService stopping...")

    def SvcDoRun(self):
        logging.info("MMDService started.")
        self.main()

    def main(self):
        address = ('localhost', 6000)  # Only accessible locally
        listener = Listener(address, authkey=b'secret123')

        # Access the underlying socket to set a timeout
        listener._listener._socket.settimeout(1)  # wake every 1s

        while self.is_running:
            try:
                try:
                    conn = listener.accept()
                except socket.timeout:
                    continue  # timeout, check if still running

                logging.info(f"Connection accepted from {listener.last_accepted}")
                cmd = conn.recv()
                logging.info(f"Received command: {cmd}")

                if str(cmd).startswith("update_rest_db"):
                    cmd, store_id, bill_number = cmd.split(";")
                    settings = Settings(store_id=store_id)
                    logger = logging.getLogger()
                    rest_db = RestDB(settings.store_id, settings, logger)
                    Utils.update_rest_db(store_id, bill_number, logger, settings, rest_db)

                conn.close()

            except Exception as e:
                logging.error(f"Error: {e}")
                time.sleep(1)

        listener.close()
        logging.info("MMDService stopped.")


if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(MMDService)
