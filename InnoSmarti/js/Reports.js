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

employee_name_map = {
    "Guru": "Guru prasad",
    "Komati": "Komathi",
    "Shajid": "Javed",
    "Nandini": "Ritika",
    "Lokeshwari": "Sarita",
    "Ritu": "Ritika"
}

function get_emp_name(emp_name){
    return employee_name_map[emp_name] || emp_name
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
  for (const shop in shopConfig) {
    let opt = document.createElement("option");
    opt.value = shop;
    opt.textContent = shop;
    shopSelect.appendChild(opt);
  }

  const params = new URLSearchParams(window.location.search);
  const shopParam = params.get("shop");
  const pswParam = params.get("psw");
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
  if (pswParam) {
    login();
  }
};

function reset_date_pickers(){
    const today = new Date();
    toDatePicker.value = (new Date()).toISOString().split('T')[0];
    fromDatePicker.value = (new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))).toISOString().split('T')[0];
}

// ==== LOGIN HANDLER ====
function login() {
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
      dataDiv.style.display = "block";
      shopName.textContent = "Reports for - " + shop;

      // Simple render for debugging
      console.log("✅ Data:", data);
      data.forEach(row => {db_config[row["config_name"]] = row["config_value"]})
      reset_date_pickers();
      fetchReport();
    })
    .catch(err => {
      loginError.textContent = `Invalid password or API key - ${err.message}`;
    });

  } catch (e) {
    loginError.textContent = `Invalid password - ${e}`;
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
                row.Services += service.Qty;
                row.Price += service.Qty * service.Price;
                row.Discount += service.DiscountAmount;
                row.NetSale += (service.Qty * service.Price) - service.DiscountAmount;
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
    const fromDate = fromDatePicker.value;
    const toDate = toDatePicker.value;
    const reportType = reportTypeSelector.value;

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
            last_data = JSON.parse(JSON.stringify(data));
            last_from_date = startDateNum;
            last_to_date = endDateNum;
        }
        await fill_table_with_data(reportType);
        await fill_charts(reportType);

    } catch (error) {
        console.error(`Failed to fetch data:`, error);
        alert(`Could not fetch report. Please try again.`);
    }
}

async function fill_charts(reportType){
    report_to_use = reportType.endsWith("NRSOnly") ? "daywiseNRSOnly" : "daywiseSales";
    current_day_wise = await formatReportData(last_data, report_to_use);
    labels = [];
    daily_chart_expected = [];
    daily_chart_actual = [];
    growth_chart_expected = [];
    growth_chart_actual = [];
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
    });
    getRemainingDates(last_date_pushed).forEach(remaining_day => {
        labels.push(formatToMonthDay(remaining_day));
        exp_value = parseInt(db_config[getDayOfWeek(remaining_day)], 10);
        if(reportType.endsWith("NRSOnly")){
            exp_value = exp_value / 2;
        }
        daily_chart_expected.push(exp_value);
//        daily_chart_actual.push(day_sale.NetSale);
        growth_expected += exp_value
//        growth_actual += day_sale.NetSale
        growth_chart_expected.push(growth_expected);
//        growth_chart_actual.push(growth_actual);
    });

    createReportChart('dailyChart', labels, daily_chart_expected, daily_chart_actual, "Day wise Target");
    createReportChart('growthChart', labels, growth_chart_expected, growth_chart_actual, "Target");
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

function createReportChart(canvasId, labels, series1, series2, title) {
  const existingChart = Chart.getChart(canvasId); // use canvas ID here

  if (existingChart) {
    existingChart.destroy(); // destroy old chart
  }

  const ctx = document.getElementById(canvasId).getContext("2d");

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expected",
          data: series1,
          borderColor: "blue",
          backgroundColor: "rgba(0,0,255,0.1)",
          fill: true,
        },
        {
          label: "Actual",
          data: series2,
          borderColor: "green",
          backgroundColor: "rgba(0,255,0,0.1)",
          fill: true,
        },
      ],
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
