frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {
        if (frm.doc.docstatus === 1) {
            // frm.add_custom_button("Create Jobs", function() {
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
        
            // Creating Jobs(Task) as per 'No. Of Vehicles'
            frm.add_custom_button("Create Jobs", function() {
                var numberOfVehicles = frm.doc.custom_no_of_vehicles;
                if (!numberOfVehicles || numberOfVehicles < 1) {
                    frappe.msgprint("Please specify a valid number of vehicles.");
                    return;
                }
            
                var successfulInsertions = 0; // Counter for successful insertions
                var errorsEncountered = false; // Flag to track if any errors occurred
            
                // Loop through the number of vehicles and create tasks
                for (var i = 0; i < numberOfVehicles; i++) {
                    createTask(frm, i, function(success) {
                        if (!success && !errorsEncountered) {
                            errorsEncountered = true; // Set flag to true if any error occurs
                            frappe.msgprint("Error creating one or more Jobss. Please check logs for details.");
                        }
            
                        successfulInsertions++; // Increment counter on successful insertion
            
                        // Check if all tasks have been processed
                        if (successfulInsertions === numberOfVehicles && !errorsEncountered) {
                            // frappe.msgprint("Jobss successfully created " + numberOfVehicles + " times.");
                            frappe.msgprint(numberOfVehicles + " jobs successfully created");
                        }
                    });
                }
            });
            
            function createTask(frm, index, callback) {
                frappe.model.with_doctype("Task", function() {
                    var task = frappe.model.get_new_doc("Task");
                    task.subject = frm.doc.name; //+ " - Vehicle " + (index + 1);
                    task.custom_sales_order = frm.doc.name;
            
                    var material_child_table = [];
                    var resource_child_table = [];
            
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
                                            var material_child_row = {
                                                material_item: row.item_code,
                                                quentity: row.qty,
                                                rate: row.rate,
                                                amount: row.amount
                                            };
                                            material_child_table.push(material_child_row);
                                        } else {
                                            var resource_child_row = {
                                                service_item: row.item_code,
                                                spent_hours: row.qty,
                                                rate: row.rate,
                                                total_spend_hours: row.amount
                                            };
                                            resource_child_table.push(resource_child_row);
                                        }
                                    }
                                    resolve();
                                }
                            });
                        });
                        promises.push(promise);
                    });
            
                    Promise.all(promises).then(function() {
                        task.custom_mterials = material_child_table;
                        task.custom_resources = resource_child_table;
            
                        frappe.call({
                            method: 'frappe.client.insert',
                            args: {
                                doc: task
                            },
                            callback: function(response) {
                                if (!response.exc) {
                                    callback(true); // Call the callback function with success status
                                } else {
                                    callback(false); // Call the callback function with failure status
                                }
                            }
                        });
                    });
                });
            }
        }
    }
});