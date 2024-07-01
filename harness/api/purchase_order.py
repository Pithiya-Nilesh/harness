import frappe


@frappe.whitelist()
def create_sales_order(target_doc=None):
    """Create Sales Order from Purchase Order"""
    docname = frappe.flags.args.docname
    source_doc = frappe.get_doc("Purchase Order", docname)
    
    sales_order = frappe.new_doc("Sales Order")
    
    exclude_fields = ["name", "doctype", "owner", "creation", "modified", "modified_by", "items"]

    for field in source_doc.meta.fields:
        fieldname = field.fieldname
        if fieldname not in exclude_fields:
            sales_order.set(fieldname, source_doc.get(fieldname))

    for item in source_doc.get("items"):
        new_item = sales_order.append('items', {})
        for field in item.meta.fields:
            fieldname = field.fieldname
            if fieldname not in exclude_fields + ["parent"]:
                new_item.set(fieldname, item.get(fieldname))
    
    sales_order.naming_series = "SAL-ORD-.YYYY.-"
    sales_order.customer = "HMWS Inc (Customer)"
    sales_order.custom_quotation_reference = source_doc.name
    sales_order.branch = ""
    sales_order.cost_center = ""
    sales_order.set_warehouse = "Goods in Transit - EIG"
    
    return sales_order