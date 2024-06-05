frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {

    //     let html = `
    //         <div class="mt-3"><strong>Job 1</strong></div>
    //         <table border="1" class="full-width-table mb-3">
    //             <tr>
    //                 <th rowspan="2">Description</th>
    //             <th colspan="3">Planned Costing</th>
    //             <th colspan="3">Actual Costing</th>
    //             <th colspan="3">Previously Invoiced</th>
    //             <th colspan="3">Available to be Invoiced</th>
    //             </tr>
    //             <tr>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Cost</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #1</div></td>
    //             <td>2</td>
    //             <td>$10.00</td>
    //             <td>$20.00</td>
    //             <td>2</td>
    //             <td>$5.00</td>
    //             <td>$10.00</td>
    //             <td>1</td>
    //             <td>$10.00</td>
    //             <td>$10.00</td>
    //             <td>1</td>
    //             <td>$10.00</td>
    //             <td>$10.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #2</div></td>
    //             <td>1</td>
    //             <td>$5.00</td>
    //             <td>$5.00</td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$5.00</td>
    //             <td>$5.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Labor #1</div></td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             <td>1</td>
    //             <td>$0.50</td>
    //             <td>$0.50</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Consumables</div></td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$1.00</td>
    //             <td>$1.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$0.00</td>
    //             <td>$0.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #3</div></td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$1.00</td>
    //             <td>$1.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$0.00</td>
    //             <td>$0.00</td>
    //             </tr>
    //         </table>

    //         <div class="mt-3"><strong>Job 2</strong></div>
    //         <table border="1" class="full-width-table mb-3">
    //             <tr>
    //                 <th rowspan="2">Description</th>
    //             <th colspan="3">Planned Costing</th>
    //             <th colspan="3">Actual Costing</th>
    //             <th colspan="3">Previously Invoiced</th>
    //             <th colspan="3">Available to be Invoiced</th>
    //             </tr>
    //             <tr>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Cost</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #1</div></td>
    //             <td>2</td>
    //             <td>$10.00</td>
    //             <td>$20.00</td>
    //             <td>2</td>
    //             <td>$5.00</td>
    //             <td>$10.00</td>
    //             <td>1</td>
    //             <td>$10.00</td>
    //             <td>$10.00</td>
    //             <td>1</td>
    //             <td>$10.00</td>
    //             <td>$10.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #2</div></td>
    //             <td>1</td>
    //             <td>$5.00</td>
    //             <td>$5.00</td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$5.00</td>
    //             <td>$5.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Labor #1</div></td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             <td>1</td>
    //             <td>$0.50</td>
    //             <td>$0.50</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Consumables</div></td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$1.00</td>
    //             <td>$1.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$0.00</td>
    //             <td>$0.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #3</div></td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$1.00</td>
    //             <td>$1.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$0.00</td>
    //             <td>$0.00</td>
    //             </tr>
    //         </table>

    //         <div class="mt-3"><strong>Job 3</strong></div>
    //         <table border="1" class="full-width-table mb-3">
    //             <tr>
    //                 <th rowspan="2">Description</th>
    //             <th colspan="3">Planned Costing</th>
    //             <th colspan="3">Actual Costing</th>
    //             <th colspan="3">Previously Invoiced</th>
    //             <th colspan="3">Available to be Invoiced</th>
    //             </tr>
    //             <tr>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Cost</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             <th>Qty</th>
    //             <th>Price</th>
    //             <th>Amount</th>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #1</div></td>
    //             <td>2</td>
    //             <td>$10.00</td>
    //             <td>$20.00</td>
    //             <td>2</td>
    //             <td>$5.00</td>
    //             <td>$10.00</td>
    //             <td>1</td>
    //             <td>$10.00</td>
    //             <td>$10.00</td>
    //             <td>1</td>
    //             <td>$10.00</td>
    //             <td>$10.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #2</div></td>
    //             <td>1</td>
    //             <td>$5.00</td>
    //             <td>$5.00</td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$5.00</td>
    //             <td>$5.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Labor #1</div></td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             <td>1</td>
    //             <td>$0.50</td>
    //             <td>$0.50</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$2.00</td>
    //             <td>$2.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Consumables</div></td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$1.00</td>
    //             <td>$1.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$0.00</td>
    //             <td>$0.00</td>
    //             </tr>
    //             <tr>
    //             <td style="text-align: left;"><div style="margin-left: 5px">Material #3</div></td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$1.00</td>
    //             <td>$1.00</td>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>1</td>
    //             <td>$0.00</td>
    //             <td>$0.00</td>
    //             </tr>
    //         </table>
    // <style>
    //     .full-width-table {
    //         width: 100%;
    //         text-align: center; /* Center align all content */
    //     }
    // </style>
    //     `;

    // Set the above `html` as Summary HTML
    // frm.set_df_property("custom_test", "options", html);
        // createDynamicTables(jobsData);

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
                method:"harness.api.sales_order.get_summary_data",
                args:{
                    so_name: frm.doc.name
                },
                callback: function(r){
                    frm.set_df_property("custom_test", "options", r.message);
                }
            })
        }
        
        frappe.call({
            method:"harness.api.sales_order.get_stock_summary_data",
            args:{
                so_name: frm.doc.name
            },
            callback: function(r){
                frm.set_df_property("custom_stock_data", "options", r.message);
            }
        })


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
            
                frappe.call({
                    method: "harness.api.sales_order.create_jobs",
                    args:{
                        name: frm.doc.name
                    },
                    callback: function(res){
                        let message = `${res.message} Jobs Successfully Created!`
                        frappe.msgprint(message)
                        console.log("res", res)
                    },
                    freeze: true,
                    freeze_message: "Please wait we are creating job based on this sales order.",
                })
                
            })
        }
        
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

    },

    custom_create_sales_invoice: function(frm){
        window.location.href = `/app/sales-order-page?sales_order=${frm.doc.name}`
    }
});

