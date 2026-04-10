# Component Reference: quorix-vietnam

> Tài liệu này ghi lại tất cả Quorix UI classes và data attributes thực tế đang dùng trong project này.
> Cập nhật lần cuối: Phase 6 — 2026-04-10

## Layout Classes

| Class | Dùng ở đâu | Mô tả |
|-------|-----------|-------|
| `qx-container-lg` | `baseof.html`, `footer.html`, `header.html` | Container chính tối đa ~1400px |
| `qx-container-prose` | `posts/single.html`, `services/single.html` | Container nội dung bài viết (~65ch) |
| `qx-app-main` | `baseof.html` | Main content area |
| `qx-grid-2` | `index.html`, `posts/list.html`, `services/list.html`, `taxonomy-hub.html` | Grid 2 cột |
| `qx-grid-3` | `index.html`, `posts/single.html`, `posts/list.html`, `projects/list.html`, `taxonomy.html` | Grid 3 cột |
| `qx-navbar` | `header.html` | Navbar container |
| `qx-navbar-glass` | `header.html` | Glassmorphism effect cho navbar |
| `qx-navbar-brand` | `header.html` | Logo/brand area |
| `qx-navbar-nav` | `header.html` | Navigation links container |
| `qx-navbar-link` | `header.html` | Individual nav link |
| `qx-breadcrumbs` | `breadcrumbs.html` | Breadcrumb container |
| `qx-breadcrumb-item` | `breadcrumbs.html` | Individual breadcrumb |
| `qx-pagination` | `posts/list.html`, `taxonomy.html` | Pagination container |
| `qx-page-btn` | `posts/list.html`, `taxonomy.html` | Page button |

## Flex & Grid Helpers

| Class | Dùng ở đâu |
|-------|-----------|
| `qx-d-grid` | Khắp nơi |
| `qx-d-flex` | Khắp nơi |
| `qx-d-none` | Tab panes (nếu dùng tabs) |
| `qx-d-inline` | Chưa dùng |
| `qx-flex-between` | `index.html`, `posts/list.html`, `projects/list.html`, `taxonomy.html` |
| `qx-flex-wrap` | `header.html`, `footer.html`, `index.html`, nhiều nơi |
| `qx-items-center` | `header.html`, `footer.html`, nhiều nơi |
| `qx-justify-between` | Không dùng trực tiếp (dùng `qx-flex-between`) |

## Component Classes

| Class | Dùng ở đâu | Mô tả |
|-------|-----------|-------|
| `qx-card` | Khắp nơi | Card container với border + bg |
| `qx-callout-success` | `index.html`, `projects/list.html`, `services/list.html`, `services/single.html` | Callout xanh lá |
| `qx-callout-warning` | Chưa dùng | Callout vàng |
| `qx-callout-danger` | Chưa dùng | Callout đỏ |
| `qx-nav-item` | `footer.html`, `toc.html` | Nav link item |

## Button Classes

| Class | Dùng ở đâu |
|-------|-----------|
| `qx-btn` | Khắp nơi (base class) |
| `qx-btn-primary` | CTAs chính |
| `qx-btn-outline` | CTAs phụ |
| `qx-btn-ghost` | Text/icon buttons |
| `qx-btn-destructive` | Chưa dùng |

## Badge Classes

| Class | Dùng ở đâu | Màu |
|-------|-----------|-----|
| `qx-badge-blue` | Categories, Posts label | Xanh dương solid |
| `qx-badge-green` | Projects label | Xanh lá solid |
| `qx-badge-red` | Services label | Đỏ solid |
| `qx-badge-yellow` | Featured/Editor Pick | Vàng solid |
| `qx-badge-soft-blue` | Tags, categories phụ | Xanh dương nhạt |
| `qx-badge-soft-green` | Tags, tech stack | Xanh lá nhạt |
| `qx-badge-soft-yellow` | Featured tags | Vàng nhạt |

## Spacing Classes

| Class | Scale |
|-------|-------|
| `qx-p-4`, `qx-p-6`, `qx-p-8` | Padding cards |
| `qx-py-4`, `qx-py-6`, `qx-py-8` | Padding vertical |
| `qx-px-4`, `qx-px-6` | Padding horizontal |
| `qx-m-0` | Reset margin |
| `qx-mb-4` | Margin bottom breadcrumbs |
| `qx-mt-6` | Margin top |
| `qx-gap-2`, `qx-gap-3`, `qx-gap-4`, `qx-gap-6`, `qx-gap-8` | Grid/flex gaps |
| `qx-mx-auto` | Center alignment |

## Utility Classes

| Class | Dùng ở đâu |
|-------|-----------|
| `qx-text-muted` | Dates, meta, secondary text |
| `qx-text-muted` | Copyright, descriptions |
| `qx-fw-bold` | Chưa dùng trực tiếp |
| `qx-w-full` | Images trong cards |
| `qx-rounded-lg` | Images trong cards |
| `qx-shadow-sm` | Cards phụ |
| `qx-shadow-md` | Cards nổi bật (featured) |
| `qx-sr-only` | Chưa dùng trực tiếp |

## Shadow / Elevation

| Class | Pattern dùng |
|-------|-------------|
| `qx-shadow-sm` | Regular cards |
| `qx-shadow-md` | Featured/hero cards |

## Data Attributes API

| Attribute | Element | Dùng ở đâu |
|-----------|---------|-----------|
| `data-qx-theme-toggle` | `<button>` | `header.html` — theme toggle button |
| `data-qx-tab` | _(chưa dùng)_ | — |
| `data-qx-tab-group` | _(chưa dùng)_ | — |
| `data-qx-pane-group` | _(chưa dùng)_ | — |
| `data-qx-modal-target` | _(chưa dùng)_ | — |
| `data-qx-dismiss` | _(chưa dùng)_ | — |

## ARIA Patterns

| Pattern | Template |
|---------|---------|
| `aria-label` trên nav, pagination | `header.html`, `breadcrumbs.html`, `posts/list.html`, `taxonomy.html` |
| `aria-labelledby` linking sections | `index.html`, `posts/list.html`, `posts/single.html`, `projects/list.html` |
| `aria-current="page"` | `header.html` (active nav link), `breadcrumbs.html` (current page), `posts/list.html` (current pagination) |
| `aria-disabled="true"` | Disabled pagination buttons |
| `aria-live="polite"` | Search status messages |

## Custom JS (non-Quorix UI)

| Feature | File | Mô tả |
|---------|------|-------|
| Idle navbar animation | `extend_footer.html` | Hide/show navbar on scroll idle. Selects `#site-header`. |
| Code copy button | `footer.html` (inline script) | Thêm nút copy vào code blocks |
| Search index | `extend_footer.html` hoặc theme | Fuse.js search qua JSON index |
| Theme init (inline) | `extend_head.html` | Sync theme từ localStorage trước khi render |

## Deprecation Notes (Hugo v0.159.1)

- `languageCode` → dùng `locale` trong `hugo.toml`
- `.Language.LanguageDirection` → `.Language.Direction` (đã sửa trong `baseof.html`)
- `.Language.LanguageCode` → `.Language.Locale` (nằm trong PaperMod theme, không sửa)
