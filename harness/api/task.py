import frappe, json

@frappe.whitelist()
def get_task_for_stock_entry(tasks):
    data = []
    tasks = json.loads(tasks)
    for task in tasks["tasks"]:
        t = frappe.get_doc("Task", task)
        for i in t.custom_mterials:
            data.append({"s_warehouse": i.source_warehouse , "t_warehouse": i.target_warehouse , "item_code": i.material_item , "custom_job_order": task, "qty": i.quentity, "basic_rate": i.rate, "basic_amount": i.amount })
    return data
    
@frappe.whitelist()
def get_task_for_sales_invoice(tasks):
    invoice_data = []
    tasks = json.loads(tasks)
    for task in tasks["tasks"]:
        t = frappe.get_doc("Task", task)
        for i in t.custom_materials1:
            invoice_data.append({"item_code": i.material_item , "qty": i.quentity, "base_rate":i.rate, "base_amount":i.amount})
        for i in t.custom_resources1:
            invoice_data.append({"item_code": i.service_item , "qty": i.spent_hours, "base_rate":i.rate, "base_amount":i.total_spend_hours})
    return invoice_data


def update_status_and_set_actual_in_jobs(doc, method):
    for i in doc.items:
        if i.custom_job_order:
            frappe.db.set_value('Task', i.custom_job_order, 'custom_internal_status', 'Material Transferred')
            frappe.db.commit()
            task = frappe.get_doc("Task", i.custom_job_order)
            new_row = task.append("custom_materials1", {})
            new_row.material_item = i.item_code
            new_row.quentity = i.qty
            new_row.rate = i.basic_rate
            new_row.amount = i.basic_amount
            new_row.source_warehouse = i.s_warehouse
            new_row.target_warehouse = i.t_warehouse
            task.save()
        else:
            pass

@frappe.whitelist()
def create_stock_entry(docname):
    task = frappe.get_doc("Task", docname)
    if task.custom_mterials:
        items_table = []
        for row in task.custom_mterials:
            items_row = {
                "item_code": row.material_item,
                "qty": row.quentity,
                "basic_rate": row.rate,
                "basic_amount": row.amount,
                "s_warehouse": row.source_warehouse,
                "t_warehouse": row.target_warehouse,
                "custom_job_order": docname
            }
            items_table.append(items_row)
    return items_table


@frappe.whitelist()
def create_sales_invoice(docname):
    task = frappe.get_doc("Task", docname)
    items_table = []
    if task.custom_materials1:
        for row in task.custom_materials1:
            items_row = {
                "item_code": row.material_item,
                "qty": row.quentity,
                "rate": row.rate,
                "amount": row.amount,
                "warehouse": row.source_warehouse,
                "target_warehouse": row.target_warehouse,
                "sales_order": task.custom_sales_order
            }
            items_table.append(items_row)

    if task.custom_resources1:
        for row in task.custom_resources1:
            items_row = {
                "item_code": row.service_item,
                "qty": row.spent_hours,
                "rate": row.rate,
                "amount": row.total_spend_hours,
                "warehouse": "",
                "target_warehouse": "",
                "sales_order": task.custom_sales_order
            }
            items_table.append(items_row)

    customer = frappe.db.get_value("Sales Order", task.custom_sales_order, fieldname=["customer"])
    sid = {"custom_job_order": task.name, "customer": customer}

    # doc = frappe.new_doc("Sales Invoice")
    # doc.items = items_table
    # print("\n\n doc", doc)
    # return doc

    return [sid, items_table]


def update_actual_in_jobs_from_timesheet(doc, method):
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

