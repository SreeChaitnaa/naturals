ReportOptions = {
    "EmployeeSalesReport":"Employee Sales Report",
    "Invoices":"Invoices"
}

function from_date(){
    return $('#fromdt')[0].value.replace("-","").replace("-","")
}

function to_date(){
    $('#todt')[0].value.replace("-","").replace("-","")
}

function selected_option(){
    return $('#reportopt')[0].value
}

function LoadReports(){
    for(opt in ReportOptions){
        var option = document.createElement("option");
        option.text = ReportOptions[opt];
        $('#reportopt')[0].add(option);
    }
    $('#fromdt')[0].valueAsDate = new Date()
    $('#todt')[0].valueAsDate = new Date()
}

function show_reports(){
    min_date = from_date()
    max_date = to_date()
    get_rest_data_by_date(max_date, min_date, function(err, res){
        column_names = []
        first_row = true
        res.forEach(function(value, index, array) {
            bill = JSON.parse(value.bill_data)
            
        })
    })

}
function set_table_data(cols, jsonData){
    table = $('#reporttbl')[0]

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
