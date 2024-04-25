frappe.pages['job-page'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Job Summary',
		single_column: true
	});
	$(frappe.render_template("job_page_templete")).appendTo(page.body);
	document.getElementById("getDataBtn").addEventListener("click", function() {
		// Function to get data
		get_data();
	  });
	  
	  function get_data() {
		frappe.model.open_mapped_doc({
			method: "harness.api.task.test",
			// args: d // Assign the value directly to the "item" key
		});
	  }
}
