---
name: drawio-sequence-align
description: Sửa đổi và chuẩn hóa sơ đồ trình tự (Sequence Diagram) trong Draw.io (.drawio XML) thành dạng thẳng hàng, tinh gọn, kế thừa mẫu trực quan chuẩn và tự động co giãn kích thước theo số lượng thông điệp.
---

# Draw.io Sequence Diagram Standardization & Alignment Skill

Bộ quy tắc và kỹ năng chuyên biệt để chuyển đổi bất kỳ sơ đồ trình tự (Sequence Diagram) thô hoặc lộn xộn trong Draw.io (định dạng XML) thành một sơ đồ chuyên nghiệp, thẳng hàng đứng/ngang tuyệt đối, tinh gọn và thẩm mỹ cao.

## 1. Nguyên Tắc Thiết Kế Trực Quan (Visual Design Standards)

Sử dụng bảng mã màu, font chữ và phong cách đường nét UML chuẩn mực, kế thừa trực tiếp từ tệp mẫu `sequence-templates.drawio`:

| Loại Cấu Phần                        | Thuộc Tính Cấu Hình (Style XML)                                                                                                                                                                                                                     | Kích Thước Chuẩn                                            | Tọa Độ Định Vị                                                                                |
| :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Đường đời (Lifeline)**             | `shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;rounded=1;shadow=0;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=15;align=center;` | Rộng `100`, Cao `H` (tự động co giãn theo số lượng message) | `y = 80`, `x = 100 + i * 160` (các lifeline cách nhau `160px`)                                |
| **Thanh kích hoạt (Activation Bar)** | `html=1;points=[];perimeter=orthogonalPerimeter;rounded=0;shadow=0;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;`                                                                                    | Rộng `10`, Cao `H - 160`                                    | Là con của Lifeline: `x = 45`, `y = 100` tương đối                                            |
| **Mũi tên gọi (Sync Call)**          | `html=1;verticalAlign=bottom;endArrow=block;labelBackgroundColor=none;fontFamily=Verdana;fontSize=12;`                                                                                                                                              | Nét liền, mũi tên đặc                                       | Nối giữa hai Activation Bar: `exitX = 1/0`, `exitY = ratio`, `entryX = 0/1`, `entryY = ratio` |
| **Mũi tên phản hồi (Reply)**         | `html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;labelBackgroundColor=none;fontFamily=Verdana;fontSize=12;`                                                                                                                            | Nét đứt, mũi tên mở                                         | Nối giữa hai Activation Bar: `exitX = 1/0`, `exitY = ratio`, `entryX = 0/1`, `entryY = ratio` |
| **Tự gọi (Self-Message)**            | `html=1;verticalAlign=bottom;endArrow=block;labelBackgroundColor=none;fontFamily=Verdana;fontSize=12;elbow=vertical;edgeStyle=orthogonalEdgeStyle;curved=1;`                                                                                        | Nét liền, uốn vuông góc                                     | Nối về chính mình: `exitX = 1`, `exitY = ratio1`, `entryX = 1`, `entryY = ratio2`             |
| **Ghi chú (Note)**                   | `shape=note;whiteSpace=wrap;html=1;size=14;verticalAlign=top;align=left;spacingTop=-6;rounded=0;shadow=0;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;`                                                           | Rộng `100`, Cao `35`                                        | Nằm phía trên Lifeline: `y = 30`                                                              |

---

## 2. Quy Trình Tính Toán Tọa Độ Tự Động (Coordinate System Formulas)

Để đảm bảo sơ đồ hoàn hảo về mặt toán học và các mũi tên nằm ngang tắp tuyệt đối:

### Bước 1: Phân bố trục ngang (X-Axis Layout)

1. Lifelines nằm song song trên trục ngang, cách nhau một khoảng cách cố định là **160 pixel** (tính từ tâm của hộp tiêu đề).
2. Tọa độ `x` của Lifeline thứ `idx` (0-indexed) được tính theo công thức:
   $$x_{\text{lifeline}} = 100 + \text{idx} \times 160$$
3. Thanh kích hoạt (Activation Bar) là phần tử con trực tiếp của Lifeline, có chiều rộng `10px` và luôn được căn vào giữa Lifeline (rộng `100px`) bằng tọa độ tương đối cố định:
   $$x_{\text{activation\_relative}} = \frac{100 - 10}{2} = 45$$

### Bước 2: Co giãn trục dọc theo số lượng thông điệp (Y-Axis Scaling)

1. Để tránh các thông điệp đè lên nhau, khoảng cách dọc (`gap`) giữa các thông điệp liên tiếp phải từ **50 đến 55 pixel**.
2. Chiều cao của Lifeline (`H`) và Activation Bar (`H_act`) tự động co giãn theo số lượng thông điệp (`M`) của sơ đồ:
   $$H = 120 + M \times 55 + 50$$
   $$H_{\text{act}} = H - 160$$
3. Tọa độ dọc tuyệt đối của thông điệp thứ `j` (0-indexed) trên trang vẽ là:
   $$y_{\text{message}} = 200 + j \times 55$$

### Bước 3: Neo điểm kết nối và Tính tỉ lệ (Message Ratio)

Mũi tên thông điệp nối giữa hai Activation Bars phải nằm ngang tắp tuyệt đối. Do đó, điểm xuất phát (`exitY`) và điểm đích (`entryY`) trên hai Activation Bars tương ứng phải có cùng một tỉ lệ dọc (`ratio`):

1. Tọa độ dọc tương đối của thông điệp thứ `j` so với đỉnh của Activation Bar (bắt đầu ở tuyệt đối `y = 180` trên trang) là:
   $$y_{\text{rel}} = y_{\text{message}} - 180 = 20 + j \times 55$$
2. Tỉ lệ dọc `ratio` được đặt trong thuộc tính `exitY` và `entryY` của Edge XML:
   $$\text{ratio} = \frac{y_{\text{rel}}}{H_{\text{act}}} = \frac{20 + j \times 55}{H - 160}$$
3. Định hướng hướng mũi tên (`exitX` và `entryX`):
   - **Từ trái sang phải:** `exitX = 1`, `entryX = 0`.
   - **Từ phải sang trái:** `exitX = 0`, `entryX = 1`.

---

## 3. Bản Mẫu XML (Reference Templates)

### Đường Đời (Lifeline Element)

```xml
<mxCell id="p-uc01-U" parent="1" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;rounded=1;shadow=0;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=15;align=center;" value="User" vertex="1">
  <mxGeometry height="845" width="100" x="100" y="80" as="geometry" />
</mxCell>
```

### Thanh Kích Hoạt (Activation Bar Element)

```xml
<mxCell id="act-uc01-U" parent="p-uc01-U" style="html=1;points=[];perimeter=orthogonalPerimeter;rounded=0;shadow=0;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" value="" vertex="1">
  <mxGeometry height="685" width="10" x="45" y="100" as="geometry" />
</mxCell>
```

### Thông Điệp Gọi Thông Thường (Sync Message Edge)

```xml
<mxCell id="edge-uc01-0" edge="1" parent="1" source="act-uc01-U" target="act-uc01-C" style="html=1;verticalAlign=bottom;endArrow=block;labelBackgroundColor=none;fontFamily=Verdana;fontSize=12;exitX=1;exitY=0.029;entryX=0;entryY=0.029;" value="Nhập thông tin đăng ký">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### Thông Điệp Phản Hồi (Reply Message Edge)

```xml
<mxCell id="edge-uc01-3" edge="1" parent="1" source="act-uc01-DB" target="act-uc01-API" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;labelBackgroundColor=none;fontFamily=Verdana;fontSize=12;exitX=0;exitY=0.161;entryX=1;entryY=0.161;" value="User data / null">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### Thông Điệp Tự Gọi (Self-Message Edge)

```xml
<mxCell id="edge-uc30-2" edge="1" parent="1" source="act-uc30-AM" target="act-uc30-AM" style="html=1;verticalAlign=bottom;endArrow=block;labelBackgroundColor=none;fontFamily=Verdana;fontSize=12;elbow=vertical;edgeStyle=orthogonalEdgeStyle;curved=1;exitX=1;exitY=0.250;entryX=1;entryY=0.350;" value="check rules keywords">
  <mxGeometry relative="1" as="geometry">
    <Array as="points">
      <mxPoint x="795" y="290" />
      <mxPoint x="795" y="310" />
    </Array>
  </mxGeometry>
</mxCell>
```
