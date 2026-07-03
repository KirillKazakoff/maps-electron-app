Dim app, wkb

' 1. Инициализируем Excel
Set app = CreateObject("Excel.Application")
app.Visible = 1
app.DisplayAlerts = False

' 2. Открываем файл
Set wkb = app.Workbooks.Open("C:\Users\admin\Dropbox\Семейная папка\БД\Модель данных\Модель данных.xlsx")

' 2.1. Собираем полный путь к PDF-файлу
pdf_name_vessel = "C:\Users\admin\Dropbox\Семейная папка\БД\Модель данных\БД\Судовой отчет"
pdf_name_tech = "C:\Users\admin\Dropbox\Семейная папка\БД\Модель данных\БД\Технический отчет"

' 3. Запускаем обновление и ждем 15 секунд
wkb.RefreshAll
WScript.Sleep 15000

' 4. ЭКСПОРТ НЕСКОЛЬКИХ ЛИСТОВ В ОДИН PDF
' Перечисляем имена листов через запятую в функции Array()
' ВАЖНО: имена листов должны точно совпадать с ярлычками в Excel
wkb.Sheets(Array("Живовозы на промысле", "Вылов живой сутки", "Подходы живовозов", "Подходы по компаниям")).Select

' Экспортируем выделенные листы (xlTypePDF = 0)
wkb.ActiveSheet.ExportAsFixedFormat 0, pdf_name_vessel

' Технический отчет то же самое
wkb.Sheets(Array("Технические отчеты")).Select
wkb.ActiveSheet.ExportAsFixedFormat 0, pdf_name_tech

' 5. Сохраняем саму книгу Excel, закрываем и чистим память
wkb.Save
wkb.Close
app.Quit

Set wkb = Nothing
Set app = Nothing