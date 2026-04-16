# Implementation Plan: Quorix UI Restructure

## Overview

This implementation plan restructures the `quorix-vietnam` Hugo static site to achieve 100% compliance with Quorix UI 2.1.4 design system. The plan follows a 6-phase migration strategy, converting all custom CSS to official Quorix UI classes and implementing declarative JavaScript APIs for interactive features.

**Key Objectives:**
- Remove all custom CSS files from `assets/css/extended/`
- Migrate 8+ layout templates to Quorix UI components
- Implement theme toggle, tabs, and modals using data attributes API
- Achieve WCAG 2.1 AA accessibility compliance
- Ensure responsive design across all breakpoints (320px to 1440px+)

**Implementation Language:** HTML + Hugo Templates + Quorix UI CSS/JS

## Tasks

### Phase 1: CSS Cleanup and Base Setup

- [ ] 1. Remove all custom CSS files and verify Quorix UI loading
  - [ ] 1.1 Delete all files from `assets/css/extended/` directory
    - Delete `assets/css/extended/design-lab.css`
    - Delete `assets/css/extended/post-single-roi.css`
    - Delete `assets/css/extended/posts-wireframes.css`
    - Delete `assets/css/extended/quorix-theme.css`
    - Delete `assets/css/extended/search-ai.css`
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 1.2 Update `layouts/_default/baseof.html` to load Quorix UI from CDN
    - Add preconnect to CDN in `<head>`
    - Load Quorix UI CSS (version 2.1.4) from CDN
    - Load Quorix UI JS from CDN
    - Remove references to custom CSS files
    - _Requirements: 1.2, 19.2, 19.3_
  
  - [ ] 1.3 Add inline theme initialization script in `<head>`
    - Read `localStorage["qx-theme"]` for user preference
    - Detect system preference with `prefers-color-scheme`
    - Set `data-theme` attribute on `<html>` element synchronously
    - Prevent theme flash on page load
    - _Requirements: 9.2, 9.4, 9.10_

- [ ] 2. Checkpoint - Verify CSS cleanup
  - Run `hugo server` and verify no custom CSS loads
  - Verify Quorix UI CSS loads successfully from CDN
  - Verify theme initialization script runs before first paint
  - Ask user if questions arise

### Phase 2: Base Template and Global Components

- [ ] 3. Restructure base template with Quorix UI structure
  - [ ] 3.1 Update `layouts/_default/baseof.html` HTML structure
    - Use semantic HTML5 elements (header, main, footer)
    - Add `qx-container` or `qx-container-lg` for main content wrapper
    - Ensure proper heading hierarchy
    - Add skip link for keyboard users
    - _Requirements: 2.7, 7.12, 12.10_
  
  - [ ] 3.2 Restructure header partial (`layouts/partials/header.html`)
    - Use `qx-navbar` structure for navigation
    - Use `qx-navbar-brand` for logo
    - Use `qx-navbar-nav` and `qx-navbar-link` for navigation links
    - Add theme toggle button with `data-qx-theme-toggle`
    - Implement mobile navigation using Quorix UI patterns
    - Add active page indicator with appropriate class
    - Ensure keyboard accessibility with visible focus
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.8, 15.9, 15.10_
  
  - [ ] 3.3 Restructure footer partial (`layouts/partials/footer.html`)
    - Use `qx-grid-2` or `qx-grid-3` for footer columns
    - Use semantic `<footer>` element
    - Display social links using `qx-btn-ghost`
    - Use `qx-text-muted` for copyright text
    - Use `qx-nav-item` for footer navigation
    - Ensure responsive layout on mobile
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.10_
  
  - [ ] 3.4 Create breadcrumbs partial (`layouts/partials/breadcrumbs.html`)
    - Use `qx-breadcrumbs` container
    - Use `qx-breadcrumb-item` for each breadcrumb
    - Add `aria-label="Breadcrumb"` for accessibility
    - Generate breadcrumbs from Hugo page hierarchy
    - _Requirements: 5.7, 12.3, 18.5_

- [ ] 4. Checkpoint - Test base template and global components
  - Verify navigation displays correctly on desktop and mobile
  - Verify theme toggle switches between light and dark modes
  - Verify theme preference persists across page loads
  - Verify footer displays correctly
  - Verify breadcrumbs generate correctly
  - Test keyboard navigation through header and footer
  - Ask user if questions arise

### Phase 3: Homepage Restructure

- [ ] 5. Restructure homepage layout
  - [ ] 5.1 Update `layouts/index.html` with Quorix UI components
    - Use `qx-container` or `qx-container-lg` for main wrapper
    - Implement hero section with proper heading hierarchy (h1 for page title)
    - Use `qx-grid-2` or `qx-grid-3` for post listings
    - Use `qx-card` for each post preview
    - Use `qx-badge-soft-*` or `qx-badge-*` for post categories
    - Use `qx-btn-primary` for primary CTA
    - Use `qx-btn-ghost` for secondary actions
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6, 10.8, 10.9_
  
  - [ ] 5.2 Ensure homepage responsive behavior
    - Test layout at 320px, 768px, 1024px, 1440px
    - Ensure grid collapses to 2 columns on tablet, 1 on mobile
    - Ensure touch targets are minimum 44x44px
    - Ensure text remains readable (minimum 16px on mobile)
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 10.7_
  
  - [ ] 5.3 Test homepage accessibility
    - Run Lighthouse accessibility audit (target score >95)
    - Verify all images have alt text
    - Verify proper heading hierarchy
    - Verify keyboard navigation works
    - Verify focus indicators are visible
    - Test with screen reader
    - _Requirements: 7.1, 7.2, 7.6, 10.9_

- [ ] 6. Checkpoint - Verify homepage
  - Verify homepage displays correctly in light and dark themes
  - Verify responsive behavior at all breakpoints
  - Verify all links and buttons work
  - Ask user if questions arise

### Phase 4: Post Templates Restructure

- [ ] 7. Restructure post single page
  - [ ] 7.1 Update `layouts/posts/single.html` with Quorix UI components
    - Use `qx-container-prose` for article content (max-width 60-80ch)
    - Add breadcrumbs using `layouts/partials/breadcrumbs.html`
    - Use proper typography scale from Quorix UI
    - Use `qx-callout-*` variants for special content blocks (warnings, info, success)
    - Display post metadata (date, reading time, category) with `qx-text-muted`
    - Use `qx-badge-*` for post tags
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.10_
  
  - [ ] 7.2 Implement table of contents (TOC) partial
    - Create or update `layouts/partials/toc.html`
    - Use `qx-nav-item` for TOC links
    - Add sticky positioning if appropriate
    - Ensure TOC is keyboard accessible
    - _Requirements: 12.6_
  
  - [ ] 7.3 Add related posts section
    - Display related posts using `qx-card` in `qx-grid-3`
    - Use `qx-btn-ghost` for "Read More" links
    - Ensure responsive behavior (2 columns on tablet, 1 on mobile)
    - _Requirements: 12.8_
  
  - [ ] 7.4 Test post single page accessibility
    - Run Lighthouse accessibility audit (target score >95)
    - Verify article content has proper contrast
    - Verify code blocks are readable
    - Verify keyboard navigation works
    - Test with screen reader
    - _Requirements: 7.1, 7.9, 12.10_

- [ ] 8. Restructure post list page
  - [ ] 8.1 Update `layouts/posts/list.html` with Quorix UI components
    - Use `qx-container` or `qx-container-lg` for main wrapper
    - Use `qx-grid-2` or `qx-grid-3` for post grid
    - Use `qx-card` for each post item
    - Display post metadata (date, reading time, category)
    - Use `qx-badge-soft-*` for categories/tags
    - Use `qx-badge-*` for post status or featured indicator
    - _Requirements: 11.1, 11.2, 11.3, 11.8, 11.9_
  
  - [ ] 8.2 Implement filter UI for categories and tags
    - Use `qx-badge-soft-*` for filter chips
    - Add active state styling for selected filters
    - Ensure filters are keyboard accessible
    - _Requirements: 11.4, 11.10_
  
  - [ ] 8.3 Add pagination controls
    - Use `qx-pagination` for pagination
    - Use `qx-page-btn` for page buttons
    - Ensure pagination is keyboard accessible
    - _Requirements: 11.6_
  
  - [ ] 8.4 Test post list page accessibility
    - Run Lighthouse accessibility audit (target score >95)
    - Verify keyboard navigation through post grid
    - Verify filter chips are accessible
    - Test with screen reader
    - _Requirements: 7.6, 11.10_

- [ ] 9. Checkpoint - Verify post templates
  - Verify post single page displays correctly with various content lengths
  - Verify TOC generates correctly
  - Verify related posts display correctly
  - Verify post list page displays correctly
  - Verify filters work correctly
  - Verify pagination works correctly
  - Test responsive behavior at all breakpoints
  - Ask user if questions arise

### Phase 5: Other Pages Restructure

- [ ] 10. Restructure projects page
  - [ ] 10.1 Update `layouts/projects/list.html` with Quorix UI components
    - Use `qx-container` or `qx-container-lg` for main wrapper
    - Use `qx-grid-2` or `qx-grid-3` for project grid
    - Use `qx-card` with distinct styling for project cards
    - Use `qx-badge-*` for project status or tech stack
    - Use `qx-btn-primary` for "View Project" CTA
    - Display project thumbnail using responsive images
    - Add hover effects using `qx-hover-lift` or similar
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 10.2 Implement project filter by technology or category
    - Use `qx-badge-soft-*` for filter chips
    - Add active state styling for selected filters
    - Ensure filters are keyboard accessible
    - _Requirements: 13.10_
  
  - [ ] 10.3 Test projects page accessibility
    - Run Lighthouse accessibility audit (target score >95)
    - Verify keyboard navigation through project grid
    - Verify all images have alt text
    - Test with screen reader
    - _Requirements: 7.2, 7.6_

- [ ] 11. Restructure services pages
  - [ ] 11.1 Update `layouts/services/list.html` with Quorix UI components
    - Use `qx-container` or `qx-container-lg` for main wrapper
    - Use `qx-grid-2` for services overview
    - Use `qx-card` with icon or image for each service
    - Use `qx-btn-primary` for "Contact" or "Learn More" CTA
    - Use `qx-callout-success` for service benefits
    - Use `qx-badge-*` for service categories
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ] 11.2 Update `layouts/services/single.html` with Quorix UI components
    - Use `qx-container-prose` for service description
    - Use `qx-tabs` for service details if multiple sections exist
    - Use `qx-callout-*` for important information
    - Add clear call-to-action with `qx-btn-primary`
    - _Requirements: 14.1, 14.8, 14.10_
  
  - [ ] 11.3 Test services pages accessibility
    - Run Lighthouse accessibility audit (target score >95)
    - Verify tabs work correctly (if implemented)
    - Verify keyboard navigation works
    - Test with screen reader
    - _Requirements: 7.6_

- [ ] 12. Restructure search page
  - [ ] 12.1 Update `layouts/_default/search.html` with Quorix UI components
    - Use `qx-container` for main wrapper
    - Use Quorix UI form input styling for search box
    - Use `qx-card` for search results
    - Use `qx-badge-*` for result categories
    - Display "no results" state using `qx-callout-info`
    - Display search results count
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.7, 17.10_
  
  - [ ] 12.2 Ensure search accessibility
    - Ensure search input has proper focus styling
    - Ensure search is keyboard accessible
    - Add appropriate ARIA labels
    - _Requirements: 17.6, 17.9_
  
  - [ ] 12.3 Test search functionality
    - Test search with various queries
    - Verify results display correctly
    - Verify "no results" state displays correctly
    - Test keyboard navigation through results
    - _Requirements: 17.6_

- [ ] 13. Restructure taxonomy pages
  - [ ] 13.1 Update taxonomy templates with Quorix UI components
    - Update `layouts/_default/taxonomy.html` or similar
    - Use `qx-badge-soft-*` for tag/category display
    - Use `qx-grid-3` for taxonomy term listings
    - Use `qx-card` for each term with post count
    - Use `qx-breadcrumbs` for taxonomy navigation
    - Use `qx-pagination` for paginated taxonomy archives
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.8_
  
  - [ ] 13.2 Test taxonomy pages accessibility
    - Run Lighthouse accessibility audit (target score >95)
    - Verify keyboard navigation works
    - Verify taxonomy filters are accessible
    - Test with screen reader
    - _Requirements: 18.9_

- [ ] 14. Checkpoint - Verify all pages
  - Verify projects page displays correctly
  - Verify services pages display correctly
  - Verify search page works correctly
  - Verify taxonomy pages display correctly
  - Test all pages in light and dark themes
  - Test responsive behavior at all breakpoints
  - Ask user if questions arise

### Phase 6: Interactive Features and Final Testing

- [ ] 15. Implement interactive features with data attributes API
  - [ ] 15.1 Implement tabs (if used in services or other pages)
    - Add `data-qx-tab="pane-id"` and `data-qx-tab-group="group-name"` on tab triggers
    - Add `data-qx-pane-group="group-name"` on panes
    - Add `is-active` class to active tab
    - Add `qx-d-none` to inactive panes
    - Test tab switching with mouse and keyboard
    - _Requirements: 6.1, 6.2, 6.8, 6.9_
  
  - [ ] 15.2 Implement modals (if used for confirmations or forms)
    - Add `data-qx-modal-target="modal-id"` on open triggers
    - Add `data-qx-dismiss` on close triggers
    - Use `qx-dialog-backdrop` with `qx-d-none` by default
    - Use `qx-dialog-panel` for modal content
    - Add `role="dialog"` and `aria-modal="true"` to modal
    - Add `aria-labelledby` pointing to modal title
    - Test modal open/close with mouse and keyboard
    - Test Escape key closes modal
    - Verify focus trap works within modal
    - Verify focus returns to trigger after modal closes
    - _Requirements: 6.3, 6.4, 6.7, 7.4, 7.5, 7.8_
  
  - [ ] 15.3 Verify theme toggle functionality
    - Verify theme toggle button has `data-qx-theme-toggle`
    - Verify clicking toggle switches theme
    - Verify theme persists in localStorage
    - Verify theme loads correctly on page refresh
    - Test in both light and dark modes
    - _Requirements: 6.5, 9.1, 9.2, 9.4_

- [ ] 16. Comprehensive accessibility testing
  - [ ] 16.1 Run Lighthouse accessibility audits on all pages
    - Homepage
    - Post single page
    - Post list page
    - Projects page
    - Services pages
    - Search page
    - Taxonomy pages
    - Target score: >95 for all pages
    - _Requirements: 7.1-7.12_
  
  - [ ] 16.2 Manual keyboard navigation testing
    - Test tab navigation through all interactive elements
    - Verify focus indicators are visible on all elements
    - Verify skip links work
    - Verify modal focus trap works
    - Verify focus returns correctly after modal closes
    - _Requirements: 7.1, 7.6, 7.7, 7.8, 7.12_
  
  - [ ] 16.3 Screen reader testing
    - Test with NVDA, JAWS, or VoiceOver
    - Verify all images have descriptive alt text
    - Verify all form inputs have labels
    - Verify modals announce correctly
    - Verify semantic HTML structure is logical
    - _Requirements: 7.2, 7.3, 7.11_
  
  - [ ] 16.4 Color contrast testing
    - Verify all text meets WCAG AA contrast (4.5:1 for normal, 3:1 for large)
    - Test in both light and dark themes
    - Use browser DevTools or contrast checker tools
    - _Requirements: 3.8, 7.9, 9.7_

- [ ] 17. Comprehensive responsive testing
  - [ ] 17.1 Test all pages at standard breakpoints
    - Test at 320px (small mobile)
    - Test at 640px (mobile)
    - Test at 768px (tablet)
    - Test at 1024px (desktop)
    - Test at 1440px (large desktop)
    - Verify layouts collapse appropriately
    - Verify no horizontal scrolling
    - Verify touch targets are minimum 44x44px on mobile
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.8_
  
  - [ ] 17.2 Test navigation on mobile
    - Verify navigation is accessible on mobile
    - Verify touch targets are adequate
    - Verify mobile menu works (if implemented)
    - _Requirements: 8.9_

- [ ] 18. Performance testing and optimization
  - [ ] 18.1 Run Lighthouse performance audits
    - Test homepage, post single, post list pages
    - Target performance score: >90
    - Target First Contentful Paint: <1.5s
    - Target Time to Interactive: <3s
    - Target Cumulative Layout Shift: <0.1
    - _Requirements: 19.7, 19.8, 19.9, 19.10_
  
  - [ ] 18.2 Verify asset loading optimization
    - Verify Quorix UI CSS loads from CDN
    - Verify images use lazy loading below the fold
    - Verify critical CSS is inlined (theme script)
    - Verify fonts load efficiently
    - _Requirements: 19.2, 19.3, 19.4, 19.6_

- [ ] 19. Cross-browser testing
  - [ ] 19.1 Test in modern browsers
    - Chrome (latest)
    - Firefox (latest)
    - Safari (latest)
    - Edge (latest)
    - Mobile Safari (iOS)
    - Chrome Mobile (Android)
    - Verify all layouts render correctly
    - Verify all interactive features work
    - Verify theme switching works
    - _Requirements: All requirements_

- [ ] 20. Final checkpoint and documentation
  - [ ] 20.1 Create component reference documentation
    - Document all Quorix UI classes used
    - Document component patterns and usage examples
    - Document responsive breakpoints and behavior
    - Document data attribute API usage
    - _Requirements: 20.1, 20.2, 20.3, 20.7_
  
  - [ ] 20.2 Verify Hugo build
    - Run `hugo server` and verify no errors
    - Run `hugo build` and verify successful build
    - Verify all pages generate correctly
    - Verify RSS feed generates
    - Verify JSON search index generates (if applicable)
    - _Requirements: All requirements_
  
  - [ ] 20.3 Final verification checklist
    - All custom CSS files removed from `assets/css/extended/`
    - All layouts use only Quorix UI classes
    - No inline styles or `<style>` tags
    - Theme toggle works and persists
    - All modals open/close correctly (if implemented)
    - All tabs switch correctly (if implemented)
    - Breadcrumbs display on all pages
    - Navigation is accessible on mobile
    - Footer displays correctly
    - Search functionality works
    - All pages pass Lighthouse accessibility audit (score >95)
    - All pages pass Lighthouse performance audit (score >90)
    - All pages tested at 320px, 768px, 1440px
    - All pages tested in light and dark themes
    - Keyboard navigation works for all interactive elements
    - Focus indicators are visible
    - Color contrast meets WCAG AA
    - Hugo builds without errors
    - _Requirements: All requirements_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each phase
- All implementation uses HTML + Hugo templates + Quorix UI CSS/JS
- No custom CSS, JavaScript, or non-Quorix UI classes allowed
- Follow `.agent-instructions.md` strictly for all Quorix UI class usage
- Test accessibility and responsive behavior continuously throughout implementation
