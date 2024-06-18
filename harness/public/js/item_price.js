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
                    removeExtraRows(frm, 0)
                    addRows(frm)
                }
                else{
                    removeExtraRows(frm, 1)
                }
            }
        }
    });
}


function addRows(frm){
    var numRows = frm.doc.custom_qty_wise_rate ? frm.doc.custom_qty_wise_rate.length : 0;
        console.log("Number of rows in custom_qty_wise_rate:", numRows);
        if  (frm.doc.__islocal && numRows == 0){
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
}

function removeExtraRows(frm, id) {
    var rows = frm.doc.custom_qty_wise_rate || [];

    // Check if there are more than one row
    if (rows.length > 1) {
        // Remove extra rows starting from the second row
        for (var i = rows.length - id; i > 0; i--) {
            var row = rows[i];
            if (row && row.$row) {
                row.$row.remove();  // Remove the row from the DOM
            }
            frappe.model.clear_doc(row.doctype, row.name);  // Clear the row from the model
        }
        
        // Keep only the first row in the array
        frm.doc.custom_qty_wise_rate = [rows[0]];
        
        // Refresh the table field to reflect the change in the form
        frm.refresh_field("custom_qty_wise_rate");
    }
    frm.refresh_field("custom_qty_wise_rate");
}

