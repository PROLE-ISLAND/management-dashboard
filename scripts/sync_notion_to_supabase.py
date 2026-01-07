#!/usr/bin/env python3
"""
Notion → Supabase 同期スクリプト（シンプル版）
NotionのJSONデータをそのままSupabaseに保存
"""

import os
import sys
from datetime import datetime, timezone
from typing import Optional
import requests
from dotenv import load_dotenv

load_dotenv()

# Configuration
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
if not NOTION_API_KEY:
    print("Error: NOTION_API_KEY not set")
    sys.exit(1)
NOTION_DB_ID = "44768ed1b8494c059f3080bd51f6968b"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rvhoveymacotfyyignba.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_notion_headers():
    return {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }


def get_supabase_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }


def fetch_notion_pages(start_cursor: Optional[str] = None) -> dict:
    """Fetch pages from Notion database"""
    url = f"https://api.notion.com/v1/databases/{NOTION_DB_ID}/query"
    payload = {"page_size": 100}
    if start_cursor:
        payload["start_cursor"] = start_cursor

    response = requests.post(url, headers=get_notion_headers(), json=payload)
    response.raise_for_status()
    return response.json()


def extract_simple_properties(properties: dict) -> dict:
    """NotionのpropertiesをシンプルなJSONに変換（日本語キーそのまま）"""
    result = {}

    for name, info in properties.items():
        prop_type = info.get("type")
        value = None

        if prop_type == "title":
            texts = info.get("title", [])
            value = texts[0].get("plain_text", "") if texts else ""

        elif prop_type == "rich_text":
            texts = info.get("rich_text", [])
            value = texts[0].get("plain_text", "") if texts else ""

        elif prop_type == "number":
            value = info.get("number")

        elif prop_type == "select":
            sel = info.get("select")
            value = sel.get("name") if sel else None

        elif prop_type == "multi_select":
            value = [s.get("name") for s in info.get("multi_select", [])]

        elif prop_type == "date":
            date_info = info.get("date")
            value = date_info.get("start") if date_info else None

        elif prop_type == "formula":
            formula = info.get("formula", {})
            value = formula.get("number") or formula.get("string")

        elif prop_type == "status":
            status = info.get("status")
            value = status.get("name") if status else None

        elif prop_type == "people":
            people = info.get("people", [])
            value = [p.get("name", "") for p in people]
            # リストを文字列に
            if len(value) == 1:
                value = value[0]
            elif len(value) == 0:
                value = None

        elif prop_type == "url":
            value = info.get("url")

        elif prop_type == "rollup":
            rollup = info.get("rollup", {})
            if rollup.get("type") == "array":
                arr = rollup.get("array", [])
                if arr:
                    first = arr[0]
                    if first.get("type") == "rich_text":
                        texts = first.get("rich_text", [])
                        value = texts[0].get("plain_text", "") if texts else ""
                    elif first.get("type") == "select":
                        sel = first.get("select")
                        value = sel.get("name") if sel else None

        # 値があればセット
        if value is not None and value != "" and value != []:
            result[name] = value

    return result


def convert_page_to_record(page: dict) -> dict:
    """NotionページをSupabaseレコードに変換"""
    properties = extract_simple_properties(page.get("properties", {}))

    return {
        "notion_id": page.get("id"),
        "properties": properties,  # JSONBとして保存
        "notion_created_at": page.get("created_time"),
        "notion_updated_at": page.get("last_edited_time"),
        "synced_at": datetime.now(timezone.utc).isoformat()
    }


def upsert_to_supabase(records: list) -> dict:
    """Upsert records to Supabase (notion_idで重複時は更新)"""
    # on_conflict=notion_id でupsertを有効化
    url = f"{SUPABASE_URL}/rest/v1/notion_orders?on_conflict=notion_id"

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
    }

    # バッチでupsert（1件ずつではなく一括で）
    response = requests.post(url, headers=headers, json=records)

    if response.status_code in [200, 201]:
        return {"success": True, "count": len(records), "errors": 0}
    else:
        print(f"   ⚠️ Batch upsert error: {response.text[:200]}")
        return {"success": False, "count": 0, "errors": len(records)}


def sync_all():
    """Main sync function"""
    print("🔄 Starting Notion → Supabase sync...")
    print(f"   Notion DB: {NOTION_DB_ID}")
    print(f"   Supabase: {SUPABASE_URL}")
    print(f"   Table: notion_orders (JSONB形式)")

    if not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not set")
        sys.exit(1)

    total_synced = 0
    has_more = True
    cursor = None
    batch_num = 0

    while has_more:
        batch_num += 1
        print(f"\n📥 Batch {batch_num}: Fetching from Notion...")
        data = fetch_notion_pages(cursor)

        pages = data.get("results", [])
        print(f"   Got {len(pages)} pages")

        if not pages:
            break

        # Convert records
        records = []
        for page in pages:
            try:
                record = convert_page_to_record(page)
                records.append(record)
            except Exception as e:
                print(f"   ⚠️ Error converting page {page.get('id')}: {e}")

        # Upsert to Supabase
        if records:
            print(f"📤 Upserting {len(records)} records...")
            result = upsert_to_supabase(records)
            total_synced += result.get("count", 0)
            print(f"   ✅ Synced {result.get('count', 0)}, errors: {result.get('errors', 0)}")

        has_more = data.get("has_more", False)
        cursor = data.get("next_cursor")

    print(f"\n🎉 Sync complete! Total: {total_synced} records")
    return total_synced


if __name__ == "__main__":
    sync_all()
