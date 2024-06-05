import frappe


def set_data_into_job_actual_costing_from_pi(doc, method):
    """Update engineering item in job when purchase invoice doctype is submitted."""
    for i in doc.items:
        if i.custom_job:
            task = frappe.get_doc("Task", i.custom_job)
            found = False
            # Check if the item already exists in the custom_materials1 table
            for row in task.custom_materials1:
                if row.material_item == i.item_code and row.type == "Engineering":
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
                new_row.type = "Engineering"
            
            task.save()
        else:
            pass

def set_expense_account(doc, method):
    """ set expense account based on job select or not in purchase invoice """
    pass