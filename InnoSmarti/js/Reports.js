// reports.js

// ==== SHOP CONFIG (paste encrypted keys from Python output) ====
const shopConfig = {
  "TNS": { "url": "https://innosmartisca-d3db.restdb.io/rest/",
    "encKey": "ki62s6ktea89p72RjFNDDrqVjKrUUT9i7d78cup3kqCEK1KvuFaLDkY7PdjUrnT5S5eQzFF2/9FGDGrt3SflYA==" },
  "JKR": { "url": "https://innosmartiscajkr-30a7.restdb.io/rest/",
    "encKey": "Fr4R+Qu6i1p+hdfcmDrm4bywTHY/b863GlNnuA9p9uo3x5nnahlJqvssPOJRt1BcDXLw34a2rIrcT81DmMe7xQ==" }
};

table_columns = {
  "detailedBills" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'Price', 'Discount', 'NetSale', 'Tax', 'Gross', 'Sex', 'Services', 'ServiceDesc', 'EmpName', "PaymentType", 'Cash', 'UPI', 'Card'],
  "bills" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'Services', 'Price', 'Discount', 'NetSale', 'Gross', "PaymentType"],
  "services" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'ServiceName', 'EmpName', 'Price', 'Discount', 'NetSale', "PaymentType"],
  "employeeSales": ["Name", "Bills", "Services", "Price", "Discount", "NetSale", "ABV", "ASB"],
  "callBacks": ['Phone', 'Name', 'Visits', "BillsSummary", 'TotalNetSale', 'TicketID', "ServiceDesc", 'EmpName', "NetSale", "Notes", "Action"],
  "callBacksOnHold": ['Phone', 'Name', 'UpdatedDate', "DueDate", "Status", "Notes", "Action"],
  "dailyCash": ['Date', 'OpeningBalance', 'Cash', "CashGiven", "CashGivenTo", "ChangeMissed", "CashInBox"],
  "serviceWiseSales": ["Name", "Count", 'Price', 'Discount', 'NetSale', "Providers"]
};

const numericColumns = ["Price", "Discount", "NetSale", "Tax", "Gross", "ABV", "ASB", "Cash", "UPI", "Card", "TotalNetSale"];

employee_name_map = {
  "Guru": "Guru prasad",
  "Komati": "Komathi",
  "Shajid": "Javed",
  "Nandini": "Ritika",
  "Lokeshwari": "Sarita",
  "sarita": "Sarita",
  "Ritu": "Ritika"
};

shops_map = {"JKR": "Jakkur", "TNS": "Thanisandra"};

function get_emp_name(emp_name){
  return employee_name_map[emp_name] || emp_name;
}

range_columns = ["Bills", "Services", 'Price', "Discount", "NetSale", "Tax", "Gross", "ABV", "ASB", "Cash", "UPI", "Card"];
daywise_reports = ["daywiseSales", "daywiseSplit", "daywiseNRSOnly"];
monthly_reports = ["monthlySales", "monthlySplit", "monthlyNRSOnly"];
daywise_reports.forEach(reportType => {
  table_columns[reportType] = ["Date"].concat(range_columns);
  table_columns[reportType].push("NewClients");
});
monthly_reports.forEach(reportType => {
  table_columns[reportType] = ["Month"].concat(range_columns);
});

table_columns["detailedAllBills"] = [...table_columns["detailedBills"]];
table_columns["sectionWiseSales"] = [...table_columns["serviceWiseSales"]];
table_columns["sectionWiseSales"].push("Services");

bill_reports = ["bills", "detailedBills", "detailedAllBills"];
non_group_reports = ["services", "bills", "detailedBills", "detailedAllBills", "callBacks", "callBacksOnHold", "dailyCash"];
never_call_again_list = ["Not Happy", "Moved Out of Town", "Never Call Again"];
non_shop_reports = ["bills", "monthlySales", "daywiseSplit", "monthlySplit", "monthlyNRSOnly", "summaryNRSOnly", "daywiseNRSOnly"];
non_sum_row_reports = ["callBacks", "callBacksOnHold", "dailyCash"];
sections_map = {
  "Hair Coloring": ["grey coverage", "color", "highlight", "ammonia"],
  "Hair Treatments": ["treatment", "botox", "keratin", "dandruf", "hairfall"],
  "Hair Spa & Massage": ["spa", "massage", "pro fiber", "rejuvenate", "frizz"],
  "Hair Cuts & Styles": ["cut", "blow", "beard", "bangs", "hair styl", "shampoo", "shave", "tongs",
                        "change of styl", "conditioning", "ironing", "hair wash"],
  "Threading & Waxing": ["thread", "wax", "peel"],
  "Pedi Mani": ["pedi", "mani", "reflexology"],
  "Makeup": ["saree", "nail", "makeup"],
  "Membership": ["membership"],
  "Products": ["loreal", "max prime"],
  "De-tan & Facials": ["facial", "ultimo", "fruit", "detan", "de-tan", "cleanup", "blaster", "bleach", "bliss",
                        "glow", "no tan", "hydration", "back polish"],
  "Other Combos": ["combo"]
}

let db_config = {}
let db_url = "";
let db_headers = {};
let last_data = [];
let full_data = [];
let current_rows = [];
let all_bills = {};
let call_backs = {};
let cash_rows = {};
let dt_table = null;
let store_view = true;


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
    shopSelect.value = {"2339": "JKR", "1526": "TNS"}[shopParam];
    console.log("🔹 Default shop set from URL:", shopParam);
    gotoInnosmarti.style.display = "block"
    shopSelectDiv.style.display = "none"
  }
  if(!store_view) {
    gotoInnosmarti.outerHTML = "";
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
  fromDatePicker.value = (new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))).toISOString().split('T')[0];
}

function getSection(serviceName) {
  const lowerService = serviceName.toLowerCase();

  for (const [section, keywords] of Object.entries(sections_map)) {
    if (keywords.some(keyword => lowerService.includes(keyword))) {
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
    console.log(db_apiKey)
    db_headers = {
      headers: {
        "Content-Type": "application/json",
        "x-apikey": db_apiKey,
        "cache-control": "no-cache"
      }
    }
    // Test fetch

    console.log(db_headers)
    fetch(apiUrl, db_headers)
    .then(res => {
      console.log(res)
      if (!res.ok) throw "Login failed";
      return res.json();
    })
    .then(data => {
      loginDiv.style.display = "none";
      shopName.textContent = "Reports for - " + shop;

      // Simple render for debugging
      console.log("✅ Data:", data);
      data.forEach(row => {
        db_config[row["config_name"]] = row["config_value"];
        if (row["config_name"] == "callback"){
          call_backs = row;
        }
      });
      reset_date_pickers();
      fetch(db_url + "daysales", db_headers).then(data_res => {
        return data_res.json();
      }).then(data_response => {
        full_data = data_response;
        formatReportData(full_data, "bills").forEach(bill_entry => {
          if (!(bill_entry.Phone in all_bills)){
            all_bills[bill_entry.Phone] = {"bills": [], "last_bill_date": null};
          }
          all_bills[bill_entry.Phone]["bills"].push(bill_entry);
          all_bills[bill_entry.Phone]["last_bill_date"] = bill_entry.Date;
        });
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
    });

  } catch (e) {
    loginError.textContent = `Invalid password - ${e}`;
    spinnerOverlay.style.display = "none";
  }
}

function calcPayments(payments) {
  let cash = 0, upi = 0, card = 0;
  const payment_types = new Set();
  payments.forEach(p => {
    const mode = (p.ModeofPayment || "").toLowerCase();
    if (mode === "cash") {
      payment_types.add("Cash")
      cash += (p.Tender || 0) - (p.ChangeAmt || 0);
    } else if (mode === "ewallet") {
      payment_types.add("UPI")
      upi += p.Tender || 0;
    } else {
      payment_types.add("Card")
      card += p.Tender || 0;
    }
  });
  payment_type = Array.from(payment_types).join("/")
  return { cash, upi, card, payment_type };
}

function calcTickets(tickets) {
  let servicesCount = 0;
  let discountSum = 0;
  let priceSum = 0;
  const serviceNames = [];
  const empNamesSet = new Set();

  tickets.forEach(item => {
    discountSum += item.DiscountAmount || 0;
    priceSum += item.Qty * (item.Price || 0);
    servicesCount += item.Qty || 0;
    serviceNames.push(item.ServiceName);
    if (item.empname) empNamesSet.add(get_emp_name(item.empname));
  });
  netSalesSum = priceSum - discountSum

  return { servicesCount, priceSum, discountSum, netSalesSum, serviceNames, empNamesSet };
}

function is_call_back_on_hold(call_back_data){
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
        console.log("Call back exists for ", row.Phone, call_back_data);
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
  } else if (reportType == "callBacksOnHold"){
    Object.entries(call_backs["config_value"]).forEach(function([phone_num, call_back_data]) {
      if(is_call_back_on_hold(call_back_data)) {
        row = {...call_back_data};
        row.Phone = phone_num;
        row.Action = "Delete";
        direct_rows.push(row);
      }
    });
  } else if (reportType == "dailyCash"){
    rawData.forEach(day => {
      if(day["cashdata"]){
        row = {...day["cashdata"]};
        const str = day["datenum"].toString();
        row.Date = str.slice(0, 4) + "-" + str.slice(4, 6) + "-" + str.slice(6, 8);
        direct_rows.push(row);
      }
    });
  } else {
    rawData.forEach(day => {
      const bills = day.bills || [];

      bills.forEach(bill => {
        // Format date -> YYYY-MM-DD
        const [datePart, timePart] = bill.TimeMark.split(" ");
        if (reportType.endsWith("NRSOnly") && bill.mmd) return;
        const { cash, upi, card, payment_type } = calcPayments(bill.payment);

        if (non_group_reports.includes(reportType)) {
          if (reportType === "services") {
            bill.ticket.forEach(service => {
              for (let i = 0; i < service.Qty; i++) {
                row = {
                  TicketID: bill.TicketID,
                  Date: datePart,
                  Time: timePart,
                  Phone: bill.Phone,
                  Name: bill.Name,
                  ServiceID: service.ServiceID,
                  ServiceName: service.ServiceName,
                  Price: service.Price,
                  Discount: (service.DiscountAmount / service.Qty),
                  NetSale: service.Price - (service.DiscountAmount / service.Qty),
                  Sex: bill.ticket[0]?.Sex || "",
                  EmpName: get_emp_name(service.empname),
                  PaymentType: payment_type
                };
                direct_rows.push(row)
              }
            });
          } else if (bill_reports.includes(reportType)) {
            const { servicesCount, priceSum, discountSum, netSalesSum, serviceNames, empNamesSet } = calcTickets(bill.ticket);

            row = {
              TicketID: bill.TicketID,
              Date: datePart,
              Time: timePart,
              Phone: bill.Phone,
              Name: bill.Name,
              Price: priceSum,
              Discount: discountSum,
              NetSale: netSalesSum,
              Tax: netSalesSum * 0.18,
              Gross: netSalesSum * 1.18,
              Sex: bill.ticket[0]?.Sex || "",
              Services: servicesCount,
              ServiceDesc: serviceNames.join("/"),
              EmpName: Array.from(empNamesSet).join("/"),
              PaymentType: payment_type,
              Cash: cash,
              UPI: upi,
              Card: card
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
                ASB: 0
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
                Providers: new Set()
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
              Card: 0,
              NewClients: 0
            };
          }

          const row = grouped[key];
          const { servicesCount, priceSum, discountSum, netSalesSum } = calcTickets(bill.ticket);

          row.Bills += 1;
          row.Services += servicesCount;
          row.Price += priceSum;
          row.Discount += discountSum;
          row.NetSale += netSalesSum;
          row.Cash += cash;
          row.UPI += upi;
          row.Card += card;
          row.NewClients += all_bills[bill.Phone]["bills"].length == 1? 1:0;
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
      console.log(rows);
      rows.forEach(row => {
        row.Providers = Array.from(row.Providers).join("/");
        row.Services = Array.from(row.Services).join("/");
      });
    } else {
      rows.forEach(row => {
        row.Tax = row.NetSale * 0.18;
        row.Gross = row.NetSale + row.Tax;
        row.ABV = row.Bills > 0 ? parseFloat((row.NetSale / row.Bills).toFixed(2)) : 0;
        row.ASB = row.Bills > 0 ? parseFloat((row.Services / row.Bills).toFixed(2)) : 0;
      });
    }
    if (["employeeSales", "serviceWiseSales", "sectionWiseSales"].includes(reportType)) {
      rows.sort((a, b) => (a.Name > b.Name ? 1 : -1));
    } else {
      rows.sort((a, b) => (a.Date > b.Date ? 1 : -1));
    }
  }
  return rows;
}

function fill_table_with_data(reportType)
{
  dataTable.style.display = 'block';
  chartsDiv.style.display = 'none';
  rows = formatReportData(last_data, reportType);
  current_rows = [...rows];
  tableHolder.innerHTML = '<table id="dataTable" class="display"><thead><tr></tr></thead><tbody></tbody></table>';
  data_keys = table_columns[reportType];
  if (!non_sum_row_reports.includes(reportType)) {
    sum_row = {};
    data_keys.forEach(dk => { sum_row[dk] = 0 });
    rows.forEach(item => {
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
    current_rows.push(sum_row);
  }

  // If DataTable already exists, destroy it
  if ($.fn.DataTable.isDataTable('#dataTable')) {
      $('#dataTable').DataTable().clear().destroy();
  }

  // Reinitialize DataTables
  dt_table = $('#dataTable').DataTable({
    destroy: true, // reset old table
    data: current_rows,    // array of objects
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
        targets: data_keys.map((key, idx) => numericColumns.includes(key) ? idx : null).filter(v => v !== null),
        render: function(data, type, row) {
          return Number(data).toFixed(2);
        }
      },
      {
        targets: data_keys.map((key, idx) => key === "Action" ? idx : null).filter(v => v !== null),
        orderable: false,
        render: function(data, type, row) {
          if (type === "display") {
            if(reportType == "callBacks"){
              return `<button class="gray-button" onclick="openCallbackDialog('${row.Phone}','${row.Name}')">${data}</button>`;
            } else if(reportType == "callBacksOnHold") {
              return `<button class="gray-button" onclick="deleteCallBackData('${row.Phone}')">${data}</button>`;
            }

          }
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

  $('#tableSearch').on('keyup', function() {
    dt_table.search(this.value).draw();
  });
}

function send_whatsapp(text, phone_num=null){
  wa_link = "https://api.whatsapp.com/send/?";
    if(phone_num != null){
      wa_link = wa_link + "phone=91" + phone_num + "&";
    }
  wa_link = wa_link + "text=" + text.replace(/ /g, "%20").replace(/\n/g, "%0a");
  window.open(wa_link, '_blank');
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

  datasets = [{"label": "Expected", "data": daily_chart_expected}, {"label": "Actual", "data": daily_chart_actual}]
  createReportChart('dailyChart', labels, "Day wise Target", datasets);

  datasets = [{"label": "Expected", "data": growth_chart_expected}, {"label": "Actual", "data": growth_chart_actual}]
  createReportChart('growthChart', labels, "Total Target", datasets);

  datasets = [{"label": "Total", "data": total_clients}, {"label": "New", "data": new_clients}]
  createReportChart('clientsChart', labels, "Clients Trend", datasets);

  Object.entries(call_backs["config_value"]).forEach(function([phone_num, call_back_data]) {
    called_date = formatToMonthDay(call_back_data.UpdatedDate);
    total_called_dict[called_date] += 1;
    if(never_call_again_list.includes(call_back_data.Status)){
      rejected_count_dict[called_date] += 1;
    }
  });

  datasets = [{"label": "Total Called", "data": Object.values(total_called_dict)},
              {"label": "Rejected to Visit", "data": Object.values(rejected_count_dict)}]
  createReportChart('callBackChart', labels, "Callback Trend", datasets);
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
        legend: { position: "top" },
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
    alert("No Sale today:" + today.Date);
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
  summary += "Salon: *" + shops_map[shopSelect.value] + "*\n\n";
  summary += "Sales: " + today.NetSale + "\n";
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

      console.log(dayCloseDateNum);
      console.log(cash_data);
      console.log(today_day_sales);
    }else {
      summary += "Clients In Salon: " + client_count + "\n";
      summary += "Appointments:" + appointments + "\n";
    }
    update_str = is_update ? "Update" : "Closing";
    summary += update_str + " Time: " + get_current_time()+ "\n";
  }
  send_whatsapp(summary);
}

function openUpdateDialog() {
  updateModel.style.display = "block";
}

function closeUpdate() {
  updateModel.style.display = "none";
}

function submitUpdate() {
  closeUpdate();
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

function closeCallbackUpdate() {
  CallBackModel.style.display = "none";
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

function closeDayCloseDialog() {
  DayCloseModel.style.display = "none";
}

function submitDayClose() {
  closeDayCloseDialog();
  send_update(false, false);
}

function updateCallBackInDB() {
  updateDataInDB("config", call_backs);
}

function delete_bills(bill_ids){
  updated_dates = {};
  full_data.forEach(day_sale => {
    for (let i = day_sale.bills.length - 1; i >= 0; i--) {
      const ticketId = day_sale.bills[i].TicketID;
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
  console.log(call_backs);
  updateCallBackInDB();
  closeCallbackUpdate();
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

window.onclick = function(event) {
  if (!event.target.matches('.menu-button')) {
    document.querySelectorAll(".menu-content").forEach(menu => {
      menu.classList.remove("show");
    });
  }
}

window.addEventListener("resize", resizeCanvas);
