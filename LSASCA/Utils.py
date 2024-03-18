import decimal
import datetime
import json
import logging
import os
import random
import shutil
import sys
import time

import psutil


class Strings(object):
    ticket_id = "TicketId"
    ticket_table = "Ticket"
    discount_table = "TblDiscDetails"
    comments = "Comments"
    mmd_selector = "mmd"
    sql_server = '.\sqlexpress'
    sql_db_name = 'salon'
    sql_user = 'sa'
    sql_password = 'Naturals#2016'
    bills_table = "bills"
    config_table = "config"
    config_last_bill_no = "last_bill_no"
    mmd_path = "E:\\Murali\\LSCA\\"
    sql_back_up_path = mmd_path + "MainBackup.bkp"
    sql_back_up_stacked_path = mmd_path + "StackedBackup.bkp"
    stacked_diff_bill_path = mmd_path + "Stacked_diff_bill_no"
    log_path = mmd_path + "MyLog.log"
    stop_file_path = mmd_path + "done.txt"
    running_file_path = mmd_path + "running.txt"
    not_reachable_hosts = mmd_path + "SCA\\hosts"
    reachable_hosts = mmd_path + "LS\\hosts"
    etc_hosts = "C:\\Windows\\System32\\drivers\\etc\\hosts"
    lasalon_urls = ['naturals.lasalon.in', 'owncloud.mousebizindia.com', 'vpn.lasalon.co.in']
    sql_back_process_name = 'SQLAutobackup.exe'
    local_clients_file = 'C:\\inetpub\\wwwroot\\known_clients.json'


class LSCAJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        if isinstance(o, datetime.date):
            return str(o)
        if isinstance(o, datetime.datetime):
            return str(o)
        return super(LSCAJSONEncoder, self).default(o)


class Utils(object):
    @staticmethod
    def set_logging(file_path=None):
        if file_path:
            logging.basicConfig(filename=file_path, filemode='a',
                                format='%(asctime)s - %(levelname)s - %(message)s', level=logging.DEBUG)
        else:
            logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.DEBUG)

    @staticmethod
    def is_mmd_bill(bill_data):
        if Strings.discount_table in bill_data:
            return Strings.mmd_selector in bill_data[Strings.discount_table][0][Strings.comments].lower()
        return False

    @staticmethod
    def print_cpn(bill_data):
        if Strings.discount_table in bill_data:
            disc_comment = bill_data[Strings.discount_table][0][Strings.comments].lower()
            return "plat" in disc_comment or "cpn" in disc_comment
        return False

    @staticmethod
    def run_sql_cmd(query):
        sql_cmd = 'sqlcmd -S "{0}" -U "{1}" -P "{2}" -Q "{3}"'
        sql_cmd = sql_cmd.format(Strings.sql_server, Strings.sql_user, Strings.sql_password, query)
        logging.debug("Running SQLCMD - {0}".format(sql_cmd))
        return os.system(sql_cmd) == 0

    @staticmethod
    def take_backup(new_bill_number=None):
        if os.path.exists(Strings.sql_back_up_path):
            if new_bill_number:
                Utils.push_last_backup_to_old(new_bill_number)
            else:
                if os.path.exists(Strings.sql_back_up_stacked_path):
                    logging.debug("Removing {0}".format(Strings.sql_back_up_stacked_path))
                    os.remove(Strings.sql_back_up_stacked_path)
            logging.debug("Removing {0}".format(Strings.sql_back_up_path))
            os.remove(Strings.sql_back_up_path)
        sql_query = "BACKUP DATABASE {0} TO DISK = '{1}'".format(Strings.sql_db_name, Strings.sql_back_up_path)
        Utils.run_sql_cmd(sql_query)
        if os.path.exists(Strings.sql_back_up_path):
            logging.debug("Backup success at {}".format(Strings.sql_back_up_path))
            return True
        return False

    @staticmethod
    def push_last_backup_to_old(next_bill_number):
        os.system("copy {0} {1} /Y".format(Strings.sql_back_up_path,
                                           Strings.sql_back_up_stacked_path))
        fw = open(Strings.stacked_diff_bill_path, "w")
        fw.write(str(next_bill_number))
        fw.close()

    @staticmethod
    def restore_database(use_stacked=False):
        backup_path = Strings.sql_back_up_stacked_path if use_stacked else Strings.sql_back_up_path
        sql_query = ("Alter database {0} set OffLINE with rollback immediate;"
                     "RESTORE DATABASE {0} FROM DISK = '{1}' WITH REPLACE;"
                     "Alter database {0} set ONLINE with rollback immediate").format(Strings.sql_db_name,
                                                                                     backup_path)
        if os.path.exists(Strings.sql_back_up_path):
            logging.debug("Restoring DB from {}".format(Strings.sql_back_up_path))
            return Utils.run_sql_cmd(sql_query)
        return False

    @staticmethod
    def make_las_not_reachable():
        logging.debug("Putting non reachable hosts")
        shutil.copy2(Strings.not_reachable_hosts, Strings.etc_hosts)
        os.system('taskkill /F /IM "{}"'.format(Strings.sql_back_process_name))

    @staticmethod
    def make_las_reachable():
        logging.debug("Putting reachable hosts")
        shutil.copy2(Strings.reachable_hosts, Strings.etc_hosts)

    @staticmethod
    def get_mmd_process():
        for p in psutil.process_iter():
            if "python" in p.name().lower():
                if 'RunMMD.pyw' in p.cmdline()[1]:
                    return p

    @staticmethod
    def is_mmd_running():
        if Utils.get_mmd_process():
            logging.debug("MMD is running")
            return True
        logging.debug("MMD is not running")
        return False

    @staticmethod
    def check_health():
        mmd_ok = True
        lasalon_ok = True
        text_file = open(Strings.etc_hosts, "r")
        hosts_content = text_file.read()
        text_file.close()
        for url in Strings.lasalon_urls:
            if url in hosts_content:
                logging.debug("{} is in etc hosts".format(url))
                lasalon_ok = False
            else:
                logging.debug("{} not in etc hosts".format(url))
                mmd_ok = False

        if Strings.sql_back_process_name not in (p.name() for p in psutil.process_iter()):
            logging.debug("SQLBackup is not running")
            lasalon_ok = False
        else:
            logging.debug("SQL backup is running")
            mmd_ok = False

        if os.path.exists(Strings.sql_back_up_path):
            logging.debug("SQL backup file exists")
        else:
            logging.debug("SQL backup file not exists")
            mmd_ok = False

        if not Utils.is_mmd_running():
            mmd_ok = False
        else:
            lasalon_ok = False

        status = 0
        print("\n\n***************************************************************************************************")
        if mmd_ok and not lasalon_ok:
            print("All good for MMD")
            status = 1
        elif lasalon_ok and not mmd_ok:
            print("All good for LaSalon")
            status = 2
        else:
            print("Something wrong, Contact MURALI quick, or run MMD or fixLasaon")
        print("***************************************************************************************************\n\n")
        return status

    @staticmethod
    def fix_things_for_las():
        mmd_proc = Utils.get_mmd_process()
        if mmd_proc:
            print("Wait...20Seconds....")
            time.sleep(20)
        mmd_proc = Utils.get_mmd_process()
        if mmd_proc:
            mmd_proc.kill()
        Utils.make_las_reachable()
        Utils.check_health()

    @staticmethod
    def remove_stop_mmd_file():
        if os.path.exists(Strings.stop_file_path):
            os.remove(Strings.stop_file_path)
        if os.path.exists(Strings.stacked_diff_bill_path):
            os.remove(Strings.stacked_diff_bill_path)

    @staticmethod
    def send_whatsapp(phone_no="", message=""):
        if isinstance(message, list):
            message = "\n".join(message)
        message = message.replace(" ", "%20").replace("\n", "%0a")
        if phone_no:
            os.system('start whatsapp://send?phone=+91{0}^&text={1}'.format(phone_no, message))
        else:
            os.system('start whatsapp://send?text={1}'.format(phone_no, message))

    @staticmethod
    def check_existing_mmd():
        if os.path.exists(Strings.running_file_path):
            logging.debug("MMD already running")
            sys.exit(-1)
        else:
            x = open(Strings.running_file_path, "w")
            x.write("Running")
            x.close()

    @staticmethod
    def generate_discount(bill_data):
        phone_no = bill_data['Ticket'][0]['ClientID'][-10:]
        bill_value = int(bill_data['Ticket'][0]['Total']/1.18)
        bill_value = max(750, bill_value + random.randint(90, 160))
        discount = random.randint(12, 18)
        cpn_name = "Flat {0}% discount on {1} or above".format(discount, bill_value)
        message = ["Naturals Thanisandra", "-----------------",
                   "Phone number - ", phone_no, "-----------------",
                   "Coupon - ", cpn_name, "", "Valid till - ",
                   str((datetime.date.today() + datetime.timedelta(days=60))),
                   "-----------------", "Can't be clubbed with other discounts or coupons",
                   "-----------------"]
        message = "\n".join(message)
        fpath = "C:\\Users\\user\\AppData\\Local\\Temp\\RandDiscount.txt"
        try:
            os.remove(fpath)
        except:
            pass
        fd = open(fpath, "w")
        fd.write(message)
        fd.close()
        os.startfile(fpath, "print")



