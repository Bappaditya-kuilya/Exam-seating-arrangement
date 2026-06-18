# FIX Protocol order handler — Tag 35=D New Order Single
import time

def process_new_order_single(tag35d_message: dict) -> dict:
    """Handle incoming Tag 35=D FIX message. Must complete < 20ms."""
    order_id = tag35d_message.get("ClOrdID")
    symbol = tag35d_message.get("Symbol")
    qty = tag35d_message.get("OrderQty")

    # Validate fields (in-memory, fast)
    if not all([order_id, symbol, qty]):
        return {"status": "REJECTED", "reason": "Missing required FIX fields"}

    # Route to in-memory order book (no I/O)
    return {"status": "ACCEPTED", "order_id": order_id, "symbol": symbol}