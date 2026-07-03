Dim objExcel, objWorkbook

' Создаем объект Excel
Set objExcel = CreateObject("Excel.Application")

' Включаем видимость (1), чтобы видеть процесс отладки. После тестов измените на 0.
objExcel.Visible = 1
objExcel.DisplayAlerts = False

' ОТКРЫТИЕ ФАЙЛА (Путь взят из вашей конфигурации)
Set objWorkbook = objExcel.Workbooks.Open("C:\Users\admin\Dropbox\Семейная папка\БД\Модель данных\БД\МД текущий год.xlsx")

' ОБНОВЛЕНИЕ ДАННЫХ
' Запускаем встроенное последовательное обновление данных
objWorkbook.RefreshAll

' ПАУЗА НА ОБНОВЛЕНИЕ (Даем Excel время просчитать модель данных и запросы)
' Скрипт замирает на 20 секунд. Если модель данных большая, измените 20000 на 40000 (в миллисекундах)
WScript.Sleep 20000

' СОХРАНЕНИЕ И ЗАКРЫТИЕ (Чистый синтаксис VBScript без аргументов)
objWorkbook.Save
objWorkbook.Close
objExcel.Quit

' Очистка памяти
Set objWorkbook = Nothing
Set objExcel = Nothing
