latestData = null
table_columns = {
    "Bills" : ["TicketID", "Created_Date", "Phone", "Name", "Discount", "Total", "Tax", "Gross", "Sex", "servicedesc"],
    "DayWise" : ["Date", "Bills", "Discount", "Net Sale", "Tax", "Gross"]
}
function show_reports()
{
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "UseLast");
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    branch = $('#branch')[0].value
    fromDate = $('#fromDatePicker')[0].value
    toDate = $('#toDatePicker')[0].value
    reportType = $('#reportType')[0].value

    api = "https://ntlivewebapi.innosmarti.com/api/auth/getTicketByDate/"
    api = api + branch + ",1001," + fromDate + "," +toDate

    if(reportType == "EmpSale"){
    }

    fetch(api, requestOptions).then(response => response.json())
    .then(data => {fill_table_with_data(data, reportType)}).catch(error => {
      console.error('Error fetching data:', error);
    });
}

function format_data(data, reportType)
{
    latestData = data;

    response = {}
    switch(reportType)
    {
        case "DayWise":
            data["bills"].forEach(bill => {
                bill_date = bill["Created_Date"].split(" ")[0]
                if(!(bill_date in response))
                {
                    response[bill_date] = {}
                    table_columns["DayWise"].forEach(tk => {response[bill_date][tk] = 0})
                    response[bill_date]["Date"] = bill_date
                }
                response[bill_date]["Bills"] += 1
                response[bill_date]["Discount"] += bill["Discount"]
                response[bill_date]["Net Sale"] += bill["Total"]
                response[bill_date]["Tax"] += bill["Tax"]
                response[bill_date]["Gross"] += bill["Gross"]
            })
            response = Object.values(response).sort((a, b) => a.Date - b.Date);
            break
        case "Bills":
            response = data["bills"].sort((a, b) => b.Created_Date - a.Created_Date);
            response.forEach(bill => {
                bill["Phone"] = bill["ClientID"].slice(-10)
                bill["Name"] = bill["ClientID"].replace(bill["Phone Number"], "")
            })
    }
    return response
}

function fill_table_with_data(data, reportType)
{
    data = format_data(data, reportType)
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

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = ""
        data_keys.forEach(dk => {
            dk_value = item[dk]
            if (typeof dk_value === 'number' && !isNaN(dk_value)) {
                sum_row[dk] += dk_value
                dk_value = Math.round(dk_value);
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
        if (typeof dk_value === 'number' && !isNaN(dk_value)) {
            dk_value = Math.round(dk_value);
        }
        row.innerHTML = row.innerHTML + "<td>" + dk_value + "</td>";
    });
    row.style.fontWeight = 'bold';
    row.style.background = "grey"
    tableBody.appendChild(row);
}