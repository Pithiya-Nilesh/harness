frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {
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
        
        frappe.call({
            method:"harness.api.sales_order.get_stock_summary_data",
            args:{
                so_name: frm.doc.name
            },
            callback: function(r){
                if (r.message){
                    frm.set_df_property("custom_stock_data", "options", r.message);
                }
                else{
                    let message_html = `
                        <div class="mb-5">There are no stock summary related to this sales order.</div>
                    `
                    frm.set_df_property("custom_test", "options", message_html);
                }
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
                        name: frm.doc.name,
                        create_without_reserved: 0
                    },
                    callback: function(res){
                        if (res.message[0] === "Created"){
                            let message = `${res.message[1]} Jobs Successfully Created!`
                            frappe.msgprint(message)
                            console.log("res", res)
                        }
                        else if (res.message[0] === "HTML"){
                            create_popup(res.message[1])
                        }
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

    after_save: function(frm) {
        get_summary_data(frm)
    },

    custom_create_sales_invoice: function(frm){
        window.location.href = `/app/sales-order-page?sales_order=${frm.doc.name}`
    }
});

function create_popup(reserved_item){
   console.log("asdf", reserved_item)
    let d = new frappe.ui.Dialog({
        title: 'Summary For Reserved And Available Items.',
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'html_content'
            },
            {
                fieldtype: "Check",
                fieldname: "create_this_jobs_without_reserved_quantity",
                label: "Create This Jobs Without Reserved Quantity"
            }
        ],
        size: 'large', // small, large, extra-large
        primary_action_label: 'Create Job',

        primary_action: function(values) {
            console.log("create_this_jobs_without_reserved_quantity", values.create_this_jobs_without_reserved_quantity)
            if (values.create_this_jobs_without_reserved_quantity === 1){
                frappe.call({
                    method: "harness.api.sales_order.create_jobs",
                    args:{
                        name: cur_frm.doc.name,
                        create_without_reserved: 1
                    },
                    callback: function(res){
                        if (res.message[0] === "Created"){
                            let message = `${res.message[1]} Jobs Successfully Created!`
                            frappe.msgprint(message)
                            d.fields_dict.html_content.$wrapper.html("");
                            console.log("res", res)
                        }
                    },
                    freeze: true,
                    freeze_message: "Please wait we are creating job based on this sales order.",
                })
            }
            
            else{
                var tableData = getTableData();
                console.log("tableData", tableData)
                d.fields_dict.html_content.$wrapper.html("");
                
                frappe.call({
                    method:"harness.api.sales_order.create_job_and_unreserved_items_in_selected_jobs",
                    args:{
                        name: cur_frm.doc.name,
                        data: tableData
                    },
                    callback: function(res){
                        if (res.message[0] === "Created"){
                            let message = `${res.message[1]} Jobs Successfully Created!`
                            frappe.msgprint(message)
                            console.log("res", res)
                        }
                        else if (res.message[0] === "HTML"){
                            create_popup(res.message[1])
                        }
                        else if (res.message[0] === "ERROR"){
                            console.error("Error", res.message[1])
                            frappe.msgprint(res.message[1])
                        }
                    },
                    freeze: true,
                    freeze_message: "Please wait we are remove reserved qty and creating job based on this sales order.",
                })
            }
            d.hide();
        }
    });
   
        
    d.fields_dict.html_content.$wrapper.html(reserved_item);
    d.show();

    function getTableData() {
        console.log("called");

        // var tables = document.getElementsByClassName('job_table');
        // var data = [];
        // for (var k = 0; k < tables.length; k++) {
        //     var table = tables[k];
        //     for (var i = 1; i < table.rows.length; i++) {
        //         var row = table.rows[i];
        //         var rowData = [];
        //         for (var j = 0; j < row.cells.length; j++) {
        //             if (j === row.cells.length - 1 && row.cells[j].querySelector('input')) {
        //                 rowData.push(row.cells[j].querySelector('input').value);
        //             } else {
        //                 rowData.push(row.cells[j].innerHTML);
        //             }
        //         }
        //         data.push(rowData);
        //     }
        // }
        // return data;


        // const jobsData = [];

        // const jobContainers = document.querySelectorAll('div.job_details');
        // jobContainers.forEach(jobContainer => {
        //     const jobSummaries = jobContainer.querySelectorAll('table.full-width-table.mb-5.job_table');
        //     jobSummaries.forEach(jobSummary => {
        //         const jobName = jobSummary.id || 'unknown'; // Use ID or fallback to 'unknown'
        //         const items = [];
        //         const rows = jobSummary.getElementsByTagName('tr');
        //         for (let i = 1; i < rows.length; i++) { // Skip the header row
        //             const cols = rows[i].getElementsByTagName('td');
        //             const itemData = {
        //                 "item": cols[0].textContent,
        //                 "warehouse": cols[1].textContent,
        //                 "qty": parseInt(cols[2].textContent)
        //             };
        //             items.push(itemData);
        //         }
        //         const jobData = {
        //             "job": jobName,
        //             "items": items
        //         };
        //         jobsData.push(jobData);
        //     });
        // });

        // console.log(JSON.stringify(jobsData, null, 2));
        // return jobsData


        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


        const jobs = [];
        const jobTables = document.querySelectorAll('.job_table');
        
        jobTables.forEach(table => {
        const job = table.id;
        const items = [];
        
        const checkbox = document.querySelector(`input[type="checkbox"][value="${job}"]:checked`);
        const isChecked = checkbox ? true : false;
        
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index > 0) {
            const cells = row.querySelectorAll('td');
            const item = cells[0].textContent.trim();
            const warehouse = cells[1].textContent.trim();
            const qty = parseFloat(cells[2].textContent.trim());
            
            items.push({ item, warehouse, qty });
            }
        });
        
        jobs.push({ job, isChecked, items});
        });
        
        console.log(JSON.stringify(jobs, null, 2));
    
        return jobs
    }
}

frappe.ui.form.on('Sales Order Item', {
    item_code: function(frm, cdt, cdn) {
        frappe.model.set_value(cdt, cdn, "qty", 1);
        if (frm.doc.selling_price_list !== "" && frm.doc.custom_fetch_price_from_price_list === 1){
            set_suggested_price_list(frm, cdt, cdn);
        }
	},
	qty: function(frm, cdt, cdn) {
        if (frm.doc.selling_price_list !== "" && frm.doc.custom_fetch_price_from_price_list === 1){
            set_suggested_price_list(frm, cdt, cdn);
        }
	},

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

function get_summary_data(frm){
    frappe.call({
        method:"harness.api.sales_order.get_summary_data",
        args:{
            so_name: frm.doc.name
        },
        callback: function(r){
            if(r.message){
                frm.set_df_property("custom_test", "options", r.message);
            }
            else{
                let message_html = `
                    <div class="mb-5">There are no jobs related to this sales order.</div>
                    `
                frm.set_df_property("custom_test", "options", message_html);
            }
        }
    })
}

frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Task",
                filters: {
                    custom_sales_order: frm.doc.name
                },
                fields: ["name"]
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    frm.remove_custom_button('Create Jobs');
                }
                else{
                    console.log("job already created", r.message)
                }
            }
        });
    },
    
    // duplicate row data
    custom_duplicate_row: function(frm){
        var selected_rows = frm.fields_dict['items'].grid.get_selected_children();
        if (selected_rows.length === 0) {
            frappe.msgprint(__('Please select a row to duplicate'));
            return;
        }
        selected_rows.forEach(function(row) {
            var new_row = frm.add_child('items');
            for (var field in row) {
                if (row.hasOwnProperty(field)) {
                    if (field !== "name" && field !== "__islocal" && field !== "__unsaved" && field !== "idx" && field !== "__checked") {
                        new_row[field] = row[field];
                    }
                }
            }
        });
        frm.refresh_field('items');

    }
});

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

// change suggested price based on selected selling price list
function set_suggested_price_list(frm, cdt, cdn){
    console.log("suggesed item wise")
    var row = locals[cdt][cdn];
    frappe.call({
        method: "harness.api.quotation.qty_wise_selling_price",
        args: {
            item_code: row.item_code,
            quantity: row.qty,
            customer: frm.doc.party_name || frm.doc.customer || "",
            selling_price_list: frm.doc.selling_price_list,
            date: frm.doc.transaction_date
        },
        callback: function (response) {
            console.log("suggested price", response)
            if (response.suggested_price) {
                // setTimeout(function() {
                    // if (frm.doc.selling_price_list === ""){
                    frappe.model.set_value(row.doctype, row.name, "rate", response.suggested_price);
                    // row.rate = response.suggested_price

                    frappe.model.set_value(row.doctype, row.name, "custom_suggested_unit_price", response.suggested_price);

                    // frappe.model.set_value(row.doctype, row.name, "custom_unit_cost", response.unit_cost);
                    // }
                // }, 100);
            }
        }
    });
}

function set_suggested_price_list_frm(frm) {
    console.log("suggested price frm");
    var child_table = frm.doc.items;
    if (child_table) {
        for (let i = 0; i < child_table.length; i++) {  // Use let instead of var
            let row = child_table[i];  // Use let to declare row
            if (row.item_code !== "") {
                frappe.call({
                    method: "harness.api.quotation.qty_wise_selling_price",
                    args: {
                        item_code: row.item_code,
                        quantity: row.qty,
                        customer: frm.doc.party_name || frm.doc.customer || "",
                        selling_price_list: frm.doc.selling_price_list,
                        date: frm.doc.transaction_date
                    },
                    callback: function (response) {
                        if (response.suggested_price) {
                            // setTimeout(function() {
                                frappe.model.set_value(row.doctype, row.name, "rate", response.suggested_price);
                                frappe.model.set_value(row.doctype, row.name, "custom_suggested_unit_price", response.suggested_price);
                            // }, 100)
                        }
                    }
                });
            }
        }
    }
}

frappe.ui.form.on('Sales Order', {
    before_save: function(frm) {
        if (frm.doc.custom_show_popup === 0){
            console.log("validated call", frm.doc.customer)
            let data = get_summary_data_popup(frm);
            let html_table = create_html_table(data);
            show_confirmation_dialog(frm, html_table);
            frappe.validated = false
        }
    },

    refresh: function(frm){
        frm.doc.custom_show_popup = 1
    }
});

function get_summary_data_popup(frm) {
    let summary = {};
    let totalAmount = 0; // Initialize total amount accumulator

    frm.doc.items.forEach(item => {
        const key = item.item_code;  // Grouping by item_code
        if (!summary[key]) {
            summary[key] = { 
                custom_type: item.custom_type,  // Adding custom_type to the summary
                qty: 0, 
                rate: 0, 
                item_code: item.item_code, 
                amount: 0 
            };
        }

        // Accumulate quantities and amounts for each item_code
        summary[key].qty += item.qty;
        summary[key].rate += item.rate; // Accumulate rate as a number
        summary[key].amount += item.amount; // Accumulate amount as a number

        // Accumulate total amount
        totalAmount += item.amount;
    });

    // Format rate and amount to 2 decimal places for display
    Object.values(summary).forEach(item => {
        item.rate = item.rate.toFixed(2);
        item.amount = item.amount.toFixed(2);
    });

    // Format total amount to 2 decimal places for display
    summary.totalAmount = totalAmount.toFixed(2);

    return summary;
}

function create_html_table(data) {
    let html = '<table class="table table-bordered">';
    html += '<tr><th>Type</th><th>Item Name</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>';
    
    let keys = Object.keys(data);
    let lastIndex = keys.length - 1;

    keys.forEach((item_code, index) => {
        if (index !== lastIndex) {
            html += `<tr><td>${data[item_code].custom_type}</td><td>${item_code}</td><td>${data[item_code].qty}</td><td>${data[item_code].rate}</td><td>${data[item_code].amount}</td></tr>`;
        }
    });

    html += `<tr><td colspan="4" style='text-align:right;'><strong>Total Amount</strong></td><td><strong>${data.totalAmount}</strong></td></tr>`;

    html += '</table>';
    return html;
}

function show_confirmation_dialog(frm, html_table) {
    let d = new frappe.ui.Dialog({
        title: 'Confirm Save',
        fields: [
            {
                label: 'Summary',
                fieldtype: 'HTML',
                options: html_table
            }
        ],
        primary_action_label: 'Confirm',
        primary_action(values) {
            d.hide();
            // frappe.validated = true
            frm.doc.custom_show_popup = 1
            frm.save()
            // if(frm.validate()){

                // frappe.call({
                //     method: 'frappe.client.save',
                //     args: {
                //         doc: frm.doc
                //     },
                //     callback: function(response) {
                //         console.log("response", response.message.name)
                //         let name = response.message.name
                        
                //         if (!response.exc) {
                //             frappe.show_alert({message: 'Document saved successfully', indicator: 'green'});
                //             frm.reload_doc();
                //             if (name) {
                //                 frappe.set_route('Form', 'Sales Order', name);
                //             }
                //         } else {
                //             frappe.show_alert({message: 'Error saving document', indicator: 'red'});
                //         }
                //     }
                // });
        // }

        },
        secondary_action_label: 'Cancel',
        secondary_action() {
            d.hide();
        }
    });
    d.show();
}
