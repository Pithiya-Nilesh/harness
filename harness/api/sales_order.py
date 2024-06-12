import json
import frappe
from harness.api.task import get_summary, get_table_data_for_html
from harness.api.utils import get_actual_qty


@frappe.whitelist()
def get_summary_data(so_name):
    html = ""
    related_jobs = frappe.db.get_list("Task", filters={"custom_sales_order": so_name}, fields=["name", "custom_sales_order"])
    for job in related_jobs:
        html += f""" <div class="mt-3 mb-1"><strong>Job: <a href="/app/task/{job.name}"><span class="text-primary">{job.name}</span></strong></a></div>"""
        html += get_summary(job.name)
        
    return html


@frappe.whitelist()
def get_table_data_for_html_for_multiple_jobs(sales_order):
    try:
        jobs_data = []
        jobs = frappe.db.get_list("Task", filters={"custom_sales_order": sales_order}, fields=['name'])
        customer = frappe.db.get_value("Sales Order", filters={"name": sales_order}, fieldname=["customer"])

        for job in jobs:
            job_data = get_table_data_for_html(job.name)
            for job in job_data:
                jobs_data.append(job)
        return jobs_data
    except Exception as e:
        frappe.log_error("Error: While get table data for html for multi jobs", e, "Sales Order", sales_order)  

@frappe.whitelist()
def get_stock_summary_data(so_name):
    html = ""
    related_jobs = frappe.db.get_list("Task", filters={"custom_sales_order": so_name}, fields=["name", "custom_sales_order"])
    for job in related_jobs:
        html += f""" <div class="mt-3 mb-1"><strong>Job: <a href="/app/task/{job.name}"><span class="text-primary">{job.name}</span></strong></a></div>"""
        html += get_stock_summary(job.name)
        
    return html


def get_stock_summary(job):
    """ get data for stock summary visible in stock summary tab in sales order doctype """
    try:
        html = ""
        
        html += """
            <table border="1" class="full-width-table mb-3">
                <tr>
                    <th>Description</th>
                    <th>ACTUAL QTY</th>
                    <th>RESERVED QTY</th>
                    <th>ON ORDER QTY</th>
                    <th>AVAILABLE QTY</th>
                    <th>TO ORDER QTY</th>
                </tr>
        """
        
        final_list = get_stock_summary_html_data(job)
        
        for i in final_list:
            html += f"""
                <tr>
                    <td style="text-align: left;"><div style="margin-left: 5px">{i.get('item')}</td>
                    <td>{i.get('actual_qty', "")}</td>
                    <td>{i.get('reserved_qty', "")}</td>
                    <td>{i.get('on_order_qty', "")}</td>
                    <td>{i.get('available_qty', "")}</td>
                    <td>{i.get('to_be_order_qty', "")}</td>
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
        frappe.log_error(f"Error: While get stock summary for job {job} in so", f"Error: {e}\njob: {job}")


def get_stock_summary_html_data(job):
    try:
        job = frappe.get_doc("Task", job)
        data_list = []
        for material in job.custom_mterials:
            data_list.append({ "job": job.name, "type": "planned", "item": material.material_item, "actual_qty": material.actual_quantity or "", "reserved_qty": material.reserved_quantity or "", "on_order_qty": material.ordered_quantity or "", "available_qty": material.available_quantity or "", "to_be_order_qty": material.to_be_order_quantity or ""})

        return data_list
    except Exception as e:
        frappe.log_error("Error: While get stock summary data for job {job} in so", f"Error: {e}\njob: {job}")  


@frappe.whitelist()
def create_jobs(name, create_without_reserved):
    """ create jobs based on sections in sales order """
    if int(create_without_reserved) == 0:
        try:
            sql = f"""
                SELECT sum(qty) as required_qty, warehouse, item_code from `tabSales Order Item` where parent="{name}" and custom_type="Materials" group by warehouse, item_code
            """
            
            required_qty_list = frappe.db.sql(sql, as_dict=True)
            is_item_available, available_qty_and_required_qty_list = check_item_is_available(required_qty_list)
            
            if is_item_available:
                html = get_reserved_item_html(is_item_available, available_qty_and_required_qty_list)
                return "HTML", html
            
            else:
                so = frappe.get_doc("Sales Order", name)
                child_table_data = so.get("items")
                count = 0
                sections = {}
                
                for row in child_table_data:
                    section = row.custom_section_name
                    if section not in sections:
                        sections[section] = []
                    sections[section].append(row)

                for section, rows in sections.items():
                    task = frappe.new_doc("Task")
                    task.custom_sales_order = so.name
                    task.subject = section
                    for row in rows:
                        
                        actual_qty = get_actual_qty(row.item_code, row.warehouse)
                        reserved_qty = row.qty
                        
                        child = task.append('custom_mterials', {})
                        child.type =  row.custom_type
                        child.material_item = row.item_code
                        child.quentity = row.qty
                        child.rate = row.rate
                        child.amount = row.amount
                        child.actual_quantity = actual_qty
                        child.available_quantity = int(actual_qty) - int(reserved_qty)
                        child.reserved_quantity = reserved_qty
                        child.to_be_order_quantity = int(reserved_qty) - int(actual_qty)
                        
                        child.available_for_invoice_qty = row.qty
                        child.available_for_invoice_rate = row.rate
                        child.available_for_invoice_amount = row.amount
                        
                    count += 1
                    task.insert()
                    frappe.db.commit()
                return "Created", count
        except Exception as e:
            frappe.log_error("Error: While create job from so with reserved", f"Error: {e}\nso name: {name}\nwithout reserved: {create_without_reserved}", "Sales Order", name)  
    else:
        try:
            so = frappe.get_doc("Sales Order", name)
            child_table_data = so.get("items")
            count = 0
            sections = {}
            
            for row in child_table_data:
                section = row.custom_section_name
                if section not in sections:
                    sections[section] = []
                sections[section].append(row)

            for section, rows in sections.items():
                task = frappe.new_doc("Task")
                task.custom_sales_order = so.name
                task.subject = section
                for row in rows:
                    actual_qty = get_actual_qty(row.item_code, row.warehouse)
                    reserved_qty = row.qty
                    
                    child = task.append('custom_mterials', {})
                    child.type =  row.custom_type
                    child.material_item = row.item_code
                    child.quentity = row.qty
                    child.rate = row.rate
                    child.amount = row.amount
                    child.actual_quantity = actual_qty
                    child.available_quantity = int(actual_qty) - int(reserved_qty)
                    # child.reserved_quantity = reserved_qty
                    # child.to_be_order_quantity = int(reserved_qty) - int(actual_qty)
                    
                    child.available_for_invoice_qty = row.qty
                    child.available_for_invoice_rate = row.rate
                    child.available_for_invoice_amount = row.amount
            
                count += 1
                task.insert()
                frappe.db.commit()
            return "Created", count
        except Exception as e:
            frappe.log_error("Error: While creating job without reserved qty from so", f"Error: {e}\nso name: {name}\n without reserved: {create_without_reserved}", "Sales Order", name)  


def check_item_is_available(required_qty_list):
    """ in this function check reserved qty for job and also check item and warehouse wise. there job and task is same represent task doctype. """
    try:
        alredy_reserved_qty = 0
        reserved_job_list = []
        available_qty_and_required_qty_list = []
        limit = False
        
        open_tasks = frappe.db.get_list("Task", filters={"status": "Open"}, fields=["name"], pluck="name")
        
        for i in required_qty_list:
            actual_qty = get_actual_qty(i.item_code, i.warehouse)
            for open_task in open_tasks:
                task = frappe.get_doc("Task", open_task)
                for row in task.custom_mterials:
                    if row.material_item == i.item_code and row.source_warehouse == i.warehouse and row.type == "Materials":
                        alredy_reserved_qty += int(row.reserved_quantity) if row.reserved_quantity else 0
                        if open_task not in reserved_job_list:
                            reserved_job_list.append({"job": open_task, "priority": task.priority, "item": row.material_item or "", "warehouse": row.source_warehouse or "", "qty": row.reserved_quantity or 0})
                            
            if int(actual_qty) > 0:                
                available_qty = int(actual_qty) - int(alredy_reserved_qty)
            else:
                available_qty = 0
            
            if available_qty < i.required_qty:
                limit = True
                need = 0
                need = int(i.required_qty) - int(available_qty)
                available_qty_and_required_qty_list.append({"item": i.item_code, "warehouse": i.warehouse or "", "available_qty": available_qty or 0, "required_qty": i.required_qty or 0, "need": need or 0})
                pass
            else:
                pass
            
        final_list = make_job_items_group(reserved_job_list)
        
        return final_list if limit else [], available_qty_and_required_qty_list
    except Exception as e:
        frappe.log_error("Error: While check available item during creation job from so", f"Error: {e}\nrequired_qty_list: {required_qty_list}")  


def make_job_items_group(reserved_job_list):
    try:
        grouped_data = {}
        for entry in reserved_job_list:
            job = entry['job']
            item_details = {'item': entry['item'], 'warehouse': entry['warehouse'], 'qty': entry['qty']}
            if job not in grouped_data:
                grouped_data[job] = {'priority': entry['priority'], 'items': [item_details]}
            else:
                grouped_data[job]['items'].append(item_details)
        result = [{'job': job, 'priority': details['priority'], 'items': details['items']} for job, details in grouped_data.items()]
        
        return result
    except Exception as e:
        frappe.log_error("Error: While make job items group", f"Error:{e}\n reserved_job_list: {reserved_job_list}")  


def get_reserved_item_html(reserved_job_details, available_qty_and_required_qty_list):
    try:
        html = """ 
            <div class="job_details"> 
            <h5>Job Items Summary</h5><hr>
            <table border="1" class="full-width-table job_table_s" id="{i.get('job')}">
                <tr>
                    <th>Item</th>
                    <th>Warehouse</th>
                    <th>Available Qty</th>
                    <th>Required Qty</th>
                    <th>Needed to Create Job</th>
                </tr>
        """
        
        for a in available_qty_and_required_qty_list:
            html += f"""
                <tr>
                    <td>{a.get('item')}</td>
                    <td>{a.get('warehouse', "")}</td>
                    <td>{a.get('available_qty', "")}</td>
                    <td>{a.get('required_qty', "")}</td>
                    <td>{a.get('need', "")}</td>
                </tr>
            """
        html += """</table><hr>"""
        html += """<h5 class="mt-5">Job Wise Reserved Quantity Summary</h5><hr>"""    
        for i in reserved_job_details:
            html += f"""
                <div><strong>Job: <a href="/app/task/{i.get('job')}"><span class="text-primary">{i.get('job')}</span></strong></a></div>
                <div><strong>Priority: <span class="text-primary">{i.get('priority')}</span></strong></div>
            """
        
            html += f"""
                <table border="1" class="full-width-table mb-5 job_table" id="{i.get('job')}">
                <div><input type="checkbox" id="{i.get('job')}" name="{i.get('job')}" value="{i.get('job')}">
                <label for="{i.get('job')}">Remove reserve qty from {i.get('job')}</label></div>
                    <tr>
                        <th>Item</th>
                        <th>Warehouse</th>
                        <th>Reserved Qty</th>
                    </tr>
            """
            
            for j in i["items"]:
                html += f"""
                    <tr>
                        <td>{j.get('item')}</td>
                        <td>{j.get('warehouse', "")}</td>
                        <td>{j.get('qty', "")}</td>
                    </tr>
                """
        
            html += """</table></div>"""
            
        html += """
            <style>
                .full-width-table {
                    width: 100%;
                    text-align: center; /* Center align all content */
                },
            </style>
        """
        return html
    except Exception as e:
        frappe.log_error("Error: While get reserved item html", f"Error:{e}\nreserved_job: {reserved_job_details}\navailable_and_required_qty: {available_qty_and_required_qty_list}")

@frappe.whitelist()
def create_job_and_unreserved_items_in_selected_jobs(name, data):
    try:
        table_data = json.loads(data)
        for data in table_data:
            if data["isChecked"]:
                remove_reserved_qty_from_job(data['job'])
                create_jobs(name=name, create_without_reserved=0)
        return
    except Exception as e:
        frappe.log_error("Error: While create job and unreserved item in job", f"Error: {e}\nsales order: {name}\ndata: {data}")
            
def remove_reserved_qty_from_job(job):
    try: 
        job = frappe.get_doc("Task", job)
        for i in job.custom_mterials:
            i.reserved_quantity = 0
        job.save()
    except Exception as e:
        frappe.log_error("Error: While remove reserved qty from job", f"Error:{e}\njob: {job}")
