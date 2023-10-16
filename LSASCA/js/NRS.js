all_appointments = []
customer_names = {}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  if(tabName == "Appointments"){
    initiate_db()
    get_rest_data_by_date("-1", 0, function(err, appts){
        console.log(err)
        all_appointments = appts
        show_appointments()
    })
  }
}

function LoadNRS(){
    $('#CustomersBtn')[0].click()
    try{
        fetch('http://localhost/known_clients.json')
            .then(response => response.json())
            .then(data => { customer_names = data })
    }
    catch{
        console.log("Exception to load Known Clients")
    }

    apt_sp_select = $('#ip_apt_sp')[0]
    for(opt in emp_map){
        add_option(apt_sp_select, emp_map[opt])
    }
    $('#ip_apt_date').val(moment().format('YYYY-MM-DDTHH:MM'))
}

function check_customer(){
    apt_phone = $('#ip_apt_phone')[0].value
    if(apt_phone.length == 10){
        if(customer_names[apt_phone] != undefined){
            $('#ip_apt_name')[0].value = customer_names[apt_phone]
        }
        else{
            $('#ip_apt_name')[0].value = "NewCustomer"
        }
    }
}

function searchCustomer(){
    phone_no = $('#ip_custSearchPhone')[0].value
    get_customer_bills(phone_no.trim(), function(err, bills){
        if(bills.length > 0){
            show_bills_in_table(bills, 'customerHistoryTbl', "Service Report", true, true)
            $('#customerHistoryTbl')[0].style.display = "block"
            $('#customerNoBillsLabel')[0].style.display = "none"
        }
        else{
            $('#customerHistoryTbl')[0].style.display = "none"
            $('#customerNoBillsLabel')[0].style.display = "block"
        }
    })
}

function saveAppointment(){
    initiate_db()
    appointment_data = {
        "Date" : $('#ip_apt_date')[0].value.split("T")[0].replace("-", "").replace("-", ""),
        "AptTime" : $('#ip_apt_date')[0].value,
        "Phone" : $('#ip_apt_phone')[0].value,
        "Name" : $('#ip_apt_name')[0].value,
        "Services" : $('#ip_apt_services')[0].value,
        "SP" : $('#ip_apt_sp')[0].value,
    }
    new_apt = new db.appointments(appointment_data)
    new_apt.save()
    all_appointments.push(new_apt)
    show_appointments()
}

function show_appointments(){
    all_appointments.sort(function(a,b) {return (new Date(a.AptTime) - new Date(b.AptTime)); })
    show_bills_in_table(all_appointments, "aptTable", "Appointments", false, false)
}

console.log("NRS JS Loaded")
