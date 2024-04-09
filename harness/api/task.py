import frappe, json

@frappe.whitelist()
def get_task_for_stock_entry(tasks):
    """ get items from job to show in stock entry popup when click on get items from """
    data = []
    tasks = json.loads(tasks)
    for task in tasks["tasks"]:
        t = frappe.get_doc("Task", task)
        for i in t.custom_mterials:
            data.append({"s_warehouse": i.source_warehouse , "t_warehouse": i.target_warehouse , "item_code": i.material_item , "custom_job_order": task, "qty": i.quentity, "basic_rate": i.rate, "basic_amount": i.amount })
    return data
    
@frappe.whitelist()
def get_task_for_sales_invoice(tasks):
    """ get items from job to show in sales invoice popup when click on get items from """
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
    """ update status when stock entry doctype submited and also get all items and store in jb atual material table """
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

    return [sid, items_table]


def update_actual_in_jobs_from_timesheet(doc, method):
    """ update status when stock entry doctype submited and also get all items and store in jb atual resource table """

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


def cancelled_status_in_jobs(doc, method):
    """ cancelled status in job when canclled doctype in sales order"""
    tasks = frappe.db.get_list("Task", filters={"custom_sales_order": doc.name}, fields=["name"])
    for task in tasks:
        frappe.db.set_value('Task', task.name, 'status', 'Cancelled')
        frappe.db.commit()


@frappe.whitelist()
def make_test(source_name, target_doc=None, ignore_permissions=False):
    from frappe.model.mapper import get_mapped_doc
    
    def set_missing_values(row, target):
        target.append(
            "items",
            {
                "item_code": row.service_item,
                "qty": row.spent_hours,
                "rate": row.rate,
                "amount": row.total_spend_hours,
                "warehouse": "",
                "target_warehouse": "",
                # "sales_order": task.custom_sales_order
            },
        )

    doclist = get_mapped_doc(
        "Sales Invoice",
        source_name,
        {"Task": {"doctype": "Sales Invoice"}},
        target_doc,
        postprocess=set_missing_values,
        ignore_permissions=ignore_permissions,
    )

    print("\n\n asdf", doclist)
    return doclist


def sum_of_all_data(doc, method):
    sum_of_m_amount(doc, method)
    sum_of_r_amount(doc, method)

def sum_of_m_amount(doc, method):

    m_e_total = sum(row.get('amount', 0) for row in doc.get('custom_mterials', []))
    m_a_total = sum(row.get('amount', 0) for row in doc.get('custom_materials1', []))

    frappe.db.set_value(doc.doctype, doc.name, 'custom_material_total_estimated_amount', m_e_total)
    frappe.db.set_value(doc.doctype, doc.name, 'custom_material_total_actual_costing1', m_a_total)
    frappe.db.commit()

def sum_of_r_amount(doc, method):
    r_e_total = sum(row.get('total_spend_hours', 0) for row in doc.get('custom_resources', []))
    r_a_total = sum(row.get('total_spend_hours', 0) for row in doc.get('custom_resources1', []))

    r_e_hour = sum(row.get('spent_hours', 0) for row in doc.get('custom_resources', []))
    r_a_hour = sum(row.get('spent_hours', 0) for row in doc.get('custom_resources1', []))

    frappe.db.set_value(doc.doctype, doc.name, 'custom_resource_total_estimated_hours', r_e_hour)
    frappe.db.set_value(doc.doctype, doc.name, 'custom_estimated_total_resource_cost', r_e_total)
    frappe.db.commit()

    frappe.db.set_value(doc.doctype, doc.name, 'custom_resource_total_actual_hours1', r_a_hour)
    frappe.db.set_value(doc.doctype, doc.name, 'custom_resource_total_actual_cost', r_a_total)
    frappe.db.commit()

