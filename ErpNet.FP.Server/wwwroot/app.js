﻿var availablePrinters = {}

function showAvailablePrinters() {
    $.ajax({
        type: 'GET',
        url: '/printers',
        data: {},
        dataType: 'json',
        timeout: 0,
        context: $('#PrintersList'),
        success: function (data) {
            availablePrinters = data
            this.html("")
            for (var printerId in data) {
                var printer = data[printerId]
                var characteristics = ""
                for (var characteristic in printer) {
                    characteristics += '<li>' + characteristic + ': <strong>' + printer[characteristic] + '</strong></li>'
                }
                var section =
                    '<input type="radio" id="available-section-' + printerId + '" aria-hidden="true" name="available">' +
                    '<label style="overflow:hidden;display:inline-block;text-overflow: ellipsis;white-space: nowrap;" for="available-section-' + printerId + '" aria-hidden="true"><strong>' + printerId + '</strong></label>' +
                    '<div><ul>' + characteristics + '</ul></div>'
                this.append(section)
            }
            var printersCount = Object.keys(data).length
            this.append('<p>Available ' + printersCount + ' printer(s).</p>')

            showConfiguredPrinters()
        },
        error: function (xhr, type) {
            showToastMessage("Cannot get available printers list.")
            this.html("")
            $('#ConfiguredPrintersList').html("")
        }
    })
}

function showConfiguredPrinters() {
    $.ajax({
        type: 'GET',
        url: '/service/printers',
        data: {},
        dataType: 'json',
        timeout: 0,
        context: $('#ConfiguredPrintersList'),
        success: function (data) {
            this.html("")
            for (var printerId in data) {
                var printer = data[printerId]
                var ready = (printerId in availablePrinters && availablePrinters[printerId].uri === printer.uri)
                var section =
                    '<input type="radio" id="configured-section-' + printerId + '" aria-hidden="true" name="configured">' +
                    '<label style="overflow:hidden;display:inline-block;text-overflow: ellipsis;white-space: nowrap;" for="configured-section-' + printerId + '" aria-hidden="true"><strong>' + printerId + '</strong>&nbsp;<small><mark class="' + (ready ? "tertiary" : "secondary") + ' tag">' + (ready ? "Ready" : "Not found") + '</mark><small></label>' +
                    '<div class="input-group vertical"><input id="' + printerId + '" value="' + printer.uri + '" /><div><button class="small secondary" onclick="deletePrinter(\'' + printer.uri + '\')">Delete printer</button></div></div>'
                this.append(section)
            }
            var printersCount = Object.keys(data).length
            this.append('<p>Configured ' + printersCount + ' printer(s).</p>')
        },
        error: function (xhr, type) {
            showToastMessage("Cannot get configured printers list.")
            this.html("")
        }
    })
}

function getServerVariables() {
    $.ajax({
        type: 'GET',
        url: '/service/vars',
        data: {},
        dataType: 'json',
        timeout: 0,
        success: function (data) {
            $("#Version").html('ver.' + data.version)
            $("#ServerId").html('Server Id: ' + data.serverId)
        },
        error: function (xhr, type) {
            showToastMessage("Cannot get server variables.")
        }
    })
}

function detectAvailablePrinters() {
    $("#DetectButton").attr("disabled", "disabled")
    $('#PrintersList').html('<div class="spinner primary"></div>Detecting...')
    $('#ConfiguredPrintersList').html('<div class="spinner primary"></div>Loading...')
    $.ajax({
        type: 'GET',
        url: '/service/detect',
        data: {},
        timeout: 0,
        success: function (data) {
            showPrinters()
            $("#DetectButton").attr("disabled", null)
        },
        error: function (xhr, type) {
            showToastMessage("Cannot detect printers now. Try again later.")
            showPrinters()
            $("#DetectButton").attr("disabled", null)
        }
    })
}

function showPrinters() {
    showAvailablePrinters()
}

function configurePrinter() {
    $("#NewPrinterModal").prop('checked', false)
    $.ajax({
        type: 'POST',
        url: '/service/printers/add',
        data: JSON.stringify({
            "id": $("#NewPrinterId").val(),
            "uri": $("#NewPrinterUri").val()
        }),
        contentType: 'application/json',
        dataType: 'json',
        timeout: 0,
        success: function (data) {
            detectAvailablePrinters()
        },
        error: function (xhr, type) {
            showToastMessage("Cannot configure the new printer.")
        }
    })
}

function deletePrinter(printerUri) {
    $.ajax({
        type: 'POST',
        url: '/service/printers/delete',
        data: JSON.stringify({
            "id": printerUri
        }),
        contentType: 'application/json',
        dataType: 'json',
        timeout: 0,
        success: function (data) {
            detectAvailablePrinters()
        },
        error: function (xhr, type) {
            showToastMessage("Cannot delete the printer.")
        }
    })
}

function showToastMessage(msg) {
    var toastArea = $("#ToastArea")
    toastArea.html('<span class="toast">' + msg + '</span>')
    setTimeout(function () { toastArea.html(""); }, 3000);
}

$(function () {
    getServerVariables()
    showPrinters()
})
