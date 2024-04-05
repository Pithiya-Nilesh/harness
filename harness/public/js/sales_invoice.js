frappe.ui.form.on('Sales Invoice', {
    refresh(frm) {
        // Declare the dialog variable outside the button function
        let taskDialog;

        // Add a custom button for selecting tasks and adding them to the Sales Invoice
        frm.add_custom_button(__('Jobs'), function() {
            // Fetch tasks using Frappe Client API, fetching the 'name' and 'status' fields
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Task',
                    fields: ['name', 'status', "subject"]
                },
                callback: function(response) {
                    if (response.message) {
                        // MultiSelectDialog for tasks
                        taskDialog = new frappe.ui.form.MultiSelectDialog({
                            doctype: "Task",
                            target: frm,
                            setters: {
                                // Optionally, you can set default values for fields in the Sales Invoice
                                status: null,
                                subject: null,
                            },
                            add_filters_group: 1,
                            size: 'large',
                            columns: ["name"],
                            get_query: function() {
                                return {
                                    filters: [
                                        ['custom_sales_order', 'not like', '']            
                                    ]
                                };
                            },
                            data: response.message,
                            action(selectedTasks) {
                                // Perform action on selected tasks
                                
                                
                                frappe.call({
                                    method: 'harness.api.task.get_task_for_sales_invoice',
                                    args: {
                                        tasks: {"tasks": selectedTasks}
                                    },
                                    callback: function(response) {
                                        var tasks = response.message; // Assuming the response contains tasks data
                                
                                        console.log("\n\n sdfa", tasks)
                                        // Create the first row outside of the loop
                                        var child = frappe.model.add_child(cur_frm.doc, 'items'); //var child = frappe.model.add_child(frm.doc, 'items', 'items');
                                
                                        $.each(tasks, function(index, task) {
                                            frappe.model.set_value(child.doctype, child.name, 'item_code', task.item_code);
                                            frappe.model.set_value(child.doctype, child.name, 'qty', task.qty);
                                            frappe.model.set_value(child.doctype, child.name, 'base_rate', task.base_rate);
                                            frappe.model.set_value(child.doctype, child.name, 'base_amount', task.base_amount);
                                
                                            // Add a new row for each subsequent task
                                            if (index < tasks.length - 1) {
                                                child = frappe.model.add_child(cur_frm.doc, 'items');
                                            }
                                        });
                                
                                        // Remove the first blank row
                                        cur_frm.doc.items.splice(0, 1);
                                
                                        refresh_field('items');
                                    }
                                });
                                
                                taskDialog.dialog.hide();
                            },
                            primary_action_label: __('Get Item'),
                            primary_action: function() {


                            }
                        });
                    }
                }
            });
        }, __("Get Items From"));
    }
});
