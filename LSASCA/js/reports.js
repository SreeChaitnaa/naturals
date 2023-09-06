ReportOptions = {
    "Employee Sales Report": get_invoice_table_row,
    "Invoices": get_invoice_table_row,
    "Service Report": get_service_report_row
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

function get_invoice_table_row(bill, return_columns=false){
    if(return_columns){
        column_names = []
        column_names.push("Bill No")
        column_names.push("Amount")
        return column_names
    }
    row_data = {}
    row_data["Bill No"] = bill.Ticket_Details[0].TicketID
    row_data["Amount"] = bill.Ticket_Details[0].Subtotal
    return [row_data]
}

function get_service_report_row(bill, return_columns=false){
    if(return_columns){
        column_names = []
        column_names.push("Bill No")
        column_names.push("Service Name")
        column_names.push("Employee Name")
        column_names.push("Price")
        column_names.push("Qty")
        column_names.push("Mem Discount")
        column_names.push("Other Discount")
        column_names.push("Total Discount")
        column_names.push("Net Sale")
        return column_names
    }
    services = []
    bill.Ticket_Product_Details.forEach(function(service, index, array){
        row_data = {}
        row_data["Bill No"] = bill.Ticket_Details[0].TicketID
        row_data["Service Name"] = service.Descr
        row_data["Employee Name"] = employee_name(service.EmpID)
        row_data["Price"] = service.Retail_Price
        row_data["Qty"] = service.Qty
        row_data["Mem Discount"] = service.Mem_Disc
        row_data["Other Discount"] = service.Oth_Disc
        row_data["Total Discount"] = service.Discount_Amt
        row_data["Net Sale"] = service.Total/1.18
        services.push(row_data)
    })
    return services
}

function show_reports(){
    initiate_db()
    min_date = from_date()
    max_date = to_date()
    get_rest_data_by_date(max_date, min_date, function(err, res){
        column_names = []
        table_rows = []
        first_row = true
        method = ReportOptions[selected_option()]
        res.forEach(function(value, index, array) {
            bill = JSON.parse(value.bill_data)
            if(first_row)
                column_names = method(null, first_row)
            first_row = false
            table_row = method(bill)
            console.log(table_row)
            if(Array.isArray(table_row))
                table_rows = table_rows.concat(table_row)
            else
                table_rows.push(table_row)
        })
        set_table_data(column_names, table_rows)
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
