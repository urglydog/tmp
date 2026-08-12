---
name: drawio-uc-align
description: Sửa đổi, thiết kế và chuẩn hóa sơ đồ Use Case (Use Case Diagram) trong Draw.io (.drawio XML) thành dạng phân cụm phân hệ (Subsystem Cards) gọn gàng, bố trí Actor hợp lý 2 bên, phân biệt màu đường nối từng Actor, đặt Use Case Đăng nhập trung tâm, hiển thị đầy đủ nhãn <<include>> / <<extend>> và áp dụng tổng quát cho mọi hệ thống phần mềm.
---

# Draw.io Use Case Diagram Standardization & Alignment Skill

Bộ quy tắc và kỹ năng chuyên biệt để chuyển đổi bất kỳ sơ đồ Use Case (Use Case Diagram) thô hoặc lộn xộn trong Draw.io (định dạng XML) thành một sơ đồ Use Case chuẩn mực UML, phân cụm phân hệ khoa học, phân biệt màu sắc đường nối theo Tác nhân và cực kỳ dễ đọc.

---

## 1. Nguyên Tắc Thiết Kế Trực Quan (Visual Design Standards)

### A. Bảng mã màu & Phong cách các Phần tử

| Loại Cấu Phần Use Case | Thuộc Tính Cấu Hình (Style XML) | Kích Thước Chuẩn | Ý Nghĩa / Áp Dụng |
| :--- | :--- | :--- | :--- |
| **Khung Bao Hệ Thống (System Boundary)** | `rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=none;strokeColor=#444444;strokeWidth=2;verticalAlign=top;fontSize=16;fontStyle=1;align=center;` | Co giãn bao trọn sơ đồ | Biên giới toàn bộ hệ thống |
| **Thẻ Phân Hệ (Subsystem Card)** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#D6D6D6;verticalAlign=top;fontSize=13;fontStyle=1;align=center;` | Co giãn theo lưới oval (`value=""`) | Khung phông nền phân cụm chức năng (không để chữ tiêu đề dư thừa) |
| **Tác Nhân Chính (Primary Actor - Trái)** | `shape=umlActor;verticalLabelPosition=bottom;labelBackgroundColor=none;verticalAlign=top;html=1;outlineConnect=0;fontSize=12;fontStyle=1;` | `40 x 80` | Người dùng trực tiếp (Guest, Student, Instructor) |
| **Tác Nhân Quản Trị (Secondary Actor - Phải)** | `shape=umlActor;verticalLabelPosition=bottom;labelBackgroundColor=none;verticalAlign=top;html=1;outlineConnect=0;fontSize=12;fontStyle=1;` | `40 x 80` | Tác nhân quản trị / hỗ trợ (Admin, Manager) |
| **Bong Bóng Use Case (Oval)** | `ellipse;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=12;align=center;` | `160-190` x `55-65` | Chức năng hệ thống (Đồng bộ màu xanh nhạt chuẩn) |
| **Use Case Đăng Nhập Trung Tâm** | `ellipse;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=13;fontStyle=1;align=center;` | `200-220` x `70` | Đặt chính giữa sơ đồ làm Use Case trung tâm |
| **Hệ Thống Tích Hợp Ngoài** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontSize=12;fontStyle=1;align=center;` | `180 x 60` | Third-party Systems (Payment, Mail, AI API) |

### B. Quy Tắc Phân Màu Đường Nối Theo Tác Nhân (Actor Line Color Coding)

Mỗi Actor kết nối với các Use Case **bắt buộc phải có 1 màu riêng biệt** với `strokeWidth=2;` để giúp người đọc phân biệt rõ quyền hạn:

| Vai Trò Actor | Mã Màu Nối (`strokeColor`) | Độ Dày Đường (`strokeWidth`) | Ý Nghĩa |
| :--- | :--- | :--- | :--- |
| **Guest / Khách vãng lai** | `#107C41` (Màu xanh lá) | `2` | Liên kết chức năng công khai (Tra cứu, Đăng ký, Đăng nhập) |
| **Student / Học viên** | `#0A59A7` (Màu xanh dương) | `2` | Liên kết chức năng học tập & tương tác AI |
| **Instructor / Giảng viên** | `#D85A00` (Màu cam) | `2` | Liên kết chức năng tạo nội dung & nạp bài giảng |
| **Admin / Quản trị viên** | `#C0392B` (Màu đỏ) | `2` | Liên kết chức năng quản trị, phân quyền & duyệt khóa học |
| **External Systems** | `#9673A6` (Màu tím) | `2` | Tích hợp các hệ thống/APIs bên ngoài |

---

## 2. Quy Trình Tính Toán Tọa Độ & Mô Hình Bố Cục (Layout Formulas & Patterns)

Sơ đồ Use Case chuẩn UML cần tuân theo mô hình **3 Cột & Trung Tâm Đăng Nhập**:

```
[ Primary Actors ]   <--->   [ Top Subsystems (Auth / Admin) ]   <--->   [ Secondary Actors ]
    (Bên trái)           \                  |                  /             (Bên phải)
                          --->  [ Center: Đăng nhập ]  <---
                         /                  |                  \
[ Primary Actors ]   <--->   [ Bottom Subsystems (Core Business) ] <--->  [ External APIs ]
```

### Pattern 1: Mô Hình Use Case Đăng Nhập Trung Tâm (Central Authentication Pattern)
1. **Vị trí**: Đặt Use Case `Đăng nhập hệ thống (JWT / OAuth2)` tại tọa độ trung tâm sơ đồ (giữa cụm trên và cụm dưới, e.g. `X = 650, Y = 415`).
2. **Kết nối Actor**: Tất cả các Actor có quyền truy cập hệ thống (`Guest`, `Student`, `Instructor`, `Admin`) đều nối đường đến `Đăng nhập`.
3. **Mối quan hệ `<<include>>`**: Tất cả các Use Case cần xác thực (như *Quản lý hồ sơ*, *Đăng ký khóa học*, *Tạo khóa học*, *Quản lý người dùng*) đều có mũi tên đứt nét `<<include>>` trỏ đến Use Case **Đăng nhập**.

### Pattern 2: Chuẩn Hóa Nhãn `<<include>>` và `<<extend>>`
Để nhãn chữ `<<include>>` và `<<extend>>` không bị biến mất hoặc mờ nhòe:
1. **Mã hóa XML Entity**: Bắt buộc dùng `value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;"` và `value="&amp;lt;&amp;lt;extend&amp;gt;&amp;gt;"`.
2. **Cấu hình Thẻ Nền Trắng (Badge)**: Bắt buộc thêm các thuộc tính style:
   `labelBackgroundColor=#FFFFFF;fontSize=11;fontColor=#333333;align=center;verticalAlign=middle;`
3. **Định hướng Mũi tên**:
   - `<<include>>`: Mũi tên đứt nét hướng từ **Use Case chính $\rightarrow$ Use Case phụ / bị bao hàm**.
   - `<<extend>>`: Mũi tên đứt nét hướng từ **Use Case mở rộng $\rightarrow$ Use Case gốc**.

### Pattern 3: Chuẩn Hóa Tên Use Case & Khung Bao
1. **Không chứa số thứ tự dư thừa**: Loại bỏ hoàn toàn các tiền tố chỉ số như `1.1`, `2.1`, `4.3` trong tên Use Case oval và tên Thẻ phân hệ. Dùng tên hành động cô đọng, tự nhiên.
2. **Khung bao phân hệ sạch**: Khung phông nền Thẻ phân hệ (Subsystem Card) đặt `value=""` để chỉ làm nhiệm vụ gom cụm hình học sạch sẽ, không có chữ tiêu đề dư thừa.

---

## 3. Bản Mẫu XML Snippets (Reference XML Templates)

### 1. Tác Nhân Với Màu Đường Nối Riêng (Actor Edge Setup)
```xml
<!-- Guest Line (Green #107C41) -->
<mxCell id="e-guest-login" edge="1" parent="1" source="actor-guest" target="uc-login" style="endArrow=none;html=1;strokeColor=#107C41;strokeWidth=2;exitX=1;exitY=0.5;entryX=0;entryY=0.2;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- Student Line (Blue #0A59A7) -->
<mxCell id="e-stu-dual" edge="1" parent="1" source="actor-student" target="uc-stu-dual" style="endArrow=none;html=1;strokeColor=#0A59A7;strokeWidth=2;exitX=1;exitY=0.6;entryX=0;entryY=0.5;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- Instructor Line (Orange #D85A00) -->
<mxCell id="e-inst-course" edge="1" parent="1" source="actor-instructor" target="uc-inst-course" style="endArrow=none;html=1;strokeColor=#D85A00;strokeWidth=2;exitX=1;exitY=0.3;entryX=0;entryY=0.5;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- Admin Line (Red #C0392B) -->
<mxCell id="e-adm-users" edge="1" parent="1" source="actor-admin" target="uc-adm-users" style="endArrow=none;html=1;strokeColor=#C0392B;strokeWidth=2;exitX=0;exitY=0.2;entryX=1;entryY=0.5;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### 2. Quan Hệ `<<include>>` Đạt Chuẩn Nhãn Trắng (Include Edge)
```xml
<mxCell id="e-inc-enroll-login" edge="1" parent="1" source="uc-stu-enroll" target="uc-login" style="endArrow=open;dashed=1;html=1;endSize=8;strokeColor=#444444;labelBackgroundColor=#FFFFFF;fontSize=11;fontColor=#333333;align=center;verticalAlign=middle;exitX=0.5;exitY=0;entryX=0.2;entryY=1;" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### 3. Quan Hệ `<<extend>>` Đạt Chuẩn Nhãn Trắng (Extend Edge)
```xml
<mxCell id="e-ext-socratic-dual" edge="1" parent="1" source="uc-stu-socratic" target="uc-stu-dual" style="endArrow=open;dashed=1;html=1;endSize=8;strokeColor=#444444;labelBackgroundColor=#FFFFFF;fontSize=11;fontColor=#333333;align=center;verticalAlign=middle;exitX=0.5;exitY=0;entryX=0.5;entryY=1;" value="&amp;lt;&amp;lt;extend&amp;gt;&amp;gt;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### 4. Use Case Đăng Nhập Trung Tâm (Central Login Oval)
```xml
<mxCell id="uc-login" parent="1" style="ellipse;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=13;fontStyle=1;align=center;" value="Đăng nhập hệ thống&#xa;(JWT / OAuth2 Google)" vertex="1">
  <mxGeometry height="70" width="220" x="650" y="415" as="geometry" />
</mxCell>
```

### 5. Khung Cụm Phân Hệ Sạch (Clean Subsystem Container Card)
```xml
<mxCell id="card-student" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#D6D6D6;verticalAlign=top;fontSize=13;fontStyle=1;align=center;" value="" vertex="1">
  <mxGeometry height="750" width="630" x="190" y="510" as="geometry" />
</mxCell>
```
