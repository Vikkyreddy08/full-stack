import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/ASUS/OneDrive/Documents/Desktop/reactfn/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bon_gout.settings')
django.setup()

from restaurant.models import Category, MenuItem

def populate_full_menu():
    # 1. Categories
    categories_data = [
        'Biryani', 'Starters', 'Curry', 'Grill', 'Pizza', 'Chinese', 'Special', 'Dessert', 'Drinks'
    ]
    
    cat_map = {}
    for cat_name in categories_data:
        cat, _ = Category.objects.get_or_create(name=cat_name)
        cat_map[cat_name] = cat

    # 2. Detailed Menu Items
    menu_items = [
        # BIRYANI
        {
            'name': 'Chicken Dum Biryani',
            'category': cat_map['Biryani'],
            'price': 299.00,
            'description': 'Authentic Hyderabadi dum style with saffron rice and tender chicken.',
            'image': 'https://images.unsplash.com/photo-1603482665472-61d5a5c8f6ca?w=800',
            'is_veg': False,
            'is_spicy': True,
            'prep_time': '25min'
        },
        {
            'name': 'Mutton Dum Biryani',
            'category': cat_map['Biryani'],
            'price': 449.00,
            'description': 'Royal mutton biryani slow-cooked with aromatic spices.',
            'image': 'https://images.unsplash.com/photo-1566908761414-8e8569bd779f?w=800',
            'is_veg': False,
            'is_spicy': True,
            'prep_time': '35min'
        },
        # STARTERS
        {
            'name': 'Chicken 65',
            'category': cat_map['Starters'],
            'price': 199.00,
            'description': 'Spicy, deep-fried chicken bites - a Hyderabad favorite.',
            'image': 'https://images.unsplash.com/photo-1571171638498-8968b7e5a04c?w=800',
            'is_veg': False,
            'is_spicy': True,
            'prep_time': '12min'
        },
        {
            'name': 'Crispy Baby Corn',
            'category': cat_map['Starters'],
            'price': 169.00,
            'description': 'Golden fried baby corn fritters with tangy spices.',
            'image': 'https://images.unsplash.com/photo-1567561790888-252f58f5f7d4?w=800',
            'is_veg': True,
            'is_spicy': True,
            'prep_time': '8min'
        },
        # CURRY
        {
            'name': 'Paneer Butter Masala',
            'category': cat_map['Curry'],
            'price': 249.00,
            'description': 'Creamy tomato-based gravy with soft cottage cheese cubes.',
            'image': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
            'is_veg': True,
            'is_spicy': False,
            'prep_time': '20min'
        },
        {
            'name': 'Dal Makhani',
            'category': cat_map['Curry'],
            'price': 199.00,
            'description': 'Slow-cooked black lentils with butter and cream.',
            'image': 'https://images.unsplash.com/photo-1606893259681-1789f11a1874?w=800',
            'is_veg': True,
            'is_spicy': False,
            'prep_time': '18min'
        },
        # GRILL
        {
            'name': 'Tandoori Chicken',
            'category': cat_map['Grill'],
            'price': 349.00,
            'description': 'Full chicken marinated in yogurt and spices, grilled in tandoor.',
            'image': 'https://images.unsplash.com/photo-1594190323549-0f4a799918cc?w=800',
            'is_veg': False,
            'is_spicy': True,
            'prep_time': '25min'
        },
        # DESSERT
        {
            'name': 'Double Ka Meetha',
            'category': cat_map['Dessert'],
            'price': 149.00,
            'description': 'Traditional Hyderabadi bread pudding with saffron and nuts.',
            'image': 'https://images.unsplash.com/photo-1541599468178-c9d0e7c9dc8e?w=800',
            'is_veg': True,
            'is_spicy': False,
            'prep_time': '8min'
        },
        # DRINKS
        {
            'name': 'Mango Lassi',
            'category': cat_map['Drinks'],
            'price': 89.00,
            'description': 'Refreshing yogurt-based mango smoothie.',
            'image': 'https://images.unsplash.com/photo-1623328697-d63e1d99d931?w=800',
            'is_veg': True,
            'is_spicy': False,
            'prep_time': '3min'
        }
    ]

    for item in menu_items:
        MenuItem.objects.update_or_create(
            name=item['name'],
            defaults=item
        )
    print(f"Successfully populated {len(menu_items)} dishes.")

if __name__ == "__main__":
    populate_full_menu()
