frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {
        if (frm.doc.docstatus === 1) {
            // frm.add_custom_button("Create Job Order", function() {
            //     frappe.model.with_doctype("Task", function() {
            //         var task = frappe.model.get_new_doc("Task");
            //         task.subject = frm.doc.name;
            //         task.custom_sales_order = frm.doc.name;
            //         task.custom_vehicle_number = frm.doc.custom_no_of_vehicles;

            //         var material_child_table = [];
            //         var resource_child_table = [];

            //         // Create an array to store all promises
            //         var promises = [];

            //         frm.doc.items.forEach(function(row) {
            //             var promise = new Promise(function(resolve, reject) {
            //                 frappe.call({
            //                     method: 'frappe.client.get_value',
            //                     args: {
            //                         doctype: 'Item',
            //                         filters: {
            //                             name: row.item_code
            //                         },
            //                         fieldname: ['is_stock_item']
            //                     },
            //                     callback: function(response) {
            //                         if (response.message) {
            //                             var maintain_stock = response.message.is_stock_item;
            //                             if (maintain_stock) {
            //                                 var material_child_row = {};
            //                                 material_child_row.material_item = row.item_code;
            //                                 material_child_row.quantity = row.qty;
            //                                 material_child_row.rate = row.rate;
            //                                 material_child_row.amount = row.amount;

            //                                 material_child_table.push(material_child_row);
            //                             } else {
            //                                 var resource_child_row = {};
            //                                 resource_child_row.service_item = row.item_code;
            //                                 resource_child_row.spent_hours = row.qty;
            //                                 resource_child_row.rate = row.rate;
            //                                 resource_child_row.total_spend_hours = row.amount;

            //                                 resource_child_table.push(resource_child_row);
            //                             }
            //                         }
            //                         // Resolve the promise after processing the response
            //                         resolve();
            //                     }
            //                 });
            //             });
            //             promises.push(promise);
            //         });

            //         // Wait for all promises to resolve
            //         Promise.all(promises).then(function() {
            //             // All promises resolved, proceed with creating the Task
            //             task.custom_mterials = material_child_table;
            //             task.custom_resources = resource_child_table;
            //             // Save the new document
            //             frappe.ui.form.make_quick_entry('Task', null, null, task);
            //         });
            //     });
            // });
        
            frm.add_custom_button("Create Job Order", function() {
                frappe.model.with_doctype("Task", function() {
                    var task = frappe.model.get_new_doc("Task");
                    task.subject = frm.doc.name;
                    task.custom_sales_order = frm.doc.name;
                    task.custom_vehicle_number = frm.doc.custom_no_of_vehicles;
            
                    var material_child_table = [];
                    var resource_child_table = [];
            
                    // Create an array to store all promises
                    var promises = [];
            
                    frm.doc.items.forEach(function(row) {
                        var promise = new Promise(function(resolve, reject) {
                            frappe.call({
                                method: 'frappe.client.get_value',
                                args: {
                                    doctype: 'Item',
                                    filters: {
                                        name: row.item_code
                                    },
                                    fieldname: ['is_stock_item']
                                },
                                callback: function(response) {
                                    if (response.message) {
                                        var maintain_stock = response.message.is_stock_item;
                                        if (maintain_stock) {
                                            var material_child_row = {};
                                            material_child_row.material_item = row.item_code;
                                            material_child_row.quantity = row.qty;
                                            material_child_row.rate = row.rate;
                                            material_child_row.amount = row.amount;
            
                                            material_child_table.push(material_child_row);
                                        } else {
                                            var resource_child_row = {};
                                            resource_child_row.service_item = row.item_code;
                                            resource_child_row.spent_hours = row.qty;
                                            resource_child_row.rate = row.rate;
                                            resource_child_row.total_spend_hours = row.amount;
            
                                            resource_child_table.push(resource_child_row);
                                        }
                                    }
                                    // Resolve the promise after processing the response
                                    resolve();
                                }
                            });
                        });
                        promises.push(promise);
                    });
            
                    // Wait for all promises to resolve
                    Promise.all(promises).then(function() {
                        // All promises resolved, proceed with creating the Task
                        task.custom_mterials = material_child_table; // Corrected field name
                        task.custom_resources = resource_child_table;
                        
                        // Save the new document
                        frappe.call({
                            method: 'frappe.client.insert',
                            args: {
                                doc: task
                            },
                            callback: function(response) {
                                if (!response.exc) {
                                    frappe.msgprint("Job Order created successfully!");
                                } else {
                                    frappe.msgprint("Error creating Job Order: " + response.exc);
                                }
                            }
                        });
                    });
                });
            });
            
        }
    }
});
