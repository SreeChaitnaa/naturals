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

console.log("Test JS Loaded")
$.ajax({url: 'https://naturals-d1c4.restdb.io/rest/_jsapi.js',dataType: 'script'})
$.ajax({url: 'https://sreechaitnaa.github.io/naturals/restdb.js',dataType: 'script'})
$.ajax({url: 'https://sreechaitnaa.github.io/naturals/iServeScripts.js',dataType: 'script'})

default_url = "https://iservenaturals.in/iNaturals/WalkinInvoice/WalkinInvoice";
print_url = "https://iservenaturals.in/iNaturals/Invoice/PrintBilling?invoiceID=8303830&VoucherPrint=NOTPRINT"
print_url = "https://iservenaturals.in/iNaturals/Invoice/PrintBilling?invoiceID=8368146&VoucherPrint=NOTPRINT"
allowd_urls = ["https://iservenaturals.in"]
restdb_key = "612f97f843cedb6d1f97eba5"

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

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
       return null;
    }
    else {
       return decodeURI(results[1]) || 0;
    }
}

if (window.location.href.startsWith("https://iservenaturals.in")) {
    if ($('.left')[0] != undefined) {
        $('.left')[0].style.display = 'none'
    }

    if ($('#navbar-wrapper')[0] != undefined) {
        $('#navbar-wrapper')[0].style.display = 'none'
    }

    if ($('#wrapper')[0] != undefined) {
        $('#wrapper')[0].style.padding = "0px"
    }

    if ($('#page-content-wrapper')[0] != undefined) {
        $('#page-content-wrapper')[0].style.padding = "0px"
    }

    if ($("button")[0].innerText == "Login") {
        CSharpTask("Logging in...", 0, 0, 3);
        $("#username")[0].value = "KA0020";
        $("#password")[0].value = "jaisriram1234";
        $("button")[0].click();
    }
    
    setTimeout(function () {
        if ($.urlParam('invoiceID') != null) {
            invoice_id = $.urlParam('invoice_id')
            if (invoice_id != null) {
                get_invoice(invoice_id, function(err, invoice){
                    if(err){
                        alert(err)
                        return
                    }
                    setPrintData(invoice_id, JSON.parse(invoice.invoice_json))
                })
            }
            else{
                fixPrintPage()
            }
            $('#btnSendMail')[0].style.display = 'none'
            $('#btnsms')[0].style.display = 'none'
        }
        else{
            if ($("#myModalCheckList")[0] != undefined) {
                z = $('#myModalCheckList')[0].getElementsByClassName("list_here")[0].getElementsByTagName("input");
                for (i = 0; i < z.length; i++) {
                    if (z[i].value == 1) {
                        z[i].checked = true
                    }
                }
                CheckListSubmit($("#myModalCheckList")[0]);
            }
        }
    }, 1000)

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

    if (isClose == 1)
        ClosemyModalCreateAppointment();

    //window.open("https://api.whatsapp.com/send/?phone=91" + Customer.MobileNo + "&text=" + msg)
    window.location.href = "https://api.whatsapp.com/send/?phone=91" + Customer.MobileNo + "&text=" + msg;
    CSharpTask("Send Message in WhatsApp...", 0, 1, 5);
    //return true;
}

function JSCall() {
    //window.open("https://api.whatsapp.com/send/?phone=919591312316&text=TestMessage");
    CSharpTask("abcd")
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

function fixPrintPage(){
    printDiv = getPrintDiv()

    table_counter = 7
    if(get_table_cell(printDiv, table_counter, 'tbody', 0, 0).innerText.indexOf('We are expanding') < 0){
        table_counter = 9
    }
    //Remove Naturals adv
    remove_table(table_counter)

    get_table_cell(printDiv, table_counter, 'tbody', 2, 0).innerText = 'Mail - naturals.thanisandra@gmail.com'
    get_table_cell(printDiv, table_counter, 'tbody', 3).outerHTML = ''
    
    table_counter++
    remove_table(table_counter)

    get_table_cell(printDiv, table_counter, 'thead', 0).outerHTML = '' 
    while(get_table_cell(printDiv, table_counter, 'tbody').getElementsByTagName('tr').length > 1){
        get_table_cell(printDiv, table_counter, 'tbody', 0).outerHTML = '' 
    }
}

function setPrintData(billNo, invoice) {
    console.log(invoice)
    printDiv = getPrintDiv()
    if(printDiv.tagName == 'DIV'){
        printDiv.style.backgroundImage = ""
    }

    table_counter = 1
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = invoice.Customer.ProductName
    get_table_cell(printDiv, table_counter, 'tbody', 1, 1).innerText = invoice.Customer.MobileNo
    get_table_cell(printDiv, table_counter, 'tbody', 2, 1).innerText = "KA0020/"+billNo
    get_table_cell(printDiv, table_counter, 'tbody', 3, 1).innerText = invoice.InvoiceDetails.InvoiceInitiTime

    table_counter++
    TotalQty = 0
    for(i=0; i<invoice.Services.length; i++){
        // Add extra row if needed
        if(get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText == 'Total'){
            get_table_cell(printDiv, table_counter, 'tbody').insertRow(i)
            get_table_cell(printDiv, table_counter, 'tbody', i).innerHTML = get_table_cell(printDiv, table_counter, 'tbody', 0).innerHTML
        }

        TotalQty = +TotalQty + +invoice.Services[i].Qty
        amount = Number(invoice.Services[i].Qty * invoice.Services[i].ServicePrice).toFixed(2)
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
    get_table_cell(printDiv, table_counter, 'tbody', invoice.Services.length, 3).innerText = Number(invoice.InvoiceDetails.ServiceBasicSales).toFixed(2)

    table_counter++
    SubTotal = +invoice.InvoiceDetails.ServiceBasicSales - +invoice.InvoiceDetails.OtherDiscount - +invoice.InvoiceDetails.MemberDiscount
    get_table_cell(printDiv, table_counter, 'tbody', 0, 2).innerText = Number(invoice.InvoiceDetails.ServiceBasicSales).toFixed(2)
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

        for(i=0; i<invoice.Products.length; i++){
            // Add extra row if needed
            if(get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText == 'Total'){
                get_table_cell(printDiv, table_counter, 'tbody').insertRow(i)
                get_table_cell(printDiv, table_counter, 'tbody', i).innerHTML = get_table_cell(printDiv, table_counter, 'tbody', 0).innerHTML
            }
            
            TotalQty = +TotalQty + +invoice.Products[i].Qty
            amount = Number(invoice.Products[i].Qty * invoice.Products[i].ProductPrice).toFixed(2)
            get_table_cell(printDiv, table_counter, 'tbody', i, 0).innerText = invoice.Products[i].ProductID
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
    get_table_cell(printDiv, table_counter, 'tbody', 2, 1).innerText = PaymentThrough
 
    //Tax Details
    table_counter++
    get_table_cell(printDiv, table_counter, 'tbody', 0, 1).innerText = Number(invoice.CommonTax[0].CGSTAmount).toFixed(2)
    get_table_cell(printDiv, table_counter, 'tbody', 1, 1).innerText = Number(invoice.CommonTax[0].SGSTAmount).toFixed(2)

    fixPrintPage()

}
