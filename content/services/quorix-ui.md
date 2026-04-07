---
title: "Quorix UI"
date: 2026-04-07T20:15:00+07:00
draft: false
summary: "Design system toolkit nền tảng của Quorix, cung cấp reset, color tokens, typography, font và utility classes để dùng chung cho quorix-vietnam và các dự án tiếp theo."
description: "Dịch vụ UI foundation đầu tiên của Quorix Việt Nam, phát triển để phục vụ trực tiếp quorix-vietnam và mở rộng dần thành lớp giao diện dùng chung cho các sản phẩm sau này."
tags: ["service", "ui", "design-system", "frontend"]
categories: ["Dịch vụ"]
---

`Quorix UI` là dịch vụ đầu tiên trong khu vực `Dịch vụ` của Quorix Việt Nam.

Đây là một package UI foundation được xây để làm nền giao diện dùng chung cho chính `quorix-vietnam`, đồng thời sẵn sàng mở rộng sang các dự án Quorix khác trong tương lai. Mục tiêu của nó không chỉ là "có một package CSS", mà là tạo ra một lớp ngôn ngữ giao diện thống nhất để không phải bắt đầu lại từ đầu ở mỗi dự án.

## Hiện tại có gì trong Quorix UI

Phiên bản hiện tại tập trung vào phần nền móng:

- CSS reset
- color tokens
- typography tokens
- font system
- utility classes cơ bản
- phát hành qua npm và CDN

Cấu trúc package hiện tại:

```text
css/
  colors.css
  index.css
  reset.css
  typography.css
fonts/
  AWSDiatypeRoundedSemi-Mono-Bold.woff2
  AWSDiatypeRoundedSemi-Mono-Regular.woff2
  FragmentMono-Regular.woff2
```

## Vì sao nó là một dịch vụ

Quorix UI được xem là một dịch vụ vì nó tạo ra giá trị dùng lại được cho toàn bộ hệ sinh thái Quorix:

- giúp `quorix-vietnam` có nền giao diện đồng nhất
- giảm thời gian setup UI cho các dự án mới
- tạo chỗ bám để sau này phát triển component, layout utilities và docs
- biến phần frontend foundation thành tài sản kỹ thuật có thể tái sử dụng

Nói ngắn gọn, đây là lớp UI dùng chung để Quorix có thể phát triển nhanh hơn nhưng vẫn giữ được bản sắc.

## Cách dùng

### npm

```bash
npm install @quorix/ui
```

```js
import '@quorix/ui/css/index.css';
```

### CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@quorix/ui@1.0.1/css/index.css"
/>
```

## Package info

- Package: `@quorix/ui`
- Version hiện tại: `1.0.1`
- GitHub: [vmcchooky/quorix-ui](https://github.com/vmcchooky/quorix-ui)
- npm: [@quorix/ui](https://www.npmjs.com/package/@quorix/ui)
- CDN: [jsDelivr](https://cdn.jsdelivr.net/npm/@quorix/ui@1.0.1/css/index.css)
- License: `MIT`

## Vai trò đối với quorix-vietnam

Đây là điểm rất quan trọng: `Quorix UI` được tạo ra trước hết để phục vụ chính website này.

Vì vậy khi package phát triển thêm trong tương lai, hướng đi sẽ không dừng ở font và colors. Những phần hợp lý để mở rộng tiếp gồm:

- spacing và sizing tokens
- border radius và shadow tokens
- button, input, card, badge, alert
- layout utilities
- theme presets
- tài liệu có live preview

Tức là trang dịch vụ này đang giới thiệu một nền móng đang sống và sẽ tiếp tục lớn lên cùng `quorix-vietnam`, chứ không phải một package đã "xong việc".
