+++
title = "Quorix UI"
date = 2026-04-07T19:00:00+07:00
draft = false
summary = "Design-system foundation package của Quorix, hiện cung cấp reset, color tokens, typography tokens, utility classes và font brand để làm nền cho quorix-vietnam và các sản phẩm tiếp theo."
description = "Quorix UI là dịch vụ nền tảng đầu tiên trong nhánh Dịch vụ: một package UI dùng lại được, được xây cho chính hệ sinh thái Quorix và đủ linh hoạt để tiếp tục phát triển thành lớp foundation lớn hơn."
serviceType = "Design system foundation"
serviceStage = "Live on npm"
delivery = "npm + jsDelivr CDN"
packageName = "@quorix/ui"
packageVersion = "1.0.1"
github = "https://github.com/vmcchooky/quorix-ui"
npm = "https://www.npmjs.com/package/@quorix/ui"
cdn = "https://cdn.jsdelivr.net/npm/@quorix/ui@1.0.1/css/index.css"
demo = "quorix-ui"
highlights = [
  "Đồng bộ reset, typography và color tokens để nhiều bề mặt của Quorix không phải bắt đầu lại từ đầu.",
  "Cho phép dùng qua npm hoặc CDN nên phù hợp cả app có build pipeline lẫn landing page tĩnh.",
  "Đã có utility classes đủ để dựng nhanh hero, card, badge và technical copy theo đúng brand tone.",
]
roadmap = [
  "Mở rộng thêm spacing, radius, shadow và token cho layout.",
  "Bổ sung component primitives như button, input, card, badge, alert.",
  "Xây tài liệu và live preview sâu hơn để quorix-vietnam có thể trở thành nơi giới thiệu design system luôn.",
]
integrationPoints = [
  "Được định vị là lớp UI nền phục vụ trực tiếp cho quorix-vietnam thay vì một package tách rời khỏi thương hiệu.",
  "Cách tích hợp hiện tại dùng live preview cách ly để sau này có thể gắn thêm nhiều demo component mà không ảnh hưởng theme site.",
  "Khi package phát triển thêm, trang dịch vụ này có thể tiếp tục mở rộng thành hub tài liệu, playground và changelog cho hệ sinh thái UI của Quorix.",
]
+++

Quorix UI là ví dụ đầu tiên cho cách Quorix Việt Nam chuyển năng lực kỹ thuật thành một dịch vụ có thể dùng lại được. Nó không dừng ở việc "đăng package lên npm", mà đóng vai trò như lớp móng giao diện cho chính website này và những bề mặt sản phẩm sẽ xuất hiện tiếp theo.

## Vì sao Quorix UI được đặt trong nhánh Dịch vụ

Nhiều local brand kỹ thuật có rất nhiều ý tưởng, nhưng mỗi dự án lại bắt đầu từ con số 0 về giao diện. Quorix UI giải quyết đúng nút thắt đó: tạo một ngôn ngữ trực quan thống nhất đủ nhẹ để tái sử dụng, nhưng đủ mở để lớn dần theo nhu cầu thật.

Việc đặt nó trong nhánh `Dịch vụ` giúp website kể đúng câu chuyện hơn:

- Quorix không chỉ viết bài và làm project demo.
- Quorix cũng đang tạo ra những tài nguyên kỹ thuật có thể dùng được ngay.
- Các tài nguyên đó sinh ra để phục vụ hệ sinh thái Quorix trước, rồi mới mở rộng ra ngoài.

## Phạm vi hiện tại

Ở phiên bản hiện tại, package tập trung vào lớp foundation:

- `reset.css`
- `colors.css`
- `typography.css`
- `index.css` để gom toàn bộ trải nghiệm mặc định

Điều này rất phù hợp với giai đoạn đầu của brand site, vì nó giúp chuẩn hóa những thứ nền tảng nhất trước khi bước sang component hóa.

## Cách dùng nhanh

```bash
npm install @quorix/ui
```

```js
import '@quorix/ui/css/index.css';
```

Hoặc dùng trực tiếp qua CDN:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@quorix/ui@1.0.1/css/index.css"
/>
```

## Ý nghĩa với quorix-vietnam

Trang web này là nơi Quorix UI có ngữ cảnh sử dụng rõ ràng nhất. Mỗi lần website cần một lớp giao diện mới, đó cũng là cơ hội để tách ra thành token, utility hoặc component chuẩn hơn trong package. Nói cách khác, `quorix-vietnam` vừa là nơi giới thiệu, vừa là sân chạy thật cho design system của Quorix.

Đó là lý do khi triển khai trang dịch vụ này, cấu trúc được giữ theo hướng mở rộng:

1. Hôm nay là showcase cho token và typography.
2. Ngày mai có thể thêm component preview, usage guideline, changelog.
3. Sau đó có thể phát triển thành một docs hub đúng nghĩa cho toàn bộ lớp UI của Quorix.
