# คู่มือการติดตั้งและใช้งานระบบ S4C GPS Scintillation

## ภาพรวมของระบบ

ระบบ S4C GPS Scintillation ประกอบด้วยสองส่วนหลัก:

1. **Frontend (Web Application)** - แอปพลิเคชันเว็บสำหรับแสดงผลข้อมูล GPS Scintillation
   - Repository: https://github.com/Jaylaelike/s4c-gps-webapp
   - เทคโนโลยี: HTML, CSS, JavaScript

2. **Backend (API Services)** - บริการ API สำหรับจัดการข้อมูล Trajectory
   - Repository: https://github.com/Jaylaelike/s4c-trajectory-api-services
   - เทคโนโลยี: Python, FastAPI

---

## ความต้องการของระบบ

### ซอฟต์แวร์ที่จำเป็น
- **Docker** (แนะนำเวอร์ชัน 20.10 ขึ้นไป)
- **Docker Compose** (แนะนำเวอร์ชัน 1.29 ขึ้นไป)
- **Git** สำหรับดาวน์โหลดโค้ด
- **เว็บเบราว์เซอร์** ที่ทันสมัย (Chrome, Firefox, Safari, Edge)

### ข้อกำหนดระบบ
- **RAM**: อย่างน้อย 4 GB
- **Disk Space**: อย่างน้อย 10 GB
- **CPU**: 2 cores ขึ้นไป
- **ระบบปฏิบัติการ**: Windows 10/11, macOS, Linux

---

## การติดตั้งระบบ

### ขั้นตอนที่ 1: ติดตั้ง Docker และ Docker Compose

#### สำหรับ Windows
1. ดาวน์โหลด Docker Desktop จาก https://www.docker.com/products/docker-desktop
2. ติดตั้งและรันโปรแกรม
3. ตรวจสอบการติดตั้ง:
```bash
docker --version
docker-compose --version
```

#### สำหรับ macOS
1. ดาวน์โหลด Docker Desktop จาก https://www.docker.com/products/docker-desktop
2. ติดตั้งและรันโปรแกรม
3. ตรวจสอบการติดตั้ง:
```bash
docker --version
docker-compose --version
```

#### สำหรับ Linux (Ubuntu/Debian)
```bash
# ติดตั้ง Docker
sudo apt update
sudo apt install docker.io docker-compose -y

# เพิ่มผู้ใช้เข้า docker group
sudo usermod -aG docker $USER

# รีสตาร์ทระบบหรือ log out แล้ว log in ใหม่

# ตรวจสอบการติดตั้ง
docker --version
docker-compose --version
```

---

## การติดตั้ง Frontend (Web Application)

### ขั้นตอนที่ 1: ดาวน์โหลดโค้ด
```bash
# Clone repository
git clone https://github.com/Jaylaelike/s4c-gps-webapp.git

# เข้าไปในโฟลเดอร์โปรเจค
cd s4c-gps-webapp
```

### ขั้นตอนที่ 2: ตรวจสอบไฟล์
ตรวจสอบว่ามีไฟล์ต่อไปนี้ในโฟลเดอร์:
- `index.html` - หน้าเว็บหลัก
- `script.js` - โค้ด JavaScript
- `styles.css` - สไตล์การแสดงผล
- `Dockerfile` - สำหรับ build Docker image
- `docker-compose.yml` - สำหรับรันด้วย Docker Compose
- `data.csv` - ไฟล์ข้อมูลตัวอย่าง

### ขั้นตอนที่ 3: รันด้วย Docker Compose
```bash
# Build และรันระบบ
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps
```

### ขั้นตอนที่ 4: เข้าใช้งาน
เปิดเว็บเบราว์เซอร์และเข้าที่:
```
http://localhost:8080
```

### การปิดระบบ
```bash
# หยุดการทำงาน
docker-compose down

# หยุดและลบข้อมูลทั้งหมด
docker-compose down -v
```

---

## การติดตั้ง Backend (API Services)

### ขั้นตอนที่ 1: ดาวน์โหลดโค้ด
```bash
# Clone repository
git clone https://github.com/Jaylaelike/s4c-trajectory-api-services.git

# เข้าไปในโฟลเดอร์โปรเจค
cd s4c-trajectory-api-services
```

### ขั้นตอนที่ 2: ตรวจสอบโครงสร้างโปรเจค
```
s4c-trajectory-api-services/
├── backend/          # โค้ด Backend API
├── frontend/         # ไฟล์ Frontend (ถ้ามี)
├── data/             # ไฟล์ข้อมูล
├── docker-compose.yml
├── .gitignore
└── README.md
```

### ขั้นตอนที่ 3: รันด้วย Docker Compose
```bash
# Build และรันระบบ
docker-compose up -d

# ตรวจสอบ logs
docker-compose logs -f

# ตรวจสอบสถานะ
docker-compose ps
```

### ขั้นตอนที่ 4: ทดสอบ API
เปิดเว็บเบราว์เซอร์และทดสอบ API:

#### ดู API Documentation
```
http://localhost:8000/docs
```
หรือ
```
http://localhost:8000/redoc
```

#### ตัวอย่าง API Endpoints (ปรับตามโปรเจคจริง)
```bash
# ตรวจสอบสถานะ API
curl http://localhost:8000/

# ดึงข้อมูล trajectory
curl http://localhost:8000/api/trajectory

# ดึงข้อมูลด้วยพารามิเตอร์
curl http://localhost:8000/api/trajectory?date=2024-01-01
```

### การปิดระบบ
```bash
# หยุดการทำงาน
docker-compose down

# หยุดและลบข้อมูลทั้งหมด
docker-compose down -v
```

---

## การเชื่อมต่อ Frontend กับ Backend

### วิธีการ 1: รันทั้งสองระบบแยกกัน

1. **รัน Backend**:
```bash
cd s4c-trajectory-api-services
docker-compose up -d
# Backend จะรันที่ http://localhost:8000
```

2. **แก้ไขการเชื่อมต่อใน Frontend**:
แก้ไขไฟล์ `script.js` ใน Frontend:
```javascript
// แก้ไข API endpoint
const API_URL = 'http://localhost:8000/api';
```

3. **รัน Frontend**:
```bash
cd s4c-gps-webapp
docker-compose up -d
# Frontend จะรันที่ http://localhost:8080
```

### วิธีการ 2: รันด้วย Docker Compose เดียว

สร้างไฟล์ `docker-compose.yml` ใหม่ที่รวมทั้งสองระบบ:

```yaml
version: '3.8'

services:
  backend:
    build: ./s4c-trajectory-api-services/backend
    ports:
      - "8000:8000"
    volumes:
      - ./s4c-trajectory-api-services/data:/app/data
    environment:
      - ENV=production
    networks:
      - s4c-network

  frontend:
    build: ./s4c-gps-webapp
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks:
      - s4c-network

networks:
  s4c-network:
    driver: bridge
```

จากนั้นรัน:
```bash
docker-compose up -d
```

---

## การใช้งานระบบ

### 1. การเข้าใช้งานเว็บแอปพลิเคชัน
- เปิดเว็บเบราว์เซอร์ไปที่ `http://localhost:8080`
- หน้าเว็บจะแสดงข้อมูล GPS Scintillation

### 2. ฟีเจอร์หลักของระบบ (ตัวอย่าง)
- **แสดงผลข้อมูล GPS**: ดูข้อมูลตำแหน่ง GPS และค่า Scintillation
- **กรองข้อมูล**: กรองข้อมูลตามวันที่ เวลา หรือพื้นที่
- **แสดงผลแบบกราฟ**: ดูกราฟแสดงแนวโน้มข้อมูล
- **ดาวน์โหลดข้อมูล**: ส่งออกข้อมูลเป็นไฟล์ CSV

### 3. การใช้งาน API
```bash
# ดึงข้อมูลทั้งหมด
curl -X GET http://localhost:8000/api/trajectory

# ดึงข้อมูลตามวันที่
curl -X GET "http://localhost:8000/api/trajectory?start_date=2024-01-01&end_date=2024-01-31"

# ดึงข้อมูลตาม GPS ID
curl -X GET "http://localhost:8000/api/trajectory/GPS001"
```

---

## การแก้ไขปัญหาที่พบบ่อย

### 1. Docker ไม่สามารถรันได้
**ปัญหา**: Cannot connect to the Docker daemon
**วิธีแก้**:
```bash
# ตรวจสอบว่า Docker กำลังรันอยู่หรือไม่
sudo systemctl status docker

# เริ่มต้น Docker
sudo systemctl start docker

# (Windows/Mac) เปิด Docker Desktop
```

### 2. Port ถูกใช้งานอยู่แล้ว
**ปัญหา**: Port 8080 or 8000 is already in use
**วิธีแก้**:
```bash
# ตรวจสอบ process ที่ใช้ port
# Linux/Mac
lsof -i :8080
lsof -i :8000

# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :8000

# หยุด process หรือเปลี่ยน port ใน docker-compose.yml
```

### 3. Cannot fetch data from API
**ปัญหา**: Frontend ไม่สามารถดึงข้อมูลจาก Backend ได้
**วิธีแก้**:
1. ตรวจสอบว่า Backend รันอยู่:
```bash
curl http://localhost:8000
```

2. ตรวจสอบ CORS settings ใน Backend
3. ตรวจสอบ API URL ใน Frontend code

### 4. Docker build ล้มเหลว
**ปัญหา**: Build failed with error
**วิธีแก้**:
```bash
# ลบ cache แล้ว build ใหม่
docker-compose build --no-cache

# ตรวจสอบ logs
docker-compose logs
```

### 5. ข้อมูลไม่แสดงผล
**ปัญหา**: หน้าเว็บว่างเปล่า
**วิธีแก้**:
1. ตรวจสอบ Browser Console (F12 → Console)
2. ตรวจสอบว่าไฟล์ `data.csv` มีข้อมูล
3. ตรวจสอบ API response ใน Network tab

---

## การอัปเดตระบบ

### อัปเดต Frontend
```bash
cd s4c-gps-webapp
git pull origin main
docker-compose down
docker-compose up -d --build
```

### อัปเดต Backend
```bash
cd s4c-trajectory-api-services
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## การสำรองข้อมูล

### สำรองข้อมูล
```bash
# สำรองข้อมูลจาก Docker volume
docker-compose exec backend tar czf /tmp/backup.tar.gz /app/data
docker cp <container_id>:/tmp/backup.tar.gz ./backup.tar.gz

# หรือสำรองโฟลเดอร์ data โดยตรง
cp -r data/ backup_data_$(date +%Y%m%d)/
```

### กลับคืนข้อมูล
```bash
# คัดลอกข้อมูลกลับเข้า container
docker cp ./backup.tar.gz <container_id>:/tmp/
docker-compose exec backend tar xzf /tmp/backup.tar.gz -C /
```

---

## การกำหนดค่าเพิ่มเติม

### Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์โปรเจค:
```env
# Backend Configuration
API_PORT=8000
DATABASE_URL=sqlite:///./data/s4c.db
DEBUG_MODE=False

# Frontend Configuration
FRONTEND_PORT=8080
API_BASE_URL=http://localhost:8000
```

### Custom Configuration
แก้ไขไฟล์ `docker-compose.yml` เพื่อเพิ่มการกำหนดค่า:
```yaml
services:
  backend:
    environment:
      - API_PORT=${API_PORT}
      - DATABASE_URL=${DATABASE_URL}
      - DEBUG_MODE=${DEBUG_MODE}
```

---

## ข้อมูลเพิ่มเติม

### ติดต่อและสนับสนุน
- **Frontend Repository**: https://github.com/Jaylaelike/s4c-gps-webapp
- **Backend Repository**: https://github.com/Jaylaelike/s4c-trajectory-api-services
- **Issues**: สามารถรายงานปัญหาได้ที่หน้า Issues ของแต่ละ repository

### เอกสารอ้างอิง
- Docker Documentation: https://docs.docker.com/
- Docker Compose Documentation: https://docs.docker.com/compose/
- FastAPI Documentation: https://fastapi.tiangolo.com/ (สำหรับ Backend)

---

## สรุป

คู่มือนี้ครอบคลุมการติดตั้งและใช้งานระบบ S4C GPS Scintillation ทั้งส่วน Frontend และ Backend หากพบปัญหาหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อผ่าน GitHub Issues หรืออ้างอิงเอกสารที่แนะนำด้านบน

**หมายเหตุ**: คู่มือนี้อ้างอิงจากโครงสร้างโปรเจคที่มีอยู่ใน repositories ข้อมูลบางส่วนอาจต้องปรับแต่งตามการพัฒนาจริงของโปรเจค