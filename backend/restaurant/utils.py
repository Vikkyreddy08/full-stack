from rest_framework.response import Response
from rest_framework import status
from .models import MenuItem

def standardized_response(status_code, message, data=None, success=True):
    """
    Returns a standardized JSON response: {status, message, data}
    """
    return Response({
        "status": "success" if success else "error",
        "message": message,
        "data": data
    }, status=status_code)

def validate_order_payload(data):
    """
    Validates the order request body: { items: [{id, quantity}] }
    """
    items = data.get('items', [])
    if not items:
        return False, "Order items are required"
    
    for item in items:
        # Check both 'id' and 'menu_item_id' for frontend flexibility
        item_id = item.get('id') or item.get('menu_item_id')
        qty = item.get('quantity', 0)
        
        if not item_id:
            return False, "Each item must have an id"
        
        if not isinstance(qty, int) or qty <= 0:
            return False, f"Invalid quantity for item {item_id}"
        
        if not MenuItem.objects.filter(id=item_id, available=True).exists():
            return False, f"Menu item with ID {item_id} is unavailable or does not exist"
            
    return True, None
