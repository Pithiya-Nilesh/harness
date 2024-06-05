frappe.pages['sales-order-page'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Job Summary',
		single_column: true
	});
	
	// $(frappe.render_template("sales_order_page_templete", {data:data})).appendTo(page.body);

	const url = new URL(window.location.href);
	// Get the search parameters from the URL
	const searchParams = url.searchParams;
	const sales_order = searchParams.get("sales_order");

	
	frappe.call({
		method: "harness.api.sales_order.get_table_data_for_html_for_multiple_jobs",
		args:{
			sales_order: sales_order
		},
		callback: function(r){
			var data = r.message
			console.log("asdf", data)
			$(frappe.render_template("sales_order_page_templete", {data: data})).appendTo(page.body);
			create_sales_invoice_button()
			add_qty_count_validation()
			add_price_validation()
		}
	})	


	function create_sales_invoice_button(){
		document.getElementById("getDataBtn").addEventListener("click", function() {
			var data = get_table_data()
			console.log("table", data)
			// Function to get data
			frappe.model.open_mapped_doc({
				method: "harness.api.sales_invoice.map_sales_invoice_from_sales_order",
				args: {
					data: data,
					// customer: customer,
					// job: jobsValue,
					sales_order: sales_order
				}
			});
		});
	}

	function get_table_data(){
		var tableData = [];

		// Get the table element
		var table = document.querySelector('.full-width-table');

		// Get all rows in the table except the header row
		var rows = table.querySelectorAll('tr:not(:first-child)');
		
		rows.forEach(function(row) {
			// Initialize an object to store data for each row
			var rowData = {};
		
			// Get all cells in the current row
			var cells = row.querySelectorAll('td');
		
			// Check if the row has the expected number of cells
			if (cells.length >= 16) { // Adjust the number as per your table structure
				// Extract data from each cell and store it in the object
				rowData['Job'] = cells[0].textContent.trim();
				rowData['Description'] = cells[1].textContent.trim();
				rowData['PlannedQty'] = parseInt(cells[2].textContent);
				rowData['PlannedPrice'] = parseFloat(cells[3].textContent.replace('$', '').replace(',', ''));
				rowData['PlannedAmount'] = parseFloat(cells[4].textContent.replace('$', '').replace(',', ''));
				rowData['ActualQty'] = parseInt(cells[5].textContent);
				rowData['ActualCost'] = parseFloat(cells[5].textContent.replace('$', '').replace(',', ''));
				rowData['ActualAmount'] = parseFloat(cells[7].textContent.replace('$', '').replace(',', ''));
				rowData['PreviouslyInvoicedQty'] = parseInt(cells[8].textContent);
				rowData['PreviouslyInvoicedPrice'] = parseFloat(cells[9].textContent.replace('$', '').replace(',', ''));
				rowData['PreviouslyInvoicedAmount'] = parseFloat(cells[10].textContent.replace('$', '').replace(',', ''));
				rowData['AvailableQty'] = parseInt(cells[11].textContent);
				rowData['AvailablePrice'] = parseFloat(cells[12].textContent.replace('$', '').replace(',', ''));
				rowData['AvailableAmount'] = parseFloat(cells[13].textContent.replace('$', '').replace(',', ''));
				rowData['ToBeInvoicedQty'] = parseInt(cells[14].querySelector('input').value || 0); // Handle input box value if exists
				rowData['ToBeInvoicedPrice'] = parseFloat(cells[15].querySelector('input').value || 0);
				rowData['ToBeInvoicedAmount'] = parseFloat(cells[16].textContent.replace('$', '').replace(',', ''));
		
				// Push the row data object to the array
				tableData.push(rowData);
			} else {
				console.error("Unexpected number of cells in row:", row);
			}
		});
		
		return tableData
		
	}

	// function add_qty_count_validation(){
	// 	// Get all input elements with class 'input'
	// 	var inputs = document.querySelectorAll('input.input');
	// 	// Add event listener to each input element
	// 	inputs.forEach(function(input) {
	// 		input.value = input.id ? input.id : 0

	// 		input.addEventListener('change', function(event) {
	// 		// Get the value entered in the input
	// 		var newValue = event.target.value;
	// 		var maxValue = event.target.id ? event.target.id : 0

	// 		if(parseInt(newValue) > parseInt(maxValue)){
	// 			frappe.msgprint("Maximum Qty for Invoice is " + maxValue + " You Entered " + newValue)
	// 			// event.target.value = maxValue
	// 		}
	// 		// setTimeout(function() {
	// 		// 	event.target.focus()
	// 		// }, 2000);

	// 		});
	// 	});
	// }

	// function add_price_validation(){
	// 	// Get all input elements with class 'input'
	// 	var inputs = document.querySelectorAll('input.price_input');
	// 	// Add event listener to each input element
	// 	inputs.forEach(function(input) {
	// 		input.value = input.id.replace(/\$/g, "") ? input.id.replace(/\$/g, "") : 0

	// 		input.addEventListener('change', function(event) {
			
				
	// 		});
	// 	});
	// }


	function add_qty_count_validation(){
		// Get all input elements with class 'input'
		var inputs = document.querySelectorAll('input.qty_input');
		// Add event listener to each input element
		inputs.forEach(function(input) {
			// input.value = input.id ? input.id : 0

			input.addEventListener('change', function(event) {
			// Get the value entered in the input
			var newValue = event.target.value;
			var maxValue = event.target.id ? event.target.id : 0

			var rowIndex = getRowIndex(this);
			var price = getPrice(rowIndex)
			var amount = parseFloat(price) * parseFloat(newValue)
			updateAmount(rowIndex, amount); 

			if(parseInt(newValue) > parseInt(maxValue)){
				frappe.msgprint("Maximum Qty for Invoice is " + maxValue + " You Entered " + newValue)
				// event.target.value = maxValue
			}
			// setTimeout(function() {
			// 	event.target.focus()
			// }, 2000);

			});
		});
	}

	function add_price_validation(){
		// Get all input elements with class 'input'
		var inputs = document.querySelectorAll('input.price_input');
		// Add event listener to each input element
		inputs.forEach(function(input) {
			// input.value = input.id.replace(/\$/g, "") ? input.id.replace(/\$/g, "") : 0

			input.addEventListener('change', function(event) {
			// Get the value entered in the input

			var rowIndex = getRowIndex(this);
			var qty = getQty(rowIndex)
			var amount = parseFloat(qty) * parseFloat(event.target.value)
			updateAmount(rowIndex, amount); 
			
			});
		});
	}


	function getRowIndex(element) {
		var row = element.closest('tr');
		return Array.from(row.parentNode.children).indexOf(row);
	  }

	  function updateAmount(rowIndex, newValue) {
		var table = document.getElementById('table');
		var row = table.rows[rowIndex];
		var lastCell = row.cells[row.cells.length - 1];
		lastCell.textContent = "$" + parseFloat(newValue);
	  }
	  
	  function getPrice(rowIndex) {
		var table = document.getElementById('table');
		var row = table.rows[rowIndex];
		var cell = row.cells[row.cells.length - 2];
		var price = cell.querySelector('input');
		return price.value ? price.value : 0
	  }

	  function getQty(rowIndex) {
		var table = document.getElementById('table');
		var row = table.rows[rowIndex];
		var cell = row.cells[row.cells.length - 3];
		var qty = cell.querySelector('input');
		return qty.value ? qty.value : 0
	  }
}