import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import { Pagination, SimplePagination } from "@/components/ui/pagination"

const meta: Meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

export const Default: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1)
    return (
      <Pagination
        currentPage={page}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={setPage}
        onPageSizeChange={(size) => console.log("Page size:", size)}
      />
    )
  },
}

export const ManyPages: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(5)
    return (
      <Pagination
        currentPage={page}
        totalPages={50}
        totalItems={500}
        pageSize={10}
        onPageChange={setPage}
        onPageSizeChange={(size) => console.log("Page size:", size)}
      />
    )
  },
}

export const FewPages: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1)
    return (
      <Pagination
        currentPage={page}
        totalPages={3}
        totalItems={25}
        pageSize={10}
        onPageChange={setPage}
        onPageSizeChange={(size) => console.log("Page size:", size)}
      />
    )
  },
}

export const WithoutPageSize: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1)
    return (
      <Pagination
        currentPage={page}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={setPage}
        showPageSize={false}
      />
    )
  },
}

export const WithoutItemCount: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1)
    return (
      <Pagination
        currentPage={page}
        totalPages={10}
        onPageChange={setPage}
        showItemCount={false}
        showPageSize={false}
      />
    )
  },
}

export const WithoutFirstLast: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(5)
    return (
      <Pagination
        currentPage={page}
        totalPages={20}
        totalItems={200}
        pageSize={10}
        onPageChange={setPage}
        showFirstLast={false}
      />
    )
  },
}

export const CustomPageSizes: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(25)
    return (
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(1000 / pageSize)}
        totalItems={1000}
        pageSize={pageSize}
        pageSizeOptions={[25, 50, 100, 250]}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    )
  },
}

// Simple pagination
export const Simple: StoryObj<typeof SimplePagination> = {
  render: () => {
    const [page, setPage] = React.useState(1)
    return (
      <SimplePagination
        currentPage={page}
        totalPages={10}
        onPageChange={setPage}
      />
    )
  },
}

export const SimpleAtEnd: StoryObj<typeof SimplePagination> = {
  render: () => {
    const [page, setPage] = React.useState(10)
    return (
      <SimplePagination
        currentPage={page}
        totalPages={10}
        onPageChange={setPage}
      />
    )
  },
}
