---
name: drawio-activity-align
description: Sửa đổi và chuẩn hóa sơ đồ Activity Diagram trong Draw.io (.drawio XML) thành dạng thẳng hàng, tinh gọn, không chồng chéo và có màu sắc thẩm mỹ chuẩn.
---

# Draw.io Activity Diagram Standardization & Alignment Skill

Bộ quy tắc và kỹ năng chuyên biệt để chuyển đổi bất kỳ sơ đồ hoạt động (Activity Diagram) thô hoặc lộn xộn trong Draw.io (định dạng XML) thành một sơ đồ chuyên nghiệp, thẳng hàng tuyệt đối, tinh gọn và thẩm mỹ cao.

## 1. Nguyên Tắc Thiết Kế Trực Quan (Visual Design Standards)

Sử dụng bảng mã màu đồng bộ, hiện đại và hỗ trợ tốt chế độ Sáng/Tối (Light/Dark mode) của Draw.io:

| Loại Cấu Phần | Thuộc Tính Cấu Hình (Style XML) | Kích Thước Chuẩn |
| :--- | :--- | :--- |
| **Phân làn (Swimlane)** | `swimlane;whiteSpace=wrap;` | Rộng tùy ý, Cao bằng nhau |
| **Điểm bắt đầu (Start State)** | `ellipse;shape=startState;fillColor=#000000;strokeColor=light-dark(#050505, #ff9090);` | `25 x 25` hoặc `30 x 30` |
| **Điểm kết thúc (End State)** | `ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=light-dark(#050505, #ff9090);` | `30 x 30` hoặc `40 x 40` |
| **Hộp hành động (Action Block)** | `strokeColor=#6c8ebf;rounded=1;fillColor=#dae8fc;` | Rộng `160` - `220`, Cao `50` - `60` |
| **Hình thoi quyết định (Rhombus)** | `rhombus;fillColor=#ffffc0;strokeColor=light-dark(#050505, #ff9090);` | Rộng `140`, Cao `90` |
| **Đường nối mũi tên (Edge/Connector)** | `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=open;endSize=8;endFill=1;strokeColor=light-dark(#050505, #ff9090);` | Không nét cong (`curved=1`) |

## 2. Quy Trình 3 Bước Chuẩn Hóa Sơ Đồ (Step-by-Step Standardization)

### Bước 1: Tính Toán Cột Trục Ngang (X-Axis Alignment)
Để có các mũi tên thẳng hàng đứng 100%, tất cả các phần tử cùng luồng phải có **cùng tọa độ tâm X**.
1. Định vị tọa độ bắt đầu `x` và chiều rộng `width` của từng Phân làn (Swimlane). Hai làn kề nhau phải có biên giáp nhau (không có khoảng trống):
   * *Ví dụ:* Làn 1 bắt đầu từ `100`, rộng `260` (kết thúc ở `360`). Làn 2 bắt đầu từ `360`, rộng `400` (kết thúc ở `760`).
2. Xác định các trục tâm (`X_center`) chính:
   * **Trục làn 1 (User)**: `X_user = X_start + width/2 = 100 + 130 = 230`.
   * **Trục làn 2 chính (System main)**: `X_system_main = 360 + 260 = 620` (lệch phải để chừa khoảng trống cho luồng rẽ nhánh lỗi).
   * **Trục làn 2 phụ (System exception)**: `X_system_err = 360 + 100 = 460`.
3. Đặt tọa độ `x` của mọi phần tử theo công thức:
   $$\text{x} = \text{X\_center} - \frac{\text{width}}{2}$$

### Bước 2: Tối Ưu Chiều Dọc & Tinh Gọn (Y-Axis & Height Optimization)
Giảm thiểu khoảng trống dư thừa để sơ đồ chặt chẽ, dễ đọc trên một trang:
1. Đặt khoảng cách dọc (`gap`) giữa 2 bước liên tiếp từ **40 đến 60 pixel**.
2. Rút ngắn các hình thoi rẽ nhánh từ kích thước khổng lồ (như `230x230`) về kích thước chuẩn `140x90` để tiết kiệm không gian dọc.
3. Đặt chiều cao của cả 2 swimlane bằng nhau và bắt đầu cùng một giá trị `y` (song song tuyệt đối). Chiều cao này phải vừa vặn bao trọn điểm kết thúc cộng thêm `50px` đệm dưới.

### Bước 3: Chuẩn Hóa Mũi Tên và Định Tuyến (Connector & Routing)
1. Thay đổi thuộc tính đường nối: loại bỏ `curved=1` (đường cong lượn) và `endArrow=block` (mũi tên đặc), thay bằng đường vuông góc `edgeStyle=orthogonalEdgeStyle;rounded=0` và mũi tên mở `endArrow=open`.
2. **Đường nối thẳng (dọc hoặc ngang)**:
   * Xóa toàn bộ nội dung tọa độ bên trong `<Array as="points">...</Array>` (để trống `<Array as="points" />`).
   * Sử dụng kết nối tâm: `exitX=0.5;exitY=1;entryX=0.5;entryY=0;` cho chiều dọc, và `exitX=1;exitY=0.5;entryX=0;entryY=0.5;` cho chiều ngang. Draw.io sẽ tự động vẽ một đường thẳng tắp tuyệt đối.
3. **Đường nối lặp ngược (Loop/Feedback Arrow)**:
   * Để tránh mũi tên đè lên chữ hoặc hộp hành động khác, hãy dẫn hướng đường nối đi vòng qua cạnh bên của khung.
   * Thêm đúng **một điểm bẻ góc** (`mxPoint`) trong danh sách điểm để tạo đường vòng vuông vắn.
   * *Ví dụ:* Nối từ hộp lỗi ở `y=1050` quay lại ô nhập liệu ở `y=750`. Đặt một `mxPoint` dẫn hướng tại vị trí trung gian nằm ngoài biên các hộp (`x=350`, `y=775`).

---

## 3. Bản Mẫu XML (Reference Templates)

### Điểm Bắt Đầu (Start State)
```xml
<mxCell id="startState-1" parent="1" style="ellipse;shape=startState;fillColor=#000000;strokeColor=light-dark(#050505, #ff9090);" value="" vertex="1">
  <mxGeometry height="25" width="25" x="217.5" y="130" as="geometry" />
</mxCell>
```

### Hộp Tiến Trình (Action Block)
```xml
<mxCell id="action-1" parent="1" style="strokeColor=#6c8ebf;rounded=1;fillColor=#dae8fc;" value="Nhập thông tin" vertex="1">
  <mxGeometry height="50" width="180" x="140" y="280" as="geometry" />
</mxCell>
```

### Hình Thoi Rẽ Nhánh (rhombus)
```xml
<mxCell id="decision-1" parent="1" style="rhombus;fillColor=#ffffc0;strokeColor=light-dark(#050505, #ff9090);" value="Hợp lệ?" vertex="1">
  <mxGeometry height="90" width="140" x="550" y="450" as="geometry" />
</mxCell>
```

### Đường Nối Thẳng Dọc (Straight Vertical Edge)
```xml
<mxCell id="edge-vertical" edge="1" parent="1" source="source-id" target="target-id" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=open;endSize=8;endFill=1;strokeColor=light-dark(#050505, #ff9090);exitX=0.5;exitY=1;entryX=0.5;entryY=0;">
  <mxGeometry relative="1" as="geometry">
    <Array as="points" />
  </mxGeometry>
</mxCell>
```

### Đường Nối Vòng Lặp Ngược (Loopback Edge)
```xml
<mxCell id="edge-loop" edge="1" parent="1" source="source-id" target="target-id" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=open;endSize=8;endFill=1;strokeColor=light-dark(#050505, #ff9090);exitX=0;exitY=0.5;entryX=0;entryY=0.5;">
  <mxGeometry relative="1" as="geometry">
    <Array as="points">
      <mxPoint x="350" y="775" />
    </Array>
  </mxGeometry>
</mxCell>
```
