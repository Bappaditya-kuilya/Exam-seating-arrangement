# FIX session authentication — validates session tokens before order processing

_sessions = {}

def validate_session(session_id: str) -> bool:
    """Validates FIX session. Called by process_new_order_single."""
    return session_id in _sessions

def register_session(session_id: str):
    _sessions[session_id] = True