# class_colors.py

# Define a dictionary mapping each class to a specific color
CLASS_COLORS = {
    "good": (0, 255, 0),          # Green
    "honey": (255, 215, 0),       # Gold
    "rotten": (139, 0, 0),        # Dark Red
    "insect": (255, 69, 0),       # Orange Red
    "corncob": (244, 164, 96),    # Sandy Brown
    "goodcracked": (0, 128, 0),   # Dark Green
    "coated": (255, 20, 147),     # Deep Pink
    "infungus": (128, 0, 128),    # Purple
    "damaged": (255, 0, 0),       # Red
    "exfungus": (75, 0, 130),     # Indigo
    "whfungus": (255, 255, 255),  # White
    "badlycracked": (0, 0, 255),  # Blue
}

# Function to get color for a given class name
def get_color_for_class(class_name):
    return CLASS_COLORS.get(class_name, (255, 255, 255))  # Default color is white
