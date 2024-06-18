frappe.ui.form.on("Item Price", {
    item_code: function(frm){
        autoCreatePricingRowIfNotServiceItem(frm)
    }
})

function autoCreatePricingRowIfNotServiceItem(frm){
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
                    addRowsForMaterialItem(frm)
                }
                else{
                    addRowsForServiceItem(frm)
                }
            }
        }
    });
}


function addRowsForMaterialItem(frm){
    var numRows = frm.doc.custom_qty_wise_rate ? frm.doc.custom_qty_wise_rate.length : 0;
    console.log("Number of rows in custom_qty_wise_rate:", numRows);
    if (frm.doc.__islocal && numRows == 0){
        frm.add_child("custom_qty_wise_rate",{
            quantity: 1
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 2
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 3
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 4
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 5
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 6
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 7
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 10
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 15
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 20
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 30
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 50
        });
        frm.add_child("custom_qty_wise_rate",{
            quantity: 100
        });
        frm.refresh_field("custom_qty_wise_rate");
    }
    else{
        removeRows(frm)
        addRowsForMaterialItem(frm)
    }
}

function addRowsForServiceItem(frm) {
    var numRows = frm.doc.custom_qty_wise_rate ? frm.doc.custom_qty_wise_rate.length : 0;
    console.log("Number of rows in custom_qty_wise_rate:", numRows);
    if (frm.doc.__islocal && numRows == 0){
        frm.add_child("custom_qty_wise_rate",{
            quantity: 1
        });
        frm.refresh_field('custom_qty_wise_rate')
    }
    else{
        removeRows(frm)
        addRowsForServiceItem(frm)
    }
}

function removeRows(frm){
    var rows = frm.doc.custom_qty_wise_rate || [];
    for (var i = rows.length; i > 0; i--) {
        var row = rows[i];
        if (row && row.$row) {
            row.$row.remove();
        }
        frappe.model.clear_doc(row.doctype, row.name); 
    }
    frm.doc.custom_qty_wise_rate = [rows[0]];
    frm.refresh_field("custom_qty_wise_rate");
}

