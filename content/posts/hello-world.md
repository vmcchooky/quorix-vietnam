+++
date = '2026-03-28T14:14:58+07:00'
draft = false
title = 'Hello World'

comments = true
+++

Dưới đây là cấu trúc khởi tạo một luồng mã hóa bảo mật cơ bản:



```go {linenos=table, hl\_lines=\["5-6", 9]}

package main



import (

&#x09;"crypto/aes"

&#x09;"crypto/cipher"

&#x09;"fmt"

)



func main() {

&#x09;key := \[]byte("AES256Key-32Characters1234567890")

&#x09;block, err := aes.NewCipher(key)

&#x09;if err != nil {

&#x09;	panic(err.Error())

&#x09;}

&#x09;fmt.Printf("Block size: %d bytes\\n", block.BlockSize())

}

```

