import sys
import operator
sys.path.extend(['C:\\Users\\user\\Documents\\GitHub\\naturals'])

from RestDB import *
from datetime import datetime

if __name__ == '__main__':
    Utils.set_logging()
    restDB = RestDB()
    hand_over = False
    if len(sys.argv) > 1:
        hand_over = sys.argv[1].lower() == "handover"
    today_date = datetime.now().strftime('%Y%m%d')
    today_bills = restDB.get_by_key_value("date_num", today_date)
    today_bills.sort(key=operator.itemgetter("bill_no"))
    total_today_sales = 0
    total_cash = 0
    total_services = 0
    for bill in today_bills:
        bill_data = json.loads(bill['bill_data'])
        services = 0
        for service in bill_data['Ticket_Product_Details']:
            services += service["Qty"]
        total_today_sales += bill_data["Ticket"][0]['Total_WithoutTax']
        cash = 0
        if bill_data["Ticket_Details"][0]["PayType1"].lower() == 'cash':
            cash += bill_data["Ticket_Details"][0]["Tender1"]
        if bill_data["Ticket_Details"][0]["PayType2"]:
            if bill_data["Ticket_Details"][0]["PayType2"].lower() == 'cash':
                cash += bill_data["Ticket_Details"][0]["Tender2"]
        cash -= bill_data["Ticket_Details"][0]["ChangeAmt"]
        total_cash += cash
        total_services += services
        logging.debug("Bill-{0}: Total-{1}, Cash-{2}, "
                      "Services - {3} ::: {4}".format(bill['bill_no'], bill_data["Ticket"][0]['Total_WithoutTax'],
                                                      cash, services, "MMD" if bill["is_mmd"] else "LaSalon"))

    product_sales = 0
    if hand_over:
        logging.debug("*******************************")
        logging.debug("Total Cash till now is - {}".format(total_cash))
        logging.debug("*******************************")
        input("Press Enter to close")
    else:
        message = ["Date - *{0}*".format(datetime.now().strftime('%d-%m-%Y')),
                   "No of Clients - {0}".format(len(today_bills)),
                   "No of Services - {0}".format(total_services),
                   "Service Sales - {0}".format(int(total_today_sales)),
                   "Product Sales - {0}".format(product_sales),
                   "",
                   "Total Sales - *{0}*".format(int(total_today_sales+product_sales)),
                   "",
                   "Cash - {0}".format(total_cash),
                   "ABV - {0}".format(int((total_today_sales+product_sales)/len(today_bills))),
                   "", "Closing now, Good Night!!!"]
        Utils.send_whatsapp("", message)
