# Quy uoc popularity cho Posts (solo mode)

Tai lieu nay la huong dan nhanh de ban tu cap nhat `popularity` va `editorPick` cho bai viet trong `content/posts/*.md`.

## 1) Muc tieu

- `popularity`: diem tu 0-100 de sap xep muc "Pho bien".
- `editorPick`: chon bai ban muon day len muc "Bien tap de xuat" (`true/false`).

## 2) Du lieu dau vao (7 ngay gan nhat)

Moi bai lay 4 chi so:

1. `views_7d`
2. `unique_users_7d`
3. `avg_engagement_sec_7d`
4. `scroll_90_rate_7d` (0-1)

Neu bai moi < 7 ngay:

- Quy doi ve 7 ngay: `value_7d = value_since_publish / max(age_days, 1) * 7`

## 3) Cong thuc tinh popularity

Chuan hoa tung chi so theo min-max trong tap bai dang theo doi:

- `norm(x) = (x - min) / (max - min)`
- Neu `max = min` => dat `norm = 0`

Tinh diem:

- `score = 0.50*norm(views_7d) + 0.25*norm(unique_users_7d) + 0.15*norm(avg_engagement_sec_7d) + 0.10*norm(scroll_90_rate_7d)`
- `popularity = round(score * 100)`

## 4) Quy trinh cap nhat hang tuan (5-10 phut)

1. Lay so lieu 7 ngay tu analytics vao 1 bang (Google Sheet/Excel deu duoc).
2. Tinh `popularity` theo cong thuc tren.
3. Cap nhat front matter cho tung bai trong `content/posts/*.md`.
4. Dat `editorPick = true` cho 1-3 bai ban muon uu tien trong tuan.
5. Build kiem tra: `hugo --minify`.

## 5) Quy uoc fallback (khi thieu du lieu)

- Bai uu tien: `popularity = 80`
- Bai tieu chuan: `popularity = 50`
- Bai ngan/lab note: `popularity = 20`

## 6) Mau front matter

```toml
popularity = 87
editorPick = true
```

## 7) Ghi chu ca nhan

- `editorPick` la quyet dinh bien tap (chu dong), khong auto theo score.
- Neu khong cap nhat hang tuan, giao dien van chay binh thuong (chi mat do chinh xac ranking).
