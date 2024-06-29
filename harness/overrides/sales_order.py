# Import the required modules
import frappe
from frappe.model.document import Document
from erpnext.selling.doctype.sales_order.sales_order import SalesOrder
from frappe.utils.data import cint

class CustomSalesOrder(SalesOrder):
    def validate_with_previous_doc(self):
        super().validate_with_previous_doc(
            {
                "Quotation": {"ref_dn_field": "prevdoc_docname", "compare_fields": [["company", "="]]},
                "Quotation Item": {
                    "ref_dn_field": "quotation_item",
                    "compare_fields": [],
                    "is_child_table": True,
                    "allow_duplicate_prev_row_id": True,
                },
            }
        )

        if cint(frappe.db.get_single_value("Selling Settings", "maintain_same_sales_rate")):
            self.validate_rate_with_reference_doc([["Quotation", "prevdoc_docname", "quotation_item"]])
