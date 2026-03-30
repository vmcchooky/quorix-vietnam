+++
title = "Tổ chức thư mục internal/database trong Go"
date = 2026-03-29T10:00:00+07:00
draft = false
comments = true
popularity = 98
editorPick = true
tldr = ["Dùng internal/database để khóa phạm vi package nội bộ và giảm coupling.", "Tách rõ database, service, handler để kiến trúc backend Go dễ mở rộng.", "Trong production nên trả lỗi + cấu hình connection pool thay vì log.Fatalf trực tiếp."]
categories = ["Backend", "Programming"]
tags = ["Golang", "Architecture", "Database"]
+++

Khi mã nguồn Go phình to, việc đóng gói logic truy xuất dữ liệu là cần thiết. Khác với các ngôn ngữ khác, Go sử dụng thư mục `internal/` để ngăn chặn các package bên ngoài import ngược code của dự án.

## 1. Vì sao `internal/` quan trọng?

- Giúp ràng buộc phạm vi sử dụng package chỉ trong cùng module.
- Giảm rủi ro lộ API nội bộ và phụ thuộc chéo khó kiểm soát.
- Tăng tính maintainable khi team mở rộng và codebase lớn dần.

Với backend thực chiến, cấu trúc rõ ràng ngay từ đầu sẽ giảm chi phí refactor về sau.

## 2. Thiết lập thư mục Database

Bên trong `internal/database/`, kiến trúc chuẩn sẽ tách biệt phần kết nối (connection) và các truy vấn (queries).

```go {linenos=table}
// internal/database/db.go
package database

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
)

func NewConnection(dsn string) *sql.DB {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Database is unreachable: %v", err)
	}

	return db
}
```

## 3. Gợi ý cấu trúc thư mục đầy đủ

```text
internal/
  database/
    db.go
    migration.go
    user_queries.go
    project_queries.go
  service/
    user_service.go
    project_service.go
  handler/
    http/
      user_handler.go
      project_handler.go
```

Ý tưởng chính:

- `database/`: chỉ chứa kết nối và truy vấn SQL.
- `service/`: chứa business logic, gọi repository/query layer.
- `handler/`: xử lý HTTP request/response, validate input.

## 4. Cải tiến `NewConnection` theo hướng production

Mẫu dùng `log.Fatalf` phù hợp giai đoạn lab, nhưng production nên trả lỗi để tầng gọi quyết định cách xử lý:

```go {linenos=table}
func NewConnection(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(30 * time.Minute)

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return db, nil
}
```

Lợi ích:

- Có thể retry, fallback hoặc log theo chuẩn observability.
- Quản lý connection pool chủ động hơn, tránh nghẽn tài nguyên.

## 5. Phân lớp theo Repository Pattern (đề xuất)

Một cách tổ chức dễ mở rộng:

1. `repository interface` ở tầng service.
2. `postgres implementation` ở `internal/database`.
3. Unit test service bằng mock repository, không phụ thuộc DB thật.

Cách này giúp tăng tốc test và giảm coupling giữa business logic với SQL cụ thể.

## 6. Checklist khi scale dự án

- Tách model theo bounded context thay vì gom vào một package lớn.
- Chuẩn hóa transaction handling cho các thao tác ghi nhiều bước.
- Tạo package migration độc lập (`golang-migrate` hoặc `goose`).
- Dùng context timeout cho mọi truy vấn DB để tránh request treo.

## Kết luận

`internal/database` không chỉ là nơi đặt file kết nối DB, mà là nền móng kiến trúc backend Go theo hướng bền vững. Khi tách lớp rõ ràng và kiểm soát phạm vi package đúng chuẩn Go, dự án sẽ dễ bảo trì, dễ test và sẵn sàng mở rộng cho giai đoạn production.
