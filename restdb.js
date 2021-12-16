var db = null


// headers = {
//     "x-apikey": "612f97f843cedb6d1f97eba5",
//     "Content-Type": "application/json"
// }

// last_settings = ''
// function add_item(collection, item, callback = undefined){
//     var settings = {
//         "url": "https://naturals-d1c4.restdb.io/rest/" + collection,
//         "method": "POST",
//         "timeout": 0,
//         "headers": headers,
//         "data": JSON.stringify(item),
//     };
//     last_settings = settings;

//     $.ajax(settings).done(function (response) {
//         console.log(response);
//         if(callback != undefined){
//             callback(response)
//         }
//     });
// }

// function add_product(name, count) {
//     add_item("inventory", { "prod_name": name, "count": count })
// }

function initiate_db(){
    if(db == null){
        db = new restdb(restdb_key)
    }
}

function add_invoice(invoice, callback){
    initiate_db()
    date_value = new Date()
    date_number = Number(date_value.dateFormat('Ymd'))
    new_invoice = new db.invoices({
        "invoice_json": JSON.stringify(invoice), 
        "date": date_value,
        "date_number": date_number
    })
    new_invoice.save(function(err, res){
        if(err != null){
            callback(err, null);
        }
        else{
            callback(null, new_invoice.invoice_id)
        }
    })
}

function get_invoice(invoice_id, callback){
    initiate_db()
    db.invoices.find({'invoice_id':+invoice_id},[],function(err, res){
        if(err != null){
            callback(err, null);
        }
        else{
            console.log(res)
            callback(null, res[0])
        }
    })
}

function get_invoice_by_date(max_date, min_date, callback){
    initiate_db()
    if(max_date == "0"){
        db.inventory.find({}, [], callback)
    }
    else{
        db.invoices.find({'date_number':{"$bt": [max_date, min_date]}},[],function(err, res){
            if(err != null){
                callback(err, null);
            }
            else{
                console.log(res)
                callback(null, res)
            }
        })
    }
}

function get_setting(key, callback){
    initiate_db()
    db.settings.find({'key':key},[],function(err, res){
        if(err != null){
            callback(err, null);
        }
        else{
            console.log(res)
            callback(null, res[0].value)
        }
    })
}

function update_setting(key, value, callback){
    initiate_db()
    db.settings.find({'key':key},[],function(err, res){
        if(err != null && callback){
            callback(err, null);
        }
        else{
            console.log(res)
            res[0].value = value
            res[0].save(callback)
        }
    })
}

function add_inventory(prod_id, prod_name, prod_count){
    initiate_db()
    db.inventory.find({'prod_id':prod_id},[], function(err, res){
        if(err){
            throw err
        }
        var new_item = null
        if(res.length > 0){
            new_item = res[0]
            new_item.count += prod_count
        }
        else{
            new_item = new db.inventory({prod_name:prod_name, prod_id:prod_id, count :0+prod_count})
        }
        new_item.save()
    })
}

function get_nt_services(callback){
    initiate_db()
    db.ntservices.find({},[], function(err, nt_services){
        if(err){
            throw err
        }
        if(nt_services.length > 0){
            for(i in nt_services){
                nt_services[i].cgstpercent = 9
                nt_services[i].kfcpercent = 0
                nt_services[i].label = nt_services[i].ServiceName + "-" +nt_services[i].ServiceCode + " - " + nt_services[i].actualPrice
                nt_services[i].memberDiscount = 0
                nt_services[i].qty = 1
                nt_services[i].sgstpercent = 9
                nt_services[i].taxid = "1"
                nt_services[i].taxname = "18 %"
                nt_services[i].value = nt_services[i].ServiceCode
            }
            callback(nt_services)
        }
    })
}
console.log("RESTDB JS Loaded")
