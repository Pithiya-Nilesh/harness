import locale
import frappe, json, ast

from harness.api.utils import get_actual_qty, get_bom_sub_item, get_currency_formatted_list, get_order_qty

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
    # print("\n\n invoice data", invoice_data)
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


@frappe.whitelist()
def create_stock_entry(docname):
    """ this function map data for create stock entry from job doctype """
    try:
        task = frappe.get_doc("Task", docname)
        if task.custom_mterials:
            items_table = []
            for row in task.custom_mterials:
                if row.type == "Materials" and not get_bom_sub_item(row.material_item):
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
                        "conversion_factor": get_conversion_factor(row.material_item),
                        'custom_bom_no': ""
                    }
                    items_table.append(items_row)
                    
                elif row.type == "Materials":
                    bom_sub_items = get_bom_sub_item(row.material_item)
                    for bom_item in bom_sub_items:
                        item_found = False
                        for item in items_table:
                            if item['item_code'] == bom_item.item_code and item["custom_bom_no"] == bom_item.bom_no:
                                # Update qty if item already exists in items_table
                                item['qty'] += (bom_item.qty * row.quentity)
                                item['transfer_qty'] += (bom_item.qty * row.quentity)
                                item_found = True
                                break
                            # if item['item_code'] == bom_item.item_code:
                            #     # Update qty if item already exists in items_table
                            #     item['qty'] += bom_item.qty
                            #     item_found = True
                            #     break
                        
                        if not item_found:
                            # If item is not found in items_table, append a new entry
                            items_row = {
                                "item_code": bom_item.item_code,
                                "qty": (bom_item.qty * row.quentity),
                                "transfer_qty": (bom_item.qty * row.quentity),
                                "basic_rate": bom_item.rate,
                                "basic_amount": bom_item.amount,
                                # "s_warehouse": row.source_warehouse,
                                # "t_warehouse": row.target_warehouse,
                                "custom_job_order": docname,
                                "uom": get_uom(bom_item.item_code),
                                "stock_uom": get_uom(bom_item.item_code),
                                "conversion_factor": get_conversion_factor(bom_item.item_code),
                                "custom_bom_no": bom_item.bom_no
                            }
                            items_table.append(items_row)
        return items_table
    except Exception as e:
        frappe.log_error("Error: While create stock entry from job", e, "Task", docname)
    
    
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


def cancelled_status_in_jobs(doc, method):
    """ cancelled status in job when canclled doctype in sales order"""
    tasks = frappe.db.get_list("Task", filters={"custom_sales_order": doc.name}, fields=["name"])
    for task in tasks:
        frappe.db.set_value('Task', task.name, 'status', 'Cancelled')
        frappe.db.commit()

def sum_of_all_data(doc, method):
    sum_of_m_amount(doc, method)
    sum_of_r_amount(doc, method)
    frappe.reload_doc("Projects", "Task", doc.name)

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


# def not_save_checklist_table(doc, method):
#     print("\n\n called")
#     current_child_table_values = get_checklist_status(doc.name)
#     print("\n\n asdfadsfdf", current_child_table_values)
#     for i in current_child_table_values:
#         print("\n\n asdfadsfdf", i.check)
#         set_checklist_status(doc.name, i.jobsatus, i.check, i.jobchecklist, i.employeename, i.date)
#     return


@frappe.whitelist()
def create_sales_invoice(task):
    """ when we create sales invoice from job this function map data for this job and sales invoice. """
    try:
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
                
                debtor_account =  frappe.db.sql("select default_receivable_account from `tabCompany` where name=%s ", (item_data[0]['company']), as_dict=True)

                item_row = sales_invoice.append("items", {})
                item_row.item_code = row.material_item
                item_row.item_name = item_data[0]['item_name']
                item_row.uom = item_data[0]['stock_uom']
                item_row.income_account = item_data[0]['income_account']
                # item_row.cost_center = item_data[0]['selling_cost_center']
                # item_row.warehouse = item_data[0]['default_warehouse']
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

        sales_invoice.debit_to = debtor_account[0]['default_receivable_account'] if debtor_account[0]['default_receivable_account'] else "12010 - Accounts Receivable - HMWS"
        sales_invoice.price_list_currency = "AUD"
        sales_invoice.customer = frappe.db.get_value("Sales Order", task.custom_sales_order, fieldname=["customer"])
        sales_invoice.custom_job_order = task.name

        return sales_invoice
    except Exception as e:
        frappe.log_error("Error: While create sales invoice from job", e, "Task", task)

@frappe.whitelist()
def get_summary(job):
    
    """ get data for summary visible in summary tab in job doctype """
   
    try:
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
            if "bom_item" in i and i["bom_item"]:
                html += f"""
                    <tr style="background-color: #c8c8c8;">
                        <td style="text-align: left;"><div style="margin-left: 20px">{i.get('item')}</td>
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
    except Exception as e:
        frappe.log_error("Error: While get summary", e, "Task", job)


@frappe.whitelist()
def get_table_data_for_html(job):
    """ this return summary data fro given job """
    try:
    
        job = frappe.get_doc("Task", job)
        temp_list = []
        
        for material in job.custom_mterials:
            temp_list.append({ "job": job.name, "type": "planned", "is_billable": material.is_billable, "bom_item": material.bom_no or '', "item": material.material_item, "material_qty": material.quentity or "", "material_price": material.rate or 0, "material_amount": material.amount or 0})
        
        # for resource in job.custom_resources:
        #     temp_list.append({ "job": job.name, "type": "planned", "is_bom_item": False, "item": resource.service_item, "material_qty": resource.spent_hours, "material_price": resource.rate, "material_amount": resource.total_spend_hours})

        for actual in job.custom_materials1:
            temp_list.append({ "job": job.name, "type": "actual", "is_billable": actual.is_billable, "bom_item": actual.bom_no or '', "item": actual.material_item, "actual_qty": actual.quentity or "", "actual_cost": actual.rate or 0, "actual_amount": actual.amount or 0})
        
        # for actual_resource in job.custom_resources1:
        #     temp_list.append({ "job": job.name, "type": "actual", "is_bom_item": False, "item": actual_resource.service_item, "actual_qty": actual_resource.spent_hours, "actual_cost": actual_resource.rate, "actual_amount": actual_resource.total_spend_hours})

        for invoiced in job.custom_mterials:
            temp_list.append({ "job": job.name, "type": "invoiced", "is_billable": invoiced.is_billable, "bom_item": invoiced.bom_no or '', "item": invoiced.material_item, "invoiced_qty": invoiced.invoiced_qty or "", "invoiced_price": invoiced.invoiced_rate or 0, "invoiced_amount": invoiced.invoiced_amount or 0})
            
        # for r_invoiced in job.custom_resources1:
        #     temp_list.append({ "job": job.name, "type": "invoiced", "is_bom_item": False, "item": r_invoiced.service_item, "invoiced_qty": r_invoiced.invoiced_qty, "invoiced_price": r_invoiced.invoiced_rate, "invoiced_amount": r_invoiced.invoiced_amount})
            
        for available in job.custom_mterials:
            temp_list.append({ "job": job.name, "type": "available", "is_billable": available.is_billable, "bom_item": available.bom_no or '', "item": available.material_item, "available_qty": available.available_for_invoice_qty or "", "available_price": float(available.available_for_invoice_rate or 0), "available_amount": float(available.available_for_invoice_amount or 0)})
            # temp_list.append({ "job": job.name, "type": "available", "is_billable": available.is_billable, "bom_item": available.bom_no or '', "item": available.material_item, "available_qty": available.available_for_invoice_qty or "", "available_price": available.available_for_invoice_rate or 0, "available_amount": available.available_for_invoice_amount or 0})

        # for r_available in job.custom_resources1:
        #     temp_list.append({ "job": job.name, "type": "available", "is_bom_item": False, "item": r_available.service_item, "available_qty": r_available.available_for_invoice_qty, "available_price": r_available.available_for_invoice_rate, "available_amount": r_available.available_for_invoice_amount})

        summary_data = map_summary_data(temp_list)
        # print("\n\n summary data\n", summary_data)

        # # Get BOM Items
        # semi_final_list = []
        # for i in summary_data:
        #     matched_items = get_matching_child_items(i["item"], i["job"])
        #     if matched_items:
        #         semi_final_list.append(i)
        #         for j in matched_items:
        #             semi_final_list.append(j)
        #     else:
        #         semi_final_list.append(i)

        final_list = get_currency_formatted_list(summary_data)
        
        for i in final_list:
            for key in i:
                if 'available_qty' in key and i['available_qty'] == 0:
                    i['available_qty'] = i.get('actual_qty')
                if 'available_price' in key and i['available_price'] == "$0.00":
                    i['available_price'] = i.get('actual_cost', "")
                if 'available_amount' in key and i['available_amount'] == "$0.00":
                    i['available_amount'] = i.get('actual_amount', "")
                    
        for entry in final_list:
            for key, value in entry.items():
                if value == 0 or value == "$0.00":
                    entry[key] = ""
        # print("\n\n final list", final_list)
        
        result = rearrange_items(final_list)
        # print("\n\n final list result", result)

        return result
    
    except Exception as e:
        frappe.log_error("Error: While get table data for html", e, "Task", job)


def rearrange_items(data):
    """ rearrange item and set as per BOM first show parent item and then bom item related to this item. """
    # Create a dictionary to hold items by their 'a' values
    # print("\n\n asdf")
    
    item_dict = {item['item']: item for item in data}
    
    # Create a set to keep track of processed items
    processed = set()
    output_list = []

    def process_item(a_value):
        if a_value not in processed:
            item = item_dict[a_value]
            processed.add(a_value)
            output_list.append(item)
            # Process any items that depend on the current item
            for dep_item in data:
                # if dep_item.get('bom_item') != '':
                #     print("\n\n in if", dep_item.get('bom_item'))
                    bom_item = frappe.db.get_value("BOM", filters={"name": dep_item.get('bom_item')}, fieldname=["item"])
                    if bom_item == a_value:
                        process_item(dep_item['item'])

    # Iterate through the input list and process each item
    # print("\n\n processed", processed)
    for item in data:
        if item['item'] not in processed:
            process_item(item['item'])
            
            
    # print("\n\n output ", output_list)
    return output_list


def map_summary_data(data):
    # print("\n\n data", data)
    try:
        final_list = []
        for item_dict in data:
            # Check if an item with the same name exists in the output list            
            found = False
            for out_dict in final_list:
                # print("\n\n item dict", item_dict)
                # print("\n\n out dict", out_dict)
                if out_dict["item"] == item_dict["item"] and out_dict["bom_item"] == item_dict["bom_item"]:
                    # Merge the dictionaries
                    out_dict.update(item_dict)
                    found = True
                    break
            if not found:
                # If item not found, add it to the output list
                final_list.append(item_dict)
                
        return final_list
    except Exception as e:
        frappe.log_error("Error: While map summary data", f"Error: {e}\ndata: {data}")


# def get_matching_child_items(item_name, job_id):
#     try:
#         boms = frappe.get_all('BOM', filters={"item": item_name, "custom_job": job_id}, fields=['name'])
        
#         matching_items = []
        
#         for bom in boms:
#             bom_items = frappe.get_all('BOM Item',
#                 filters={'parent': bom.name},
#                 fields=['item_name as bom_item', 'qty as material_qty', 'rate as material_price', 'amount as material_amount'])
            
#             for item in bom_items:
#                 item["job"] = job_id
#                 item["type"] = "planned"
#                 item["is_bom_item"] = True
#                 matching_items.append(item)
        
#         return matching_items
#     except Exception as e:
#         frappe.log_error("Error: while getting matching item from BOM", f"Error:{e}\nitem: {item_name}\njob: {job_id}")


@frappe.whitelist()
def get_stock_summary_for_job():
    pass


@frappe.whitelist()
def set_stock_summary_data_in_job(job):
    try:
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
    except Exception as e:
        frappe.log_error("Error: While set stock summary data for job", e, "Task", job)


@frappe.whitelist()
def get_checklist_status(parent_docname):
    try:
        checklist = frappe.db.sql(f"""
            SELECT * FROM `tabJob Checklist` WHERE parent='{parent_docname}' 
        """, as_dict=True)
        return checklist
        
    except Exception as e:
        frappe.log_error("Error: While Getting Checklist For Job", e, "Task", parent_docname)
        return str(e)
    
    
@frappe.whitelist()
def set_checklist_status(parent_docname, selected_checkboxes):
    try:
        exist = frappe.db.exists("Job Checklist Status", parent_docname)
        if not exist:
            jcs = frappe.new_doc("Job Checklist Status")
            jcs.job = parent_docname
            jcs.save()
        
        frappe.db.sql(f"""
                DELETE FROM `tabJob Checklist` where parent = "{parent_docname}"
        """)
        frappe.db.commit()
        
        # frappe.get_doc("Job Checklist Status", parent_docname)
        for item in json.loads(selected_checkboxes):
            child_doc = frappe.get_doc({
                "doctype": "Job Checklist",
                "parent": parent_docname,
                "parenttype": "Job Checklist Status",
                "parentfield": "job_checklist",
                "job_status": item["jobstatus"],
                "check": item["check"],
                "job_checklist": item["jobchecklist"],
                "employee_name": item["employeename"],
                "date": item["date"]
            })
            # Save the child document
            child_doc.insert(ignore_permissions=True)
    
    except Exception as e:
        frappe.log_error("Error: While Setting Checklist For Job", e, "Task", parent_docname)
        return str(e)

@frappe.whitelist()
def get_task_data(task_id):
    task = frappe.get_doc('Task', task_id)
    task_name = task.name
    
    materials_data = []
    for material in task.custom_mterials:
        if material.type == 'Materials':
            materials_data.append({
                'material_item': material.material_item,
                'quantity': material.quentity
            })
    
    return {
        'task_name': task_name,
        'materials_data': materials_data
    }
    
