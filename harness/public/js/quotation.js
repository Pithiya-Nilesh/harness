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
    }
})

