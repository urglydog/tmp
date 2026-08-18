---
name: drawio-architecture-align
description: Sửa đổi, thiết kế và chuẩn hóa sơ đồ Kiến trúc hệ thống (Architecture Diagram) trong Draw.io (.drawio XML) thành dạng thẳng hàng, phân cụm rõ ràng, không chồng chéo, thẩm mỹ cao và áp dụng tổng quát cho đa dạng các kiểu kiến trúc phần mềm (Monolith, Modular Monolith, Microservices, Layered/Clean Architecture, Client-Server, Cloud-Native).
---

# Draw.io Architecture Diagram Standardization & Alignment Skill

Bộ quy tắc và kỹ năng chuyên biệt để chuyển đổi bất kỳ sơ đồ kiến trúc hệ thống (Architecture Diagram) thô hoặc lộn xộn trong Draw.io (định dạng XML) thành một sơ đồ kiến trúc chuyên nghiệp, phân cụm thẳng hàng tuyệt đối, trực quan và chuẩn hóa cao cho mọi quy mô dự án.

---

## 1. Nguyên Tắc Thiết Kế Trực Quan (Visual Design Standards)

Sử dụng bảng mã màu hài hòa, phân biệt rõ vai trò từng phân vùng kiến trúc và tối ưu hiển thị trên các nền Draw.io khác nhau:

| Loại Cấu Phần Architecture | Thuộc Tính Cấu Hình (Style XML) | Kích Thước Chuẩn | Ý Nghĩa / Áp Dụng |
| :--- | :--- | :--- | :--- |
| **Khung Phân Vùng (Boundary Container)** | `rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=#F8F9FA;strokeColor=#B0BEC5;verticalAlign=top;fontSize=14;fontStyle=1;align=center;` | Co giãn theo nội dung (`W x H`) | Bao bọc các cụm Tier, Layer, Subsystem hoặc Domain |
| **Người Dùng / Actor** | `shape=umlActor;verticalLabelPosition=bottom;labelBackgroundColor=none;verticalAlign=top;html=1;outlineConnect=0;fontSize=12;` | `40 x 80` | End-users, Admin, External Actor |
| **Ứng Dụng Client / Frontend** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#9DD0C7;strokeColor=#0E8074;fontColor=#FFFFFF;fontSize=13;fontStyle=1;` | `170 x 60` | Web SPA, Mobile App, Desktop Client |
| **Cổng Giao Tiếp (Gateway / Proxy / LB)** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#9673A6;strokeColor=#5D3D6B;fontColor=#FFFFFF;fontSize=13;fontStyle=1;` | `180 x 70` | API Gateway, Nginx, Load Balancer |
| **Khối Xử Lý Chính (Service / Module / Layer)** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#2F5B7C;strokeColor=#1A3A52;fontColor=#FFFFFF;fontSize=12;fontStyle=1;` | `200 x 60` | Business Logic Services, Modules, Controllers |
| **Cơ Sở Dữ Liệu (Database)** | `shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#CFD8DC;strokeColor=#546E7A;fontSize=12;fontStyle=1;` | `180 x 60` | Relational DB (MySQL/PostgreSQL), NoSQL |
| **Bộ Nhớ Đệm (Cache Store)** | `shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#FFE0B2;strokeColor=#FB8C00;fontSize=12;fontStyle=1;` | `180 x 60` | Redis, Memcached, In-Memory DB |
| **Trạm Thông Điệp (Event Broker / Queue)** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#FF9800;strokeColor=#E65100;fontColor=#FFFFFF;fontSize=12;fontStyle=1;` | `200 x 70` | RabbitMQ, Kafka, Event Bus, Pub/Sub |
| **Dịch Vụ Bên Ngoài (External API)** | `rounded=1;whiteSpace=wrap;html=1;fillColor=#E74C3C;strokeColor=#922B21;fontColor=#FFFFFF;fontSize=12;fontStyle=1;` | `200 x 60` | Payment Gateways, OAuth, Third-party APIs |

---

## 2. Quy Trình Tính Toán Tọa Độ & Bố Cục (Layout & Coordinate Formulas)

Có 2 phương pháp bố trí phổ biến tùy theo loại kiến trúc của dự án:

### Bố Cục A: Phân Tầng Theo Cột Ngang (Horizontal Tier Flow)
*Áp dụng cho: Microservices, Distributed Systems, Client-Server, Web APIs.*
1. **Chia các cột từ Trái sang Phải**:
   - Cột 1: Clients (`X_col1 = 40`)
   - Cột 2: Gateway / Load Balancer (`X_col2 = 320`)
   - Cột 3: Core Application / Services (`X_col3 = 740`)
   - Cột 4: Databases / Cache (`X_col4 = 1300`)
   - Cột 5: External Services (`X_col5 = 1600`)
2. **Khoảng cách trục dọc (Y-Axis spacing)**:
   - Các thành phần trong cùng 1 cột được đặt giãn đều với khoảng cách giữa 2 khối từ **30px đến 40px**.
   - Tọa độ Y của phần tử thứ $i$ (0-indexed) trong cột:
     $$y_i = Y_{\text{start}} + i \times (H_{\text{block}} + \text{gap}_y)$$

### Bố Cục B: Phân Tầng Theo Hàng Dọc (Vertical Layer Flow)
*Áp dụng cho: Monolith, Layered Architecture (Presentation -> Application -> Domain -> Infrastructure).*
1. **Chia các tầng từ Trên xuống Dưới**:
   - Tầng 1: Presentation Layer / UI (`Y_layer1 = 60`)
   - Tầng 2: Application / Controller Layer (`Y_layer2 = 220`)
   - Tầng 3: Business Domain / Service Layer (`Y_layer3 = 380`)
   - Tầng 4: Persistence / Infrastructure Layer (`Y_layer4 = 540`)
2. **Căn giữa và căn lề trục ngang (X-Axis alignment)**:
   - Tọa độ X trung tâm giữa các khối:
     $$x_i = X_{\text{container\_center}} - \frac{W_{\text{block}}}{2}$$

### Nguyên Tắc Định Tuyến Đường Nối (Connector & Routing Rules)
1. **Sử dụng đường nối vuông góc**: `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;`.
2. **Neo đúng điểm exit / entry**:
   - Giao tiếp ngang (từ Cột A $\rightarrow$ Cột B): `exitX=1;exitY=0.5;entryX=0;entryY=0.5;`.
   - Giao tiếp dọc (từ Tầng trên $\rightarrow$ Tầng dưới): `exitX=0.5;exitY=1;entryX=0.5;entryY=0;`.
3. **Màu sắc & Nhãn của đường nối**:
   - Giao tiếp đồng bộ (HTTP/gRPC/REST): Mũi tên nét liền `endArrow=classicThin;strokeColor=#000000;`.
   - Giao tiếp bất đồng bộ (Events/MQ): Nét đứt `dashed=1;strokeColor=#9673A6;`.
   - Nhãn giao tiếp (Label): Đặt `labelBackgroundColor=#FFFFFF;fontSize=10;` để chữ rõ ràng, không bị đè bởi đường kẻ.

---

## 3. Bản Mẫu XML (Reference XML Templates)

### 1. Khung Bao Cụm Phân Vùng (Boundary Container)
```xml
<mxCell id="grp-core" parent="1" style="rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=#F8F9FA;strokeColor=#B0BEC5;verticalAlign=top;fontSize=14;fontStyle=1;align=center;" value="Core Application Services" vertex="1">
  <mxGeometry height="600" width="360" x="700" y="40" as="geometry" />
</mxCell>
```

### 2. Thành Phần Khách Hàng (Client Component)
```xml
<mxCell id="cli-web" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#9DD0C7;strokeColor=#0E8074;fontColor=#FFFFFF;fontSize=13;fontStyle=1;" value="Web Client App&#xa;(React / Next.js)" vertex="1">
  <mxGeometry height="60" width="170" x="65" y="120" as="geometry" />
</mxCell>
```

### 3. Cổng API / Điều Hướng (API Gateway / Load Balancer)
```xml
<mxCell id="gw-api" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#9673A6;strokeColor=#5D3D6B;fontColor=#FFFFFF;fontSize=13;fontStyle=1;" value="API Gateway / Proxy&#xa;:8080" vertex="1">
  <mxGeometry height="70" width="180" x="350" y="115" as="geometry" />
</mxCell>
```

### 4. Khối Xử Lý Trung Tâm (Core Service / Module Block)
```xml
<mxCell id="svc-core" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#2F5B7C;strokeColor=#1A3A52;fontColor=#FFFFFF;fontSize=12;fontStyle=1;" value="Order Service&#xa;(Business Logic)&#xa;:8081" vertex="1">
  <mxGeometry height="60" width="200" x="780" y="120" as="geometry" />
</mxCell>
```

### 5. Cơ Sở Dữ Liệu (Database Cylinder)
```xml
<mxCell id="db-main" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#CFD8DC;strokeColor=#546E7A;fontSize=12;fontStyle=1;" value="Main Database&#xa;(PostgreSQL / MySQL)" vertex="1">
  <mxGeometry height="60" width="180" x="1310" y="120" as="geometry" />
</mxCell>
```

### 6. Trạm Thông Điệp Bất Đồng Bộ (Event Broker)
```xml
<mxCell id="evt-broker" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FF9800;strokeColor=#E65100;fontColor=#FFFFFF;fontSize=12;fontStyle=1;" value="Event Broker&#xa;(RabbitMQ / Kafka)" vertex="1">
  <mxGeometry height="70" width="200" x="780" y="450" as="geometry" />
</mxCell>
```

### 7. Dịch Vụ Bên Ngoài (External Third-party API)
```xml
<mxCell id="ext-payment" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#E74C3C;strokeColor=#922B21;fontColor=#FFFFFF;fontSize=12;fontStyle=1;" value="External Payment API&#xa;(Stripe / PayPal)" vertex="1">
  <mxGeometry height="60" width="200" x="1600" y="120" as="geometry" />
</mxCell>
```

### 8. Mũi Tên Giao Tiếp Đồng Bộ (Sync Edge - REST/gRPC)
```xml
<mxCell id="e-gw-svc" edge="1" parent="1" source="gw-api" target="svc-core" style="endArrow=classicThin;html=1;rounded=0;fontSize=10;labelBackgroundColor=#FFFFFF;exitX=1;exitY=0.5;entryX=0;entryY=0.5;edgeStyle=orthogonalEdgeStyle;" value="/api/v1/orders">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### 9. Mũi Tên Giao Tiếp Bất Đồng Bộ (Async Event Edge)
```xml
<mxCell id="e-svc-evt" edge="1" parent="1" source="svc-core" target="evt-broker" style="endArrow=classicThin;html=1;rounded=0;dashed=1;fontSize=10;fontColor=#E65100;labelBackgroundColor=#FFFFFF;strokeColor=#E65100;exitX=0.5;exitY=1;entryX=0.5;entryY=0;edgeStyle=orthogonalEdgeStyle;" value="Publish OrderCreated">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```
