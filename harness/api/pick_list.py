import frappe

@frappe.whitelist()
def set_child_table_data(docname):
    pick_list = frappe.get_doc('Pick List', docname)

    if pick_list.locations:
        job = pick_list.locations[0].custom_job_order
        if job:
            job_doc = frappe.get_doc('Task', job)
            job_doc.set('custom_pick_list_data', [])
            
            for location in pick_list.locations:
                row = job_doc.append('custom_pick_list_data', {})
                row.item_code = location.item_code
                row.warehouse = location.warehouse
                row.qty = location.qty
                row.stock_qty = location.stock_qty
                row.picked_qty = location.picked_qty

            job_doc.save()

            frappe.db.commit()

@frappe.whitelist()
def clear_custom_pick_list_data(docname):
    pick_list = frappe.get_doc('Pick List', docname)

    if pick_list.locations:
        job = pick_list.locations[0].custom_job_order
        if job:
            job_doc = frappe.get_doc('Task', job)
            job_doc.set('custom_pick_list_data', [])

            job_doc.save()

            frappe.db.commit()