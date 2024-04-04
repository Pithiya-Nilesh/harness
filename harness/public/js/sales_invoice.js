frappe.ui.form.on("Sales Invoice", {
    refresh: function(frm){
        frm.add_custom_button("Job Order", function(){
            erpnext.utils.map_current_doc({
                method: "erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice",
                source_doctype: "Sales Order",
                target: me.frm,
                setters: {
                    customer: me.frm.doc.customer || undefined,
                },
                get_query_filters: {
                    docstatus: 1,
                    status: ["not in", ["Closed", "On Hold"]],
                    per_billed: ["<", 99.99],
                    company: me.frm.doc.company
                }
            })

        }, __("Get Items From"))
    }
})