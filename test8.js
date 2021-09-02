function add_product(name, count){
    var settings = {
  "url": "https://naturals-d1c4.restdb.io/rest/inventory",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "x-apikey": "612f97f843cedb6d1f97eba5",
    "Content-Type": "application/json"
  },
  "data": JSON.stringify({
    "prod_name": name,
    "count": count
  }),
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
}

function xpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

console.log("Test JS Loaded")

if($("button")[0].innerText == "Login"){
  $("#username")[0].value="KA0020"; 
  $("#password")[0].value = "jaisriram123"; 
  $("button")[0].click();
}

if($("div.modal-title")[0].innerText == "CheckList"){
  z=$x("/html/.//div/div[2]/label[1]/input"); 
  for(i=0; i < z.length; i++){
      z[i].checked = true
  }
  CheckListSubmit(this);
}

function NewAppointment(){
    CreateAppoinment();
    setTimeout( function(){
        if($("#AppointMethod")[0].options.length == 3){
            $("#AppointMethod")[0].options.remove(2)
        }
        xpath("/html/body/div[3]/div/div/div[2]/div/div/div[1]/div[2]/center/div[2]/table/tbody/tr/td[4]/input[1]").onclick = function(){SaveAppointmentDetailsSCA(0)}
        xpath("/html/body/div[3]/div/div/div[2]/div/div/div[1]/div[2]/center/div[2]/table/tbody/tr/td[4]/input[2]").onclick = function(){SaveAppointmentDetailsSCA(1)}
        $("#AppointMethod")[0].options.selectedIndex=1
    }, 3000);
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

    var Customer = CustomerList.filter(function(x){ return x.value == Customerid; })[0]
    var msg = "Thanks for contacting Naturals Thanisandra!%0a%0a*Appointment Details:*%0a"
    msg = msg + "Name: " + Customer.CustomerName
    msg = msg + "%0aDate %26 Time: " + AppointmentList[0].AppTime
    msg = msg + "%0aService: " + ServiceList.filter(function(x){ return x.value == 848; })[0].ServiceName

    if (isClose == 1)
        ClosemyModalCreateAppointment();

    alert("https://api.whatsapp.com/send/?phone=91"+Customer.MobileNo + "&text="+msg);
    window.open("https://api.whatsapp.com/send/?phone=91"+Customer.MobileNo + "&text="+msg)
    return true;

}
