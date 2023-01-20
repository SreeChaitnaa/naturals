var db = null
last_min_date = null
last_max_date = null
last_results = []
last_error = null
loading_db = false

function initiate_db(){
    if(db == null && !loading_db){
        loading_db = true
        $.ajax({url: 'https://'+ restdb_name +'.restdb.io/rest/_jsapi.js',dataType: 'script', success: function(){ 
            db = new restdb(restdb_key) 
            loading_db = false
            console.log("DB Script loaded")
            console.log(db)
        }})
    }
}

// function delete_old_appointments(){
//     date_value = new Date()
//     date_number = Number(date_value.dateFormat('Ymd'))
//     db.appointments.find({'Date':{"$lt": date_number}}, [], function(err, old_appointments){
//         if(err){
//             throw err
//         }
//         if(old_appointments.length > 0){
//             for(i in old_appointments){
//                 old_appointments[i].delete()
//             }
//         }
//     })
// }

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

function set_last_values_and_call_callback(max_date, min_date, err, res, callback){
    last_max_date = max_date
    last_min_date = min_date
    last_error = err
    last_results = res
    callback(err, res)
}

function get_invoice_by_date(max_date, min_date, callback){
    if(max_date == last_max_date && min_date == last_min_date){
        callback(last_error, last_results);
        return
    }

    initiate_db()
    if(max_date == "0"){
        db.inventory.find({}, [], function(err, res){set_last_values_and_call_callback(max_date, min_date, err, res, callback)})
    }
    else if(max_date == "-1"){
        db.appointments.find({}, [], function(err, res){
            if(err){
                set_last_values_and_call_callback(max_date, min_date, err, null, callback)
            }
            date_value = new Date()
            date_number = Number(date_value.dateFormat('Ymd'))
            apts = []
            if(res.length > 0){
                for(i in res){
                    if(res[i].Date < date_number){
                        res[i].delete()
                    }
                    else{
                        apts.push(res[i])
                    }
                }
            }
            set_last_values_and_call_callback(max_date, min_date, null, apts, callback)
        })
    }
    else{
        db.invoices.find({'date_number':{"$bt": [max_date, min_date]}},[],function(err, res){
            if(err != null){
                set_last_values_and_call_callback(max_date, min_date, err, null, callback)
            }
            else{
                console.log(res)
                set_last_values_and_call_callback(max_date, min_date, null, res, callback)
            }
        })
    }
}

function add_inventory(prod_id, prod_name, prod_count, mrp=0){
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
            new_item = new db.inventory({prod_name:prod_name, prod_id:prod_id, count :0+prod_count, mrp: Math.round(Number(mrp)/Number(prod_count))})
        }
        new_item.save()
    })
}

function add_appointment(phone_number, cust_name, apt_date_time, services, smile_provider, duration, notes){
    initiate_db()
    months = {
        "jan" : '01',
        "feb" : '02',
        "mar" : '03',
        "apr" : '04',
        "may" : '05',
        "jun" : '06',
        "jul" : '07',
        "aug" : '08',
        "sep" : '09',
        "oct" : '10',
        "nov" : '11',
        "dec" : '12'
    }
    for (var month in months) {
        if(apt_date_time.toLowerCase().indexOf(month) > 0){
            apt_date_time = apt_date_time.toLowerCase().replace(month, months[month]).toUpperCase()
            break
        }
    }

    app_data = JSON.stringify({ 'phone_number': phone_number, 
                                'cust_name': cust_name, 
                                'apt_date_time': apt_date_time,
                                'services': services, 
                                'smile_provider': smile_provider, 
                                'duration': duration, 
                                'notes': notes
                })
    date_numbers = apt_date_time.split(' ')[0].split("-")
    date_number = Number(date_numbers[2]+date_numbers[1]+date_numbers[0])
    new_item = new db.appointments({Date:date_number, apt_data:app_data})
    new_item.save()
}
console.log("RESTDB JS Loaded")
