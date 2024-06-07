frappe.ui.form.on('Purchase Invoice Item', {
    item_code: function(frm, cdt, cdn){
        var child = locals[cdt][cdn];
        frappe.call({
            method: 'frappe.client.get_value',
            args: {
                doctype: 'Item',
                filters: {
                    name: child.item_code
                },
                fieldname: ['is_stock_item', 'item_group']
            },
            callback: function(response) {
                if (response.message) {
                    var is_stock_item = response.message.is_stock_item;
                    var item_group = response.message.item_group;
                    if (is_stock_item && item_group === "Engineering") {
                        frappe.model.set_value(cdt, cdn, 'expense_account', "15550 - WIP Engineering - HMWS");
                    }
                    else if(is_stock_item && item_group === "Vehicle"){
                        frappe.model.set_value(cdt, cdn, 'expense_account', "15560 - WIP Vehicle Hire - HMWS");
                    }
                }
            }
        })
    }
})
