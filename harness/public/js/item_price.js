frappe.ui.form.on("Item Price", {
    item_code: function(frm){
        console.log("itemc code",frm.item_code);
        autoCreatePricingRowIfNotServiceItem(frm)
    }
})

function autoCreatePricingRowIfNotServiceItem(frm){
    removeRows(frm);
    frappe.call({
        method: 'frappe.client.get_value',
        args: {
            doctype: 'Item',
            filters: {
                name: frm.doc.item_code
            },
            fieldname: ['is_stock_item']
        },
        callback: function(response) {
            if (response.message) {
                var maintain_stock = response.message.is_stock_item;
                if (maintain_stock){
                    addRowsForMaterialItem(frm);
                }
                else{
                    addRowsForServiceItem(frm);
                }
            }
        }
    });
}

function addRowsForMaterialItem(frm){
    var numRows = frm.doc.custom_qty_wise_rate ? frm.doc.custom_qty_wise_rate.length : 0;
    console.log("Number of rows in custom_qty_wise_rate:", numRows);
    if (frm.doc.__islocal && numRows == 0){
        addMaterialRows(frm);
    }
}

function addRowsForServiceItem(frm) {
    var numRows = frm.doc.custom_qty_wise_rate ? frm.doc.custom_qty_wise_rate.length : 0;
    console.log("Number of rows in custom_qty_wise_rate:", numRows);
    if (frm.doc.__islocal && numRows == 0){
        addServiceRows(frm);
    }
}

function addMaterialRows(frm) {
    var quantities = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20, 30, 50, 100];
    quantities.forEach(function(qty) {
        frm.add_child("custom_qty_wise_rate", { quantity: qty });
    });
    frm.refresh_field("custom_qty_wise_rate");
}

function addServiceRows(frm) {
    frm.add_child("custom_qty_wise_rate", { quantity: 1 });
    frm.refresh_field('custom_qty_wise_rate');
}

function removeRows(frm){
    var rows = frm.doc.custom_qty_wise_rate || [];
    while(rows.length > 0) {
        rows.splice(0, 1);
    }
    frm.refresh_field("custom_qty_wise_rate");
}
