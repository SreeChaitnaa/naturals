// reports.js

// ==== SHOP CONFIG (paste encrypted keys from Python output) ====
const shopConfig = {
  "TNS": {
    "url": "https://tns.marammuralidhar3234.workers.dev/rest/",
    "encKey": "ki62s6ktea89p72RjFNDDrqVjKrUUT9i7d78cup3kqCEK1KvuFaLDkY7PdjUrnT5S5eQzFF2/9FGDGrt3SflYA==",
    "name": "Thanisandra",
    "whatsapp_number": ["8722036021", "7829347636"]
  },
  "JKR": {
    "url": "https://jkr.marammuralidhar3234.workers.dev/rest/",
    "encKey": "Fr4R+Qu6i1p+hdfcmDrm4bywTHY/b863GlNnuA9p9uo3x5nnahlJqvssPOJRt1BcDXLw34a2rIrcT81DmMe7xQ==",
    "name": "Jakkur",
    "whatsapp_number": ["9743823134", "7892256106"]
  },
  "HRLR": {
    "url": "https://hrlr.marammuralidhar3234.workers.dev/rest/",
//    "url": "https://ylgharalur-be6e.restdb.io/rest/",
    "encKey": "bKuxUJfSNeOtp67m3v4WC39P+xPn/7a5QJNCYF1ogTW0OXSgOaxpNb+jvSBQq+93kZGHU3Bj87QFi9FAk7No+g==",
    "name": "Haralur",
//    "whatsapp_number": ["8073959696"]
    "whatsapp_number": ["8073959696", "9663233832"]
  },
  "ADYAR": {
    "url": "https://adyar-e5d4.restdb.io/rest/",
    "encKey": "TWmA4zjwdd3mWhsFEHnJmP9adh8snZ6+Bkx/VOXgoiUExZnhCAG53crsV3iu3TcRBn3i8TZ3ku/uvd+fBuMyMQ==",
    "name": "Adyar",
    "whatsapp_number": ["9591312316"]
  }
};

//  "HRLR": { "url": "https://ylghrlr-1795.restdb.io/rest/",
//    "encKey": "2BX/pNW9wc4beTsrRlfC8N1CGsgPK0AMLDJvWzivhHdfg2Wsn76QMwqdAHEUCy6dIxTLGEWQVGF9CRu2LnBWOw==" }
//  "HRLR": { "url": "https://ylgharalur-be6e.restdb.io/rest/",
//    "encKey": "bKuxUJfSNeOtp67m3v4WC39P+xPn/7a5QJNCYF1ogTW0OXSgOaxpNb+jvSBQq+93kZGHU3Bj87QFi9FAk7No+g==" }


table_columns = {
  "detailedBills" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'Price', 'Discount', 'NetSale', 'Tax', 'Gross', 'Services', 'ServiceDesc', 'EmpName', 'PaymentType', 'Cash', 'UPI', 'Card'],
  "bills" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'Services', 'Price', 'Discount', 'NetSale', 'Gross', 'PaymentType'],
  "services" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'ServiceName', 'EmpName', 'Price', 'Discount', 'NetSale', 'PaymentType', 'Section'],
  "employeeSales": ['Name', 'Bills', 'Services', 'Price', 'Discount', 'NetSale', 'ABV', 'ASB'],
  "callBacks": ['Phone', 'Name', 'Visits', 'BillsSummary', 'TotalNetSale', 'TicketID', 'ServiceDesc', 'EmpName', 'NetSale', 'Notes', 'Action'],
  "callBacksOnHold": ['Phone', 'Name', 'UpdatedDate', 'DueDate', 'Status', 'Notes', 'Action'],
  "dailyCash": ['Date', 'OpeningBalance', 'Cash', 'CashGiven', 'CashGivenTo', 'ChangeMissed', 'CashInBox'],
  "serviceWiseSales": ['Name', 'Count', 'Price', 'Discount', 'NetSale', 'Section', 'Providers']
};

table_click_links = {
  "callBacks": {
    "Phone": ["detailedAllBills", "Phone"]
  },
  "employeeSales": {
    "Name": ["services", "EmpName"]
  },
  "employeeSectionSales": {
    "Name": ["services", "EmpName"]
  },
  "serviceWiseSales": {
    "Name": ["services", "Name"],
    "Section": ["services", "Section"]
  },
  "sectionWiseSales": {
    "Name": ["services", "Section"]
  },
  "daywiseSales": {
    "Date": ["detailedBills", "Date"]
  },
  "detailedBills": {
    "TicketID": ["services", "TicketID"],
    "Phone": ["detailedAllBills", "Phone"]
  },
  "services": {
    "Phone": ["detailedAllBills", "Phone"],
    "Section": ["services", "Section"]
  },
  "bills": {
    "TicketID": ["services", "TicketID"],
    "Phone": ["detailedAllBills", "Phone"]
  },
  "detailedAllBills": {
    "Phone": ["detailedAllBills", "Phone"]
  },
  "callBacksOnHold": {
    "Phone": ["detailedAllBills", "Phone"]
  },
}

const moneyColumns = ['Tax', 'Gross', 'Cash', 'UPI', 'Card', "HomeBSC", "OtherBSC"]
const numericColumns = ['Price', 'Discount', 'NetSale', 'ABV', 'ASB', 'TotalNetSale', ...moneyColumns];
const excludeColumnsInSearchTable = ['PaymentType', ...moneyColumns];

employee_name_map = {
  "Guru": "Guru prasad",
  "Komati": "Komathi",
  "sarita": "Sarita",
  "Ritu": "Ritika",
  "Ali": "Lucky",
  "Mariya": "Rekha",
  'Mary': "mary L",
  'Kavya': "Ashwini",
  'Sneha': 'Suprita',
  'Toheed': "Sameer",
  "Bhanu": "Bhuvaneshwari",
  "Rahil": "Raheel",
  "bhuvaneshwari": "Bhuvaneshwari",
  "sajid": "Sajid",
  "sona": "Sona",
  "Margareat": "Meenakshi",
  "Ritika" : "Sharmila"
};

function is_ylg(){
  return ["HRLR", "ADYAR"].includes(shopSelect.value);
}

function get_emp_name(emp_name){
  return employee_name_map[emp_name.trim()] || emp_name.trim();
}

function get_ticket_id(ticket_id){
  return is_ylg() ? ticket_id.toLowerCase().replace("mmd", "") : ticket_id;
}

range_columns = ["Bills", "Services", 'Price', "Discount", "NetSale", "Tax", "Gross", "ABV", "ASB", "Cash", "UPI", "Card"];
daywise_reports = ["daywiseSales", "daywiseSplit", "daywiseNRSOnly"];
monthly_reports = ["monthlySales", "monthlySplit", "monthlyNRSOnly"];
paymode_reports = [...daywise_reports, ...monthly_reports, "detailedBills"]

daywise_reports.forEach(reportType => {
  table_columns[reportType] = ["Date"].concat(range_columns);
});
monthly_reports.forEach(reportType => {
  table_columns[reportType] = ["Month"].concat(range_columns);
});


sections_map = {
  "Pedi Mani": ["pedi", "mani", "reflexology", "Cut and Polish"],
  "Hair Coloring": ["grey coverage", "coloring", "highlight", "ammonia", "Root Touch", "colour"],
  "Hair Treatments": ["treatment", "botox", "keratin", "dandruf", "hairfall", "Fibre", "Botoplexx", "smooth", "HAIR FALL"],
  "Hair Spa & Massage": ["spa", "massage", "pro fiber", "rejuvenate", "frizz"],
  "Hair Cuts & Styles": ["cut", "blow", "beard", "bangs", "hair styl", "shave", "tongs", "hair do",
                        "change of styl", "conditioning", "ironing", "hair wash", "trim", "Shampoo and Condition"],
  "De-tan & Facials": ["facial", "ultimo", "fruit", "detan", "de-tan", "cleanup", "blaster", "bleach", "bliss",
                        "glow", "no tan", "hydration", "back polish", "kanpeki", "Skin Radiance", "Whitening",
                        "Under Eye", "add on mask"],
  "Threading & Waxing": ["thread", "wax", "peel", "half legs", "underarm", "sides"],
  "Makeup": ["saree", "nail", "makeup", "make-up", "polish", "updo"],
  "Membership": ["membership"],
  "Products": ["loreal", "prime", "acia oil", " shampoo", " mask", "masque", "acai", "conditioner", "face wash", "sensi bright"],
  "Other Combos": ["combo", "package"],
  "Others": []
}

table_columns["detailedAllBills"] = [...table_columns["detailedBills"]];
table_columns["sectionWiseSales"] = [...table_columns["serviceWiseSales"]];
table_columns["sectionWiseSales"].push("Services");
table_columns["employeeSectionSales"] = ["Name"];
Object.keys(sections_map).forEach(section_name => {table_columns["employeeSectionSales"].push(section_name)});

bill_reports = ["bills", "detailedBills", "detailedAllBills"];
non_group_reports = ["services", "bills", "detailedBills", "detailedAllBills", "callBacks", "callBacksOnHold", "dailyCash"];
never_call_again_list = ["Not Happy", "Moved Out of Town", "Never Call Again"];
non_shop_reports = ["bills", "daywiseSplit", "monthlySplit", "monthlyNRSOnly", "summaryNRSOnly", "daywiseNRSOnly"];
non_sum_row_reports = ["callBacks", "callBacksOnHold", "dailyCash"];

let db_config = {}
let db_url = "";
let db_headers = {};
let last_data = [];
let full_data = [];
let current_rows = [];
let all_bills = {};
let call_backs = {};
let services_config = {};
let servicesDict = {};
let employees_config = {};
let empNames = null;
let cash_rows = {};
let dt_table = null;
let store_view = true;
let all_emp_names = new Set();
let all_section_names = new Set();
let next_bill_number = null;


// ==== CRYPTO DECRYPT FUNCTION ====
function decryptApiKey(encryptedKey, password) {
  const raw = CryptoJS.enc.Base64.parse(encryptedKey);

  // Split salt (16 bytes), IV (16 bytes), ciphertext
  const salt = CryptoJS.lib.WordArray.create(raw.words.slice(0, 4), 16);
  const iv   = CryptoJS.lib.WordArray.create(raw.words.slice(4, 8), 16);
  const ciphertext = CryptoJS.lib.WordArray.create(raw.words.slice(8));

  // Derive key with PBKDF2
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 100000
  });

  // Decrypt with AES-CBC + PKCS7
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext },
    key,
    { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// ==== POPULATE SHOP DROPDOWN ====
window.onload = function() {
  for (const shop in shopConfig) {
    let opt = document.createElement("option");
    opt.value = shop;
    opt.textContent = shop;
    shopSelect.appendChild(opt);
  }
  resizeCanvas();

  document.querySelectorAll(".report-trigger").forEach(trigger_element => {
    trigger_element.addEventListener("change", fetchReport);
  });
  document.querySelectorAll(".cash-trigger").forEach(trigger_element => {
    trigger_element.addEventListener("change", calculate_cash_in_box);
  });

  const params = new URLSearchParams(window.location.search);
  const shopParam = params.get("shop");
  const pswParam = params.get("psw");
  const fromStore = params.get("from_store");
  store_view = fromStore == "true"
  if (pswParam) {
    loginDiv.style.display = "none"
    password.value = pswParam;
  }

  if (shopParam) {
    shopSelect.value = {"2339": "JKR", "1526": "TNS"}[shopParam] || shopParam;
    console.log("🔹 Default shop set from URL:", shopParam);
    shopSelectDiv.style.display = "none"
  }

  if(!store_view) {
    btn_export_csv.style.display = "block";
  }
  else{
    non_shop_reports.forEach(option_to_remove => {
      for (let i = 0; i < reportTypeSelector.options.length; i++) {
        if (option_to_remove == reportTypeSelector.options[i].value) {
          reportTypeSelector.remove(i);
          break;
        }
      }
    });
  }
  if (pswParam) {
    login();
  }
};

function set_from_date_to_month_beginning(today) {
  today = (new Date(today.getTime() - 330 * 60000));
  fromDatePicker.value = (new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))).toISOString().split('T')[0];
}

function getSection(serviceName) {
  const lowerService = serviceName.toLowerCase();

  for (const [section, keywords] of Object.entries(sections_map)) {
    if (keywords.some(keyword => lowerService.includes(keyword.toLowerCase()))) {
      return section;
    }
  }
  return "Others";
}

function get_yesterday_date_num(today_date) {
  const yesterday = new Date(today_date);
  yesterday.setDate(yesterday.getDate() - 1);
  return parseInt(yesterday.toISOString().split('T')[0].replace(/-/g, ""), 10)
}

function reset_date_pickers(){
  const today = get_ist_date();
  toDatePicker.value = today.toISOString().split('T')[0];
  set_from_date_to_month_beginning(today);
}

function get_ist_date(){
  const nowUtc = new Date();
  return new Date(nowUtc.getTime() + 330 * 60000);
}

// ==== LOGIN HANDLER ====
function login() {
  spinnerOverlay.style.display = "flex";
  const shop = shopSelect.value;
  const passwd = password.value;

  try {
    const encKey = shopConfig[shop].encKey;
    db_url = shopConfig[shop].url;
    const apiUrl = db_url + "config";
    const db_apiKey = decryptApiKey(encKey, passwd);

    if (!db_apiKey) throw "Bad password";
    db_headers = {
      headers: {
        "Content-Type": "application/json",
        "x-apikey": db_apiKey,
        "cache-control": "no-cache"
      }
    }

    // Test fetch
    fetch(apiUrl, db_headers)
    .then(res => {
      console.log(res);
      if (res.status === 429) {
        return res.json().then(errData => {
          // Example: "Try again in 0:22:57 hrs:min:sec."
          const match = errData.msg.match(/(\d+):(\d+):(\d+)/);
          if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const seconds = parseInt(match[3], 10);

            const now = new Date();
            const unblockTime = new Date(now.getTime() +
              (hours * 3600 + minutes * 60 + seconds) * 1000
            );

            // Format date and time in 12h with AM/PM
            const options = {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            };
            const formattedDateTime = unblockTime.toLocaleString(undefined, options);

            alert(
              `⚠️ DB Requests limit hit!\n${errData.msg}\n\n` +
              `You can retry after: ${formattedDateTime}`
            );
          } else {
            alert(`⚠️ DB Requests limit hit!\n${errData.msg}\n\nContact Murali with this Error Message`);
          }
          return null; // Stop further processing
        });
      }
      console.log(res);
      if (!res.ok) throw "Login failed - " + res.status;
      return res.json();
    })
    .then(data => {
      if (data == null) {return};
      console.log(data);
      loginDiv.style.display = "none";
      document.title = shopConfig[shop].name;

      if(is_ylg()){
        ["HomeBSC", "OtherBSC"].forEach(bsc => {
          paymode_reports.forEach(tblType => { table_columns[tblType].push(bsc) });
        });
      }

      daywise_reports.forEach(reportType => {
        table_columns[reportType].push("NewClients");
      });

      document.querySelectorAll(".ylgOnly").forEach(item => { item.style.display = is_ylg() ? "block" : "none" });
      document.querySelectorAll(".nrsOnly").forEach(item => { item.style.display = is_ylg() ? "none" : "block" });

      // Simple render for debugging
      console.log("✅ Data:", data);
      data.forEach(row => {
        db_config[row["config_name"]] = row["config_value"];
        if (row["config_name"] == "callback"){
          call_backs = row;
        }
        if (row["config_name"] == "services"){
          services_config = row;
          servicesDict = services_config["config_value"];
        }
        if (row["config_name"] == "employees"){
          employees_config = row;
          empNames = employees_config["config_value"];
        }
      });
      reset_date_pickers();
      fetch(db_url + "daysales", db_headers).then(data_res => {
        return data_res.json();
      }).then(data_response => {
        full_data = data_response;
        populate_all_bills()

        populateSearchLists();

        full_data.forEach(day_sale => {
          cash_data = day_sale["cashdata"];
          if (cash_data){
            cash_rows[day_sale["datenum"]] = cash_data;
          }
        });
        fetchReport();
        dataDiv.style.display = "block";
        spinnerOverlay.style.display = "none";
      });
    })
    .catch(err => {
      loginError.textContent = `Invalid password or API key - ${err.message}`;
      spinnerOverlay.style.display = "none";
      console.log(err);
      alert(`Invalid password or API key - ${err.message}`);
    });
  } catch (e) {
    console.log(e);
    loginError.textContent = `Invalid password - ${e}`;
    alert(`Invalid password - ${e}`);
    spinnerOverlay.style.display = "none";
  }
}

function populate_all_bills() {
  all_bills = {};
  max_bill_id = 1;
  formatReportData(full_data, "bills").forEach(bill_entry => {
    if (!(bill_entry.Phone in all_bills)){
      all_bills[bill_entry.Phone] = {"bills": [], "last_bill_date": null};
    }
    all_bills[bill_entry.Phone]["bills"].push(bill_entry);
    all_bills[bill_entry.Phone]["last_bill_date"] = bill_entry.Date;

    if(bill_entry.TicketID > max_bill_id) {
      max_bill_id = bill_entry.TicketID;
    }
  });
  next_bill_number = parseInt(max_bill_id) + 1;
}

function calcPayments(payments) {
  let cash = 0, upi = 0, card = 0, home_bsc = 0, other_bsc = 0;
  const payment_types = new Set();
  payments.forEach(p => {
    const mode = (p.ModeofPayment || "").toLowerCase();
    if (mode === "cash") {
      payment_types.add("Cash")
      cash += (p.Tender || 0) - (p.ChangeAmt || 0);
    } else if (mode === "ewallet") {
      payment_types.add("UPI")
      upi += p.Tender || 0;
    } else if (mode === "otherbsc") {
      payment_types.add("OtherBSC")
      other_bsc += p.Tender || 0;
    } else if (mode.indexOf("bsc") > -1) {
      payment_types.add("HomeBSC")
      home_bsc += p.Tender || 0;
    } else {
      payment_types.add("Card")
      card += p.Tender || 0;
    }
  });
  payment_type = Array.from(payment_types).join("/")
  return { cash, upi, card, home_bsc, other_bsc, payment_type };
}

function calcTickets(tickets) {
  let servicesCount = 0;
  let discountSum = 0;
  let priceSum = 0;
  const serviceNames = [];
  const empNamesSet = new Set();
  emp_sale = {};
  section_sale = {};

  tickets.forEach(item => {
    discount = item.DiscountAmount || 0
    discountSum += discount;
    price = item.Qty * (item.Price || 0)
    priceSum += price;
    netSale = price - discount;
    servicesCount += item.Qty || 0;
    serviceNames.push(item.ServiceName);
    emp_name = get_emp_name(item.empname);
    empNamesSet.add(emp_name);
    if(!emp_sale[emp_name]){
      emp_sale[emp_name] = 0;
    }
    emp_sale[emp_name] += netSale;
    section_name = getSection(item.ServiceName);
    if(!section_sale[section_name]){
      section_sale[section_name] = 0;
    }
    section_sale[section_name] += netSale;
    all_emp_names.add(emp_name);
    all_section_names.add(section_name);
  });
  netSalesSum = priceSum - discountSum

  return { servicesCount, priceSum, discountSum, netSalesSum, serviceNames, empNamesSet, emp_sale, section_sale };
}

function is_call_back_on_hold(call_back_data){
  const today = get_ist_date();
  today_string = today.toISOString().split('T')[0];
  return never_call_again_list.includes(call_back_data.Status) || (call_back_data.DueDate > today_string);
}

function formatReportData(rawData, reportType) {
  const grouped = {};
  const direct_rows = [];

  if (reportType == "callBacks"){
    const today = get_ist_date();
    today_string = today.toISOString().split('T')[0];
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const fortyFiveDaysAgo = new Date(today);
    fortyFiveDaysAgo.setDate(today.getDate() - 45);

    Object.values(all_bills).filter(entry => {
      const entryDate = new Date(entry.last_bill_date);
      return entryDate >= oneYearAgo && entryDate <= fortyFiveDaysAgo;
    }).forEach(selected_entry => {
      row = selected_entry.bills.at(-1);
      row.Notes = "";
      row.TotalNetSale = 0;
      row.Visits = selected_entry.bills.length;
      row.BillsSummary = [];
      selected_entry.bills.forEach(bill => {
        row.BillsSummary.push(bill.Date + " : " + bill.NetSale);
        row.TotalNetSale += bill.NetSale;
      });
      row.BillsSummary = row.BillsSummary.join("<br />");
      if (row.Phone in call_backs["config_value"]) {
        call_back_data = call_backs["config_value"][row.Phone]
        if (is_call_back_on_hold(call_back_data)) {
          return;
        }
        else {
          row.Notes = call_back_data.DueDate + "<br />" + call_back_data.Status + " : " + call_back_data.Notes;
        }
      }
      row.Action = "Update";
      direct_rows.push(row);
    });
  }
  else if (reportType == "callBacksOnHold"){
    Object.entries(call_backs["config_value"]).forEach(function([phone_num, call_back_data]) {
      if(is_call_back_on_hold(call_back_data)) {
        row = {...call_back_data};
        row.Phone = phone_num;
        row.Action = "Delete";
        direct_rows.push(row);
      }
    });
  }
  else if (reportType == "dailyCash"){
    rawData.forEach(day => {
      if(day["cashdata"]){
        row = {...day["cashdata"]};
        const str = day["datenum"].toString();
        row.Date = str.slice(0, 4) + "-" + str.slice(4, 6) + "-" + str.slice(6, 8);
        direct_rows.push(row);
      }
    });
  }
  else {
    rawData.forEach(day => {
      const bills = day.bills || [];
      gst_percent = day.datenum > 20250921 ? 0.05 : 0.18;
      bills.forEach(bill => {
        // Format date -> YYYY-MM-DD
        const [datePart, timePart] = bill.TimeMark.split(" ");
        if (reportType.endsWith("NRSOnly") && bill.mmd) return;
        const { cash, upi, card, home_bsc, other_bsc, payment_type } = calcPayments(bill.payment);

        if (non_group_reports.includes(reportType)) {
          if (reportType === "services") {
            bill.ticket.forEach(service => {
              for (let i = 0; i < service.Qty; i++) {
                row = {
                  TicketID: get_ticket_id(bill.TicketID),
                  Date: datePart,
                  Time: timePart,
                  Phone: bill.Phone,
                  Name: bill.Name,
                  ServiceID: service.ServiceID,
                  ServiceName: service.ServiceName,
                  Price: service.Price,
                  Discount: (service.DiscountAmount / service.Qty),
                  NetSale: service.Price - (service.DiscountAmount / service.Qty),
                  EmpName: get_emp_name(service.empname),
                  PaymentType: payment_type,
                  Section: getSection(service.ServiceName),
                  GSTPercent: gst_percent
                };
                direct_rows.push(row)
              }
            });
          } else if (bill_reports.includes(reportType)) {
            const { servicesCount, priceSum, discountSum, netSalesSum, serviceNames, empNamesSet } = calcTickets(bill.ticket);

            row = {
              TicketID: get_ticket_id(bill.TicketID),
              Date: datePart,
              Time: timePart,
              Phone: bill.Phone,
              Name: bill.Name,
              Price: priceSum,
              Discount: discountSum,
              NetSale: netSalesSum,
              Tax: netSalesSum * gst_percent,
              Gross: netSalesSum * (1 + gst_percent),
              Services: servicesCount,
              ServiceDesc: serviceNames.join("/"),
              EmpName: Array.from(empNamesSet).join("/"),
              PaymentType: payment_type,
              Cash: cash,
              UPI: upi,
              OtherBSC: other_bsc,
              HomeBSC: home_bsc,
              Card: card,
              GSTPercent: gst_percent
            };
            direct_rows.push(row)
          }
        } else if (reportType === "employeeSales") {
          const emp_in_bill = new Set();
          bill.ticket.forEach(service => {

            let key = get_emp_name(service.empname);
            emp_in_bill.add(key)
            if (!grouped[key]) {
              grouped[key] = {
                Name: key,
                Bills: 0,
                Services: 0,
                Price: 0,
                Discount: 0,
                NetSale: 0,
                ABV: 0,
                ASB: 0,
                GSTPercent: gst_percent
              };
            }

            const row = grouped[key];
            row.Services += service.Qty;
            row.Price += service.Qty * service.Price;
            row.Discount += service.DiscountAmount;
            row.NetSale += (service.Qty * service.Price) - service.DiscountAmount;
          });
          emp_in_bill.forEach(empName => {
              grouped[empName].Bills += 1;
          });
        } else if (reportType === "employeeSectionSales") {
          bill.ticket.forEach(service => {
            let key = get_emp_name(service.empname);
            if (!grouped[key]) {
              grouped[key] = {};
              table_columns["employeeSectionSales"].forEach(section_name => {
                grouped[key][section_name] = 0;
              });
              grouped[key]["Name"] = key;
            }
            emp_sec_name = getSection(service.ServiceName);
            grouped[key][emp_sec_name] += (service.Qty * service.Price) - service.DiscountAmount;
          });
          Object.keys(grouped).forEach(emp_name => {
            Object.keys(grouped[emp_name]).forEach(emp_sec_name => {
              if (emp_sec_name == "Name"){ return }
              grouped[emp_name][emp_sec_name] = parseInt(grouped[emp_name][emp_sec_name]);
            });
          });
        } else if (["serviceWiseSales", "sectionWiseSales"].includes(reportType)) {
          bill.ticket.forEach(service => {
            key = reportType == "sectionWiseSales" ? getSection(service.ServiceName) : service.ServiceName;
            if (!grouped[key]) {
              grouped[key] = {
                Name: key,
                Count: 0,
                Price: 0,
                Discount: 0,
                NetSale: 0,
                Services: new Set(),
                Providers: new Set(),
                Section: getSection(key),
                GSTPercent: gst_percent
              };
            }

            const row = grouped[key];
            row.Count += service.Qty;
            row.Services.add(service.ServiceName);
            row.Price += service.Qty * service.Price;
            row.Discount += service.DiscountAmount;
            row.NetSale += (service.Qty * service.Price) - service.DiscountAmount;
            row.Providers.add(get_emp_name(service.empname))
          });
        } else {
          let key = datePart;
          if (reportType.startsWith("monthly")) {
            key = datePart.slice(0, 7);
          }
          if (reportType.endsWith("Split")) {
            key += "-" + (bill.mmd ? "SCA" : "NRS");
          }
          if (!grouped[key]) {
            grouped[key] = {
              Date: key,
              Month: key,
              Bills: 0,
              Services: 0,
              Price: 0,
              Discount: 0,
              NetSale: 0,
              Tax: 0,
              Gross: 0,
              ABV: 0,
              ASB: 0,
              Cash: 0,
              UPI: 0,
              OtherBSC: 0,
              HomeBSC: 0,
              Card: 0,
              NewClients: 0,
              EmpSale: {},
              SectionSale: {},
              GSTPercent: gst_percent
            };
          }

          const row = grouped[key];

          const { servicesCount, priceSum, discountSum, netSalesSum, emp_sale, section_sale } = calcTickets(bill.ticket);

          row.Bills += 1;
          row.Services += servicesCount;
          row.Price += priceSum;
          row.Discount += discountSum;
          row.NetSale += netSalesSum;
          row.Cash += cash;
          row.UPI += upi;
          row.OtherBSC += other_bsc;
          row.HomeBSC += home_bsc;
          row.Card += card;
          row.NewClients += all_bills[bill.Phone]["bills"].length == 1? 1:0;
          Object.entries(emp_sale).forEach(([emp_name, emp_net_sale]) => {
            if(!row.EmpSale[emp_name]){
              row.EmpSale[emp_name] = 0;
            }
            row.EmpSale[emp_name] += emp_net_sale;
          });
          Object.entries(section_sale).forEach(([section_name, section_net_sale]) => {
            if(!row.SectionSale[section_name]){
              row.SectionSale[section_name] = 0;
            }
            row.SectionSale[section_name] += section_net_sale;
          });
        }
      });
    });
  }

  let rows = Object.values(grouped);
  if (non_group_reports.includes(reportType)) {
    rows = direct_rows
    if (reportType === "callBacks") {
      rows.sort((a, b) => (a.NetSale < b.NetSale ? 1 : -1));
    } else {
      rows.sort((a, b) => {
        if (a.Date === b.Date) {
          return a.Time > b.Time ? 1 : -1;
        }
        return a.Date > b.Date ? 1 : -1;
      });
    }
  }
  else {
    if (["serviceWiseSales", "sectionWiseSales"].includes(reportType)){
      rows.forEach(row => {
        row.Providers = Array.from(row.Providers).join("/");
        row.Services = Array.from(row.Services).join("/");
      });
    } else {
      rows.forEach(row => {
        row.Tax = row.NetSale * row.GSTPercent;
        row.Gross = row.NetSale + row.Tax;
        row.ABV = row.Bills > 0 ? parseFloat((row.NetSale / row.Bills).toFixed(2)) : 0;
        row.ASB = row.Bills > 0 ? parseFloat((row.Services / row.Bills).toFixed(2)) : 0;
      });
    }
    if (["employeeSales", "serviceWiseSales", "sectionWiseSales", "employeeSectionSales"].includes(reportType)) {
      rows.sort((a, b) => (a.Name > b.Name ? 1 : -1));
    } else {
      rows.sort((a, b) => (a.Date > b.Date ? 1 : -1));
    }
  }
  return rows;
}

function get_empty_table(table_id){
  return '<table id="' + table_id + '" class="display"><thead><tr></tr></thead><tbody></tbody></table>'
}

function fill_table_with_data(reportType, in_dialog=false, search_key=null, search_value=null)
{
  dataTable.style.display = 'block';
  chartsDiv.style.display = 'none';
  rows = formatReportData(reportType.includes("All") ? full_data : last_data, reportType);
  current_rows = [...rows];
  dialog_rows = [];
  if(in_dialog) {
    searchTableHolder.innerHTML = get_empty_table("dataTableInDialog");
    rows.forEach(row => {
      if(row[search_key] == search_value){
        dialog_rows.push(row);
      }
    });
  }
  else {
    tableHolder.innerHTML = get_empty_table("dataTable");
  }
  data_keys = [];
  table_columns[reportType].forEach(col_name => {
    if (in_dialog && excludeColumnsInSearchTable.includes(col_name)) { return; }
    data_keys.push(col_name);
  });
  if (!non_sum_row_reports.includes(reportType)) {
    sum_row = {};
    data_keys.forEach(dk => { sum_row[dk] = 0 });
    (in_dialog ? dialog_rows : rows).forEach(item => {
      data_keys.forEach(dk => {
        dk_value = item[dk]
        if (typeof dk_value === 'number' && !isNaN(dk_value)) {
          sum_row[dk] += dk_value;
        }
        else{
          sum_row[dk] = "-";
        }
      });
    });

    sum_row[data_keys[0]] = "Total";
    data_keys.forEach(dk => {
      dk_value = sum_row[dk];
      if (dk == "ABV") {
        dk_value = parseFloat((sum_row["NetSale"] / sum_row["Bills"]).toFixed(2));
      }
      if (dk == "ASB") {
        dk_value = parseFloat((sum_row["Services"] / sum_row["Bills"]).toFixed(2));
      }
      sum_row[dk] = dk_value;
    });
    (in_dialog ? dialog_rows : current_rows).push(sum_row);
  }

  dt_id = in_dialog ? "#dataTableInDialog" : '#dataTable';

  // If DataTable already exists, destroy it
  if ($.fn.DataTable.isDataTable(dt_id)) {
      $(dt_id).DataTable().clear().destroy();
  }

  // Reinitialize DataTables
  tableSearch.value = "";
  dt_table = $(dt_id).DataTable({
    destroy: true, // reset old table
    data: in_dialog ? dialog_rows : current_rows,    // array of objects
    columns: data_keys.map(key => ({
      data: key,
      title: key,
      className: numericColumns.includes(key) ? 'dt-right' : ''
    })), // strictly use keys
    paging: false,
    ordering: true,
    searching: true,
    dom: 'rt',            // No Search in Table
    order: [],
    columnDefs: [
      {
        targets: "_all",
        render: function (data, type, row, meta) {
          // get column name (the key from data_keys)
          let colName = meta.settings.aoColumns[meta.col].data;

          // Example: numeric formatting
          if (numericColumns.includes(colName)) {
            return Number(data).toFixed(2);
          }

          if(in_dialog){
            return data;
          }

          if(row[data_keys[0]] == "Total"){
            return data;
          }

          // Example: special handling for Action column
          if (colName === "Action") {
            if (reportType === "callBacks") {
              return `<button class="gray-button" onclick="openCallbackDialog('${row.Phone}','${row.Name}')">${data}</button>`;
            } else if (reportType === "callBacksOnHold") {
              return `<button class="gray-button" onclick="deleteCallBackData('${row.Phone}')">${data}</button>`;
            }
          }

          if(table_click_links[reportType]){
            let goto_data = table_click_links[reportType][colName]
            if(goto_data){
              return `<span style="cursor:pointer; color:blue;"
                       onclick="open_selection('${goto_data[0]}','${goto_data[1]}','${data}')">${data}</span>`;
            }
          }

          // default: just return the value
          return data;
        }
      }
    ],
    createdRow: function (row, data, dataIndex) {
      if (data[data_keys[0]] === "Total") {
        $(row).css({
          "background-color": "grey",
          "font-weight": "bold",
          "color": "white"
        });
      }
    },
    rowCallback: function(row, data, displayIndex){
      // If it's the Total row, keep it visually at bottom by adding a special class
      if(data[data_keys[0]] === "Total"){
        $(row).addClass('total-row');
      }
    },
    drawCallback: function(settings){
      // Move the Total row to the bottom after each draw
      const api = this.api();
      const $table = $(api.table().node());
      const $totalRow = $table.find('tr.total-row');
      $totalRow.appendTo($table.find('tbody'));
    }
  });

  $('#searchTableSearch').on('keyup', function() {
    dt_table.search(this.value).draw();
  });
  $('#tableSearch').on('keyup', function() {
    dt_table.search(this.value).draw();
  });
}

function open_selection(reportType, search_key, search_value){
  searchTableSearch.value = "";
  fill_table_with_data(reportType, true, search_key, search_value);
  report_name = reportTypeSelector.querySelector(`option[value="${reportType}"]`).text;
  searchDetailsSpan.innerHTML = `Showing details for ${search_key}:<b>${search_value}</b> from ${report_name}`;
  searchTableModel.style.display = "block";
}

function send_wa_over_link(text, phone_num=null){
  wa_link = "https://api.whatsapp.com/send/?";
  if(phone_num != null){
    wa_link = wa_link + "phone=91" + phone_num + "&";
  }
  wa_link = wa_link + "text=" + text.replace(/ /g, "%20").replace(/\n/g, "%0a");
  window.open(wa_link, '_blank');
}

function send_whatsapp(text, phone_num=null){
  fetch("http://localhost:3000/send", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({"number":"91"+phone_num, "message":text}) // full record with updated field
  })
  .then(response => {
    if(response.status === 200){
      alert(`Sent Whatsapp to ${phone_num} Successfully`);
    }
    else {
      send_wa_over_link(text);
      console.log(`Error while sending Whatsapp update - ${response.status}`);
    }
  })
  .catch(err => {
    send_wa_over_link(text);
    console.log(`Error while sending Whatsapp update - ${err}`);
  });
}

function fetchReport() {
  const fromDate = fromDatePicker.value;
  const toDate = toDatePicker.value;
  const reportType = reportTypeSelector.value || "daywiseNRSOnly";

  if (!fromDate || !toDate) {
      return;
  }

  const startDateNum = parseInt(fromDate.replace(/-/g, ""), 10);
  const endDateNum = parseInt(toDate.replace(/-/g, ""), 10);

  try {
    last_data = [];
    full_data.forEach(date_entry => {
      if((startDateNum <= date_entry["datenum"] && date_entry["datenum"] <= endDateNum) || reportType.includes("All")){
        last_data.push(date_entry);
      }
    });
    if(last_data.length == 0 && !reportType.includes("callBacks")){
      alert(`No Sale data available between ${fromDate} and ${toDate}`);
      return;
    }
    if (reportType.includes("summary")){
      fill_charts(reportType);
      searchDiv.style.display = 'none';
    } else {
      fill_table_with_data(reportType);
      searchDiv.style.display = 'block';
    }

  } catch (error) {
    console.error(`Failed to fetch data:`, error);
    alert(`Could not fetch report. Please try again.`);
  }
}

function fill_charts(reportType){
  dataTable.style.display = 'none';
  chartsDiv.style.display = 'block';
  report_to_use = reportType.endsWith("NRSOnly") ? "daywiseNRSOnly" : "daywiseSales";
  current_day_wise = formatReportData(last_data, report_to_use);
  labels = [];
  daily_chart_expected = [];
  daily_chart_actual = [];
  growth_chart_expected = [];
  growth_chart_actual = [];
  total_clients = [];
  new_clients = [];
  growth_expected = 0;
  growth_actual = 0;
  last_date_pushed = null;
  emp_sale_dict = {};
  all_emp_names.forEach(emp_name => {emp_sale_dict[emp_name] = []});
  section_sale_dict = {};
  all_section_names.forEach(section_name => {section_sale_dict[section_name] = []});
  current_day_wise.forEach(day_sale => {
    labels.push(formatToMonthDay(day_sale.Date));
    last_date_pushed = day_sale.Date;
    exp_value = parseInt(db_config[getDayOfWeek(day_sale.Date)], 10);
    if(reportType.endsWith("NRSOnly")){
      exp_value = exp_value / 2;
    }
    daily_chart_expected.push(exp_value);
    daily_chart_actual.push(day_sale.NetSale);
    growth_expected += exp_value
    growth_actual += day_sale.NetSale
    growth_chart_expected.push(growth_expected);
    growth_chart_actual.push(growth_actual);
    total_clients.push(day_sale.Bills);
    new_clients.push(day_sale.NewClients);
    all_emp_names.forEach(emp_name => { emp_sale_dict[emp_name].push(day_sale.EmpSale[emp_name] || 0); });
    all_section_names.forEach(sec_name => { section_sale_dict[sec_name].push(day_sale.SectionSale[sec_name] || 0); });
  });

  total_called_dict = {}
  rejected_count_dict = {}
  labels.forEach(label => {
    total_called_dict[label] = 0;
    rejected_count_dict[label] = 0;
  });

  getRemainingDates(last_date_pushed).forEach(remaining_day => {
    labels.push(formatToMonthDay(remaining_day));
    exp_value = parseInt(db_config[getDayOfWeek(remaining_day)], 10);
    if(reportType.endsWith("NRSOnly")){
      exp_value = exp_value / 2;
    }
    daily_chart_expected.push(exp_value);
    growth_expected += exp_value
    growth_chart_expected.push(growth_expected);
  });

//  label1="Expected", label2="Actual"

  datasets = [{"label": "Expected", "data": daily_chart_expected}, {"label": "Actual", "data": daily_chart_actual}];
  createReportChart('dailyChart', labels, "Day wise Target", datasets);

  datasets = [{"label": "Expected", "data": growth_chart_expected}, {"label": "Actual", "data": growth_chart_actual}];
  createReportChart('growthChart', labels, "Total Target", datasets);

  datasets = [{"label": "Total", "data": total_clients}, {"label": "New", "data": new_clients}];
  createReportChart('clientsChart', labels, "Clients Trend", datasets);

  Object.entries(call_backs["config_value"]).forEach(function([phone_num, call_back_data]) {
    called_date = formatToMonthDay(call_back_data.UpdatedDate);
    total_called_dict[called_date] += 1;
    if(never_call_again_list.includes(call_back_data.Status)){
      rejected_count_dict[called_date] += 1;
    }
  });

  datasets = [{"label": "Total Called", "data": Object.values(total_called_dict)},
              {"label": "Rejected to Visit", "data": Object.values(rejected_count_dict)}];
  createReportChart('callBackChart', labels, "Callback Trend", datasets);

  datasets = [];
  Object.entries(emp_sale_dict).forEach(([emp_name, emp_sales_trend]) => {
    emp_sum = emp_sales_trend.reduce((a, v) => a + v, 0);
    if (emp_sum > 0) {
      datasets.push({"label": emp_name, "data": emp_sales_trend, "sum": emp_sum});
    }
  });
  datasets = datasets.sort((a, b) => b.sum - a.sum);
  top_datasets = datasets.slice(0, 3);
  low_datasets = datasets.slice(-3)
  createReportChart('empSaleChartTop', labels, "Employee Sale Trend (Top Performers)", top_datasets);
  createReportChart('empSaleChartLow', labels, "Employee Sale Trend (Low Performers)", low_datasets);

  datasets = [];
  Object.entries(section_sale_dict).forEach(([section_name, section_sales_trend]) => {
    section_sum = section_sales_trend.reduce((a, v) => a + v, 0);
    if (section_sum > 0) {
      datasets.push({"label": section_name, "data": section_sales_trend, "sum": section_sum});
    }
  });
  datasets = datasets.sort((a, b) => b.sum - a.sum);
  top_datasets = datasets.slice(0, 3);
  low_datasets = datasets.slice(-3)
  createReportChart('sectionSaleChartTop', labels, "Sections Sale Trend (Top Performers)", top_datasets);
  createReportChart('sectionSaleChartLow', labels, "Sections Sale Trend (Low Performers)", low_datasets);
}

function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  let day = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // shift so Monday = 1, ..., Sunday = 7
  return "day_" + (day === 0 ? 7 : day);
}

function formatToMonthDay(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);

  // Local date, no UTC shift
  const date = new Date(year, month - 1, day);

  const options = { month: "short" }; // "Jan", "Feb", ...
  const monthName = date.toLocaleString("en-US", options);

  return `${monthName}-${String(day).padStart(2, "0")}`;
}

function getRemainingDates(dateStr) {
  // Parse manually to avoid UTC shift
  const [year, month, day] = dateStr.split("-").map(Number);

  const givenDate = new Date(year, month - 1, day); // local date
  const lastDay = new Date(year, month, 0).getDate(); // last day of this month

  const remainingDates = [];

  // Start from the NEXT day
  for (let d = day + 1; d <= lastDay; d++) {
    const current = new Date(year, month - 1, d);
    remainingDates.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
    );
  }

  return remainingDates;
}

function createReportChart(canvasId, labels, title, data_points) {
  const existingChart = Chart.getChart(canvasId); // use canvas ID here

  if (existingChart) {
    existingChart.destroy(); // destroy old chart
  }

  const ctx = document.getElementById(canvasId).getContext("2d");

  colors_in_reverse_order = ["navy", "brown", "indigo", "magenta", "teal", "purple", "red", "orange", "green", "blue"];
  datasets = []
  fill = data_points.length <= 2;
  data_points.forEach(data_point => {
    dataset = {...data_point};
    dataset["borderColor"] = colors_in_reverse_order.pop();
    dataset["backgroundColor"] = "rgba(0,0,255,0.1)";
    dataset["fill"] = fill;
    datasets.push(dataset);
  });

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: "top", display: datasets.length <= 4 },
        title: { display: true, text: title },
      },
    }
  });
}

function daysInThisMonth(now) {
  return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
}

function get_current_time() {
  now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes().toString().padStart(2, "0");
  ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;  // convert 0 → 12
  return `${hours}:${minutes} ${ampm}`;   // Example: "9:05 PM"
}

function get_today_and_mtd(nrs_only){
  reportTypeSelector.value = nrs_only ? "daywiseNRSOnly": "daywiseSales";
  now = get_ist_date();
  set_from_date_to_month_beginning(now);
  fetchReport();
  mtd = current_rows.pop();
  today = current_rows.pop();
  success = true;

  if (today.Date != toDatePicker.value){
    alert("No Sale today, Last sale day is:" + today.Date);
    success = false;
  }
  return [now, today, mtd, success];
}

function send_update(nrs_only=false, is_update=true, client_count=0, appointments=0){
  const [now, today, mtd, success] = get_today_and_mtd(nrs_only);
  if(!success){
    return;
  }
  summary =  "Date: *" + today.Date + "*\n";
  summary += "Salon: *" + shopConfig[shopSelect.value].name + "*\n\n";
  summary += "Sales: " + today.NetSale.toFixed(2) + "\n";
  summary += "Bills: " + today.Bills + "\n";
  summary += "ABV: " + today.ABV.toFixed(2) + "\n";
  date_num = parseInt(today.Date.split("-")[2], 10)

  if(nrs_only) {
    summary += "\nMTD:\n  Sales: " + mtd.NetSale + "\n";
    summary += "  Bills: " + mtd.Bills + "\n";
    summary += "  ABV: " + mtd.ABV.toFixed(2) + "\n\n";
    projection = parseInt(mtd.NetSale / date_num * daysInThisMonth(now));
    summary += "Projection: " + projection + "\n";
  }
  else {
    summary += "Services: " + today.Services + "\n";
    summary += "New Clients: " + today.NewClients + "\n\n";

    today_call_backs = 0;
    today_visit_rejected = 0;
    Object.entries(call_backs["config_value"]).forEach(function([phone_num, call_back_data]) {
      if (call_back_data.UpdatedDate == today.Date){
        today_call_backs += 1;
        if(never_call_again_list.includes(call_back_data.Status)){
          today_visit_rejected += 1;
        }
      }
    });
    summary += "Callbacks: " + today_call_backs + "\n";
    summary += "Rejected Clients: " + today_visit_rejected + "\n\n";
    if (! is_update) {
      dayCloseDateNum = parseInt(today.Date.replace(/-/g, ""), 10);
      cash_data = {
        "OpeningBalance": parseInt(yesterdayCash.value, 10),
        "Cash": parseInt(todayCash.value, 10),
        "CashGiven": parseInt(cashGiven.value || "0", 10),
        "CashGivenTo": cashGivenTo.value,
        "ChangeMissed": parseInt(changeMissed.value || "0", 10),
        "CashInBox": parseInt(cashInBox.value, 10)
      };
      summary += "Cash Details: \n";
      summary += "  Yesterday Cash: " + cash_data["OpeningBalance"] + "\n";
      summary += "  Today Cash: " + cash_data["Cash"] + "\n";
      if(cash_data["CashGiven"] != 0){
        summary += "  Cash Given: " + cash_data["CashGiven"] + "\n";
        summary += "  Cash Given To: " + cash_data["CashGivenTo"] + "\n";
      }
      if(cash_data["ChangeMissed"] != 0){
        summary += "  Change Missed: " + cash_data["ChangeMissed"] + "\n";
      }
      summary += "  Cash in Box: " + cash_data["CashInBox"] + "\n";
      summary += "\nClosing now, Good Night!!!\n";

      today_day_sales = full_data.filter(item => item.datenum == dayCloseDateNum)[0];
      today_day_sales["cashdata"] = cash_data;
      updateDataInDB("daysales", today_day_sales);
    }else {
      summary += "Clients In Salon: " + client_count + "\n";
      summary += "Appointments:" + appointments + "\n";
    }
    update_str = is_update ? "Update" : "Closing";
    summary += update_str + " Time: " + get_current_time()+ "\n";
  }
  shopConfig[shopSelect.value].whatsapp_number.forEach(phone_num => { send_whatsapp(summary, phone_num); });
  //  send_whatsapp(summary);
}

function openUpdateDialog() {
  updateModel.style.display = "block";
}

function submitUpdate() {
  closeDialog();
  send_update(false, true, noOfClients.value, appointments.value)
}

function openCallbackDialog(phone, name) {
  callBackPhone.value = phone;
  callBackName.value = name;
  callBackDueDate.value = get_ist_date().toISOString().split('T')[0];
  callBackStatus.value = "Appointment Booked";
  callBackNotes.value = "";
  CallBackModel.style.display = "block";
}

function updateDataInDB(table_name, db_obj) {
  fetch(`${db_url}${table_name}/${db_obj._id}`, {
    method: "PUT",
    headers: db_headers["headers"],
    body: JSON.stringify(db_obj) // full record with updated field
  })
  .then(response => response.json())
  .then(updated => {
    console.log("Updated Obj:", updated);
  })
  .catch(err => {
    console.error("Error:", err);
  });
}

function insertNewDateBills(date_entry_obj) {
  fetch(db_url + "daysales", {
    method: "POST",
    headers: db_headers["headers"],
    body: JSON.stringify(date_entry_obj)
  })
  .then(response => response.json())
  .then(updated => {
    console.log("Updated Obj:", updated);
    full_data.push(updated);
  })
  .catch(err => {
    console.error("Error:", err);
  });
}

function calculate_cash_in_box(){
  value = 0;
  value += parseInt(yesterdayCash.value, 10);
  value += parseInt(todayCash.value, 10);
  value -= parseInt(cashGiven.value || "0", 10);
  value -= parseInt(changeMissed.value || "0", 10);
  cashInBox.value = value;
}

function openDayCloseDialog() {
  const [now, today, mtd, success] = get_today_and_mtd(false);
  if(!success){
    return;
  }
  try{
    yesterdayCash.value = cash_rows[get_yesterday_date_num(today.Date)].CashInBox;
  }
  catch{
    yesterdayCash.value = 0;
  }
  todayCash.value = parseInt(today.Cash, 10);
  cashGiven.value = 0;
  cashGivenTo.value = "";
  changeMissed.value = 0;
  calculate_cash_in_box();
  DayCloseModel.style.display = "block";
}

function submitDayClose() {
  if(cashInBoxConfirm.value != cashInBox.value) {
    alert("Please confirm cash in box matched with expected - " + cashInBox.value);
    cashInBoxConfirm.value = "";
    return;
  }
  closeDialog();
  send_update(false, false);
}

function updateCallBackInDB() {
  updateDataInDB("config", call_backs);
}

function add_employee(emp_name, push_to_db = true) {
  empNames.push(emp_name || employeeName.value);
  if(push_to_db) updateDataInDB("config", employees_config);
  closeDialog();
}

function add_service(service_name=null, service_price=null, push_to_db= true) {
  servicesDict[service_name || serviceName.value] = (service_price || servicePrice.value)/1.05;
  if(push_to_db) updateDataInDB("config", services_config);
  populateSearchLists();
  closeDialog();
}

function delete_bills(bill_ids){
  updated_dates = {};
  full_data.forEach(day_sale => {
    for (let i = day_sale.bills.length - 1; i >= 0; i--) {
      const ticketId = get_ticket_id(day_sale.bills[i].TicketID);
      const idx = bill_ids.indexOf(ticketId);

      if (idx !== -1) {
        // remove bill from bills
        day_sale.bills.splice(i, 1);

        // remove TicketID from bill_ids so it’s only removed once
        bill_ids.splice(idx, 1);
        updated_dates[day_sale.datenum] = day_sale;
      }
    }
  });
  Object.values(updated_dates).forEach(day_sale => {updateDataInDB("daysales", day_sale)});
  populate_all_bills();
  populateSearchLists();
}

function delete_service(service_name) {
  delete servicesDict[service_name];
  updateDataInDB("config", services_config);
  populateSearchLists();
}

function delete_employee(emp_name) {
  let index = empNames.indexOf(emp_name);
  if (index !== -1) empNames.splice(index, 1);
  updateDataInDB("config", employees_config);
}

function resetBill() {
  // Clear service rows
  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";

  // Reset payment inputs
  document.querySelectorAll("#newBillModal input").forEach(inp => {
    inp.value = "";
  });

  // Reset summary & totals
  recalcAll();

  // Optional: disable submit button until a new valid bill is created
  document.getElementById("submitBillBtn").disabled = true;
}

function submitBill(){
  if(validateBill()) {
    bill_to_add = generateBillObject();
    bill_date_num = parseInt(get_ist_date().toISOString().split('T')[0].replace(/-/g, ""), 10)
    updated = false;
    full_data.forEach(day_entry => {
      if(day_entry.datenum == bill_date_num){
        day_entry.bills.push(bill_to_add);
        updateDataInDB("daysales", day_entry);
        updated = true;
        return;
      }
    });
    if (!updated) {
      insertNewDateBills({"datenum": bill_date_num, "bills": [bill_to_add]});
    }
    next_bill_number += 1;
    resetBill();
    closeDialog();
    populate_all_bills();
    populateSearchLists();
    printBill(bill_to_add);
  }
}


function submitCallbackUpdate() {
  update_entry = {
    "Status": callBackStatus.value,
    "Notes": callBackNotes.value,
    "DueDate": callBackDueDate.value,
    "Name": callBackName.value,
    "UpdatedDate": get_ist_date().toISOString().split('T')[0]
  }
  call_backs["config_value"][callBackPhone.value] = update_entry
  updateCallBackInDB();
  closeDialog();
  fetchReport();
}

function deleteCallBackData(phone_num){
  delete call_backs["config_value"][phone_num];
  updateCallBackInDB();
  fetchReport();
}

function toggleMenu() {
  dropdownMenu.classList.toggle("show");
}

function resizeCanvas() {
  const screenWidth = window.innerWidth;
  const canvasWidth = screenWidth * 0.3; // 30% of screen width
  const canvasHeight = canvasWidth / 2;  // half of canvas width

  document.querySelectorAll("canvas").forEach(canvas => {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  });
}

function export_as_csv() {
  new $.fn.dataTable.Buttons(dt_table, {
    buttons: [
      {
        extend: 'csvHtml5',
        text: 'Export CSV',
        filename: 'report',
        exportOptions: {
          columns: ':visible',
          format: {
            body: function(data, row, column, node) {
              return typeof data === 'string' ? data.replace(/<[^>]*>/g, '') : data;
            }
          }
        }
      }
    ]
  });

  // trigger the CSV export
  dt_table.button(0).trigger();
}

function closeDialog() {
  document.querySelectorAll(".myModal").forEach(modal => {modal.style.display = "none"});
  fetchReport();
}

function openNewBillModal() {
  newBillModal.style.display = "block";
}

function openNewServiceModal() {
  serviceName.value = "";
  servicePrice.value = "";
  addServiceModal.style.display = "block";
}

function openNewEmployeeModal() {
  employeeName.value = "";
  addEmpModal.style.display = "block";
}

function addServiceRow() {
  const tbody = document.querySelector("#servicesTable tbody");
  const tr = document.createElement("tr");

  // Service input with datalist (searchable)
  let serviceInput = `
    <input type="text" class="serviceInput" list="servicesList" placeholder="Search service..." />
  `;

  // Employee dropdown
  let empSelect = `<select onchange="empChanged(this)" class="empNameInput">
    <option value="">--Emp--</option>`;
  empNames.forEach(emp => empSelect += `<option value="${emp}">${emp}</option>`);
  empSelect += `</select>`;

  tr.innerHTML = `
    <td>${serviceInput}</td>
    <td>${empSelect}</td>
    <td><input type="number" class="qtyInput" value="1" min="1" onchange="recalcRow(this)" style="width:60px"></td>
    <td class="price" style="width:80px; text-align:right">0</td>
    <td><input type="number" class="discountInput" value="0" min="0" onchange="recalcRow(this)" style="width:80px"></td>
    <td class="total" style="width:100px; text-align:right">0</td>
    <td><button onclick="this.closest('tr').remove(); recalcAll();" class="gray-button">❌</button></td>
  `;
  tbody.appendChild(tr);
}

// When employee dropdown changes
function empChanged(selectEl) {
  const row = selectEl.closest("tr");
  const newEmp = selectEl.value;

  if (!newEmp) return;

  let nextRow = row.nextElementSibling;
  while (nextRow) {
    const empDropdown = nextRow.querySelector(".empNameInput");
    if (!empDropdown.value) {
      empDropdown.value = newEmp;
    }
    nextRow = nextRow.nextElementSibling;
  }
}


function recalcRow(el) {
  const row = el.closest("tr");
  const qty = parseFloat(row.querySelector(".qtyInput").value) || 0;
  const price = parseFloat(row.querySelector(".price").textContent) || 0;
  const discount = parseFloat(row.querySelector(".discountInput").value) || 0;
  const total = (qty * price) - discount;

  row.querySelector(".total").textContent = total.toFixed(2);
  recalcAll();
}

function recalcAll() {
  const rows = document.querySelectorAll("#servicesTable tbody tr");
  let netBefore = 0, discountSum = 0, netAfter = 0;

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector(".qtyInput").value) || 0;
    const price = parseFloat(row.querySelector(".price").textContent) || 0;

    netBefore += qty * price;
  });

  total_dic_amount = parseFloat(billDiscountAmount.value) || 0;
  if(total_dic_amount > 0) {
    total_disc_percent = (total_dic_amount/netBefore) * 100;
    billDiscountPercent.value = total_disc_percent.toFixed(2);
  }
  total_disc_percent = parseFloat(billDiscountPercent.value) || 0;

  if(total_disc_percent > 0) {
    rows.forEach(row => {
      const price = parseFloat(row.querySelector(".price").textContent) || 0;
      const qty = parseFloat(row.querySelector(".qtyInput").value) || 0;
      row.querySelector(".discountInput").value = ((qty * price * total_disc_percent) / 100).toFixed(2);
    });
  }

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector(".qtyInput").value) || 0;
    const price = parseFloat(row.querySelector(".price").textContent) || 0;
    const discount = parseFloat(row.querySelector(".discountInput").value) || 0;

    total = (qty * price) - discount;
    discountSum += discount
    netAfter += total;
    row.querySelector(".total").textContent = total.toFixed(2);

  });

  const cgst = netAfter * 0.025;
  const sgst = netAfter * 0.025;
  const grandTotal = netAfter + cgst + sgst;

  document.getElementById("netBefore").textContent = netBefore.toFixed(2);
  document.getElementById("discountTotal").textContent = discountSum.toFixed(2);
  document.getElementById("netAfter").textContent = netAfter.toFixed(2);
  document.getElementById("cgst").textContent = cgst.toFixed(2);
  document.getElementById("sgst").textContent = sgst.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);

  checkPayments(); // re-check payment match
}

function checkPayments() {
  let total = 0;
  document.querySelectorAll("#paymentSection input").forEach(inp => {
    total += parseFloat(inp.value) || 0;
  });

  document.getElementById("paymentTotal").textContent = total.toFixed(2);

  // Compare with grandTotal
  const grandTotal = parseFloat(document.getElementById("grandTotal").textContent) || 0;

  submitBillBtn.disabled = Math.abs(total - grandTotal) > 1.00;
}

function populateSearchLists() {
  // Populate datalist with "Phone - Name"
  const phoneList = document.getElementById("phoneList");
  phoneList.innerHTML = "";

  Object.keys(all_bills).forEach(phone => {
    const name = all_bills[phone].bills[0].Name;
    const option = document.createElement("option");
    option.value = `${phone} - ${name}`;
    phoneList.appendChild(option);
  });

  // Fill datalist only once
  const servicesList = document.getElementById("servicesList");
  servicesList.innerHTML = "";
  for (let sid in servicesDict) {
    const opt = document.createElement("option");
    opt.value = `${sid} - ${servicesDict[sid] * 1.05}`;
    servicesList.appendChild(opt);
  }
}

// Handle when user selects/inputs
function handlePhoneInput(input) {
  const val = input.value.trim();
  const nameInput = document.getElementById("nameInput");

  // Case 1: matches "{phone} - {name}"
  let phone = null;
  if (val.includes(" - ")) {
    phone = val.split(" - ")[0];
  }
  // Case 2: exact phone entered
  else if (all_bills[val]) {
    phone = val;
  }

  if (phone && all_bills[phone]) {
    nameInput.value = all_bills[phone].bills[0].Name;
    input.value = phone; // reset input to pure phone
  } else {
    // If not found, allow entering freely
    nameInput.value = "";
  }
}

function validateBill() {
  const errors = [];

  // --- Phone & Name ---
  const phone = document.getElementById("phoneInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();

  if (!/^(0|\d{10})$/.test(phone)) {
    errors.push("Phone number must be either 0 or a valid 10-digit number");
  }

  if (phone !== "0" && name === "") {
    errors.push("Name is required if phone is not 0");
  }

  // --- Services Table ---
  const rows = document.querySelectorAll("#servicesTable tbody tr");
  rows.forEach(row => {
    // service name from first cell (might be select or text)
    let serviceName = row.querySelector("td").textContent;

    // empname (second <select>)
    const emp = row.querySelector(".empNameInput").value;
    if (!emp) {
      errors.push(`${serviceName}: Employee name is required`);
    }

    // qty
    const qty = parseInt(row.querySelector(".qtyInput").value, 10) || 0;
    if (qty < 1) {
      errors.push(`${serviceName}: Quantity must be at least 1`);
    }

    // discount
    const discountInput = row.querySelector(".discountInput");
    let discount = discountInput.value.trim();
    if (discount == "") discount = "0";
    if (isNaN(discount) || Number(discount) < 0) {
      errors.push(`${serviceName}: Discount must be 0 or a positive number`);
    }
  });

  // --- Result ---
  if (errors.length > 0) {
    alert("Validation failed:\n" + errors.join("\n"));
    return false;
  }
  return true;
}

function generateBillObject() {
  const phone = document.getElementById("phoneInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();

  // Auto fields
  const TimeMark = get_ist_date().toISOString().slice(0,19).replace("T"," ");
  const TicketID = "MMD" + next_bill_number;

  // Collect services (ticket array)
  const ticket = [];
  document.querySelectorAll("#servicesTable tbody tr").forEach(row => {
    const serviceId = row.querySelector("td").textContent;
    if (!serviceId) return; // skip empty rows
    console.log(serviceId);
    const svc = servicesDict[serviceId];
    const empname = row.querySelector(".empNameInput").value;
    const qty = parseFloat(row.querySelector(".qtyInput").value) || 0;
    const price = parseFloat(row.querySelector(".price").textContent) || 0;
    const discount = parseFloat(row.querySelector(".discountInput").value) || 0;
    const total = parseFloat(row.querySelector(".total").textContent) || 0;

    ticket.push({
      DiscountAmount: discount,
      Price: price,
      Qty: qty,
      ServiceID: serviceId,
      ServiceName: serviceId,
      Sex: "1", // static for now
      Total: total,
      empname: empname
    });
  });

  // Collect payments
  const payment = [];
  ["Cash", "Card", "EWallet", "HomeBSC", "OtherBSC"].forEach(mode => {
    const val = parseFloat(document.getElementById("pay" + mode).value) || 0;
    if (val > 0) {
      payment.push({
        ChangeAmt: 0,
        ModeofPayment: mode,
        Tender: val
      });
    }
  });

  // Build bill object
  const bill = {
    payment,
    ticket,
    mmd: true,
    Name: name,
    Phone: phone,
    TicketID,
    TimeMark,
    Comments: null
  };

  console.log("Generated Bill:", bill);
  return bill;
}

function printBill(bill, gst_split=0.025) {
  // --- recompute totals ---
  let netBefore = bill.ticket.reduce((s, t) => s + (t.Price * t.Qty), 0);
  let discountTotal = bill.ticket.reduce((s, t) => s + (t.DiscountAmount || 0), 0);
  let netAfter = netBefore - discountTotal;
  let cgst = (netAfter * gst_split).toFixed(2);
  let sgst = (netAfter * gst_split).toFixed(2);
  let gstAmt = (parseFloat(cgst) + parseFloat(sgst)).toFixed(2);
  let grandTotal = (netAfter + parseFloat(gstAmt)).toFixed(2);

  let serviceRows = bill.ticket.map(svc => `
    <tr>
      <td class="left">${svc.ServiceName}</td>
      <td class="center">${svc.Qty}</td>
      <td class="right">${svc.Price.toFixed(2)}</td>
      <td class="right">${(svc.Price * svc.Qty).toFixed(2)}</td>
    </tr>`).join("");

  let paymentText = bill.payment.map(p => `${p.ModeofPayment}=${p.Tender}`).join(", ");

  const billHTML = `
  <html>
  <head>
    <style>
      body { font-family: monospace; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 5px; }
      td, th { padding: 2px 4px; }
      th { border-bottom: 1px solid #000; }
      .right { text-align: right; }
      .center { text-align: center; }
      .left { text-align: left; }
      .summary td { padding: 2px 4px; }
      .clientInfo td { width: 150px }
      .clientInfo { width: 300px }
    </style>
  </head>
  <body>
    <image style="display:block; margin:0 auto;" src="https://sreechaitnaa.github.io/naturals/MMDReporting/ylg.png">
    <hr>
    <p style="text-align:center; margin-top:10px;">
      #78/1, 1st Floor, Inspira Landmark, <br />
      Haralur Main Road, Birla Circle,  <br />
      Kudlu, Bengaluru, Karnataka 560068, <br />
      Mobile - 63645 64645 <br />
      Email - AA.Haralur@gmail.com <br />
      GST: 29ACEFA8042J1Z7
    </p>
    <hr>
    <table style="clientInfo">
      <tr><td>
      Customer Name </td><td>: ${bill.Name}</td></tr><tr><td>
      Client Phone  </td><td>: ${bill.Phone}</td></tr><tr><td>
      Bill Date     </td><td>: ${bill.TimeMark}</td></tr><tr><td>
      Invoice No.   </td><td>: ${bill.TicketID.replace("MMD", "")}</td></tr>
    </table>

    <table>
      <thead>
        <tr><th>Service</th><th class="center">QTY</th><th class="right">RATE</th><th class="right">AMOUNT</th></tr>
      </thead>
      <tbody>
        ${serviceRows}
      </tbody>
    </table>
    <hr>

    <table class="summary">
      <tr><td>BASIC SALES</td><td class="right">${netBefore.toFixed(2)}</td></tr>
      <tr><td>DISCOUNT</td><td class="right">${discountTotal.toFixed(2)}</td></tr>
      <tr><td>NET AMOUNT</td><td class="right">${netAfter.toFixed(2)}</td></tr>
      <tr><td>GST AMOUNT</td><td class="right">${gstAmt}</td></tr>
      <tr><td><b>BILL AMOUNT</b></td><td class="right"><b>${grandTotal}</b></td></tr>
    </table>

    <h4>GST Tax Summary</h4>
    <table>
      <thead>
        <tr><th>GST</th><th>CGST</th><th>SGST</th><th>PCGST</th><th>PSGST</th></tr>
      </thead>
      <tbody>
        <tr>
          <td class="center">${gst_split * 200}%</td>
          <td class="center">${cgst}</td>
          <td class="center">${sgst}</td>
          <td class="center">0</td>
          <td class="center">0</td>
        </tr>
      </tbody>
    </table>
    <hr>

    <p>PAID THROUGH ${paymentText}</p>
    <hr>

    <p style="text-align:center; margin-top:10px;">
      THANK YOU. HAVE A NICE DAY.<br>
      THIS IS COMPUTERIZED INVOICE. HENCE NO SIGNATURE REQUIRED.<br><br>
      ===== PLEASE VISIT AGAIN =====.
    </p>

    <script>setTimeout(window.print, 2000)<\/script>
  </body>
  </html>
  `;

  let billWindow = window.open('', '', 'width=600');
  billWindow.document.write(billHTML);
  billWindow.document.close();
}

function get_service_name_from_selected_service(service_string){
  const idx = service_string.lastIndexOf("-");
  if (idx === -1) return service_string.trim(); // no dash found
  return service_string.slice(0, idx).trim();
}

document.addEventListener("input", function(e) {
  if (e.target.classList.contains("serviceInput")) {
    const val = e.target.value;
    const match = Object.keys(servicesDict).find(svc => get_service_name_from_selected_service(val) == svc );
    if (match) {
      const row = e.target.closest("tr");
      row.querySelector("td").textContent = match;
      // Fill Price & Recalculate
      row.querySelector(".price").textContent = servicesDict[match];
      recalcRow(row.querySelector(".qtyInput"));

      const prevRow = row.previousElementSibling;
      if (prevRow) {
        const prevEmp = prevRow.querySelector(".empNameInput").value;
        if (prevEmp) {
          row.querySelector(".empNameInput").value = prevEmp;
        }
      }
    }
  }
});


window.onclick = function(event) {
  if (!event.target.matches('.menu-button')) {
    document.querySelectorAll(".menu-content").forEach(menu => {
      menu.classList.remove("show");
    });
  }
}

window.addEventListener("resize", resizeCanvas);


