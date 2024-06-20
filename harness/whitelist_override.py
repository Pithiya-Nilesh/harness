import frappe

@frappe.whitelist()
def apply_price_list(args, as_doc=False):
    """Apply pricelist on a document-like dict object and return as
    {'parent': dict, 'children': list}

    :param args: See below
    :param as_doc: Updates value in the passed dict

            args = {
                    "doctype": "",
                    "name": "",
                    "items": [{"doctype": "", "name": "", "item_code": "", "brand": "", "item_group": ""}, ...],
                    "conversion_rate": 1.0,
                    "selling_price_list": None,
                    "price_list_currency": None,
                    "price_list_uom_dependant": None,
                    "plc_conversion_rate": 1.0,
                    "doctype": "",
                    "name": "",
                    "supplier": None,
                    "transaction_date": None,
                    "conversion_rate": 1.0,
                    "buying_price_list": None,
                    "ignore_pricing_rule": 0/1
            }
    """
    print("\n\n override whitelist method")
    pass
