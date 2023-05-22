function xpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function xpath_all(path) {
    return document.evaluate(path, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
}

function loadCSS(href) {
  var cssLink = $("<link>");
  $("head").append(cssLink); //IE hack: append before setting href
  cssLink.attr({
    rel:  "stylesheet",
    type: "text/css",
    href: href
  });
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

function get_random_temp(){
    return Number(35.9 + Math.random()).toFixed(1)
}

function get_random_oximeter(){
    return Number(97 + Math.random() * 1.5).toFixed(1)
}

console.log("Test JS Loaded")

if(document.getElementById('sca_wa_url') == null){
    wa_msg = document.createElement("div")
    document.body.appendChild(wa_msg)
    wa_msg.id = "sca_wa_url"
    document.getElementById('sca_wa_url').style.display = 'none'
}

if (window.location.href.startsWith("https://iservenaturals.in")) {
    try{
        x= xpath('//*[@id="stacked-menu"]/li[2]')
        if(x.innerText == 'Outlet Performance'){
            x.parentElement.removeChild(x)
        }
    }
    catch(e){
        console.log(e)
    }

    if($('#divloadingscreen')[0] == undefined) {
        loadCSS('https://sreechaitnaa.github.io/naturals/sca.css')
        loadingDiv = document.createElement('div')
        document.body.appendChild(loadingDiv)
        loadingDiv.outerHTML = '<div id="divloadingscreen" class="divLoading" style="display:none"><div class="Panel-Loading-BG"></div><div id="Panel-Loading"><div></div></div></div>'
    }
    $('#divloadingscreen').show()
    $.ajax({url: 'https://sreechaitnaa.github.io/naturals/nrstsd.js',dataType: 'script', success: function(){
        if ($("button")[0].innerText == "Login") {
            $("#username")[0].value = iserve_username;
            $("#password")[0].value = iserve_password;
            $("button")[0].click();
            return
        }
        db_needed_pages = ['invoice', 'home', 'reports']
        if($('#div_pwd')[0] == undefined) {
            pwd_div = document.createElement("div");
            document.body.appendChild(pwd_div);
            pwd_div.outerHTML = '<div id="div_pwd" class="divLoading" style="display:none"><div class="Panel-Loading-BG"></div>' +
                                '<div style="position:fixed; top:50%; left:50%; background-color:lightgrey; padding:1em; z-index:9010"> ' +
                                'Enter PIN: </br></br> <input id="mmd_pwd" type="password" /> </br></br> ' +
                                '<input id="btn_pwd" type="button" value="OK" style="float:right" onclick=verify_pwd() /> </div></div>'
        }
        print_url = "https://iservenaturals.in/iNaturals/Invoice/PrintBilling?invoiceID=" + branch_bill_print_ID + "&VoucherPrint=NOTPRINT"

        AppointmentMessage =    "*Save this number to NEVER MISS A DEAL...* %0a%0a" +
                                "Thanks for contacting Naturals " + branch_name + "!%0a%0a*Appointment Details:*%0a" +
                                "Name: {CustomerName}%0a" +
                                "Date %26 Time: {DateTime}%0a" +
                                "Service: {ServiceName}%0a%0a" +
                                "*Landmark: " + branch_landmark + ".*%0a" + 
                                "Location: " + branch_location_url


        SalesMessage =  "*Save this number to NEVER MISS A DEAL...* %0a%0a" +
                        "Thank you for using our services @ Naturals " + branch_name + "!%0a" +
                        "Please share your review here " + branch_review_url + " %0a%0a" +
                        "*Appointments:* +91 " + branch_phone + " %0a" +
                        "*Feedback:* " + branch_mail_id + " %0a%0a" +
                        "Follow us- %0a" +
                        "*Instagram:* " + branch_instagram_url + " %0a" +
                        "*Facebook:* " + branch_facebook_url + " %0a%0a" +
                        "We look forward to serving you again soon!!!"

        $.ajax({url: 'https://sreechaitnaa.github.io/naturals/SCAServices.js',dataType: 'script', success: function(){
            $.ajax({url: 'https://sreechaitnaa.github.io/naturals/iServeScripts.js',dataType: 'script', success: function(){
                setLinks();
                db_page = false
                for(idx in db_needed_pages){
                    db_needed_page = db_needed_pages[idx]
                    if(window.location.href.toLowerCase().indexOf(db_needed_page) > -1){
                        $.ajax({url: 'https://sreechaitnaa.github.io/naturals/restdb.js',dataType: 'script', success: LoadSCA})
                        db_page = true
                        break;
                    }
                }
                if(!db_page){ $('#divloadingscreen').hide() }
            }})
        }})
    }})
}


default_url = "https://iservenaturals.in/iNaturals/WalkinInvoice/WalkinInvoice";

allowd_urls = ["https://iservenaturals.in", "https://partners.fresha.com"]

ReportOps = {
    SalonWiseSales: '2',
    DayWiseSales: '3',
    GenderReport: '4',
    ADProductSalesReport: '5',
    ADSmileProviderSales: '7',
    InvoiceCancellations : '8',
    ADInvoices: '9',
    ADMemberShipSales: '12',
    AudirReport : '18',
    ADServiceClassReportNew: '28',
    eWalletReport : '34',
    ProductSalesReport: '37',
    SmileProviderSales: '38',
    Invoices: '39',
    MemberShipSales: '40',
    eWalletServiceReport : '41',
    CustomerRetenstion : '42',
    AdvPayments : '43',
    AppointmentsReport : '44',
    ServiceClassReportNew: '45',
    FamilyCardReports : '46',
    CheckListReport : '53',
    UnlimitedOffer : '54',
    SCAProductInventory: "SCA3",
    SCAAppointments: "SCA4"
    }
AdminReportOps = {
    SCAInvoices: "SCA1",
    SCADayWiseSales: "SCA2"
}

SCAProducts = []


valid_url = false;
is_admin = false;
smile_provider_report_allowed = false;
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

function send_fresha_appointment(){
    console.log("SCA Appt got called")
    fr_cust_name = xpath('//p[@data-qa="customer-name"]').innerText
    fr_ph_num = xpath('//p[@data-qa="contact-number-customer"]').innerText.replace("+91 ", "").replace(" ", "")
    fr_date_time = xpath('//div[@data-qa="date-dropdown"]').innerText + " " + xpath('//select[@name="items[0].start"]').selectedOptions[0].innerText
    fr_services_inputs = xpath_all('//input[@data-qa="selected-service"]')
    fr_services = []
    while(true){
        fr_service_input = fr_services_inputs.iterateNext()
        if(fr_service_input == null){ break }
        if(fr_service_input.value == ""){ break }
        fr_services.push(fr_service_input.value.split(" (")[0])
    }
    console.log("Setting Whatsapp Message")
    send_appt_message(fr_ph_num, fr_cust_name, fr_date_time, fr_services.join(", "))
}

if(window.location.href.startsWith("https://partners.fresha.com")){
    setInterval(function(){
        save_appt_btn = xpath('//button[@data-qa="save-appointment-button"]')
        if(save_appt_btn != null){
            if(save_appt_btn.onclick != send_fresha_appointment){
                console.log("Found Fresha Appt button and enabling WhatSapp")
                save_appt_btn.onclick = send_fresha_appointment
            }
        }
    }, 5000)
}

function disable_click() { 
    toastr.error("This feature not allowed for this User", "Error");
    return false 
}

function add_sca_report(report_name, report_value){
    var opt = document.createElement('option');
    opt.value = report_value;
    opt.innerHTML = report_name;
    $('#ReportOption')[0].appendChild(opt)
}

function setLinks(){
    setTimeout(function () {
        try{
            if(xpath('//*[@id="stacked-menu"]/li[3]/a').innerText == 'Masters'){
                is_admin = true
                xpath('//*[@id="stacked-menu"]/li[3]/ul/li[3]/a').href = 'https://iservenaturals.in/iNaturals/Reports/Index?dayClose'


                p = xpath('//*[@id="stacked-menu"]').children[5]
                q = document.createElement('li')
                xpath('//*[@id="stacked-menu"]').insertBefore(q, p)
                q.innerHTML = p.innerHTML
                q.children[0].children[0].setAttribute('class', 'fa fa-fw fa-2x')
                q.children[0].children[0].innerHTML = '<img width=35 src="/iNaturals/Images/Naturals_icon/psales.png"></img>'
                q.children[0].children[1].innerText = 'Add Products'
                q.children[0].href = '/iNaturals/WalkinInvoice/WalkinInvoice?AddProducts'
            }
            else{
                xpath('//*[@id="stacked-menu"]/li[3]/a').onclick = NewAppointment
                xpath('//*[@id="stacked-menu"]/li[5]/ul/li[4]/a').href = 'https://iservenaturals.in/iNaturals/Reports/Index?dayClose'
                xpath('//*[@id="stacked-menu"]/li[2]/ul/li[1]/a').href = 'https://iservenaturals.in/iNaturals/Reports/Index?appointments'
                
                //xpath('//*[@id="stacked-menu"]/li[1]/a').href = ''
                //xpath('//*[@id="stacked-menu"]/li[1]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[2]/ul/li[1]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[2]/ul/li[1]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[2]/ul/li[2]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[2]/ul/li[2]/a').onclick = disable_click

                // xpath('//*[@id="stacked-menu"]/li[5]/ul/li[3]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[5]/ul/li[3]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[5]/ul/li[4]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[7]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[7]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[8]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[8]/a').onclick = disable_click
                // xpath('//*[@id="stacked-menu"]/li[9]/a').href = ''
                // xpath('//*[@id="stacked-menu"]/li[9]/a').onclick = disable_click
            }
        }
        catch(err) {console.log(err)}
    }, 500)
}

function LoadSCA(){
    setTimeout(function () {
        try{
            if($('#navbar-collapse')[0] != undefined){
                setTimeout(function(){
                    if(SCAServices[0].value != null){
                        xpath('//*[@id="navbar-collapse"]/div/table/tbody/tr/td[1]').innerHTML = xpath('//*[@id="navbar-collapse"]/div/table/tbody/tr/td[1]').innerHTML.replace('I','')
                    }
                }, 500)
            }
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
                    $('#divloadingscreen').hide()
                })
            }
            else{
                mno = get_table_cell(getPrintDiv(), 1, 'tbody', 1, 1).innerText
                send_whatsapp(mno, SalesMessage)
                $('#divloadingscreen').hide()
            }
            $('#btnSendMail')[0].style.display = 'none'
            $('#btnsms')[0].style.display = 'none'
        }
        else if(window.location.href.indexOf('WalkinInvoice') > 0){
            if(window.location.href.indexOf('AddProducts') > 0){
                add_products_page_setup()
            }
            else{

                for(i in SCAServices){
                    SCAServices[i].cgstpercent = 9
                    SCAServices[i].kfcpercent = 0
                    SCAServices[i].label = SCAServices[i].ServiceName + "-" +SCAServices[i].ServiceCode + " - " + SCAServices[i].actualPrice
                    SCAServices[i].memberDiscount = 0
                    SCAServices[i].qty = 1
                    SCAServices[i].sgstpercent = 9
                    SCAServices[i].taxid = "1"
                    SCAServices[i].taxname = "18 %"
                    SCAServices[i].value = SCAServices[i].ServiceCode
                }

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
            $('#divloadingscreen').hide()
        }
        else if(window.location.href.indexOf('Home') > 0){
            update_dashboard()
            xpath('//*[@id="stacked-menu"]/li[1]/a').href = ''
            xpath('//*[@id="stacked-menu"]/li[1]/a').onclick = function(){return false}
        }
        else if(window.location.href.indexOf('EmpIncentive') > 0){
            FromDate = $("#fromDate").val()
            ToDate = $("#toDate").val()
            update_incentives(FromDate, ToDate)
        }
        else if(window.location.href.indexOf('Reports') > 0){
            add_sca_report("Product Inventory", ReportOps.SCAProductInventory)
            add_sca_report("Appointments", ReportOps.SCAAppointments)
            $('#txt_Search')[0].value = ''
            if(is_admin){
                add_sca_report("SCA Invoices", AdminReportOps.SCAInvoices)
                add_sca_report("SCA DayWise Sales", AdminReportOps.SCADayWiseSales)
            }
            if(window.location.href.indexOf('dayClose') > 0){
                setTimeout(day_close, 1000)
            }
            else if(window.location.href.indexOf('appointments') > 0){
                setTimeout(show_appointments, 1000)
            }
            else{
                $('#divloadingscreen').hide()
            }
        }
        else{
            $('#divloadingscreen').hide()
        }
    }, 500)
}

function verify_pwd(){
    pwd = $('#mmd_pwd')[0].value
    $('#mmd_pwd')[0].value = ""
    $('#div_pwd').hide()
    if(pwd == "727476" || pwd == "mmd" ){
        smile_provider_report_allowed = true
        Openresport();
    }
    else{
        toastr.error("This report is not available for current user", "Error");
        return -1
    }
}

function add_products_page_setup(){
    y = $('#accordion')[0]
    y.removeChild(y.children[0])
    y.removeChild(y.children[0])
    y.removeChild(y.children[1])
    xpath('//*[@id="page-content-wrapper"]/div[2]/div[2]').innerHTML = ""
    $('#productHead')[0].innerHTML = "Add Product Details"
    z = document.createElement("input")
    y.appendChild(z)
    z.type = "button"
    z.style.float = 'right'
    z.setAttribute('class', 'btn btn-lightblue')
    z.setAttribute('value', 'Add Products')
    z.onclick = function(){
        $('#divloadingscreen').show()
        counter = 0
        while(true){
            product_id = document.getElementsByName('Products[' + counter +'].ProductID')[0].value
            if(product_id == ''){
                while(counter > 0){
                    document.getElementsByClassName('removeProduct')[0].click()
                    counter--
                }
                $('#divloadingscreen').hide()
                toastr.success("Products Updated...", "Success")
                break
            }
            product_qty = document.getElementsByName('Products[' + counter +'].Qty')[0].value
            product_name = document.getElementsByName('Products[' + counter +'].ProductName')[0].value
            mrp = document.getElementsByName('Products[' + counter +'].GrandPrice')[0].value
            add_inventory(+product_id, product_name, +product_qty, mrp)
            counter++
        }
    }
}

function NewAppointment() {
    CreateAppoinment()
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
        show_sca_apt_details()
    }, 3000);
}

function show_sca_apt_details(){
    appt_method = xpath('//*[@id="result"]/div/div[1]/div[1]/div[1]/section/div/div[3]')
    app_div = appt_method.parentElement
    apt_duration = document.createElement("div")
    apt_duration.innerHTML = appt_method.innerHTML
    apt_duration.children[0].innerText = "Duration"
    appt_duration_options = apt_duration.children[1]
    appt_duration_options.id = "durationID"
    appt_duration_options.name = "Appointment.Duration"
    appt_duration_options.removeChild(appt_duration_options.children[0])
    durations_arr = ["30min", "45min", "1Hr", "1.5hrs", "2Hrs", "3Hrs", "4Hrs"]
    for(i=0; i< durations_arr.length; i++){
        opt1 = document.createElement("option")
        opt1.innerText = durations_arr[i]
        opt1.value = durations_arr[i]
        appt_duration_options.append(opt1)
    } 
    app_div.append(apt_duration)

    
    appt_note = document.createElement("div")
    appt_note.innerHTML = xpath('//*[@id="result"]/div/div[1]/div[1]/div[1]/section/div/div[4]').innerHTML
    appt_note.children[0].innerText = "Note"
    appt_note_ip = appt_note.children[1]
    appt_note_ip.id = "noteID"
    appt_note_ip.name = "noteName"
    appt_note.removeChild(appt_note.children[2])
    appt_note.removeChild(appt_note.children[2])
    app_div.append(appt_note)

    app_div.children[1].hidden = true
    app_div.children[2].hidden = true
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
    ser_name = ServiceList.filter(function (x) { return x.value == AppointmentList[0].ServiceId; })[0].ServiceName

    if (isClose == 1){
        ClosemyModalCreateAppointment();
    }
    
    send_appt_message(Customer.MobileNo, Customer.CustomerName, AppointmentList[0].AppTime, ser_name)

    add_appointment(Customer.MobileNo, Customer.CustomerName, AppointmentList[0].AppTime, ser_name, 
                    xpath('//*[@id="NaProviderId"]').value.split('-')[0].split(' ')[0], 
                    xpath('//*[@id="durationID"]').value, xpath('//*[@id="noteID"]').value)
}

function send_appt_message(apt_ph_num, apt_cust_name, apt_apt_time, apt_services){
    msg = AppointmentMessage.replace("{CustomerName}", apt_cust_name)
    msg = msg.replace("{DateTime}", apt_apt_time)
    msg = msg.replace("{ServiceName}", apt_services.replace('&', '%26'))
    send_whatsapp(apt_ph_num, msg)
}

function send_whatsapp(mobile, wa_message){
    phone_str = ""
    if(mobile != ""){
        phone_str = "phone=91" + mobile + "&"
    }
    console.log("Message - " + "https://api.whatsapp.com/send/?" + phone_str + "text=" + wa_message)
    document.getElementById('sca_wa_url').innerText = "https://api.whatsapp.com/send/?" + phone_str + "text=" + wa_message
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
        $('#printBill')[0].children[0].style['background-image'] = ''
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
    get_table_cell(printDiv, table_counter, 'tbody', 2, 1).innerText = iserve_username + "/" + billNo
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
    if(window.location.href.indexOf('invoice') > -1){
        send_whatsapp(invoice.Customer.MobileNo, SalesMessage)
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
    $("#invfrom")[0].value = today_date.dateFormat('d/m/Y')
    $("#invTo")[0].value = today_date.dateFormat('d/m/Y')
    if(is_admin){
        $('#ReportOption')[0].selectedIndex = 2
    }
    else{
        $('#ReportOption')[0].selectedIndex = 1
    }
    Openresport();
}

function show_appointments(){
    reportOptions_dropdown = $('#ReportOption')[0]
    reportOptions_dropdown.selectedIndex = reportOptions_dropdown.length - 1
    Openresport();
}

function day_close_part2(pmdata){
    tbl = $('#exportTable')[0]
    client_count = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 3).innerText
    services_count = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 4).innerText
    products_count = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 5).innerText
    mem_count = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 6).innerText
    mem_total = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 7).innerText
    services_total = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 10).innerText
    products_total = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 11).innerText
    //total = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 12).innerText
    total = services_total + mem_total
    abv = +get_table_cell(tbl, 0, 'tbody', lastrow_index, 17).innerText
    
    date_str = pmdata.invTo.replaceAll("/", "-")
    if(pmdata.invfrom != pmdata.invTo){
        date_str = pmdata.invfrom.replaceAll("/", "-") + " to " + pmdata.invTo.replaceAll("/", "-")
    }
    day_close_message = "Date : *" + date_str +"*%0a" + 
                        "No of Clients : " + client_count + "%0a" + 
                        "No of Services : " + services_count + "%0a" + 
                        "Service Sales : " + services_total + "%0a" + 
                        "No of Products : " + products_count + "%0a" + 
                        "Product Sales : " + products_total + "%0a" + 
                        "No of Memberships : " + mem_count + "%0a" + 
                        "Memberships Sales : " + mem_total + "%0a%0a" + 
                        "Total Sales : *" + total +  "*%0a" +
                        "ABV : " + abv + "%0a%0aClosing Now, Good Night!!!"
    console.log(day_close_message)
    send_whatsapp("", day_close_message)
    $('#divloadingscreen').hide()
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

function update_dashboard(){
    today_date = new Date(xpath('//*[@id="txtdate"]').innerText)
    get_invoice_by_date(today_date.dateFormat('Ymd'), today_date.dateFormat('Ymd'), 
    function(err, res){ 
        if(err){
            alert(err)
            return
        }
        rupee_symbol_innerHTML = '<span><i class="fa fa-inr"></i>&nbsp;</span>'
        
        completed_total = xpath('//*[@id="page-content-wrapper"]/div[1]/div[5]/div/div[2]/span')
        appointment_total = xpath('//*[@id="page-content-wrapper"]/div[2]/div[1]/div/div[1]/span')
        appointment_walkin = xpath('//*[@id="page-content-wrapper"]/div[2]/div[1]/div/div[2]/div[1]/span[1]/span[2]')
        customer_total = xpath('//*[@id="page-content-wrapper"]/div[2]/div[2]/div/div[1]/span')
        gender_total = xpath('//*[@id="page-content-wrapper"]/div[2]/div[3]/div/div[1]/span')

        men_new = xpath('//*[@id="page-content-wrapper"]/div[2]/div[2]/div/div[2]/table/tbody/tr[2]/td[2]/a')
        women_new = xpath('//*[@id="page-content-wrapper"]/div[2]/div[2]/div/div[2]/table/tbody/tr[2]/td[3]/a')
        new_total = xpath('//*[@id="page-content-wrapper"]/div[2]/div[2]/div/div[2]/table/tbody/tr[2]/td[4]/a')

        men_total = xpath('//*[@id="page-content-wrapper"]/div[2]/div[3]/div/div[2]/div[1]/span[1]/span')
        women_total = xpath('//*[@id="page-content-wrapper"]/div[2]/div[3]/div/div[2]/div[2]/span[1]/span')

        total_bill = xpath('//*[@id="page-content-wrapper"]/div[2]/div[4]/div/div[1]/span')
        cash_bill = xpath('//*[@id="page-content-wrapper"]/div[2]/div[4]/div/div[2]/div/div[1]/div[2]/span/span[2]')
        card_bill = xpath('//*[@id="page-content-wrapper"]/div[2]/div[4]/div/div[2]/div/div[2]/div[2]/span/span[2]')
        paytm_bill = xpath('//*[@id="page-content-wrapper"]/div[2]/div[4]/div/div[2]/div/div[2]/div[4]/span/span[2]')
        phonepe_bill = xpath('//*[@id="page-content-wrapper"]/div[2]/div[4]/div/div[2]/div/div[2]/div[6]/span/span[2]')
        
        today_bill_no_tax = xpath('//*[@id="page-content-wrapper"]/div[4]/div[1]/div/div[2]/div[1]/span[1]/span')
        this_month_bill_no_tax = xpath('//*[@id="page-content-wrapper"]/div[4]/div[2]/div/div[2]/div[1]/span[1]/span')
        this_weekend_bill_no_tax = xpath('//*[@id="page-content-wrapper"]/div[4]/div[3]/div/div[2]/div[1]/span[1]/span')
        year_this_month_bill_no_tax = xpath('//*[@id="page-content-wrapper"]/div[4]/div[4]/div/div[2]/div[1]/span[2]/span')

        appointment_total.innerText = +appointment_total.innerText + res.length
        appointment_walkin.innerText = +appointment_walkin.innerText + res.length
        customer_total.innerText = +customer_total.innerText + res.length
        gender_total.innerText = +gender_total.innerText + res.length
        new_total.innerText = +new_total.innerText + res.length
        completed_total.innerText = +completed_total.innerText + res.length

        today_total = 0
        today_total_no_tax = 0
        for(i=0; i<res.length; i++){
            invoice = JSON.parse(res[i].invoice_json)
            today_total = +today_total + +invoice.InvoiceDetails.GrandTotal
            today_total_no_tax = +today_total_no_tax + +invoice.InvoiceDetails.ServiceBasicSales + +invoice.InvoiceDetails.ProductBasicSales
            if(invoice.Customer.Gender == 'FEMALE'){
                women_new.innerText = +women_new.innerText + 1
                women_total.innerText = +women_total.innerText + 1
            }
            else{
                men_new.innerText = +men_new.innerText + 1
                men_total.innerText = +men_total.innerText + 1
            }

            paymentThrough = get_payment_through(invoice).toLowerCase()
            switch(paymentThrough){
                case "cash":
                    cash_bill.innerText = +cash_bill.innerText + +invoice.InvoiceDetails.GrandTotal
                    break
                case "card":
                    card_bill.innerText = +card_bill.innerText + +invoice.InvoiceDetails.GrandTotal
                    break
                case "paytm":
                    paytm_bill.innerText = +paytm_bill.innerText + +invoice.InvoiceDetails.GrandTotal
                    break
                case "phonepe":
                    phonepe_bill.innerText = +phonepe_bill.innerText + +invoice.InvoiceDetails.GrandTotal
                    break
            }
        }
        total_bill.innerHTML = rupee_symbol_innerHTML + (+total_bill.innerText + +today_total)
        today_bill_no_tax.innerHTML = rupee_symbol_innerHTML + Number(+today_bill_no_tax.innerText + +today_total_no_tax).toFixed(0)
        this_month_bill_no_tax.innerHTML = rupee_symbol_innerHTML + Number(+this_month_bill_no_tax.innerText + +today_total_no_tax).toFixed(0)
        if(today_date.getDay() == 6 || today_date.getDay() == 0){
            this_weekend_bill_no_tax.innerHTML = rupee_symbol_innerHTML + Number(+this_weekend_bill_no_tax.innerText + +today_total_no_tax).toFixed(0)
        }
        year_this_month_bill_no_tax.innerHTML = rupee_symbol_innerHTML + Number(+year_this_month_bill_no_tax.innerText + +today_total_no_tax).toFixed(0)
        $('#divloadingscreen').hide()
    })
}

//Inner methods for overwrites
SCAInvoice = "";
FirstInvoice = ""
sca_invoices = ""
SCAServiceList = []

function update_services_and_products(){
    SCAServiceList = []
    $.ajax({
        url: '/iNaturals/Customer/SearchService',
        type: "POST",
        dataType: "json",
        cache: false,
        async: false,
        data: { Name: '' },
        success: function (data) {
            SCAServiceList = SCAServices.concat(data);
        }
    });
}

function doMMDBill(InvoiceModels){
    debugger
    StopMessage = "Dont Continue"
    try{
        for(counter in InvoiceModels.Products){
            product_id = +InvoiceModels.Products[counter].ProductID
            product_qty = 0-(+InvoiceModels.Products[counter].Qty)
            product_name = "Unknown-"+product_id
            add_inventory(product_id, product_name, product_qty)
        }
        Customer = CustomerList.filter(function (x) { return x.value == InvoiceModels.InvoiceDetails.CustomerID; })[0]
        InvoiceModels.Customer = undefined
        debugger
        if(Customer == undefined){
            $.ajax({
                url: '/iNaturals/Customer/SearchCustomer_ByID',
                type: "POST",
                dataType: "json",
                async: false,
                data: { CustomerID: InvoiceModels.InvoiceDetails.CustomerID },
                success: function (data) {
                    InvoiceModels.Customer = data[0];
                    InvoiceModels.Customer.ProductName = InvoiceModels.Customer.CustomerName
                }
            })
        }
        else{
            InvoiceModels.Customer = Customer
        }

        NewMember = false
        CustomServices = false
        for(i in InvoiceModels.Products){
            if(Number(InvoiceModels.Products[i].hdnIsMembershipSales) > 0){
                NewMember = true
            }
            if(Number(InvoiceModels.Products[i].ProductID) > 100000){
                CustomServices = true
            }
        }

        debugger
        for(i in InvoiceModels.Services){
            if(Number(InvoiceModels.Services[i].ServiceID) > 100000){
                CustomServices = true
                break
            }
        }

        if(NewMember || (InvoiceModels.InvoiceDetails.RemarksRating.toLowerCase().indexOf("good") > -1)){
            if(CustomServices){
                toastr.error("Failure - New user can not have Custom Packages or Products", "Error");
                throw StopMessage
            }
            return
        }
        
        numerator = 0
        denominator = 10
        rand_value = Number(Math.random() * 100).toFixed() % denominator

        debugger
        if (CustomServices || InvoiceModels.Products.length > 0 || (rand_value < numerator) || (InvoiceModels.InvoiceDetails.RemarksRating.toLowerCase().indexOf("mmd") > -1)) {
            FirstInvoice = InvoiceModels
            for (i = 0; i < InvoiceModels.Services.length; i++) {
                InvoiceModels.Services[i].ServiceName = SCAServiceList.filter(function (x) { return x.value == InvoiceModels.Services[i].ServiceID; })[0].ServiceName
                InvoiceModels.Services[i].EmployeeName = EmployeeList.filter(function (x) { return x.value == InvoiceModels.Services[i].EmployeeID; })[0].EMPName
            }
            
            for (i = 0; i < InvoiceModels.Products.length; i++) {
                InvoiceModels.Products[i].ProductName = SCAProducts.filter(function (x) { return x.value == InvoiceModels.Products[i].ProductID; })[0].ProductName
                InvoiceModels.Products[i].EmployeeName = EmployeeList.filter(function (x) { return x.value == InvoiceModels.Products[i].EmployeeID; })[0].EMPName
            }
            while (InvoiceModels.Customer == undefined) {
                console.log("Waiting for Customer info")
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
        debugger
        console.log(err)
        if(err == StopMessage){
            throw err
        }
        if (InvoiceModels.Products.length > 0 || (InvoiceModels.InvoiceDetails.RemarksRating.toLowerCase().indexOf("mmd") > -1)) {
            toastr.error("Failure - " + err, "Error");
            throw err
        }
    }
}

function get_table_structure(reportOp){
    table_struct =  '<table id="dtReport" class="table table-bordered table-condensed table-striped"><thead class="edit-table"><tr>'
    columns = []
    switch(reportOp){
        case ReportOps.Invoices:
        case ReportOps.ADInvoices:
        case AdminReportOps.SCAInvoices:
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
            if(is_admin){
                columns.push("Bill To")
            }
            break
        case ReportOps.DayWiseSales:
        case AdminReportOps.SCADayWiseSales:
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
            break
        case ReportOps.GenderReport:
            columns = [
                "S.No",
                "Oulet Name",
                "Date",
                "Walk In",
                "phone",
                "Male",
                "Female",
                "Kids",
                "Male Value",
                "ABV (Male)",
                "Female Value",
                "ABV (Female)",
                "Male Value Without Tax",
                "ABV Without Tax (Male)",
                "Female Value Without Tax",
                "ABV Without Tax (Female)",
                "Kids Value",
                "ABV (Kids)",
                "ABV Without Tax (Kids)",
                "Kids Value Without Tax"
            ]
            break
        case ReportOps.SCAProductInventory:
            columns = [
                "S.No",
                "Product ID",
                "Product Name",
                "Quantity",
                "MRP"
            ]
            break
        case ReportOps.SCAAppointments:
            columns = [
                "Date Time",
                "Mobile",
                "Customer Name",
                "Services",
                "Smile Provider",
                "Duration",
                "Notes"
            ]
            break
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
        case ReportOps.ADInvoices:
        case AdminReportOps.SCAInvoices:
            for(i=0; i<16;i++){
                row_struct += "<td></td>"
            }
            row_struct += '<td onclick="return OpenBillPrint(&quot;8252623&quot;);" style="cursor: pointer;align-items:center;"><i class="fa fa-print fa-2x" aria-hidden="true"></i></td>'
            break
        
        case ReportOps.DayWiseSales:
        case AdminReportOps.SCADayWiseSales:
            row_struct += "<td></td><td></td><td>" + iserve_username + "</td><td>" + iserve_franchise_code + "</td>"
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
        
        case ReportOps.GenderReport:
            row_struct += "<td></td><td>" + iserve_franchise_code + "</td><td></td>"
            for(i=0; i<5;i++){
                row_struct += "<td>0</td>"
            }
            for(i=0; i<3;i++){
                row_struct += "<td>0.00</td>"
            }
            break
        
        case ReportOps.SalonWiseSales:
            row_struct += "<td>1</td><td>" + iserve_username + "</td><td>" + iserve_franchise_code + "</td>"
            for(i=2; i<17; i++){
                row_struct += "<td></td>"
            }
            row_struct += "<td>" + iserver_franchise_am + "</td><td>" + iserver_franchise_rm + "</td>"
            break
        case ReportOps.SCAProductInventory:
            for(i=0; i<5; i++){
                row_struct += "<td></td>"
            }
            break
        case ReportOps.SCAAppointments:
            for(i=0; i<7; i++){
                row_struct += "<td></td>"
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
    if(is_admin){
        for(i in AdminReportOps){
            allowed_ops.push(AdminReportOps[i])
        }
    }
    if(allowed_ops.includes(pmdata.ReportOption)){
        console.log("Allowed Report")
        if(pmdata.ReportOption == ReportOps.SmileProviderSales && !is_admin){
            if(smile_provider_report_allowed){
                smile_provider_report_allowed = false
                return pmdata
            }
            else{
                today_date = new Date()
                if(pmdata.invfrom == today_date.dateFormat('d/m/Y')){ return pmdata }
                $('#div_pwd').show()
                throw "Need PIN Verification"
            }
        }
        if(pmdata.ReportOption.startsWith("SCA")){
            if(pmdata.ReportOption == ReportOps.SCAProductInventory){
                pmdata.invTo = "0"
                pmdata.invfrom = "0"
            }
            if(pmdata.ReportOption == ReportOps.SCAAppointments){
                pmdata.invTo = "-1"
                pmdata.invfrom = "-1"
            }
            $('#divloadingscreen').show()
            update_reports(pmdata, true)
            throw "Handled by SCA"
        }
        return pmdata
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

function update_reports(pmdata, sca_report){
    if(sca_report == undefined){
        sca_report = false
    }
    console.log(pmdata)
    update_services_and_products()
    get_invoice_by_date(dateNumber_from_datestr(pmdata.invTo, "/"),
    dateNumber_from_datestr(pmdata.invfrom, "/"), 
    function(err, invoices){ 
        if((invoices != null) && (invoices.length > 0)){
            row_structure = get_row_structure(pmdata.ReportOption)
            previous_exists = true
            if(sca_report){
                if($('#exportTable')[0] == undefined){
                    new_table = document.createElement("div")
                    $('#Reportresult')[0].appendChild(new_table)
                    new_table.id = 'exportTable'
                    new_table.innerHTML = get_table_structure(pmdata.ReportOption)
                }
                else{
                    $('#exportTable')[0].innerHTML = get_table_structure(pmdata.ReportOption)
                }
                previous_exists = false
            }
            if($('#dtNoRecords')[0]){
                $('#dtNoRecords')[0].outerHTML = get_table_structure(pmdata.ReportOption)
                $('#dtReport')[0].parentElement.id = 'exportTable'
                previous_exists = false
            }
            tbl = $('#exportTable')[0]
            if(previous_exists){
                row_structure = get_table_cell(tbl, 0, 'tbody', 0).outerHTML
                if(is_admin){
                    if(pmdata.ReportOption == ReportOps.ADInvoices){
                        get_table_cell(tbl, 0, 'thead', 0).appendChild(document.createElement('th'))
                        get_table_cell(tbl, 0, 'thead', 0).getElementsByTagName('th')[17].innerText = "Bill To"
                    }
                }
            }
            if(pmdata.ReportOption == ReportOps.SCAProductInventory){
                invoices.sort(function(a,b){return (a.prod_name > b.prod_name) ? 1 : ((a.prod_name < b.prod_name) ? -1 : 0)})
                total_prod_count = 0
                for(row_counter in invoices){
                    product = invoices[row_counter]
                    get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                    get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure
                    set_table_cell_string(tbl, row_counter, 0, +row_counter+1)
                    set_table_cell_string(tbl, row_counter, 1, product.prod_id)
                    set_table_cell_string(tbl, row_counter, 2, product.prod_name)
                    set_table_cell_string(tbl, row_counter, 3, product.count)
                    set_table_cell_string(tbl, row_counter, 4, product.mrp)
                    total_prod_count += product.count
                }
                row_counter = invoices.length
                get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure
                set_table_cell_string(tbl, row_counter, 2, "Total")
                set_table_cell_string(tbl, row_counter, 3, total_prod_count)
            }
            else if(pmdata.ReportOption == ReportOps.SCAAppointments){
                for(row_counter in invoices){
                    invoices[row_counter].apt_data = JSON.parse(invoices[row_counter].apt_data)
                    parts = invoices[row_counter].apt_data.apt_date_time.split(" ")
                    invoices[row_counter].date_obj = new Date(parts[0].split("-").reverse().join("-") + " " + parts[1] + ":00")
                }
                invoices.sort(function(a,b){return (a.date_obj > b.date_obj) ? 1 : ((a.date_obj < b.date_obj) ? -1 : 0)})
                for(row_counter in invoices){
                    get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                    get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure

                    appt = invoices[row_counter].apt_data
                    set_table_cell_string(tbl, row_counter, 0, appt.apt_date_time)
                    set_table_cell_string(tbl, row_counter, 1, appt.phone_number)
                    set_table_cell_string(tbl, row_counter, 2, appt.cust_name)
                    set_table_cell_string(tbl, row_counter, 3, appt.services)
                    set_table_cell_string(tbl, row_counter, 4, appt.smile_provider)
                    set_table_cell_string(tbl, row_counter, 5, appt.duration)
                    set_table_cell_string(tbl, row_counter, 6, appt.notes)
                }
            }
            else{
                for(i in invoices){
                    invoices[i].date = new Date(invoices[i].date)
                }
                invoices.sort(function(x,y){return x.date-y.date})
                sca_invoices = invoices
                ilen = invoices.length
                switch(pmdata.ReportOption){
                    case ReportOps.Invoices:
                    case ReportOps.ADInvoices:
                    case AdminReportOps.SCAInvoices:
                        row_counter = 0
                        for(i in invoices){
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            try{
                                while(dateFromString(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText) < invoices[i].date){row_counter++}
                            }catch{}
                            get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                            get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure

                            invoice = JSON.parse(invoices[i].invoice_json)
                            set_table_cell_string(tbl, row_counter, 2, invoices[i].date.dateFormat('d-m-Y H:i'))
                            set_table_cell_string(tbl, row_counter, 3, invoice.Customer.ProductName)
                            if(is_admin){
                                set_table_cell_string(tbl, row_counter, 4, invoice.Customer.MobileNo)
                            }
                            else{
                                set_table_cell_string(tbl, row_counter, 4, "******" + invoice.Customer.MobileNo.substring(6))
                            }
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
                            if(is_admin){
                                if(pmdata.ReportOption == ReportOps.ADInvoices){
                                    get_table_cell(tbl, 0, 'tbody', row_counter).insertCell(17)
                                    set_table_cell_string(tbl, row_counter, 17, "SCA")
                                }
                            }    
                            row_counter++
                        }

                        total_rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr').length
                        get_table_cell(tbl, 0, 'thead', 0).deleteCell(1)
                        for(i=0; i< total_rows; i++){
                            if(is_admin){
                                if(get_table_cell(tbl, 0, 'tbody', i, 17) == undefined){
                                    get_table_cell(tbl, 0, 'tbody', i).insertCell(17)
                                    set_table_cell_string(tbl, i, 17, "Naturals")
                                }
                            }
                            get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                            get_table_cell(tbl, 0, 'tbody', i).deleteCell(1)
                        }
                        break
                    case ReportOps.DayWiseSales:
                    case AdminReportOps.SCADayWiseSales:
                        row_counter = 0
                        if(pmdata.ReportOption == AdminReportOps.SCADayWiseSales){
                            total_tr = document.createElement('tr')
                            get_table_cell(tbl, 0, 'tbody').appendChild(total_tr)
                            total_tr_innerHTML = "<td></td><td>Total</td>"
                            for(tr_c = 2; tr_c < 27; tr_c++){
                                total_tr_innerHTML = total_tr_innerHTML + "<td></td>"
                            }
                            total_tr.innerHTML = total_tr_innerHTML
                        }
                        for(var i in invoices) {
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            try{
                                while(dateNumber_from_datestr(get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText, "-") < invoices[i].date_number){row_counter++}
                            }catch{}

                            if(get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText.toLowerCase().indexOf('total') > -1 || dateNumber_from_datestr(get_table_cell(tbl, 0, 'tbody', row_counter, 1).innerText, "-") > invoices[i].date_number){
                                get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                                get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = get_row_structure(pmdata.ReportOption)
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
                    
                    case ReportOps.GenderReport:
                        row_counter = 0
                        for(var i in invoices) {
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            try{
                                while(dateNumber_from_datestr(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText, "-") < invoices[i].date_number){row_counter++}
                            }catch{}

                            // || dateNumber_from_datestr(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText, "-") > invoices[i].date_number
                            if(get_table_cell(tbl, 0, 'tbody', row_counter) == undefined){
                                get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                                get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = get_row_structure(pmdata.ReportOption)
                                get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText = invoices[i].date.dateFormat("d-m-Y")
                            }

                            invoice = JSON.parse(invoices[i].invoice_json)
                            increase_table_cell_number(tbl, row_counter, 3, 1, 0, true)
                            if(invoice.Customer.Gender == "MALE") {
                                increase_table_cell_number(tbl, row_counter, 5, 1, 0, true)
                                increase_table_cell_number(tbl, row_counter, 8, invoice.InvoiceDetails.ServiceNetSales, 2, true)
                                increase_table_cell_number(tbl, row_counter, 12, invoice.InvoiceDetails.ServiceBasicSales, 2, true)
                            }
                            else{
                                increase_table_cell_number(tbl, row_counter, 6, 1, 0, true)
                                increase_table_cell_number(tbl, row_counter, 10, invoice.InvoiceDetails.ServiceNetSales, 2, true)
                                increase_table_cell_number(tbl, row_counter, 14, invoice.InvoiceDetails.ServiceBasicSales, 2, true)
                            }
                        }

                        for(i=0; i<= row_counter; i++){
                            get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                            menCount = Number(get_table_cell(tbl, 0, 'tbody', i, 5).innerText)
                            womenCount = Number(get_table_cell(tbl, 0, 'tbody', i, 6).innerText)
                            set_table_cell_number(tbl, 0, 9, Number(get_table_cell(tbl, 0, 'tbody', i, 8).innerText)/menCount, 2)
                            set_table_cell_number(tbl, 0, 11, Number(get_table_cell(tbl, 0, 'tbody', i, 10).innerText)/womenCount, 2)
                            set_table_cell_number(tbl, 0, 13, Number(get_table_cell(tbl, 0, 'tbody', i, 12).innerText)/menCount, 2)
                            set_table_cell_number(tbl, 0, 15, Number(get_table_cell(tbl, 0, 'tbody', i, 14).innerText)/womenCount, 2)
                        }
                        break
                    case ReportOps.SmileProviderSales:
                    case ReportOps.ADSmileProviderSales:
                        rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr')
                        for(var i in invoices){
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            invoice = JSON.parse(invoices[i].invoice_json)
                            sps = []
                            for(var si in invoice.Services){
                                for(var ri=0; ri< rows.length-1; ri++){
                                    if(get_table_cell(tbl, 0, 'tbody', ri, 1).innerText.toLowerCase().trim() == invoice.Services[si].EmployeeName.toLowerCase().trim()){
                                        if(!sps.includes(invoice.Services[si].EmployeeName)){
                                            sps.push(invoice.Services[si].EmployeeName)
                                            increase_table_cell_number(tbl, ri, 4, 1, 0)
                                        }
                                        increase_table_cell_number(tbl, ri, 5, 1, 0)
                                        increase_table_cell_number(tbl, ri, 6, invoice.Services[si].NetPrice)
                                        increase_table_cell_number(tbl, ri, 8, invoice.Services[si].DiscountAmount)

                                        increase_table_cell_number(tbl, ri, 14, invoice.Services[si].NetPrice + invoice.Services[si].DiscountAmount, 2)
                                        increase_table_cell_number(tbl, ri, 15, invoice.Services[si].NetPrice, 2)
                                        break
                                    }
                                }
                            }
                            for(var pi in invoice.Products){
                                for(var ri=0; ri< rows.length-1; ri++){
                                    if(get_table_cell(tbl, 0, 'tbody', ri, 1).innerText.toLowerCase().trim() == invoice.Products[pi].EmployeeName.toLowerCase().trim()){
                                        if(!sps.includes(invoice.Products[pi].EmployeeName)){
                                            sps.push(invoice.Products[pi].EmployeeName)
                                            increase_table_cell_number(tbl, ri, 4, 1, 0)
                                        }

                                        increase_table_cell_number(tbl, ri, 12, 1, 0)
                                        increase_table_cell_number(tbl, ri, 13, invoice.Products[pi].NetPrice)

                                        increase_table_cell_number(tbl, ri, 14, invoice.Products[pi].NetPrice, 2)
                                        increase_table_cell_number(tbl, ri, 15, invoice.Products[pi].NetPrice, 2)
                                        break
                                    }
                                }
                            }
                        }
                        for(var ri=0; ri< rows.length-1; ri++){
                            sold = Number(get_table_cell(tbl, 0, 'tbody', ri, 6).innerText)
                            if(sold > 0){
                                clientCount = Number(get_table_cell(tbl, 0, 'tbody', ri, 4).innerText)
                                set_table_cell_number(tbl, ri, 7, sold/clientCount, 0)
                            }
                        }
                        break
                
                    case ReportOps.SalonWiseSales:
                        row_counter = 0
                        if(is_admin){
                            if(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText.toLowerCase().indexOf('total') < 0){
                                row_counter++
                            }
                        }

                        if(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText.toLowerCase().indexOf('total') > -1){
                            get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                            get_table_cell(tbl, 0, 'tbody', row_counter).outerHTML = get_row_structure(pmdata.ReportOption)
                            get_table_cell(tbl, 0, 'tbody', row_counter+1, 0).innerText = 2
                            if(is_admin){
                                get_table_cell(tbl, 0, 'tbody', row_counter, 0).innerText = get_table_cell(tbl, 0, 'tbody', row_counter, 0).innerText + "-SCA"
                            }
                        }
                        for(var i in invoices) {
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            invoice = JSON.parse(invoices[i].invoice_json)
                            increase_table_cell_number(tbl, row_counter, 3, 1, 0)
                            increase_table_cell_number(tbl, row_counter, 4, invoice.Services.length, 0)
                            increase_table_cell_number(tbl, row_counter, 5, invoice.Products.length, 0)
                            
                            increase_table_cell_number(tbl, row_counter, 9, invoice.InvoiceDetails.MemberDiscount + invoice.InvoiceDetails.OtherDiscount)

                            increase_table_cell_number(tbl, row_counter, 10, invoice.InvoiceDetails.ServiceBasicSales)
                            increase_table_cell_number(tbl, row_counter, 11, invoice.InvoiceDetails.ProductBasicSales)

                            increase_table_cell_number(tbl, row_counter, 12, invoice.InvoiceDetails.ProductBasicSales + invoice.InvoiceDetails.ServiceBasicSales)
                            increase_table_cell_number(tbl, row_counter, 13, invoice.InvoiceDetails.ServiceTaxAmount + invoice.InvoiceDetails.ProductTaxAmount)
                            increase_table_cell_number(tbl, row_counter, 14, invoice.InvoiceDetails.ProductNetSales + invoice.InvoiceDetails.ServiceNetSales)

                            increase_table_cell_number(tbl, row_counter, 15, invoice.InvoiceDetails.RoundingOff)
                            increase_table_cell_number(tbl, row_counter, 16, invoice.InvoiceDetails.GrandTotal)
                        }
                        sold = Number(get_table_cell(tbl, 0, 'tbody', row_counter, 10).innerText)
                        if(sold > 0){
                            clientCount = Number(get_table_cell(tbl, 0, 'tbody', row_counter, 3).innerText)
                            set_table_cell_number(tbl, row_counter, 17, sold/clientCount)
                        }
                        sold = Number(get_table_cell(tbl, 0, 'tbody', row_counter+1, 10).innerText)
                        if(sold > 0){
                            clientCount = Number(get_table_cell(tbl, 0, 'tbody', row_counter+1, 3).innerText)
                            set_table_cell_number(tbl, row_counter+1, 17, sold/clientCount)
                        }
                        if(window.location.href.indexOf('dayClose') > 0){
                            day_close_part2(pmdata)
                        }
                        break
                    case ReportOps.ServiceClassReportNew:
                    case ReportOps.ADServiceClassReportNew:
                        row_counter = 0
                        for(i in invoices){
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            try{
                                while(dateFromString(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText) < invoices[i].date){row_counter++}
                            }catch{}

                            invoice = JSON.parse(invoices[i].invoice_json)
                            for(j in invoice.Services){
                                get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                                get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure
                                set_table_cell_number(tbl, row_counter, 10, 0)
                                set_table_cell_number(tbl, row_counter, 14, 0)
                                set_table_cell_number(tbl, row_counter, 15, 0)
                                set_table_cell_number(tbl, row_counter, 16, 0)
                                set_table_cell_number(tbl, row_counter, 17, 0)
                                set_table_cell_number(tbl, row_counter, 18, 0)

                                set_table_cell_string(tbl, row_counter, 1, iserve_username + "/" + invoices[i].invoice_id)
                                set_table_cell_string(tbl, row_counter, 2, invoices[i].date.dateFormat('d-m-Y'))
                                set_table_cell_string(tbl, row_counter, 3, iserve_franchise_code)
                                service = invoice.Services[j]
                                set_table_cell_string(tbl, row_counter, 4, service.ServiceName)
                                try{
                                    service_code = SCAServiceList.filter(function(x){return x.ServiceName == service.ServiceName})[0].ServiceCode
                                    set_table_cell_string(tbl, row_counter, 5, service_code)
                                }
                                catch{
                                set_table_cell_string(tbl, row_counter, 5, '')
                                }
                                set_table_cell_string(tbl, row_counter, 6, invoice.Customer.ProductName)
                                if(is_admin){
                                    set_table_cell_string(tbl, row_counter, 7, invoice.Customer.MobileNo)
                                }
                                else{
                                    set_table_cell_string(tbl, row_counter, 7, "******" + invoice.Customer.MobileNo.substring(6))
                                }
                                set_table_cell_string(tbl, row_counter, 8, '')
                                set_table_cell_string(tbl, row_counter, 9, service.EmployeeName)
                                increase_table_cell_number(tbl, row_counter, 10, service.Qty, 0)
                                set_table_cell_number(tbl, row_counter, 11, service.ServicePrice, 0)
                                set_table_cell_number(tbl, row_counter, 12, service.DiscountAmount, 0)
                                set_table_cell_number(tbl, row_counter, 13, service.MemberDiscount)
                                increase_table_cell_number(tbl, row_counter, 14, service.NetPrice, 0)
                                increase_table_cell_number(tbl, row_counter, 15, service.serviceCGST)
                                increase_table_cell_number(tbl, row_counter, 16, service.serviceSGST)
                                increase_table_cell_number(tbl, row_counter, 17, service.TaxPercentage, 0)
                                increase_table_cell_number(tbl, row_counter, 18, service.GrandPrice, 0)
                                paymentThrough = get_payment_through(invoice).toUpperCase()
                                if(paymentThrough != 'CASH'){
                                    paymentThrough = "/"+paymentThrough
                                }
                                set_table_cell_string(tbl, row_counter, 19, paymentThrough)
                                set_table_cell_string(tbl, row_counter, 22, 'N')  
                                row_counter++
                            }
                        }

                        total_rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr').length
                        if(!is_admin){
                            get_table_cell(tbl, 0, 'thead', 0).deleteCell(1)
                            get_table_cell(tbl, 0, 'thead', 0).deleteCell(4)
                            get_table_cell(tbl, 0, 'thead', 0).deleteCell(6)
                        }
                        for(i=0; i< total_rows; i++){
                            get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                            if(!is_admin){
                                get_table_cell(tbl, 0, 'tbody', i).deleteCell(1)
                                get_table_cell(tbl, 0, 'tbody', i).deleteCell(7)
                            }
                        }
                        break
                    case ReportOps.ProductSalesReport:
                        row_counter = 0
                        for(i in invoices){
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            try{
                                while(dateFromString(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText) < invoices[i].date){row_counter++}
                            }catch{}

                            invoice = JSON.parse(invoices[i].invoice_json)
                            for(j in invoice.Products){
                                get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                                get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure
                                set_table_cell_number(tbl, row_counter, 8, 0)
                                set_table_cell_number(tbl, row_counter, 9, 0)
                                set_table_cell_number(tbl, row_counter, 10, 0)
                                set_table_cell_number(tbl, row_counter, 11, 0)
                                set_table_cell_number(tbl, row_counter, 12, 0)
                                set_table_cell_number(tbl, row_counter, 13, 0)

                                set_table_cell_string(tbl, row_counter, 1, iserve_username + "/" + invoices[i].invoice_id)
                                set_table_cell_string(tbl, row_counter, 2, invoices[i].date.dateFormat('d-m-Y'))
                                set_table_cell_string(tbl, row_counter, 3, iserve_franchise_code)
                                product = invoice.Products[j]
                                console.log(product)
                                set_table_cell_string(tbl, row_counter, 4, product.ProductName)
                                // set_table_cell_string(tbl, row_counter, 5, "")
                                set_table_cell_string(tbl, row_counter, 6, invoice.Customer.ProductName)
                                set_table_cell_string(tbl, row_counter, 7, "******" + invoice.Customer.MobileNo.substring(6))
                                increase_table_cell_number(tbl, row_counter, 8, product.Qty, 0)
                                set_table_cell_number(tbl, row_counter, 9, product.ProductPrice)
                                increase_table_cell_number(tbl, row_counter, 10, product.NetPrice)
                                increase_table_cell_number(tbl, row_counter, 11, product.productCGST)
                                increase_table_cell_number(tbl, row_counter, 12, product.productSGST)
                                increase_table_cell_number(tbl, row_counter, 13, product.GrandPrice)
                                paymentThrough = get_payment_through(invoice).toUpperCase()
                                if(paymentThrough != 'CASH'){
                                    paymentThrough = "/"+paymentThrough
                                }
                                set_table_cell_string(tbl, row_counter, 14, paymentThrough)
                                set_table_cell_string(tbl, row_counter, 17, 'N')  
                                // set_table_cell_string(tbl, row_counter, 18, '')  
                                set_table_cell_string(tbl, row_counter, 19, product.EmployeeName)  
                                row_counter++
                            }
                        }

                        total_rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr').length
                        get_table_cell(tbl, 0, 'thead', 0).deleteCell(1)
                        get_table_cell(tbl, 0, 'thead', 0).deleteCell(4)
                        get_table_cell(tbl, 0, 'thead', 0).deleteCell(16)
                        for(i=0; i< total_rows; i++){
                            get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                            get_table_cell(tbl, 0, 'tbody', i).deleteCell(1)
                            get_table_cell(tbl, 0, 'tbody', i).deleteCell(4)
                            get_table_cell(tbl, 0, 'tbody', i).deleteCell(16)
                        }
                        break
                    case ReportOps.ADProductSalesReport:
                        row_counter = 0
                        for(i in invoices){
                            console.log("Processing " + (Number(i)+1) + " of " + ilen + " invoices" )
                            try{
                                while(dateFromString(get_table_cell(tbl, 0, 'tbody', row_counter, 2).innerText) < invoices[i].date){row_counter++}
                            }catch{}

                            invoice = JSON.parse(invoices[i].invoice_json)
                            for(j in invoice.Products){
                                get_table_cell(tbl, 0, 'tbody').insertRow(row_counter)
                                get_table_cell(tbl, 0, 'tbody', row_counter).innerHTML = row_structure
                                set_table_cell_number(tbl, row_counter, 9, 0)
                                set_table_cell_number(tbl, row_counter, 10, 0)
                                set_table_cell_number(tbl, row_counter, 11, 0)
                                set_table_cell_number(tbl, row_counter, 12, 0)
                                set_table_cell_number(tbl, row_counter, 13, 0)
                                set_table_cell_number(tbl, row_counter, 14, 0)

                                set_table_cell_string(tbl, row_counter, 1, iserve_username + "/" + invoices[i].invoice_id)
                                set_table_cell_string(tbl, row_counter, 2, invoices[i].date.dateFormat('d-m-Y'))
                                set_table_cell_string(tbl, row_counter, 3, iserve_franchise_code)
                                product = invoice.Products[j]
                                console.log(product)
                                set_table_cell_string(tbl, row_counter, 5, product.ProductName)
                                set_table_cell_string(tbl, row_counter, 6, "")
                                set_table_cell_string(tbl, row_counter, 7, invoice.Customer.ProductName)
                                set_table_cell_string(tbl, row_counter, 8, invoice.Customer.MobileNo)
                                increase_table_cell_number(tbl, row_counter, 9, product.Qty, 0)
                                set_table_cell_number(tbl, row_counter, 10, product.ProductPrice)
                                increase_table_cell_number(tbl, row_counter, 11, product.NetPrice)
                                increase_table_cell_number(tbl, row_counter, 12, product.productCGST)
                                increase_table_cell_number(tbl, row_counter, 13, product.productSGST)
                                increase_table_cell_number(tbl, row_counter, 14, product.GrandPrice)
                                paymentThrough = get_payment_through(invoice).toUpperCase()
                                if(paymentThrough != 'CASH'){
                                    paymentThrough = "/"+paymentThrough
                                }
                                set_table_cell_string(tbl, row_counter, 15, paymentThrough)
                                set_table_cell_string(tbl, row_counter, 18, 'N')  
                                set_table_cell_string(tbl, row_counter, 19, '')  
                                set_table_cell_string(tbl, row_counter, 20, product.EmployeeName)  
                                row_counter++
                            }
                        }

                        total_rows = get_table_cell(tbl, 0, 'tbody').getElementsByTagName('tr').length
                        for(i=0; i< total_rows; i++){
                            get_table_cell(tbl, 0, 'tbody', i, 0).innerText = i+1
                        }
                        break
                }
            }
        }
        else{
            if(window.location.href.indexOf('dayClose') > 0 && pmdata.ReportOption == ReportOps.SalonWiseSales){
                lastrow_index=1
                day_close_part2(pmdata)
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
        $('#divloadingscreen').hide()
    })
}

function filter_sca_products(productname){
    sca_selected_prods = []
    if(SCAProducts.length == 0){
        get_invoice_by_date("0", "0", function(err, res){
            for(i in res){
                res[i].value = res[i].prod_id
                res[i].taxpercent = "18.00"
                res[i].taxname = "GST 18%"
                res[i].taxid = "1"
                res[i].sgstpercent = "9.00"
                res[i].price = Number(res[i].mrp) / 1.18
                res[i].label = res[i].prod_name
                res[i].cgstpercent = "9.00"
                res[i].cesspercent = "0.00"
                res[i].ProductName = res[i].prod_name
                res[i].ProductCode = "MMD-" + res[i].prod_id
                res[i].BrandID = "MMD"
            }
            SCAProducts = res})
    }
    if(SCAProducts.length > 0){
        sca_selected_prods = SCAProducts.filter(function(p){return p.prod_name.toLowerCase().indexOf(productname.toLowerCase()) > -1 && p.count > 0})
    }
    return sca_selected_prods
}

function add_sca_services(services, search_key){
    selected_services = SCAServices.filter(function(x){
        return x.label.toLowerCase().indexOf(search_key.toLowerCase()) > -1
    })
    return services.concat(selected_services)
}

function set_sca_mrp(product, mrp_field){
    if(SCAProducts.length > 0){
        mrp_field.focus()
        mrp_field.val(SCAProducts.filter(function (x) { return x.prod_id == Number(product.value); })[0].mrp)
        mrp_field.blur()
    }
}
