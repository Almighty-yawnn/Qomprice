# app/api/category_tree.py

import pathlib
import yaml
import re
from fastapi import APIRouter
from typing import Dict, List

router = APIRouter()

def make_slug(s: str) -> str:
    """
    Lowercase, replace any run of non-alphanumeric characters
    with a single dash, and strip leading/trailing dashes.
    """
    slug = re.sub(r"[^a-z0-9]+", "-", s.lower())
    return slug.strip("-")

@router.get(
    "/category-tree",
    response_model=Dict[str, List[str]],
    summary="Return parent-slug → flattened child-slug lists"
)
async def get_category_tree() -> Dict[str, List[str]]:
    # 1️⃣ Load the nested YAML
    raw: Dict[str, Dict[str, List[str]]] = yaml.safe_load(
        pathlib.Path("scrapers/category_hierarchy.yaml").read_text()
    )

    tree: Dict[str, List[str]] = {}
    for parent_label, buckets in raw.items():
        parent_slug = make_slug(parent_label)

        # flatten every child name under all sub-buckets
        child_slugs: List[str] = []
        for names in buckets.values():
            for name in names:
                child_slugs.append(make_slug(name))

        tree[parent_slug] = child_slugs

    return tree
