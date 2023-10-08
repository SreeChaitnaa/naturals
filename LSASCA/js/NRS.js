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
}

customer_names = {}


function LoadNRS(){
    $('#CustomersBtn')[0].click()
    fetch('http://localhost/known_clients.json')
        .then(response => response.json())
        .then(data => { customer_names = data })

    apt_sp_select = $('#ip_apt_sp')[0]
    for(opt in emp_map){
        add_option(apt_sp_select, emp_map[opt])
    }
}

function check_customer(){
    apt_phone = $('#ip_apt_phone')[0].value
    if(apt_phone.length == 10){
        if(customer_names[apt_phone] != undefined){
            $('#ip_apt_name')[0].value = customer_names[apt_phone]
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

console.log("NRS JS Loaded")
