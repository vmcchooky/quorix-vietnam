+++
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
+++

<!--
Quy chuẩn media:
- Ưu tiên leaf bundle: content/posts/slug/index.md
- Ảnh local đặt cạnh index.md hoặc trong thư mục con rồi gọi bằng path tương đối
- Mermaid dùng fence ```mermaid {caption="..."}
- Xem thêm: .grow/hugo-media-guide.md
-->
