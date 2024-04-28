ReportOptions = {
    "EmployeeWise": {fun: get_employee_sale_row,
                              merge:"Employee Name"},
    "SalonWise": {fun: get_salon_wise_report_row, merge:"Salon"},
    "Invoices": {fun: get_invoice_table_row},
    "Invoices2": {fun: get_print_invoice_table_row},
    "ServiceClass": {fun: get_service_report_row},
    "DayWise Spl": {fun: get_day_wise_report_row_2, merge:"Date"},
    "ServiceWise": {fun: get_service_wise_report_row,
                            merge:"Service Name", abv_key:"Qty",
                            sort_method:sortHelperByQty},
    "DayWise": {fun: get_day_wise_report_row, merge:"Date"},
    "Appointments": {fun: get_appointments_row}
}

emp_map = { "700946": "Raghunath V",
            "700947": "Mary",
            "700949": "Margaret",
            "700950": "Meenakshi",
            "700951": "Muskan",
            "700952": "Tanu",
            "700953": "Irshad",
            "700954": "Nagaraju",
            "708446": "Ali",
            "708517": "Namitha",
            "210810748": "Shalini",
            "210810747": "Kavya",
            "210810746": "Reeta",
            "210811466": "Sneha",
            "210811678": "Komathi"
            }

sort_key = "Sr No"

non_summable_int_columns = ["Bill#", "Payment Split"]

all_bills = {}
column_names = []
sort_select = null

function add_option(selector_dd, option_value){
    var option = document.createElement("option");
    option.text = option_value;
    selector_dd.add(option);
}

function reverse_table(){
    total_row = table_rows.pop()
    table_rows = table_rows.reverse()
    table_rows.push(total_row)
    set_table_data(column_names, table_rows, true, "reporttbl")
}

function sort_table(){
    sort_key = $('#sortopt')[0].value
    total_row = table_rows.pop()
    table_rows.sort(sortHelperByKey)
    table_rows.push(total_row)
    set_table_data(column_names, table_rows, true, "reporttbl")
}

function sortHelperByQty(a, b){
    sort_key = "Qty"
    return sortHelperByKey(a, b)
}

function sortHelperByKey(a, b) {
  console.log(a, b)
  if (a[sort_key] < b[sort_key]) {
    return -1;
  }
  if (a[sort_key] > b[sort_key]) {
    return 1;
  }
  return 0;
}

function employee_name(emp_id){
    emp_id = emp_id.toString()
    if(emp_map[emp_id] != undefined){
        return emp_map[emp_id]
    }
    return "Emp-"+emp_id
}

function from_date(){
    return $('#fromdt')[0].value.replace("-","").replace("-","")
}

function to_date(){
    return $('#todt')[0].value.replace("-","").replace("-","")
}

function selected_option(){
    return $('#reportopt')[0].value
}

function login(){
    if($('#ip_pwd')[0].value == "929495"){
        show_reports_div()
    }
    else{
        $('#lbl_err')[0].innerText = "Access Denied!!!"
    }
    $('#ip_pwd')[0].value = ""
}

function show_reports_div(){
    $('#report_div')[0].style.display = "block"
    $('#pwd_div')[0].style.display = "none"
}

function LoadReports(){
    sort_select = $('#sortopt')[0]
    report_select = $('#reportopt')[0]
    for(opt in ReportOptions){
        if(opt != "Appointments" && opt != "Invoices2"){
            add_option(report_select, opt)
        }
    }
    $('#fromdt')[0].valueAsDate = new Date()
    $('#todt')[0].valueAsDate = new Date()
}

function get_payment_type(pay_type){
    if(pay_type == "EVallet")
        pay_type = "UPI"
    else if(pay_type != "Cash")
        pay_type = "Card"
    return pay_type
}

function get_pay_tender(mode, tender, change){
    if(mode == "Cash"){
        tender = tender - change
    }
    return tender
}

function get_customer_details(client_id){
    return {"Phone": client_id.substring(client_id.length-10), "Name": client_id.substring(0, client_id.length-10)}
}

function get_print_invoice_table_row(bill, return_columns=false){
    resp = get_invoice_table_row(bill, return_columns)
    if(return_columns){
        resp.pop()
        resp.push("Print")
    }
    else{
        resp["Print"] = '<input type="button" onclick=print_bill("'+ bill.id + '") value="Print" />'
    }
    return resp
}

function get_invoice_table_row(bill, return_columns=false){
    if(return_columns){
        return ["Time", "Bill#", "Guest", "Phone", "Services", "Net Sale", "Total",
                "Payment Split", "Payment Mode", "Other Discount", "NRS/SCA"]
    }
    row_data = {}
    client_details = get_customer_details(bill.Ticket[0].ClientID)
    ticket_details = bill.Ticket_Details[0]
    row_data["Phone"] = client_details.Phone
    row_data["Bill#"] = bill.Ticket[0].TicketID
    row_data["Guest"] = client_details.Name
    row_data["Services"] = bill.Ticket[0].servicedesc
    row_data["Net Sale"] = bill.Ticket[0].Total_WithoutTax
    row_data["Time"] = bill.Ticket[0].TimeMark.split(".")[0]
    row_data["Total"] = bill.Ticket[0].Total
    // DiscRS, Mem_Disc
    discount = 0
    if(bill.TblDiscDetails != undefined){
        discount = bill.TblDiscDetails[0].DiscRS
    }
    pay_type1 = get_payment_type(ticket_details.PayType1)
    row_data["Payment Mode"] = pay_type1
    row_data["Payment Split"] = get_pay_tender(pay_type1, ticket_details.Tender1, ticket_details.ChangeAmt)
    if(bill.Ticket_Details[0].PayType2 != null)
    {
        pay_type2 = get_payment_type(ticket_details.PayType2)
        tender_2 = get_pay_tender(pay_type2, ticket_details.Tender2, ticket_details.ChangeAmt)
        row_data["Payment Mode"] = pay_type1 + "/" + pay_type2
        row_data["Payment Split"] = row_data["Payment Split"] + "/" + tender_2
    }
    row_data["NRS/SCA"] = bill["is_mmd"] ? "SCA" : "NRS"
    row_data["Other Discount"] = discount
    return row_data
}

function get_salon_wise_report_row(bill, return_columns=false){
    if(return_columns){
        return ["Salon", "Bill Count", "Services", "Net Sale", "Total"]
    }
    row_data = get_day_wise_report_row(bill, return_columns)
    delete(row_data["Date"])
    if(bill["is_mmd"]){
        row_data["Salon"] = "Thanisandra" + "(SCA)"
    }
    else{
        row_data["Salon"] = "Thanisandra" + "(NRS)"
    }
    return row_data
}

function get_day_wise_report_row_2(bill, return_columns=false){
    row_data = get_day_wise_report_row(bill, return_columns)
    if(return_columns){
        return row_data
    }
    if(bill["is_mmd"]){
        row_data["Date"] = row_data["Date"] + "(SCA)"
    }
    else{
        row_data["Date"] = row_data["Date"] + "(NRS)"
    }
    return row_data
}

function get_day_wise_report_row(bill, return_columns=false){
    if(return_columns){
        return ["Date", "Bill Count", "Services", "Net Sale", "Total"]
    }
    row_data = {}
    ticket_details = bill.Ticket_Details[0]
    row_data["Date"] = bill.Ticket[0].Created_Date.split(" ")[0]
    row_data["Bill Count"] = 1
    row_data["Services"] = bill.Ticket_Product_Details.length
    row_data["Net Sale"] = Number(bill.Ticket[0].Total_WithoutTax.toFixed(2))
    row_data["Total"] = Number(bill.Ticket[0].Total.toFixed(2))
    return row_data
}

function get_appointments_row(appointment, return_columns=false){
    if(return_columns){
        return ["Date Time", "Phone", "Customer Name", "Services", "Service Provider"]
    }
    row_data = {}
    row_data["Date Time"] = (new Date(appointment.AptTime)).toLocaleString()
    row_data["Phone"] = appointment.Phone
    row_data["Services"] = appointment.Services
    row_data["Customer Name"] = appointment.Name
    row_data["Service Provider"] = appointment.SP
    return row_data
}

function get_service_report_row(bill, return_columns=false){
    if(return_columns){
        return ["Time", "Service Name", "Guest", "Phone", "Employee Name", "Qty", "Price", "Other Discount",
                "Mem Discount", "Total Discount", "Net Price", "Total Price"]
    }
    services = []
    client_details = get_customer_details(bill.Ticket[0].ClientID)
    bill.Ticket_Product_Details.forEach((service) => {
        row_data = {}
        row_data["Time"] = bill.Ticket[0].TimeMark.split(".")[0]
        row_data["Guest"] = client_details.Name
        row_data["Phone"] = client_details.Phone
        row_data["Service Name"] = service.Descr
        row_data["Employee Name"] = employee_name(service.EmpID)
        row_data["Price"] = service.Retail_Price
        row_data["Qty"] = service.Qty
        row_data["Mem Discount"] = service.Mem_Disc
        row_data["Other Discount"] = Number(service.Oth_Disc.toFixed(2))
        row_data["Total Discount"] = Number(service.Discount_Amt.toFixed(2))
        row_data["Net Price"] = Number(((service.Qty * service.Retail_Price) - service.Discount_Amt).toFixed(2))
        row_data["Total Price"] = Number(service.Total.toFixed(2))
        services.push(row_data)
    })
    return services
}

function get_service_wise_report_row(bill, return_columns=false){
    if(return_columns){
        return ["Service Name", "Price", "Qty", "Mem Discount",
                "Other Discount", "Total Discount", "Net Sale", "Total Price"]
    }
    services = []
    bill.Ticket_Product_Details.forEach((service) => {
        row_data = {}
        row_data["Service Name"] = service.Descr
        row_data["Price"] = service.Retail_Price
        row_data["Qty"] = service.Qty
        row_data["Mem Discount"] = service.Mem_Disc
        row_data["Other Discount"] = Number(service.Oth_Disc.toFixed(2))
        row_data["Total Discount"] = Number(service.Discount_Amt.toFixed(2))
        row_data["Net Sale"] = Number(((service.Qty * service.Retail_Price) - service.Discount_Amt).toFixed(2))
        row_data["Total Price"] = Number(service.Total.toFixed(2))
        services.push(row_data)
    })
    return services
}

function get_employee_sale_row(bill, return_columns=false){
    if(return_columns){
        return ["Employee Name", "Bill Count", "Service Count", "Product Count", "Total Discount", "Net Sale"]
    }
    services = []
    employees_added = []
    bill.Ticket_Product_Details.forEach((service) => {
        row_data = {}
        emp_name = employee_name(service.EmpID)
        bill_count = 1
        if(employees_added.includes(emp_name))
            bill_count = 0
        else
            employees_added.push(emp_name)
        row_data["Employee Name"] = emp_name
        row_data["Bill Count"] = bill_count
        row_data["Service Count"] = service.Qty
        row_data["Product Count"] = 0
        row_data["Total Discount"] = Number(service.Discount_Amt.toFixed(2))
        row_data["Net Sale"] = Number(((service.Qty * service.Retail_Price) - service.Discount_Amt).toFixed(2))
        services.push(row_data)
    })
    return services
}

function get_base_row(row, key_name){
    base_row = {}
    for(key in row)
        if(key != key_name)
            base_row[key] = 0
        else
            base_row[key] = row[key]
    return base_row
}

function merge_rows(rows, key_name, sort_method){
    merged_rows = {}
    total_row = get_base_row(rows[0], key_name)
    total_row[key_name] = "Total"
    rows.forEach((row) => {
        row_selector = row[key_name]
        if(merged_rows[row_selector] === undefined)
            merged_rows[row_selector] = get_base_row(row, key_name)
        for(key in row){
            if(key != key_name){
                merged_rows[row_selector][key] += row[key]
                total_row[key] += row[key]
            }
        }
    })
    merged_rows_array = []
    for(row_selector in merged_rows){
        for(key in merged_rows[row_selector])
            if(key != key_name)
                merged_rows[row_selector][key] = Number(merged_rows[row_selector][key].toFixed(2))
        merged_rows_array.push(merged_rows[row_selector])
    }
    if(sort_method != undefined){
        merged_rows_array.sort(sort_method);
    }
    for(key in total_row)
        if(key != key_name)
            total_row[key] = Number(total_row[key].toFixed(2))
    merged_rows_array.push(total_row)
    return merged_rows_array
}

function add_abv(table_rows, net_sale_key, bill_count_key){
    table_rows.forEach((row) => {
        row["ABV"] = Number((row[net_sale_key]/row[bill_count_key]).toFixed(2))
    })
    return table_rows
}

function show_bills_in_table(bills, table_name, selected_opt, show_total, reverse_rows){
    all_bills = {}
    table_rows = []
    first_row = true
    total_row = {}
    method = ReportOptions[selected_opt].fun
    occurrences = {}
    bills.forEach((value) => {
        if(occurrences[value.bill_no] === undefined){
            occurrences[value.bill_no] = 1
        }
        else{
            occurrences[value.bill_no]++
        }
    })
    last_index = bills.length - 1
    bills.forEach((value, idx) => {
        if(selected_opt == "Appointments"){
            bill = value
        }
        else{
            bill = JSON.parse(value.bill_data)
            bill["is_mmd"] = false
            if(value.is_mmd){
                bill["is_mmd"] = true
                if(occurrences[value.bill_no] == 1 && idx != last_index)
                    bill["is_mmd"] = false
            }
            bill["id"] = value._id
        }
        all_bills[value._id] = structuredClone(bill)
        if(first_row)
            column_names = method(null, first_row)
            if(sort_select != null){
                sort_select.innerHTML = ""
                add_option(sort_select, "Sr No")
            }
            column_names.forEach((col_name) => {
                total_row[col_name] = "-"
                if(sort_select != null){
                    add_option(sort_select, col_name)
                }
            })
        first_row = false
        table_row = method(bill)
        if(Array.isArray(table_row))
            table_rows = table_rows.concat(table_row)
        else
            table_rows.push(table_row)
    })
    merge_key = ReportOptions[selected_opt].merge
    if(merge_key != undefined){
        abv_key = ReportOptions[selected_opt].abv_key
        sort_method = ReportOptions[selected_opt].sort_method
        if(abv_key == undefined){
            abv_key = "Bill Count"
        }
        table_rows = merge_rows(table_rows, merge_key, sort_method)
        column_names.push("ABV")
        table_rows = add_abv(table_rows, "Net Sale", abv_key)
    }
    if(reverse_rows){
        table_rows = table_rows.reverse()
    }
    row_index = 1
    table_rows.forEach((trow) => {
        if(merge_key === undefined && show_total){
            column_names.forEach((col_name) => {
                if(typeof(trow[col_name]) == "number" && !non_summable_int_columns.includes(col_name)){
                    if(total_row[col_name] == "-"){
                        total_row[col_name] = trow[col_name]
                    }
                    else{
                        total_row[col_name] += trow[col_name]
                    }
                }
            })
        }
        trow["Sr No"] = row_index++
    })
    if(merge_key === undefined && show_total)
    {
        column_names.forEach((col_name) => {
            if(typeof(total_row[col_name]) == "number"){
                total_row[col_name] = Number(total_row[col_name].toFixed(2))
            }
        })
        table_rows.push(total_row)
    }
    column_names = ["Sr No"].concat(column_names)
    set_table_data(column_names, table_rows, show_total, table_name)
    console.log(table_rows)
}

function show_reports(){
    min_date = from_date()
    max_date = to_date()
    if(min_date > max_date){
        alert("From date can not be more than To Date")
        return
    }
    initiate_db()
    selected_opt = selected_option()
    $('#reportbtn')[0].disabled = true
    get_rest_data_by_date(max_date, min_date, function(err, res){
        if(res.length > 0){
            show_bills_in_table(res, "reporttbl", selected_opt, true, false)
            $("#reportDiv")[0].style.display = "block"
            $('#NoDataLabel')[0].style.display = "none"
        }
        else{
            $('#reportDiv')[0].style.display = "none"
            $('#NoDataLabel')[0].style.display = "block"
        }
        $('#reportbtn')[0].disabled = false
    })

}
function set_table_data(cols, jsonData, last_row_is_total, table_name){
    table = $('#'+table_name)[0]
    table.innerHTML = ""

    // Create the header element
    thead = document.createElement("thead");
    tr = document.createElement("tr");

    // Loop through the column names and create header cells
    cols.forEach((item) => {
        let th = document.createElement("th");
        th.innerText = item; // Set the column name as the text of the header cell
        tr.appendChild(th); // Append the header cell to the header row
    });
    thead.appendChild(tr); // Append the header row to the header
    table.append(tr) // Append the header to the table

    // Loop through the JSON data and create table rows
    counter = 0
    last_line_index = jsonData.length - 1
    jsonData.forEach((item) => {
        bold_this = false
        if(last_line_index == counter){
            if(last_row_is_total){
                bold_this = true
            }
        }
        console.log(item)
        counter++
        let tr = document.createElement("tr");

        if(bold_this){
            item["Sr No"] = "#"
        }
        // Loop through the values and create table cells
        cols.forEach((col_name) => {
            let td = document.createElement("td");
            td.innerHTML = item[col_name]; // Set the value as the text of the table cell
            if(bold_this)
                td.innerHTML = "<b>"+td.innerHTML+"</b>"
            tr.appendChild(td); // Append the table cell to the table row
        });
        table.appendChild(tr); // Append the table row to the table
    });
}
console.log("Reports JS Loaded")
