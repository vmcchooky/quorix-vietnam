# Bugfix Requirements Document

## Introduction

Khi người dùng nhập từ khóa vào ô tìm kiếm (search input), các thông báo trạng thái và số lượng kết quả hiển thị chồng lên nhau hoặc ở vị trí không đúng. Cụ thể, text "Tổng số kết quả: 1 Kết quả gần nhất cho 'go'" xuất hiện với các phần text bị overlap, gây khó đọc và ảnh hưởng đến trải nghiệm người dùng.

Bug này xảy ra trong phần search UI, nơi có hai phần tử `<p>` riêng biệt (`searchStatus` và `searchResultCount`) được hiển thị trong container `.qx-search-meta` với layout flexbox.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN người dùng nhập từ khóa vào search input và có kết quả tìm kiếm THEN các text thông báo trong `.qx-search-meta` hiển thị chồng lên nhau hoặc bị overlap

1.2 WHEN cả `searchStatus` và `searchResultCount` đều có nội dung cùng lúc THEN layout flexbox với `flex-wrap: wrap` gây ra vấn đề về positioning và spacing không đúng

1.3 WHEN text dài (như "Kết quả gần nhất cho 'go'") được hiển thị THEN các phần tử có thể xuất hiện ở nhiều dòng khác nhau mà không có khoảng cách rõ ràng

### Expected Behavior (Correct)

2.1 WHEN người dùng nhập từ khóa vào search input và có kết quả tìm kiếm THEN các text thông báo trong `.qx-search-meta` SHALL hiển thị rõ ràng, không chồng lên nhau, với khoảng cách phù hợp

2.2 WHEN cả `searchStatus` và `searchResultCount` đều có nội dung cùng lúc THEN layout SHALL đảm bảo các phần tử được sắp xếp theo chiều dọc hoặc ngang với spacing đủ lớn để tránh overlap

2.3 WHEN text dài được hiển thị THEN các phần tử SHALL có khoảng cách rõ ràng giữa các dòng và không bị chồng lên nhau

### Unchanged Behavior (Regression Prevention)

3.1 WHEN chỉ có một trong hai phần tử (`searchStatus` hoặc `searchResultCount`) có nội dung THEN hệ thống SHALL CONTINUE TO hiển thị phần tử đó một cách bình thường

3.2 WHEN không có kết quả tìm kiếm hoặc đang loading THEN hệ thống SHALL CONTINUE TO hiển thị các thông báo trạng thái phù hợp

3.3 WHEN người dùng xóa nội dung search input THEN hệ thống SHALL CONTINUE TO ẩn các thông báo và reset về trạng thái ban đầu

3.4 WHEN responsive layout thay đổi (mobile/desktop) THEN hệ thống SHALL CONTINUE TO hiển thị search meta một cách responsive và phù hợp với kích thước màn hình
