import { useState } from 'react'
import type { PaginationState, Updater } from '@tanstack/react-table'

interface Options {
  initialPageSize?: number
  controlled?: PaginationState
  onChange?: (pagination: PaginationState) => void
}

interface Return {
  pagination: PaginationState
  onPaginationChange: (updater: Updater<PaginationState>) => void
}

export function useTablePagination({ initialPageSize = 10, controlled, onChange }: Options): Return {
  const [internal, setInternal] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const pagination = controlled ?? internal

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    if (!controlled) setInternal(next)
    onChange?.(next)
  }

  return { pagination, onPaginationChange }
}
