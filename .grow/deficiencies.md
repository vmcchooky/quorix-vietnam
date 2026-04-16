# Quorix UI — Deficiencies Report

> Tài liệu này ghi lại các thiếu sót của `@quorix/ui` được phát hiện trong quá trình xây dựng dự án `quorix-vietnam`.
> Mục đích: làm input cho roadmap phát triển Quorix UI, sau đó quay lại apply cho dự án này.
>
> Cập nhật lần cuối: 2026-04-14

---

## Cách đọc tài liệu này

Mỗi mục gồm:
- **Mô tả**: Thiếu sót là gì
- **Nhu cầu thực tế**: Dự án cần dùng nó ở đâu
- **Workaround hiện tại**: Dự án đang xử lý thế nào
- **Đề xuất API**: Tên class / token / data attribute nên có trong Quorix UI

---

## 1. Fixed / Floating Navbar

**Mô tả**
`qx-navbar` hiện chỉ render dạng static trong document flow. Không có cơ chế nào để navbar trở thành fixed, sticky, hay floating pill dock ở cuối màn hình.

**Nhu cầu thực tế**
Dự án cần navbar cố định ở dưới màn hình (bottom pill dock) trên desktop, và cố định ở trên trên mobile. Đây là pattern phổ biến trong các site hiện đại.

**Workaround hiện tại**
Tự chế toàn bộ trong `<style>` của `extend_head.html`:
```css
#site-header { position: fixed; bottom: 20px; ... }
#site-header nav { border-radius: 999px; height: 5rem; ... }
```

**Đề xuất API**
- Modifier class: `qx-navbar--fixed-top`, `qx-navbar--fixed-bottom`
- Modifier class: `qx-navbar--pill` — bo tròn, floating, có shadow
- CSS token: `--qx-navbar-height` để các layout khác có thể bù padding
- Utility: `qx-navbar-offset-top`, `qx-navbar-offset-bottom` cho body padding

---

## 2. Navbar Backdrop Blur / Glassmorphism nâng cao

**Mô tả**
`qx-navbar-glass` tồn tại nhưng không rõ có bao gồm `backdrop-filter: blur()` hay không. Trong thực tế, class này không đủ để tạo hiệu ứng glass đúng nghĩa khi navbar nằm trên nền có nội dung cuộn phía sau.

**Nhu cầu thực tế**
Navbar floating cần glassmorphism rõ ràng: blur nền phía sau, background semi-transparent, border mờ — để phân biệt với content bên dưới mà không che khuất hoàn toàn.

**Workaround hiện tại**
```css
backdrop-filter: blur(16px) saturate(180%);
background: color-mix(in srgb, var(--qx-bg-base) 70%, transparent) !important;
border: 1px solid color-mix(in srgb, var(--qx-border) 40%, transparent);
```

**Đề xuất API**
- Bổ sung `backdrop-filter` vào `qx-navbar-glass`
- Token: `--qx-glass-blur`, `--qx-glass-bg-opacity`, `--qx-glass-border-opacity`
- Đảm bảo `qx-glass` utility và `qx-navbar-glass` dùng chung token này

---

## 3. Auto-hide Navbar on Scroll

**Mô tả**
Không có `data-qx-*` API nào cho hành vi ẩn/hiện navbar theo scroll. Đây là UX pattern quan trọng để tối ưu không gian màn hình khi đọc nội dung dài.

**Nhu cầu thực tế**
Navbar tự ẩn sau vài giây không tương tác (idle), tự hiện lại khi user scroll, chạm màn hình, hoặc nhấn phím.

**Workaround hiện tại**
~80 dòng JavaScript tự viết trong `extend_footer.html`, quản lý các class `.is-nav-idle` và `.is-nav-returning` trên `<body>`.

**Đề xuất API**
- Data attribute: `data-qx-autohide` trên navbar element
- Config: `data-qx-autohide-delay="2600"` (ms)
- JS tự thêm/xóa class `is-idle` và `is-returning` trên element
- CSS transition được ship sẵn trong `animations.css`

---

## 4. Scroll-to-top Button (FAB)

**Mô tả**
Không có Floating Action Button hay scroll-to-top component. Đây là UI pattern cơ bản cho các trang có nội dung dài.

**Nhu cầu thực tế**
Button xuất hiện khi user scroll xuống quá một ngưỡng nhất định, click để scroll về đầu trang.

**Workaround hiện tại**
Tự tạo button với ID `#scroll-to-top`, class `qx-btn qx-btn-primary`, và tự viết JS để toggle class `.is-visible` + xử lý `window.scrollTo`.

**Đề xuất API**
- Component class: `qx-fab` — Floating Action Button, position fixed
- Modifier: `qx-fab--bottom-right`, `qx-fab--bottom-center`
- Data attribute: `data-qx-scroll-top` — tự xử lý scroll behavior
- State class: `.is-visible` được ship sẵn với transition opacity/transform
- Token: `--qx-fab-offset` để điều chỉnh khoảng cách từ cạnh màn hình

---

## 5. Skip Link (Accessibility)

**Mô tả**
Không có `qx-skip-link` component. Skip link là yêu cầu bắt buộc của WCAG 2.1 AA cho keyboard navigation, nhưng Quorix UI không ship sẵn pattern này.

**Nhu cầu thực tế**
Link ẩn xuất hiện khi focus, cho phép keyboard user nhảy thẳng vào main content, bỏ qua navbar.

**Workaround hiện tại**
```css
.qx-skip-link {
  position: absolute; top: -100px; ...
  transition: top 0.2s ease;
}
.qx-skip-link:focus { top: 0; }
```

**Đề xuất API**
- Component class: `qx-skip-link`
- Behavior: ẩn mặc định, hiện khi `:focus-visible`
- Style: dùng `--qx-brand-blue` background, `--qx-text-on-accent` text
- Vị trí: fixed top-left, z-index cao nhất

---

## 6. Logo Ring / Brand Mark

**Mô tả**
Không có wrapper component cho logo image trong navbar. Các pattern như bo tròn logo, thêm ring/border, hay squircle mask không được cung cấp dưới dạng component có tên rõ ràng.

**Nhu cầu thực tế**
Logo JPG/PNG cần được bo tròn (`border-radius: 50%`) và có kích thước cố định khi nằm trong navbar brand area.

**Workaround hiện tại**
```css
.qx-logo-ring img { border-radius: 50%; display: block; object-fit: cover; }
```

**Đề xuất API**
- Component class: `qx-brand-mark` — wrapper cho logo, tự bo tròn, object-fit cover
- Modifier: `qx-brand-mark--sm` (24px), `qx-brand-mark--md` (32px), `qx-brand-mark--lg` (48px)
- Có thể kết hợp với `qx-squircle` đã có sẵn

---

## 7. Stats / Counter Block

**Mô tả**
Không có component nào cho dạng hiển thị số liệu thống kê (số bài viết, số dự án, v.v.). Đây là pattern phổ biến trên homepage và profile page.

**Nhu cầu thực tế**
Hiển thị các con số nổi bật (6 bài viết · 3 dự án · 2 dịch vụ) theo hàng ngang, có divider giữa các item, có label phụ bên dưới số.

**Workaround hiện tại**
Tự tạo classes không có CSS: `.home-stat-item`, `.home-stat-number`, `.home-stat-label`, `.home-stat-divider` — **hiện đang render unstyled hoàn toàn**.

**Đề xuất API**
- Component class: `qx-stat-group` — container flex/grid cho nhóm stats
- Child class: `qx-stat` — một stat item
- Child class: `qx-stat-value` — số lớn, font bold
- Child class: `qx-stat-label` — label nhỏ, `--qx-text-muted`
- Modifier: `qx-stat-group--divided` — thêm divider giữa các item

---

## 8. Footer Layout Component

**Mô tả**
Không có `qx-footer` component hay footer-specific layout. Dự án phải dùng generic grid + IDs tự đặt để tạo footer.

**Nhu cầu thực tế**
Footer cần layout 2-3 cột, brand block bên trái, links/contact bên phải, copyright bar ở dưới cùng.

**Workaround hiện tại**
Dùng IDs tự chế: `#site-footer-grid`, `#footer-story`, `#footer-brand-mark`, `#footer-contact` — không có CSS riêng, dựa hoàn toàn vào generic grid utilities.

**Đề xuất API**
- Component class: `qx-footer` — semantic footer wrapper với padding, border-top, background
- Layout class: `qx-footer-grid` — responsive grid cho footer columns
- Child class: `qx-footer-brand` — brand block với logo + description
- Child class: `qx-footer-links` — column links
- Child class: `qx-footer-bottom` — copyright bar, flex between, border-top

---

## 9. Theme Icon Swap (Sun / Moon)

**Mô tả**
`data-qx-theme-toggle` chỉ toggle `data-theme` attribute, không cung cấp bất kỳ visual feedback nào về theme hiện tại. Không có cơ chế icon swap sun/moon được ship sẵn.

**Nhu cầu thực tế**
Button toggle cần hiển thị icon mặt trời khi đang ở light mode, icon mặt trăng khi đang ở dark mode.

**Workaround hiện tại**
```css
[data-theme="light"] [data-qx-theme-toggle] .theme-icon-dark { display: none; }
[data-theme="dark"] [data-qx-theme-toggle] .theme-icon-light { display: none; }
```
Với 2 SVG icon được đặt thủ công trong HTML.

**Đề xuất API**
- Data attribute: `data-qx-theme-icon` trên element chứa icon — JS tự swap SVG hoặc class
- Hoặc: ship sẵn 2 SVG icon trong JS bundle, tự inject vào button có `data-qx-theme-toggle`
- CSS class: `qx-theme-icon` với `qx-theme-icon--sun` và `qx-theme-icon--moon` — visibility tự động theo `[data-theme]`

---

## 10. Navbar Link Active States (Hover / Press)

**Mô tả**
`qx-navbar-link` có thể có hover style mặc định, nhưng không có:
- Background highlight khi hover
- Scale/press effect khi active (`:active`)
- Background fill cho trạng thái `is-active` (class tồn tại nhưng style không rõ ràng)

**Nhu cầu thực tế**
Menu items cần cảm giác "nhấn được" — hover có background nhẹ, click có scale nhỏ, active page có background + màu chữ khác biệt.

**Workaround hiện tại**
```css
.qx-navbar-link:hover { background: color-mix(...); transform: translateY(-1px); }
.qx-navbar-link:active { transform: scale(0.98); }
.qx-navbar-link.is-active { background: ...; color: var(--qx-brand-blue); }
```

**Đề xuất API**
- Bổ sung hover/active/is-active styles vào `qx-navbar-link` trong `layout.css`
- Token: `--qx-navbar-link-hover-bg`, `--qx-navbar-link-active-bg`, `--qx-navbar-link-active-color`
- Đảm bảo `is-active` có visual style rõ ràng, không chỉ là class trống

---

## 11. Entrance Animations / Keyframes

**Mô tả**
`animations.css` tồn tại nhưng không rõ có ship các keyframe animation phổ biến không. Dự án cần animation "trồi lên" (pop-up từ dưới) cho mascot indicator.

**Nhu cầu thực tế**
Element xuất hiện với hiệu ứng bounce từ dưới lên — `translateY` + `opacity` + cubic-bezier spring.

**Workaround hiện tại**
```css
@keyframes gopherPopUp {
  0% { transform: translateX(-50%) translateY(10px); opacity: 0; }
  100% { transform: translateX(-50%) translateY(0); opacity: 1; }
}
```

**Đề xuất API**
- Keyframe: `@keyframes qx-enter-up` — fade + slide từ dưới lên
- Keyframe: `@keyframes qx-enter-down` — fade + slide từ trên xuống
- Keyframe: `@keyframes qx-enter-scale` — fade + scale từ nhỏ ra
- Utility class: `qx-animate-enter-up`, `qx-animate-enter-down`, `qx-animate-enter-scale`
- Token: `--qx-animation-spring` — cubic-bezier spring preset
- Tôn trọng `prefers-reduced-motion` bằng cách disable animation khi user bật setting này

---

## 12. Search UI Components

**Mô tả**
Không có component nào cho search interface: search input với live results, result list, empty state, loading state.

**Nhu cầu thực tế**
- Input search với icon
- Result list với highlight từ khóa
- Empty state ("không tìm thấy kết quả")
- Loading/skeleton state
- Shortcut chip buttons

**Workaround hiện tại**
Toàn bộ tự viết HTML với IDs tự chế (`#searchbox`, `#searchResults`, `#searchStatus`) và JavaScript riêng.

**Đề xuất API**
- Component class: `qx-search` — wrapper
- Child class: `qx-search-input` — input với icon search tích hợp
- Child class: `qx-search-results` — list container
- Child class: `qx-search-result-item` — một result row
- State class: `qx-search--loading`, `qx-search--empty`
- Data attribute: `data-qx-search` — JS tự wire up nếu có JSON index

---

## 13. Code Copy Button

**Mô tả**
Không có component nào cho "copy code" button trong code blocks. Đây là UX cơ bản cho technical blog.

**Nhu cầu thực tế**
Button nhỏ xuất hiện ở góc trên phải của code block, click để copy nội dung, hiển thị feedback "Copied!".

**Workaround hiện tại**
Tự inject button bằng JavaScript trong `footer.html`, dùng class `.copy-code` tự chế không có CSS.

**Đề xuất API**
- Component class: `qx-code-block` — wrapper cho `<pre><code>` với copy button tích hợp
- Data attribute: `data-qx-copy-code` — JS tự inject button và xử lý clipboard
- Child class: `qx-code-copy-btn` — button style, position absolute top-right
- State class: `.is-copied` — feedback visual sau khi copy thành công

---

## 14. Callout Info Variant

**Mô tả**
Quorix UI có `qx-callout-success`, `qx-callout-warning`, `qx-callout-danger` nhưng **thiếu `qx-callout-info`**. Đây là variant phổ biến nhất trong technical writing.

**Nhu cầu thực tế**
Hiển thị thông tin trung tính, không phải warning hay success — ví dụ: "Tính năng này đang trong giai đoạn thử nghiệm."

**Workaround hiện tại**
Dùng `qx-callout-success` thay thế (không đúng semantic), hoặc dùng `qx-card` thông thường.

**Đề xuất API**
- Component class: `qx-callout-info` — background xanh dương nhạt, border xanh dương
- Dùng `--qx-brand-blue-alpha-10` cho background, `--qx-brand-blue` cho border-left
- Text dùng `--qx-text-main` (không dùng brand color trực tiếp để đảm bảo contrast)

---

## 15. Spacing Scale — Các bước còn thiếu

**Mô tả**
Spacing utility classes hiện tại có các "lỗ hổng" trong scale khiến developer phải dùng inline style hoặc tự chế class.

**Thiếu cụ thể:**
- Padding: không có `.qx-p-3` (giữa p-2 và p-4)
- Padding top: không có `.qx-pt-*` bất kỳ
- Padding left/right riêng lẻ: không có `.qx-pl-*`, `.qx-pr-*`
- Margin left/right: chỉ có `.qx-ml-0` và `.qx-mr-0`, không có các bước khác
- Margin top/bottom: thiếu `.qx-mt-3`, `.qx-mb-3` (có mt-2 và mt-4 nhưng không có mt-3)

**Workaround hiện tại**
Dùng `style="padding: var(--qx-space-3)"` inline, hoặc bỏ qua spacing nhỏ.

**Đề xuất API**
Bổ sung đầy đủ scale cho tất cả directions, ít nhất với các bước: 1, 2, 3, 4, 6, 8, 12:
- `.qx-pt-1` đến `.qx-pt-12`
- `.qx-pb-1` đến `.qx-pb-12`
- `.qx-pl-1` đến `.qx-pl-8`
- `.qx-pr-1` đến `.qx-pr-8`
- `.qx-ml-1` đến `.qx-ml-8`
- `.qx-mr-1` đến `.qx-mr-8`
- `.qx-mt-3`, `.qx-mb-3` (đang thiếu trong scale hiện tại)

---

## 16. `qx-badge-soft-red` — Thiếu variant

**Mô tả**
Có `qx-badge-soft-blue`, `qx-badge-soft-green`, `qx-badge-soft-yellow` nhưng **không có `qx-badge-soft-red`**. Trong khi đó solid `qx-badge-red` tồn tại.

**Nhu cầu thực tế**
Cần badge đỏ nhạt (soft) cho các label như "Deprecated", "Breaking", "Danger" mà không cần màu đỏ solid quá mạnh.

**Đề xuất API**
- Thêm `qx-badge-soft-red` — background `--qx-brand-red-alpha-10`, text `--qx-text-red`

---

## 17. Responsive Utilities — Breakpoint Prefixes

**Mô tả**
Không có breakpoint prefix cho utility classes. Không thể viết `qx-d-none--mobile` hay `qx-grid-2--tablet` mà không tự chế media query.

**Nhu cầu thực tế**
Ẩn/hiện element theo breakpoint, thay đổi grid columns theo screen size, điều chỉnh spacing trên mobile.

**Workaround hiện tại**
Phải tự viết `@media` query trong `<style>` block.

**Đề xuất API**
Responsive prefix pattern (chọn một trong hai):
- Option A: `qx-sm:d-none`, `qx-md:grid-2`, `qx-lg:grid-3` (Tailwind-style)
- Option B: Modifier class `qx-d-none--sm`, `qx-grid-2--md`
- Tối thiểu cần: `qx-d-none--mobile`, `qx-d-none--desktop` để toggle visibility

---

## Tóm tắt theo nhóm

| Nhóm | Số thiếu sót | Mức độ ảnh hưởng |
|------|-------------|-----------------|
| Navigation | 4 (fixed navbar, glassmorphism, auto-hide, active states) | Cao — ảnh hưởng mọi trang |
| Layout | 2 (footer, stats block) | Cao — homepage và footer |
| Accessibility | 2 (skip link, focus states) | Cao — WCAG compliance |
| Components | 4 (FAB, logo ring, callout-info, badge-soft-red) | Trung bình |
| JS API | 3 (scroll-to-top, search, code copy) | Trung bình |
| Animation | 1 (entrance keyframes) | Thấp |
| Spacing | 1 (scale gaps) | Thấp |
| Responsive | 1 (breakpoint utilities) | Trung bình |

---

*Tài liệu này được tạo từ audit thực tế dự án `quorix-vietnam` — Phase 6, tháng 4/2026.*

---

## 18. Thiếu hệ thống Bullet / List Styles

**Mô tả**
Quorix UI không cung cấp styles cho `<ul>`, `<ol>`, `<li>` trong prose content. Các list trong bài viết render hoàn toàn không có bullet, số thứ tự, hay indentation — trông như plain text.

**Nhu cầu thực tế**
Technical blog cần:
- Unordered list với bullet rõ ràng (•, –, hoặc custom icon)
- Ordered list với số thứ tự được style đẹp
- Nested list với indentation đúng cấp
- List item spacing hợp lý (không quá dày, không quá sát)

**Workaround hiện tại**
Không có workaround — list hiện đang render unstyled trong toàn bộ bài viết.

**Đề xuất API**
- Bổ sung list styles vào `editorial.css` hoặc `typography.css` cho context `.qx-prose`
- Class: `qx-list` — base list reset + style
- Modifier: `qx-list--bullet` (ul), `qx-list--ordered` (ol), `qx-list--none` (reset)
- Token: `--qx-list-indent`, `--qx-list-item-gap`, `--qx-list-marker-color`
- Trong `.qx-prose`, tự động apply styles cho `ul` và `ol` mà không cần thêm class

---

## 19. Code Block — Dãn dòng quá lớn

**Mô tả**
`line-height` của code block hiện tại quá lớn, tạo khoảng trắng thừa giữa các dòng code. Đặc biệt rõ khi code có nhiều dòng trống (blank lines) — chúng chiếm không gian gấp đôi so với cần thiết.

**Nhu cầu thực tế**
Code block nên có `line-height` compact hơn prose text — khoảng `1.5` đến `1.6` là đủ, thay vì `1.8`+ như hiện tại. Blank lines trong code cũng nên có chiều cao nhỏ hơn dòng có nội dung.

**Workaround hiện tại**
Không có workaround — đây là style mặc định từ Quorix UI hoặc Hugo syntax highlighter.

**Đề xuất API**
- Token: `--qx-code-line-height` — mặc định `1.55`, override được
- Token: `--qx-code-font-size` — mặc định `0.875rem`
- Áp dụng vào `pre`, `pre > code` trong `editorial.css`

---

## 20. Code Block — Line Number Gutter không kéo dài hết container

**Mô tả**
Thanh đếm số dòng (line number gutter) bên trái code block chỉ cao bằng số dòng code thực tế, không kéo dài đến hết chiều cao của container. Khi code block có padding bottom hoặc khi container cao hơn nội dung, phần gutter bị hở — tạo ra visual artifact xấu: nền gutter và nền code block không đồng nhất ở phần cuối.

**Nhu cầu thực tế**
Gutter phải luôn kéo dài 100% chiều cao container, bất kể số dòng code nhiều hay ít.

**Workaround hiện tại**
Không có workaround — đây là lỗi layout của Hugo Chroma highlighter kết hợp với CSS hiện tại.

**Đề xuất API**
- Gutter element (`.ln`, `.lnt` trong Chroma) cần `min-height: 100%` hoặc dùng flexbox/grid để stretch
- Container `<table>` của Chroma cần `height: 100%` và `align-items: stretch`
- Token: `--qx-code-gutter-bg` — background của gutter, phân biệt với code area
- Đảm bảo style này được ship trong `editorial.css` để override Chroma defaults

---

## 21. Code Block — Border radius quá lớn

**Mô tả**
Container code block và thanh gutter số dòng đang dùng border-radius quá lớn (trông như `--qx-radius-lg` hoặc `--qx-radius-xl`). Code block là UI element mang tính kỹ thuật — bo cong quá tay làm mất đi cảm giác precision và technical credibility.

**Nhu cầu thực tế**
Code block nên dùng border-radius nhỏ hơn, khoảng `6px`–`8px` (`--qx-radius-sm` hoặc `--qx-radius-md`). Gutter bên trái chỉ nên bo cong ở 2 góc trái (top-left, bottom-left), code area bo cong ở 2 góc phải.

**Workaround hiện tại**
Không có workaround — đây là style mặc định từ Quorix UI.

**Đề xuất API**
- Token: `--qx-code-radius` — mặc định `var(--qx-radius-sm)` (6px), override được
- Gutter: `border-radius: var(--qx-code-radius) 0 0 var(--qx-code-radius)`
- Code area: `border-radius: 0 var(--qx-code-radius) var(--qx-code-radius) 0`
- Toàn bộ container: `border-radius: var(--qx-code-radius)`
