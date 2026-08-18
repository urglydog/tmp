---
name: drawio-class-align
description: Sửa đổi, thiết kế và chuẩn hóa sơ đồ lớp (Class Diagram) trong Draw.io (.drawio XML) chuẩn UML 2.5 với định dạng Single-Cell HTML phẳng, phân biệt màu sắc Lớp/Interface/Enum, quy định quy cách Visibility (+, -, #, ~), các mối quan hệ (Kế thừa, Cấu thành, Gom tụ, Liên kết, Phụ thuộc) và bội số ở 2 đầu nét vẽ.
---

# Draw.io Class Diagram Standardization & Alignment Skill

Bộ quy tắc và kỹ năng chuyên biệt để chuyển đổi bất kỳ sơ đồ lớp (Class Diagram) thô hoặc lộn xộn trong Draw.io (định dạng XML) thành một sơ đồ lớp chuẩn mực UML 2.5, đúng cú pháp lập trình hướng đối tượng (OOP), phân bố không gian khoa học, nối kín mối quan hệ giữa các thực thể/dịch vụ/Enum và bảo đảm thẩm mỹ tối ưu.

---

## 1. Nguyên Tắc Thiết Kế Trực Quan & Cú Pháp UML (Visual & UML Syntax Standards)

### A. Quy Tắc Kỹ Thuật Khối Đơn Phẳng HTML (Single-Cell HTML Class Pattern)

Thay vì sử dụng các khung chứa phức tạp dễ bị lệch viền hoặc đứt nét khi di chuyển/phóng to thu nhỏ, mọi khối Lớp trong Draw.io **bắt buộc phải sử dụng định dạng ô đơn HTML (Single Cell HTML)** với các đường ngang `<hr/>` phân cách chuẩn UML 2.5:

```xml
<mxCell id="cls-example" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#DAE8FC;strokeColor=#6C8EBF;strokeWidth=1.5;fontSize=11;overflow=fill;" value="&lt;div style=&quot;text-align:center;font-weight:bold;font-size:13px;padding:4px;&quot;&gt;ClassName&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #6C8EBF;margin:2px 0;&quot;/&gt;&lt;div style=&quot;padding:2px 6px;&quot;&gt;- attribute1 : DataType&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #6C8EBF;margin:2px 0;&quot;/&gt;&lt;div style=&quot;padding:2px 6px;&quot;&gt;+ method1(param : Type) : ReturnType&lt;/div&gt;" vertex="1">
  <mxGeometry height="160" width="240" x="100" y="100" as="geometry" />
</mxCell>
```

---

### B. Cú Pháp Khai Báo Thuộc Tính & Phương Thức

1. **Ký hiệu Phạm vi truy cập (Visibility)**:
   - `-` (Private): Dành cho $100\%$ thuộc tính/biến thành viên để đảm bảo tính đóng gói (Encapsulation).
   - `+` (Public): Dành cho các phương thức (Methods), Service interfaces, Getters/Setters.
   - `#` (Protected): Dành cho thuộc tính/phương thức truy cập trong nội bộ lớp và các lớp con kế thừa.
   - `~` (Package/Default): Dành cho thuộc tính/phương thức trong cùng một Package.

2. **Cú pháp Thuộc tính (Attributes Syntax)**:
   $$\text{[visibility] } \text{attributeName : DataType}$$
   - *Ví dụ:* `- email : String`, `- createdAt : Date`, `- status : UserStatusEnum`

3. **Cú pháp Phương thức (Methods / Operations Syntax)**:
   $$\text{[visibility] } \text{methodName(parameterName : ParameterType) : ReturnType}$$
   - *Ví dụ:*
     - `+ login(credentials : LoginDTO) : String`
     - `+ calculateSpeedRate(origDuration : Double, expDuration : Double) : Double`
     - `+ processDubbingJob(lessonId : Long, lang : String) : AudioTrack`

---

### C. Bảng Mã Màu & Style XML Cho Các Loại Lớp

| Loại Cấu Phần Class | Style XML Chuẩn (Draw.io) | Mã Màu | Áp Dụng |
| :--- | :--- | :--- | :--- |
| **Lớp Thực Thể (Entity Class)** | `rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#DAE8FC;strokeColor=#6C8EBF;strokeWidth=1.5;fontSize=11;overflow=fill;` | Xanh nhạt (`#DAE8FC`) | Entity classes, Models (User, Course, Lesson) |
| **Giao Diện (Interface)** | `rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#FFF2CC;strokeColor=#D6B656;strokeWidth=1.5;fontSize=11;overflow=fill;` | Vàng nhạt (`#FFF2CC`) | `<<interface>>` Repository, Service interfaces |
| **Lớp Trừu Tượng (Abstract Class)** | `rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#E1D5E7;strokeColor=#9673A6;strokeWidth=1.5;fontSize=11;overflow=fill;` | Tím nhạt (`#E1D5E7`) | `<<abstract>>` BaseEntity, AbstractService |
| **Kiểu Liệt Kê (Enum)** | `rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#F5F5F5;strokeColor=#666666;strokeWidth=1.5;fontSize=11;overflow=fill;` | Xám nhạt (`#F5F5F5`) | `<<enum>>` RoleEnum, StatusEnum, MaterialTypeEnum |

---

### D. Mối Quan Hệ Giữa Các Lớp (Relationships & Style XML)

| Loai Quan Hệ UML | Ký Hiệu & Ý Nghĩa | Style XML Connector | Đầu Mũi Tên & Thuộc Tính |
| :--- | :--- | :--- | :--- |
| **Association (Liên kết)** | Nét liền ── (Quan hệ độc lập) | `endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;` | Không mũi tên + Bội số 2 đầu |
| **Dependency (Phụ thuộc / Enum Type)** | Nét đứt mũi tên mở ╌╌> (vd: User ╌╌> RoleEnum) | `endArrow=open;dashed=1;html=1;strokeColor=#444444;labelBackgroundColor=#FFFFFF;fontSize=11;` | Mũi tên nét đứt + Nhãn `<<type>>`, `<<processes>>` |
| **Composition (Cấu thành)** | Hình thoi đặc ◆── (Sống chết có nhau, vd: Course ◆── Chapter) | `startArrow=diamond;startSize=12;startFill=1;endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;` | Hình thoi đặc ở đầu gốc + Bội số |
| **Aggregation (Gom tụ)** | Hình thoi rỗng ◇── (Độc lập lỏng lẻo, vd: Lesson ◇── Material) | `startArrow=diamond;startSize=12;startFill=0;endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;` | Hình thoi rỗng ở đầu gốc + Bội số |
| **Inheritance / Generalization (Kế thừa)** | Nét liền tam giác rỗng ──▷ (vd: Student ──▷ User) | `endArrow=block;endSize=10;endFill=0;html=1;strokeColor=#000000;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;` | Tam giác rỗng ở lớp cha |
| **Realization / Implementation (Hiện thực Interface)** | Nét đứt tam giác rỗng ╌╌▷ (vd: UserServiceImpl ╌╌▷ UserService) | `endArrow=block;endSize=10;endFill=0;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;` | Nét đứt + Tam giác rỗng |

---

### E. Quy Tắc Bội Số (Multiplicity Rules)

Bội số **bắt buộc phải được ghi rõ ở 2 đầu đường nối** của quan hệ Association, Aggregation và Composition:
- `1`: Đúng 1 đối tượng.
- `0..1`: Không hoặc 1 đối tượng.
- `*` hoặc `0..*`: Nhiều (Zero đến nhiều).
- `1..*`: Một hoặc nhiều.

---

## 2. Quy Trình Tính Toán Tọa Độ & Mô Hình Bố Cục Lớp (Layout System)

Toàn bộ hệ thống được phân bổ theo mô hình **4 Cột Kiến Trúc** từ trái sang phải:

```
[ Cột 1: Enums & Interfaces ] -> [ Cột 2: Core Entities & AI Workers ] -> [ Cột 3: Domain Entities ] -> [ Cột 4: Detail Entities & Dubbing ]
```

1. **Cột 1 (Bên trái: `X = 50`)**: Chứa các khối Kiểu liệt kê `<<enum>>` (`RoleEnum`, `UserStatusEnum`) và tầng Service interfaces (`UserService`, `UserServiceImpl`).
2. **Cột 2 (Giữa trái: `X = 250 - 450`)**: Chứa các lớp Người dùng cốt lõi (`User`, `Student`, `Instructor`), Tiến độ (`Progress`) và các Tác tử AI (`VideoLingoDubbingService`, `SocraticTutorAgent`).
3. **Cột 3 (Giữa phải: `X = 880`)**: Chứa các thực thể Khóa học (`Course`) và Học liệu bổ trợ (`StudyMaterial`, `MaterialTypeEnum`).
4. **Cột 4 (Bên phải: `X = 1220 - 1520`)**: Chứa chi tiết Bài học (`Chapter`, `Lesson`), Âm thanh lồng tiếng (`AudioTrack`) và Trạng thái lồng tiếng (`DubbingStatusEnum`).

---

## 3. Bản Mẫu XML Snippets (Reference XML Templates)

### 1. Khối Thực Thể Lớp (Entity Class)
```xml
<mxCell id="cls-user" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#DAE8FC;strokeColor=#6C8EBF;strokeWidth=1.5;fontSize=11;overflow=fill;" value="&lt;div style=&quot;text-align:center;font-weight:bold;font-size:13px;padding:4px;&quot;&gt;User&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #6C8EBF;margin:2px 0;&quot;/&gt;&lt;div style=&quot;padding:2px 6px;&quot;&gt;- id : Long&lt;br/&gt;- fullName : String&lt;br/&gt;- email : String&lt;br/&gt;- password : String&lt;br/&gt;- role : RoleEnum&lt;br/&gt;- status : UserStatusEnum&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #6C8EBF;margin:2px 0;&quot;/&gt;&lt;div style=&quot;padding:2px 6px;&quot;&gt;+ verifyEmail() : Boolean&lt;/div&gt;" vertex="1">
  <mxGeometry height="180" width="240" x="380" y="60" as="geometry" />
</mxCell>
```

### 2. Khối Kiểu Liệt Kê Enum (Enum Class)
```xml
<mxCell id="enum-role" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;fillColor=#F5F5F5;strokeColor=#666666;strokeWidth=1.5;fontSize=11;overflow=fill;" value="&lt;div style=&quot;text-align:center;font-weight:bold;font-size:12px;padding:3px;&quot;&gt;&amp;lt;&amp;lt;enum&amp;gt;&amp;gt;&lt;br/&gt;RoleEnum&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #666666;margin:1px 0;&quot;/&gt;&lt;div style=&quot;padding:3px 6px;&quot;&gt;GUEST&lt;br/&gt;STUDENT&lt;br/&gt;INSTRUCTOR&lt;br/&gt;ADMIN&lt;/div&gt;" vertex="1">
  <mxGeometry height="120" width="160" x="50" y="60" as="geometry" />
</mxCell>
```

### 3. Mối Quan Hệ Phụ Thuộc Enum (`<<type>>` Edge)
```xml
<mxCell id="rel-role-user" edge="1" parent="1" source="cls-user" target="enum-role" style="endArrow=open;dashed=1;html=1;strokeColor=#444444;labelBackgroundColor=#FFFFFF;fontSize=11;exitX=0;exitY=0.2;entryX=1;entryY=0.5;" value="&amp;lt;&amp;lt;type&amp;gt;&amp;gt;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### 4. Mối Quan Hệ Cấu Thành (Composition Edge `◆──`) Kèm Bội Số
```xml
<mxCell id="rel-course-chapter" edge="1" parent="1" source="cls-course" target="cls-chapter" style="startArrow=diamond;startSize=12;startFill=1;endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;exitX=1;exitY=0.5;entryX=0;entryY=0.5;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
<mxCell id="lbl-c-m1" parent="rel-course-chapter" style="edgeLabel;html=1;align=center;verticalAlign=bottom;resizable=0;points=[];fontSize=11;" value="1" vertex="1" connectable="0">
  <mxGeometry x="-0.8" relative="1" as="geometry"><mxPoint y="-5" as="offset" /></mxGeometry>
</mxCell>
<mxCell id="lbl-c-m2" parent="rel-course-chapter" style="edgeLabel;html=1;align=center;verticalAlign=bottom;resizable=0;points=[];fontSize=11;" value="1..*" vertex="1" connectable="0">
  <mxGeometry x="0.8" relative="1" as="geometry"><mxPoint y="-5" as="offset" /></mxGeometry>
</mxCell>
```