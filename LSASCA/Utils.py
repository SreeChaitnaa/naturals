import decimal
import datetime
import json
import logging
import os
import shutil
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
    log_path = mmd_path + "MyLog.log"
    stop_file_path = mmd_path + "done.txt"
    not_reachable_hosts = mmd_path + "SCA\\hosts"
    reachable_hosts = mmd_path + "LS\\hosts"
    etc_hosts = "C:\\Windows\\System32\\drivers\\etc\\hosts"
    lasalon_urls = ['naturals.lasalon.in', 'owncloud.mousebizindia.com', 'vpn.lasalon.co.in']
    sql_back_process_name = 'SQLAutobackup.exe'


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
            return Strings.mmd_selector in bill_data[Strings.discount_table][0][Strings.comments]
        return False

    @staticmethod
    def run_sql_cmd(query):
        sql_cmd = 'sqlcmd -S "{0}" -U "{1}" -P "{2}" -Q "{3}"'
        sql_cmd = sql_cmd.format(Strings.sql_server, Strings.sql_user, Strings.sql_password, query)
        logging.debug("Running SQLCMD - {0}".format(sql_cmd))
        return os.system(sql_cmd) == 0

    @staticmethod
    def take_backup():
        if os.path.exists(Strings.sql_back_up_path):
            logging.debug("Removing {0}".format(Strings.sql_back_up_path))
            os.remove(Strings.sql_back_up_path)
        sql_query = "BACKUP DATABASE {0} TO DISK = '{1}'".format(Strings.sql_db_name, Strings.sql_back_up_path)
        Utils.run_sql_cmd(sql_query)
        if os.path.exists(Strings.sql_back_up_path):
            logging.debug("Backup success at {}".format(Strings.sql_back_up_path))
            return True
        return False

    @staticmethod
    def restore_database():
        sql_query = ("Alter database {0} set OffLINE with rollback immediate;"
                     "RESTORE DATABASE {0} FROM DISK = '{1}' WITH REPLACE;"
                     "Alter database {0} set ONLINE with rollback immediate").format(Strings.sql_db_name,
                                                                                     Strings.sql_back_up_path)
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
                if 'RunMMD.py' in p.cmdline()[1]:
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

        print("\n\n***************************************************************************************************")
        if mmd_ok and not lasalon_ok:
            print("All good for MMD")
        elif lasalon_ok and not mmd_ok:
            print("All good for LaSalon")
        else:
            print("Something wrong, Contact MURALI quick, or run MMD or fixLasaon")
        print("***************************************************************************************************\n\n")

    @staticmethod
    def fix_things_for_lasalon():
        print("Wait...")
        time.sleep(10)
        mmd_proc = Utils.get_mmd_process()
        if mmd_proc:
            mmd_proc.kill()
        Utils.make_las_reachable()
        Utils.check_health()




