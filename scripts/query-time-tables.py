#!/usr/bin/env python

import argparse
import os
import re

import openpyxl

validTimeSecondsRegex = re.compile("^((([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])|24:00:00)$")
validTimeMinutesRegex = re.compile("^((([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])|24:00)$")


def process_spreadsheet(filename, first_only, expr, check_missing_event):
    wb = openpyxl.load_workbook(filename)
    if 'Rozpis' in wb.sheetnames:
        ws = wb['Rozpis']
    else:
        ws = wb.worksheets[0]

    for row in range(1, ws.max_row):
        for day in range(0, 5):
            col_start = day * 6
            start_time = ws.cell(row=row, column=col_start + 1)
            end_time = ws.cell(row=row, column=col_start + 2)
            event = ws.cell(row=row, column=col_start + 3)
            employee = ws.cell(row=row, column=col_start + 4)
            tariff = ws.cell(row=row, column=col_start + 5)
            note = ws.cell(row=row, column=col_start + 6)

            has_start = start_time.value and (
                    validTimeSecondsRegex.match(str(start_time.value)) or validTimeMinutesRegex.match(
                str(start_time.value)))
            has_end = end_time.value and (
                    validTimeSecondsRegex.match(str(end_time.value)) or validTimeMinutesRegex.match(
                str(end_time.value)))

            # # find filled records without an event
            if check_missing_event and has_start and has_end and employee.value and tariff.value and not event.value:
                print(f'Found in {filename} at row {row}; day {day}')
                if first_only:
                    return

            # find notes with an expression
            if expr and has_start and has_end:
                m = re.search(str(expr), str(note.value), re.IGNORECASE)
                if m is not None:
                    print(f'Found in {filename} at row {row}; day {day}: {str(note.value)}')
                    if first_only:
                        return


def process(path, first_only, expr, check_missing_event):
    for root, dirs, files in os.walk(path):
        for file in files:
            filename = os.path.join(root, file)

            if filename.endswith('.xlsx'):
                process_spreadsheet(filename, first_only, expr, check_missing_event)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("path", help="path to folder with time tables", )
    parser.add_argument("--first-only", dest='first_only', action='store_true', default=False, required=False,
                        help="show only one and first result per file")
    parser.add_argument("--expr", required=False, help="expression to search for in notes column in xlsx files")
    parser.add_argument("--check-missing-event", dest='check_missing_event', action='store_true', default=False,
                        required=False,
                        help="show valid records without an event")
    args = parser.parse_args()

    if not args.expr and not args.check_missing_event:
        print("--expr or --check-missing-event option should be specified")
        exit(1)

    process(args.path, args.first_only, args.expr, args.check_missing_event)
