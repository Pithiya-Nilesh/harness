import frappe


def update_actual_in_jobs_from_timesheet(doc, method):
    """ when timesheet doctype submited and also get all items and store in job atual resource table """
    try:
        for i in doc.time_logs:
            if i.task:
                task = frappe.get_doc("Task", i.task)
                new_row = task.append("custom_resources1", {})
                new_row.service_item = i.custom_service_item
                new_row.resource_name = doc.employee
                new_row.department = i.custom_department
                new_row.activity_type = i.activity_type
                new_row.spent_hours = i.hours
                new_row.rate = i.billing_rate
                new_row.total_spend_hours = i.billing_amount
                task.save()
            else:
                pass
    except Exception as e:
        frappe.log_error("Error: While update actual in job after timesheet submit", e, "Timesheet", doc.name)


@frappe.whitelist(allow_guest=True)
def remove_data_from_actual_in_job(doc, method):
    try:
        employee_id = doc.employee
        for i in doc.time_logs:
            job = frappe.get_doc("Task", i.task)
            for j in job.custom_resources1:
                if j.service_item == i.custom_service_item and j.resource_name == employee_id and j.type == "Labours" and j.spent_hours == i.hours:
                    frappe.db.delete('Resource', j.name)
                elif j.service_item == i.custom_service_item and j.resource_name == employee_id and j.type == "Labours" and j.spent_hours >= i.hours:
                    spent_hours = float(j.spent_hours) - float(i.hours)
                    j.spent_hours = spent_hours
                    frappe.db.sql(f"update `tabMaterial` set quentity={spent_hours} where name='{j.name}'")
            frappe.db.commit()
            job.save()
        
    except Exception as e:
        message = ""
        if method == "on_cancel":
            message = "Error: While update actual in job after stock entry cancel"
        elif method == "on_trash":
            message = "Error: While update actual in job after stock entry delete"
        frappe.log_error(message, e, "Timesheet", doc.name)
