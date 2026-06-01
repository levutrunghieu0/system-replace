import { useState } from 'react'
import type { SortingState, Updater } from '@tanstack/react-table'

interface Options {
  controlled?: SortingState
  onChange?: (sorting: SortingState) => void
}

interface Return {
  sorting: SortingState
  onSortingChange: (updater: Updater<SortingState>) => void
}

export function useTableSorting({ controlled, onChange }: Options): Return {
  const [internal, setInternal] = useState<SortingState>([])

  const sorting = controlled ?? internal

  const onSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    if (!controlled) setInternal(next)
    onChange?.(next)
  }

  return { sorting, onSortingChange }
}
