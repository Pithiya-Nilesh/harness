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
    jobs_data = []
    jobs = frappe.db.get_list("Task", filters={"custom_sales_order": sales_order}, fields=['name'])
    customer = frappe.db.get_value("Sales Order", filters={"name": sales_order}, fieldname=["customer"])

    for job in jobs:
        job_data = get_table_data_for_html(job.name)
        for job in job_data:
            jobs_data.append(job)
    return jobs_data


@frappe.whitelist()
def create_jobs(name):
    """ create jobs based on sections in sales order """
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
            
        count += 1
        task.insert()
        frappe.db.commit()
    return count


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
    
def get_stock_summary_html_data(job):
    job = frappe.get_doc("Task", job)
    data_list = []
    for material in job.custom_mterials:
        data_list.append({ "job": job.name, "type": "planned", "item": material.material_item, "actual_qty": material.actual_quantity or "", "reserved_qty": material.reserved_quantity or "", "on_order_qty": material.ordered_quantity or "", "available_qty": material.available_quantity or "", "to_be_order_qty": material.to_be_order_quantity or ""})

    return data_list

