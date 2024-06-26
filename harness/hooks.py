app_name = "harness"
app_title = "Harness"
app_publisher = "Harness"
app_description = "This app for customization for harness"
app_email = "harness@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/harness/css/harness.css"
# app_include_js = "/assets/harness/js/harness.js"

# include js, css files in header of web template
# web_include_css = "/assets/harness/css/harness.css"
# web_include_js = "/assets/harness/js/harness.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "harness/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"Sales Order" : "public/js/sales_order.js",
    "Task": "public/js/task.js",
    "Sales Invoice": "public/js/sales_invoice.js",
    "Timesheet": "public/js/timesheet.js",
    "Stock Entry": "public/js/stock_entry.js",
    "Quotation": "public/js/quotation.js",
    "Purchase Invoice": "public/js/purchase_invoice.js",
    "Item Price": "public/js/item_price.js",
    "Pick List": "public/js/pick_list.js",
    "Purchase Order": "public/js/purchase_order.js"
}

# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "harness.utils.jinja_methods",
# 	"filters": "harness.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "harness.install.before_install"
# after_install = "harness.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "harness.uninstall.before_uninstall"
# after_uninstall = "harness.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "harness.utils.before_app_install"
# after_app_install = "harness.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "harness.utils.before_app_uninstall"
# after_app_uninstall = "harness.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "harness.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
	"Sales Order": "harness.overrides.sales_order.CustomSalesOrder"
}

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Stock Entry": {
    "on_submit": "harness.api.stock_entry.update_status_and_set_actual_in_jobs",
		# "on_update": "method",
    "on_cancel": "harness.api.stock_entry.remove_data_from_actual_in_job",
		"on_trash": "harness.api.stock_entry.remove_data_from_actual_in_job"
	},
 
  "Timesheet": {
    "on_submit": "harness.api.timesheet.update_actual_in_jobs_from_timesheet",
		# "on_update": "method",
		"on_cancel": "harness.api.timesheet.remove_data_from_actual_in_job",
		# "on_trash": "harness.api.timesheet.remove_data_from_actual_in_job"
	},
  
  "Sales Order": {
      "on_update": "harness.api.utils.set_section_name_in_db",
      "on_cancel": "harness.api.task.cancelled_status_in_jobs",
	},
  
  "Task": {
    # "after_insert": "harness.api.task.sum_of_all_data",
    # "on_update": "harness.api.task.set_labour_total"
	},
  
  "Sales Invoice": {
    "on_submit": "harness.api.sales_invoice.set_invoiced_qty",
    # "on_update": "harness.api.sales_invoice.set_invoiced_qty",
    "on_update": "harness.api.utils.set_section_name_in_db",
    "on_cancel": "harness.api.sales_invoice.map_canclled_invoice_with_job",
	},
  
  "Quotation": {
    "on_update": "harness.api.utils.set_section_name_in_db",
  },
  
  "Purchase Invoice": {
    "on_submit": "harness.api.purchase_invoice.set_data_into_job_actual_costing_from_pi",
    "on_update": "harness.api.purchase_invoice.set_expense_account"
  }
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"harness.tasks.all"
# 	],
# 	"daily": [
# 		"harness.tasks.daily"
# 	],
# 	"hourly": [
# 		"harness.tasks.hourly"
# 	],
# 	"weekly": [
# 		"harness.tasks.weekly"
# 	],
# 	"monthly": [
# 		"harness.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "harness.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
	"erpnext.stock.get_item_details.apply_price_list": "harness.whitelist_override.apply_price_list"
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "harness.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["harness.utils.before_request"]
# after_request = ["harness.utils.after_request"]

# Job Events
# ----------
# before_job = ["harness.utils.before_job"]
# after_job = ["harness.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"harness.auth.validate"
# ]
