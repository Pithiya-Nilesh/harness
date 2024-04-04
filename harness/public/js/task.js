frappe.ui.form.on("Task", {
    onload: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    },

    refresh: function(frm){
        frm.add_custom_button("Timesheet", function(){
            create_timesheet(frm)
        }, __("Create"))
        
        frm.add_custom_button("Stock Entry", function(){
            create_stock_entry(frm)
        }, __("Create"))


        frm.page.set_inner_btn_group_as_primary(__('Create'));
    }

});

frappe.ui.form.on('Mate', {
    amount: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    }
});

frappe.ui.form.on('Resource', {
    total_spend_hours: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    },
    spend_hours: function(frm) {
        sum_of_m_amount(frm);
        sum_of_r_amount(frm);
    }
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


// Create Timesheet
function create_timesheet(frm){
    frappe.model.with_doctype("Timesheet", function() {
        var timesheet = frappe.model.get_new_doc("Timesheet");
        
        
        frm.doc.custom_resources.forEach(function(row) {
            var time_log_table = [];
            var time_log_row = {};
            time_log_row.custom_service_item = row.service_item;
            time_log_row.hours = row.spent_hours;

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

// Create Stock Entry
function create_stock_entry(frm){
    frappe.model.with_doctype("Stock Entry", function() {
        var stock_entry = frappe.model.get_new_doc("Stock Entry");
        
        var items_table = [];
        frm.doc.custom_mterials.forEach(function(row) {
            var items_row = {};

            items_row.item_code = row.material_item
            items_row.custom_job_order = frm.doc.name
            items_row.qty = row.quentity
            items_row.basic_rate = row.rate
            items_row.basic_amount = row.amount
            items_row.s_warehouse = row.source_warehouse
            items_row.t_warehouse = row.target_warehouse
        
            items_table.push(items_row);
        });

            stock_entry.stock_entry_type = "Material Transfer for Manufacture"
            stock_entry.items = items_table;

            // // Save the new document
            // frappe.call({
            //     method: 'frappe.client.insert',
            //     args: {
            //         doc: stock_entry
            //     },
            //     callback: function(response) {
            //         if (!response.exc) {
            //             frappe.msgprint("Stock Entry created successfully!");
            //         } else {
            //             frappe.msgprint("Error creating Stock Entry: " + response.exc);
            //         }
            //     }
            // });

            frappe.ui.form.make_quick_entry('Stock Entry', null, null, stock_entry);
    });
}