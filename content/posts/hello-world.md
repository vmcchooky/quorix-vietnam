+++
title = "Hello World"
date = 2026-03-28T17:30:00+07:00
draft = false
comments = true
+++

Dưới đây là cấu trúc khởi tạo một luồng mã hóa bảo mật cơ bản:

```go {linenos=table, hl_lines=["5-6", 9]}
package main

import (
	"crypto/aes"
	"crypto/cipher"
	"fmt"
)

func main() {
	key := []byte("AES256Key-32Characters1234567890")
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("Block size: %d bytes\n", block.BlockSize())
}