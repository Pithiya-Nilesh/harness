frappe.ui.form.on("Timesheet", {
    refresh: function(frm){
        get_fields(frm);
        frm.fields_dict['time_logs'].grid.get_field('custom_service_item').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['is_stock_item', '=', 0]
                ]
            };
        };
    },

    before_save(frm) {
        get_fields(frm);
    },

    after_save(frm) {
        get_fields(frm);
    },

    before_submit(frm) {
        get_fields(frm);
    },

    on_submit(frm) {
        get_fields(frm);
    },

    onload:function(frm){
         get_fields(frm);
    }
})




function get_fields(frm) {

    var fields = {
        'Timesheet Detail':
            [
                { fieldname: 'activity_type', columns: 2 },
                { fieldname: 'custom_service_item', columns: 2 },
                { fieldname: 'task', columns: 1 },
                { fieldname: 'hours', columns: 1 },
                { fieldname: 'from_time', columns: 2 },
                { fieldname: 'to_time', columns: 2 },
            ]
    }
      
    frappe.model.user_settings.save(frm.doctype, "GridView",fields).then((r) => {
        frappe.model.user_settings[frm.doctype] = r.message || r;
        frm.fields_dict.items.grid.reset_grid();
    });
}