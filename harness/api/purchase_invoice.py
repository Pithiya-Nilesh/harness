import frappe
from harness.api.utils import get_item_group, is_service_item


def set_data_into_job_actual_costing_from_pi(doc, method):
    """Update engineering item in job when purchase invoice doctype is submitted."""
    item_groups =["Engineering", "Vehicle"]
    for i in doc.items:
        if i.custom_job and is_service_item(i.item_code):
            task = frappe.get_doc("Task", i.custom_job)
            found = False
           
            item_group = get_item_group(i.item_code)
            if item_group in item_groups:
                # Check if the item already exists in the custom_materials1 table
                for row in task.custom_materials1:
                    if row.material_item == i.item_code and row.type == "Vehicle Hire" if item_group == "Vehicle" else item_group:
                        # Update existing row
                        row.quentity += i.qty
                        row.rate = i.rate
                        row.amount += i.amount
                        found = True
                        break

                if not found:
                    # Create new row
                    new_row = task.append("custom_materials1", {})
                    new_row.material_item = i.item_code
                    new_row.quentity = i.qty
                    new_row.rate = i.rate
                    new_row.amount = i.amount
                    new_row.type = "Vehicle Hire" if item_group == "Vehicle" else item_group
                
                task.save()
                frappe.db.commit()
        else:
            pass

def set_expense_account(doc, method):
    """ set expense account based on job select or not in purchase invoice """
    for i in doc.items:
        if i.custom_job and is_service_item(i.item_code):
            i.expense_account = "15530 - WIP Overhead - HMWS"
        elif i.custom_job:
            i.expense_account = "70330 - Consultant & Professional - Other - HMWS"
    doc.save()