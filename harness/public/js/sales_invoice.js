frappe.ui.form.on('Sales Invoice', {
    // onload(frm){
    //     // frm.refresh_field("items");
    //     // frm.refresh()
    //     frm.fields_dict['items'].grid.get_field('item_code').$input.on('change', function() {
    //         // Your code to execute when the child table is refreshed
    //         console.log("Child table refreshed");
    //         // You can perform any action you want here
    //     });
    // },

    refresh(frm) {
        // Declare the dialog variable outside the button function
        let taskDialog;

        // Add a custom button for selecting tasks and adding them to the Sales Invoice
        // frm.add_custom_button(__('Jobs'), function() {
        //     // Fetch tasks using Frappe Client API, fetching the 'name' and 'status' fields
        //     frappe.call({
        //         method: 'frappe.client.get_list',
        //         args: {
        //             doctype: 'Task',
        //             fields: ['name', 'status', "subject"]
        //         },
        //         callback: function(response) {
        //             if (response.message) {
        //                 // MultiSelectDialog for tasks
        //                 taskDialog = new frappe.ui.form.MultiSelectDialog({
        //                     doctype: "Task",
        //                     target: frm,
        //                     setters: {
        //                         // Optionally, you can set default values for fields in the Sales Invoice
        //                         status: null,
        //                         subject: null,
        //                     },
        //                     add_filters_group: 1,
        //                     size: 'large',
        //                     columns: ["name"],
        //                     get_query: function() {
        //                         return {
        //                             filters: [
        //                                 ['custom_sales_order', 'not like', ''],
        //                                 ['status', 'in', ['Open', 'Working', 'Overdue']]        
        //                             ]
        //                         };
        //                     },
        //                     data: response.message,
        //                     action(selectedTasks) {
        //                         // Perform action on selected tasks
                                
                                
        //                         frappe.call({
        //                             method: 'harness.api.task.get_task_for_sales_invoice',
        //                             args: {
        //                                 tasks: {"tasks": selectedTasks}
        //                             },
        //                             callback: function(response) {
        //                                 var tasks = response.message; // Assuming the response contains tasks data
                                
        //                                 console.log("\n\n sdfa", tasks)
        //                                 // Create the first row outside of the loop
        //                                 var child = frappe.model.add_child(cur_frm.doc, "Sales Invoice Item", 'items'); //var child = frappe.model.add_child(frm.doc, 'items', 'items');
                                
        //                                 $.each(tasks, function(index, task) {
        //                                     frappe.model.set_value(child.doctype, child.name, 'item_code', task.item_code);
        //                                     frappe.model.set_value(child.doctype, child.name, 'qty', task.qty);
        //                                     console.log("create type", typeof(task.qty))
        //                                     frappe.model.set_value(child.doctype, child.name, 'base_rate', task.base_rate);
        //                                     frappe.model.set_value(child.doctype, child.name, 'base_amount', task.base_amount);
                                
        //                                     // Add a new row for each subsequent task
        //                                     if (index < tasks.length - 1) {
        //                                         child = frappe.model.add_child(cur_frm.doc, 'items');
        //                                     }
        //                                 });
                                
        //                                 // Remove the first blank row
        //                                 cur_frm.doc.items.splice(0, 1);
                                
        //                                 refresh_field('items');
        //                             }
        //                         });
                                
        //                         taskDialog.dialog.hide();
        //                     },
        //                     primary_action_label: __('Get Item'),
        //                     primary_action: function() {

        //                     }
        //                 });
        //             }
        //         }
        //     });
        // }, __("Get Items From"));

        // set section value null for repeted
        const child_table = frm.doc.items || [];
        let target_section_name = "";

        child_table.forEach(function(row) {
            if(target_section_name === row.custom_section_name){
                row.custom_section_name = null; 
            }
            else{
                target_section_name = row.custom_section_name
            }
        });

    }
});


frappe.ui.form.on('Sales Invoice Item', {
    custom_markup_: function(frm, cdt, cdn) {
        sum_calculate_rate(frm, cdt, cdn);
    },
    rate: function(frm, cdt, cdn){
        sum_calculate_markup_from_rate(frm, cdt, cdn);
    },
    custom_suggested_unit_price: function(frm, cdt, cdn){
        sum_calculate_markup(frm, cdt, cdn);
    },

    custom_section_name: function(frm, cdt, cdn){
        check_duplicate_section_in_other_row(frm, cdt, cdn)
    }
});



function sum_calculate_markup_from_rate(frm, cdt, cdn){
    console.log("markup based on rate")
    var child = locals[cdt][cdn];
    var markup = child.custom_markup_;
    var rate = child.rate;
    var unit_cost = child.custom_unit_cost;
    
    var final_rate = ((rate - unit_cost) / unit_cost) * 100

    // frappe.model.set_value(cdt, cdn, 'custom_markup_', final_rate);
    child.custom_markup_ = final_rate
    frm.refresh_field('items')
}

function sum_calculate_rate(frm, cdt, cdn){
    console.log("markup rate")

    var child = locals[cdt][cdn];
    var markup = child.custom_markup_;
    var rate = child.rate;
    var unit_cost = child.custom_unit_cost;
    var final_rate = parseFloat(((markup * unit_cost) / 100)) + parseFloat(unit_cost)

    // frappe.model.set_value(cdt, cdn, 'rate', final_rate);
    child.rate = final_rate
    frm.refresh_field('items')
    // frappe.model.set_value(cdt, cdn, 'custom_suggested_unit_price', final_rate);
}

function sum_calculate_markup(frm, cdt, cdn){
    console.log("markup called")
    var child = locals[cdt][cdn];
    var markup = child.custom_markup_;
    var rate = child.rate;
    var unit_cost = child.custom_unit_cost;
    
    var custom_suggested_unit_price = child.custom_suggested_unit_price;

    var final_rate = ((custom_suggested_unit_price - unit_cost) / unit_cost) * 100

    frappe.model.set_value(cdt, cdn, 'custom_markup_', final_rate);
    // child.custom_markup_ = final_rate
    frm.refresh_field('items')
}


cur_frm.cscript.onload = function(frm) {
    cur_frm.set_query("item_code", "items", function(doc, cdt, cdn) {
        var child = locals[cdt][cdn]; 
        var type = child.custom_type;
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

function check_duplicate_section_in_other_row(frm, cdt, cdn){
    var child = locals[cdt][cdn]
    frm.doc.items.forEach(function(row) {
        if (row.name !== child.name && row.custom_section_name === child.custom_section_name) {
            frappe.msgprint(`Duplicate section name found in row: ${row.idx}`)
        }
    });
}


frappe.ui.form.on("Sales Invoice", {
    refresh: function(frm) {
        frm.add_custom_button("Create PI for EIG", function() {
            // frappe.model.open_mapped_doc({
            //     method: "harness.api.purchase_order.create_sales_order",
            //     frm: frm,
            //     args: {
            //         docname: frm.doc.name
            //     }
            // });
        }, "Create");
    }
});