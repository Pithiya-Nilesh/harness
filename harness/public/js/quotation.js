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
    },

    after_save: function(frm) {
        fetch_and_set_custom_html(frm);
    }

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
    custom_markup_: function(frm, cdt, cdn) {
        sum_calculate_rate(frm, cdt, cdn);
    },
    // rate: function(frm, cdt, cdn){
    //     sum_calculate_markup(frm, cdt, cdn);
    // },
});

function sum_calculate_rate(frm, cdt, cdn){
    var child = locals[cdt][cdn];
    var markup = child.custom_markup_;
    var rate = child.rate;
    var unit_cost = child.custom_unit_cost;
    var final_rate = parseFloat(((markup * unit_cost) / 100)) + parseFloat(unit_cost)

    frappe.model.set_value(cdt, cdn, 'rate', final_rate);
    frappe.model.set_value(cdt, cdn, 'custom_suggested_unit_price', final_rate);
}

// function sum_calculate_markup(frm, cdt, cdn){
//     var child = locals[cdt][cdn];
//     var markup = child.custom_markup_;
//     var rate = child.rate;
//     var unit_cost = child.custom_unit_cost;

//     var final_rate = (unit_cost - rate)

//     frappe.model.set_value(cdt, cdn, 'custom_markup_', final_rate);
// }
