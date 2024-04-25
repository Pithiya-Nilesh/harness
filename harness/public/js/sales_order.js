frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {

        let html = `
            <div class="mt-5"><strong>Job 1</strong></div>
            <table border="1" class="full-width-table mb-3">
                <tr>
                    <th rowspan="2">Description</th>
                <th colspan="3">Planned Costing</th>
                <th colspan="3">Actual Costing</th>
                <th colspan="3">Previously Invoiced</th>
                <th colspan="3">Available to be Invoiced</th>
                </tr>
                <tr>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                </tr>
                <tr>
                <td>Material #1</td>
                <td>2</td>
                <td>$10.00</td>
                <td>$20.00</td>
                <td>2</td>
                <td>$5.00</td>
                <td>$10.00</td>
                <td>1</td>
                <td>$10.00</td>
                <td>$10.00</td>
                <td>1</td>
                <td>$10.00</td>
                <td>$10.00</td>
                </tr>
                <tr>
                <td>Material #2</td>
                <td>1</td>
                <td>$5.00</td>
                <td>$5.00</td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$5.00</td>
                <td>$5.00</td>
                </tr>
                <tr>
                <td>Labor #1</td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td>1</td>
                <td>$0.50</td>
                <td>$0.50</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                </tr>
                <tr>
                <td>Consumables</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$1.00</td>
                <td>$1.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$0.00</td>
                <td>$0.00</td>
                </tr>
                <tr>
                <td>Material #3</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$1.00</td>
                <td>$1.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$0.00</td>
                <td>$0.00</td>
                </tr>
            </table>

            <div class="mt-5"><strong>Job 2</strong></div>
            <table border="1" class="full-width-table mb-3">
                <tr>
                    <th rowspan="2">Description</th>
                <th colspan="3">Planned Costing</th>
                <th colspan="3">Actual Costing</th>
                <th colspan="3">Previously Invoiced</th>
                <th colspan="3">Available to be Invoiced</th>
                </tr>
                <tr>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                </tr>
                <tr>
                <td>Material #1</td>
                <td>2</td>
                <td>$10.00</td>
                <td>$20.00</td>
                <td>2</td>
                <td>$5.00</td>
                <td>$10.00</td>
                <td>1</td>
                <td>$10.00</td>
                <td>$10.00</td>
                <td>1</td>
                <td>$10.00</td>
                <td>$10.00</td>
                </tr>
                <tr>
                <td>Material #2</td>
                <td>1</td>
                <td>$5.00</td>
                <td>$5.00</td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$5.00</td>
                <td>$5.00</td>
                </tr>
                <tr>
                <td>Labor #1</td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td>1</td>
                <td>$0.50</td>
                <td>$0.50</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                </tr>
                <tr>
                <td>Consumables</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$1.00</td>
                <td>$1.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$0.00</td>
                <td>$0.00</td>
                </tr>
                <tr>
                <td>Material #3</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$1.00</td>
                <td>$1.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$0.00</td>
                <td>$0.00</td>
                </tr>
            </table>

            <div class="mt-5"><strong>Job 3</strong></div>
            <table border="1" class="full-width-table mb-3">
                <tr>
                    <th rowspan="2">Description</th>
                <th colspan="3">Planned Costing</th>
                <th colspan="3">Actual Costing</th>
                <th colspan="3">Previously Invoiced</th>
                <th colspan="3">Available to be Invoiced</th>
                </tr>
                <tr>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                </tr>
                <tr>
                <td>Material #1</td>
                <td>2</td>
                <td>$10.00</td>
                <td>$20.00</td>
                <td>2</td>
                <td>$5.00</td>
                <td>$10.00</td>
                <td>1</td>
                <td>$10.00</td>
                <td>$10.00</td>
                <td>1</td>
                <td>$10.00</td>
                <td>$10.00</td>
                </tr>
                <tr>
                <td>Material #2</td>
                <td>1</td>
                <td>$5.00</td>
                <td>$5.00</td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$5.00</td>
                <td>$5.00</td>
                </tr>
                <tr>
                <td>Labor #1</td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                <td>1</td>
                <td>$0.50</td>
                <td>$0.50</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$2.00</td>
                <td>$2.00</td>
                </tr>
                <tr>
                <td>Consumables</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$1.00</td>
                <td>$1.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$0.00</td>
                <td>$0.00</td>
                </tr>
                <tr>
                <td>Material #3</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$1.00</td>
                <td>$1.00</td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>$0.00</td>
                <td>$0.00</td>
                </tr>
            </table>
    <style>
        .full-width-table {
            width: 100%;
            text-align: center; /* Center align all content */
        }
    </style>
        `;

    // Set the above `html` as Summary HTML
    frm.set_df_property("custom_test", "options", html);

   
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
                            frappe.msgprint(numberOfVehicles + "  Jobs created successfully.");
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
                        // task.custom_mterials = material_child_table;
                        // task.custom_resources = resource_child_table;
            
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
    },

    custom_create_sales_invoice: function(frm){
        window.location.href = "/app/sales-order-page"
    }
});
