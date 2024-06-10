import frappe

@frappe.whitelist()
def get_custom_html(quotation):
    
    html = """
         <table border="0" class="full-width-table" style="border-collapse: collapse;">
            <tr>
                <th></th>
                <th>Amount</th>
                <th>% of Sales</th>
            </tr>
        """
    final_data = get_custom_html_data(quotation)
    
    for data in final_data:
        html += f"""
             <tr style="border-top: 1px solid black;">
            <td class="text-align1" style="padding-bottom:30px!important;">Sales Net of GST</td>
            <td class="text-align" style="padding-bottom:30px!important;">${data.get('sales',"")}</td>
            <td class="text-align" style="padding-bottom:30px!important;">{data.get('sales_net_of_gst_percentage',"")}%</td>
        </tr>
        """
        
        # Generate dynamic rows for each custom type
        for item in data.get('items', []):
            html += f"""
                <tr>
                    <td class="text-align1">{item.get('type')}</td>
                    <td class="text-align">${item.get('custom_unit_cost')}</td>
                    <td class="text-align">{item.get('percentage'):.2f}%</td>
                </tr>
            """
        
        html += f"""
        <tr style="border-top: 1px solid black;">
            <td class="text-align1" style="font-weight:bold;">Cost of Goods Sold</td>
            <td class="text-align" style="font-weight:bold;">${data.get('cost_of_goods_sold',"")}</td>
            <td class="text-align" style="font-weight:bold;">{data.get('cost_of_goods_sold_percentage',""):.2f}%</td>
        </tr>
         <tr style="border-top: 1px solid black; border-bottom: 1px solid black;">
            <td class="text-align1" style="font-weight:bold;">{"Loss" if data.get('gross_profit', 0) < 0 else "Gross Profit"}</td>
            <td class="text-align" style="font-weight:bold;">${abs(data.get('gross_profit', 0))}</td>
            <td class="text-align" style="font-weight:bold;">{abs(data.get('gross_profit_percentage', 0)):.2f}%</td>
        </tr>
        <tr style="border-bottom: 1px solid black;">
            <td style="padding:1px!important;"></td>
            <td style="padding:1px!important;"></td>
            <td style="padding:1px!important;"></td>
        </tr>
        """    
    
    html += """</table>
    <style>
            .full-width-table {
                width: auto;
                border: none;
            }
            .text-align {
                text-align: right;
            }
            .text-align1 {
                text-weight: bold;
            }
            table tr td {
                padding-right: 10px;
                padding-left: 10px;
                padding-top: 4px;
                padding-bottom: 4px;
                text-align: right;
            }
            table tr th {
                padding-right: 10px;
                padding-left: 10px;
                padding-top: 4px;
                padding-bottom: 4px;
                text-align: left;
            }
        </style>
    """    
    
    return html 
 
def get_custom_html_data(quotations):
    if not isinstance(quotations, list):
        quotations = [quotations]

    data_list = []
    sales_sum = 0
    type_custom_unit_cost_dict = {} 
    
    for quotation_id in quotations:
        quotation = frappe.get_doc("Quotation", quotation_id)
        sales_sum += quotation.total
        data_entry = {"sales": quotation.total, "sales_net_of_gst_percentage": 100, "items": []}
        
        for item in quotation.items:
            if item.custom_type in type_custom_unit_cost_dict:
                type_custom_unit_cost_dict[item.custom_type] += item.custom_unit_cost
            else:
                type_custom_unit_cost_dict[item.custom_type] = item.custom_unit_cost
        
        # Adding the aggregated type amounts to the items list in data_entry
        for custom_type, custom_unit_cost in type_custom_unit_cost_dict.items():
            percentage = (custom_unit_cost * 100) / quotation.total
            data_entry["items"].append({"type": custom_type, "custom_unit_cost": custom_unit_cost, "percentage": percentage})
        
        data_list.append(data_entry)
    
    # Example of how cost of goods sold and gross profit could be calculated (placeholders)
    for data in data_list:
        data["cost_of_goods_sold"] = sum(item["custom_unit_cost"] for item in data["items"])
        data["cost_of_goods_sold_percentage"] = (data["cost_of_goods_sold"] * 100) / data["sales"]
        data["gross_profit"] = data["sales"] - data["cost_of_goods_sold"]
        data["gross_profit_percentage"] = (data["gross_profit"] * 100) / data["sales"]
    
    return data_list