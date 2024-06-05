frappe.ui.form.on("Task", {
    refresh: function(frm){
        frm.add_custom_button("Timesheet", function(){
            create_timesheet(frm)
        }, __("Create"));
        
        frm.add_custom_button("Stock Entry", function() {
            create_stock_entry(frm)
        }, __("Create"));

        frm.add_custom_button("Sales Invoice", function() {
            create_sales_invoice(frm)
        }, __("Create")); 

        frm.page.set_inner_btn_group_as_primary(__('Create'));


        if(frm.is_dirty()){
            let message_html = `
            <div class="mb-5">Please Save From to Get Summary Data.</div>
            `
            frm.set_df_property("custom_test", "options", message_html);
        }
        
        if(frm.is_new()){
            let message_html = `
            <div class="mb-5">Please Enter Data and Save From to Get Summary Data.</div>
            `
            frm.set_df_property("custom_test", "options", message_html);
        }
        else{
            frappe.call({
                method:"harness.api.task.get_summary",
                args: {
                    job: frm.doc.name
                },
                callback: function(r){
                    frm.set_df_property("custom_test", "options", r.message);
                }
            })
        }

        frm.fields_dict['custom_resources1'].grid.get_field('service_item').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['is_stock_item', '=', 0]
                ]
            };
        };
        frm.fields_dict['custom_resources'].grid.get_field('service_item').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['is_stock_item', '=', 0]
                ]
            };
        };

        calculate_and_set_summed_values(frm);    
    },

    onload: function(frm){
        get_stock_summary_data(frm);
    },
   
    custom_button: function(frm){
        frappe.db.get_value('Sales Order', {"name": frm.doc.custom_sales_order }, 'customer')
        .then(value => {
            // Do something with the value
            console.log("customer", value.message.customer);
            window.location.href = `/app/job-page?job=${frm.doc.name}&customer=${value.message.customer}&sales_order=${frm.doc.custom_sales_order}`
        })
        .catch(err => {
            // Handle error
            console.log(err);
        });
	},
    
    // Trigger when a row in the child table is changed
    validate: function(frm) {
        calculate_and_set_summed_values(frm);
    }

});

frappe.ui.form.on('Mate', {
    amount: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    },
    quentity: function(frm, cdt, cdn) {
        calculateAmount(frm, cdt, cdn);
    },
    rate: function(frm, cdt, cdn) {
        calculateAmount(frm, cdt, cdn);
    }
});

frappe.ui.form.on('Material', {
    amount: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    },
    quentity: function(frm, cdt, cdn) {
        calculateAmount(frm, cdt, cdn);
    },
    rate: function(frm, cdt, cdn) {
        calculateAmount(frm, cdt, cdn);
    }
});

frappe.ui.form.on('Resource', {
    total_spend_hours: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    },
    spent_hours: function(frm, cdt, cdn){
        calculateHour(frm, cdt, cdn)
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    },

    rate: function(frm, cdt, cdn){
        calculateHour(frm, cdt, cdn)
    },
    
});

function sum_of_m_amount(frm) {
    var m_e_total = 0;
    var m_a_total = 0;

    if (frm.doc.custom_mterials && Array.isArray(frm.doc.custom_mterials)) {
        frm.doc.custom_mterials.forEach(function(row) {
            m_e_total += row.amount || 0;
        });
        frm.set_value('custom_material_total_estimated_amount', m_e_total);
        
    }

    if (frm.doc.custom_materials1 && Array.isArray(frm.doc.custom_materials1)) {
        frm.doc.custom_materials1.forEach(function(row) {
            m_a_total += row.amount || 0;
        });
        frm.set_value('custom_material_total_actual_costing1', m_a_total);
    }
}

function sum_of_r_amount(frm) {
    var r_e_total = 0;
    var r_a_total = 0;

    var r_e_hour = 0;
    var r_a_hour = 0;

    if (frm.doc.custom_resources && Array.isArray(frm.doc.custom_resources)) {
        frm.doc.custom_resources.forEach(function(row) {
            r_e_total += row.total_spend_hours || 0;
            r_e_hour += row.spent_hours || 0;
        });
        frm.set_value('custom_resource_total_estimated_hours', r_e_hour);
        frm.set_value('custom_estimated_total_resource_cost', r_e_total);
    }

    if (frm.doc.custom_resources1 && Array.isArray(frm.doc.custom_resources1)) {
        frm.doc.custom_resources1.forEach(function(row) {
            r_a_total += row.total_spend_hours || 0;
            r_a_hour += row.spent_hours || 0;
        });
        frm.set_value('custom_resource_total_actual_hours1', r_a_hour);
        frm.set_value('custom_resource_total_actual_cost', r_a_total);
    }
}

function calculateAmount(frm, cdt, cdn) {
    var child = locals[cdt][cdn];
    var qty = child.quentity;
    var rate = child.rate;
    var amount = qty * rate;
    frappe.model.set_value(cdt, cdn, 'amount', amount);
}

function calculateHour(frm, cdt, cdn) {
    var child = locals[cdt][cdn];
    var spent_hours = child.spent_hours;
    var rate = child.rate;
    var total_spend_hours = spent_hours * rate;
    frappe.model.set_value(cdt, cdn, 'total_spend_hours', total_spend_hours);
}

// Create Timesheet
function create_timesheet(frm){
    frappe.model.with_doctype("Timesheet", function() {
        var timesheet = frappe.model.get_new_doc("Timesheet");
        
        var count = 0; // Initialize count variable outside the loop
        var promises = []; // Array to hold all the promises

        frm.doc.custom_resources.forEach(function(row, index) {
            var time_log_table = [];
            var time_log_row = {};
            time_log_row.custom_service_item = row.service_item;
            time_log_row.hours = row.spent_hours;
            time_log_row.custom_department = row.department;
            time_log_row.activity_type = row.activity_type;
            time_log_row.custom_sales_order = frm.doc.custom_sales_order;
            time_log_row.task = frm.doc.name;
            time_log_row.is_billable = 1;
            time_log_row.billing_hours = row.spent_hours;
            time_log_row.base_billing_rate = row.rate;
            time_log_row.base_billing_amount = row.total_spend_hours;
            time_log_row.billing_rate = row.rate;
            time_log_row.billing_amount = row.total_spend_hours;

            time_log_table.push(time_log_row);

            timesheet.time_logs = time_log_table;
            timesheet.employee = row.resource_name;

            // Create a promise for each call and push it to promises array
            var promise = new Promise(function(resolve, reject) {
                frappe.call({
                    method: 'frappe.client.insert',
                    args: {
                        doc: timesheet
                    },
                    callback: function(response) {
                        if (!response.exc) {
                            count++; // Increment count after successful creation
                            resolve(); // Resolve the promise
                        } else {
                            reject(response.exc); // Reject the promise with the error message
                        }
                    }
                });
            });

            promises.push(promise); // Push the promise to the array
        });

        // When all promises are resolved, display the message
        Promise.all(promises)
            .then(function() {
                frappe.msgprint(count +" Timesheets created successfully.");
            })
            .catch(function(error) {
                frappe.msgprint("Error creating Timesheets: " + error);
            });

    });
}

function create_stock_entry(frm){
    frappe.call({
        method: "harness.api.task.create_stock_entry",
        args: {
            docname: frm.docname
        },
        callback: function(response) {
            frappe.model.with_doctype("Stock Entry", function() {
                var tasks = response.message; // response contains child table data of JOB
                console.log(tasks);
                // Create a new Stock Entry
                var stock_entry = frappe.model.get_new_doc("Stock Entry");

                // Iterate over tasks data and add rows to Stock Entry's items table
                $.each(tasks, function(index, task) {
                    var item_row = frappe.model.add_child(stock_entry, "Stock Entry Detail", "items");
                    frappe.model.set_value(item_row.doctype, item_row.name, 's_warehouse', task.s_warehouse);
                    frappe.model.set_value(item_row.doctype, item_row.name, 't_warehouse', task.t_warehouse);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'item_code', task.item_code);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'qty', task.qty);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'transfer_qty', task.transfer_qty);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'basic_rate', task.basic_rate);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'basic_amount', task.basic_amount);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'custom_job_order', task.custom_job_order);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'uom', task.uom);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'stock_uom', task.stock_uom);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'conversion_factor', task.conversion_factor);

                    // Refresh the child table field
                    refresh_field("items");
                });
                frappe.model.set_value(stock_entry.doctype, stock_entry.name, 'stock_entry_type', 'Material Transfer for Manufacture');

                frappe.ui.form.make_quick_entry('Stock Entry', null, null, stock_entry);
            });
        }
    });
}

function create_sales_invoice(frm){
    frappe.model.open_mapped_doc({
        method: "harness.api.task.create_sales_invoice",
        frm: frm,
    })

    // frappe.call({
    //     method: "harness.api.task.create_sales_invoice",
    //     args: {
    //         docname: frm.docname
    //     },
    //     callback: function(response) {

    //         console.log("asdfasdf", response.message)
    //         // frappe.set_route('Form', "Sales Invoice", response.message)

    //         frappe.model.with_doctype("Sales Invoice", function() {
    //             var tasks = response.message[1]; // response contains child table data of JOB
    //             console.log(tasks);
    //             // Create a new Sales Invoice
    //             var sales_invoice = frappe.model.get_new_doc("Sales Invoice");

    //             // Iterate over tasks data and add rows to Sales Invoice's items table
    //             $.each(tasks, function(index, task) {
    //                 var item_row = frappe.model.add_child(sales_invoice, "Sales Invoice Item", "items");
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'item_code', task.item_code);
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'qty', task.qty);
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'rate', task.rate);
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'amount', task.amount);
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'warehouse', task.warehouse);
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'target_warehouse', task.target_warehouse);
    //                 frappe.model.set_value(item_row.doctype, item_row.name, 'sales order', task.sales_order);

    //                 // Refresh the child table field
    //                 // refresh_field("items");
    //             });

    //             var sid = response.message[0]; // response contains child table data of JOB

    //             frappe.model.set_value(sales_invoice.doctype, sales_invoice.name, 'customer', sid["customer"]);
    //             frappe.model.set_value(sales_invoice.doctype, sales_invoice.name, 'custom_job_order', sid["custom_job_order"]);

    //             frappe.ui.form.make_quick_entry('Sales Invoice', null, null, sales_invoice);
    //             refresh_field("items");

    //         });

    //     }
    // });

}

// Create Stock Entry
// function create_stock_entry(frm){
//     frappe.model.with_doctype("Stock Entry", function() {
//         var stock_entry = frappe.model.get_new_doc("Stock Entry");
        
//         var items_table = [];
//         frm.doc.custom_mterials.forEach(function(row) {
//             var items_row = {};

//             items_row.item_code = row.material_item
//             items_row.custom_job_order = frm.doc.name
//             items_row.qty = row.quentity
//             items_row.basic_rate = row.rate
//             items_row.basic_amount = row.amount
//             items_row.s_warehouse = row.source_warehouse
//             items_row.t_warehouse = row.target_warehouse
        
//             items_table.push(items_row);
//         });

//             stock_entry.stock_entry_type = "Material Transfer for Manufacture"
//             stock_entry.items = items_table;

//             // refresh_field('items');
//             console.log("Asdf", stock_entry)
        
//             frappe.ui.form.make_quick_entry('Stock Entry', null, null, stock_entry);

//             refresh_field('items');
//     });
// }


function calculate_and_set_summed_values(frm) {
    // Initialize a dictionary to store the sums for rate, amount, and qty
    let summed_values = {};

    if (frm.doc.custom_resources1){
    // Loop through the first child table
    frm.doc.custom_resources1.forEach(row => {
        if (!summed_values[row.service_item]) {
            summed_values[row.service_item] = {
                rate: 0,
                amount: 0,
                qty: 0
            };
        }
        summed_values[row.service_item].rate += row.rate;
        summed_values[row.service_item].amount += row.total_spend_hours;
        summed_values[row.service_item].qty += row.spent_hours;
    });

    // Loop through the summed values and update or add rows in the second child table
    for (let service_item in summed_values) {
        let exists = false;

        // Check if the row already exists in the second child table
        frm.doc.custom_materials1.forEach(row => {
            if (row.material_item === service_item && row.type === "Labours") {
                // Update the existing row
                row.rate = summed_values[service_item].rate;
                row.amount = summed_values[service_item].amount;
                row.quentity = summed_values[service_item].qty;
                exists = true;
            }
        });

        // If the row does not exist, create a new row
        if (!exists) {
            let new_row = frm.add_child("custom_materials1");
            new_row.material_item = service_item;
            new_row.rate = summed_values[service_item].rate;
            new_row.amount = summed_values[service_item].amount;
            new_row.quentity = summed_values[service_item].qty;
            new_row.type = "Labours";
        }
    }

}

    // Refresh the field to show the changes
    frm.refresh_field("custom_materials1");
}

function get_stock_summary_data(frm){
    if (frm.doc.custom_mterials && Array.isArray(frm.doc.custom_mterials)) {
        frappe.call({
            method: "harness.api.task.set_stock_summary_data_in_job",
            args: {
                job: frm.doc.name
            },
            callback: function(res){
                console.log("res", res)
                res.message.forEach(function(row){
                    let row_name = row["row_name"]
                    frappe.model.set_value("Mate", row_name, "available_quantity", row["available_qty"])
                    frappe.model.set_value("Mate", row_name, "actual_quantity", row["actual_qty"])
                    frappe.model.set_value("Mate", row_name, "order_quantity", row["order_qty"])
                    frappe.model.set_value("Mate", row_name, "reserved_quantity", row["reserved_qty"])
                    frappe.model.set_value("Mate", row_name, "to_be_order_quantity", row["to_be_order_qty"])
                })
                frm.refresh_field("custom_mterials")
            }
        })
        frm.save()
    }
}
