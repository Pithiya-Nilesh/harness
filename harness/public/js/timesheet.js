frappe.ui.form.on("Timesheet", {
    refresh: function(frm){
        frm.fields_dict['time_logs'].grid.get_field('custom_service_item').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['is_stock_item', '=', 0]
                ]
            };
        };
    },
})
