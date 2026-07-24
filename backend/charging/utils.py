import re

def normalize_connector(connector_str):
    """
    Normalizes EV connector strings for robust backend validation.
    e.g. 'CCS 2', 'CCS-2', 'ccs2' -> 'CCS2'
         'Type 2', 'TYPE-2' -> 'TYPE2'
         'GB/T', 'GBT' -> 'GB/T'
         'CHAdeMO', 'CHADEMO' -> 'CHADEMO'
    """
    if not connector_str or not isinstance(connector_str, str):
        return ""
    
    trimmed = connector_str.strip().upper()

    if re.match(r"^CCS[-_\s]?2$", trimmed):
        return "CCS2"
    if re.match(r"^TYPE[-_\s]?2$", trimmed):
        return "TYPE2"
    if re.match(r"^GB[-_\s/]?T$", trimmed):
        return "GB/T"
    if re.match(r"^CHADEMO$", trimmed):
        return "CHADEMO"

    return trimmed


def is_connector_compatible(vehicle_connector, charger_connector):
    """
    Returns True if vehicle_connector matches charger_connector after normalization.
    """
    norm_v = normalize_connector(vehicle_connector)
    norm_c = normalize_connector(charger_connector)

    if not norm_v or not norm_c:
        return False

    return norm_v == norm_c
