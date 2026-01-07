"""経営ダッシュボード - Notion発注データ表示（集計機能付き）"""

import reflex as rx
import httpx
from typing import List
from pydantic import BaseModel
from collections import defaultdict
from datetime import datetime, timedelta

# Supabase設定
SUPABASE_URL = "https://rvhoveymacotfyyignba.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2aG92ZXltYWNvdGZ5eWlnbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjE0NjYsImV4cCI6MjA4MzMzNzQ2Nn0.-diBq2LtI_zHhHra4754-p12vlGvr9_8qvmehySiPm4"


def format_yen(amount: float) -> str:
    """金額を整数・カンマ付きで表示（遵守事項）"""
    return f"¥{int(amount):,}"


class OrderItem(BaseModel):
    """発注アイテム"""
    notion_id: str = ""
    name: str = ""
    scope: str = ""
    amount: int = 0  # 整数で保持
    date: str = ""
    status: str = ""
    platform: str = ""


class AggregateItem(BaseModel):
    """集計アイテム"""
    period: str = ""  # 期間ラベル
    count: int = 0
    total: int = 0  # 整数で保持


class State(rx.State):
    """アプリケーション状態"""

    orders: List[OrderItem] = []
    daily_agg: List[AggregateItem] = []
    weekly_agg: List[AggregateItem] = []
    monthly_agg: List[AggregateItem] = []

    loading: bool = True
    error: str = ""
    total_count: int = 0
    total_amount: int = 0  # 整数
    avg_amount: int = 0  # 整数

    agg_mode: str = "monthly"  # daily, weekly, monthly
    search_query: str = ""

    @rx.var
    def current_agg(self) -> List[AggregateItem]:
        """現在選択中の集計データ"""
        if self.agg_mode == "daily":
            return self.daily_agg[:30]  # 直近30日
        elif self.agg_mode == "weekly":
            return self.weekly_agg[:12]  # 直近12週
        else:
            return self.monthly_agg[:12]  # 直近12ヶ月

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

                if response.status_code == 200:
                    data = response.json()
                    self._process_data(data)
                else:
                    self.error = f"API Error: {response.status_code}"

        except Exception as e:
            self.error = f"Error: {str(e)}"
        finally:
            self.loading = False

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

            # 集計用の日付解析
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

        # 集計データをソート
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


def stat_card(title: str, value: rx.Var, icon: str, color: str) -> rx.Component:
    """統計カード"""
    return rx.box(
        rx.hstack(
            rx.center(
                rx.icon(icon, size=22, color=f"var(--{color}-11)"),
                width="44px",
                height="44px",
                border_radius="lg",
                background=f"var(--{color}-3)",
            ),
            rx.vstack(
                rx.text(title, size="1", color="gray", weight="medium"),
                rx.text(value, size="5", weight="bold"),
                spacing="0",
                align="start",
            ),
            spacing="3",
        ),
        padding="4",
        border_radius="lg",
        background="white",
        border="1px solid var(--gray-4)",
        flex="1",
        min_width="200px",
    )


def agg_bar(item: AggregateItem) -> rx.Component:
    """集計バー"""
    pct = (item.total / State.max_agg_total * 100)

    return rx.hstack(
        rx.text(item.period, size="2", min_width="90px", weight="medium"),
        rx.box(
            rx.box(
                height="100%",
                width=pct.to_string() + "%",
                background="linear-gradient(90deg, var(--blue-9), var(--blue-7))",
                border_radius="md",
            ),
            flex="1",
            height="28px",
            background="var(--gray-3)",
            border_radius="md",
            overflow="hidden",
        ),
        rx.text(
            "¥" + item.total.to(int).to_string(),
            size="2",
            weight="medium",
            min_width="100px",
            text_align="right",
        ),
        rx.text(
            item.count.to_string() + "件",
            size="1",
            color="gray",
            min_width="50px",
            text_align="right",
        ),
        spacing="3",
        width="100%",
        padding_y="1",
    )


def order_row(order: OrderItem) -> rx.Component:
    """発注行"""
    return rx.table.row(
        rx.table.cell(
            rx.text(
                rx.cond(order.name.length() > 40, order.name[:40] + "...", order.name),
                size="2",
            )
        ),
        rx.table.cell(rx.badge(order.scope, size="1", variant="soft")),
        rx.table.cell(
            rx.cond(
                order.amount > 0,
                rx.text("¥" + order.amount.to_string(), size="2", weight="medium"),
                rx.text("-", size="2", color="gray"),
            ),
            text_align="right",
        ),
        rx.table.cell(rx.text(order.date, size="2", color="gray")),
        rx.table.cell(
            rx.badge(
                order.status,
                size="1",
                color=rx.cond(order.status == "発注済", "green", "gray"),
            )
        ),
        _hover={"background": "var(--gray-2)"},
    )


def index() -> rx.Component:
    """メインページ"""
    return rx.box(
        # ヘッダー
        rx.hstack(
            rx.hstack(
                rx.icon("layout-dashboard", size=26, color="var(--blue-11)"),
                rx.heading("経営ダッシュボード", size="6", weight="bold"),
                spacing="2",
            ),
            rx.spacer(),
            rx.hstack(
                rx.color_mode.button(variant="ghost", size="2"),
                rx.button(
                    rx.icon("refresh-cw", size=14),
                    "更新",
                    size="2",
                    variant="soft",
                    on_click=State.fetch_orders,
                    loading=State.loading,
                ),
                spacing="2",
            ),
            padding="4",
            border_bottom="1px solid var(--gray-4)",
            background="white",
        ),

        # メインコンテンツ
        rx.box(
            # 統計カード
            rx.flex(
                stat_card(
                    "総発注件数",
                    State.total_count.to_string() + "件",
                    "file-text",
                    "blue",
                ),
                stat_card(
                    "総支給額",
                    "¥" + State.total_amount.to_string(),
                    "banknote",
                    "green",
                ),
                stat_card(
                    "平均単価",
                    "¥" + State.avg_amount.to_string(),
                    "calculator",
                    "purple",
                ),
                gap="4",
                wrap="wrap",
                padding="4",
            ),

            # 集計セクション
            rx.box(
                rx.vstack(
                    rx.hstack(
                        rx.heading("コスト集計", size="4", weight="bold"),
                        rx.spacer(),
                        rx.segmented_control.root(
                            rx.segmented_control.item("日次", value="daily"),
                            rx.segmented_control.item("週次", value="weekly"),
                            rx.segmented_control.item("月次", value="monthly"),
                            value=State.agg_mode,
                            on_change=State.set_agg_mode,
                            size="1",
                        ),
                        width="100%",
                    ),
                    rx.divider(),
                    rx.cond(
                        State.loading,
                        rx.center(rx.spinner(size="2"), padding="6"),
                        rx.cond(
                            State.current_agg.length() > 0,
                            rx.vstack(
                                rx.foreach(State.current_agg, agg_bar),
                                spacing="1",
                                width="100%",
                            ),
                            rx.center(
                                rx.text("データがありません", color="gray"),
                                padding="6",
                            ),
                        ),
                    ),
                    spacing="3",
                    width="100%",
                ),
                padding="4",
                margin="4",
                background="white",
                border_radius="lg",
                border="1px solid var(--gray-4)",
            ),

            # 検索 & テーブル
            rx.box(
                rx.vstack(
                    rx.hstack(
                        rx.heading("発注一覧", size="4", weight="bold"),
                        rx.spacer(),
                        rx.input(
                            placeholder="検索...",
                            value=State.search_query,
                            on_change=State.set_search,
                            width="200px",
                            size="2",
                        ),
                        rx.text(
                            State.filtered_orders.length().to_string() + "件",
                            size="2",
                            color="gray",
                        ),
                        width="100%",
                        align="center",
                    ),
                    rx.cond(
                        State.error != "",
                        rx.callout(State.error, icon="triangle_alert", color="red"),
                    ),
                    rx.cond(
                        State.loading,
                        rx.center(
                            rx.vstack(
                                rx.spinner(size="2"),
                                rx.text("読み込み中...", size="2", color="gray"),
                            ),
                            padding="8",
                        ),
                        rx.box(
                            rx.table.root(
                                rx.table.header(
                                    rx.table.row(
                                        rx.table.column_header_cell("発注決裁名"),
                                        rx.table.column_header_cell("職務範囲"),
                                        rx.table.column_header_cell("総支給額", text_align="right"),
                                        rx.table.column_header_cell("申請日"),
                                        rx.table.column_header_cell("ステータス"),
                                    ),
                                ),
                                rx.table.body(
                                    rx.foreach(State.filtered_orders, order_row),
                                ),
                                width="100%",
                                size="1",
                            ),
                            overflow_x="auto",
                        ),
                    ),
                    spacing="3",
                    width="100%",
                ),
                padding="4",
                margin="4",
                background="white",
                border_radius="lg",
                border="1px solid var(--gray-4)",
            ),

            background="var(--gray-2)",
            min_height="calc(100vh - 60px)",
        ),

        on_mount=State.fetch_orders,
    )


app = rx.App(
    theme=rx.theme(appearance="light", accent_color="blue", radius="medium"),
)
app.add_page(index, title="経営ダッシュボード")
