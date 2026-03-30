+++
title = "Cấu hình OSPF Single-Area cơ bản trên Router Cisco"
date = 2026-03-29T08:00:00+07:00
draft = false
comments = true
popularity = 76
editorPick = false
tldr = ["Cấu hình OSPF process ID 1 cho mô hình 3 router trong Area 0.", "Quảng bá đúng network/wildcard để các router học route OSPF tự động.", "Xác minh bằng show ip ospf neighbor, show ip route ospf và kiểm tra ping liên vùng."]
categories = ["Networking", "Lab Note"]
tags = ["CCNA", "Routing", "OSPF"]
+++

Trong bài lab này, mục tiêu là thiết lập giao thức định tuyến OSPF (Open Shortest Path First) cho một mạng Single-Area (Area 0) để các Router có thể trao đổi bảng định tuyến tự động.

## 1. Mục tiêu Lab

- Nắm quy trình bật OSPF trên router Cisco theo chuẩn CCNA.
- Thiết lập OSPF process ID `1` cho mô hình 3 router.
- Quảng bá các mạng trực tiếp vào `Area 0`.
- Xác minh trạng thái láng giềng (neighbor) và bảng định tuyến OSPF.

## 2. Sơ đồ và yêu cầu

Mô hình gồm 3 router kết nối theo tam giác:

- `R1` kết nối với `R2` qua mạng `192.168.12.0/24`
- `R1` kết nối với `R3` qua mạng `192.168.13.0/24`
- `R2` kết nối với `R3` qua mạng `192.168.23.0/24`

Yêu cầu cấu hình:

- Kích hoạt OSPF process ID `1` trên tất cả router.
- Toàn bộ liên kết thuộc cùng một vùng `Area 0`.
- Cổng LAN (nếu có) đặt ở trạng thái `passive-interface` để không gửi hello không cần thiết.

## 3. Kế hoạch địa chỉ IP (tham chiếu)

| Router | Interface | IP Address | Ghi chú |
|---|---|---|---|
| R1 | G0/1 | 192.168.12.1/24 | Link R1-R2 |
| R1 | G0/2 | 192.168.13.1/24 | Link R1-R3 |
| R2 | G0/1 | 192.168.12.2/24 | Link R2-R1 |
| R2 | G0/2 | 192.168.23.2/24 | Link R2-R3 |
| R3 | G0/1 | 192.168.13.3/24 | Link R3-R1 |
| R3 | G0/2 | 192.168.23.3/24 | Link R3-R2 |

## 4. Lệnh cấu hình chi tiết

### 4.1 Cấu hình trên R1

```text {linenos=table}
R1> enable
R1# configure terminal
R1(config)# router ospf 1
R1(config-router)# network 192.168.12.0 0.0.0.255 area 0
R1(config-router)# network 192.168.13.0 0.0.0.255 area 0
R1(config-router)# passive-interface GigabitEthernet0/0
R1(config-router)# end
R1# write memory
```

### 4.2 Cấu hình trên R2

```text {linenos=table}
R2> enable
R2# configure terminal
R2(config)# router ospf 1
R2(config-router)# network 192.168.12.0 0.0.0.255 area 0
R2(config-router)# network 192.168.23.0 0.0.0.255 area 0
R2(config-router)# passive-interface GigabitEthernet0/0
R2(config-router)# end
R2# write memory
```

### 4.3 Cấu hình trên R3

```text {linenos=table}
R3> enable
R3# configure terminal
R3(config)# router ospf 1
R3(config-router)# network 192.168.13.0 0.0.0.255 area 0
R3(config-router)# network 192.168.23.0 0.0.0.255 area 0
R3(config-router)# passive-interface GigabitEthernet0/0
R3(config-router)# end
R3# write memory
```

## 5. Kiểm tra sau cấu hình

Sau khi cấu hình xong, chạy các lệnh sau để xác minh:

```text
show ip ospf neighbor
show ip route ospf
show ip ospf interface brief
```

Kỳ vọng:

- Mỗi router thấy đủ 2 neighbor ở trạng thái `FULL`.
- Bảng định tuyến xuất hiện route ký hiệu `O` (OSPF intra-area).
- Các mạng liên kết không trực tiếp phải ping qua lại thành công.

Ví dụ kiểm tra nhanh trên R1:

```text
R1# show ip ospf neighbor
R1# show ip route ospf
R1# ping 192.168.23.3
```

## 6. Các lỗi thường gặp và cách xử lý

1. Neighbor không lên `FULL`.
Nguyên nhân phổ biến: sai subnet mask, mismatch area, interface shutdown hoặc ACL chặn OSPF.

2. Không thấy route OSPF trong bảng định tuyến.
Nguyên nhân phổ biến: lệnh `network` sai wildcard mask, chưa quảng bá đúng interface.

3. Mất adjacency sau một thời gian.
Nguyên nhân phổ biến: timer hello/dead không đồng nhất hoặc interface flapping.

Lệnh kiểm tra bổ sung:

```text
show run | section router ospf
show ip protocols
show ip interface brief
```

## 7. Gợi ý mở rộng sau lab này

- Chuyển sang mô hình Multi-Area OSPF để tối ưu LSDB và khả năng mở rộng.
- Thực hành `default-information originate` để phát tán default route.
- So sánh hành vi hội tụ OSPF với RIPv2/EIGRP trong cùng topology.

## Kết luận

Lab này giúp bạn nắm vững quy trình cấu hình OSPF Single-Area theo chuẩn thực hành CCNA: bật process, quảng bá đúng mạng, đặt passive interface hợp lý và xác minh bằng lệnh show/ping. Khi thực hiện thành thục lab cơ bản này, bạn sẽ dễ dàng tiến lên các chủ đề nâng cao như OSPF multi-area, route summarization và redistribution.
