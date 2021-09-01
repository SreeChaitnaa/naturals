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

if($("#AppointMethod")[0].options.length == 3){
    $("#AppointMethod")[0].options.remove(2)
}
