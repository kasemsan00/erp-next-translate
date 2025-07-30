# ERPNext Translation Tools

ชุดเครื่องมือสำหรับจัดการการแปลภาษา ERPNext จากไฟล์ PO เป็น CSV และกลับ

## เครื่องมือที่มี

### 1. PO to CSV Converter (`po_to_csv.js`)
แปลงไฟล์ .po เป็นรูปแบบ CSV เพื่อการจัดการคำแปลที่ง่ายขึ้น

### 2. CSV to PO Updater (`csv_to_po_updater.js`)
อัปเดตไฟล์ .po ด้วยคำแปลจากไฟล์ CSV

### 3. PO Workflow Tool (`po_workflow.js`)
เครื่องมือรวมที่รองรับ workflow การแปลแบบครบวงจร

## การติดตั้ง

1. ตรวจสอบว่า Node.js ติดตั้งแล้ว
2. วางไฟล์ทั้งหมดในโฟลเดอร์เดียวกับไฟล์ .po

## การใช้งาน

### วิธีที่ 1: ใช้ Workflow Tool (แนะนำ)

```bash
# แสดงสถิติการแปล
node po_workflow.js stats

# แปลง PO เป็น CSV
node po_workflow.js po-to-csv

# อัปเดต PO ด้วยคำแปลจาก CSV
node po_workflow.js csv-to-po

# Workflow แบบครบวงจร
node po_workflow.js full-workflow
```

### วิธีที่ 2: ใช้เครื่องมือแยก

```bash
# แปลง PO เป็น CSV
node po_to_csv.js

# อัปเดต PO ด้วยคำแปล
node csv_to_po_updater.js
```

### วิธีที่ 3: ใช้ Batch Files (Windows)

```bash
# แปลง PO เป็น CSV
run_po_to_csv.bat

# อัปเดต PO ด้วยคำแปล
run_csv_to_po.bat
```

## Workflow การแปล

### ขั้นตอนที่ 1: แปลง PO เป็น CSV
```bash
node po_workflow.js po-to-csv
```
- อ่านไฟล์ `th.po`
- สร้างไฟล์ `th_translations.csv`
- แสดงสถิติการแปล

### ขั้นตอนที่ 2: แก้ไขคำแปลใน CSV
- เปิดไฟล์ `th_translations.csv` ด้วย Excel หรือ text editor
- เพิ่มคำแปลในคอลัมน์ `msgstr`
- เปลี่ยนสถานะเป็น "Translated" สำหรับคำแปลที่เสร็จแล้ว
- บันทึกไฟล์

### ขั้นตอนที่ 3: อัปเดต PO ด้วยคำแปลใหม่
```bash
node po_workflow.js csv-to-po
```
- อ่านคำแปลจาก `th_translations.csv`
- อัปเดตไฟล์ `th.po`
- สร้างไฟล์ `th_updated.po`

## โครงสร้างไฟล์

```
hrm/
├── po_to_csv.js              # แปลง PO เป็น CSV
├── csv_to_po_updater.js      # อัปเดต PO ด้วย CSV
├── po_workflow.js            # เครื่องมือรวม
├── run_po_to_csv.bat         # Batch file สำหรับ PO to CSV
├── run_csv_to_po.bat         # Batch file สำหรับ CSV to PO
├── th.po                     # ไฟล์ PO ต้นฉบับ
├── th_translations.csv       # ไฟล์ CSV สำหรับแก้ไข
├── th_updated.po             # ไฟล์ PO ที่อัปเดตแล้ว
├── README_PO_TO_CSV.md       # คู่มือ PO to CSV
├── README_CSV_TO_PO.md       # คู่มือ CSV to PO
└── README_MAIN.md            # คู่มือหลัก (ไฟล์นี้)
```

## รูปแบบไฟล์ CSV

ไฟล์ CSV มีคอลัมน์ดังนี้:

| Line Number | msgid | msgstr | Status |
|-------------|-------|--------|--------|
| 25 | "Hello World" | "สวัสดีชาวโลก" | Translated |
| 30 | "Welcome" | "" | Untranslated |

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: ตรวจสอบสถานะการแปล
```bash
node po_workflow.js stats
```

ผลลัพธ์:
```
* Translation Statistics:

PO File (th.po):
  - Total entries: 2425
  - Translated: 277
  - Translation rate: 11.42%

CSV File (th_translations.csv):
  - Translated entries: 276
```

### ตัวอย่างที่ 2: Workflow แบบครบวงจร
```bash
node po_workflow.js full-workflow
```

ผลลัพธ์:
```
* Starting full PO workflow...

=== Step 1: PO to CSV ===
* Converting PO to CSV...
* CSV file created: th_translations.csv
* Total entries: 2425
* Translated: 277
* Translation rate: 11.42%

=== Step 2: Ready for editing ===
* Please edit the CSV file: th_translations.csv
* Add translations to the msgstr column
* Change status to "Translated" for completed translations
* Save the file when done
```

## หมายเหตุสำคัญ

- **ไม่แก้ไขไฟล์ต้นฉบับ**: สร้างไฟล์ใหม่เสมอ
- **รองรับภาษาไทย**: ใช้ encoding UTF-8
- **รักษารูปแบบไฟล์**: รักษา comments และโครงสร้างไฟล์ PO
- **รองรับ multi-line strings**: จัดการข้อความหลายบรรทัดได้ถูกต้อง

## การจัดการข้อผิดพลาด

- ตรวจสอบว่าไฟล์ input มีอยู่จริง
- ตรวจสอบว่า Node.js ติดตั้งแล้ว
- ตรวจสอบ encoding ของไฟล์ (ต้องเป็น UTF-8)
- ตรวจสอบรูปแบบของไฟล์ CSV

## การพัฒนาต่อ

เครื่องมือเหล่านี้สามารถขยายได้:
- เพิ่มการรองรับไฟล์รูปแบบอื่น
- เพิ่มการตรวจสอบคุณภาพการแปล
- เพิ่มการรองรับหลายภาษา
- เพิ่มการทำงานแบบ batch processing 