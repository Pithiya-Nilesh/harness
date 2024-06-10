import frappe, json

from harness.api.utils import get_actual_qty, get_currency_formated_list, get_order_qty

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
            invoice_data.append({"item_code": i.material_item , "qty": i.quentity, "base_rate": i.rate, "base_amount": i.amount})
        # for i in t.custom_resources1:
        #     invoice_data.append({"item_code": i.service_item , "qty": i.spent_hours, "base_rate":i.rate, "base_amount":i.total_spend_hours})
    print("\n\n invoice data", invoice_data)
    return invoice_data

# def update_status_and_set_actual_in_jobs(doc, method):
#     """ update status when stock entry doctype submited and also get all items and store in jb atual material table """
#     for i in doc.items:
#         if i.custom_job_order:
#             frappe.db.set_value('Task', i.custom_job_order, 'custom_internal_status', 'Material Transferred')
#             frappe.db.commit()
#             task = frappe.get_doc("Task", i.custom_job_order)
#             new_row = task.append("custom_materials1", {})
#             new_row.material_item = i.item_code
#             new_row.quentity = i.qty
#             new_row.rate = i.basic_rate
#             new_row.amount = i.basic_amount
#             new_row.source_warehouse = i.s_warehouse
#             new_row.target_warehouse = i.t_warehouse
#             task.save()
#         else:
#             pass

def update_status_and_set_actual_in_jobs(doc, method):
    """Update status when stock entry doctype submitted and also store all items in jb actual material table"""
    if method == "on_submit":
        for i in doc.items:
            if i.custom_job_order:
                # Update status of associated Task
                frappe.db.set_value('Task', i.custom_job_order, 'custom_internal_status', 'Material Transferred')

                # Create or update rows in Task's custom_materials1 table
                task = frappe.get_doc("Task", i.custom_job_order)
                existing_row = next((row for row in task.custom_materials1 if row.material_item == i.item_code and row.source_warehouse == i.s_warehouse and row.target_warehouse == i.t_warehouse), None)
                if existing_row:
                    # If material exists, update its quantity, rate, and amount
                    existing_row.quantity += i.qty
                    existing_row.rate = i.basic_rate
                    existing_row.amount = i.basic_amount
                else:
                    # If material doesn't exist, add a new row
                    new_row = task.append("custom_materials1", {})
                    new_row.material_item = i.item_code
                    new_row.quantity = i.qty
                    new_row.rate = i.basic_rate
                    new_row.amount = i.basic_amount
                    new_row.source_warehouse = i.s_warehouse
                    new_row.target_warehouse = i.t_warehouse
                task.save()
            else:
                pass


@frappe.whitelist()
def create_stock_entry(docname):
    """ this function map data for create stock entry from job doctype """
    task = frappe.get_doc("Task", docname)
    if task.custom_mterials:
        items_table = []
        for row in task.custom_mterials:
            if row.type == "Materials":
                items_row = {
                    "item_code": row.material_item,
                    "qty": row.quentity,
                    "transfer_qty": row.quentity,
                    "basic_rate": row.rate,
                    "basic_amount": row.amount,
                    "s_warehouse": row.source_warehouse,
                    "t_warehouse": row.target_warehouse,
                    "custom_job_order": docname,
                    "uom": get_uom(row.material_item),
                    "stock_uom": get_uom(row.material_item),
                    "conversion_factor": get_conversion_factor(row.material_item)
                }
                items_table.append(items_row)
    return items_table

def get_uom(item):
    uom = frappe.db.get_value("Item", filters={"item_code": item}, fieldname=["stock_uom"])
    return uom if uom else ""

def get_conversion_factor(item):
    conversion_factor = frappe.db.get_value("UOM Conversion Detail", 
                                                filters={"parent": item}, 
                                                fieldname=["conversion_factor"])
    return conversion_factor if conversion_factor else ""


# @frappe.whitelist()
# def create_sales_invoice(docname):
#     task = frappe.get_doc("Task", docname)
#     items_table = []
#     if task.custom_materials1:
#         for row in task.custom_materials1:
#             items_row = {
#                 "item_code": row.material_item,
#                 "qty": row.quentity,
#                 "rate": row.rate,
#                 "amount": row.amount,
#                 "warehouse": row.source_warehouse,
#                 "target_warehouse": row.target_warehouse,
#                 "sales_order": task.custom_sales_order
#             }
#             items_table.append(items_row)

#     if task.custom_resources1:
#         for row in task.custom_resources1:
#             items_row = {
#                 "item_code": row.service_item,
#                 "qty": row.spent_hours,
#                 "rate": row.rate,
#                 "amount": row.total_spend_hours,
#                 "warehouse": "",
#                 "target_warehouse": "",
#                 "sales_order": task.custom_sales_order
#             }
#             items_table.append(items_row)

#     customer = frappe.db.get_value("Sales Order", task.custom_sales_order, fieldname=["customer"])
#     sid = {"custom_job_order": task.name, "customer": customer}

#     return [sid, items_table]


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

@frappe.whitelist()
def create_sales_invoice(task):
    """ when we create sales invoice from job this function map data for this job and sales invoice. """
    task = frappe.get_doc("Task", task)    
    sales_invoice = frappe.new_doc("Sales Invoice")

    if task.custom_materials1:
        for row in task.custom_materials1:  
            item_data = frappe.db.sql("""
                        SELECT 
                            i.item_name, 
                            i.stock_uom,
                            i.description,
                            ia.default_warehouse,
                            ia.selling_cost_center,
                            ia.income_account,
                            ia.company
                                                                                            
                        FROM 
                            `tabItem` i
                        LEFT JOIN
                            `tabItem Default` ia ON i.name = ia.parent                                      
                        WHERE 
                            i.name = %s
                    """, (row.material_item), as_dict=True)
            
            debtor_account =  frappe.db.sql(" select default_receivable_account from `tabCompany` where name=%s ", (item_data[0]['company']), as_dict=True)

            item_row = sales_invoice.append("items", {})
            item_row.item_code = row.material_item
            item_row.item_name = item_data[0]['item_name']
            item_row.uom = item_data[0]['stock_uom']
            item_row.income_account = item_data[0]['income_account']
            # item_row.cost_center = item_data[0]['selling_cost_center']
            item_row.warehouse = item_data[0]['default_warehouse']
            item_row.qty = row.quentity
            item_row.rate = row.rate
            item_row.amount = row.amount
            item_row.warehouse = row.source_warehouse
            item_row.target_warehouse = row.target_warehouse
            item_row.sales_order = task.custom_sales_order
            item_row.description = item_data[0]['description']
            item_row.custom_section_name = task.subject
            item_row.custom_type = row.type

    # if task.custom_resources1:
    #     for row in task.custom_resources1:
    #         item_data = frappe.db.sql("""
    #                     SELECT 
    #                         i.item_name, 
    #                         i.stock_uom, 
    #                         i.description,
    #                         ia.default_warehouse,
    #                         ia.selling_cost_center,
    #                         ia.income_account,
    #                         ia.company
                                                                                            
    #                     FROM 
    #                         `tabItem` i
    #                     LEFT JOIN
    #                         `tabItem Default` ia ON i.name = ia.parent                                      
    #                     WHERE 
    #                         i.name = %s
    #                 """, (row.service_item), as_dict=True)
            
    #         item_row = sales_invoice.append("items", {})
    #         item_row.item_code = row.service_item
    #         item_row.item_name = item_data[0]['item_name']
    #         item_row.uom = item_data[0]['stock_uom']
    #         item_row.income_account = item_data[0]['income_account']
    #         # item_row.cost_center = item_data[0]['selling_cost_center']
    #         item_row.warehouse = item_data[0]['default_warehouse']
    #         item_row.qty = row.spent_hours
    #         item_row.rate = row.rate
    #         item_row.amount = row.total_spend_hours
    #         item_row.warehouse = ""
    #         item_row.target_warehouse = ""
    #         item_row.sales_order = task.custom_sales_order
    #         item_row.description = item_data[0]['description']

    sales_invoice.debit_to = debtor_account[0]['default_receivable_account']

    sales_invoice.customer = frappe.db.get_value("Sales Order", task.custom_sales_order, fieldname=["customer"])
    sales_invoice.custom_job_order = task.name

    return sales_invoice

@frappe.whitelist()
def get_summary(job):
    
    """ get data for summary visible in summary tab in job doctype """
   
    html = ""
    
    html += """
        <table border="1" class="full-width-table mb-3">
            <tr>
                <th rowspan="2">Description</th>
                <th colspan="3">Planned Costing</th>
                <th colspan="3">Actual Costing</th>
                <th colspan="3">Previously Invoiced</th>
                <th colspan="3">Available to be Invoiced</th>
            </tr>
        <tr>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Amount</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
        </tr>
    """
        
    
    final_list = get_table_data_for_html(job)
    
    for i in final_list:
        if "bom_item" in i:
            html += f"""
                   <tr style="background-color: #c8c8c8;">
                       <td style="text-align: left;"><div style="margin-left: 20px">{i.get('bom_item')}</td>
                       <td>{i.get('material_qty', "")}</td>
                       <td>{i.get('material_price', "")}</td>
                       <td>{i.get('material_amount', "")}</td>
                       <td>{i.get('actual_qty', "")}</td>
                       <td>{i.get('actual_cost', "")}</td>
                       <td>{i.get('actual_amount', "")}</td>
                       <td>{i.get('invoiced_qty', "")}</td>
                       <td>{i.get('invoiced_price', "")}</td>
                       <td>{i.get('invoiced_amount', "")}</td>
                       <td>{i.get('available_qty', "")}</td>
                       <td>{i.get('available_price', "")}</td>
                       <td>{i.get('available_amount', "")}</td>
                   </tr>
               """

        else:
            html += f"""
            <tr>
                <td style="text-align: left;"><div style="margin-left: 5px">{i.get('item')}</td>
                <td>{i.get('material_qty', "")}</td>
                <td>{i.get('material_price', "")}</td>
                <td>{i.get('material_amount', "")}</td>
                <td>{i.get('actual_qty', "")}</td>
                <td>{i.get('actual_cost', "")}</td>
                <td>{i.get('actual_amount', "")}</td>
                <td>{i.get('invoiced_qty', "")}</td>
                <td>{i.get('invoiced_price', "")}</td>
                <td>{i.get('invoiced_amount', "")}</td>
                <td>{i.get('available_qty', "")}</td>
                <td>{i.get('available_price', "")}</td>
                <td>{i.get('available_amount', "")}</td>
            </tr>
        """
            
    html += """</table>
    <style>
        .full-width-table {
            width: 100%;
            text-align: center; /* Center align all content */
        }
    </style>
        """
            
    return html


@frappe.whitelist()
def get_table_data_for_html(job):
    
    """ this return summary data fro given job """
    
    job = frappe.get_doc("Task", job)
    temp_list = []
    
    for material in job.custom_mterials:
        temp_list.append({ "job": job.name, "type": "planned", "is_bom_item": False, "item": material.material_item, "material_qty": material.quentity or "", "material_price": material.rate or "", "material_amount": material.amount or ""})
    
    # for resource in job.custom_resources:
    #     temp_list.append({ "job": job.name, "type": "planned", "is_bom_item": False, "item": resource.service_item, "material_qty": resource.spent_hours, "material_price": resource.rate, "material_amount": resource.total_spend_hours})

    for actual in job.custom_materials1:
        temp_list.append({ "job": job.name, "type": "actual", "is_bom_item": False, "item": actual.material_item, "actual_qty": actual.quentity or "", "actual_cost": actual.rate or "", "actual_amount": actual.amount or ""})
    
    # for actual_resource in job.custom_resources1:
    #     temp_list.append({ "job": job.name, "type": "actual", "is_bom_item": False, "item": actual_resource.service_item, "actual_qty": actual_resource.spent_hours, "actual_cost": actual_resource.rate, "actual_amount": actual_resource.total_spend_hours})

    for invoiced in job.custom_mterials:
        temp_list.append({ "job": job.name, "type": "invoiced", "is_bom_item": False, "item": invoiced.material_item, "invoiced_qty": invoiced.invoiced_qty or "", "invoiced_price": invoiced.invoiced_rate or "", "invoiced_amount": invoiced.invoiced_amount or ""})
        
    # for r_invoiced in job.custom_resources1:
    #     temp_list.append({ "job": job.name, "type": "invoiced", "is_bom_item": False, "item": r_invoiced.service_item, "invoiced_qty": r_invoiced.invoiced_qty, "invoiced_price": r_invoiced.invoiced_rate, "invoiced_amount": r_invoiced.invoiced_amount})
           
    for available in job.custom_mterials:
        temp_list.append({ "job": job.name, "type": "available", "is_bom_item": False, "item": available.material_item, "available_qty": available.available_for_invoice_qty or "", "available_price": available.available_for_invoice_rate or "", "available_amount": available.available_for_invoice_amount or ""})
    
    # for r_available in job.custom_resources1:
    #     temp_list.append({ "job": job.name, "type": "available", "is_bom_item": False, "item": r_available.service_item, "available_qty": r_available.available_for_invoice_qty, "available_price": r_available.available_for_invoice_rate, "available_amount": r_available.available_for_invoice_amount})

    summary_data = map_summary_data(temp_list)

    # Get BOM Items
    semi_final_list = []
    for i in summary_data:
        matched_items = get_matching_child_items(i["item"], i["job"])
        if matched_items:
            semi_final_list.append(i)
            for j in matched_items:
                semi_final_list.append(j)
        else:
            semi_final_list.append(i)

    final_list = get_currency_formated_list(semi_final_list)
    
    for i in final_list:
        for key in i:
            if 'available_qty' in key and i['available_qty'] == 0:
                i['available_qty'] = i.get('actual_qty')
            if 'available_price' in key and i['available_price'] == "$0.00":
                i['available_price'] = i.get('actual_cost', "0")
            if 'available_amount' in key and i['available_amount'] == "$0.00":
                i['available_amount'] = i.get('actual_amount', "0")
                
    for entry in final_list:
        for key, value in entry.items():
            if value == 0 or value == "$0.00":
                entry[key] = ""

    return final_list

    
def map_summary_data(data):
    final_list = []
    for item_dict in data:
       
        # if "bom_item" in item_dict:
        #     final_list.append(item_dict)
        
        # else:
            # Check if an item with the same name exists in the output list            
            found = False
            for out_dict in final_list:
                # if "bom_item" in out_dict:
                #     final_list.append(out_dict)
                # else:
                    if out_dict["item"] == item_dict["item"]:
                        # Merge the dictionaries
                        out_dict.update(item_dict)
                        found = True
                        break
            if not found:
                # If item not found, add it to the output list
                final_list.append(item_dict)
            
    return final_list


def get_matching_child_items(item_name, job_id):
    boms = frappe.get_all('BOM', filters={"item": item_name, "custom_job": job_id}, fields=['name'])
    
    matching_items = []
    
    for bom in boms:
        bom_items = frappe.get_all('BOM Item',
            filters={'parent': bom.name},
            fields=['item_name as bom_item', 'qty as material_qty', 'rate as material_price', 'amount as material_amount'])
        
        for item in bom_items:
            item["job"] = job_id
            item["type"] = "planned"
            item["is_bom_item"] = True
            matching_items.append(item)
    
    return matching_items


@frappe.whitelist()
def get_stock_summary_for_job():
    pass



@frappe.whitelist()
def set_stock_summary_data_in_job(job):
    job = frappe.get_doc("Task", job)
    rows = []
    for material in job.custom_mterials:
        actual_qty = get_actual_qty(material.material_item, material.source_warehouse)
        order_qty = get_order_qty(material.material_item, material.source_warehouse, job.name)
        reserved_qty = material.quentity
        available_qty = int(actual_qty) - int(reserved_qty)
        to_be_order_qty = int(reserved_qty) - int(actual_qty)
        
        # material.available_quantity = available_qty if available_qty > 0 else 0
        # material.actual_quantity = actual_qty
        # material.order_quantity =  order_qty
        # material.reserved_quantity = reserved_qty
        # material.to_be_order_quantity = to_be_order_qty
        
        rows.append({"row_name": material.name, "actual_qty": actual_qty, "available_qty": available_qty if available_qty > 0 else 0, "reserved_qty": reserved_qty, "to_be_order_qty": to_be_order_qty, "order_qty": order_qty })
    
    # job.save()
    return rows

    
    
    print("\n\n rows", rows)
    return rows
