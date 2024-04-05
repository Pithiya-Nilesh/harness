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
    return invoice_data


def update_status_on_jobs(doc, method):
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