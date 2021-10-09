function xpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

function CSharpTask(message, pre_task_id, post_task_id, sleep_time_in_sec) {
    //alert(window.location.href + "trying..." + window.external)
    try {
        window.external.DoTask(message, pre_task_id, post_task_id, sleep_time_in_sec)
    }
    catch(e) {
        console.log(e);
        //alert(e);
    }
}

function get_random_temp(){
    return Number(35.9 + Math.random()).toFixed(1)
}

function get_random_oximeter(){
    return Number(97 + Math.random() * 1.5).toFixed(1)
}

console.log("Test JS Loaded")

$.ajax({url: 'https://naturals-d1c4.restdb.io/rest/_jsapi.js',dataType: 'script'})
$.ajax({url: 'https://sreechaitnaa.github.io/naturals/restdb.js',dataType: 'script'})
$.ajax({url: 'https://sreechaitnaa.github.io/naturals/iServeScripts.js',dataType: 'script'})
// $.ajax({url: 'https://naturals-sreechaitnaa.vercel.app/restdb.js',dataType: 'script'})
// $.ajax({url: 'https://naturals-sreechaitnaa.vercel.app//iServeScripts.js',dataType: 'script'})
// $.ajax({url: 'http://localhost:8000/restdb.js',dataType: 'script'})
// $.ajax({url: 'http://localhost:8000/iServeScripts.js',dataType: 'script'})
// $.ajax({url: 'http://localhost/js/restdb.js',dataType: 'script'})
// $.ajax({url: 'http://localhost/js/iServeScripts.js',dataType: 'script'})


default_url = "https://iservenaturals.in/iNaturals/WalkinInvoice/WalkinInvoice";
print_url = "https://iservenaturals.in/iNaturals/Invoice/PrintBilling?invoiceID=8303830&VoucherPrint=NOTPRINT"
print_url = "https://iservenaturals.in/iNaturals/Invoice/PrintBilling?invoiceID=8368146&VoucherPrint=NOTPRINT"
allowd_urls = ["https://iservenaturals.in"]
restdb_key = "612f97f843cedb6d1f97eba5"

ReportOps = {
    DayWiseSales: '3',
    Invoices: '39',
    SmileProviderSales: '38'
    }

AppointmentMessage = "Thanks for contacting Naturals Thanisandra!%0a%0a*Appointment Details:*%0a" +
                     "Name: {CustomerName}%0a" +
                     "Date %26 Time: {DateTime}%0a" +
                     "Service: {ServiceName}%0a%0a" +
                     "*Landmark: Above Adishwar Thanisandra.*%0a" + 
                     "Location: https://goo.gl/maps/vAVWytpzvqBohhRk9"


SalesMessage = "Thank you for using our services @ Naturals Thanisandra!%0a" +
               "Please share your review here https://g.page/r/CcW7iQ6mjak6EAg/review %0a%0a" +
               "*Appointments:* +91 8861 567 550 %0a" +
               "*Feedback:* naturals.thanisandra@gmail.com %0a%0a" +
               "Follow us- %0a" +
               "*Instagram:* https://www.instagram.com/naturals.thanisandra/ %0a" +
               "*Facebook:* https://www.facebook.com/naturals.thanisandra/ %0a%0a" +
               "We look forward to serving you again soon!!!"


valid_url = false;
for (i = 0; i < allowd_urls.length; i++) {
    if (window.location.href.startsWith(allowd_urls[i])) {
        valid_url = true
        break
    }
}

if (!valid_url) {
    setTimeout(function () {
        window.location.href = default_url
    }, 10);
}

url_params = new URLSearchParams(window.location.search)

function disable_click() { 
    toastr.error("This feature not allowed for this User", "Error");
    return false 
}

if (window.location.href.startsWith("https://iservenaturals.in")) {

    if ($("button")[0].innerText == "Login") {
        // CSharpTask("Logging in...", 0, 0, 3);
        $("#username")[0].value = "KA0020";
        $("#password")[0].value = "JaiSriRam";
        //$("button")[0].click();
    }
    else{
        setTimeout(function () {
            try{
                xpath('//*[@id="stacked-menu"]/li[1]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[1]/a').onclick = disable_click
                xpath('//*[@id="stacked-menu"]/li[2]/ul/li[1]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[2]/ul/li[1]/a').onclick = disable_click
                xpath('//*[@id="stacked-menu"]/li[2]/ul/li[2]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[2]/ul/li[2]/a').onclick = disable_click
                xpath('//*[@id="stacked-menu"]/li[3]/a').onclick = NewAppointment
                xpath('//*[@id="stacked-menu"]/li[5]/ul/li[3]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[5]/ul/li[3]/a').onclick = disable_click
                xpath('//*[@id="stacked-menu"]/li[5]/ul/li[4]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[5]/ul/li[4]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[7]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[7]/a').onclick = disable_click
                xpath('//*[@id="stacked-menu"]/li[8]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[8]/a').onclick = disable_click
                xpath('//*[@id="stacked-menu"]/li[9]/a').href = ''
                xpath('//*[@id="stacked-menu"]/li[9]/a').onclick = disable_click
            }
            catch(err) {console.log(err)}
            if (url_params.has('invoiceID')) {
                invoice_id = url_params.get('invoice_id')
                if (invoice_id != null) {
                    get_invoice(invoice_id, function(err, invoice){
                        if(err){
                            alert(err)
                            return
                        }
                        setPrintData(invoice_id, JSON.parse(invoice.invoice_json))
                    })
                }
                $('#btnSendMail')[0].style.display = 'none'
                $('#btnsms')[0].style.display = 'none'
            }
            else{
                if($("#myModalCheckList")[0]){
                    if($("#myModalCheckList")[0].style.display == 'block') {
                        z = $('#myModalCheckList')[0].getElementsByClassName("list_here")[0].getElementsByTagName("input");
                        for (i = 0; i < z.length; i++) {
                            if (z[i].value == 1) {
                                z[i].checked = true
                            }
                        }
                        CheckListSubmit($("#myModalCheckList")[0]);
                    }
                }
                if(window.location.href.indexOf('WalkinInvoice') > 0){
                    setInterval(function (){
                        if($('#commonGrandTotal').val() != ''){
                            if($('#CustomerTEMP').val() == ''){
                                $('#CustomerTEMP')[0].value = get_random_temp()
                            }
                            if($('#CustomerOXIM').val() == ''){
                                $('#CustomerOXIM')[0].value = get_random_oximeter()
                            }
                        }
                    }, 500);
                }
            }
        }, 2000)

        setInterval(function () {
            $.ajax({
                url: '/iNaturals/Customer/SearchEmployee',
                type: "POST",
                dataType: "json",
                cache: false,
                async: false,
                data: { Name: '' },
                success: function (data) {
                    console.log("Keeping request alive")
                }
            });
        }, 30000);
    }
}


function NewAppointment() {
    CreateAppoinment();
    // $(document).ready(function () {
    //     BindCustomerList();
    // })

    setTimeout(function () {
        function BindCustomerList() {
            $("#CustomerName").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    console.log(request)
                    $.ajax({
                        url: '/iNaturals/Customer/SearchCustomer',
                        type: "POST",
                        dataType: "json",
                        async: false,
                        data: { Name: $("#CustomerName").val() },
                        success: function (data) {
                            CustomerList.length = 0;
                            CustomerList = data;
                            response($.map(data, function (item) {
                                //  CustomerList.push(item.CustomerNameMobileNo)
                                return { label: item.label, value: item.value };
                            }))
    
                        }
                    })
                },
                //focus: function (event, ui) {
                //    $(this).autocomplete("search", "");
                //    return false;
                //},
                select: function (event, ui) {
                    $("#CustomerName").val(ui.item.label);
                    $("#hdnCustomerID").val(ui.item.value);
    
                    return false;
                },
                change: function (event, ui) {
                    val = $(this).val();
                    //  exists = $.inArray(val, settlements);
                    var exists = ValidateCustomerSelection(val);
                    if (!exists) {
                        $(this).val("");
                        $("#hdnCustomerID").val('');
                        toastr.error("Please select the customer from list", "Error");
                        $(this).focus();
                        return false;
                    }
                    else {
                        AssigneGender(ui.item.value)
                    }
                },
                messages: {
                    noResults: "",
                    results: function (count) {
                        return count + (count > 1 ? ' results' : ' result ') + ' found';
                    }
                }
            });
        }
        BindCustomerList()
        if ($("#AppointMethod")[0].options.length == 3) {
            $("#AppointMethod")[0].options.remove(2)
            $("#AppointMethod")[0].options.remove(0)
        }
        inputs = $('#result')[0].getElementsByClassName("right")[0].getElementsByTagName("input")
        inputs[inputs.length - 3].onclick = function () { SaveAppointmentDetailsSCA(0) }
        inputs[inputs.length - 2].onclick = function () { SaveAppointmentDetailsSCA(1) }
        $("#AppointMethod")[0].options.selectedIndex = 1
    }, 2000);
}

function SaveAppointmentDetailsSCA(isClose) {

    var Customerid = $("#hdnCustomerID").val();
    var AppointMethod = $("#AppointMethod").val();

    if (Customerid == "") {
        toastr.warning("Please select the customer name...", "Warning");
        $("#hdnCustomerID").focus();
        return false;

    } else if (AppointMethod == "") {
        toastr.warning("Please select the appointment method...", "Warning");
        $("#AppointMethod").focus();
        return false;
    }

    var result = true;
    // $("#AppointmentData").val(AppointmentList);
    if (AppointmentList.length == 0) {
        toastr.warning("Please select the appointment details...", "Warning");
        return false;
    }

    var Appointment = {
        CustomerID: Customerid,
        AppointMethod: AppointMethod,
        AdvanceAmount: 0,
        ModeOfPayment: ""
    }
    var AppointmentModels = {
        Appointment: Appointment,
        Services: AppointmentList
    }

    var Customer = CustomerList.filter(function (x) { return x.value == Customerid; })[0]
    msg = AppointmentMessage.replace("{CustomerName}", Customer.CustomerName)
    msg = msg.replace("{DateTime}", AppointmentList[0].AppTime)
    msg = msg.replace("{ServiceName}", ServiceList.filter(function (x) { return x.value == AppointmentList[0].ServiceId; })[0].ServiceName)

    if (isClose == 1){
        ClosemyModalCreateAppointment();
    }
    send_whatsapp(Customer.MobileNo, msg)
}

function send_whatsapp(mobile, wa_message){
    phone_str = ""
    if(mobile != ""){
        phone_str = "phone=91" + mobile + "&"
    }
    w = window.open("https://api.whatsapp.com/send/?" + phone_str + "text=" + wa_message, '_blank')
    setTimeout(function(){w.close()}, 5000)
}

function get_table_cell(parent_obj, table_index, loc, row_index, col_index){
    current_object = parent_obj.getElementsByTagName('table')[table_index]
    if(loc != undefined){
        current_object = current_object.getElementsByTagName(loc)[0]   
    }
    if(row_index != undefined){
        current_object = current_object.getElementsByTagName('tr')[row_index]   
    }
    if(col_index != undefined){
        current_object = current_object.getElementsByTagName('td')[col_index]
    }
    return current_object
}

function get_payment_through(invoice){
    PaymentThrough = 'CASH'
    if(invoice.InvoiceDetails.IsPhonePe == "1"){
        PaymentThrough = "PHONEPE"
    }
    else if(invoice.InvoiceDetails.isCardPayment == "1"){
        PaymentThrough = "CARD"
    }
    else if(invoice.InvoiceDetails.IsPaytm == "1"){
        PaymentThrough = "PAYTM"
    }
    return PaymentThrough
}

function getPrintDiv(){
    if($('#printBill')[0].children[0].tagName == 'DIV'){
        return $('#printBill')[0].children[0]
    }
    else{
        return $('#printBill')[0]
    }
}

function remove_table(table_index){
    printDiv = getPrintDiv()
    get_table_cell(printDiv, table_index).outerHTML = ''
    if(printDiv.getElementsByTagName('hr').length > table_index){
        printDiv.getElementsByTagName('hr')[table_index].outerHTML = ''
    }
}

function changePrintPage(printDiv, billNo, invoice){

    table_counter = 1
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = invoice.Customer.ProductName
    get_table_cell(printDiv, table_counter, 'tbody', 1, 1).innerText = invoice.Customer.MobileNo
    get_table_cell(printDiv, table_counter, 'tbody', 2, 1).innerText = "KA0020/"+billNo
    get_table_cell(printDiv, table_counter, 'tbody', 3, 1).innerText = invoice.InvoiceDetails.InvoiceInitiTime

    table_counter++
    TotalQty = 0
    ServiceTotalSales = 0
    for(i in invoice.Services){
        // Add extra row if needed
        if(get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText == 'Total'){
            get_table_cell(printDiv, table_counter, 'tbody').insertRow(i)
            get_table_cell(printDiv, table_counter, 'tbody', i).innerHTML = get_table_cell(printDiv, table_counter, 'tbody', 0).innerHTML
        }

        TotalQty = +TotalQty + +invoice.Services[i].Qty
        amount = Number(invoice.Services[i].Qty * invoice.Services[i].ServicePrice).toFixed(2)
        ServiceTotalSales = +ServiceTotalSales + +amount
        get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText = invoice.Services[i].ServiceName
        get_table_cell(printDiv, table_counter, 'tbody', i, 1).innerText = invoice.Services[i].Qty
        get_table_cell(printDiv, table_counter, 'tbody', i, 2).innerText = Number(invoice.Services[i].ServicePrice).toFixed(2)
        get_table_cell(printDiv, table_counter, 'tbody', i, 3).innerText = amount
    }

    for(i=1; i<100; i++){
        if(get_table_cell(printDiv, table_counter, 'tbody', invoice.Services.length, 0).innerText == 'Total'){
            break
        }
        get_table_cell(printDiv, table_counter, 'tbody', invoice.Services.length).outerHTML = ''
    }
    get_table_cell(printDiv, table_counter, 'tbody', invoice.Services.length, 1).innerText = TotalQty
    get_table_cell(printDiv, table_counter, 'tbody', invoice.Services.length, 3).innerText = Number(ServiceTotalSales).toFixed(2)

    table_counter++
    SubTotal = +ServiceTotalSales - +invoice.InvoiceDetails.OtherDiscount - +invoice.InvoiceDetails.MemberDiscount
    get_table_cell(printDiv, table_counter, 'tbody', 0, 2).innerText = Number(ServiceTotalSales).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 1, 2).innerText = Number(invoice.InvoiceDetails.OtherDiscount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 2, 2).innerText = Number(invoice.InvoiceDetails.MemberDiscount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 3, 2).innerText = Number(SubTotal).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 4, 2).innerText = Number(invoice.InvoiceDetails.ServiceTaxAmount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tfoot', 0).getElementsByTagName('th')[2].innerText = Number(invoice.InvoiceDetails.ServiceNetSales).toFixed(2)

    table_counter++
    if(invoice.Products.length == 0){
        remove_table(table_counter)
        remove_table(table_counter)
    }
    else{
        TotalQty = 0

        for(i in invoice.Products){
            // Add extra row if needed
            if(get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText == 'Total'){
                get_table_cell(printDiv, table_counter, 'tbody').insertRow(i)
                get_table_cell(printDiv, table_counter, 'tbody', i).innerHTML = get_table_cell(printDiv, table_counter, 'tbody', 0).innerHTML
            }
            
            TotalQty = +TotalQty + +invoice.Products[i].Qty
            amount = Number(invoice.Products[i].Qty * invoice.Products[i].ProductPrice).toFixed(2)
            get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText = invoice.Products[i].ProductName
            get_table_cell(printDiv, table_counter, 'tbody', i, 1).innerText = invoice.Products[i].Qty
            get_table_cell(printDiv, table_counter, 'tbody', i, 2).innerText = Number(invoice.Products[i].ProductPrice).toFixed(2)
            get_table_cell(printDiv, table_counter, 'tbody', i, 3).innerText = amount
        }

        for(i=1; i<100; i++){
            if(get_table_cell(printDiv, table_counter, 'tbody', invoice.Products.length, 0).innerText == 'Total'){
                break
            }
            get_table_cell(printDiv, table_counter, 'tbody', invoice.Products.length).outerHTML = ''
        }
        get_table_cell(printDiv, table_counter, 'tbody', invoice.Products.length, 1).innerText = TotalQty
        get_table_cell(printDiv, table_counter, 'tbody', invoice.Products.length, 3).innerText = Number(invoice.InvoiceDetails.ProductBasicSales).toFixed(2)

        table_counter++
        get_table_cell(printDiv, table_counter, 'tbody', 0, 2).innerText = Number(invoice.InvoiceDetails.ProductBasicSales).toFixed(2)
        get_table_cell(printDiv, table_counter, 'tbody', 1, 2).innerText = Number(invoice.InvoiceDetails.ProductTaxAmount).toFixed(2)
        get_table_cell(printDiv, table_counter, 'tfoot', 0).getElementsByTagName('th')[2].innerText = Number(invoice.InvoiceDetails.ProductNetSales).toFixed(2)
        table_counter++
    }

    //Total bill round off
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = Number(invoice.InvoiceDetails.TotalAmount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 1, 1).innerText = Number(invoice.InvoiceDetails.RoundingOff).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tfoot', 0).getElementsByTagName('th')[1].innerText = Number(invoice.InvoiceDetails.GrandTotal).toFixed(2)
    
    //Payment details
    table_counter++
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = Number(invoice.InvoiceDetails.CashAmount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 1, 1).innerText = Number(invoice.InvoiceDetails.AmountReturned).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 2, 1).innerText = get_payment_through(invoice)
 
    //Tax Details
    table_counter++
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = Number(invoice.CommonTax[0].CGSTAmount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 1, 1).innerText = Number(invoice.CommonTax[0].SGSTAmount).toFixed(2)

    return table_counter
}

function setPrintData(billNo, invoice) {
    console.log(invoice)
    printDiv = getPrintDiv()
    if(printDiv.tagName == 'DIV'){
        printDiv.style.backgroundImage = ""
    }

    table_counter = changePrintPage(printDiv, billNo, invoice)

    //Temp and oximeter
    table_counter += 4
    get_table_cell(printDiv, table_counter, 'tbody', 0, 0).innerText = invoice.Customer.ProductName
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = get_random_temp()
    get_table_cell(printDiv, table_counter, 'tbody', 0, 2).innerText = get_random_oximeter()
    
    empSet = new Set()
    for(i in invoice.Services){
        empSet.add(invoice.Services[i].EmployeeName)
    }
    for(i in invoice.Products){
        empSet.add(invoice.Products[i].EmployeeName)
    }

    employees = empSet.values()
    for(i=0; i<empSet.size; i++){
        if(i+2 == get_table_cell(printDiv, table_counter, 'tbody').getElementsByTagName('tr').length){
            get_table_cell(printDiv, table_counter, 'tbody').insertRow(i+1)
            get_table_cell(printDiv, table_counter, 'tbody', i+1).innerHTML = get_table_cell(printDiv, table_counter, 'tbody', 0).innerHTML
        }
        get_table_cell(printDiv, table_counter, 'tbody', i+1, 0).innerText = employees.next().value + " {Smile Provider}"
        get_table_cell(printDiv, table_counter, 'tbody', i+1, 1).innerText = get_random_temp()
        get_table_cell(printDiv, table_counter, 'tbody', i+1, 2).innerText = get_random_oximeter()
    }

    while(get_table_cell(printDiv, table_counter, 'tbody').getElementsByTagName('tr').length > empSet.size + 2){
        get_table_cell(printDiv, table_counter, 'tbody', empSet.size+1).outerHTML = ''
    }
}

function openMMDBillPrint(billNo, invoice){
    OpenBillPrint('8368146')
    setTimeout(function(){
        printDiv = getPrintDiv()
        changePrintPage(printDiv, billNo, invoice)
    }, 1000)
}

function day_close(){
    today_date = new Date()
    $("#invfrom")[0].value = today_date.dateFormat('01/m/Y')
    $("#invTo")[0].value = today_date.dateFormat('d/m/Y')
    $('#ReportOption')[0].selectedIndex = ReportOps.DayWiseSales - 1
    Openresport();
    get_invoice_by_date(today_date.dateFormat('Ym01'), today_date.dateFormat('Ymd'), function(err, res){
        total = 0
        services_total = 0
        services_count = 0
        products_total = 0
        products_count = 0
        client_count = 0
        
        for(i=0; i<res.length; i++){
            inv = JSON.parse(res[i].invoice_json)
            total += inv.InvoiceDetails.ServiceBasicSales + inv.InvoiceDetails.ProductBasicSales
            if(res[i].date_number == today_date.dateFormat('Ymd')){
                services_total += inv.InvoiceDetails.ServiceBasicSales
                services_count += inv.Services.length
                products_total += inv.InvoiceDetails.ProductBasicSales
                products_count += inv.Products.length
                client_count++
            }
        }
        
        tbl = $('#exportTable')[0]
        total += Math.round(+get_table_cell(tbl, 0, 'tbody', today_date.getDate(), 19).innerText)
        services_total += +get_table_cell(tbl, 0, 'tbody', today_date.getDate()-1, 13).innerText
        services_count += +get_table_cell(tbl, 0, 'tbody', today_date.getDate()-1, 4).innerText
        products_total += +get_table_cell(tbl, 0, 'tbody', today_date.getDate()-1, 16).innerText
        products_count += +get_table_cell(tbl, 0, 'tbody', today_date.getDate()-1, 5).innerText
        //client_count += +get_table_cell(tbl, 0, 'tbody', today_date.getDate()-1, 19).innerText
        
        day_close_message = "Date : *" + today_date.dateFormat('d-m-Y') +"*%0a" + 
                            //"No of Clients : " + client_count + "%0a" + 
                            "No of Services : " + services_count + "%0a" + 
                            "Service Sales : " + services_total + "%0a" + 
                            "No of Products : " + products_count + "%0a" + 
                            "Product Sales : " + products_total + "%0a" + 
                            "Today Total Sales : *" + (products_total+services_total) + "*%0a" + 
                            "Month Total Sales : *" + total + "*%0a%0aClosing Now, Good Night!!!"
        console.log(day_close_message)
        send_whatsapp("9591312316", day_close_message)
    })
}

function dateFromString(datestr){
    date_time = datestr.split(' ')
    datedata = date_time[0].split("-")
    if(date_time.length == 2){
        timedata = date_time[1].split(':')
        return new Date(datedata[2], Number(datedata[1])-1, datedata[0], timedata[0], timedata[1])
    }
    else{
        return new Date(datedata[2], Number(datedata[1])-1, datedata[0])
    }
}

setTimeout(function() { 
    if($('#navbar-collapse')[0] != undefined){
        initiate_db()
        get_invoice("921", function(err, res){
            if(err == null){
                xpath('//*[@id="navbar-collapse"]/div/table/tbody/tr/td[1]').innerHTML = xpath('//*[@id="navbar-collapse"]/div/table/tbody/tr/td[1]').innerHTML.replace('I','')
            }
        })
    }
}, 5000)


//Inner methods for overwrites
SCAInvoice = "";
FirstInvoice = ""
sca_invoices = ""
SCAProductList = undefined

function update_services_and_products(){
    $.ajax({
        url: '/iNaturals/Customer/SearchService',
        type: "POST",
        dataType: "json",
        cache: false,
        async: false,
        data: { Name: '' },
        success: function (data) {
            ServiceList = data;
            // $("#CustomerName").autocomplete({ source: data });
        }
    });

    SCAProductList = undefined
    $.ajax({
        url: '/iNaturals/Invoice/SearchProduct',
        type: "POST",
        dataType: "json",
        async: false,
        data: { Name: "" },
        success: function (data) {
            //ProductList.length = 0;
            SCAProductList = data;
        }
    })
}

function doMMDBill(InvoiceModels){
    debugger
    StopMessage = "Dont Continue"
    try{
        Customer = CustomerList.filter(function (x) { return x.value == InvoiceModels.InvoiceDetails.CustomerID; })[0]
        send_whatsapp(Customer.MobileNo, SalesMessage)
        if(Customer.Membership.indexOf("Non") < 0 || Number(InvoiceModels.InvoiceDetails.MemberDiscount) > 0){
            return
        }
        NewMember = false
        for(i in InvoiceModels.Products){
            if(Number(InvoiceModels.Products[i].hdnIsMembershipSales) > 0){
                NewMember = true
                break
            }
        }
        if(NewMember || (InvoiceModels.InvoiceDetails.RemarksRating.toLowerCase().indexOf("good") > 0)){
            return
        }
        
        numerator = 1
        denominator = 3
        rand_value = Number(Math.random() * 100).toFixed() % denominator

        if (InvoiceModels.Products.length > 0 || (rand_value < numerator) || (InvoiceModels.InvoiceDetails.RemarksRating.toLowerCase().indexOf("mmd") > -1)) {
            FirstInvoice = InvoiceModels
            InvoiceModels.Customer = Customer
            for (i = 0; i < InvoiceModels.Services.length; i++) {
                InvoiceModels.Services[i].ServiceName = ServiceList.filter(function (x) { return x.value == InvoiceModels.Services[i].ServiceID; })[0].ServiceName
                InvoiceModels.Services[i].EmployeeName = EmployeeList.filter(function (x) { return x.value == InvoiceModels.Services[i].EmployeeID; })[0].EMPName
            }
            if (InvoiceModels.Products.length > 0) {
                while (SCAProductList == undefined) {
                    console.log("Waiting for Prod List")
                }
            }
            for (i = 0; i < InvoiceModels.Products.length; i++) {
                InvoiceModels.Products[i].ProductName = SCAProductList.filter(function (x) { return x.value == InvoiceModels.Products[i].ProductID; })[0].ProductName
                InvoiceModels.Products[i].EmployeeName = EmployeeList.filter(function (x) { return x.value == InvoiceModels.Products[i].EmployeeID; })[0].EMPName
            }

            SCAInvoice = InvoiceModels;
            debugger
            add_invoice(SCAInvoice, function (err, invoice_id) {
                if (err == null) {
                    console.log("New invoice is added - " + invoice_id)
                    window.location.href = print_url + "&invoice_id=" + invoice_id
                }
                else {
                    alert(err)
                    alert("Try Again")
                }
            })
            throw StopMessage
        }
    }
    catch(err){
        if(err == StopMessage){
            throw err
        }
    }
}

function get_table_structure(reportOp){
    table_struct =  '<table id="dtReport" class="table table-bordered table-condensed table-striped"><thead class="edit-table"><tr>'
    columns = []
    switch(reportOp){
        case ReportOps.Invoices:
            columns = [
                "S.No",
                "Invoice No",
                "Invoice Date",
                "Guest Name",
                "MobileNo",
                "Service Cnt",
                "Product Cnt",
                "Discount Amount",
                "Service Basic",
                "Service GST",
                "Service Net",
                "Product/Mem. Basic",
                "Product/Mem. GST",
                "Product/Mem. Net",
                "Net Total",
                "PaymentType",
                "Print"
            ]
            break
        case ReportOps.DayWiseSales:
            columns = [
                "S.No",
                "Invoice Date",
                "Outlet Code",
                "Outlet Name",
                "Services",
                "Products",
                "MEMCARDS",
                "MEMCARDS VALUE",
                "M.CGST",
                "M.SGST",
                "S.Sales",
                "S.Dis",
                "S.Mem Dis",
                "S.Basic Sales",
                "S.CGST",
                "S.SGST",
                "P.Basic Sales",
                "P.CGST",
                "P.SGST",
                "SP. Basic Sales",
                "Net Total",
                "Round Off",
                "G.Sales",
                "Cash Amount",
                "Card Amount",
                "Paytm Amount",
                "PhonePe"
            ]
    }
    for(i in columns){
        table_struct += '<th>' + columns[i] + '</th>'
    }
    table_struct += '</tr></thead><tbody></tbody></table>'
    return table_struct
}

function get_row_structure(reportOp){
    row_struct = "<tr>"
    switch(reportOp){
        case ReportOps.Invoices:
            for(i=0; i<16;i++){
                row_struct += "<td></td>"
            }
            row_struct += '<td onclick="return OpenBillPrint(&quot;8252623&quot;);" style="cursor: pointer;align-items:center;"><i class="fa fa-print fa-2x" aria-hidden="true"></i></td>'
            break
        
        case ReportOps.DayWiseSales:
            row_struct += "<td></td><td></td><td>KA0020</td><td>NT-KAR-FOFO-THANISANDRA</td>"
            for(i=0; i<3;i++){
                row_struct += "<td>0</td>"
            }
            for(i=0; i<9;i++){
                row_struct += "<td>0.0</td>"
            }
            for(i=0; i<3;i++){
                row_struct += "<td></td>"
            }
            for(i=0; i<8;i++){
                row_struct += "<td>0.0</td>"
            }
            break
    }
    return row_struct + "</tr>"
}

function check_allowed_report(pmdata){
    allowed_ops = []
    for(i in ReportOps){
        allowed_ops.push(ReportOps[i])
    }
    if(allowed_ops.includes(pmdata.ReportOption)){
        console.log("Allowed Report")
    }
    else{
        toastr.error("This report is not available for current user", "Error")
        throw "Not allowed report"
    }
}

function dateNumber_from_datestr(datestr, separator){
    return Number(datestr.split(separator).reverse().join(""))
}

function set_table_cell_string(tbl, row_index, col_index, dataStr){
    get_table_cell(tbl, 0, 'tbody', row_index, col_index).innerText = dataStr
}

function set_table_cell_number(tbl, row_index, col_index, num_value, decimals){
    if(decimals == undefined || decimals == null){
        decimals = 2
    }
    set_table_cell_string(tbl, row_index, col_index, Number(num_value).toFixed(decimals))
}

function increase_table_cell_number(tbl, row_index, col_index, num_value, decimals, dont_update_last_row){
    if(num_value > 0){
        if(decimals == undefined || decimals == null){
            decimals = 2
        }
        num_value = Number(num_value)
        current_value = Number(get_table_cell(tbl, 0, 'tbody', row_index, col_index).innerText)
        set_table_cell_string(tbl, row_index, col_index, Number(num_value + current_value).toFixed(decimals))
        if(!dont_update_last_row){
            lastrow_index = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr').length - 1
            current_value = Number(get_table_cell(tbl, 0, 'tbody', lastrow_index, col_index).innerText)
            set_table_cell_string(tbl, lastrow_index, col_index, Number(num_value + current_value).toFixed(decimals))
        }
    }
}


function update_reports(pmdata){
    get_invoice_by_date(dateNumber_from_datestr(pmdata.invTo, "/"),
    dateNumber_from_datestr(pmdata.invfrom, "/"), 
    function(err, invoices){ 
        if((invoices != null) && (invoices.length > 0)){
            row_structure = get_row_structure(pmdata.ReportOption)
            previous_exists = true
            if($('#dtNoRecords')[0]){
                $('#dtNoRecords')[0].outerHTML = get_table_structure(pmdata.ReportOption)
                $('#dtReport')[0].parentElement.id = 'exportTable'
                previous_exists = false
            }
            tbl = $('#exportTable')[0]
            if(previous_exists){
                row_structure = get_table_cell(tbl, 0, 'tbody', 0).outerHTML
            }

            for(i in invoices){
                invoices[i].date = new Date(invoices[i].date)
            }
            invoices.sort(function(x,y){return x.date-y.date})
            sca_invoices = invoices
            switch(pmdata.ReportOption){
                case ReportOps.Invoices:
                    row_counter = 0
                    for(i in invoices){
                        try{
                            while(dateFromString(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText) < invoices[i].date){row_counter++}
                        }catch{}
                        get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                        get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure

                        invoice = JSON.parse(invoices[i].invoice_json)
                        set_table_cell_string(tbl, row_counter, 2, invoices[i].date.dateFormat('d-m-Y H:i'))
                        set_table_cell_string(tbl, row_counter, 3, invoice.Customer.ProductName)
                        set_table_cell_string(tbl, row_counter, 4, "******" + invoice.Customer.MobileNo.substring(6))
                        set_table_cell_string(tbl, row_counter, 5, invoice.Services.length)
                        set_table_cell_string(tbl, row_counter, 6, invoice.Products.length)
                        set_table_cell_number(tbl, row_counter, 7, invoice.InvoiceDetails.OtherDiscount + invoice.InvoiceDetails.MemberDiscount)
                        set_table_cell_number(tbl, row_counter, 8, invoice.InvoiceDetails.ServiceBasicSales)
                        set_table_cell_number(tbl, row_counter, 9, invoice.InvoiceDetails.ServiceTaxAmount)
                        set_table_cell_number(tbl, row_counter, 10, invoice.InvoiceDetails.ServiceNetSales)
                        set_table_cell_number(tbl, row_counter, 11, invoice.InvoiceDetails.ProductBasicSales)
                        set_table_cell_number(tbl, row_counter, 12, invoice.InvoiceDetails.ProductTaxAmount)
                        set_table_cell_number(tbl, row_counter, 13, invoice.InvoiceDetails.ProductNetSales)
                        set_table_cell_number(tbl, row_counter, 14, invoice.InvoiceDetails.ProductNetSales + invoice.InvoiceDetails.ServiceNetSales)
                        paymentThrough = get_payment_through(invoice).toUpperCase()
                        if(paymentThrough != 'CASH'){
                            paymentThrough = "/"+paymentThrough
                        }
                        set_table_cell_string(tbl, row_counter, 15, paymentThrough)
                        get_table_cell(tbl, 0, 'tbody', row_counter, 16).onclick = (function(billNo, invoice) {
                                return function(){openMMDBillPrint(billNo, invoice)}
                            })(invoices[i].invoice_id, invoice)
                        row_counter++
                    }

                    total_rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr').length
                    get_table_cell(tbl, 0, 'thead', 0).deleteCell(1)
                    for(i=0; i< total_rows; i++){
                        get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                        get_table_cell(tbl, 0, 'tbody', i).deleteCell(1)
                    }
                    break
                case ReportOps.DayWiseSales:
                    row_counter = 0
                    for(var i in invoices) {
                        console.log("Value of i - " + i)
                        try{
                            while(dateNumber_from_datestr(get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText, "-") < invoices[i].date_number){row_counter++}
                        }catch{}

                        if(get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText.toLowerCase().indexOf('total') > -1 || dateNumber_from_datestr(get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText, "-") > invoices[i].date_number){
                            get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                            get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = get_row_structure(pmdata.ReportOption)
                            console.log("Value of i2 - " + i)
                            get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText = invoices[i].date.dateFormat("d-m-Y")
                        }

                        invoice = JSON.parse(invoices[i].invoice_json)
                        increase_table_cell_number(tbl, row_counter, 4, invoice.Services.length, 0)
                        increase_table_cell_number(tbl, row_counter, 5, invoice.Products.length, 0)
                        
                        increase_table_cell_number(tbl, row_counter, 10, invoice.InvoiceDetails.ServiceBasicSales + invoice.InvoiceDetails.OtherDiscount)
                        increase_table_cell_number(tbl, row_counter, 11, invoice.InvoiceDetails.OtherDiscount)
                        
                        increase_table_cell_number(tbl, row_counter, 13, invoice.InvoiceDetails.ServiceBasicSales)
                        increase_table_cell_number(tbl, row_counter, 14, invoice.InvoiceDetails.ServiceTaxAmount / 2)
                        increase_table_cell_number(tbl, row_counter, 15, invoice.InvoiceDetails.ServiceTaxAmount / 2)
                        
                        increase_table_cell_number(tbl, row_counter, 16, invoice.InvoiceDetails.ProductBasicSales)
                        increase_table_cell_number(tbl, row_counter, 17, invoice.InvoiceDetails.ProductTaxAmount / 2)
                        increase_table_cell_number(tbl, row_counter, 18, invoice.InvoiceDetails.ProductTaxAmount / 2)

                        increase_table_cell_number(tbl, row_counter, 19, invoice.InvoiceDetails.ProductBasicSales + invoice.InvoiceDetails.ServiceBasicSales)
                        increase_table_cell_number(tbl, row_counter, 20, invoice.InvoiceDetails.ProductNetSales + invoice.InvoiceDetails.ServiceNetSales)
                        increase_table_cell_number(tbl, row_counter, 21, invoice.InvoiceDetails.RoundingOff)
                        increase_table_cell_number(tbl, row_counter, 22, invoice.InvoiceDetails.GrandTotal)

                        if(invoice.InvoiceDetails.IsPhonePe == "1"){
                            increase_table_cell_number(tbl, row_counter, 26, invoice.InvoiceDetails.GrandTotal)
                        }
                        else if(invoice.InvoiceDetails.IsPaytm == "1"){
                            increase_table_cell_number(tbl, row_counter, 25, invoice.InvoiceDetails.GrandTotal)
                        }
                        else if(invoice.InvoiceDetails.isCardPayment == "1"){
                            increase_table_cell_number(tbl, row_counter, 24, invoice.InvoiceDetails.GrandTotal)
                        }
                        else{
                            increase_table_cell_number(tbl, row_counter, 23, invoice.InvoiceDetails.GrandTotal)
                        }
                    }

                    for(i=0; i< lastrow_index; i++){
                        get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                    }
                    break
                case ReportOps.SmileProviderSales:
                    rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr')
                    for(var i in invoices){
                        invoice = JSON.parse(invoices[i].invoice_json)
                        sps = []
                        for(var si in invoice.Services){
                            for(var ri=0; ri< rows.length-1; ri++){
                                if(get_table_cell(tbl, 0, 'tbody', ri, 1).innerText.toLowerCase() == invoice.Services[si].EmployeeName.toLowerCase()){
                                    if(!sps.includes(invoice.Services[si].EmployeeName)){
                                        sps.push(invoice.Services[si].EmployeeName)
                                        increase_table_cell_number(tbl, ri, 4, 1, 0)
                                    }
                                    increase_table_cell_number(tbl, ri, 5, 1, 0)
                                    increase_table_cell_number(tbl, ri, 6, invoice.Services[si].NetPrice)
                                    increase_table_cell_number(tbl, ri, 8, invoice.Services[si].DiscountAmount)

                                    increase_table_cell_number(tbl, ri, 14, invoice.Services[si].NetPrice + invoice.Services[si].DiscountAmount, 2, true)
                                    increase_table_cell_number(tbl, ri, 15, invoice.Services[si].NetPrice, 2, true)
                                    break
                                }
                            }
                        }
                        for(var pi in invoice.Products){
                            for(var ri=0; ri< rows.length-1; ri++){
                                if(get_table_cell(tbl, 0, 'tbody', ri, 1).innerText.toLowerCase() == invoice.Products[pi].EmployeeName.toLowerCase()){
                                    if(!sps.includes(invoice.Products[pi].EmployeeName)){
                                        sps.push(invoice.Products[pi].EmployeeName)
                                        increase_table_cell_number(tbl, ri, 4, 1, 0)
                                    }

                                    increase_table_cell_number(tbl, ri, 12, 1, 0)
                                    increase_table_cell_number(tbl, ri, 13, invoice.Products[pi].NetPrice)

                                    increase_table_cell_number(tbl, ri, 14, invoice.Products[pi].NetPrice, 2, true)
                                    increase_table_cell_number(tbl, ri, 15, invoice.Products[pi].NetPrice, 2, true)
                                    break
                                }
                            }
                        }
                    }
                    for(var ri=0; ri< rows.length-1; ri++){
                        console.log(tbl)
                        console.log(ri)
                        sold = Number(get_table_cell(tbl, 0, 'tbody', ri, 6).innerText)
                        if(sold > 0){
                            clientCount = Number(get_table_cell(tbl, 0, 'tbody', ri, 4).innerText)
                            set_table_cell_number(tbl, ri, 7, sold/clientCount, 0)
                        }
                    }
                    break
            }
        }
        $('#divloadingscreen').hide();
    })
}

function update_incentives(fromDate, toDate){
    toDate = dateNumber_from_datestr(toDate, "-")
    fromDate = dateNumber_from_datestr(fromDate, "-")
    get_invoice_by_date(toDate, fromDate, function(err, invoices){
        tbl = $('#exportIncentive')[0]
        rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr')
        for(var i in invoices){
            invoice = JSON.parse(invoices[i].invoice_json)
            for(var si in invoice.Services){
                for(var ri=0; ri< rows.length; ri++){
                    if(get_table_cell(tbl, 0, 'tbody', ri, 3).innerText.toLowerCase() == invoice.Services[si].EmployeeName.toLowerCase()){
                        increase_table_cell_number(tbl, ri, 6, 1, 0, true)
                        increase_table_cell_number(tbl, ri, 7, invoice.Services[si].NetPrice, 2, true)
                        break
                    }
                }
            }
        }
    })
}
