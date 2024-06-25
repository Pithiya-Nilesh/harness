import frappe

# def set_invoiced_qty(doc, method):
#     """ if sales invoice submited we need to make change in actual table related to this sales invoice in job doctype. """
#     print("\n\n set_invoiced_qty ")
#     if doc.is_return:
#         doc = frappe.get_doc("Sales Invoice", doc.return_against)
#         map_canclled_invoice_with_job(doc, method)
#     else:   
#         for i in doc.items:
#             if i.custom_job:
#                 print("\n\n if first loop first if")
#                 job = frappe.get_doc("Task", i.custom_job)
#                 for j in job.custom_materials1:
#                     if j.material_item == i.item_code:
#                         print("\n\n if second loop first if")
#                         invoiced_qty = j.invoiced_qty + i.qty
#                         frappe.db.set_value("Mate", j.name, "invoiced_qty", invoiced_qty)
#                         frappe.db.set_value("Mate", j.name, "invoiced_rate", i.rate)
#                         frappe.db.set_value("Mate", j.name, "invoiced_amount", (i.rate * invoiced_qty))
#                         frappe.db.commit()
                        
#                         print("\n\n j.asdfasdf", j.available_for_invoice_qty)

#                         if j.available_for_invoice_qty == 0.0:
#                             print("\n\n if second loop second if")
#                             available_qty = j.quentity - i.qty
#                         else:
#                             available_qty = j.available_for_invoice_qty - i.qty
#                         print("\n\n available_qty", available_qty)
#                         frappe.db.set_value("Mate", j.name, "available_for_invoice_qty", available_qty)
#                         frappe.db.set_value("Mate", j.name, "available_for_invoice_rate", j.rate)
#                         frappe.db.set_value("Mate", j.name, "available_for_invoice_amount", (j.rate * available_qty))
#                         frappe.db.commit()
                        
#                 for k in job.custom_resources1:
#                         if k.service_item == i.item_code:
#                             invoiced_qty = k.invoiced_qty + i.qty
#                             frappe.db.set_value("Mate", k.name, "invoiced_qty", invoiced_qty)
#                             frappe.db.set_value("Mate", k.name, "invoiced_rate", i.rate)
#                             frappe.db.set_value("Mate", k.name, "invoiced_amount", (i.rate * invoiced_qty))
#                             frappe.db.commit()

#                             available_qty = k.available_for_invoice_qty - i.qty
#                             frappe.db.set_value("Mate", k.name, "available_for_invoice_qty", available_qty)
#                             frappe.db.set_value("Mate", k.name, "available_for_invoice_rate", k.rate)
#                             frappe.db.set_value("Mate", k.name, "available_for_invoice_amount", (k.rate * available_qty))
#                             frappe.db.commit()     

def set_invoiced_qty(doc, method):
    """ if sales invoice submited we need to make change in actual table related to this sales invoice in job doctype. """
    try:
        
        if doc.is_return:
            doc = frappe.get_doc("Sales Invoice", doc.return_against)
            map_canclled_invoice_with_job(doc, method)
        else:   
            for i in doc.items:
                if i.custom_job:
                    job = frappe.get_doc("Task", i.custom_job)
                    for j in job.custom_mterials:
                        if j.material_item == i.item_code:
                            invoiced_qty = j.invoiced_qty + i.qty
                            
                            j.invoiced_qty = invoiced_qty
                            j.invoiced_rate = i.rate
                            j.invoiced_amount = (i.rate * invoiced_qty)
                            
                            if j.available_for_invoice_qty == 0.0 or j.available_for_invoice_qty == '0':
                                available_qty = float(j.quentity) - float(i.qty)
                            else:
                                available_qty = float(j.available_for_invoice_qty) - float(i.qty)

                            j.available_for_invoice_qty = available_qty
                            j.available_for_invoice_rate = j.rate
                            j.available_for_invoice_amount = (j.rate * available_qty)
                    job.save()
                    frappe.db.commit()
                        
                    # for k in job.custom_resources1:
                    #         if k.service_item == i.item_code:
                    #             invoiced_qty = k.invoiced_qty + i.qty
                    #             frappe.db.set_value("Mate", k.name, "invoiced_qty", invoiced_qty)
                    #             frappe.db.set_value("Mate", k.name, "invoiced_rate", i.rate)
                    #             frappe.db.set_value("Mate", k.name, "invoiced_amount", (i.rate * invoiced_qty))
                    #             frappe.db.commit()

                    #             available_qty = k.available_for_invoice_qty - i.qty
                    #             frappe.db.set_value("Mate", k.name, "available_for_invoice_qty", available_qty)
                    #             frappe.db.set_value("Mate", k.name, "available_for_invoice_rate", k.rate)
                    #             frappe.db.set_value("Mate", k.name, "available_for_invoice_amount", (k.rate * available_qty))
                    #             frappe.db.commit()  

    except Exception as e:
        frappe.log_error("Error: While set invoiced qty in job after si submit.", e, "Sales Invoice", doc.name)

# def map_canclled_invoice_with_job(doc, method):
#     """ if sales invoice cancelled we need to make change in actual table related to this sales invoice in job doctype. """
    
#     for i in doc.items:
#         if i.custom_job:
#             job = frappe.get_doc("Task", i.custom_job)
#             for j in job.custom_materials1:
#                 if j.material_item == i.item_code:
#                     invoiced_qty = j.invoiced_qty + i.qty
#                     frappe.db.set_value("Mate", j.name, "invoiced_qty", invoiced_qty)
#                     frappe.db.set_value("Mate", j.name, "invoiced_rate", j.rate)
#                     frappe.db.set_value("Mate", j.name, "amount", j.rate * invoiced_qty)
#                     frappe.db.commit()

#                     available_qty = j.available_for_invoice_qty - i.qty
#                     frappe.db.set_value("Mate", j.name, "available_for_invoice_qty", available_qty)
#                     frappe.db.set_value("Mate", j.name, "available_for_invoice_rate", j.rate)
#                     frappe.db.set_value("Mate", j.name, "available_for_invoice_amount", (j.rate * available_qty))
#                     frappe.db.commit()   
                    
#             for k in job.custom_resources1:
#                 if k.service_item == i.item_code:
#                     invoiced_qty = k.invoiced_qty + i.qty
#                     frappe.db.set_value("Mate", k.name, "invoiced_qty", invoiced_qty)
#                     frappe.db.set_value("Mate", k.name, "invoiced_rate", k.rate)
#                     frappe.db.set_value("Mate", k.name, "amount", k.rate * invoiced_qty)
#                     frappe.db.commit()

#                     available_qty = k.available_for_invoice_qty - i.qty
#                     frappe.db.set_value("Mate", k.name, "available_for_invoice_qty", available_qty)
#                     frappe.db.set_value("Mate", k.name, "available_for_invoice_rate", k.rate)
#                     frappe.db.set_value("Mate", k.name, "available_for_invoice_amount", (k.rate * available_qty))
#                     frappe.db.commit()  
                     
def map_canclled_invoice_with_job(doc, method):
    """ if sales invoice cancelled we need to make change in actual table related to this sales invoice in job doctype. """
    try:
        for i in doc.items:
            if i.custom_job:
                job = frappe.get_doc("Task", i.custom_job)
                for j in job.custom_mterials:
                    if j.material_item == i.item_code:
                        invoiced_qty = j.invoiced_qty - i.qty
                        j.invoiced_qty = invoiced_qty
                        j.invoiced_rate = j.rate
                        j.amount = (j.rate * invoiced_qty)

                        available_qty = j.available_for_invoice_qty + i.qty 
                        j.available_for_invoice_qty = available_qty
                        j.available_for_invoice_rate = j.rate
                        j.available_for_invoice_amount = (j.rate * available_qty)
                job.save()
                frappe.db.commit()       
                # for k in job.custom_resources1:
                #     if k.service_item == i.item_code:
                #         invoiced_qty = k.invoiced_qty + i.qty
                #         frappe.db.set_value("Mate", k.name, "invoiced_qty", invoiced_qty)
                #         frappe.db.set_value("Mate", k.name, "invoiced_rate", k.rate)
                #         frappe.db.set_value("Mate", k.name, "amount", k.rate * invoiced_qty)
                #         frappe.db.commit()

                #         available_qty = k.available_for_invoice_qty - i.qty
                #         frappe.db.set_value("Mate", k.name, "available_for_invoice_qty", available_qty)
                #         frappe.db.set_value("Mate", k.name, "available_for_invoice_rate", k.rate)
                #         frappe.db.set_value("Mate", k.name, "available_for_invoice_amount", (k.rate * available_qty))
                #         frappe.db.commit()   
    
    except Exception as e:
        frappe.log_error("Error: While map cancelled sales invoice in job.", e , "Sales Invoice", doc.name)
        
@frappe.whitelist()
def map_sales_invoice_from_job(dummy=""):
    """ when we click on create sales invoice button in job summary page this method map data for sales invocie """
    job = frappe.flags.args.job
    try:
        data = frappe.flags.args.data
        customer = frappe.flags.args.customer
        sales_order = frappe.flags.args.sales_order
        section = frappe.db.get_value("Task", job, ["subject"])
        quotation_name = frappe.db.get_value("Sales Order", filters={"name": sales_order}, fieldname=["custom_quotation_name"])
        customer_account= frappe.db.sql(f"select account from `tabParty Account` where parent='{customer}'", as_dict=True)

        
        si = frappe.new_doc("Sales Invoice")
        si.customer = customer
        si.selling_price_list = ""
        si.ignore_pricing_rule = 1
        si.custom_quotation_name = quotation_name
        for i in data:
                
            if i['ToBeInvoicedQty'] == 0:
                pass
            
            else:
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
                            """, (i["Description"]), as_dict=True)
                    
                debtor_account =  frappe.db.sql(" select default_receivable_account from `tabCompany` where name=%s ", (item_data[0]['company']), as_dict=True)
                    
                item_row = si.append("items", {})
                item_row.item_code = i["Description"]
                item_row.item_name = item_data[0]['item_name']
                item_row.uom = item_data[0]['stock_uom']
                item_row.income_account = item_data[0]['income_account']
                item_row.cost_center = item_data[0]['selling_cost_center']
                item_row.warehouse = item_data[0]['default_warehouse']
                item_row.qty = i['ToBeInvoicedQty']
                item_row.rate = i['ToBeInvoicedPrice']
                item_row.amount = i['ToBeInvoicedAmount']
                # item_row.warehouse = i.source_warehouse
                # item_row.target_warehouse = i.target_warehouse
                item_row.sales_order = sales_order
                item_row.custom_job = job
                item_row.description = item_data[0]['description']
                item_row.custom_section_name = section
                # item_row.custom_type = get_types(i["Description"], job)
                get_extra_custom_fields_value(item_row, sales_order, i["Description"])
                
        si.debit_to = customer_account if customer_account else debtor_account[0]['default_receivable_account']
        si.price_list_currency = "AUD"
            
        # si.insert(ignore_mandatory=True)
        return si
    except Exception as e:
        frappe.log_error("Error: While map sales invoice from job summary.", e, "Task", job)    
    
@frappe.whitelist()
def map_sales_invoice_from_sales_order(dummy=""):
    """ when we click on create sales invoice button in sales order summary page this method map data for sales invocie. """

    sales_order = frappe.flags.args.sales_order
    try:
        data = frappe.flags.args.data
        customer = frappe.db.get_value("Sales Order", filters={"name": sales_order}, fieldname=["customer"])
        quotation_name = frappe.db.get_value("Sales Order", filters={"name": sales_order}, fieldname=["custom_quotation_name"])
        customer_account= frappe.db.sql(f"select account from `tabParty Account` where parent='{customer}'", as_dict=True)
        
        si = frappe.new_doc("Sales Invoice")
        si.customer = customer
        si.selling_price_list = ""
        si.ignore_pricing_rule = 1
        si.price_list_currency = "AUD"
        si.custom_quotation_name = quotation_name
        
        for i in data:
            if i['ToBeInvoicedQty'] == 0:
                pass
            else:
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
                            """, (i["Description"]), as_dict=True)
                    
                debtor_account =  frappe.db.sql("select default_receivable_account from `tabCompany` where name=%s ", (item_data[0]['company']), as_dict=True)

                item_row = si.append("items", {})
                item_row.item_code = i["Description"]
                item_row.item_name = item_data[0]['item_name']
                item_row.uom = item_data[0]['stock_uom']
                item_row.income_account = item_data[0]['income_account']
                # item_row.cost_center = item_data[0]['selling_cost_center']
                item_row.warehouse = item_data[0]['default_warehouse']
                item_row.qty = i['ToBeInvoicedQty']
                item_row.rate = i['ToBeInvoicedPrice']
                item_row.amount = i['ToBeInvoicedAmount']
                # item_row.warehouse = i.source_warehouse
                # item_row.target_warehouse = i.target_warehouse
                item_row.sales_order = sales_order
                item_row.custom_job = i['Job']
                item_row.description = item_data[0]['description']
                item_row.custom_section_name = get_section_name(i['Job'])
                # item_row.custom_type = get_types(i["Description"], i['Job'])
                get_extra_custom_fields_value(item_row, sales_order, i["Description"])
        si.debit_to = customer_account if customer_account else debtor_account[0]['default_receivable_account']

        return si
    except Exception as e:
        frappe.log_error("Error: While map sales invoice from sales order summary.", e, "Sales Order", sales_order)  

def get_extra_custom_fields_value(item_row, sales_order, item):
    try:
        sql = f""" SELECT custom_unit_cost, custom_suggested_unit_price, custom_type, custom_markup_ FROM `tabSales Order Item` where parent='{sales_order}' and item_code='{item}' """
        item_data = frappe.db.sql(sql, as_dict=True)
        for i in item_data:
            item_row.custom_unit_cost = i.custom_unit_cost
            item_row.custom_suggested_unit_price = i.custom_suggested_unit_price
            item_row.custom_type = i.custom_type
            item_row.custom_markup_ = i.custom_markup_
    except Exception as e:
        frappe.log_error("Error: While get extra custom column fields like markup etc.", f"Error: {e}\nitem_row: {item_row}\nsales_order: {sales_order}\nitem: {item}")  

def get_types(item, job):
    job = frappe.get_doc("Task", job)
    for i in job.custom_materials1:
        if i.material_item == item:
            return i.type

def get_section_name(job):
    section = frappe.db.get_value("Task", job, ["subject"])
    return section if section else ""

