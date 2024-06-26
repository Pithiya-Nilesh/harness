import frappe
import locale

def get_currency_formatted_list(data):
    return data
    # try:
    #     locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        
    #     formatted_list = []
    #     for i in data:
    #         formatted_item = {}
    #         for key, value in i.items():
    #             if isinstance(value, (int, float)):  # Check if the value is numeric
    #                 if key.endswith("_qty"):
    #                     formatted_value = int(value)
    #                 else:
    #                     try:
    #                         formatted_value = locale.currency(value, grouping=True)
    #                     except ValueError as e:
    #                         formatted_value = value
    #             else:
    #                 formatted_value = value
    #             formatted_item[key] = formatted_value
    #         formatted_list.append(formatted_item)
            
    #     return formatted_list
    # except Exception as e:
    #     frappe.log_error(f"Error: While formatting currency", f"Error: {e}\ndata: {data}")

        
def set_section_name_in_db(doc, method):
    try:
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
        
    except Exception as e:
        frappe.log_error("Error: While set section name in db after update", e, doc.doctype, doc.name)
    
    # don`t allow user to save data with unassigned item in items child table.
    try:
        for item in doc.items:
            if item.item_code == "Unassigned":
                frappe.throw("Please replace Unassigned item with real item.")
    except Exception as e:
        frappe.log_error("Error: While not allow to save with unassigned item", e, doc.doctype, doc.name)

    
def get_actual_qty(item_code, warehouse):
    try:
        if not item_code or not warehouse and not is_service_item(item_code):
            frappe.throw("Item code and warehouse are required to get actual qty")
            
        qty = frappe.db.get_value('Bin', {'item_code': item_code, 'warehouse': warehouse}, 'actual_qty')

        if qty is None:
            qty = 0

        return qty
    except Exception as e:
        frappe.log_error(f"Error: While get actual quentity for item : {item_code}, warehouse: {warehouse}", e)


def get_order_qty(item, warehouse, job):
    try:
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
        return qty if qty else 0
    except Exception as e:
        frappe.log_error("Error: While get order qty", f"Error: {e}\nitem: {item}\nwarehouse: {warehouse}\njob: {job}")


def is_service_item(item):
    try:
        is_service_item = frappe.db.get_value("Item", filters={"name": item}, fieldname=["is_stock_item"])
        return True if is_service_item == 0 else False
    except Exception as e:
        frappe.log_error("Error: While check is service item", f"Error: {e}\nitem: {item}")

       
def get_item_group(item):
    try:
        item_group = frappe.db.get_value("Item", filters={"name": item}, fieldname=["item_group"])
        return item_group
    except Exception as e:
        frappe.log_error("Error: While get item group", f"Error: {e}\nitem: {item}")


def get_bom_sub_item(item_code):
    try:
        boms = frappe.get_all('BOM', filters={"item": item_code, "docstatus": 1}, fields=['name'])
        if boms:
            matching_items = []
            
            for bom in boms:
                bom_items = frappe.get_all('BOM Item',
                    filters={'parent': bom.name},
                    fields=['item_code', 'qty', 'rate', 'amount'])
                
                for item in bom_items:
                    item["bom_no"] = bom.name
                    matching_items.append(item)
            
            return matching_items
        else:
            False
    except Exception as e:
        frappe.log_error("Error: while getting bom items from BOM", f"Error:{e}\nitem: {item_code}")

