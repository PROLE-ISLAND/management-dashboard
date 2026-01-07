import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ColDef } from "ag-grid-community"

import { DataTable, CurrencyCell, PercentageCell, StatusCell, type DataTableProps } from "@/components/ui/data-table"

interface SampleData {
  id: string
  name: string
  category: string
  amount: number
  change: number
  status: string
  date: string
}

const sampleData: SampleData[] = [
  { id: "1", name: "プロジェクトA", category: "開発", amount: 1500000, change: 12.5, status: "active", date: "2024-01-15" },
  { id: "2", name: "プロジェクトB", category: "マーケティング", amount: 800000, change: -5.2, status: "pending", date: "2024-01-12" },
  { id: "3", name: "プロジェクトC", category: "デザイン", amount: 450000, change: 8.3, status: "active", date: "2024-01-10" },
  { id: "4", name: "プロジェクトD", category: "開発", amount: 2200000, change: 25.1, status: "active", date: "2024-01-08" },
  { id: "5", name: "プロジェクトE", category: "営業", amount: 320000, change: -12.8, status: "inactive", date: "2024-01-05" },
  { id: "6", name: "プロジェクトF", category: "開発", amount: 980000, change: 3.2, status: "active", date: "2024-01-03" },
  { id: "7", name: "プロジェクトG", category: "サポート", amount: 150000, change: 0, status: "pending", date: "2024-01-01" },
  { id: "8", name: "プロジェクトH", category: "マーケティング", amount: 670000, change: 15.7, status: "active", date: "2023-12-28" },
]

const columns: ColDef<SampleData>[] = [
  { field: "name", headerName: "プロジェクト名", flex: 1, minWidth: 150 },
  { field: "category", headerName: "カテゴリ", width: 140 },
  {
    field: "amount",
    headerName: "金額",
    width: 150,
    cellRenderer: (params: { value: number }) => <CurrencyCell value={params.value} />,
  },
  {
    field: "change",
    headerName: "変動率",
    width: 120,
    cellRenderer: (params: { value: number }) => <PercentageCell value={params.value} />,
  },
  {
    field: "status",
    headerName: "ステータス",
    width: 120,
    cellRenderer: (params: { value: string }) => <StatusCell value={params.value} />,
  },
  { field: "date", headerName: "日付", width: 120 },
]

const meta: Meta<DataTableProps<SampleData>> = {
  title: "Data Display/DataTable",
  component: DataTable<SampleData>,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<DataTableProps<SampleData>>

export const Default: Story = {
  render: () => (
    <DataTable<SampleData>
      data={sampleData}
      columns={columns}
      height={400}
    />
  ),
}

export const Editable: Story = {
  render: () => {
    const editableColumns = columns.map((col) => ({
      ...col,
      editable: col.field === "name" || col.field === "category",
    }))
    return (
      <DataTable<SampleData>
        data={sampleData}
        columns={editableColumns}
        editable
        height={400}
      />
    )
  },
}

export const WithRowSelection: Story = {
  render: () => {
    const selectionColumns: ColDef<SampleData>[] = [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: "left",
      },
      ...columns,
    ]
    return (
      <DataTable<SampleData>
        data={sampleData}
        columns={selectionColumns}
        rowSelection="multiple"
        height={400}
      />
    )
  },
}

export const Loading: Story = {
  render: () => (
    <DataTable<SampleData>
      data={[]}
      columns={columns}
      loading
      height={400}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <DataTable<SampleData>
      data={[]}
      columns={columns}
      height={400}
    />
  ),
}

export const LargeDataset: Story = {
  render: () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: String(i + 1),
      name: `プロジェクト ${i + 1}`,
      category: ["開発", "マーケティング", "デザイン", "営業", "サポート"][i % 5],
      amount: Math.floor(Math.random() * 3000000) + 100000,
      change: Math.random() * 40 - 20,
      status: ["active", "pending", "inactive"][i % 3],
      date: new Date(2024, 0, Math.floor(Math.random() * 31) + 1).toISOString().split("T")[0],
    }))
    return (
      <DataTable<SampleData>
        data={largeData}
        columns={columns}
        height={500}
        pageSize={20}
      />
    )
  },
}

export const NoPagination: Story = {
  render: () => (
    <DataTable<SampleData>
      data={sampleData.slice(0, 5)}
      columns={columns}
      pagination={false}
      height={300}
    />
  ),
}
