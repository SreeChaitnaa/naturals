// reports.js

// ==== SHOP CONFIG (paste encrypted keys from Python output) ====
const shopConfig = {
  "TNS": { "url": "https://innosmartisca-d3db.restdb.io/rest/",
    "encKey": "ki62s6ktea89p72RjFNDDrqVjKrUUT9i7d78cup3kqCEK1KvuFaLDkY7PdjUrnT5S5eQzFF2/9FGDGrt3SflYA==" },
  "JKR": { "url": "https://innosmartiscajkr-30a7.restdb.io/rest/",
    "encKey": "Fr4R+Qu6i1p+hdfcmDrm4bywTHY/b863GlNnuA9p9uo3x5nnahlJqvssPOJRt1BcDXLw34a2rIrcT81DmMe7xQ==" }
};

table_columns = {
    "detailsBills" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'Price', 'Discount', 'NetSale', 'Tax', 'Gross', 'Sex', 'Services', 'ServiceDesc', 'EmpName', "PaymentType", 'Cash', 'UPI', 'Card'],
    "bills" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'Services', 'Price', 'Discount', 'NetSale', 'Gross', "PaymentType"],
    "services" : ['TicketID', 'Date', 'Time', 'Name', 'Phone', 'ServiceName', 'EmpName', 'Price', 'Discount', 'NetSale', "PaymentType"],
    "employeeSales": ["EmployeeName", "Bills", "Services", "Price", "Discount", "NetSale", "ABV", "ASB"]
}

range_columns = ["Bills", "Services", 'Price', "Discount", "NetSale", "Tax", "Gross", "ABV", "ASB", "Cash", "UPI", "Card"]
daywise_reports = ["daywiseSales", "daywiseSplit", "daywiseNRSOnly"]
monthly_reports = ["monthlySales", "monthlySplit", "monthlyNRSOnly"]
daywise_reports.forEach(reportType => {
    table_columns[reportType] = ["Date"].concat(range_columns)
});
monthly_reports.forEach(reportType => {
    table_columns[reportType] = ["Month"].concat(range_columns)
});
bill_reports = ["bills", "detailsBills"]
non_group_reports = ["services", "bills", "detailsBills"]

let db_config = {}
let db_url = "";
let db_headers = {};
let last_from_date = "";
let last_to_date = "";
let last_data = [];
let data = [];

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
  const select = document.getElementById("shopSelect");
  for (const shop in shopConfig) {
    let opt = document.createElement("option");
    opt.value = shop;
    opt.textContent = shop;
    select.appendChild(opt);
  }

  const params = new URLSearchParams(window.location.search);
  const shopParam = params.get("shop");

  if (shopParam) {
    const shopSelect = document.getElementById("shopSelect");
    shopSelect.value = {"2339": "JKR", "1526": "TNS"}[shopParam];
    console.log("🔹 Default shop set from URL:", shopParam);
    document.getElementById('gotoInnosmarti').style.display = "block"
    document.getElementById('shopSelectDiv').style.display = "none"
  }
};

function reset_date_pickers(){
    const fromDatePicker = document.getElementById('fromDatePicker');
    const toDatePicker = document.getElementById('toDatePicker');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    fromDatePicker.value = formattedDate;
    toDatePicker.value = formattedDate;
}

// ==== LOGIN HANDLER ====
function login() {
  const shop = document.getElementById("shopSelect").value;
  const password = document.getElementById("password").value;

  try {
    const encKey = shopConfig[shop].encKey;
    db_url = shopConfig[shop].url;
    const apiUrl = db_url + "config";
    const db_apiKey = decryptApiKey(encKey, password);

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
      document.getElementById("loginDiv").style.display = "none";
      document.getElementById("dataDiv").style.display = "block";
      document.getElementById("shopName").textContent = "Reports for - " + shop;

      // Simple render for debugging
      console.log("✅ Data:", data);
      db_config = data;
      reset_date_pickers()
    })
    .catch(err => {
      document.getElementById("loginError").textContent = `Invalid password or API key - ${err.message}`;
    });

  } catch (e) {
    document.getElementById("loginError").textContent = `Invalid password - ${e}`;
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
  let servicesCount = tickets.length;
  let discountSum = 0;
  let priceSum = 0;
  const serviceNames = [];
  const empNamesSet = new Set();

  tickets.forEach(item => {
    discountSum += item.DiscountAmount || 0;
    priceSum += item.Price || 0;
    serviceNames.push(item.ServiceName);
    if (item.empname) empNamesSet.add(item.empname);
  });
  netSalesSum = priceSum - discountSum

  return { servicesCount, priceSum, discountSum, netSalesSum, serviceNames, empNamesSet };
}

async function formatReportData(rawData, reportType) {
  const grouped = {};
  const direct_rows = []

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
                row = {
                    TicketID: bill.TicketID,
                    Date: datePart,
                    Time: timePart,
                    Phone: bill.Phone,
                    Name: bill.Name,
                    ServiceID: service.ServiceID,
                    ServiceName: service.ServiceName,
                    Price: service.Price,
                    Discount: service.DiscountAmount,
                    NetSale: service.Price - service.DiscountAmount,
                    Sex: bill.ticket[0]?.Sex || "",
                    EmpName: service.empname,
                    PaymentType: payment_type
                };
                direct_rows.push(row)
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

                let key = service.empname;
                emp_in_bill.add(key)
                if (!grouped[key]) {
                    grouped[key] = {
                        EmployeeName: key,
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
                row.Services += 1;
                row.Price += service.Price;
                row.Discount += service.DiscountAmount;
                row.NetSale += service.Price - service.DiscountAmount;
            });
            emp_in_bill.forEach(empName => {
                grouped[empName].Bills += 1;
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
                Card: 0
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
      }
    });
  });

  let rows = Object.values(grouped);
  if (non_group_reports.includes(reportType)) {
    rows = direct_rows
    rows.sort((a, b) => {
      if (a.Date === b.Date) {
        return a.Time > b.Time ? 1 : -1;
      }
      return a.Date > b.Date ? 1 : -1;
    });
  }
  else {
      // Finalize calculated fields
      rows.forEach(row => {
          row.Tax = row.NetSale * 0.18;
          row.Gross = row.NetSale + row.Tax;
          row.ABV = row.Bills > 0 ? row.NetSale / row.Bills : 0;
          row.ASB = row.Bills > 0 ? row.Services / row.Bills : 0;
      });
      if (reportType === "employeeSales") {
        rows.sort((a, b) => (a.EmployeeName > b.EmployeeName ? 1 : -1));
      }
      else {
        rows.sort((a, b) => (a.Date > b.Date ? 1 : -1));
      }
  }
  return rows;
}


async function fill_table_with_data(reportType)
{
    rows = await formatReportData(last_data, reportType)
    const tableHeader = document.querySelector('#dataTable thead tr');
    tableHeader.innerHTML = ''; // Clear existing data
    data_keys = Object.keys(data[0]);
    sum_row = {}
    if(reportType in table_columns)
    {
        data_keys = table_columns[reportType]
    }
    data_keys.forEach(dk => {
        tableHeader.innerHTML = tableHeader.innerHTML + "<th>" + dk + "</th>";
        sum_row[dk] = 0
    });

    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Clear existing data

    rows.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = ""
        data_keys.forEach(dk => {
            dk_value = item[dk]
            if (typeof dk_value === 'number' && !isNaN(dk_value)) {
                sum_row[dk] += dk_value
                dk_value = Number(dk_value.toFixed(2));
            }
            else{
                sum_row[dk] = "-"
            }
            row.innerHTML = row.innerHTML + "<td>" + dk_value + "</td>";
        });
        tableBody.appendChild(row);
    });

    sum_row[data_keys[0]] = "Total"
    const row = document.createElement('tr');
    row.innerHTML = ""
    data_keys.forEach(dk => {
        dk_value = sum_row[dk]
        if (dk == "ABV") {
            dk_value = sum_row["NetSale"] / sum_row["Bills"];
        }
        if (dk == "ASB") {
            dk_value = sum_row["Services"] / sum_row["Bills"];
        }
        if (typeof dk_value === 'number' && !isNaN(dk_value)) {
            dk_value = Number(dk_value.toFixed(2));
        }
        row.innerHTML = row.innerHTML + "<td>" + dk_value + "</td>";
    });
    row.style.fontWeight = 'bold';
    row.style.background = "grey"
    tableBody.appendChild(row);
}


async function fetchReport() {
    const fromDate = document.getElementById("fromDatePicker").value;
    const toDate = document.getElementById("toDatePicker").value;
    const reportType = document.getElementById("reportTypeSelector").value;

    if (!fromDate || !toDate) {
        alert("Please select both start and end dates");
        return;
    }

    const startDateNum = parseInt(fromDate.replace(/-/g, ""), 10);
    const endDateNum = parseInt(toDate.replace(/-/g, ""), 10);

    try {
        if (last_from_date == startDateNum && last_to_date == endDateNum){
            data = JSON.parse(JSON.stringify(last_data))
            console.log(`Using last fetched Daysales Data:`, data);
        }
        else{
            const query = { "datenum": { "$bt": [startDateNum, endDateNum] } };
//            const query = { "datenum": startDateNum };
            const queryString = JSON.stringify(query);

            const url = `${db_url}daysales?q=${queryString}`;

            const response = await fetch(url, db_headers);

            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }

            data = await response.json();
            console.log(`Fetched Daysales Data:`, data);
            last_data = JSON.parse(JSON.stringify(data))
            last_from_date = startDateNum
            last_to_date = endDateNum
        }
        await fill_table_with_data(reportType)

    } catch (error) {
        console.error(`Failed to fetch data:`, error);
        alert(`Could not fetch report. Please try again.`);
    }
}
