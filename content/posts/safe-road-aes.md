+++
title = "Khởi tạo luồng mã hóa AES-256 cho Project Safe Road"
date = 2026-03-29T09:00:00+07:00
draft = false
comments = true
popularity = 120
editorPick = true
tldr = ["AES-256-GCM cung cấp cả mã hóa và xác thực dữ liệu trong một luồng xử lý.", "Nonce phải luôn duy nhất với mỗi key và key AES-256 phải đủ 32 bytes.", "Nên đi kèm hàm Decrypt, key management và test round-trip Encrypt/Decrypt."]
categories = ["Security", "Project"]
tags = ["Golang", "Cryptography", "AES"]
+++

Một trong những module cốt lõi của Safe Road là đảm bảo tính toàn vẹn và bảo mật dữ liệu khi truyền tải. Việc lựa chọn AES-256 ở chế độ GCM (Galois/Counter Mode) cung cấp cả tính năng mã hóa (encryption) và xác thực (authentication).

## 1. Mục tiêu kỹ thuật

- Mã hóa dữ liệu nhạy cảm trước khi ghi xuống storage hoặc truyền qua API.
- Chống chỉnh sửa dữ liệu trái phép bằng cơ chế authentication tag của GCM.
- Chuẩn hóa một hàm `Encrypt` có thể tái sử dụng ở nhiều module backend.

## 2. Vì sao chọn AES-256-GCM?

- `AES-256` là chuẩn mã hóa đối xứng mạnh, phổ biến trong các hệ thống production.
- `GCM` là chế độ AEAD (Authenticated Encryption with Associated Data), giúp mã hóa và xác thực trong một bước.
- Hiệu năng tốt, được hỗ trợ trực tiếp bởi Go Standard Library.

Lưu ý quan trọng:

- Khóa phải có đúng độ dài 32 bytes cho AES-256.
- `nonce` không được tái sử dụng với cùng một key.
- Không tự cắt bỏ hoặc chỉnh sửa tag xác thực của ciphertext.

## 3. Cấu trúc mã hóa với Golang

Gói `crypto/aes` và `crypto/cipher` trong Go Standard Library được sử dụng để xử lý luồng này.

```go {linenos=table, hl_lines=["12-14"]}
package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"io"
)

// Encrypt mã hóa plaintext sử dụng AES-256-GCM
func Encrypt(plaintext []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	return ciphertext, nil
}
```

Trong đoạn mã trên:

- `aes.NewCipher(key)` khởi tạo block cipher từ key đầu vào.
- `cipher.NewGCM(block)` tạo AEAD instance theo chuẩn GCM.
- `nonce` được sinh ngẫu nhiên từ `crypto/rand`, đảm bảo tính an toàn mật mã.
- `Seal` trả về chuỗi đã mã hóa kèm tag xác thực; ở đây nonce được prepend vào đầu để tiện giải mã.

## 4. Bổ sung hàm giải mã (khuyến nghị)

Trong thực tế, module mã hóa nên đi kèm hàm `Decrypt` để hoàn chỉnh vòng đời dữ liệu:

```go {linenos=table}
func Decrypt(ciphertext []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, io.ErrUnexpectedEOF
	}

	nonce, payload := ciphertext[:nonceSize], ciphertext[nonceSize:]
	return aesGCM.Open(nil, nonce, payload, nil)
}
```

## 5. Cách quản lý key an toàn

1. Không hard-code key trong source code hoặc commit lên Git.
2. Lưu key trong secrets manager hoặc biến môi trường có kiểm soát quyền truy cập.
3. Có quy trình key rotation định kỳ cho môi trường production.
4. Tách key cho từng môi trường (`dev`, `staging`, `prod`).

## 6. Kiểm thử nhanh

Một test nhỏ để đảm bảo chu trình mã hóa/giải mã hoạt động đúng:

```go {linenos=table}
func TestEncryptDecrypt(t *testing.T) {
	key := []byte("12345678901234567890123456789012") // 32 bytes
	plain := []byte("safe road payload")

	enc, err := Encrypt(plain, key)
	if err != nil {
		t.Fatal(err)
	}

	dec, err := Decrypt(enc, key)
	if err != nil {
		t.Fatal(err)
	}

	if string(dec) != string(plain) {
		t.Fatalf("expected %s, got %s", plain, dec)
	}
}
```

## 7. Lỗi thường gặp

- `crypto/aes: invalid key size`: key không đúng 16/24/32 bytes.
- `cipher: message authentication failed`: ciphertext hoặc nonce bị sai/biến đổi, hoặc key không đúng.
- Reuse nonce với cùng key: rủi ro nghiêm trọng, làm giảm an toàn dữ liệu.

## Kết luận

Việc chuẩn hóa AES-256-GCM ngay từ lớp backend giúp Safe Road có nền tảng bảo mật vững chắc cho dữ liệu nhạy cảm. Khi kết hợp quản lý key đúng cách và kiểm thử đầy đủ, module này sẽ trở thành một trong những thành phần đáng tin cậy nhất của hệ thống.
