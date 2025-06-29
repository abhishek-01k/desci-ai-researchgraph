from typing import Dict

def merge_json_objects(base: Dict, *others: Dict) -> Dict:
    """
    Merges multiple dictionaries into one. Later dictionaries override earlier ones if keys clash.

    Args:
        base (Dict): The initial dictionary to merge into.
        *others (Dict): Any number of additional dictionaries.

    Returns:
        Dict: A merged dictionary.
    """
    merged = base.copy()  # Avoid mutating the original base
    for obj in others:
        merged.update(obj)
    return merged
