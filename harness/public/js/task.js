frappe.ui.form.on("Task", {
    refresh: function(frm){
        frm.add_custom_button("Timesheet", function(){
            create_timesheet(frm)
        }, __("Create"));
        
        frm.add_custom_button("Stock Entry", function() {
            create_stock_entry(frm)
        }, __("Create"));

        // frm.add_custom_button("Sales Invoice", function() {
        //     create_sales_invoice(frm)
        // }, __("Create")); 

        frm.page.set_inner_btn_group_as_primary(__('Create'));

        jobCheckList(frm)

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
           get_summary_data(frm)
        }

        frm.fields_dict['custom_resources1'].grid.get_field('service_item').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['is_stock_item', '=', 0]
                ]
            };
        };

        calculate_and_set_summed_values(frm);
    },

    after_save: function(frm){
        get_summary_data(frm)
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
        checkTotalHours(frm)
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
    // frm.save()
    // frm.refresh()
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
    // frm.save()
    // frm.refresh()
}

function calculateAmount(frm, cdt, cdn) {
    var child = locals[cdt][cdn];
    var qty = child.quentity;
    var rate = child.rate;
    var amount = qty * rate;
    frappe.model.set_value(cdt, cdn, 'amount', amount);
    // frm.save()
}

function calculateHour(frm, cdt, cdn) {
    var child = locals[cdt][cdn];
    var spent_hours = child.spent_hours;
    var rate = child.rate;
    var total_spend_hours = spent_hours * rate;
    frappe.model.set_value(cdt, cdn, 'total_spend_hours', total_spend_hours);
    // frm.save()
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
                    frappe.model.set_value(item_row.doctype, item_row.name, 'custom_bom_no', task.custom_bom_no);

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
                res.message.forEach(function(row){
                    let row_name = row["row_name"]
                    // frappe.model.set_value("Mate", row_name, "available_quantity", row["available_qty"])
                    // frappe.model.set_value("Mate", row_name, "actual_quantity", row["actual_qty"])
                    // frappe.model.set_value("Mate", row_name, "order_quantity", row["order_qty"])
                    // // frappe.model.set_value("Mate", row_name, "reserved_quantity", row["reserved_qty"])
                    // frappe.model.set_value("Mate", row_name, "to_be_order_quantity", row["to_be_order_qty"])

                    row_name.available_quantity = row["available_qty"]
                    row_name.actual_quantity = row["actual_qty"]
                    row_name.order_quantity = row["order_qty"]
                    // row.reserved_quantity = row["reserved_qty"]
                    row_name.to_be_order_quantity = row["to_be_order_qty"]

                })
                frm.refresh_field("custom_mterials")
            }
        })
        // frm.save()
    }
}

function jobCheckList(frm){
    let checklisthtml = `  <table border="1" class="full-width-table mb-3">
        <thead>
            <th>Job Status</th>
            <th></th>
            <th style="text-align: left;">Job Checklist</th>
            <th>Employee Name</th>
            <th>Date and Time</th>
        </thead>
        <tbody>
            <tr>
                <td rowspan="1">Open</td>
                <td><input type="checkbox" id="checkbox_row1" onclick="logCheckboxValue(event,'row1')"></td>
                <td id="job_check_row1" style="text-align: left;"><label for="checkbox_row1">Create Asset in ERPNext and Push it to SC</label></td>
                <td id="employee_name_row1"></td>
                <td id="date_row1"></td>
            </tr>

            <tr>
                <td id="job_status_row3" rowspan="18">Planning</td>
                
                <td colspan="2"><b>Inventory</b> </td>
                <td </td>
                <td </td>
            </tr>
              <tr>
                <td><input type="checkbox" id="checkbox_row6" onclick="logCheckboxValue(event,'row6')"></td>
                <td id="job_check_row6" style="text-align: left;"><label for="checkbox_row6">Parts Ordered Factory</label></td>
                <td id="employee_name_row6"></td>
                <td id="date_row6"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row7" onclick="logCheckboxValue(event,'row7')"></td>
                <td id="job_check_row7" style="text-align: left;"><label for="checkbox_row7">Parts Ordered Local</label></td>
                <td id="employee_name_row7"></td>
                <td id="date_row7"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row8" onclick="logCheckboxValue(event,'row8')"></td>
                <td id="job_check_row8" style="text-align: left;"><label for="checkbox_row8">Parts Received</label></td>
                <td id="employee_name_row8"></td>
                <td id="date_row8"></td>
            </tr>
             <tr>
                <td><input type="checkbox" id="checkbox_row9" onclick="logCheckboxValue(event,'row9')"></td>
                <td id="job_check_row9" style="text-align: left;"><label for="checkbox_row9">Parts Reserved</label></td>
                <td id="employee_name_row9"></td>
                <td id="date_row9"></td>
            </tr>
             <tr>
                <td><input type="checkbox" id="checkbox_row10" onclick="logCheckboxValue(event,'row10')"></td>
                <td id="job_check_row10" style="text-align: left;"><label for="checkbox_row10">Parts Picked (Allocated)</label></td>
                <td id="employee_name_row10"></td>
                <td id="date_row10"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row11" onclick="logCheckboxValue(event,'row11')"></td>
                <td id="job_check_row11" style="text-align: left;"><label for="checkbox_row11">Parts Ready to Ship</label></td>
                <td id="employee_name_row11"></td>
                <td id="date_row11"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row12" onclick="logCheckboxValue(event,'row12')"></td>
                <td id="job_check_row12" style="text-align: left;"><label for="checkbox_row12">Parts Shipped</label></td>
                <td id="employee_name_row12"></td>
                <td id="date_row12"></td>
            </tr>

              <td colspan="2"><b>Payroll</b></td>
                <td> </td>
                <td> </td>

            <tr>
                <td><input type="checkbox" id="checkbox_row13" onclick="logCheckboxValue(event,'row13')"></td>
                <td id="job_check_row13" style="text-align: left;"><label for="checkbox_row13">Job Scheduled</label></td>
                <td id="employee_name_row13"></td>
                <td id="date_row13"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row14" onclick="logCheckboxValue(event,'row14')"></td>
                <td id="job_check_row14" style="text-align: left;"><label for="checkbox_row14">Employees Allocated</label></td>
                <td id="employee_name_row14"></td>
                <td id="date_row14"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row15" onclick="logCheckboxValue(event,'row15')"></td>
                <td id="job_check_row15" style="text-align: left;"><label for="checkbox_row15">Site Inductions</label></td>
                <td id="employee_name_row15"></td>
                <td id="date_row15"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row16" onclick="logCheckboxValue(event,'row16')"></td>
                <td id="job_check_row16" style="text-align: left;"><label for="checkbox_row16">Flights arranged</label></td>
                <td id="employee_name_row16"></td>
                <td id="date_row16"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row17" onclick="logCheckboxValue(event,'row17')"></td>
                <td id="job_check_row17" style="text-align: left;"><label for="checkbox_row17">Accomodation arranged</label></td>
                <td id="employee_name_row17"></td>
                <td id="date_row17"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row18" onclick="logCheckboxValue(event,'row18')"></td>
                <td id="job_check_row18" style="text-align: left;"><label for="checkbox_row18">Advise Employees</label></td>
                <td id="employee_name_row18"></td>
                <td id="date_row18"></td>
            </tr>
            
              <td colspan="2"><b>Purchasing </b></td>
                <td ></td>
                <td></td>
            <tr>
                <td><input type="checkbox" id="checkbox_row19" onclick="logCheckboxValue(event,'row19')"></td>
                <td id="job_check_row19" style="text-align: left;"><label for="checkbox_row19">PO 3rd Party</label></td>
                <td id="employee_name_row19"></td>
                <td id="date_row19"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row20" onclick="logCheckboxValue(event,'row20')"></td>
                <td id="job_check_row20" style="text-align: left;"><label for="checkbox_row20">3rd Party Work Completed</label></td>
                <td id="employee_name_row20"></td>
                <td id="date_row20"></td>
            </tr>
            <tr>
                <td rowspan="2">Ready to Start</td>
                <td><input type="checkbox" id="checkbox_row21" onclick="logCheckboxValue(event,'row21')"></td>
                <td id="job_check_row21" style="text-align: left;"><label for="checkbox_row21">Push Job to Safety Culture</label></td>
                <td id="employee_name_row21"></td>
                <td id="date_row21"></td>
            </tr>
            <tr>
                <td><input type="checkbox" id="checkbox_row22" onclick="logCheckboxValue(event,'row22')"></td>
                <td id="job_check_row22" style="text-align: left;"><label for="checkbox_row22">Push Job to ADP</label></td>
                <td id="employee_name_row22"></td>
                <td id="date_row22"></td>
            </tr>
        </tbody>
    </table>
    
    <script>



    function logCheckboxValue(event, rowId) {
        try {
            var selectedCheckboxes = []

            var checkbox = event.target;
    
            var row = checkbox.closest('tr');
    
            var employeeNameCell = row.querySelector('#employee_name_' + rowId);
            var dateCell = row.querySelector('#date_' + rowId);
            var jobChecklistCell = row.querySelector('#job_check_' + rowId).textContent.trim();
    
        
            var jobStatusCell = '';
            if (row.querySelector('td[rowspan]')) {
                jobStatusCell = row.querySelector('td[rowspan]').textContent.trim();
            } else {
                var prevRow = row.previousElementSibling;
                while (prevRow) {
                    if (prevRow.querySelector('td[rowspan]')) {
                        jobStatusCell = prevRow.querySelector('td[rowspan]').textContent.trim();
                        break;
                    }
                    prevRow = prevRow.previousElementSibling;
                }
            }
    
            var employeeName = '';
            var formattedDate = '';
    
            if (checkbox.checked) {
                employeeName = frappe.session.user_fullname || 'Unknown User';
    
                
                var currentDate = new Date();
                formattedDate = currentDate.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
    
                employeeNameCell.innerHTML = employeeName;
                dateCell.innerHTML = formattedDate;
            } else {
                
                employeeNameCell.innerHTML = '';
                dateCell.innerHTML = '';
            }
    
            var frm = cur_frm; // Assuming 'cur_frm' is accessible here
            // frm.clear_table('custom_job_checklist');
    
            var checkboxes = document.querySelectorAll('input[type="checkbox"][id^="checkbox_"]');
            var hasCheckedCheckboxes = false; 

            checkboxes.forEach(function (cb) {
                if (cb.checked) {
                    hasCheckedCheckboxes = true;
                    var row = cb.closest('tr');
                    var rowId = cb.id.split('_')[1];
                    var employeeNameCell = row.querySelector('#employee_name_' + rowId);
                    var dateCell = row.querySelector('#date_' + rowId);
                    var jobChecklistCell = row.querySelector('#job_check_' + rowId).textContent.trim();
    
                    var jobStatusCell = '';
                    if (row.querySelector('td[rowspan]')) {
                        jobStatusCell = row.querySelector('td[rowspan]').textContent.trim();
                    } else {
                        var prevRow = row.previousElementSibling;
                        while (prevRow) {
                            if (prevRow.querySelector('td[rowspan]')) {
                                jobStatusCell = prevRow.querySelector('td[rowspan]').textContent.trim();
                                break;
                            }
                            prevRow = prevRow.previousElementSibling;
                        }
                    }
    
                    var employeeName = employeeNameCell ? employeeNameCell.innerHTML : '';
                    var formattedDate = dateCell ? dateCell.innerHTML : '';
    
                    
                    var logData = {
                        jobstatus: jobStatusCell,
                        check: cb.checked,
                        jobchecklist: jobChecklistCell,
                        employeename: employeeName,
                        date: formattedDate
                    };
    
                    // console.log(logData);
    
                    
                    // var childTable = frm.fields_dict['custom_job_checklist'].grid;
                    // var newRow = childTable.add_new_row();
    
                    // newRow.job_status = logData.jobstatus;
                    // newRow.check = logData.check;
                    // newRow.job_checklist = logData.jobchecklist;
                    // newRow.employee_name = logData.employeename;
                    // newRow.date = logData.date;
    
                    // frm.refresh_field('custom_job_checklist');
                    
                    // ============================================
                        selectedCheckboxes.push({
                                parent_docname: cur_frm.doc.name,
                                jobstatus: logData.jobstatus,
                                check: logData.check,
                                jobchecklist: logData.jobchecklist,
                                employeename: logData.employeename,
                                date: logData.date
                            })
                    // ============================================

                }
            });
            // console.log("selected checkbox", selectedCheckboxes)

            frappe.call({
                method: "harness.api.task.set_checklist_status",
                args: {
                    parent_docname: cur_frm.doc.name,
                    selected_checkboxes: selectedCheckboxes
                },
                callback: function(response) {
                    // frm.refresh_field('custom_job_checklist');
                }
            });


            // if (!hasCheckedCheckboxes) {
            //     frm.refresh_field('custom_job_checklist');
            // }
    
        } catch (error) {
            console.error('Error updating the row:', error);
        }
    }


    function printChildTableData() {
        var frm = cur_frm; 
        // var childTableData = frm.doc.custom_job_checklist;
        
        frappe.call({
            method: "harness.api.task.get_checklist_status",
            args:{
                parent_docname: cur_frm.doc.name,
            },
            callback: function(res){
                var childTableData = res.message
            
                childTableData.forEach(function(row) {
                    var rowData = {
                        jobstatus: row.job_status,
                        check: row.check,
                        jobchecklist: row.job_checklist,
                        employeename: row.employee_name,
                        date: row.date
                    };

                    // console.log("Child Table Row Data:", rowData);

                    // Find the matching checklist item in the HTML
                    var checkboxId = null;
                    document.querySelectorAll('td[id^="job_check_row"]').forEach(function(cell) {
                        if (cell.textContent.trim() === rowData.jobchecklist) {
                            checkboxId = cell.querySelector('label').getAttribute('for');
                        }
                    });

                    if (checkboxId) {
                        var checkbox = document.getElementById(checkboxId);
                        if (checkbox && !checkbox.checked) {
                            // Simulate a click event on the checkbox
                            checkbox.checked = true;
                            var clickEvent = new Event('click');
                            checkbox.dispatchEvent(clickEvent);
                        }

                        // Fill Employee Name and Date manually in case they are not filled correctly by the event.
                        var rowId = checkboxId.replace('checkbox_row', '');
                        var employeeNameCell = document.getElementById('employee_name_' + rowId);
                        var dateCell = document.getElementById('date_' + rowId);

                        if (employeeNameCell && !employeeNameCell.innerHTML) {
                            employeeNameCell.innerHTML = rowData.employeename || 'Unknown User';
                        }

                        if (dateCell && !dateCell.innerHTML) {
                            dateCell.innerHTML = rowData.date || new Date().toLocaleString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });
                        }
                    }
                });
            }
        })
    }

    printChildTableData();
    
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
                checkbox.addEventListener('click', function(event) {
                    logCheckboxValue(event, this.id.replace('checkbox_row', ''));
                });
            });
        });
    </script> 
        
        


            <style>
                .full-width-table {
                    width: 100%;
                    text-align: center; / Center align all content /
                }
            </style>`

    frm.set_df_property("custom_checklist_html", "options", checklisthtml);
}

function get_summary_data(frm){
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


frappe.ui.form.on("Resource", {
    service_item: function(frm, cdt, cdn){
        var child_doc = locals[cdt][cdn]
        checkThisItemInLabours(frm, child_doc.service_item)
    },
    spent_hours: function(frm, cdt, cdn){
        var child_doc = locals[cdt][cdn]
        checkTotalHours(frm)
    }
})


function checkThisItemInLabours(frm, item) {
    var found = false;
    frm.doc.custom_mterials.forEach(function(row) {
        if (row.type === "Labours" && row.material_item === item) {
            found = true;
        }
    });

    if (!found) {
        frappe.msgprint(`This item ${item} is not in the table for type Labours.`);
    }
}


function checkTotalHours(frm){
    let items_with_total_hours = []
    let material_labour_items = frm.doc.custom_mterials

    frm.doc.custom_resources.forEach(function(row){
        let existingItem = items_with_total_hours.find(item => item.item === row.service_item);
            
        // If the item exists, update its total hours
        if(existingItem) {
            existingItem.total_hours += row.spent_hours;
        } else {
            // Otherwise, add the item to the array
            items_with_total_hours.push({
                item: row.service_item,
                total_hours: row.spent_hours
            });
        }
    });

    // Now compare the items_with_total_hours with material_labour_item
    items_with_total_hours.forEach(function(item) {

        let material_labour_item = material_labour_items.find(labour_item => labour_item.material_item === item.item && labour_item.type == "Labours");
        if(material_labour_item) {
            if(parseFloat(item.total_hours) > parseFloat(material_labour_item.quentity)) {
                console.log("in last item")
                frappe.msgprint(`Hours exceeded for ${item.item}`);
            }
            else{
                console.log("in else")
            }
        }
        else{
            console.log("elseee")
        }
    });
}

var labour_items_list = []
frappe.ui.form.on("Task", {
    refresh: function(frm){
        frm.doc.custom_mterials.forEach(function(row){
            if (row["type"] === "Labours"){
                labour_items_list.push(row["material_item"])
            }
        })

        frm.fields_dict['custom_resources'].grid.get_field('service_item').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['is_stock_item', '=', 0], ['item_code', "in", labour_items_list]
                ]
            };
        };

    }
})



cur_frm.cscript.onload = function(frm) {
    cur_frm.set_query("material_item", "custom_mterials", function(doc, cdt, cdn) {
        var child = locals[cdt][cdn];
        var type = child.type;
        var filters = {}
        if (type === "Materials"){
            filters = {"is_stock_item": 1}
            return {
                "filters": filters
            };
        }
        else if (type === "Labours" || type === "Freight"){
            filters = {"is_stock_item": 0}
            return {
                "filters": filters
            };
        }
        else if (type === "Vehicle Hire" || type === "Engineering"){
            filters = {"item_group": type}
            return {
                "filters": filters
            };
        }
        
    });
    
    cur_frm.set_query("material_item", "custom_materials1", function(doc, cdt, cdn) {
        var child = locals[cdt][cdn];
        var type = child.type;
        var filters = {}
        if (type === "Materials"){
            filters = {"is_stock_item": 1}
            return {
                "filters": filters
            };
        }
        else if (type === "Labours" || type === "Freight"){
            filters = {"is_stock_item": 0}
            return {
                "filters": filters
            };
        }
        else if (type === "Vehicle Hire" || type === "Engineering"){
            filters = {"item_group": type}
            return {
                "filters": filters
            };
        }
        
    });
    
};