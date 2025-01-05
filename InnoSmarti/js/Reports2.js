latestData = null
full_data = null
table_columns = {
    "Bills" : ["TicketID", "Date Time", "Phone", "Name", "Discount", "Total", "Tax", "Gross", "Sex", "Services"],
    "DayWise" : ["Date", "Bills", "Services", "Price", "Discount", "Net Sale", "Tax", "Gross"],
    "EmpSale": ["FirstName", "TicketCount", "TotalServiceCount", "NetSalesForServices", "ProductSales", "MembershipCardSales"]
}

rest_db_data = {"1526": {
                            "db": new restdb_1526("670b471a318721cce98dcab2"),
                            "password": "929495"
                        }
                }

function login(){
    branch = $('#branch')[0].value
    login_password = rest_db_data[branch]["password"]
    if($('#ip_pwd')[0].value == login_password){
        $('#lbl_loading')[0].innerText = "Login Success, Loading Data..."
        show_reports_div()
    }
    else{
        $('#lbl_err')[0].innerText = "Access Denied!!!"
    }
    $('#ip_pwd')[0].value = ""
}

function show_reports_div(){
    branch = $('#branch')[0].value
    rest_db_data[branch]['db'].daysales.find({}, {}, function(err, response){
        if(err != null){
            console.log(err)
            $('#lbl_err')[0].innerText = err
        }
        else{
            full_data = response
            $('#report_div')[0].style.display = "block"
            $('#pwd_div')[0].style.display = "none"
        }
    })
}

function show_reports()
{
    bills_to_use = []
    fromDate = $('#fromDatePicker')[0].value.replaceAll("-", "")
    toDate = $('#toDatePicker')[0].value.replaceAll("-", "")
    reportType = $('#reportType')[0].value
    full_data.forEach(daySale => {
        if(fromDate <= daySale["datenum"] && daySale["datenum"] <= toDate){
            daySale["bills"].forEach(bill_or_bills => {
                if(Array.isArray(bill_or_bills)){
                    bills_to_use.push(...bill_or_bills)
                }
                else{
                    bills_to_use.push(bill_or_bills)
                }
            })
        }
    })

    fill_table_with_data(bills_to_use, reportType)
}

function get_bill_sums(bill){
    bill_data = {"Discount":0, "Price": 0}
    bill["ticket"].forEach(service => {
        bill_data["Discount"] += service["DiscountAmount"]
        bill_data["Price"] += service["Price"]
                        net_sale = service["Price"] - service["DiscountAmount"]
                        response[bill_date]["Net Sale"] += net_sale
                        response[bill_date]["Tax"] += (service["Total"] - net_sale)
                        response[bill_date]["Gross"] += service["Total"]
                        response[bill_date]["Services"] += 1
}

function format_data(data, reportType)
{
    latestData = data;

    response = {}
    switch(reportType)
    {
        case "DayWise":
        case "DayWiseSplit":
        case "DayWiseNRSOnly":
            data.forEach(bill => {
				add_bill = true
				console.log(bill)
				is_mmd = bill["mmd"]
                bill_date = bill["TimeMark"].split(" ")[0]
                if("DayWiseSplit" == reportType){
                    if(is_mmd){
                        bill_date = bill_date + "-SCA"
                    }
                }
                if("DayWiseNRSOnly" == reportType){
                    add_bill = !is_mmd
                }
                if(!(bill_date in response))
                {
                    response[bill_date] = {}
                    table_columns["DayWise"].forEach(tk => {response[bill_date][tk] = 0})
                    response[bill_date]["Date"] = bill_date
                }
				if(add_bill){
					response[bill_date]["Bills"] += 1
					bill["ticket"].forEach(service => {
                        response[bill_date]["Discount"] += service["DiscountAmount"]
                        response[bill_date]["Price"] += service["Price"]
                        net_sale = service["Price"] - service["DiscountAmount"]
                        response[bill_date]["Net Sale"] += net_sale
                        response[bill_date]["Tax"] += (service["Total"] - net_sale)
                        response[bill_date]["Gross"] += service["Total"]
                        response[bill_date]["Services"] += 1
					})
				}
            })
            response = Object.values(response).sort((a, b) => a.Date - b.Date);
            response = response.sort((a, b) => a.Date - b.Date);
            break
        case "Bills":
            response = data["bills"].sort((a, b) => b.Created_Date - a.Created_Date);
            response.forEach(bill => {
                bill["Phone"] = bill["ClientID"].slice(-10)
                bill["Name"] = bill["ClientID"].replace(bill["Phone"], "")
            })
            break
        case "EmpSale":
            response = data["data"]
            break
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
