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