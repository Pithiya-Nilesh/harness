frappe.ui.form.on("Task", {
    onload: function(frm) {
            sum_of_m_amount(frm);
            sum_of_r_amount(frm);
            // frm.save()
    },

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
        
        
        frm.doc.custom_resources.forEach(function(row) {
            var time_log_table = [];
            var time_log_row = {};
            time_log_row.custom_service_item = row.service_item;
            time_log_row.hours = row.spent_hours;
            time_log_row.custom_department = row.department

            time_log_row.activity_type = row.activity_type;
            
            time_log_row.custom_sales_order = frm.doc.custom_sales_order
            time_log_row.task = frm.doc.name
            time_log_row.is_billable = 1
            time_log_row.billing_hours = row.spent_hours;
            
            time_log_row.base_billing_rate = row.rate
            time_log_row.base_billing_amount = row.total_spend_hours

            time_log_row.billing_rate = row.rate;
            time_log_row.billing_amount = row.total_spend_hours;

            time_log_table.push(time_log_row);

            timesheet.time_logs = time_log_table;
            timesheet.employee = row.resource_name;

            // Save the new document
            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: timesheet
                },
                callback: function(response) {
                    if (!response.exc) {
                        frappe.msgprint("Timesheet created successfully!");
                    } else {
                        frappe.msgprint("Error creating Timesheet: " + response.exc);
                    }
                }
            });
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
                    frappe.model.set_value(item_row.doctype, item_row.name, 'basic_rate', task.basic_rate);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'basic_amount', task.basic_amount);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'custom_job_order', task.custom_job_order);

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
    frappe.call({
        method: "harness.api.task.create_sales_invoice",
        args: {
            docname: frm.docname
        },
        callback: function(response) {

            console.log("asdfasdf", response.message)
            // frappe.set_route('Form', "Sales Invoice", response.message)

            frappe.model.with_doctype("Sales Invoice", function() {
                var tasks = response.message[1]; // response contains child table data of JOB
                console.log(tasks);
                // Create a new Sales Invoice
                var sales_invoice = frappe.model.get_new_doc("Sales Invoice");

                // Iterate over tasks data and add rows to Sales Invoice's items table
                $.each(tasks, function(index, task) {
                    var item_row = frappe.model.add_child(sales_invoice, "Sales Invoice Item", "items");
                    frappe.model.set_value(item_row.doctype, item_row.name, 'item_code', task.item_code);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'qty', task.qty);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'rate', task.rate);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'amount', task.amount);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'warehouse', task.warehouse);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'target_warehouse', task.target_warehouse);
                    frappe.model.set_value(item_row.doctype, item_row.name, 'sales order', task.sales_order);

                    // Refresh the child table field
                    // refresh_field("items");
                });

                var sid = response.message[0]; // response contains child table data of JOB

                frappe.model.set_value(sales_invoice.doctype, sales_invoice.name, 'customer', sid["customer"]);
                frappe.model.set_value(sales_invoice.doctype, sales_invoice.name, 'custom_job_order', sid["custom_job_order"]);

                frappe.ui.form.make_quick_entry('Sales Invoice', null, null, sales_invoice);
                refresh_field("items");

            });

        }
    });
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