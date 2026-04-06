+++
title = "Một Link, Một Lần Đọc, và Rất Nhiều Thứ Để Nghĩ"
date = 2026-04-06T13:00:00+07:00
draft = false
comments = true
description = "Bài mở đầu series `one-time-link`: từ preview bot, race condition tới client-side encryption và trust model."
summary = "Một dự án nhìn nhỏ nhưng buộc mình phải nghĩ nghiêm túc về preview bot, atomic consume với Redis `GETDEL`, và client-side encryption để server không bao giờ thấy plaintext."
popularity = 0
editorPick = true
tldr = ["Nếu thiết kế kiểu 'mở link là reveal', preview bot của chat app có thể tiêu thụ secret trước người nhận.", "Tính năng one-time chỉ đáng tin khi thao tác consume là atomic; Redis `GETDEL` giải bài toán này gọn và đúng.", "Client-side encryption giúp server chỉ giữ ciphertext, còn key nằm trong fragment URL nên trust model tốt hơn nhiều."]
categories = ["Security", "Project Log"]
tags = ["System Design", "Security", "Redis", "Web Crypto", "Go"]
series = ["Xây dựng one-time-link"]
kicker = "Series mở đầu"
badges = ["Bài #1", "Milestone 1", "Trust Model", "Read-once UX"]

[[focusPoints]]
  title = "Preview bots"
  body = "Không thể để việc chat app lấy preview vô tình tiêu thụ secret trước người nhận."

[[focusPoints]]
  title = "Atomic consume"
  body = "Luồng one-time chỉ đáng tin khi thao tác đọc và xóa là một bước nguyên tử."

[[focusPoints]]
  title = "Client-side crypto"
  body = "Server chỉ giữ ciphertext, còn key nằm trong fragment URL để giảm mức độ phải tin hệ thống."

[seriesPreview]
  kicker = "Tiếp theo trong series"
  title = "Create-secret flow và mã hóa phía client"
  body = "Bài sau sẽ đi thẳng vào cách tạo secret trên frontend, dùng Web Crypto API để mã hóa trước khi gửi lên server, và chuẩn bị reveal flow đúng một lần."
  primaryLabel = "Theo dõi RSS"
  primaryUrl = "/index.xml"
  secondaryLabel = "Xem mục Bài viết"
  secondaryUrl = "/posts/"

[cover]
  image = "images/posts/one-time-link-bai-01-cover.svg"
  alt = "Cover cho bai viet one-time-link"
  caption = "Dự án nhỏ, nhưng buộc mình phải nghĩ kỹ về security, consistency và trust model."
  hiddenInList = false
  hiddenInSingle = false
+++

`one-time-link` nhìn qua giống một tiện ích nhỏ: nhập secret, tạo link, người nhận mở một lần rồi thôi. Nhưng càng nghĩ kỹ, mình càng thấy đây là một bài toán đủ sâu để buộc mình phải nghiêm túc với security, consistency và cả cách mình định nghĩa niềm tin giữa người dùng với hệ thống.

> Cái khó của `one-time-link` không nằm ở chuyện "tạo một link", mà nằm ở việc đảm bảo link đó chỉ được đọc đúng một lần, theo cách không phản lại kỳ vọng bảo mật của người dùng.

## Bài toán trông đơn giản đến mức đáng ngờ

Mình hình dung flow đầu tiên khá thẳng:

1. Người gửi nhập secret.
2. Hệ thống lưu lại và tạo link.
3. Người nhận mở link.
4. Hệ thống trả về secret.
5. Secret bị xóa.
6. Xong.

Nếu chỉ cần làm cho nó "chạy được", thì chừng đó là đủ. Nhưng nếu muốn nó thực sự đáng tin, dù chỉ cho một nhóm người dùng nhỏ, thì gần như mỗi bước trong flow trên đều ẩn chứa ít nhất một câu hỏi khó.

### Preview bots: kẻ thù thầm lặng

Đây là vấn đề thực tế đầu tiên mình gặp khi soi kỹ hơn vào trải nghiệm thật của người dùng.

Khi ai đó gửi một link qua Facebook, Slack, Discord hay bất kỳ nền tảng chat nào, gần như chắc chắn sẽ có một bot tự động truy cập link đó để lấy metadata như title, description hay preview image. Với link bài báo thì điều này hoàn toàn bình thường. Nhưng với một link "xem một lần", nó trở thành một lỗi sản phẩm rất nghiêm trọng: secret có thể bị consume trước khi người nhận thật sự bấm vào.

Kết quả là người nhận thấy thông báo kiểu "link đã được sử dụng", trong khi họ chưa đọc được gì cả.

Vì vậy, mình quyết định không thiết kế theo kiểu "truy cập là reveal". Người dùng phải thực hiện một hành động chủ động, ví dụ bấm nút xác nhận, thì hệ thống mới thật sự consume secret. Chỉ riêng ranh giới này thôi cũng đã thay đổi hoàn toàn cách mình nghĩ về UX của sản phẩm.

### Race condition: lỗi không nhìn thấy được

Vấn đề thứ hai nghe có vẻ lý thuyết hơn, nhưng hoàn toàn có thể xảy ra trong thực tế.

Hãy tưởng tượng hai request gần như đồng thời cùng cố đọc một secret. Nếu implementation theo kiểu đọc trước, xóa sau, và hai thao tác đó không phải atomic, thì cả hai request đều có thể nhìn thấy dữ liệu trước khi bản ghi bị xóa.

Với một hệ thống "one-time", đây không phải bug nhỏ. Đây là sự sụp đổ của chính tính năng cốt lõi.

Để tránh điều này, mình định hướng dùng Redis với `GETDEL`: đọc và xóa trong một bước nguyên tử. Không còn cửa để request thứ hai chen vào giữa.

### Plaintext trên server: tin tưởng thế nào cho đúng?

Đây là phần mình nghĩ lâu nhất.

Nếu server nhận plaintext, lưu plaintext rồi xóa sau khi đọc, thì về mặt kỹ thuật hệ thống vẫn "hoạt động". Nhưng trust model của nó rất yếu. Người dùng đang phải tin rằng server không log, không backup, không bị compromise, và không có bất kỳ chỗ nào vô tình để lộ dữ liệu.

Với một dịch vụ xử lý thông tin nhạy cảm, đó là quá nhiều niềm tin để yêu cầu.

Hướng mình muốn đi là client-side encryption:

- Secret được mã hóa ngay trên trình duyệt trước khi gửi lên.
- Server chỉ nhận và lưu ciphertext.
- Key giải mã nằm ở phần fragment của URL, tức phần sau dấu `#`.
- Fragment không được gửi lên server trong HTTP request thông thường.

Kết quả là ngay cả khi database bị lộ, attacker cũng chỉ có ciphertext mà không có key. Server bản thân nó không biết secret là gì. Đây không phải bảo mật tuyệt đối, nhưng là một trust model tốt hơn đáng kể so với kiểu "cứ tin server đi".

## Các quyết định kỹ thuật đã chốt

Một bài học mình rút ra khá sớm là: chốt những quyết định nền tảng từ đầu sẽ giúp mọi thứ phía sau nhất quán hơn rất nhiều.

| Thành phần | Quyết định | Lý do chốt sớm |
|---|---|---|
| Mã hóa | AES-GCM 256-bit, nonce 12 bytes, base64url | Đủ mạnh, phù hợp Web Crypto API, và gọn cho truyền tải qua URL/API. |
| Giới hạn dữ liệu | Plaintext tối đa 10 KB, request body tối đa 15 KB | Đủ cho mật khẩu, token, API key, nhưng không biến sản phẩm thành nơi lưu file tùy tiện. |
| TTL | 1 giờ, 24 giờ hoặc 7 ngày | Cân bằng giữa nhu cầu thật và độ phức tạp của sản phẩm. |
| API status | `pending`, `alreadyUsed`, `expired`, `notFound` | Giữ contract rõ ràng ngay từ đầu để frontend và backend nói cùng một ngôn ngữ. |

Khoảng cách giữa 10 KB plaintext và 15 KB request body là phần đệm dành cho overhead từ encryption và encoding. Đây là kiểu chi tiết nhỏ, nhưng nếu không nghĩ sớm thì sau này rất dễ vá víu.

Mình cũng quyết định rõ một điều khác: **Milestone 2 chưa implement reveal session**. Tính năng này giúp người dùng không mất secret nếu lỡ đóng tab, nhưng nó kéo theo thêm state, thêm edge case và thêm complexity. Giữ nó lại cho giai đoạn sau là một quyết định có chủ ý.

## Stack và lý do

- **Frontend** dùng React + TypeScript + Vite, với Web Crypto API cho phần mã hóa. Đây là lựa chọn tự nhiên nhất nếu muốn làm cryptography đúng cách ngay trong browser mà không ôm thêm dependency không cần thiết.
- **Backend** dùng Go. Lý do rất thực dụng: API nhỏ, binary gọn, dễ deploy, và là môi trường tốt để mình học sâu hơn về middleware, concurrency và vận hành thực tế.
- **Datastore** là Redis. TTL là tính năng native. `GETDEL` giải quyết race condition. Key-value model cũng khớp hoàn toàn với bài toán secret ngắn hạn. Dùng PostgreSQL ở giai đoạn này sẽ là over-engineering.

## Deployment: rẻ nhưng có suy nghĩ

Mình không có ngân sách lớn, nhưng vẫn muốn deployment đủ "ra hình" để có thể trình bày nghiêm túc.

Kế hoạch hiện tại:

- `quorix.io.vn` tiếp tục giữ trên Vercel.
- Frontend của `one-time-link` triển khai ở subdomain riêng, dự kiến là `secret.quorix.io.vn`.
- Backend Go + Redis chạy trên một VPS primary.
- Một VPS Oracle Cloud làm standby node để tăng tính sẵn sàng ở mức cơ bản và làm nơi học thêm về failover.

Mình không chọn active-active ngay từ đầu, và đây là quyết định có chủ ý. Bài toán one-time secret cực kỳ nhạy với race condition và state synchronization. Nếu hai node cùng có khả năng consume một secret mà chưa đồng bộ thật tốt, rủi ro tạo ra còn lớn hơn lợi ích.

Với giai đoạn đầu, active-passive đơn giản hơn, an toàn hơn, và đủ để học những thứ quan trọng về vận hành.

## Dự án đang ở đâu

Hiện tại, Milestone 1 đã hoàn thành phần nền:

- Tài liệu sản phẩm và deployment đã được viết khá đầy đủ.
- Frontend và backend đã được scaffold.
- Redis local chạy qua Docker Compose.
- Health endpoint cùng các middleware cơ bản như request ID, CORS, logging và size limiting đã có.
- API contract đã được chốt để frontend và backend bám cùng một source of truth.

Nói cách khác, phần "nghĩ cho đúng trước khi code mạnh tay" đã được làm nghiêm túc.

Bước tiếp theo sẽ đi vào create-secret flow, client-side encryption bằng Web Crypto API, và chuẩn bị reveal flow đúng một lần. Đó là lúc mọi thứ bắt đầu thật sự thú vị.

## Vì sao mình chọn viết series này

Mình thích những bài toán mà nhìn bề ngoài có vẻ đơn giản, nhưng bên dưới lại chạm vào rất nhiều thứ đáng suy nghĩ: security, consistency, system design, deployment và operations.

`one-time-link` đúng là như vậy. Nó không quá lớn để gây ngợp, nhưng đủ sâu để không thể làm hời hợt.

Với mình, một dự án portfolio tốt không chỉ là thứ "chạy được". Nó còn là bằng chứng cho cách mình tiếp cận một bài toán kỹ thuật: bắt đầu từ vấn đề thật, thiết kế cẩn thận, chọn trade-off hợp lý, rồi từng bước biến nó thành thứ có thể vận hành ngoài đời thực.

Đó là điều mình muốn `one-time-link` thể hiện, và cũng là lý do mình quyết định biến toàn bộ quá trình xây dựng nó thành một series.
