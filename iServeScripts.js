function saveInvoice(elem, alive_check){
    debugger;

    //MMD call
    update_services_and_products()

    $('#btnGenerateInvoice').prop('disabled', true);
    var invoiceModel = new Object();
    var invoiceServiceArray = [];
    var invoiceProductArray = [];
    var invoiceTaxArray = [];
    var invoiceDiscountArray = [];

    var serviceNetSales = parseFloat(0);
    var productNetSales = parseFloat(0);
    var otherDiscount = parseFloat(0);
    var memberDiscount = parseFloat(0);
    var serviceTaxAmount = parseFloat(0);
    var productTaxAmount = parseFloat(0);
    var serviceCessTaxAmount = parseFloat(0);
    var productCessTaxAmount = parseFloat(0);

    var success = true;

    if ($('#isAppointment').val() == '0') {
        var custId = $('#CustomerID').val();
        if (custId == "0" || custId == "") {
            toastr.warning("Please select the customer", "Error");
            $('#btnGenerateInvoice').prop('disabled', false);
            $('#BCustomerName').focus()
            return false;
        }

    }


    $("table#serviceTable > tbody > tr").each(function (i, row) {
        var $row = $(row);
        var serviceId = $row.find('input[name$=ServiceID][type=hidden]').val();
        var empId = $row.find('input[name$=EmployeeID][type=hidden]').val();
        //alert($row.find('input[name$=SecondCustomerID][type=hidden]').val());
        var seccustId = $row.find('input[name$=SecondCustomerID][type=hidden]').val();
        var qty = $row.find('input[name$=Qty][type=text]').val();
        var price = $row.find('input[name$=ServicePrice][type=text]').val();
        var discountId = $row.find('input[name$=DiscountID][type=hidden]').val();
        var disPercent = $row.find('input[name$=DiscountPercent][type=text]').val();
        var disAmount = $row.find('input[name$=DiscountAmount][type=text]').val();
        var memberDiscount = $row.find('input[name$=MemberDiscount][type=text]').val();

        var netprice = $row.find('input[name$=NetPrice][type=hidden]').val();
        var taxId = $row.find('input[name$=TaxID][type=hidden]').val();
        var taxName = $row.find('input[name$=TaxName][type=text]').val();
        var taxPercent = $row.find('input[name$=TaxPercentage][type=hidden]').val();
        var taxAmount = $row.find('input[name$=TaxAmount][type=text]').val();
        var taxCGSTAmt = $row.find('input[name$=serviceCGST][type=hidden]').val();
        var taxSGSTAmt = $row.find('input[name$=serviceSGST][type=hidden]').val();
        var taxCESSAmt = $row.find('input[name$=serviceKFCT][type=hidden]').val();

        var cgstPercent = $row.find('input[name$=CGSTPercentage][type=hidden]').val();
        var sgstPercent = $row.find('input[name$=SGSTPercentage][type=hidden]').val();
        var cessPercent = $row.find('input[name$=KFCTPercentage][type=hidden]').val();

        var grandPrice = $row.find('input[name$=GrandPrice][type=text]').val();
        var apsID = $row.find('input[name$=APSID][type=hidden]').val();

        //alert(grandPrice);
        qty = (qty != null && qty != '' ? qty : 0);
        disPercent = (disPercent != null && disPercent != '' ? disPercent : 0);
        disAmount = (disAmount != null && disAmount != '' ? disAmount : 0);
        memberDiscount = (memberDiscount != null && memberDiscount != '' ? memberDiscount : 0);

        taxPercent = (taxPercent != null && taxPercent != '' ? taxPercent : 0);
        taxAmount = (taxAmount != null && taxAmount != '' ? taxAmount : 0);
        taxCGSTAmt = (taxCGSTAmt != null && taxCGSTAmt != '' ? taxCGSTAmt : 0);
        taxSGSTAmt = (taxSGSTAmt != null && taxSGSTAmt != '' ? taxSGSTAmt : 0);
        taxCESSAmt = (taxCESSAmt != null && taxCESSAmt != '' ? taxCESSAmt : 0);
        grandPrice = (grandPrice != null && grandPrice != '' ? grandPrice : 0);

        cgstPercent = (cgstPercent != null && cgstPercent != '' ? cgstPercent : 0);
        sgstPercent = (sgstPercent != null && sgstPercent != '' ? sgstPercent : 0);
        cessPercent = (cessPercent != null && cessPercent != '' ? cessPercent : 0);

        if (serviceId != '' && serviceId != "0" && empId != '' && empId != "0" && parseInt(qty) > parseInt(0)) {
            invoiceServiceArray.push({
                APSID: apsID, ServiceID: serviceId, EmployeeID: empId, SecondCustomerID: seccustId, Qty: qty, ServicePrice: price,
                DiscountID: discountId, DiscountPercent: disPercent, DiscountAmount: disAmount, NetPrice: netprice, TaxID: taxId,
                TaxPercentage: taxPercent, TaxAmount: taxAmount, serviceCGST: taxCGSTAmt, serviceSGST: taxSGSTAmt, serviceKFCT: taxCESSAmt,
                GrandPrice: grandPrice, MemberDiscount: memberDiscount,
                TaxName: taxName, CGSTPercentage: cgstPercent, SGSTPercentage: sgstPercent, KFCTPercentage: cessPercent
            });
        }
        //else {
        //    toastr.error("Assign the provider for all the services", "Error");
        //    success = false;
        //    $('#btnGenerateInvoice').show();
        //    return false;
        //}

    });
    //var jsonService = JSON.stringify(invoiceServiceArray, null, '\t');
    //alert(jsonService);

    $("table#dataTable > tbody > tr").each(function (i, row) {
        var $row = $(row);
        var productId = $row.find('input[name$=ProductID][type=hidden]').val();
        var empId = $row.find('input[name$=EmployeeID][type=hidden]').val();
        var qty = $row.find('input[name$=Qty][type=text]').val();
        var productPrice = $row.find('input[name$=ProductPrice][type=text]').val();
        var discountId = $row.find('input[name$=DiscountID][type=hidden]').val();
        var disPercent = $row.find('input[name$=DiscountPercent][type=text]').val();
        var disAmount = $row.find('input[name$=DiscountAmount][type=text]').val();
        var netPrice = $row.find('input[name$=NetPrice][type=hidden]').val();
        var taxId = $row.find('input[name$=TaxID][type=hidden]').val();
        var taxName = $row.find('input[name$=TaxName][type=text]').val();
        var taxCGST = $row.find('input[name$=productCGST][type=text]').val();
        var taxSGST = $row.find('input[name$=productSGST][type=text]').val();
        var taxCESS = $row.find('input[name$=productCESS][type=text]').val();
        var taxPercent = $row.find('input[name$=TaxPercentage][type=hidden]').val();
        var taxAmount = $row.find('input[name$=TaxAmount][type=hidden]').val();
        var grandPrice = $row.find('input[name$=GrandPrice][type=text]').val();

        var cgstPercent = $row.find('input[name$=CGSTPercentage][type=hidden]').val();
        var sgstPercent = $row.find('input[name$=SGSTPercentage][type=hidden]').val();
        var cessPercent = $row.find('input[name$=KFCTPercentage][type=hidden]').val();
        var isMembershipSales = $row.find('input[name$=hdnIsMembershipSales][type=hidden]').val();
        var MSInvoiceId = $row.find('input[name$=hdnMSInvoiceId][type=hidden]').val();

        qty = (qty != null && qty != '' ? qty : 0);
        taxPercent = (taxPercent != null && taxPercent != '' ? taxPercent : '0');
        grandPrice = (grandPrice != null && grandPrice != '' ? grandPrice : '0');

        cgstPercent = (cgstPercent != null && cgstPercent != '' ? cgstPercent : 0);
        sgstPercent = (sgstPercent != null && sgstPercent != '' ? sgstPercent : 0);
        cessPercent = (cessPercent != null && cessPercent != '' ? cessPercent : 0);

        isMembershipSales = (isMembershipSales != null && isMembershipSales != '' ? isMembershipSales : 0);
        MSInvoiceId = (MSInvoiceId != null && MSInvoiceId != '' ? MSInvoiceId : 0);
        empId = (empId != null && empId != '' && empId != '0' ? empId : "");

        if (parseFloat(taxPercent) != 0) {
            var taxper = parseFloat(taxPercent) / 2;
            taxName = 'CGST ' + parseFloat(taxper).toFixed(2) + '%, SGST ' + parseFloat(taxper).toFixed(2) + '%';
        }

        if (parseInt(productId) >= parseInt(0) && qty != "0" && qty != "") {
            invoiceProductArray.push({
                ProductID: productId, EmployeeID: empId, Qty: qty, ProductPrice: productPrice,
                DiscountID: discountId, DiscountPercent: disPercent, DiscountAmount: disAmount,
                NetPrice: netPrice, TaxID: taxId, TaxName: taxName, TaxPercentage: taxPercent, productCGST: taxCGST,
                productSGST: taxSGST, TaxAmount: taxAmount, productCESS: taxCESS,
                GrandPrice: grandPrice, CGSTPercentage: cgstPercent, SGSTPercentage: sgstPercent, KFCTPercentage: cessPercent,
                hdnIsMembershipSales: isMembershipSales, hdnMSInvoiceId: MSInvoiceId
            });
        }

    });
    //var jsonProduct = JSON.stringify(invoiceProductArray, null, '\t');
    //alert(jsonProduct);

    var comDiscountId = $('#commonDiscountId').val();
    var comDiscountPercent = $('#commonDiscountPercent').val();
    var comDiscountAmount = $('#commonDiscountAmt').val();

    if (parseInt(comDiscountId) >= parseInt(0) && parseFloat(comDiscountAmount) >= parseFloat(0)) {
        invoiceDiscountArray.push({
            DiscountID: comDiscountId, DiscountPercent: comDiscountPercent, DiscountAmount: comDiscountAmount
        });
    }
    if (parseInt(comDiscountId) >= parseInt(0) && parseFloat(comDiscountPercent) >= parseFloat(0)) {
        debugger;
        invoiceDiscountArray.push({
            DiscountID: comDiscountId, DiscountPercent: comDiscountPercent, DiscountAmount: comDiscountAmount
        });
    }

    //var jsonDiscount = JSON.stringify(invoiceDiscountArray, null, '\t');
    //alert(jsonDiscount);



    var comCGSTAmount = $('#commonCGSTAmount').val();
    var comSGSTAmount = $('#commonSGSTAmount').val();
    var comCESSAmount = $('#commonKFCTAmt').val();
    var comTaxAmount = parseFloat(comCGSTAmount) + parseFloat(comSGSTAmount) + parseFloat(comCESSAmount);

    if (parseInt(comCGSTAmount) >= 0 || parseInt(comSGSTAmount) >= 0) {
        invoiceTaxArray.push({
            TaxID: null, TaxName: '', TaxPercentage: '0', TaxAmount: comTaxAmount.toFixed(2), CGSTAmount: comCGSTAmount, SGSTAmount: comSGSTAmount, KFCTaxAmount: comCESSAmount
            });
    }

    //if ($('#isAppointment').val() == '0') {
    //    if (invoiceProductArray.length == 0) {
    //        toastr.error("Add atleast one Product", "Error");
    //        return false;
    //    }
    //}


    if (invoiceProductArray.length == 0 && invoiceServiceArray.length == 0) {
        toastr.error("Add service or Product", "Error");
        $('#btnGenerateInvoice').prop('disabled', false);

        return false;
    }


    var grandTotal1 = $('#commonGrandTotal').val();

    var walletBalance1 = $('#WalletBalance').val();
    var walletAmt1 = $('#WalletAmount').val();
    var cashAmt1 = $('#CashAmount').val();
    var cardAmt1 = $('#CardAmount').val();
    var paytmAmt1 = $('#PaytmAmount').val();
    var phonepeAmt1 = $('#PhonePeAmount').val();
    var amtReturned1 = $('#AmountReturned').val();

    walletBalance1 = (walletBalance1 != null && walletBalance1 != '' ? walletBalance1 : 0);
    walletAmt1 = (walletAmt1 != null && walletAmt1 != '' ? walletAmt1 : 0);
    cashAmt1 = (cashAmt1 != null && cashAmt1 != '' ? cashAmt1 : 0);
    cardAmt1 = (cardAmt1 != null && cardAmt1 != '' ? cardAmt1 : 0);
    paytmAmt1 = (paytmAmt1 != null && paytmAmt1 != '' ? paytmAmt1 : 0);
    phonepeAmt1 = (phonepeAmt1 != null && phonepeAmt1 != '' ? phonepeAmt1 : 0);

    if (parseFloat(walletBalance1) < parseFloat(walletAmt1)) {
        success = false;
        $('#btnGenerateInvoice').prop('disabled', false);
        return false;
    }

    var receivedAmount1 = parseFloat(walletAmt1) + parseFloat(cashAmt1) + parseFloat(cardAmt1) + parseFloat(paytmAmt1) + parseFloat(phonepeAmt1);
    receivedAmount1 = parseFloat(receivedAmount1).toFixed(2);

    if (parseFloat(grandTotal1) > parseFloat(receivedAmount1)) {

        toastr.error("Invalid receive amount", "Error");
        $('#btnGenerateInvoice').prop('disabled', false);
        success = false;
        $('#CashAmount').focus();
        return false;
    }

    var isWalletStatus1 = ($('#isHappinessCard').is(":checked")) ? true : false;
    var isCashStatus1 = ($('#isCashAmount').is(":checked")) ? true : false;
    var isCardStatus1 = ($('#isCardAmount').is(":checked")) ? true : false;
    var isPaytmStatus1 = ($('#isPaytmAmount').is(":checked")) ? true : false;
    var isPhonePeStatus1 = ($('#isPhonePeAmount').is(":checked")) ? true : false;

    if (isWalletStatus1 == true) {
        if (parseFloat(walletAmt1) <= parseFloat(0)) {
            toastr.error("Invalid wallet amount", "Error");
            $('#btnGenerateInvoice').prop('disabled', false);
            success = false;
            return false;
        }
    }
    //alert(grandTotal1);
    if (isCashStatus1 == true) {
        if (parseFloat(cashAmt1) <= parseFloat(0) && parseFloat(grandTotal1) > parseFloat(0)) {
            toastr.error("Invalid cash amount", "Error");
            success = false;
            $('#btnGenerateInvoice').prop('disabled', false);
            $('#CashAmount').focus();
            return false;
        }

    }

    if (isCardStatus1 == true) {
        if (parseFloat(cardAmt1) <= parseFloat(0) && parseFloat(grandTotal1) > parseFloat(0)) {
            toastr.error("Invalid card amount", "Error");
            success = false;
            $('#CardAmount').focus();

            $('#btnGenerateInvoice').prop('disabled', false);
            return false;
        }
    }
    if (isPaytmStatus1 == true) {
        if (parseFloat(paytmAmt1) <= parseFloat(0) && parseFloat(grandTotal1) > parseFloat(0)) {
            toastr.error("Invalid paytm amount", "Error");
            success = false;
            $('#btnGenerateInvoice').prop('disabled', false);
            $('#PaytmAmount').focus();
            return false;
        }

    }
    if (isPhonePeStatus1 == true) {
        if (parseFloat(phonepeAmt1) <= parseFloat(0) && parseFloat(grandTotal1) > parseFloat(0)) {
            toastr.error("Invalid PhonePe amount", "Error");
            success = false;
            $('#btnGenerateInvoice').prop('disabled', false);
            $('#PhonePeAmount').focus();
            return false;
        }

    }
    if ($('#customerRating').val() == "0") {
        toastr.error("Give rating to customer", "Error");
        success = false;
        $('#btnGenerateInvoice').prop('disabled', false);

        return false;
    }


    //var serviceBasicSales = $("#serviceTotAmt").text();
    //var productBasicSales = $("#productTotAmt").text();

    var serviceBasicSales = 0;
    var productBasicSales = 0;

    for (var i = 0; i < invoiceServiceArray.length; i++) {
        serviceNetSales = parseFloat(serviceNetSales) + parseFloat(invoiceServiceArray[i].GrandPrice);
        otherDiscount = parseFloat(otherDiscount) + parseFloat(invoiceServiceArray[i].DiscountAmount);
        memberDiscount = parseFloat(memberDiscount) + parseFloat(invoiceServiceArray[i].MemberDiscount);
        serviceTaxAmount = parseFloat(serviceTaxAmount) + parseFloat(invoiceServiceArray[i].TaxAmount);

        serviceBasicSales = parseFloat(serviceBasicSales) + parseFloat(invoiceServiceArray[i].NetPrice);
        serviceCessTaxAmount = parseFloat(serviceCessTaxAmount) + parseFloat(invoiceServiceArray[i].serviceKFCT);
    }

    for (var i = 0; i < invoiceProductArray.length; i++) {
        if (parseFloat(invoiceProductArray[i].hdnIsMembershipSales) == 0) {
            productNetSales = parseFloat(productNetSales) + parseFloat(invoiceProductArray[i].GrandPrice);
            productTaxAmount = parseFloat(productTaxAmount) + parseFloat(invoiceProductArray[i].TaxAmount);

            productBasicSales = parseFloat(productBasicSales) + parseFloat(invoiceProductArray[i].NetPrice);
            productCessTaxAmount = parseFloat(productCessTaxAmount) + parseFloat(invoiceProductArray[i].productCESS);
        }
    }


    //var jsonTax = JSON.stringify(invoiceTaxArray, null, '\t');
    //alert(jsonTax);
    var invNO = $('#invno').val();
    var appID = $('#appID').val();
    var custID = $('#CustomerID').val();

    var grossTot = $('#grossTotal').val();
    var commTotAmount = $('#commonTotalAmount').val();
    // var roundoff = $('#commonRoundingOff').val();
    var roundoff = $('#hdnRoundingOff').val();
    var grandTot = $('#commonGrandTotal').val();

    var isHappinessCard = ($('#isHappinessCard').is(":checked")) ? "1" : "0";
    var walletBalance = $('#WalletBalance').val();
    var walletAmount = $('#WalletAmount').val();
    var isCash = ($('#isCashAmount').is(":checked")) ? "1" : "0";
    var cashAmount = ($('#isCashAmount').is(":checked")) ? $('#CashAmount').val() : "0";
    var isCard = ($('#isCardAmount').is(":checked")) ? "1" : "0";
    var cardNumber = $('#CardNumber').val();
    var cardAmount = ($('#isCardAmount').is(":checked")) ? $('#CardAmount').val() : "0";
    var isPaytm = ($('#isPaytmAmount').is(":checked")) ? "1" : "0";
    var paytmNumber = $('#PaytmNumber').val();
    var paytmAmount = ($('#isPaytmAmount').is(":checked")) ? $('#PaytmAmount').val() : "0";
    var isPhonepe = ($('#isPhonePeAmount').is(":checked")) ? "1" : "0";
    var phonepeNumber = $('#PhonePeNumber').val();
    var phonepeAmount = ($('#isPhonePeAmount').is(":checked")) ? $('#PhonePeAmount').val() : "0";
    var Willing = $('#Accept').val();
    if (Willing == 3 || Willing == "3" || Willing == null || Willing == "")
    {
        Willing = 2;

    }
    var amtReturned = $('#AmountReturned').val();
    var isMemeberCustomer = $('#isMemeberCustomer').val();
    var customerRating = $('#customerRating').val();
    var remarksRating = $('#RatingRemarks').val();
    var invoiceInitTime = $('#InvoiceInitiateTime').val();
    var SmsSend = $('#SmsSend').val();
    //alert(SmsSend);

    var IsApiDiscount = $('#commonApiDiscount').val();
    var apiName = $('#commonApiName').val();
    var apiRefNo = $('#commonApiReferenceNo').val();
    var apiCustId = $('#commonApiCustId').val();
    var mobileno = $('#CustMobileNo').val();

    custID = (custID != null && custID != '' ? custID : '');
    grossTot = (grossTot != null && grossTot != '' ? grossTot : 0);
    commTotAmount = (commTotAmount != null && commTotAmount != '' ? commTotAmount : 0);
    roundoff = (roundoff != null && roundoff != '' ? roundoff : 0);
    grandTot = (grandTot != null && grandTot != '' ? grandTot : 0);
    walletBalance = (walletBalance != null && walletBalance != '' ? walletBalance : 0);
    walletAmount = (walletAmount != null && walletAmount != '' ? walletAmount : 0);
    cashAmount = (cashAmount != null && cashAmount != '' ? cashAmount : 0);
    cardNumber = (cardNumber != null && cardNumber != '' ? cardNumber : '');
    cardAmount = (cardAmount != null && cardAmount != '' ? cardAmount : 0);
    amtReturned = (amtReturned != null && amtReturned != '' ? amtReturned : 0);

    customerRating = (customerRating != null && customerRating != '' ? customerRating : 0);
    remarksRating = (remarksRating != null && remarksRating != '' ? remarksRating : '');
    invoiceInitTime = (invoiceInitTime != null && invoiceInitTime != '' ? invoiceInitTime : '');
    SmsSend = (SmsSend != null && SmsSend != '' ? SmsSend : '');

    IsApiDiscount = (IsApiDiscount != null && IsApiDiscount != '' ? IsApiDiscount : '0');
    apiName = (apiName != null && apiName != '' ? apiName : '');
    apiRefNo = (apiRefNo != null && apiRefNo != '' ? apiRefNo : '');
    apiCustId = (apiCustId != null && apiCustId != '' ? apiCustId : '');
    mobileno = (mobileno != null && mobileno != '' ? mobileno : '');

    isPaytm = (isPaytm != null && isPaytm != '' ? isPaytm : '');
    PaytmAmount = (PaytmAmount != null && PaytmAmount != '' ? PaytmAmount : '');
    isPhonepe = (isPhonepe != null && isPhonepe != '' ? isPhonepe : '');
    phonepeAmount = (phonepeAmount != null && phonepeAmount != '' ? phonepeAmount : '');

    var invoiceDetails = new Object();
    invoiceDetails.APPID = appID;
    invoiceDetails.CustomerID = custID;

    invoiceDetails.OtherDiscount = otherDiscount;
    invoiceDetails.MemberDiscount = memberDiscount;
    invoiceDetails.ServiceBasicSales = serviceBasicSales;
    invoiceDetails.ProductBasicSales = productBasicSales;

    invoiceDetails.ServiceTaxAmount = serviceTaxAmount;
    invoiceDetails.ProductTaxAmount = productTaxAmount;
    invoiceDetails.ServiceCessTaxAmount = serviceCessTaxAmount;
    invoiceDetails.ProductCessTaxAmount = productCessTaxAmount;

    invoiceDetails.ServiceNetSales = serviceNetSales;
    invoiceDetails.ProductNetSales = productNetSales;


    invoiceDetails.SubTotal = grossTot;
    invoiceDetails.TotalAmount = commTotAmount;
    invoiceDetails.RoundingOff = roundoff;
    invoiceDetails.GrandTotal = grandTot;
    invoiceDetails.IsMembershipCustomer = isMemeberCustomer;

    invoiceDetails.isCashPayment = isCash;
    invoiceDetails.CashAmount = cashAmount;
    invoiceDetails.isCardPayment = isCard;
    invoiceDetails.CardNumber = cardNumber;
    invoiceDetails.CardAmount = cardAmount;
    invoiceDetails.BankName = "";
    //invoiceDetails.isWalletPayment = isHappinessCard;
    //changed by loga for eWallet
    var IsSMSM = $('#IsSMSM').val();
    IsSMSM = (IsSMSM != null && IsSMSM != '' ? IsSMSM : '0');
    if (IsSMSM != '0')
        invoiceDetails.isWalletPayment = walletAmount > 0 ? 1 : 0;
    else
        invoiceDetails.isWalletPayment = walletAmount > 0 ? 2 : 0;
    invoiceDetails.WalletBalance = walletBalance;
    invoiceDetails.WalletAmount = walletAmount;
    invoiceDetails.AmountReturned = amtReturned;
    invoiceDetails.Rating = customerRating;
    invoiceDetails.RemarksRating = remarksRating;
    invoiceDetails.InvoiceInitiTime = invoiceInitTime;
    invoiceDetails.SmsSend = SmsSend;

    invoiceDetails.IsApiDiscount = IsApiDiscount;
    invoiceDetails.ApiName = apiName;
    invoiceDetails.ApiReferenceNo = apiRefNo;
    invoiceDetails.ApiCustId = apiCustId;
    invoiceDetails.MobileNo = mobileno;

    invoiceDetails.IsPaytm = isPaytm;
    invoiceDetails.paytmAmount = paytmAmount;
    invoiceDetails.IsPhonePe = isPhonepe;
    invoiceDetails.phonepeAmount = phonepeAmount;
    invoiceDetails.Willing = Willing;

    var InvoiceModels = {
        InvoiceDetails: invoiceDetails,
        Services: invoiceServiceArray,
        Products: invoiceProductArray,
        CommonDiscount: invoiceDiscountArray,
        CommonTax: invoiceTaxArray
    }

    //var jsonTax = JSON.stringify(InvoiceModels, null, '\t');
    //alert(jsonTax);
    //return;

    //alert(JSON.stringify(InvoiceModels))
    //Response.Write(JSON.stringify(InvoiceModels));
    //Console.log(JSON.stringify(InvoiceModels));
    //return;
    if (success == true) {

        //MMD Call
        doMMDBill(InvoiceModels)

        $.ajax({
            url: '/iNaturals/WalkinInvoice/saveInvoice',
            data: JSON.stringify(InvoiceModels),
            type: "POST",
            async: false,
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (result.success == true) {
                    //alert('Appointment details saved successfully');
                    //swal("Success!", "Appointment details saved", "success");
                    //if ($('#IsSMSM').val() == '1') {
                    var IsSMSM = $('#IsSMSM').val();
                    var SmsSend = $('#SmsSend').val();
                    var walletamount = walletAmount > 0 ? 1 : 0;

                    SmsSend = (SmsSend != null && SmsSend != '' ? SmsSend : '0');
                    IsSMSM = (IsSMSM != null && IsSMSM != '' ? IsSMSM : '0');
                    SendServiceSMS(result.responseText, IsSMSM, SmsSend);
                    //}
                    if (IsSMSM != '0' && walletamount > 0) {
                        window.location.href = '/iNaturals/Invoice/PrinteWalletBilling?eWalletinvoiceID=' + result.responseText;
                    }
                    else {

                        var VOUCHERPRINT = 'NOTPRINT';


                        if ($('#serviceTotAmt').val() >= 500 && $('#Retention').val() == 1 && ($('#GvCount').val() == 100 || $('#GvCount').val() == 0)) {
                            if (confirm("Client Eligible for Gift Vouchers  – Provide Gift Vouchers…!")) {
                                var custId = $('#CustomerID').val();
                                var mobileno = $('#CustMobileNo').val();
                                try {
                                    $.ajax({
                                        url: '/iNaturals/WalkinInvoice/SaveGiftVoucherCount',
                                        data: {
                                            custId: custId,
                                            dvcount: 2,
                                            mobileno: mobileno
                                        },
                                        type: "POST",
                                        contenttype: 'application/json; charset=utf-8',
                                        dataType: "json",
                                        async: false,
                                        success: function (result) {
                                            if (result.success == true) {
                                                //alert("Vouchers Sent to Customer Mobile Number");

                                                VOUCHERPRINT = "PRINT";

                                                return true;
                                            }
                                            else {

                                            }
                                        },
                                        error: function (xhr) {

                                        }
                                    });
                                } catch (e) {

                                }
                            }
                        }
                        window.location.href = '/iNaturals/Invoice/PrintBilling?invoiceID=' + result.responseText + '&VoucherPrint=' + VOUCHERPRINT ;
                    }
                }

            },
            error: function (xhr, textStatus, error) {
                elem.disabled = false;
                toastr.error('Error ' + error, "Error");
                //alert(xhr.statusText);
                //alert(textStatus);
                //alert(error);
                console.log(textStatus);
                console.log(error);
            }
        });
    }
    return false;
}

function Openresport() {
    debugger;
    // $('#divloadingscreen').show();
    var Amsalonid = $("#Amsalon").val();
    var invfrom = $("#invfrom").val();
    var invTo = $("#invTo").val();
    var txtSearch = $("#txt_Search").val();
    // var ReportOption = $('#ReportOption').find(":selected").text();
    var ReportOption = $('#ReportOption').find(":selected").val();
    //if (ReportOption == 14 || ReportOption == 16) {
    if (ReportOption == 15 || ReportOption == 18  || ReportOption == 32) {
        txtSearch = $('#ddlDaysCount').val();
    }


    //Convert string dates to Date format
    var StartDate = moment(invfrom, "DD/MM/YYYY");
    var EndDate = moment(invTo, "DD/MM/YYYY");

    //Calculate duration
    var duration = moment.duration(EndDate.diff(StartDate));

    //Convert duration in days
    var days = duration.asDays();

    if (txtSearch == 45 || txtSearch == 60 || txtSearch == 90) {
        invfrom = $('#txt_Search').val();
        invTo = "";
    }

    if (days >= 31) {
        toastr.error("Date Range Must be one Month", "Error");
        return false;
    }


    if (ReportOption == '--SELECT--') {
        alert('Please select the report type...')
        $("#ReportOption").focus();
        return false;
    }
    // invfrom, string invTo, string ReportOption

    var pmdata = {
        'invfrom': invfrom,
        'invTo': invTo,
        'ReportOption': ReportOption,
        'Searchtext': txtSearch,
        'Amsalonid': Amsalonid
    };

    check_allowed_report(pmdata)

    $('#divloadingscreen').show();
    $.ajax({
        url: '/iNaturals/Reports/Index',
        datatype: "json",
        type: "POST",
        data: pmdata,
        contenttype: 'application/json; charset=utf-8',
        async: true,
        success: function (data) {
            $("#Reportresult").html(data);
            //MMD Call
            update_reports(pmdata)

            //MMD Call Commented the below line
            // $('#divloadingscreen').hide();

        },
        error: function (xhr) {
            $('#divloadingscreen').hide();
            alert('error');
        }
    });
}

function getReport() {

    // $("#formIncentive").submit();
    var FromDate = $("#fromDate").val()
    var ToDate = $("#toDate").val()

    

    $.ajax({
        url: '/iNaturals/EmpIncentive/Index',
        datatype: "json",
        type: "POST",
        data: { fromDate: FromDate, toDate: ToDate },
        contenttype: 'application/json; charset=utf-8',
        async: false,
        success: function (data) {
            $("#divIncentive").html(data);

            //MMD Call
            update_incentives(FromDate, ToDate)
        },
        error: function (xhr) {
            alert('error');
        }
    });

    //return false;
}

function BindAutoCompleList_ProductNew() {
    $(".productname").live("keyup", function () {

        var isSMSM = $('#IsSMSM').val();
        isSMSM = (isSMSM != null && isSMSM != '' ? isSMSM : 0);

        var serCnt = 0;
        $("table#serviceTable > tbody > tr").each(function (i, row) {
            var $row = $(row);
            var serviceId = $row.find('input[name$=ServiceID][type=hidden]').val();
            var qty = $row.find('input[name$=Qty][type=text]').val();

            if (parseInt(serviceId) >= parseInt(0) && qty != "0" && qty != "") {
                serCnt++;
            }
        });

        if (serCnt > 0 && isSMSM > 0) {
            toastr.error("This is eWallet reduction – Bill Products separately.", "Error");
            return false;
        }

        $(this).autocomplete({
            minLength: 0,
            source: function (request, response) {
                var productname = request.term;
                if (productname == '')
                    return false;

                if (productname.length < 3)
                    return false;
                $.ajax({
                    url: '/iNaturals/Invoice/SearchProduct',
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: { Name: productname },
                    success: function (data) {
                        //ProductList.length = 0;

                        // MMD Call - comment the direct assign and called filter_sca_products
                        // ProductList = data;
                        ProductList = filter_sca_products(data);
                        response(ProductList);

                    }
                })
            },
            select: function (event, ui) {
                // Get the current row
                debugger;
                var row = $(this).closest('tr');

                $(this).val(ui.item.label);
                $(this).parent().find('input[name$=ProductID][type=hidden]').val(ui.item.value);

                // Adjust the total
                row.find('input[name$=ActualMRP][type=hidden]').val(ui.item.mrp);
                row.find('input[name$=ProductPrice][type=text]').val(ui.item.price);
                row.find('input[name$=TaxID][type=hidden]').val(ui.item.taxid);
                row.find('input[name$=TaxName][type=text]').val(ui.item.taxname);
                row.find('input[name$=TaxPercentage][type=hidden]').val(ui.item.taxpercent);
                row.find('input[name$=CGSTPercentage][type=hidden]').val(ui.item.cgstpercent);
                row.find('input[name$=SGSTPercentage][type=hidden]').val(ui.item.sgstpercent);
                row.find('input[name$=KFCTPercentage][type=hidden]').val(ui.item.cesspercent);
                row.find('input[name$=hdnIsMembershipSales][type=hidden]').val('0');


                // var row1 = $(this).closest('tr');
                Product_CalculateAmount(row);

                // MMD Call
                set_sca_mrp(ui.item, row.find('input[name$=ProductMRP]'))

                var element = $("a.addNewProduct", $(row));
                element.click();
                var prevrow = $(this).closest('tr').prev();

                row.find('input[name$=EmployeeName][type=text]').val(prevrow.find('input[name$=EmployeeName][type=text]').val());
                row.find('input[name$=EmployeeID][type=hidden]').val(prevrow.find('input[name$=EmployeeID][type=hidden]').val());


                if (!prevrow.find('input[name$=EmployeeID][type=hidden]').val())
                    row.find('input[name$=EmployeeName][type=text]').focus();

                return false;
            },
            change: function (event, ui) {
                var row = $(this).closest('tr');

                var name = $(this).val();
                var id = $(this).parent().find('input[name$=ProductID][type=hidden]').val();

                var exists = compare_stringToarrystring("value", id, "label", name, ProductList);

                if (!exists) {
                    $(this).val("");
                    $(this).focus();

                    $(this).parent().find('input[name$=DiscountID][type=hidden]').val('');
                    row.find('input[name$=Qty][type=text]').val('');
                    row.find('input[name$=ProductPrice][type=text]').val('');
                    row.find('input[name$=ActualMRP][type=hidden]').val('');

                    // MMD Call - Ser MRP to empty
                    row.find('input[name$=ProductMRP]').val('');

                    row.find('input[name$=TaxID][type=hidden]').val('');
                    row.find('input[name$=TaxName][type=text]').val('');
                    row.find('input[name$=TaxPercentage][type=hidden]').val('');
                    row.find('input[name$=CGSTPercentage][type=hidden]').val('');
                    row.find('input[name$=SGSTPercentage][type=hidden]').val('');
                    row.find('input[name$=KFCTPercentage][type=hidden]').val('');
                    row.find('input[name$=hdnIsMembershipSales][type=hidden]').val('0');
                    Product_CalculateAmount(row);
                    return false;
                }
            },
            messages: {
                noResults: "",
                results: function (count) {
                    return count + (count > 1 ? ' results' : ' result ') + ' found';
                }
            }
        });
    });
}
BindAutoCompleList_ProductNew()

function CallAutoCompleList_Service() {
    // debugger;
    $(".servicename").live("keyup", function () {

        $(this).autocomplete({
            minLength: 0,
            source: function (request, response) {
                var servicename = request.term;
                var customerId = $('#CustomerID').val();
                if (servicename == '')
                    return;
                if (customerId == '0' || customerId == '') {
                    toastr.error("Please select the customer", "Error");
                    return;

                }
                $.ajax({
                    url: '/iNaturals/WalkinInvoice/SearchService',
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: { Name: servicename, CustomerId: customerId },
                    success: function (data) {
                        //console.log(data);

                        // MMD Call - comment the direct assign and called add_sca_services
                        // ServiceList = data;
                        ServiceList = add_sca_services(data, servicename);
                        response(ServiceList);
                        
                    }
                });
            },

            select: function (event, ui) {
                //debugger;
                var row = $(this).closest('tr');

                $(this).val(ui.item.label);
                row.find('input[name$=ServiceID][type=hidden]').val(ui.item.value);

                row.find('input[name$=Qty][type=text]').val(ui.item.qty);
                //loga start for
                //row.find('input[name$=ServicePrice][type=text]').val(ui.item.actualPrice);
                var isApp = $('#isAppointment').val();
                var isTaxForService = $('#InclusiveOfTaxForService').val();
                var isSMSM = $('#IsSMSM').val();
                isApp = (isApp != null && isApp != '' ? isApp : 0);
                isSMSM = (isSMSM != null && isSMSM != '' ? isSMSM : 0);
                isTaxForService = (isApp != null && isTaxForService != '' ? isTaxForService : 0);
                //alert(parseFloat(ui.item.kfcpercent));
                if (isSMSM == "0") {
                    if (isTaxForService == 1 && isApp == 0) {
                        var cgstAmt = (parseFloat(ui.item.actualPrice) * (parseFloat(ui.item.cgstpercent) / (100 + ui.item.cgstpercent + ui.item.sgstpercent))).toFixed(2);
                        var sgstAmt = (parseFloat(ui.item.actualPrice) * (parseFloat(ui.item.sgstpercent) / (100 + ui.item.cgstpercent + ui.item.sgstpercent))).toFixed(2);
                        var kfcAmt = (parseFloat(ui.item.actualPrice) * (parseFloat(ui.item.kfcpercent) / (100 + ui.item.kfcpercent))).toFixed(2);
                        if (parseFloat(ui.item.kfcpercent) == 0)
                            kfcAmt = 0;
                        var actualPriceMT = ui.item.actualPrice - cgstAmt - sgstAmt - kfcAmt;
                        row.find('input[name$=ServicePrice][type=text]').val(actualPriceMT);
                    }
                    else if (isTaxForService == 1 && isApp == 1) {
                        var cgstAmt = (parseFloat(ui.item.actualPrice) * (parseFloat(ui.item.cgstpercent) / (100 + ui.item.cgstpercent + ui.item.sgstpercent))).toFixed(2);
                        var sgstAmt = (parseFloat(ui.item.actualPrice) * (parseFloat(ui.item.sgstpercent) / (100 + ui.item.cgstpercent + ui.item.sgstpercent))).toFixed(2);
                        var kfcAmt = (parseFloat(ui.item.actualPrice) * (parseFloat(ui.item.kfcpercent) / (100 + ui.item.kfcpercent))).toFixed(2);
                        if (parseFloat(ui.item.kfcpercent) == 0)
                            kfcAmt = 0;
                        var actualPriceMT = ui.item.actualPrice - cgstAmt - sgstAmt - kfcAmt;
                        row.find('input[name$=ServicePrice][type=text]').val(actualPriceMT);
                    }
                    else {
                        row.find('input[name$=ServicePrice][type=text]').val(ui.item.actualPrice);
                    }
                }
                else {
                    var actualPriceMT = ui.item.actualPrice;
                    row.find('input[name$=ServicePrice][type=text]').val(actualPriceMT);
                }
                //end
                if (isSMSM == "0") {
                    row.find('input[name$=MemberDiscount][type=text]').val(ui.item.memberDiscount);
                    row.find('input[name$=MemberDiscount][type=hidden]').val(ui.item.memberDiscount);
                    row.find('input[name$=TaxID][type=hidden]').val(ui.item.taxid);
                    row.find('input[name$=TaxName][type=text]').val(ui.item.taxname);
                    row.find('input[name$=TaxPercentage][type=hidden]').val('');
                    row.find('input[name$=CGSTPercentage][type=hidden]').val(ui.item.cgstpercent);
                    row.find('input[name$=SGSTPercentage][type=hidden]').val(ui.item.sgstpercent);
                    row.find('input[name$=KFCTPercentage][type=hidden]').val(ui.item.kfcpercent);
                } else {
                    row.find('input[name$=MemberDiscount][type=text]').val(0);
                    row.find('input[name$=MemberDiscount][type=hidden]').val(0);
                    row.find('input[name$=TaxID][type=hidden]').val(0);
                    row.find('input[name$=TaxName][type=text]').val('');
                    row.find('input[name$=TaxPercentage][type=hidden]').val('');
                    row.find('input[name$=CGSTPercentage][type=hidden]').val(0);
                    row.find('input[name$=SGSTPercentage][type=hidden]').val(0);
                    row.find('input[name$=KFCTPercentage][type=hidden]').val(0);
                }
                Service_CalculateAmount(row);

                var element = $("a.addNewService", $(row));
                element.click();
                var prevrow = $(this).closest('tr').prev();

                row.find('input[name$=EmployeeName][type=text]').val(prevrow.find('input[name$=EmployeeName][type=text]').val());
                row.find('input[name$=EmployeeID][type=hidden]').val(prevrow.find('input[name$=EmployeeID][type=hidden]').val());

                row.find('input[name$=SecondCustomerName][type=text]').val(prevrow.find('input[name$=SecondCustomerName][type=text]').val());
                row.find('input[name$=SecondCustomerID][type=hidden]').val(prevrow.find('input[name$=SecondCustomerID][type=hidden]').val());

                if (!prevrow.find('input[name$=EmployeeID][type=hidden]').val())
                    row.find('input[name$=EmployeeName][type=text]').focus();
                else if (!prevrow.find('input[name$=SecondCustomerID][type=hidden]').val())
                    row.find('input[name$=SecondCustomerName][type=text]').focus();

                return false;
            },
            change: function (event, ui) {
                val = $(this).val();
                var row = $(this).closest('tr');

                var name = $(this).val();
                var id = row.find('input[name$=ServiceID][type=hidden]').val();

                //var isexists = compare_stringToarrystring("value", id, "label", name, ServiceList);
                //if (!exists) {
                //    row.find('input[name$=ServiceID][type=hidden]').val('');

                //    row.find('input[name$=Qty][type=text]').val('');
                //    row.find('input[name$=ServicePrice][type=text]').val('');
                //    row.find('input[name$=MemberDiscount][type=text]').val('');
                //    row.find('input[name$=MemberDiscount][type=hidden]').val('');
                //    row.find('input[name$=TaxID][type=hidden]').val('');
                //    row.find('input[name$=TaxName][type=text]').val('');
                //    row.find('input[name$=TaxPercentage][type=hidden]').val('');
                //    row.find('input[name$=CGSTPercentage][type=hidden]').val('');
                //    row.find('input[name$=SGSTPercentage][type=hidden]').val('');
                //}
                var exists = ValidateServiceSelection(val);
                if (!exists) {
                    $(this).val("");
                    $("#ServiceID").val('');
                    toastr.error("Please select the service from list", "Error");
                    $(this).focus();
                    Service_CalculateAmount(row);
                    return false;
                }
            }
        });
    });
}
CallAutoCompleList_Service()

console.log("iServeScripts JS Loaded")
