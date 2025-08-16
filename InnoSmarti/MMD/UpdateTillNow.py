import time
from multiprocessing.connection import Client
from Settings import Settings

settings = Settings()
print(f"Updating Bills for Store ID - {settings.store_id}")
print("*****Please open any NRS Bill in InnoSmarti with MMD before giving the Latest Bill IDs******")
mmd_bill = input("Enter Last MMD Bill Number - ")
if mmd_bill:
    conn = Client(('localhost', 6000), authkey=b'secret123')
    conn.send(f"update_rest_db;{settings.store_id};{mmd_bill}")
    conn.close()
    time.sleep(1)
    print("Update Request for MMD Bills is sent")

nrs_bill = input("Enter Last NRS Bill Number - ")
if nrs_bill:
    conn = Client(('localhost', 6000), authkey=b'secret123')
    conn.send(f"update_rest_db;{settings.store_id};{nrs_bill}")
    conn.close()
    time.sleep(1)
    print("Update Request for MMD Bills is sent")

input("Press any Key to close")
