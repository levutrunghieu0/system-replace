# Prompt tạo project Frontend với Vite React TypeScript, MUI v9, TanStack Router, TanStack Query và TanStack Table

Bạn là Senior Frontend Architect chuyên React, TypeScript, Vite, Material UI, TanStack Router, TanStack Query và TanStack Table.

Hãy tạo cho tôi một project frontend production-ready với yêu cầu sau.

---

## 1. Tech stack bắt buộc

Sử dụng các công nghệ sau:

- Vite
- React
- TypeScript
- Material UI version `9.0.1`
- `@mui/icons-material` version tương thích với MUI `9.0.1`
- Emotion theo setup mặc định của MUI
- TanStack Router
- TanStack Query
- TanStack Table
- TanStack Query Devtools chỉ bật trong development
- ESLint
- TypeScript strict mode

Không sử dụng:

- Tailwind CSS
- React Router DOM
- Redux cho server state
- MUI X Data Grid
- AG Grid
- Material React Table

---

## 2. Mục tiêu kiến trúc

Project cần được thiết kế theo hướng:

- Production-ready
- Dễ maintain
- Dễ mở rộng
- Có cấu trúc rõ ràng
- Tập trung mạnh vào Material UI
- Có thể phát triển thành internal UI library/design system sau này
- Có shared table component dùng chung toàn hệ thống
- Không viết logic business trực tiếp trong UI component dùng chung
- Không fetch API trực tiếp trong component page nếu logic đó thuộc server state

---

## 3. Yêu cầu về Material UI

Tập trung xây dựng project theo hướng có thể custom theme MUI sâu và mở rộng thành UI library nội bộ sau này.

Bắt buộc:

- Sử dụng `ThemeProvider` từ `@mui/material/styles`
- Sử dụng `createTheme`
- Bật CSS variables bằng:

```ts
createTheme({
  cssVariables: true,
});
```

- Không sử dụng API cũ/experimental như:
  - `CssVarsProvider`
  - `Experimental_CssVarsProvider`

Tổ chức theme theo module rõ ràng:

```txt
src/
  theme/
    index.ts
    palette.ts
    typography.ts
    shape.ts
    shadows.ts
    components.ts
    components/
      button.ts
      textField.ts
      card.ts
      appBar.ts
      table.ts
```

Bắt buộc có override cho ít nhất:

- `MuiButton`
- `MuiTextField`
- `MuiCard`
- `MuiAppBar`
- `MuiTable`
- `MuiTableCell`
- `MuiTableRow`
- `MuiCheckbox`
- `MuiTablePagination`

Theme phải hỗ trợ:

- Light mode
- Dark mode nếu MUI v9 hỗ trợ ổn định
- CSS variables
- Custom design tokens theo hướng type-safe nếu cần
- Sử dụng `theme.vars` hoặc CSS variables generated từ MUI nếu phù hợp

Không được hard-code màu như:

```ts
'#1976d2'
'#333'
'#fff'
```

Ưu tiên dùng:

```ts
theme.palette
theme.typography
theme.spacing
theme.shape
theme.vars
```

---

## 4. Rule import MUI bắt buộc

Tuyệt đối tuân thủ import theo direct path để tối ưu bundle và đúng convention của project.

Đúng:

```ts
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
```

Sai, không được dùng:

```ts
import { Button, Box, Typography } from '@mui/material';
import { Home } from '@mui/icons-material';
```

Hãy đảm bảo toàn bộ source code được generate đều tuân thủ rule này.

Lưu ý với TanStack Table:

```ts
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type {
  ColumnDef,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
```

---

## 5. TanStack Router

Setup TanStack Router theo hướng file-based routing với Vite.

Bắt buộc:

- Cài và cấu hình `@tanstack/router-plugin`
- Trong `vite.config.ts`, plugin `tanstackRouter()` phải nằm trước `react()`
- Route directory là `src/routes`
- Generated route tree là `src/routeTree.gen.ts`
- Có ít nhất các route:
  - `/`
  - `/about`
  - `/users`
  - `/users/$userId`

Root layout dùng MUI:

- AppBar
- Drawer hoặc navigation sidebar đơn giản
- Main content area

Navigation:

- Có navigation bằng `Link` của TanStack Router
- Không dùng React Router DOM

---

## 6. TanStack Query

Setup TanStack Query chuẩn trong source.

Bắt buộc:

- Tạo `src/lib/queryClient.ts`
- Sử dụng `QueryClient`
- Wrap app bằng `QueryClientProvider`
- Có default options hợp lý:
  - `staleTime`
  - `retry`
  - `refetchOnWindowFocus`

Có ví dụ custom hook:

```txt
src/features/users/api/useUsersQuery.ts
src/features/users/api/useUserQuery.ts
```

Có mock API layer:

```txt
src/services/httpClient.ts
src/features/users/api/usersApi.ts
```

Quy tắc:

- Không fetch trực tiếp trong component nếu logic thuộc server state
- Component chỉ gọi custom hook
- API response phải có type rõ ràng
- Loading/error/empty state phải được xử lý rõ

---

## 7. TanStack Table + MUI Shared Component

### 7.1 Mục tiêu

Không sử dụng trực tiếp TanStack Table hoặc MUI Table trong các màn hình nghiệp vụ.

Toàn bộ màn hình cần hiển thị table phải sử dụng component chung:

```tsx
<AppTable />
```

Component này sẽ là foundation table của toàn bộ hệ thống.

Kiến trúc mong muốn:

```txt
TanStack Table
      +
MUI Table Components
      +
AppTable Wrapper
```

Mục tiêu của `AppTable`:

- Reusable
- Generic
- Type-safe
- Scalable
- Có thể dùng cho nhiều entity khác nhau
- Có thể mở rộng thành package nội bộ trong tương lai
- Không phụ thuộc business logic cụ thể
- Không fetch API bên trong table
- Không hard-code domain như users, products, orders trong AppTable

Có thể tái sử dụng cho:

```txt
Users
Roles
Permissions
Products
Orders
Customers
Employees
Organizations
```

### 7.2 Dependency

Cài TanStack Table:

```bash
npm install @tanstack/react-table
```

Không dùng:

```bash
@mui/x-data-grid
ag-grid-react
material-react-table
```

### 7.3 Folder structure cho shared table

Tạo folder table như sau:

```txt
src/
  components/
    table/
      AppTable.tsx
      AppTableToolbar.tsx
      AppTablePagination.tsx
      AppTableEmpty.tsx
      AppTableLoading.tsx
      AppTableError.tsx
      AppTableColumnToggle.tsx
      AppTableGlobalFilter.tsx
      AppTableSelectionActions.tsx
      AppTableContainer.tsx
      index.ts

      hooks/
        useDebouncedValue.ts
        useTablePagination.ts
        useTableSorting.ts

      types/
        table.ts
```

### 7.4 AppTable Generic TypeScript API

Thiết kế `AppTable` theo Generic TypeScript.

Ví dụ sử dụng:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
/>
```

Interface đề xuất:

```ts
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';

export interface AppTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];

  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  emptyMessage?: string;

  pagination?: boolean;
  sorting?: boolean;
  searchable?: boolean;
  columnVisibility?: boolean;
  rowSelection?: boolean;

  pageSizeOptions?: number[];
  initialPageSize?: number;

  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  totalRows?: number;

  state?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    rowSelection?: RowSelectionState;
    columnVisibility?: VisibilityState;
    globalFilter?: string;
  };

  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
  onGlobalFilterChange?: (value: string) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;

  getRowId?: (row: TData, index: number) => string;
  onRowClick?: (row: TData) => void;

  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;

  dense?: boolean;
  stickyHeader?: boolean;
}
```

Yêu cầu:

- Không dùng `any`
- Không dùng `React.FC`
- Generic phải hoạt động đúng với mọi entity
- `columns` phải dùng `ColumnDef<TData>[]`
- `data` phải dùng `TData[]`
- Hỗ trợ controlled và uncontrolled state ở mức cơ bản
- Không được để AppTable phụ thuộc vào feature cụ thể

---

## 8. Table features bắt buộc

`AppTable` phải hỗ trợ các tính năng sau.

### Sorting

Cho phép bật/tắt sorting:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
  sorting
/>
```

Dùng TanStack Table:

```ts
getSortedRowModel()
```

UI:

- Header cell có thể click để sort
- Hiển thị icon sort bằng MUI icons
- Hỗ trợ sort asc/desc/none

### Pagination

Cho phép bật/tắt pagination:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
  pagination
/>
```

UI:

- Dùng `TablePagination` của MUI
- Hỗ trợ page size options
- Default page size cấu hình được
- Có thể mở rộng manual pagination cho server-side table

Dùng TanStack Table:

```ts
getPaginationRowModel()
```

### Global Search

Cho phép bật/tắt global search:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
  searchable
/>
```

UI:

- Dùng `TextField` của MUI
- Có search icon
- Có debounce để tránh update liên tục
- Tách thành component `AppTableGlobalFilter`

Dùng TanStack Table:

```ts
getFilteredRowModel()
```

### Column Visibility

Cho phép bật/tắt ẩn hiện cột:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
  columnVisibility
/>
```

UI:

- Có button mở menu
- Dùng `Menu`, `MenuItem`, `Checkbox`, `ListItemText` của MUI
- Tách thành component `AppTableColumnToggle`
- Không cho ẩn tất cả cột nếu điều đó làm table không còn cột nào hiển thị

### Row Selection

Cho phép bật/tắt chọn row:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
  rowSelection
/>
```

UI:

- Hiển thị checkbox ở header để select all
- Hiển thị checkbox ở mỗi row
- Dùng `Checkbox` của MUI
- Có thể lấy selected rows từ state
- Tách selection action thành `AppTableSelectionActions`

### Loading State

Khi loading:

```tsx
<AppTable<User>
  data={[]}
  columns={columns}
  loading
/>
```

Hiển thị:

```tsx
<AppTableLoading />
```

Yêu cầu:

- Dùng `Skeleton` của MUI
- Skeleton phải render theo số cột hiện có
- Có thể truyền số dòng skeleton mặc định là 5

### Empty State

Khi không có data:

```tsx
<AppTableEmpty />
```

Yêu cầu:

- Hiển thị message thân thiện
- Có thể custom bằng `emptyMessage`
- Không hiển thị empty state khi đang loading

### Error State

Khi lỗi:

```tsx
<AppTableError />
```

Yêu cầu:

- Hiển thị message lỗi thân thiện
- Có thể custom bằng `errorMessage`
- Không crash app khi data undefined/null
- AppTable vẫn phải nhận `data={[]}` từ bên ngoài

### Row Click

Cho phép truyền:

```tsx
onRowClick={(row) => {
  // navigate detail
}}
```

Yêu cầu:

- Row có cursor pointer nếu có `onRowClick`
- Không trigger row click khi click vào checkbox selection
- Không trigger row click khi click vào action button trong cell nếu có stopPropagation

---

## 9. Server-side ready

Thiết kế AppTable để có thể mở rộng server-side mode trong tương lai:

```tsx
<AppTable<User>
  data={users}
  columns={columns}
  pagination
  sorting
  searchable
  manualPagination
  manualSorting
  manualFiltering
  totalRows={1000}
  state={{
    pagination,
    sorting,
    globalFilter,
  }}
  onPaginationChange={setPagination}
  onSortingChange={setSorting}
  onGlobalFilterChange={setGlobalFilter}
/>
```

Yêu cầu:

- Có props `manualPagination`
- Có props `manualSorting`
- Có props `manualFiltering`
- Có props `totalRows`
- Không cần implement API server-side thật trong demo
- Nhưng API design phải sẵn sàng để mở rộng

---

## 10. AppTable không được làm gì

`AppTable` không được:

- Fetch API
- Gọi TanStack Query trực tiếp
- Biết về route
- Biết về entity cụ thể
- Biết về business rule
- Hard-code column của users/products/orders
- Dùng `any`
- Dùng `React.FC`
- Dùng MUI Data Grid
- Dùng Material React Table
- Dùng AG Grid

---

## 11. Cấu trúc source mong muốn

Hãy tạo cấu trúc source như sau:

```txt
src/
  app/
    App.tsx
    AppProviders.tsx

  components/
    common/
      PageHeader.tsx
      LoadingState.tsx
      ErrorState.tsx
      EmptyState.tsx

    layout/
      AppLayout.tsx
      AppNavigation.tsx

    table/
      AppTable.tsx
      AppTableToolbar.tsx
      AppTablePagination.tsx
      AppTableEmpty.tsx
      AppTableLoading.tsx
      AppTableError.tsx
      AppTableColumnToggle.tsx
      AppTableGlobalFilter.tsx
      AppTableSelectionActions.tsx
      AppTableContainer.tsx
      index.ts
      hooks/
        useDebouncedValue.ts
        useTablePagination.ts
        useTableSorting.ts
      types/
        table.ts

  features/
    users/
      api/
        usersApi.ts
        useUsersQuery.ts
        useUserQuery.ts
      components/
        UserList.tsx
        UserDetail.tsx
      types/
        user.ts

  lib/
    queryClient.ts

  routes/
    __root.tsx
    index.tsx
    about.tsx
    users.tsx
    users.$userId.tsx

  services/
    httpClient.ts

  theme/
    index.ts
    palette.ts
    typography.ts
    shape.ts
    shadows.ts
    components.ts
    components/
      button.ts
      textField.ts
      card.ts
      appBar.ts
      table.ts

  main.tsx
  vite-env.d.ts
```

---

## 12. AppProviders

Tạo `AppProviders.tsx` để gom toàn bộ provider:

- React StrictMode nằm ở `main.tsx`
- `ThemeProvider`
- `CssBaseline`
- `QueryClientProvider`
- `RouterProvider`
- ReactQueryDevtools chỉ render khi development

Yêu cầu code rõ ràng, dễ maintain.

---

## 13. UI demo bắt buộc

Tạo giao diện demo đơn giản nhưng sạch sẽ bằng MUI.

Bắt buộc có:

- Layout có AppBar
- Navigation menu có icon từ `@mui/icons-material`
- Home page có card giới thiệu tech stack
- About page có typography demo
- Users page hiển thị danh sách users bằng `AppTable`
- User detail page fetch user theo `userId`
- Có loading state
- Có error state
- Có empty state nếu không có data

---

## 14. Users Page Example với AppTable

Trong `Users Page`, bắt buộc dùng flow sau:

```tsx
const { data, isLoading, isError } = useUsersQuery();
```

Khai báo columns:

```tsx
import type { ColumnDef } from '@tanstack/react-table';

import type { User } from '../types/user';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];
```

Render:

```tsx
<AppTable<User>
  data={data ?? []}
  columns={columns}
  loading={isLoading}
  error={isError}
  pagination
  sorting
  searchable
  columnVisibility
  rowSelection
  onRowClick={(user) => {
    // navigate to /users/$userId
  }}
/>
```

Yêu cầu:

- Page không tự implement table UI
- Page chỉ khai báo columns và truyền data vào `AppTable`
- Data fetching thông qua TanStack Query
- Navigate detail bằng TanStack Router
- Không dùng React Router DOM

---

## 15. TypeScript yêu cầu

- Không dùng `any`
- Không dùng `React.FC`
- Tạo type/interface rõ ràng
- `strict: true`
- Route params phải type-safe theo TanStack Router
- API response phải có type
- Custom hook phải return type rõ ràng nếu cần
- Generic component phải type-safe
- Không suppress TypeScript error bằng `as any`
- Không dùng `// @ts-ignore`
- Không dùng `// @ts-expect-error` trừ khi có lý do rất rõ

---

## 16. Performance yêu cầu

Với AppTable:

- Ưu tiên performance cho bảng trên 1000 records
- Dùng `useMemo` cho columns/data nếu cần ở page-level
- Không tạo function/object không cần thiết trong loop lớn
- Chia nhỏ component hợp lý
- Có thể dùng `React.memo` khi phù hợp
- Không optimize quá sớm gây phức tạp code
- Không cần virtual scroll ở phiên bản đầu tiên, nhưng thiết kế không được khóa đường mở rộng virtual scroll sau này

---

## 17. Output tôi muốn nhận

Hãy trả về đầy đủ:

1. Lệnh tạo project bằng Vite React TypeScript
2. Lệnh cài dependencies chính xác
3. Nội dung `vite.config.ts`
4. Nội dung `tsconfig.json` nếu cần chỉnh
5. Toàn bộ file source quan trọng theo cấu trúc trên
6. Full implementation của shared `AppTable`
7. Full implementation của:
   - `AppTableToolbar`
   - `AppTablePagination`
   - `AppTableEmpty`
   - `AppTableLoading`
   - `AppTableError`
   - `AppTableColumnToggle`
   - `AppTableGlobalFilter`
   - `AppTableSelectionActions`
8. Ví dụ `Users Page` sử dụng `AppTable`
9. Giải thích ngắn gọn cách chạy project
10. Checklist xác nhận:
    - MUI v9.0.1 đã được dùng
    - CSS variables đã bật
    - MUI import đúng direct path
    - TanStack Router đã setup
    - TanStack Query đã setup
    - TanStack Table đã setup
    - Có MUI icons
    - Có theme override theo component
    - Có shared AppTable generic type-safe
    - Không dùng barrel import từ `@mui/material`
    - Không dùng MUI X Data Grid
    - Không dùng Material React Table
    - Không dùng AG Grid

---

## 18. Quy tắc chất lượng code

- Code phải chạy được sau khi copy vào project
- Không viết pseudo-code
- Không bỏ sót import
- Không dùng placeholder kiểu `TODO implement later`
- Ưu tiên clean architecture đơn giản
- Tên file, tên folder phải đúng như cấu trúc yêu cầu
- Component phải nhỏ, rõ trách nhiệm
- Theme phải dễ mở rộng thành design system nội bộ
- Shared component phải độc lập với business logic
- Nếu có điểm nào trong MUI v9 khác với version cũ, hãy dùng API mới nhất của MUI v9
- Nếu có lựa chọn kỹ thuật cần cân nhắc, hãy giải thích ngắn gọn lý do chọn giải pháp đó

---

## 19. Kết quả kỳ vọng

Sau khi generate project, tôi kỳ vọng có thể chạy:

```bash
npm install
npm run dev
```

Và thấy ứng dụng có:

- Layout MUI
- Navigation
- Home page
- About page
- Users page
- User detail page
- Users table dùng shared `AppTable`
- Table có sorting
- Table có pagination
- Table có global search
- Table có column visibility
- Table có row selection
- Loading/empty/error state
- Theme MUI custom tốt
- CSS variables đã được bật
- Code TypeScript strict, clean và dễ mở rộng
