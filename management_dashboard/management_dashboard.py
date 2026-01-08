"""経営ダッシュボード - モダンUI版"""

import reflex as rx
import httpx
from typing import List
from pydantic import BaseModel
from collections import defaultdict
from datetime import datetime, timedelta

# Supabase設定
SUPABASE_URL = "https://rvhoveymacotfyyignba.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2aG92ZXltYWNvdGZ5eWlnbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjE0NjYsImV4cCI6MjA4MzMzNzQ2Nn0.-diBq2LtI_zHhHra4754-p12vlGvr9_8qvmehySiPm4"


class OrderItem(BaseModel):
    """発注アイテム"""
    notion_id: str = ""
    name: str = ""
    scope: str = ""
    amount: int = 0
    date: str = ""
    status: str = ""
    platform: str = ""


class AggregateItem(BaseModel):
    """集計アイテム"""
    period: str = ""
    count: int = 0
    total: int = 0


class State(rx.State):
    """アプリケーション状態"""

    orders: List[OrderItem] = []
    daily_agg: List[AggregateItem] = []
    weekly_agg: List[AggregateItem] = []
    monthly_agg: List[AggregateItem] = []

    loading: bool = True
    error: str = ""
    total_count: int = 0
    total_amount: int = 0
    avg_amount: int = 0

    agg_mode: str = "monthly"
    search_query: str = ""

    @rx.var
    def total_amount_formatted(self) -> str:
        """総支給額（カンマ付き）"""
        return f"¥{self.total_amount:,}"

    @rx.var
    def avg_amount_formatted(self) -> str:
        """平均単価（カンマ付き）"""
        return f"¥{self.avg_amount:,}"

    @rx.var
    def current_agg(self) -> List[AggregateItem]:
        """現在選択中の集計データ"""
        if self.agg_mode == "daily":
            return self.daily_agg[:30]
        elif self.agg_mode == "weekly":
            return self.weekly_agg[:12]
        else:
            return self.monthly_agg[:12]

    @rx.var
    def filtered_orders(self) -> List[OrderItem]:
        """フィルタリングされた発注リスト"""
        if not self.search_query:
            return self.orders[:100]
        query = self.search_query.lower()
        return [o for o in self.orders if query in o.name.lower()][:100]

    @rx.var
    def max_agg_total(self) -> int:
        """集計の最大値（グラフ用）"""
        agg = self.current_agg
        if not agg:
            return 1
        return max(item.total for item in agg) or 1

    async def fetch_orders(self):
        """Supabaseからnotion_ordersを取得"""
        self.loading = True
        self.error = ""
        print("[DEBUG] fetch_orders started, loading=True")

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/notion_orders",
                    headers={
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    },
                    params={
                        "select": "notion_id,properties,synced_at",
                        "order": "synced_at.desc",
                        "limit": "1000"
                    }
                )
                print(f"[DEBUG] API response: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    print(f"[DEBUG] Got {len(data)} records")
                    self._process_data(data)
                    print(f"[DEBUG] After process: orders={len(self.orders)}, monthly_agg={len(self.monthly_agg)}")
                else:
                    self.error = f"API Error: {response.status_code}"

        except Exception as e:
            self.error = f"Error: {str(e)}"
            print(f"[DEBUG] Exception: {e}")
        finally:
            self.loading = False
            print(f"[DEBUG] fetch_orders done, loading=False")

    def _process_data(self, data: list):
        """データを処理して集計"""
        items = []
        total = 0
        daily = defaultdict(lambda: {"count": 0, "total": 0})
        weekly = defaultdict(lambda: {"count": 0, "total": 0})
        monthly = defaultdict(lambda: {"count": 0, "total": 0})

        for row in data:
            props = row.get("properties", {})
            raw_amount = props.get("総支給額", 0) or 0

            try:
                amount = int(float(raw_amount))
            except (ValueError, TypeError):
                amount = 0

            total += amount

            date_str = str(props.get("申請日", "-") or "-")

            if date_str and date_str != "-":
                try:
                    dt = datetime.strptime(date_str, "%Y-%m-%d")
                    day_key = date_str
                    week_start = dt - timedelta(days=dt.weekday())
                    week_key = week_start.strftime("%Y-%m-%d")
                    month_key = dt.strftime("%Y-%m")

                    daily[day_key]["count"] += 1
                    daily[day_key]["total"] += amount
                    weekly[week_key]["count"] += 1
                    weekly[week_key]["total"] += amount
                    monthly[month_key]["count"] += 1
                    monthly[month_key]["total"] += amount
                except ValueError:
                    pass

            items.append(OrderItem(
                notion_id=row.get("notion_id", ""),
                name=str(props.get("発注決裁名", "-") or "-"),
                scope=str(props.get("職務範囲", "-") or "-"),
                amount=amount,
                date=date_str,
                status=str(props.get("発注ステータス", "-") or "-"),
                platform=str(props.get("発注/依頼媒体", "-") or "-"),
            ))

        self.orders = items
        self.total_count = len(items)
        self.total_amount = total
        self.avg_amount = total // len(items) if items else 0

        self.daily_agg = [
            AggregateItem(period=k, count=v["count"], total=v["total"])
            for k, v in sorted(daily.items(), reverse=True)
        ]
        self.weekly_agg = [
            AggregateItem(period=f"{k}週", count=v["count"], total=v["total"])
            for k, v in sorted(weekly.items(), reverse=True)
        ]
        self.monthly_agg = [
            AggregateItem(period=k, count=v["count"], total=v["total"])
            for k, v in sorted(monthly.items(), reverse=True)
        ]

    def set_agg_mode(self, mode):
        """集計モード切り替え"""
        self.agg_mode = mode

    def set_search(self, value: str):
        self.search_query = value


# ========== モダンUIコンポーネント ==========

def glass_card(*children, **props) -> rx.Component:
    """グラスモーフィズムカード"""
    return rx.box(
        *children,
        background="rgba(255, 255, 255, 0.8)",
        backdrop_filter="blur(20px)",
        border="1px solid rgba(255, 255, 255, 0.3)",
        border_radius="20px",
        box_shadow="0 8px 32px rgba(0, 0, 0, 0.08)",
        **props,
    )


def stat_card(title: str, value: rx.Var, subtitle: str, gradient: str, icon: str) -> rx.Component:
    """統計カード - グラデーション背景"""
    return rx.box(
        rx.vstack(
            rx.hstack(
                rx.box(
                    rx.icon(icon, size=24, color="white"),
                    padding="12px",
                    background="rgba(255, 255, 255, 0.2)",
                    border_radius="12px",
                ),
                rx.spacer(),
                rx.badge(
                    subtitle,
                    color_scheme="gray",
                    variant="surface",
                    size="1",
                ),
                width="100%",
            ),
            rx.text(
                value,
                font_size="32px",
                font_weight="700",
                color="white",
                letter_spacing="-0.02em",
            ),
            rx.text(
                title,
                font_size="14px",
                color="rgba(255, 255, 255, 0.8)",
                font_weight="500",
            ),
            spacing="3",
            align="start",
            width="100%",
        ),
        background=gradient,
        padding="24px",
        border_radius="20px",
        box_shadow="0 10px 40px rgba(0, 0, 0, 0.15)",
        min_width="280px",
        flex="1",
        transition="transform 0.2s ease, box-shadow 0.2s ease",
        _hover={
            "transform": "translateY(-4px)",
            "box_shadow": "0 20px 60px rgba(0, 0, 0, 0.2)",
        },
    )


def format_amount(amount: int) -> str:
    """金額フォーマット（カンマ付き）"""
    return f"¥{amount:,}"


def agg_bar(item: AggregateItem) -> rx.Component:
    """集計バー - モダン版"""
    pct = (item.total / State.max_agg_total * 100)

    return rx.hstack(
        rx.text(
            item.period,
            font_size="13px",
            font_weight="600",
            color="#374151",
            min_width="80px",
        ),
        rx.box(
            rx.box(
                rx.box(
                    height="100%",
                    width=pct.to_string() + "%",
                    background="linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                    border_radius="8px",
                    transition="width 0.5s ease",
                ),
                width="100%",
                height="100%",
                position="relative",
            ),
            flex="1",
            height="32px",
            background="linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)",
            border_radius="8px",
            overflow="hidden",
        ),
        rx.vstack(
            rx.text(
                "¥" + item.total.to(int).to_string(),
                font_size="14px",
                font_weight="700",
                color="#1f2937",
            ),
            rx.text(
                item.count.to_string() + "件",
                font_size="11px",
                color="#6b7280",
            ),
            spacing="0",
            align="end",
            min_width="100px",
        ),
        spacing="4",
        width="100%",
        padding="8px 12px",
        background="white",
        border_radius="12px",
        box_shadow="0 1px 3px rgba(0, 0, 0, 0.05)",
        transition="all 0.2s ease",
        _hover={
            "background": "#fafafa",
            "box_shadow": "0 4px 12px rgba(0, 0, 0, 0.08)",
        },
    )


def order_row(order: OrderItem) -> rx.Component:
    """発注行 - モダン版"""
    return rx.table.row(
        rx.table.cell(
            rx.hstack(
                rx.box(
                    width="8px",
                    height="8px",
                    border_radius="full",
                    background=rx.cond(
                        order.status == "発注済",
                        "#10b981",
                        "#9ca3af",
                    ),
                ),
                rx.text(
                    rx.cond(order.name.length() > 35, order.name[:35] + "...", order.name),
                    font_size="13px",
                    font_weight="500",
                    color="#1f2937",
                ),
                spacing="2",
            )
        ),
        rx.table.cell(
            rx.badge(
                order.scope,
                color_scheme="violet",
                variant="soft",
                radius="full",
                size="1",
            )
        ),
        rx.table.cell(
            rx.cond(
                order.amount > 0,
                rx.text(
                    "¥" + order.amount.to_string(),
                    font_size="13px",
                    font_weight="600",
                    color="#059669",
                ),
                rx.text("-", font_size="13px", color="#9ca3af"),
            ),
            text_align="right",
        ),
        rx.table.cell(
            rx.text(order.date, font_size="12px", color="#6b7280")
        ),
        rx.table.cell(
            rx.badge(
                order.status,
                color_scheme=rx.cond(order.status == "発注済", "green", "gray"),
                variant="soft",
                radius="full",
                size="1",
            )
        ),
        _hover={"background": "#f9fafb"},
    )


def index() -> rx.Component:
    """メインページ - モダンUI"""
    return rx.box(
        # ヘッダー
        rx.box(
            rx.hstack(
                rx.hstack(
                    rx.box(
                        rx.icon("bar-chart-3", size=24, color="white"),
                        padding="10px",
                        background="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        border_radius="12px",
                    ),
                    rx.vstack(
                        rx.text(
                            "経営ダッシュボード",
                            font_size="20px",
                            font_weight="700",
                            color="#1f2937",
                        ),
                        rx.text(
                            "Notion発注データ管理",
                            font_size="12px",
                            color="#6b7280",
                        ),
                        spacing="0",
                        align="start",
                    ),
                    spacing="3",
                ),
                rx.spacer(),
                rx.hstack(
                    rx.badge(
                        rx.hstack(
                            rx.box(
                                width="8px",
                                height="8px",
                                border_radius="full",
                                background="#10b981",
                            ),
                            rx.text("同期済み", font_size="12px"),
                            spacing="2",
                        ),
                        color_scheme="green",
                        variant="soft",
                        size="2",
                    ),
                    rx.button(
                        rx.icon("refresh-cw", size=16),
                        "更新",
                        size="2",
                        variant="soft",
                        color_scheme="violet",
                        on_click=State.fetch_orders,
                        loading=State.loading,
                        cursor="pointer",
                    ),
                    spacing="3",
                ),
                padding="20px 32px",
                width="100%",
            ),
            background="rgba(255, 255, 255, 0.9)",
            backdrop_filter="blur(20px)",
            border_bottom="1px solid rgba(0, 0, 0, 0.05)",
            position="sticky",
            top="0",
            z_index="100",
        ),

        # メインコンテンツ
        rx.box(
            # 統計カード
            rx.flex(
                stat_card(
                    "総発注件数",
                    State.total_count.to_string() + "件",
                    "Total Orders",
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    "file-text",
                ),
                stat_card(
                    "総支給額",
                    State.total_amount_formatted,
                    "Total Amount",
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    "banknote",
                ),
                stat_card(
                    "平均単価",
                    State.avg_amount_formatted,
                    "Average",
                    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    "trending-up",
                ),
                gap="24px",
                wrap="wrap",
                padding="32px",
            ),

            # 集計セクション
            glass_card(
                rx.vstack(
                    rx.hstack(
                        rx.hstack(
                            rx.icon("pie-chart", size=20, color="#6366f1"),
                            rx.text(
                                "コスト集計",
                                font_size="18px",
                                font_weight="700",
                                color="#1f2937",
                            ),
                            spacing="2",
                        ),
                        rx.spacer(),
                        rx.segmented_control.root(
                            rx.segmented_control.item("日次", value="daily"),
                            rx.segmented_control.item("週次", value="weekly"),
                            rx.segmented_control.item("月次", value="monthly"),
                            value=State.agg_mode,
                            on_change=State.set_agg_mode,
                            size="2",
                            radius="full",
                        ),
                        width="100%",
                        align="center",
                    ),
                    rx.divider(margin_y="16px"),
                    rx.cond(
                        State.loading,
                        rx.center(
                            rx.vstack(
                                rx.spinner(size="3"),
                                rx.text("読み込み中...", font_size="14px", color="#6b7280"),
                                spacing="3",
                            ),
                            padding="48px",
                        ),
                        rx.cond(
                            State.current_agg.length() > 0,
                            rx.vstack(
                                rx.foreach(State.current_agg, agg_bar),
                                spacing="2",
                                width="100%",
                            ),
                            rx.center(
                                rx.vstack(
                                    rx.icon("inbox", size=48, color="#d1d5db"),
                                    rx.text("データがありません", font_size="14px", color="#9ca3af"),
                                    spacing="2",
                                ),
                                padding="48px",
                            ),
                        ),
                    ),
                    spacing="4",
                    width="100%",
                ),
                padding="28px",
                margin="0 32px 24px 32px",
            ),

            # 発注一覧
            glass_card(
                rx.vstack(
                    rx.hstack(
                        rx.hstack(
                            rx.icon("list", size=20, color="#6366f1"),
                            rx.text(
                                "発注一覧",
                                font_size="18px",
                                font_weight="700",
                                color="#1f2937",
                            ),
                            spacing="2",
                        ),
                        rx.spacer(),
                        rx.hstack(
                            rx.input(
                                placeholder="検索...",
                                value=State.search_query,
                                on_change=State.set_search,
                                width="200px",
                                size="2",
                                radius="full",
                            ),
                            rx.badge(
                                State.filtered_orders.length().to_string() + "件表示",
                                color_scheme="gray",
                                variant="soft",
                                size="2",
                            ),
                            spacing="3",
                        ),
                        width="100%",
                        align="center",
                    ),
                    rx.cond(
                        State.error != "",
                        rx.callout(
                            State.error,
                            icon="triangle-alert",
                            color="red",
                            size="2",
                        ),
                    ),
                    rx.cond(
                        State.loading,
                        rx.center(
                            rx.vstack(
                                rx.spinner(size="3"),
                                rx.text("読み込み中...", font_size="14px", color="#6b7280"),
                                spacing="3",
                            ),
                            padding="48px",
                        ),
                        rx.box(
                            rx.table.root(
                                rx.table.header(
                                    rx.table.row(
                                        rx.table.column_header_cell(
                                            rx.text("発注決裁名", font_weight="600", color="#374151")
                                        ),
                                        rx.table.column_header_cell(
                                            rx.text("職務範囲", font_weight="600", color="#374151")
                                        ),
                                        rx.table.column_header_cell(
                                            rx.text("総支給額", font_weight="600", color="#374151"),
                                            text_align="right",
                                        ),
                                        rx.table.column_header_cell(
                                            rx.text("申請日", font_weight="600", color="#374151")
                                        ),
                                        rx.table.column_header_cell(
                                            rx.text("ステータス", font_weight="600", color="#374151")
                                        ),
                                    ),
                                ),
                                rx.table.body(
                                    rx.foreach(State.filtered_orders, order_row),
                                ),
                                width="100%",
                                size="2",
                            ),
                            overflow_x="auto",
                        ),
                    ),
                    spacing="4",
                    width="100%",
                ),
                padding="28px",
                margin="0 32px 32px 32px",
            ),

            background="linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
            min_height="calc(100vh - 80px)",
        ),

        on_mount=State.fetch_orders,
    )


app = rx.App(
    theme=rx.theme(
        appearance="light",
        accent_color="violet",
        radius="large",
    ),
    stylesheets=[
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    ],
)
app.add_page(index, title="経営ダッシュボード")
