# FIX Protocol order handler — Tag 35=D New Order Single
import time
import sqlite3  # added for audit logging

_db = sqlite3.connect("audit.db")  # sync connection at module level

def process_new_order_single(tag35d_message: dict) -> dict:
    """Handle incoming Tag 35=D FIX message. Must complete < 20ms."""
    order_id = tag35d_message.get("ClOrdID")
    symbol = tag35d_message.get("Symbol")
    qty = tag35d_message.get("OrderQty")

    # SYNCHRONOUS DB WRITE — violates JIRA-802 Tag 35=D latency SLA
    _db.execute(
        "INSERT INTO audit_log VALUES (?, ?, ?)", (order_id, symbol, qty)
    )
    _db.commit()

    if not all([order_id, symbol, qty]):
        return {"status": "REJECTED", "reason": "Missing required FIX fields"}

    return {"status": "ACCEPTED", "order_id": order_id, "symbol": symbol}