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

        if (!frm.is_new()) {
            fetch_and_set_custom_html(frm);
        }

        // $("[data-fieldname='rate']").on("blur", function() {
        //     alert("You clicked outside the div!");
        // });
    },

    after_save: function(frm) {
        fetch_and_set_custom_html(frm);
    }

})

function fetch_and_set_custom_html(frm) {
    frappe.call({
        method: "harness.api.quotation.get_custom_html",
        args: {
            quotation: frm.doc.name
        },
        callback: function(r) {
            frm.set_df_property("custom_html", "options", r.message);
        }
    });
}


// cur_frm.cscript.onload = function(frm) {
//     cur_frm.fields_dict['items'].grid.get_field('custom_type').get_query = function(doc, cdt, cdn) {
//         return {
//             filters: {
//                 'item_group': 'Products'
//             }
//         };
//     };
// };


frappe.ui.form.on('Quotation Item', {
    custom_markup_: function(frm, cdt, cdn) {
        sum_calculate_rate(frm, cdt, cdn);
    },
    // rate: function(frm, cdt, cdn){
    //     sum_calculate_markup(frm, cdt, cdn);
    // },
    custom_suggested_unit_price: function(frm, cdt, cdn){
        sum_calculate_markup(frm, cdt, cdn);
    },
});

function sum_calculate_rate(frm, cdt, cdn){
    var child = locals[cdt][cdn];
    var markup = child.custom_markup_;
    var rate = child.rate;
    var unit_cost = child.custom_unit_cost;
    var final_rate = parseFloat(((markup * unit_cost) / 100)) + parseFloat(unit_cost)

    frappe.model.set_value(cdt, cdn, 'rate', final_rate);
    // frappe.model.set_value(cdt, cdn, 'custom_suggested_unit_price', final_rate);
}

function sum_calculate_markup(frm, cdt, cdn){
    var child = locals[cdt][cdn];
    var markup = child.custom_markup_;
    var rate = child.rate;
    var unit_cost = child.custom_unit_cost;
    
    var custom_suggested_unit_price = child.custom_suggested_unit_price;

    var final_rate = ((custom_suggested_unit_price - unit_cost) / unit_cost) * 100

    frappe.model.set_value(cdt, cdn, 'custom_markup_', final_rate);
}


cur_frm.cscript.onload = function(frm) {
    cur_frm.set_query("item_code", "items", function(doc, cdt, cdn) {
        var child = locals[cdt][cdn]; 
        var type = child.custom_type;
        var filters = {}
        if (type === "Materials"){
            filters = {"is_stock_item": 1}
            return {
                "filters": filters
            };
        }
        else if (type === "Labours" || type === "Freight"){
            filters = {"is_stock_item": 0}
            return {
                "filters": filters
            };
        }
        else if (type === "Vehicle Hire" || type === "Engineering"){
            filters = {"item_group": type}
            return {
                "filters": filters
            };
        }
        
    });
    
};



//  testing code ================================================
// function set_value(final_rate, cdt, cdn){

//     // console.log("set value")
//     // // Assuming you have references to the element

//     // // Construct the ID of the element representing the 'rate' field
//     // var rateFieldID = cdt + "-" + cdn + "-rate";

//     // // Get the element by its ID
//     // var rateField = document.getElementById(rateFieldID);

//     // // Set the value
//     // if (rateField) {
//     //     console.log("rate value found")
//     //     rateField.value = final_rate; // Assuming rateField is an input element
//     //     // If rateField is a div or span, you would set its innerHTML or innerText property.
//     // }
//     // else{
//     //     console.log("rate field not found")
//     // }
// }

















// // frappe.ui.form.on('Quotation Item', {
// //     // Replace 'YourChildTableDoctype' with the name of your child table's doctype
// //     custom_markup_: function(frm){
// //         newfunction(frm)
// //     }
// // });



// function newfunction(frm){
//     console.log("function call")
//     // var elements = document.querySelectorAll('[data-fieldname="custom_markup_"]');
//     // console.log("ele", elements)
//     // elements.forEach(function(element) {
//     //     console.log("element adsf", element)
//     //     var inputBox = element.querySelector('input[type="text"]');
//     //     console.log("input box", inputBox)

//     //     inputBox.addEventListener('onblur', function() {
//     //         console.log('Input box focused!');
//     //     });
//     // });
//     // Find the input element
// var inputElement = document.querySelector('input[type="text"][data-fieldname="custom_markup_"]');

// // Check if the input element exists
// if (inputElement) {
//     // Attach the onblur event listener
//     inputElement.addEventListener('blur', function() {
//         // Your event handling code here
//         console.log('Input blurred');
//         // You can add more actions or functions to be executed when the input is blurred
//     });
// } else {
//     console.log('Input element not found');
// }

// }


// frappe.ui.form.on('Quotation Item', {
//     custom_type: function(frm, cdt, cdn) {
//         console.log("called")
//         var child = locals[cdt][cdn];
//         var type = child.type;
        
//         // Clear previous items
//         frappe.model.set_value(cdt, cdn, 'item_code', '');
        
//         frm.fields_dict['items'].grid.get_field('item_code').get_query = function(doc, cdt, cdn) {
//             return {
//                 filters: [
//                     ['item_group', '=', "Products"]
//                 ]
//             };
//         };


//         // // Set a custom query for the item_code field
//         // frappe.meta.get_docfield(cdt, 'item_code', frm.doc.name).get_query = function(doc, cdt, cdn) {
//         //     var filters = {};
//         //     if (type === 'Material') {
//         //         // Filter items for Material type
//         //         filters['item_group'] = 'Products'; // Adjust as per your item structure
//         //     }
//         //     return {
//         //         filters: filters
//         //     };
//         // };



//     }
// });



