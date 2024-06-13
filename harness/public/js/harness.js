$(document).ready(function() {
    frappe.ui.Desktop = frappe.ui.Desktop.extend({
        init: function() {
            this._super();
            this.make_custom_button();
        },

        make_custom_button: function() {
            var search_bar = $('.input-with-feedback');
            var custom_button = $('<button>')
                .addClass('btn btn-primary custom-button')
                .text('Custom Button')
                .on('click', function() {
                    // Handle button click event
                    alert('Custom button clicked!');
                });

            search_bar.after(custom_button);
        }
    });
});
