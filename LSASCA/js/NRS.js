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

function LoadNRS(){
    $('#CustomersBtn')[0].click()
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
