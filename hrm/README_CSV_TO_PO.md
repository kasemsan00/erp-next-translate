# CSV to PO Updater

เครื่องมือสำหรับอัปเดตไฟล์ .po ด้วยคำแปลจากไฟล์ CSV

## คุณสมบัติ

- อ่านคำแปลจากไฟล์ CSV ที่มีสถานะ "Translated"
- จับคู่ msgid และอัปเดต msgstr ในไฟล์ PO
- รองรับ multi-line strings
- สร้างไฟล์ PO ใหม่โดยไม่แก้ไขไฟล์ต้นฉบับ
- แสดงสถิติการอัปเดต

## การใช้งาน

### วิธีที่ 1: ใช้ Batch File (แนะนำสำหรับ Windows)

```bash
run_csv_to_po.bat
```

### วิธีที่ 2: ใช้ Node.js โดยตรง

```bash
# ใช้งานแบบพื้นฐาน (ใช้ไฟล์ th_translations.csv และ th.po)
node csv_to_po_updater.js

# ระบุไฟล์ input และ output
node csv_to_po_updater.js --csv my_translations.csv --po myfile.po --output updated.po

# แสดงความช่วยเหลือ
node csv_to_po_updater.js --help
```

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: อัปเดตไฟล์ th.po
```bash
node csv_to_po_updater.js
```

ผลลัพธ์:
```
* Starting CSV to PO updater...
* Found 276 translated entries in CSV
* Updating PO file...
* Updated: "Hello World" -> "สวัสดีชาวโลก"
* Updated: "Welcome" -> "ยินดีต้อนรับ"
* PO file updated successfully: th_updated.po
* Updated 275 translations
* Skipped 2151 untranslated entries
* Process completed successfully!
```

### ตัวอย่างที่ 2: ระบุไฟล์ input/output
```bash
node csv_to_po_updater.js --csv custom_translations.csv --po custom.po --output custom_updated.po
```

## โครงสร้างไฟล์

```
hrm/
├── csv_to_po_updater.js    # Script หลัก
├── run_csv_to_po.bat       # Batch file สำหรับ Windows
├── th_translations.csv     # ไฟล์ CSV input
├── th.po                   # ไฟล์ PO input
├── th_updated.po           # ไฟล์ PO output (อัปเดตแล้ว)
└── README_CSV_TO_PO.md     # ไฟล์นี้
```

## รูปแบบไฟล์ CSV ที่รองรับ

ไฟล์ CSV ต้องมีคอลัมน์ดังนี้:
- Line Number: หมายเลขบรรทัด
- msgid: ข้อความต้นฉบับ
- msgstr: ข้อความที่แปลแล้ว
- Status: สถานะการแปล (Translated/Untranslated)

ตัวอย่าง:
```csv
Line Number,msgid,msgstr,Status
25,"Hello World","สวัสดีชาวโลก",Translated
30,"Welcome","",Untranslated
```

## การทำงาน

1. **อ่านไฟล์ CSV**: อ่านคำแปลที่มีสถานะ "Translated"
2. **สร้าง Map**: สร้าง Map ของ msgid -> msgstr
3. **อ่านไฟล์ PO**: อ่านไฟล์ PO บรรทัดต่อบรรทัด
4. **อัปเดต msgstr**: เมื่อเจอ msgid ที่มีคำแปล ให้อัปเดต msgstr
5. **เขียนไฟล์ใหม่**: เขียนไฟล์ PO ที่อัปเดตแล้ว

## หมายเหตุสำคัญ

- **ไม่แก้ไขไฟล์ต้นฉบับ**: สร้างไฟล์ใหม่เสมอ
- **เฉพาะคำแปลที่มีสถานะ "Translated"**: ข้ามคำแปลที่ยังไม่แปล
- **รักษารูปแบบไฟล์**: รักษา comments, headers และโครงสร้างไฟล์ PO
- **รองรับ multi-line strings**: จัดการข้อความหลายบรรทัดได้ถูกต้อง

## การจัดการข้อผิดพลาด

- หากไฟล์ input ไม่พบ จะแสดงข้อความแจ้งเตือน
- หากไม่มีคำแปลในไฟล์ CSV จะแสดงข้อความแจ้งเตือน
- หากเกิดข้อผิดพลาดในการเขียนไฟล์ จะแสดงข้อความแจ้งเตือน

## การใช้งานร่วมกับเครื่องมืออื่น

เครื่องมือนี้ทำงานร่วมกับ `po_to_csv.js` ได้:

1. ใช้ `po_to_csv.js` แปลงไฟล์ PO เป็น CSV
2. แก้ไขคำแปลในไฟล์ CSV
3. ใช้ `csv_to_po_updater.js` อัปเดตไฟล์ PO ด้วยคำแปลใหม่

## ตัวอย่าง Workflow

```bash
# 1. แปลง PO เป็น CSV
node po_to_csv.js

# 2. แก้ไขคำแปลใน th_translations.csv (ด้วย Excel หรือ text editor)

# 3. อัปเดต PO ด้วยคำแปลใหม่
node csv_to_po_updater.js

# 4. ไฟล์ th_updated.po จะมีคำแปลที่อัปเดตแล้ว
``` 