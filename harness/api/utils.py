import frappe
import locale

def get_currency_formated_list(data):
    locale.setlocale(locale.LC_ALL, 'en_US.UTF_8')
    
    formated_list = []
    for i in data:
        formatted_item = {}
        for key, value in i.items():
            if isinstance(value, (int, float)):  # Check if the value is numeric
                if key.endswith("_qty"):
                    formatted_value = int(value)
                else:
                    formatted_value = locale.currency(value, grouping=True)
            else:
                formatted_value = value
            formatted_item[key] = formatted_value
        formated_list.append(formatted_item)
    
    return formated_list
        
def set_section_name_in_db(doc, method):
    section_name = ""
    if doc.doctype == "Sales Order":
        for item in doc.items:
            if item.custom_section_name:
                section_name = item.custom_section_name
            else:
                frappe.db.sql(f"UPDATE `tabSales Order Item` SET `custom_section_name`='{section_name}' WHERE `name` = '{item.name}'")
                # frappe.db.set_value("Sales Order Item", item.name, "custom_section_name", section_name)
                frappe.db.commit()

    if doc.doctype == "Sales Invoice":
        for item in doc.items:
            if item.custom_section_name:
                section_name = item.custom_section_name
            else:
                frappe.db.sql(f"UPDATE `tabSales Invoice Item` SET `custom_section_name`='{section_name}' WHERE `name` = '{item.name}'")
                # frappe.db.set_value("Sales Invoice Item", item.name, "custom_section_name", section_name)
                frappe.db.commit()
                
    if doc.doctype == "Quotation":
        for item in doc.items:
            if item.custom_section_name:
                section_name = item.custom_section_name
            else:
                frappe.db.sql(f"UPDATE `tabQuotation Item` SET `custom_section_name`='{section_name}' WHERE `name` = '{item.name}'")
                # frappe.db.set_value("Quotation Item", item.name, "custom_section_name", section_name)
                frappe.db.commit()
    section_name = ""
    

def get_actual_qty(item_code, warehouse):
    if not item_code or not warehouse:
        frappe.throw("Item code and warehouse are required to get actual qty")
        
    # Fetch the available quantity from the `Bin` table
    qty = frappe.db.get_value('Bin', {'item_code': item_code, 'warehouse': warehouse}, 'actual_qty')

    if qty is None:
        qty = 0

    return qty

def get_order_qty(item, warehouse, job):
    if not item or not warehouse or not job:
        frappe.throw("Item code, warehouse and job are required to get order qty")
        
    sql = f""" 
        SELECT poi.qty as qty 
        FROM `tabPurchase Order` as po
        INNER JOIN `tabPurchase Order Item` as poi
        ON po.name = poi.parent
        WHERE po.status = "To Receive and Bill" and poi.item_code="{item}" and poi.warehouse="{warehouse}" and poi.custom_job="{job}"
    """
    
    qty = frappe.db.sql(sql)
    print("qty", qty)
    return qty if qty else 0


def is_service_item(item):
    is_service_item = frappe.db.get_value("Item", filters={"name": item}, fieldname=["is_stock_item"])
    return True if is_service_item == 0 else False

       
def get_item_group(item):
    item_group = frappe.db.get_value("Item", filters={"name": item}, fieldname=["item_group"])
    return item_group