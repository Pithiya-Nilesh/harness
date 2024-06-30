frappe.ui.form.on("Purchase Order", {
    refresh: function(frm) {
        if(!frm.is_dirty() && !frm.is_new()){
            frm.add_custom_button("Create SO for HMWS", function() {
                // frappe.model.open_mapped_doc({
                //     method: "harness.api.purchase_order.create_sales_order",
                //     frm: frm,
                //     args: {
                //         docname: frm.doc.name
                //     }
                // });
            }, "Create");
        }
    }
});