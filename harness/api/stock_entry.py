import frappe

def update_status_and_set_actual_in_jobs(doc, method):
    """Update status when stock entry doctype submitted and also store all items in job actual material table"""
    try:
        if method == "on_submit":
            for i in doc.items:
                if i.custom_job_order:
                    # Update status of associated Task
                    frappe.db.set_value('Task', i.custom_job_order, 'custom_internal_status', 'Material Transferred')

                    # Create or update rows in Task's custom_materials1 table
                    task = frappe.get_doc("Task", i.custom_job_order)
                    existing_row = next((row for row in task.custom_materials1 if row.material_item == i.item_code and row.source_warehouse == i.s_warehouse and row.target_warehouse == i.t_warehouse and row.type == "Materials" and row.bom_no == i.custom_bom_no), None)
                    if existing_row:
                        # If material exists, update its quantity, rate, and amount
                        existing_row.quentity += i.qty
                        existing_row.rate = i.basic_rate
                        existing_row.amount = i.basic_amount
                    else:
                        # If material doesn't exist, add a new row
                        new_row = task.append("custom_materials1", {})
                        new_row.material_item = i.item_code
                        new_row.quentity = i.qty
                        new_row.rate = i.basic_rate
                        new_row.amount = i.basic_amount
                        new_row.source_warehouse = i.s_warehouse
                        new_row.target_warehouse = i.t_warehouse
                        new_row.bom_no = i.custom_bom_no
                    task.save()
                else:
                    pass
    except Exception as e:
        frappe.log_error("Error: While update status and set actual in job after stock entry submit", e, "Stock Entry", doc.name)


def remove_data_from_actual_in_job(doc, method):
    try:
        for i in doc.items:
            job = frappe.get_doc("Task", i.custom_job_order)
            for j in job.custom_materials1:
                if j.material_item == i.item_code and j.source_warehouse == i.s_warehouse and j.type == "Materials" and j.quentity == i.qty:
                    frappe.db.delete('Material', j.name)
                elif j.material_item == i.item_code and j.source_warehouse == i.s_warehouse and j.type == "Materials" and j.quentity >= i.qty:
                    qty = float(j.quentity) - float(i.qty)
                    j.quentity = qty
                    frappe.db.sql(f"update `tabMaterial` set quentity={qty} where name='{j.name}'")
                    
            frappe.db.commit()
            job.save()
        
    except Exception as e:
        message = ""
        if method == "on_cancel":
            message = "Error: While update actual in job after stock entry cancel"
        elif method == "on_trash":
            message = "Error: While update actual in job after stock entry delete"
        frappe.log_error(message, e, "Stock Entry", doc.name)