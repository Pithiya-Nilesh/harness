frappe.ui.form.on('Pick List', {
    refresh(frm) {
       
        frm.remove_custom_button('Stock Entry', 'Create');
        
        
        frm.add_custom_button('Stock Entry', () => {
            frappe.xcall("erpnext.stock.doctype.pick_list.pick_list.create_stock_entry", {
                pick_list: frm.doc,
            })
            .then((stock_entry) => {
                frm.doc.locations.forEach((location, index) => {
                    if (stock_entry.items[index]) {
                        stock_entry.items[index].custom_job_order = location.custom_job_order;
                    }
                });

                frappe.model.sync(stock_entry);

                frappe.set_route("Form", "Stock Entry", stock_entry.name);

            })
            .catch(err => {
                console.error('Error creating Stock Entry:', err);
                frappe.msgprint(__('There was an error creating the Stock Entry.'));
            });
        }, 'Create');
    },
});

