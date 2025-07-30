# PO to CSV Converter

เครื่องมือสำหรับแปลงไฟล์ .po เป็นรูปแบบ CSV เพื่อการจัดการคำแปลที่ง่ายขึ้น

## คุณสมบัติ

- อ่านไฟล์ .po และแยก msgid/msgstr pairs
- รองรับ multi-line strings
- สร้างไฟล์ CSV พร้อมสถิติการแปล
- รองรับการใช้งานผ่าน Command Line Interface (CLI)
- แสดงสถานะการแปล (Translated/Untranslated)

## การติดตั้ง

1. ตรวจสอบว่า Node.js ติดตั้งแล้ว
2. วางไฟล์ `po_to_csv.js` และ `run_po_to_csv.bat` ในโฟลเดอร์เดียวกับไฟล์ .po

## การใช้งาน

### วิธีที่ 1: ใช้ Batch File (แนะนำสำหรับ Windows)

```bash
run_po_to_csv.bat
```

### วิธีที่ 2: ใช้ Node.js โดยตรง

```bash
# ใช้งานแบบพื้นฐาน (ใช้ไฟล์ th.po และสร้าง th_translations.csv)
node po_to_csv.js

# ระบุไฟล์ input และ output
node po_to_csv.js --input myfile.po --output myfile.csv

# แสดงความช่วยเหลือ
node po_to_csv.js --help
```

## รูปแบบไฟล์ CSV ที่ได้

ไฟล์ CSV จะมีคอลัมน์ดังนี้:

| Line Number | msgid | msgstr | Status |
|-------------|-------|--------|--------|
| 25 | "Hello World" | "สวัสดีชาวโลก" | Translated |
| 30 | "Welcome" | "" | Untranslated |

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: แปลงไฟล์ th.po
```bash
node po_to_csv.js
```

ผลลัพธ์:
```
* Starting PO to CSV conversion...
* Parsing PO file...
* Found 14826 translations
* Converting to CSV format...
* CSV file created successfully: th_translations.csv
* Translation Statistics:
  - Total entries: 14826
  - Translated: 1234
  - Untranslated: 13592
  - Translation rate: 8.32%
```

### ตัวอย่างที่ 2: ระบุไฟล์ input/output
```bash
node po_to_csv.js --input custom.po --output custom_translations.csv
```

## โครงสร้างไฟล์

```
hrm/
├── po_to_csv.js          # Script หลัก
├── run_po_to_csv.bat     # Batch file สำหรับ Windows
├── th.po                 # ไฟล์ PO input
├── th_translations.csv   # ไฟล์ CSV output
└── README_PO_TO_CSV.md   # ไฟล์นี้
```

## การจัดการข้อผิดพลาด

- หากไฟล์ input ไม่พบ จะแสดงข้อความแจ้งเตือน
- หากไม่มีคำแปลในไฟล์ จะแสดงข้อความแจ้งเตือน
- หากเกิดข้อผิดพลาดในการเขียนไฟล์ CSV จะแสดงข้อความแจ้งเตือน

## หมายเหตุ

- ไฟล์ CSV จะใช้ encoding UTF-8
- ข้อความพิเศษใน CSV จะถูก escape อย่างถูกต้อง
- สถิติการแปลจะแสดงในคอนโซลหลังจากการแปลงเสร็จสิ้น 