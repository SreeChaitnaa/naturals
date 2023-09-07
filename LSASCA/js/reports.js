ReportOptions = {
    "Employee Sales Report": get_employee_sale_row,
    "Invoices": get_invoice_table_row,
    "Service Report": get_service_report_row,
    "Day wise Sales Report": get_day_wise_report_row
}

function employee_name(emp_id){
    emp_map = { "700946": "Raghu", "700947": "Mary", "700948": "Suresh",
                "700949": "Margarate", "700950": "Meenakshi", "700951": "Muskan",
                "700952": "Suprita", "700953": "Shekar", "700954": "Nagaraju"}
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

function LoadReports(){
    for(opt in ReportOptions){
        var option = document.createElement("option");
        option.text = opt;
        $('#reportopt')[0].add(option);
    }
    $('#fromdt')[0].valueAsDate = new Date()
    $('#todt')[0].valueAsDate = new Date()
}

function get_payment_type(pay_type){
    if(pay_type == "EVallet")
        pay_type = "PhonePe"
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

function get_invoice_table_row(bill, return_columns=false){
    if(return_columns){
        return ["Customer Name", "Phone", "Services", "Net Sale", "Total", "Payment Mode", "Payment Split"]
    }
    row_data = {}
    client_details = get_customer_details(bill.Ticket[0].ClientID)
    ticket_details = bill.Ticket_Details[0]
    row_data["Phone"] = client_details.Phone
    row_data["Customer Name"] = client_details.Name
    row_data["Services"] = bill.Ticket[0].servicedesc
    row_data["Net Sale"] = bill.Ticket[0].Total_WithoutTax
    row_data["Total"] = bill.Ticket[0].Total
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
    return row_data
}

function get_day_wise_report_row(bill, return_columns=false){
    if(return_columns){
        return ["Date", "Bills", "Services", "Net Sale", "Total"]
    }
    row_data = {}
    ticket_details = bill.Ticket_Details[0]
    row_data["Date"] = bill.Ticket[0].Created_Date.split(" ")[0]
    row_data["Bills"] = 1
    row_data["Services"] = bill.Ticket_Product_Details.length
    row_data["Net Sale"] = Number(bill.Ticket[0].Total_WithoutTax.toFixed(2))
    row_data["Total"] = Number(bill.Ticket[0].Total.toFixed(2))
    return row_data
}

function get_service_report_row(bill, return_columns=false){
    if(return_columns){
        return ["Customer Name", "Phone", "Service Name", "Employee Name", "Price", "Qty", "Mem Discount",
                "Other Discount", "Total Discount", "Net Price", "Total Price"]
    }
    services = []
    client_details = get_customer_details(bill.Ticket[0].ClientID)
    bill.Ticket_Product_Details.forEach(function(service, index, array){
        row_data = {}
        row_data["Customer Name"] = client_details.Name
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

function get_employee_sale_row(bill, return_columns=false){
    if(return_columns){
        return ["Employee Name", "Bill Count", "Service Count", "Product Count", "Total Discount", "Net Sale"]
    }
    services = []
    employees_added = []
    bill.Ticket_Product_Details.forEach(function(service, index, array){
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

function merge_rows(rows, key_name){
    merged_rows = {}
    rows.forEach(function(row, index, array){
        row_selector = row[key_name]
        if(merged_rows[row_selector] === undefined)
            merged_rows[row_selector] = structuredClone(row)
        else{
            for(key in row){
                if(key != key_name)
                    merged_rows[row_selector][key] += row[key]
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
    return merged_rows_array
}

function show_reports(){
    initiate_db()
    min_date = from_date()
    max_date = to_date()
    get_rest_data_by_date(max_date, min_date, function(err, res){
        column_names = []
        table_rows = []
        first_row = true
        selected_opt = selected_option()
        method = ReportOptions[selected_opt]
        res.forEach(function(value, index, array) {
            bill = JSON.parse(value.bill_data)
            if(first_row)
                column_names = method(null, first_row)
            first_row = false
            table_row = method(bill)
            if(Array.isArray(table_row))
                table_rows = table_rows.concat(table_row)
            else
                table_rows.push(table_row)
        })
        console.log(table_rows)
        if(selected_opt == "Employee Sales Report"){
            table_rows = merge_rows(table_rows, "Employee Name")
        }
        if(selected_opt == "Day wise Sales Report"){
            table_rows = merge_rows(table_rows, "Date")
        }
        set_table_data(column_names, table_rows)
        console.log(table_rows)
    })

}
function set_table_data(cols, jsonData){
    table = $('#reporttbl')[0]
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
    jsonData.forEach((item) => {
        let tr = document.createElement("tr");

        // Get the values of the current object in the JSON data
        let vals = Object.values(item);

        // Loop through the values and create table cells
        vals.forEach((elem) => {
           let td = document.createElement("td");
           td.innerText = elem; // Set the value as the text of the table cell
           tr.appendChild(td); // Append the table cell to the table row
        });
        table.appendChild(tr); // Append the table row to the table
    });
}
console.log("Reports JS Loaded")
