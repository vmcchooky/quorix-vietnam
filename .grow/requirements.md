# Requirements Document

## Introduction

Dự án này nhằm tái cấu trúc toàn bộ giao diện (UX/UI) của Hugo static site `quorix-vietnam` để tuân thủ 100% tài liệu Quorix UI 2.1.4. Hiện tại, dự án đang sử dụng theme PaperMod với một số class Quorix UI tự chế và custom CSS không tuân thủ đầy đủ design system. Mục tiêu là loại bỏ hoàn toàn custom CSS, thay thế bằng các class và API chính thức từ Quorix UI, đảm bảo tính nhất quán, khả năng bảo trì và tuân thủ WCAG 2.1 AA.

## Glossary

- **Quorix_UI**: Design system chính thức với CSS classes và JS API được định nghĩa trong tài liệu Quorix UI 2.1.4
- **Hugo_Site**: Static site generator sử dụng Go templates để render HTML
- **Layout_Template**: File HTML template trong thư mục `layouts/` của Hugo
- **Custom_CSS**: File CSS tự chế trong `assets/css/extended/` không thuộc Quorix UI
- **EARS_Pattern**: Easy Approach to Requirements Syntax - cú pháp chuẩn cho requirements
- **WCAG_AA**: Web Content Accessibility Guidelines Level AA - chuẩn accessibility
- **Theme_Toggle**: Chức năng chuyển đổi giữa light mode và dark mode
- **Responsive_Breakpoint**: Điểm chuyển đổi layout theo kích thước màn hình
- **Component_Variant**: Biến thể của component (primary, secondary, ghost, etc.)
- **Spacing_Token**: Biến CSS cho khoảng cách chuẩn từ Quorix UI metrics
- **Color_Token**: Biến CSS cho màu sắc chuẩn từ Quorix UI colors
- **Data_Attribute_API**: API khai báo sử dụng `data-qx-*` attributes
- **Focus_Visible**: Trạng thái hiển thị focus ring khi điều hướng bằng keyboard

## Requirements

### Requirement 1: CSS Cleanup và Migration

**User Story:** Là developer, tôi muốn loại bỏ toàn bộ custom CSS và chỉ sử dụng Quorix UI classes, để đảm bảo tính nhất quán và dễ bảo trì.

#### Acceptance Criteria

1. THE System SHALL remove all custom CSS files from `assets/css/extended/` directory
2. WHEN a layout template requires styling, THE System SHALL use only Quorix UI classes documented in `.agent-instructions.md`
3. THE System SHALL NOT use Tailwind classes
4. THE System SHALL NOT use Bootstrap classes
5. THE System SHALL NOT create new `<style>` tags or inline styles
6. WHERE a desired visual effect cannot be achieved with existing Quorix UI classes, THE System SHALL modify the design to use available classes
7. THE System SHALL use only spacing utilities from the approved list (qx-m-*, qx-p-*, qx-gap-*)
8. THE System SHALL use only color classes from the approved list (qx-text-*, qx-bg-*, qx-badge-*)

### Requirement 2: Layout Structure Compliance

**User Story:** Là developer, tôi muốn tất cả layout templates tuân thủ cấu trúc Quorix UI, để đảm bảo responsive và semantic HTML.

#### Acceptance Criteria

1. THE System SHALL use `qx-container` or `qx-container-lg` for main content wrappers
2. WHEN implementing grid layouts, THE System SHALL use `qx-grid-2` or `qx-grid-3` classes
3. WHEN implementing flex layouts, THE System SHALL use `qx-flex-between`, `qx-flex-center`, or `qx-items-center` classes
4. THE System SHALL use `qx-card` class for card components
5. THE System SHALL use `qx-btn` with appropriate variants (qx-btn-primary, qx-btn-ghost, qx-btn-outline) for buttons
6. THE System SHALL NOT use grid classes not defined in Quorix UI (qx-grid-4, qx-grid-3/2-1)
7. THE System SHALL use semantic HTML5 elements (section, article, nav, aside, header, footer)
8. WHERE navigation is required, THE System SHALL use `qx-navbar` and `qx-navbar-nav` structure

### Requirement 3: Color System Compliance

**User Story:** Là developer, tôi muốn sử dụng đúng color tokens và classes, để đảm bảo contrast ratio và theme switching hoạt động chính xác.

#### Acceptance Criteria

1. THE System SHALL use CSS custom properties (--qx-brand-*, --qx-text-*, --qx-bg-*) for colors
2. THE System SHALL NOT use hardcoded hex color values
3. WHEN displaying text on colored backgrounds, THE System SHALL use `--qx-text-on-accent` or `--qx-text-on-yellow` tokens
4. THE System SHALL use `--qx-text-main` for primary text and `--qx-text-muted` for secondary text
5. THE System SHALL use badge variants (qx-badge-blue, qx-badge-green, qx-badge-red, qx-badge-yellow) for status indicators
6. THE System SHALL NOT use utility classes that don't exist (qx-text-blue, qx-text-red, qx-bg-base, qx-bg-surface)
7. WHERE semantic color is needed, THE System SHALL use component-level variants (qx-btn-primary, qx-callout-warning)
8. THE System SHALL ensure all text meets WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text)

### Requirement 4: Spacing System Compliance

**User Story:** Là developer, tôi muốn sử dụng spacing tokens chuẩn, để đảm bảo visual rhythm nhất quán.

#### Acceptance Criteria

1. THE System SHALL use only approved margin utilities (qx-mt-*, qx-mb-*, qx-my-*, qx-mx-auto)
2. THE System SHALL use only approved padding utilities (qx-p-*, qx-px-*, qx-py-*)
3. THE System SHALL use only approved gap utilities (qx-gap-1 through qx-gap-8)
4. THE System SHALL NOT use spacing utilities not in the approved scale (must use scale 1, 2, 3, 4, 6, 8, 12 for margins/paddings; avoid random numbers like 5, 7, 9, 10)
5. WHERE custom spacing is needed, THE System SHALL use inline CSS custom properties referencing spacing tokens
6. THE System SHALL maintain consistent spacing across all breakpoints

### Requirement 5: Component Implementation

**User Story:** Là developer, tôi muốn implement các UI components sử dụng đúng Quorix UI patterns, để đảm bảo consistency và reusability.

#### Acceptance Criteria

1. THE System SHALL use `qx-card` with appropriate modifiers for all card-based layouts
2. THE System SHALL use `qx-btn` with variants (primary, outline, ghost, danger) for all buttons
3. THE System SHALL use `qx-badge-soft-*` or `qx-badge-*` for labels and tags
4. THE System SHALL use `qx-tabs` and `qx-tab` for tabbed interfaces
5. THE System SHALL use `qx-dialog-backdrop` and `qx-dialog-panel` for modals
6. THE System SHALL use `qx-navbar` structure for navigation
7. THE System SHALL use `qx-breadcrumbs` for breadcrumb navigation
8. WHERE forms are needed, THE System SHALL use Quorix UI form classes
9. THE System SHALL use `qx-callout-*` variants for alert messages
10. THE System SHALL use `qx-progress-*` variants for progress indicators

### Requirement 6: Declarative JS API Integration

**User Story:** Là developer, tôi muốn sử dụng data attributes API cho interactive features, để tránh viết custom JavaScript.

#### Acceptance Criteria

1. WHEN implementing tabs, THE System SHALL use `data-qx-tab` and `data-qx-tab-group` on triggers
2. WHEN implementing tabs, THE System SHALL use `data-qx-pane-group` on panes
3. WHEN implementing modals, THE System SHALL use `data-qx-modal-target` on open triggers
4. WHEN implementing modals, THE System SHALL use `data-qx-dismiss` on close triggers
5. WHEN implementing theme toggle, THE System SHALL use `data-qx-theme-toggle` on toggle button
6. THE System SHALL NOT use `data-qx-tooltip` or `data-qx-tooltip-pos` (not supported)
7. THE System SHALL ensure modal has `qx-dialog-backdrop` with `qx-d-none` by default
8. THE System SHALL ensure tab panes use `qx-d-none` for inactive states
9. THE System SHALL ensure active tab has `is-active` class
10. THE System SHALL set `data-theme` attribute on `<html>` element for theme state

### Requirement 7: Accessibility Compliance

**User Story:** Là end user, tôi muốn site đạt chuẩn WCAG 2.1 AA, để tôi có thể sử dụng với assistive technologies.

#### Acceptance Criteria

1. THE System SHALL ensure all interactive elements have visible focus indicators
2. THE System SHALL ensure all images have appropriate alt text
3. THE System SHALL ensure all form inputs have associated labels
4. THE System SHALL ensure modals have `role="dialog"` and `aria-modal="true"`
5. THE System SHALL ensure modals have `aria-labelledby` pointing to title
6. THE System SHALL ensure keyboard navigation works for all interactive elements
7. THE System SHALL ensure focus trap works within open modals
8. WHEN modal closes, THE System SHALL return focus to trigger element
9. THE System SHALL ensure all text meets WCAG AA contrast requirements
10. THE System SHALL respect `prefers-reduced-motion` for animations
11. THE System SHALL use semantic HTML for screen reader navigation
12. THE System SHALL ensure skip links are available for keyboard users

### Requirement 8: Responsive Design

**User Story:** Là end user, tôi muốn site hoạt động tốt trên mọi kích thước màn hình, để tôi có thể truy cập từ bất kỳ thiết bị nào.

#### Acceptance Criteria

1. THE System SHALL use Quorix UI responsive utilities (qx-d-none, qx-d-block, qx-d-flex at breakpoints)
2. WHEN viewport width is below 980px, THE System SHALL adjust grid to 2 columns or 1 column
3. WHEN viewport width is below 640px, THE System SHALL use single column layout
4. THE System SHALL use `qx-container` max-width constraints for content
5. THE System SHALL ensure touch targets are minimum 44x44px on mobile
6. THE System SHALL ensure text remains readable at all breakpoints (minimum 16px on mobile)
7. THE System SHALL use `qx-flex-wrap` for wrapping flex items on small screens
8. THE System SHALL test layouts at 320px, 768px, 1024px, and 1440px widths
9. THE System SHALL ensure navigation is accessible on mobile (hamburger or bottom nav)
10. THE System SHALL ensure images are responsive using max-width: 100%

### Requirement 9: Theme System Integration

**User Story:** Là end user, tôi muốn chuyển đổi giữa light và dark mode, để tôi có thể sử dụng site trong điều kiện ánh sáng khác nhau.

#### Acceptance Criteria

1. THE System SHALL implement theme toggle using `data-qx-theme-toggle` attribute
2. THE System SHALL set `data-theme="light"` or `data-theme="dark"` on `<html>` element
3. THE System SHALL support `data-theme="auto"` for system preference detection
4. THE System SHALL persist theme choice in localStorage
5. WHEN theme changes, THE System SHALL update all color tokens automatically
6. THE System SHALL ensure all custom colors have dark mode variants
7. THE System SHALL test contrast ratios in both light and dark modes
8. THE System SHALL ensure theme toggle button has appropriate icon
9. THE System SHALL ensure theme toggle is keyboard accessible
10. THE System SHALL load theme preference before first paint to avoid flash

### Requirement 10: Homepage Restructure

**User Story:** Là visitor, tôi muốn homepage hiển thị đẹp và professional, để tôi có ấn tượng tốt về site.

#### Acceptance Criteria

1. THE System SHALL restructure `layouts/index.html` using Quorix UI components
2. THE System SHALL use `qx-hero` pattern for hero section (if exists in Quorix UI)
3. THE System SHALL use `qx-grid-2` or `qx-grid-3` for post listings
4. THE System SHALL use `qx-card` for each post preview
5. THE System SHALL use `qx-btn-primary` for primary CTA
6. THE System SHALL use `qx-btn-ghost` for secondary actions
7. THE System SHALL ensure hero section is responsive
8. THE System SHALL use `qx-badge-*` for post categories
9. THE System SHALL use proper heading hierarchy (h1 for page title, h2 for sections, h3 for cards)
10. THE System SHALL ensure homepage loads in under 3 seconds on 3G connection

### Requirement 11: Post List Page Restructure

**User Story:** Là reader, tôi muốn dễ dàng browse và filter posts, để tôi có thể tìm nội dung quan tâm.

#### Acceptance Criteria

1. THE System SHALL restructure `layouts/posts/list.html` using Quorix UI components
2. THE System SHALL use `qx-grid-2` or `qx-grid-3` for post grid
3. THE System SHALL use `qx-card` for each post item
4. THE System SHALL implement filter UI using `qx-badge-soft-*` for categories/tags
5. THE System SHALL use `qx-tabs` if multiple view modes are offered
6. THE System SHALL use `qx-pagination` for pagination controls
7. THE System SHALL ensure post cards have consistent height or use masonry layout
8. THE System SHALL display post metadata (date, reading time, category)
9. THE System SHALL use `qx-badge-*` for post status or featured indicator
10. THE System SHALL ensure list is keyboard navigable

### Requirement 12: Post Single Page Restructure

**User Story:** Là reader, tôi muốn đọc post với typography tốt và navigation rõ ràng, để tôi có trải nghiệm đọc thoải mái.

#### Acceptance Criteria

1. THE System SHALL restructure `layouts/posts/single.html` using Quorix UI components
2. THE System SHALL use `qx-container-prose` for article content
3. THE System SHALL use `qx-breadcrumbs` for navigation
4. THE System SHALL use `qx-callout-*` for special content blocks
5. THE System SHALL use proper typography scale from Quorix UI
6. THE System SHALL implement table of contents using `qx-nav-item` if applicable
7. THE System SHALL use `qx-btn-ghost` for share buttons
8. THE System SHALL display related posts using `qx-card` in `qx-grid-3`
9. THE System SHALL ensure code blocks use Quorix UI code styling
10. THE System SHALL ensure article content has max-width for readability (60-80ch)

### Requirement 13: Projects Page Restructure

**User Story:** Là visitor, tôi muốn xem portfolio projects với layout đẹp, để tôi có thể đánh giá năng lực.

#### Acceptance Criteria

1. THE System SHALL restructure `layouts/projects/list.html` using Quorix UI components
2. THE System SHALL use `qx-grid-2` or `qx-grid-3` for project grid
3. THE System SHALL use `qx-card` with distinct styling for project cards
4. THE System SHALL use `qx-badge-*` for project status or tech stack
5. THE System SHALL use `qx-btn-primary` for "View Project" CTA
6. THE System SHALL display project thumbnail using responsive images
7. THE System SHALL ensure project cards have hover effects using Quorix UI utilities
8. THE System SHALL use `qx-callout-*` for featured projects
9. THE System SHALL ensure project descriptions are truncated consistently
10. THE System SHALL implement filter by technology or category using `qx-badge-soft-*`

### Requirement 14: Services Page Restructure

**User Story:** Là potential client, tôi muốn hiểu rõ services được cung cấp, để tôi có thể quyết định liên hệ.

#### Acceptance Criteria

1. THE System SHALL restructure `layouts/services/list.html` and `layouts/services/single.html` using Quorix UI components
2. THE System SHALL use `qx-grid-2` for services overview
3. THE System SHALL use `qx-card` with icon or image for each service
4. THE System SHALL use `qx-btn-primary` for "Contact" or "Learn More" CTA
5. THE System SHALL use `qx-callout-success` for service benefits
6. THE System SHALL use `qx-badge-*` for service categories
7. THE System SHALL ensure service descriptions are clear and scannable
8. THE System SHALL use `qx-tabs` for service details if multiple sections exist
9. THE System SHALL display pricing or contact form using Quorix UI form components
10. THE System SHALL ensure services page has clear call-to-action

### Requirement 15: Navigation and Header Restructure

**User Story:** Là user, tôi muốn navigation rõ ràng và accessible, để tôi có thể di chuyển dễ dàng trong site.

#### Acceptance Criteria

1. THE System SHALL restructure header partial using `qx-navbar` structure
2. THE System SHALL use `qx-navbar-brand` for logo
3. THE System SHALL use `qx-navbar-nav` for navigation links
4. THE System SHALL use `qx-navbar-link` for each nav item
5. THE System SHALL implement theme toggle using `data-qx-theme-toggle`
6. THE System SHALL use `qx-navbar-glass` for glassmorphism effect if desired
7. THE System SHALL ensure navigation is sticky or fixed appropriately
8. THE System SHALL implement mobile navigation using Quorix UI patterns
9. THE System SHALL ensure active page is indicated with appropriate class
10. THE System SHALL ensure navigation is keyboard accessible with visible focus

### Requirement 16: Footer Restructure

**User Story:** Là user, tôi muốn footer chứa thông tin hữu ích và links, để tôi có thể truy cập nhanh các trang quan trọng.

#### Acceptance Criteria

1. THE System SHALL restructure footer partial using Quorix UI components
2. THE System SHALL use `qx-grid-2` or `qx-grid-3` for footer columns
3. THE System SHALL use semantic HTML (footer element)
4. THE System SHALL display social links using `qx-btn-ghost` or icon buttons
5. THE System SHALL use `qx-text-muted` for copyright text
6. THE System SHALL ensure footer links are keyboard accessible
7. THE System SHALL use `qx-nav-item` for footer navigation
8. THE System SHALL ensure footer has adequate padding and spacing
9. THE System SHALL display newsletter signup using Quorix UI form components if applicable
10. THE System SHALL ensure footer is responsive on mobile

### Requirement 17: Search Functionality Restructure

**User Story:** Là user, tôi muốn search interface đẹp và dễ dùng, để tôi có thể tìm nội dung nhanh chóng.

#### Acceptance Criteria

1. THE System SHALL restructure `layouts/_default/search.html` using Quorix UI components
2. THE System SHALL use Quorix UI form input styling for search box
3. THE System SHALL use `qx-card` for search results
4. THE System SHALL use `qx-badge-*` for result categories
5. THE System SHALL implement search suggestions using `qx-dialog-panel` or dropdown
6. THE System SHALL ensure search is keyboard accessible
7. THE System SHALL display "no results" state using `qx-callout-info`
8. THE System SHALL use `qx-btn-ghost` for search filters if applicable
9. THE System SHALL ensure search input has proper focus styling
10. THE System SHALL display search results count and loading state

### Requirement 18: Taxonomy Pages Restructure

**User Story:** Là user, tôi muốn browse content theo categories và tags, để tôi có thể khám phá nội dung liên quan.

#### Acceptance Criteria

1. THE System SHALL restructure taxonomy templates using Quorix UI components
2. THE System SHALL use `qx-badge-soft-*` for tag/category display
3. THE System SHALL use `qx-grid-3` for taxonomy term listings
4. THE System SHALL use `qx-card` for each term with post count
5. THE System SHALL use `qx-breadcrumbs` for taxonomy navigation
6. THE System SHALL ensure taxonomy pages have clear hierarchy
7. THE System SHALL display related terms using Quorix UI components
8. THE System SHALL use `qx-pagination` for paginated taxonomy archives
9. THE System SHALL ensure taxonomy filters are accessible
10. THE System SHALL display taxonomy description using `qx-lead` or similar

### Requirement 19: Performance Optimization

**User Story:** Là user, tôi muốn site load nhanh, để tôi không phải chờ đợi.

#### Acceptance Criteria

1. THE System SHALL minimize CSS by removing unused custom styles
2. THE System SHALL ensure Quorix UI CSS is loaded from CDN or optimized bundle
3. THE System SHALL use lazy loading for images below the fold
4. THE System SHALL ensure critical CSS is inlined or loaded first
5. THE System SHALL minimize JavaScript by using only Quorix UI declarative API
6. THE System SHALL ensure fonts are loaded efficiently (font-display: swap)
7. THE System SHALL achieve Lighthouse performance score above 90
8. THE System SHALL ensure First Contentful Paint under 1.5 seconds
9. THE System SHALL ensure Time to Interactive under 3 seconds
10. THE System SHALL minimize layout shifts (CLS under 0.1)

### Requirement 20: Documentation and Maintenance

**User Story:** Là developer, tôi muốn documentation rõ ràng về cách sử dụng Quorix UI, để tôi có thể maintain và extend site.

#### Acceptance Criteria

1. THE System SHALL document all Quorix UI classes used in a reference file
2. THE System SHALL document component patterns and usage examples
3. THE System SHALL document responsive breakpoints and behavior
4. THE System SHALL document theme customization approach
5. THE System SHALL document accessibility considerations
6. THE System SHALL provide code comments for complex layouts
7. THE System SHALL document data attribute API usage
8. THE System SHALL create a style guide page showing all components
9. THE System SHALL document migration from custom CSS to Quorix UI
10. THE System SHALL ensure documentation is kept in sync with implementation

