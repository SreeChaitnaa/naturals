Sub Button1_Click(Optional ByVal print_bill_flag As Boolean = True, Optional ByVal save_bill_flag As Boolean = True)

    Protect_Sheets
    If Not (Verify_Input) Then
        Exit Sub
    End If

    Dim lr As Long
    Dim i As Integer
    Dim serviceCount As Integer

    Sheets("Invoice").Range("B9") = Date
    Sheets("Invoice").Range("E9") = Time

    serviceCount = 0
    For i = 12 To 23
        If Sheets("Invoice").Cells(i, 1) <> "" Then
            serviceCount = serviceCount + 1
        End If
    Next i

    Dim dp As Double

    dp = Sheets("Invoice").Range("D25").Value
    If Sheets("Invoice").Range("C25").Value > 0 Then
        dp = Sheets("Invoice").Range("C25").Value / Sheets("Invoice").Range("E24").Value
        Sheets("Invoice").Range("D25").ClearContents
    End If

    Dim gross As Double
    gross = Sheets("Invoice").Range("E29").Value

     If Sheets("Invoice").Range("b29").Value = "Wallet" Then
        dp = 0.3
        gross = Sheets("Invoice").Range("E24").Value * (1 - dp) * 1.18
        Sheets("Invoice").Range("D25").ClearContents
        Sheets("Invoice").Range("C25").ClearContents
    End If

    lr = NextFreeRowNumber("Services")
    For i = 12 To 23
        If Sheets("Invoice").Cells(i, 1) <> "" Then
            Sheets("Services").Cells(lr, 1).Value = Sheets("Invoice").Range("E10").Value
            Sheets("Services").Cells(lr, 2).Value = Sheets("Invoice").Range("B9").Value
            Sheets("Services").Cells(lr, 3).Value = Sheets("Invoice").Range("E9").Value
            Sheets("Services").Cells(lr, 4).Value = Sheets("Invoice").Range("B8").Value
            Sheets("Services").Cells(lr, 5).Value = Sheets("Invoice").Range("E8").Value
            Sheets("Services").Cells(lr, 6).Value = Sheets("Invoice").Cells(i, 1).Value
            Sheets("Services").Cells(lr, 7).Value = Sheets("Invoice").Cells(i, 4).Value
            Sheets("Services").Cells(lr, 8).Value = Sheets("Invoice").Cells(i, 5).Value
            Sheets("Services").Cells(lr, 9).Value = dp
            Sheets("Services").Cells(lr, 11).Value = Sheets("Invoice").Range("B29").Value
            lr = lr + 1
        End If
    Next i

    lr = NextFreeRowNumber("Bills")
    Sheets("Bills").Cells(lr, 1).Value = Sheets("Invoice").Range("E10").Value
    Sheets("Bills").Cells(lr, 2).Value = Sheets("Invoice").Range("B9").Value
    Sheets("Bills").Cells(lr, 3).Value = Sheets("Invoice").Range("E9").Value
    Sheets("Bills").Cells(lr, 4).Value = Sheets("Invoice").Range("B8").Value
    Sheets("Bills").Cells(lr, 5).Value = Sheets("Invoice").Range("E8").Value
    Sheets("Bills").Cells(lr, 6).Value = serviceCount
    Sheets("Bills").Cells(lr, 7).Value = Sheets("Invoice").Range("E24").Value
    Sheets("Bills").Cells(lr, 8).Value = dp
    Sheets("Bills").Cells(lr, 10).Value = gross
    Sheets("Bills").Cells(lr, 11).Value = Sheets("Invoice").Range("B29").Value

    If print_bill_flag Then
        Just_Print
    End If

    PrepareAndSendTodaySales

    CreateContactIfNew

    SendReviewAfterSale Sheets("Invoice").Range("E8").Value

    Sheets("Invoice").Range("E10").Value = Sheets("Invoice").Range("E10").Value + 1

    Reset_Bill

    Refresh_Pivot_Tables

    If save_bill_flag Then
        Save_Workbook
    End If


End Sub
Sub Submit_Without_Print()
    Button1_Click False
End Sub


Sub Just_Print()
    Sheets("Invoice").Range("A1:E30").PrintOut
End Sub

Sub Check_User()
    Dim lr As Long
    lr = 1
    While Sheets("Bills").Cells(lr, 5).Value <> ""
        If Sheets("Invoice").Range("E8").Value = Sheets("Bills").Cells(lr, 5).Value Then
            Sheets("Invoice").Range("B8:C8").Value = Sheets("Bills").Cells(lr, 4).Value
            Exit Sub
        End If
        lr = lr + 1
    Wend
    MsgBox "User with Phone number - '" & Sheets("Invoice").Range("E8").Value & "' Not found"
End Sub

Sub Send_whatsAppToThis()
    SendReviewAfterSale Sheets("Bills").Range("N6").Value
End Sub

Sub SendReviewAfterSale(PhoneNum As String)

    Dim BillMsg As String
    BillMsg = "Thank you for using our Services at YLG Salon haralur. "
    BillMsg = BillMsg & "%0a%0aWe hope you liked our services%0aPlease send your feedback at AA.Haralur@gmail.com"

    'BillMsg = BillMsg & "&phone=91" & PhoneNum

    BillMsg = "text=" & BillMsg & "^&phone=91" & PhoneNum

    SendWhatsapp BillMsg
End Sub
Sub Reset_Bill()
    Protect_Sheets
    Sheets("Invoice").Range("B8:C9").ClearContents
    Sheets("Invoice").Range("C25").ClearContents
    Sheets("Invoice").Range("E8:E9").ClearContents
    Sheets("Invoice").Range("D25").ClearContents
    Sheets("Invoice").Range("A12:D23").ClearContents
    Sheets("Invoice").Range("B29:C29").ClearContents
    Sheets("Invoice").Range("A30:E30").ClearContents
    Sheets("Invoice").Range("E25").Formula = "=IF(C25 > 0, C25, E24*D25)"
End Sub


Public Function NextFreeRowNumber(SheetName As String) As Long
    Dim lr As Long
    lr = 1
    While Sheets(SheetName).Cells(lr, 1).Value <> ""
        lr = lr + 1
    Wend
    NextFreeRowNumber = lr
End Function

Sub Protect_Sheets()
    Dim pwd As String
    pwd = "Mayur@3234"
    Sheets("Invoice").Protect pwd, UserInterfaceOnly:=True
    Sheets("Services").Protect pwd, UserInterfaceOnly:=True
    Sheets("Bills").Protect pwd, UserInterfaceOnly:=True
    Sheets("DayWise").Protect pwd, UserInterfaceOnly:=True
    Sheets("EmpSale").Protect pwd, UserInterfaceOnly:=True
    Sheets("VIP Members").Protect pwd, UserInterfaceOnly:=True

End Sub
Sub UnProtect_Sheets()

    Dim pwd As String
    pwd = "Mayur@3234"
    Sheets("Invoice").Unprotect pwd
    Sheets("Services").Unprotect pwd
    Sheets("Bills").Unprotect pwd
    Sheets("DayWise").Unprotect pwd
    Sheets("EmpSale").Unprotect pwd
    Sheets("VIP Members").Unprotect pwd

End Sub

Function FormatString(template As String, ParamArray args() As Variant) As String
    Dim i As Integer
    Dim result As String
    result = template
    For i = LBound(args) To UBound(args)
        result = Replace(result, "{" & i & "}", args(i))
    Next i
    FormatString = result
End Function

Sub SendUpdate()
    Protect_Sheets
    Refresh_Pivot_Tables

    Dim dr As Integer
    Dim today_date As Date

    Dim template As String
    template = "*3/6pm Update*%0A" & _
                "Store: Harlur%0A" & _
                "Total Sales (w/o tax): {0}%0A" & _
                "No of Bills: {1}%0A" & _
                "No of Services: {2}%0A" & _
                "ABV: {3}%0A" & _
                "Retail Sales: 0%0A" & _
                "Retail Qty: 0%0A" & _
                "Google Reviews: 0%0A%0A" & _
                "No of BSCs: 0%0A" & _
                "BSC Sales: 0%0A%0A" & _
                "Combos: 0%0A" & _
                "Threading, Mask, Exp CleanUp: 0%0A" & _
                "Waxing, Mask: 0%0A" & _
                "Global and Root Touchup: 0%0A" & _
                "PediMani: 0%0A" & _
                "Haircut, Hair Spa: 0%0A%0A" & _
                "No of Customers in Store: 0%0A" & _
                "Pending Appointments - 0%0A" & _
                "Spot Incentives: 0" & "^&phone=919663233832"

    dr = 1
    today_date = Date
    ' today_date = DateAdd("d", -1, Date)
    Dim DCMsg As String

    While Sheets("DayWise").Cells(dr, 1).Value <> today_date
        If Sheets("DayWise").Cells(dr, 1).Value = "Grand Total" Then
            DCMsg = FormatString(template, 0, 0, 0, 0)
            SendWhatsapp DCMsg
            Exit Sub
        End If
        dr = dr + 1
    Wend

    cash_value = 0
    While Sheets("DayWise").Cells(dr, 2).Value <> "Cash" And Sheets("DayWise").Cells(dr, 2).Value <> ""
        dr = dr + 1
    Wend

    If Sheets("DayWise").Cells(dr, 2).Value = "Cash" Then
        cash_value = Sheets("DayWise").Cells(dr, 6).Value
        dr = dr + 1
        While Sheets("DayWise").Cells(dr, 2).Value <> ""
            dr = dr + 1
        Wend
    End If

    Dim tSales, tServices, tBills, tABV As Integer
    tBills = Sheets("DayWise").Cells(dr, 3).Value
    tServices = Sheets("DayWise").Cells(dr, 4).Value
    tSales = Sheets("DayWise").Cells(dr, 5).Value
    tABV = Round(Sheets("DayWise").Cells(dr, 7).Value)

    DCMsg = FormatString(template, tSales, tBills, tServices, tABV)

    Save_Workbook
    SendWhatsapp "text=" & DCMsg
End Sub


Sub DayClose()
    Protect_Sheets
    Refresh_Pivot_Tables

    Dim dr As Integer
    Dim today_date As Date

    dr = 1
    today_date = Date
    ' today_date = DateAdd("d", -1, Date)
    Dim DCMsg As String
    DCMsg = "text=Date - " & today_date

    While Sheets("DayWise").Cells(dr, 1).Value <> today_date
        If Sheets("DayWise").Cells(dr, 1).Value = "Grand Total" Then
            DCMsg = DCMsg & "%0a%0aNo Sale for the Day.%0a%0aSorry :( :( %0a%0aClosing now, Good Night!!!"
            SendWhatsapp DCMsg
            Exit Sub
        End If
        dr = dr + 1
    Wend

    cash_value = 0
    While Sheets("DayWise").Cells(dr, 2).Value <> "Cash" And Sheets("DayWise").Cells(dr, 2).Value <> ""
        dr = dr + 1
    Wend

    If Sheets("DayWise").Cells(dr, 2).Value = "Cash" Then
        cash_value = Sheets("DayWise").Cells(dr, 6).Value
        dr = dr + 1
        While Sheets("DayWise").Cells(dr, 2).Value <> ""
            dr = dr + 1
        Wend
    End If

    DCMsg = DCMsg & "%0aNo of Clients - " & Sheets("DayWise").Cells(dr, 3).Value
    DCMsg = DCMsg & "%0aNo of Services - " & Sheets("DayWise").Cells(dr, 4).Value
    DCMsg = DCMsg & "%0a%0aTotal Sales - " & Sheets("DayWise").Cells(dr, 5).Value
    DCMsg = DCMsg & "%0a%0aCash - " & cash_value
    DCMsg = DCMsg & "%0aABV - " & Round(Sheets("DayWise").Cells(dr, 7).Value, 2) & "%0a%0aClosing now, Good Night!!!"

    Save_Workbook
    SendWhatsapp DCMsg
    Application.Quit
End Sub

Sub TestWhatsapp()
    Dim mnsg As String
    mnsg = "text=Date2 - now%0aNewLine^&phone=9591312316"
    SendWhatsapp mnsg
End Sub
Sub WhatsAppAll()
    Dim idx As Integer
    idx = 71
    While Sheets("Bills").Cells(idx, 5).Value <> ""
        SendReviewAfterSale Sheets("Bills").Cells(idx, 5).Value
        MsgBox "Sent to " & Sheets("Bills").Cells(idx, 5).Value
        idx = idx + 1
    Wend
End Sub
Sub CreateAllContacts()
    Dim idx As Integer
    idx = 71
    While Sheets("Bills").Cells(idx, 5).Value <> ""
        CreateContact Sheets("Bills").Cells(idx, 4).Value, Sheets("Bills").Cells(idx, 5).Value
        MsgBox "Saved User - " & Sheets("Bills").Cells(idx, 4).Value
        idx = idx + 1
    Wend
End Sub

Sub CreateContactIfNew()
    Dim idx As Integer
    idx = 2
    While Sheets("Bills").Cells(idx, 5).Value <> ""
        If Sheets("Invoice").Range("E8").Value = Sheets("Bills").Cells(idx, 5).Value Then
            Exit Sub
        End If
        idx = idx + 1
    Wend

    CreateContact Sheets("Invoice").Range("B8").Value, Sheets("Invoice").Range("E8").Value
    MsgBox "Please save user in Google Contact - " & Sheets("Invoice").Range("B8").Value
    idx = idx + 1
End Sub

Sub CreateContact(CName As String, CPhone As String)
    Dim url As String
    CNameFull = CName & " " & Right(CPhone, 4)
    url = "https://contacts.google.com/u/0/new?hl=en&givenname=" & CNameFull & "&phone=" & CPhone & "&familyname=HClient"
    ActiveWorkbook.FollowHyperlink url
End Sub



Sub SendWhatsapp(WaMsg As String)
    Shell "cmd /C start whatsapp://send?" & Replace(WaMsg, " ", "%20")
    Windows("YLGBilling.xlsm").Activate
    'MsgBox "Sending Message in Whatsapp, please confirm..."
    'Shell "cmd /C start whatsapp://send?" & Replace(WaMsg, " ", "%20")
    'ActiveWorkbook.FollowHyperlink "http://api.whatsapp.com/send?" & WaMsg
End Sub


Sub Refresh_Pivot_Tables()
    Protect_Sheets
    Sheets("DayWise").PivotTables("PivotTable4").RefreshTable
    Sheets("DayWise").PivotTables("PivotTable1").RefreshTable
    Sheets("EmpSale").PivotTables("PivotTable2").RefreshTable
    Sheets("EmpSale").PivotTables("PivotTable3").RefreshTable
End Sub

Public Function CashBack_address() As Range
    Set CashBack_address = Sheets("VIP Members").Range("B:B").Find(Sheets("Invoice").Range("E8").Value)
End Function

Sub Create_Cashback()
    Protect_Sheets
    Dim CashBack_Range As Range
    Set CashBack_Range = CashBack_address
    If Not (CashBack_Range Is Nothing) Then
        MsgBox "Already user have 300% Cashback"
        Exit Sub
    End If


    If Not (Verify_Input) Then
        Exit Sub
    End If
    Dim lr As Long
    lr = NextFreeRowNumber("VIP Members")

    Sheets("VIP Members").Cells(lr, 1).Value = Sheets("Invoice").Range("B8").Value
    Sheets("VIP Members").Cells(lr, 2).Value = Sheets("Invoice").Range("E8").Value
    Sheets("VIP Members").Cells(lr, 3).Value = Sheets("Invoice").Range("E10").Value
    Sheets("VIP Members").Cells(lr, 4).Value = Sheets("Invoice").Range("E26").Value
    Sheets("VIP Members").Cells(lr, 5).Value = Sheets("Invoice").Range("E26").Value * 3
    Sheets("VIP Members").Cells(lr, 6).Value = Date
    Sheets("VIP Members").Cells(lr, 7).Value = Sheets("VIP Members").Cells(lr, 6).Value + 365

    Dim msg As String
    msg = "Added Cash back of Rs." & Sheets("VIP Members").Cells(lr, 5).Value & vbNewLine & "Valid Till: " & Sheets("VIP Members").Cells(lr, 7).Value
    Sheets("Invoice").Range("A30").Value = msg
    MsgBox msg
End Sub

Sub Check_And_Apply_Cashback()
    Protect_Sheets
    Dim CashBack_Range As Range
    Set CashBack_Range = CashBack_address

    If CashBack_Range Is Nothing Then
        MsgBox "User Donot have this Cachback offer"
        Exit Sub
    End If

    If Not (Verify_Input) Then
        Exit Sub
    End If

    Dim Cbr As Long
    Cbr = CashBack_Range.Row

    Dim visitCount As Long
    visitCount = 8

    While Sheets("VIP Members").Cells(Cbr, visitCount).Value <> "" And visitCount < 20
        visitCount = visitCount + 1
    Wend

    If visitCount = 20 Then
        MsgBox "All 12 Visits Completed"
        Exit Sub
    End If

    If Sheets("VIP Members").Cells(Cbr, 20).Value < 1 Then
        MsgBox "Cash back balance is Empty"
        Exit Sub
    Else
        Sheets("Invoice").Range("D25").Value = 0.25
    End If

    Dim msg As String
    msg = "Applied 25% cashback on your on your visit: " & (visitCount - 6)
    Sheets("Invoice").Range("A30").Value = msg
    Sheets("VIP Members").Cells(Cbr, visitCount).Value = Sheets("Invoice").Range("E25").Value
    MsgBox msg
End Sub


Public Function Verify_Input() As Boolean
    Dim i As Integer
    Dim msg As String

    If Sheets("Invoice").Cells(8, 2) = "" Then
        MsgBox "Please provide Customer Name"
        Application.Goto Sheets("Invoice").Cells(8, 2)
        Verify_Input = False
        Exit Function
    End If

    If Sheets("Invoice").Cells(8, 5) = "" Then
        MsgBox "Please provide Customer Phone Number"
        Application.Goto Sheets("Invoice").Cells(8, 5)
        Verify_Input = False
        Exit Function
    End If

    For i = 12 To 23
        If Sheets("Invoice").Cells(i, 1) <> "" Then
            If Sheets("Invoice").Cells(i, 4) = "" Then
                msg = "Please Select provider for " & Sheets("Invoice").Cells(i, 1)
                MsgBox msg
                Application.Goto Sheets("Invoice").Cells(i, 4)
                Verify_Input = False
                Exit Function
            End If
        End If
    Next i

    If Sheets("Invoice").Cells(29, 2) = "" Then
        MsgBox "Please provide Payment Type"
        Application.Goto Sheets("Invoice").Cells(29, 2)
        Verify_Input = False
        Exit Function
    End If


Verify_Input = True
End Function

Sub Protect_WorkBook()
    If Not (Sheets("Services").Visible) Then
        Exit Sub
    End If
    Sheets("Services").Visible = False
    Sheets("Bills").Visible = False
    Sheets("DayWise").Visible = False
    Sheets("EmpSale").Visible = False
    Sheets("VIP Members").Visible = False
    Sheets("Wallet").Visible = False
    ActiveWorkbook.Protect Password:="JSR@123", Structure:=True, Windows:=True
End Sub


Sub Unprotect_WorkBook()
    If Sheets("Services").Visible Then
        Exit Sub
    End If
    ActiveWorkbook.Unprotect Password:="JSR@123"
    Sheets("Services").Visible = True
    Sheets("Bills").Visible = True
    Sheets("DayWise").Visible = True
    Sheets("EmpSale").Visible = True
    Sheets("VIP Members").Visible = True
    Sheets("Wallet").Visible = True
End Sub

Sub Save_Workbook()
    Unprotect_WorkBook
    ActiveWorkbook.Save
    Protect_WorkBook
    Shell "cmd /c copy D:\Billig\YLGBilling.xlsm ""G:\My Drive\YLGBilling.xlsm"" /Y"
End Sub

Sub SaveNormalExcelCopy()
    ActiveWorkbook.SaveCopyAs Filename:="C:\Users\NXT\OneDrive\Sheets\JKR\Billing_ReadOnly.xlsm"
End Sub

Sub PrepareAndSendTodaySales()
    Dim ws As Worksheet: Set ws = ThisWorkbook.Sheets("Services")
    Dim lastRow As Long: lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    Dim todayDate As Date: todayDate = Date
    Dim todayDatenum As String: todayDatenum = Format(todayDate, "yyyymmdd")

    Dim json As String
    json = "{""datenum"":" & todayDatenum & ",""bills"":["

    Dim currentBillNo As String: currentBillNo = ""
    Dim ticketsJson As String: ticketsJson = ""
    Dim ticketsCount As Long: ticketsCount = 0
    Dim billName As String, billPhone As String, billTimeMark As String
    Dim billNetSum As Double: billNetSum = 0
    Dim lastPayRaw As String

    Dim r As Long
    For r = 2 To lastRow
        ' skip rows where date cell is not a date
        If Not IsDate(ws.Cells(r, 2).Value) Then GoTo NextRow

        ' only today's rows
        If CDate(ws.Cells(r, 2).Value) <> todayDate Then GoTo NextRow

        Dim rowBill As String: rowBill = Trim(CStr(ws.Cells(r, 1).Value))
        If rowBill = "" Then GoTo NextRow

        ' parse values for this row
        Dim svc As String: svc = CStr(ws.Cells(r, 6).Value)
        Dim provider As String: provider = CStr(ws.Cells(r, 7).Value)
        Dim priceVal As Double: priceVal = Val(ws.Cells(r, 8).Value)
        Dim netPriceVal As Double: netPriceVal = Val(ws.Cells(r, 10).Value)
        Dim discountAmt As Double: discountAmt = priceVal - netPriceVal
        Dim ticketTotal As Double: ticketTotal = netPriceVal * 1.18
        lastPayRaw = LCase(Trim(CStr(ws.Cells(r, 11).Value)))

        'Debug.Print svc

        ' compute TimeMark only when starting a bill
        Dim dtVal As Date
        On Error Resume Next
        Dim rawDate As Variant, rawTime As Variant
        rawDate = ws.Cells(r, 2).Value   ' already a Date serial if Excel parsed it
        rawTime = ws.Cells(r, 3).Value   ' fraction of a day
        dtVal = CDate(rawDate + rawTime)
        'Debug.Print "Parsed OK: " & Format(dtVal, "yyyy-mm-dd hh:nn:ss AM/PM")
        On Error GoTo 0
        Dim timeMarkStr As String: timeMarkStr = Format(dtVal, "yyyy-mm-dd hh:nn:ss")

        ' --- New bill started?
        If currentBillNo = "" Then
            ' first bill
            currentBillNo = rowBill
            billName = CStr(ws.Cells(r, 4).Value)
            billPhone = CStr(ws.Cells(r, 5).Value)
            billTimeMark = timeMarkStr
            ticketsJson = ""
            ticketsCount = 0
            billNetSum = 0
        ElseIf rowBill <> currentBillNo Then
            ' finalize previous bill and append to main JSON
            json = json & BuildBillJson(currentBillNo, billName, billPhone, billTimeMark, ticketsJson, billNetSum, lastPayRaw)
            ' start new bill
            currentBillNo = rowBill
            billName = CStr(ws.Cells(r, 4).Value)
            billPhone = CStr(ws.Cells(r, 5).Value)
            billTimeMark = timeMarkStr
            ticketsJson = ""
            ticketsCount = 0
            billNetSum = 0
        End If

        ' append this ticket to current bill's tickets JSON
        If ticketsCount > 0 Then ticketsJson = ticketsJson & ","
        ticketsJson = ticketsJson & "{""DiscountAmount"":" & NumToJson(discountAmt) & _
            ",""Price"":" & NumToJson(priceVal) & _
            ",""Qty"":1" & _
            ",""ServiceID"":""" & JsonEscape(svc) & """,""ServiceName"":""" & JsonEscape(svc) & """,""Sex"":""1"",""Total"":" & NumToJson(ticketTotal) & _
            ",""empname"":""" & JsonEscape(provider) & """}"
        ticketsCount = ticketsCount + 1
        billNetSum = billNetSum + netPriceVal

NextRow:
    Next r

    ' finalize last open bill (if any)
    If currentBillNo <> "" Then
        json = json & BuildBillJson(currentBillNo, billName, billPhone, billTimeMark, ticketsJson, billNetSum, lastPayRaw)
    End If

    ' close top-level JSON
    If Right(json, 1) = "," Then json = Left(json, Len(json) - 1)
    json = json & "]}"

    Debug.Print json
    DeleteTodayRecords
    UpdateTodaySales json
End Sub

' ----------------- helpers -----------------

Private Function BuildBillJson(billNo As String, custName As String, custPhone As String, _
                               timeMark As String, ticketsJson As String, netSum As Double, payRaw As String) As String
    Dim mode As String: mode = MapPayMode(payRaw)
    Dim tender As Double: tender = netSum * 1.18
    Dim s As String

    s = "{""payment"":[{""ChangeAmt"":0,""ModeofPayment"":""" & mode & """,""Tender"":" & NumToJson(tender) & "}]"
    s = s & ",""ticket"":[" & IIf(ticketsJson = "", "", ticketsJson) & "]"
    s = s & ",""mmd"":true"
    s = s & ",""Name"":""" & JsonEscape(custName) & """"
    s = s & ",""Phone"":""" & JsonEscape(custPhone) & """"
    s = s & ",""TicketID"":""" & "MMD" & billNo & """"
    s = s & ",""TimeMark"":""" & JsonEscape(timeMark) & """"
    s = s & ",""Comments"":null},"
    BuildBillJson = s
End Function

Private Function MapPayMode(raw As String) As String
    If raw = "" Then
        MapPayMode = "Other"
        Exit Function
    End If
    raw = LCase(raw)
    If InStr(raw, "cash") > 0 Then
        MapPayMode = "Cash"
    ElseIf InStr(raw, "upi") > 0 Then
        MapPayMode = "EWallet"
    ElseIf InStr(raw, "card") > 0 Or InStr(raw, "bsc") > 0 Or InStr(raw, "visa") > 0 Or InStr(raw, "master") > 0 Then
        MapPayMode = "Card"
    Else
        ' fallback to the raw cell (proper-cased) if nothing matched
        MapPayMode = StrConv(raw, vbProperCase)
    End If
End Function

' ensure numeric uses dot and exactly 2 decimals (no thousands separators)
Private Function NumToJson(v As Double) As String
    Dim t As String
    t = Format$(v, "0.00")
    t = Replace(t, ",", "")   ' remove any thousand separators
    NumToJson = t
End Function

' minimal JSON escaping for quotes and backslashes and newlines
Private Function JsonEscape(v As Variant) As String
    ' Return a JSON-safe string for v. Accepts Variant so Null/Error don't crash.
    Dim s As String

    If IsError(v) Then
        JsonEscape = ""
        Exit Function
    End If

    If IsNull(v) Or IsEmpty(v) Then
        JsonEscape = ""
        Exit Function
    End If

    s = CStr(v)

    ' First escape backslashes (\ -> \\)
    s = Replace(s, Chr(92), Chr(92) & Chr(92))
    ' Then escape double-quotes (" -> \")
    s = Replace(s, Chr(34), Chr(92) & Chr(34))
    ' Normalize newlines to \n
    s = Replace(s, vbCrLf, Chr(92) & "n")
    s = Replace(s, vbCr, Chr(92) & "n")
    s = Replace(s, vbLf, Chr(92) & "n")

    JsonEscape = s
End Function

' --- Centralized REST API caller with automatic URL encoding for Windows ---
Function CallRestDBAPI(method As String, Optional endpoint As String = "", Optional jsonPayload As String = "") As String
    Dim response As String
    Dim url As String
    Dim apiKey As String

    url = "https://ylgharalur-be6e.restdb.io/rest/"
    apiKey = "68b540d2b349a313344b6d85"

    If endpoint <> "" Then url = url & endpoint

    ' --- Windows: MSXML2.XMLHTTP ---
    Dim http As Object
    Set http = CreateObject("MSXML2.XMLHTTP")
    http.Open method, url, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "x-apikey", apiKey
    If jsonPayload <> "" Then
        http.Send jsonPayload
    Else
        http.Send
    End If
    CallRestDBAPI = http.responseText
End Function


' --- Delete records matching today's date ---
Sub DeleteTodayRecords()
    Dim datenumber As Long
    Dim query As String
    Dim endpoint As String
    Dim response As String

    ' Calculate datenum as YYYYMMDD
    datenumber = Year(Date) * 10000 + Month(Date) * 100 + Day(Date)

    ' Build JSON query for deletion
    query = "{""datenum"":" & datenumber & "}"

    ' Pass query as endpoint (CallRestDBAPI will encode for Windows automatically)
    endpoint = "daysales/*?q=" & URLEncode(query)

    ' Call DELETE API
    response = CallRestDBAPI("DELETE", endpoint)

    Debug.Print "Delete Response: " & response
End Sub

' --- Update / Insert today's sales ---
Sub UpdateTodaySales(payload As String)
    Dim response As String
    ' Call POST API
    response = CallRestDBAPI("POST", "daysales", payload)

    Debug.Print "Post Response: " & response
End Sub

Function URLEncode(str As String) As String
    Dim i As Long
    Dim ch As String
    Dim outStr As String

    For i = 1 To Len(str)
        ch = Mid(str, i, 1)
        Select Case Asc(ch)
            Case 48 To 57, 65 To 90, 97 To 122  ' 0-9, A-Z, a-z
                outStr = outStr & ch
            Case Else
                outStr = outStr & "%" & Hex(Asc(ch))
        End Select
    Next i
    URLEncode = outStr
End Function
