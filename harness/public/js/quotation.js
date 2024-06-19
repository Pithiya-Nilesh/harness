frappe.ui.form.on("Quotation", {
    refresh(frm){
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

        if (!frm.is_new()) {
            fetch_and_set_custom_html(frm);
        }

        // $("[data-fieldname='rate']").on("blur", function() {
        //     alert("You clicked outside the div!");
        // });
    },

    after_save: function(frm) {
        fetch_and_set_custom_html(frm);
    },

    // change suggested price based on selected selling price list
    selling_price_list: function(frm){
        set_suggested_price_list_frm(frm)
    },

    custom_duplicate_row: function(frm){
        var selected_rows = frm.fields_dict['items'].grid.get_selected_children();
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
    },
    
    party_name: function(frm){
        set_suggested_price_list_frm(frm)
    }

    // before_save: function(frm) {
    //     // Get all rows in the table field
    //     var rows = frm.doc.your_table_field || [];

    //     // Create an object to store custom_section_name values and their row indexes
    //     var sectionNames = {};

    //     // Iterate through each row
    //     for (var i = 0; i < rows.length; i++) {
    //         var row = rows[i];
    //         var sectionName = row.custom_section_name;

    //         // Check if sectionName already exists in sectionNames object
    //         if (sectionNames[sectionName]) {
    //             // Duplicate found
    //             var existingIndex = sectionNames[sectionName];
    //             frappe.msgprint(__("Duplicate custom_section_name '{0}' found in rows {1} and {2}. Save aborted.", [sectionName, existingIndex + 1, i + 1]));
    //             frappe.validated = false;  // Prevent saving
    //             return;
    //         } else {
    //             // Store the index of the sectionName
    //             sectionNames[sectionName] = i;
    //         }
    //     }
    // }
})

function fetch_and_set_custom_html(frm) {
    frappe.call({
        method: "harness.api.quotation.get_custom_html",
        args: {
            quotation: frm.doc.name
        },
        callback: function(r) {
            frm.set_df_property("custom_html", "options", r.message);
        }
    });
}

frappe.ui.form.on('Quotation Item', {
	item_code: function(frm, cdt, cdn) {
        frappe.model.set_value(cdt, cdn, "qty", 1);
        if (frm.doc.selling_price_list !== ""){
            set_suggested_price_list(frm, cdt, cdn);
        }
	},
	qty: function(frm, cdt, cdn) {
        if (frm.doc.selling_price_list !== ""){
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
                setTimeout(function() {
                    // if (frm.doc.selling_price_list === ""){
                    frappe.model.set_value(row.doctype, row.name, "rate", response.suggested_price);
                    // row.rate = response.suggested_price

                    frappe.model.set_value(row.doctype, row.name, "custom_suggested_unit_price", response.suggested_price);

                    // frappe.model.set_value(row.doctype, row.name, "custom_unit_cost", response.unit_cost);
                    // }
                }, 100);
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
                            frappe.model.set_value(row.doctype, row.name, "rate", response.suggested_price);
                            frappe.model.set_value(row.doctype, row.name, "custom_suggested_unit_price", response.suggested_price);
                        }
                    }
                });
            }
        }
    }
}


function check_duplicate_section_in_other_row(frm, cdt, cdn){
    var child = locals[cdt][cdn]
    frm.doc.items.forEach(function(row) {
        if (row.name !== child.name && row.custom_section_name === child.custom_section_name) {
            frappe.msgprint(`Duplicate section name ${row.custom_section_name} found in row: ${row.idx}`)
        }
    });
}

 cur_frm.set_query("custom_buying_price_list", function(frm) {
    return {
        filters: {
            "buying": 1
        }
    }
});
