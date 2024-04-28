var dbs = []
var dbs_to_check = []
var dbs_all_bills = []
last_min_date = null
last_max_date = null
last_results = []
last_error = null
loading_db = false

function initiate_db(){
    if(dbs.length != 3 && !loading_db){
        loading_db = true

        dbs = [
                {"db": new restdb("662de2879dbf3549ad8faf3a"),         "min_date":"20240427", "max_date": "30000000"},
                {"db": new restdb_560a("63c50bd5969f06502871af1d"),    "min_date":"20240105", "max_date": "20240429"},
                {"db": new restdb_c22b("64f33b986888542efc0bfdfa"),    "min_date":"10000000", "max_date": "20240107"}
              ]

        loading_db = false
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
    initiate_db(function(){
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
    })
}

function get_invoice(invoice_id, callback){
    initiate_db(function(){
        db.invoices.find({'invoice_id':+invoice_id},[],function(err, res){
            if(err != null){
                callback(err, null);
            }
            else{
                console.log(res)
                callback(null, res[0])
            }
        })
    })
}

function set_last_values_and_call_callback(max_date, min_date, err, res, callback){
    last_max_date = max_date
    last_min_date = min_date
    last_error = err
    res.sort(function(a,b) { return (new Date(a._created) - new Date(b._created)); })
    last_results = res
    callback(err, res)
}

function get_bills_from_needed_dbs(query, q_params, callback){
    current_db = dbs_to_check.pop()
    if(current_db == null){
        callback(null, dbs_all_bills)
        return
    }
    current_db.bills.find(query, q_params, function(err, res){
        if(err == null){
            dbs_all_bills.push(...res)
            get_bills_from_needed_dbs(query, q_params, callback)
        }
        else{
            console.log(err)
            callback(err, [])
        }
    })
}

function get_bills_from_all_dbs(query, q_params, callback){
    initiate_db()
    dbs_to_check.length = 0
    dbs_all_bills.length = 0
    dbs.forEach((dbEntry) => {
        if(query['date_num'] == null){
            dbs_to_check.push(dbEntry.db)
        }
        else{
            if(query['date_num']["$bt"][0] < dbEntry.max_date && query['date_num']["$bt"][1] > dbEntry.min_date){
                dbs_to_check.push(dbEntry.db)
            }
        }
    })
    get_bills_from_needed_dbs(query, q_params, callback)
}

function get_customer_bills(cust_phone, callback){
    get_bills_from_all_dbs({"phone":cust_phone},[], callback)
}

function get_bills_by_id(bill_id, cust_phone, callback){
    get_bills_from_all_dbs({"bill_no":bill_id, "phone":cust_phone},[], callback)
}

function get_rest_data_by_date(max_date, min_date, callback){
    if(max_date == last_max_date && min_date == last_min_date){
        callback(last_error, last_results);
        return
    }
    if(max_date == "0"){
        db.inventory.find({}, [], function(err, res){set_last_values_and_call_callback(max_date, min_date, err, res, callback)})
    }
    else if(max_date == "-1"){
        db.appointments.find({}, [], function(err, res){
            if(err){
                set_last_values_and_call_callback(max_date, min_date, err, null, callback)
            }
            date_number = Number(moment().format("YYYYMMDD"))
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
        get_bills_from_all_dbs({'date_num':{"$bt": [max_date, min_date]}},[],function(err, res){
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
    initiate_db(function(){
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
    })
}

function add_appointment(phone_number, cust_name, apt_date_time, services, smile_provider, duration, notes){
    initiate_db(function(){
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
    })
}
console.log("RESTDB JS Loaded")
