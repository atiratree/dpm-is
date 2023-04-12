// run manually and set new fromYear and fromWeek once the script times out
// data start at fromYear=2015 fromWeek=19
const check = () => {
  try {
    compareGatheredDataByStrategies(2015, 19)
  } catch (x) {
    Utils.logError(x);
    console.log(x);
  }
}

// check consistency of gathered data between new DEFAULT_STRATEGY vs LEGACY_STRATEGY
// prints out a diff in a following format where - are missing entries in DEFAULT_STRATEGY and + are missing entries in LEGACY_STRATEGY
// - 2017-08-03 06:00:00 08:00:00 client2 Z AB note
// + 2017-08-04 12:00:00 08:00:00 client1 Z AB note
const compareGatheredDataByStrategies = (fromYear, fromWeek) => {
  let files = Utils.findFiles([], {
    type: 'Rozpis'
  })

  files = files.sort((a, b) => {
    return parseInt(a.year) == parseInt(b.year) ? parseInt(a.week) - parseInt(b.week) : parseInt(a.year) - parseInt(b.year)
  })

  files.forEach((file) => {
    if (file.year > fromYear || (file.year == fromYear && file.week >= fromWeek)) {
      const processingID = `${file.year}_${file.week}_${file.group}`
      console.log(`processing ${processingID}`);

      const spreadSheet = SpreadsheetApp.openById(file.id);
      const sheet = spreadSheet.getSheetByName('Rozpis') || spreadSheet.getSheets()[0];
      const layoutAndData = Utils.extractSpreadsheetData(sheet);

      if (!layoutAndData.valid || layoutAndData.strategy !== 'DEFAULT_STRATEGY') {
        Utils.logError(`FAILED_STRATEGY: ${processingID}: ${file.url} : ${JSON.stringify(layoutAndData.strategy)} : ${JSON.stringify(layoutAndData)}`)
      }

      const legacyLayoutAndData = Utils.extractSpreadsheetDataWithStrategy(sheet, "LEGACY_STRATEGY", {});

      const {missingInData, missingInLegacyData} = computeDiff(file, layoutAndData, legacyLayoutAndData)

      if (missingInData.length > 0) {
        Utils.logError(`FAILED_REGRESSION: ${processingID}: ${file.url} : ${JSON.stringify(layoutAndData.strategy)} : ${JSON.stringify(layoutAndData)}`)
      }

      // test both diff and JSON serialization
      if (missingInData.length > 0 || missingInLegacyData.length > 0 || JSON.stringify(layoutAndData.data) !== JSON.stringify(legacyLayoutAndData.data)) {
        Utils.logError(`FAILED_EQUALITY: ${processingID}: ${file.url}`)
        const diff = [...missingInData, ...missingInLegacyData].join("\n")
        Utils.logError(`FAILED_EQUALITY_DIFF: ${processingID}:\n${diff}`)
      }
    }
  })
}

const computeDiff = (file, layoutAndData, legacyLayoutAndData) => {
  const hData = humanReadable(file, layoutAndData.data)
  const hLegacyData = humanReadable(file, legacyLayoutAndData.data)
  const hDataSet = new Set(hData)
  const hLegacyDataSet = new Set(hLegacyData)


  let missingInLegacyData = hData.filter(day => !hLegacyDataSet.has(day)).map((day) => `+ ${day}`)
  let missingInData = hLegacyData.filter(day => !hDataSet.has(day)).map((day) => `- ${day}`)

  return {missingInLegacyData, missingInData}
}


const humanReadable = (file, data) => {
  const result = data.map((dayData) => {
    return dayDataToString(file, dayData)
  })
  return result.sort(((a, b) => {
    return a.toString().localeCompare(b.toString());
  }))
}

const dayDataToString = (file, dayData) => {
  const monday = new Date(file.weekStarts)
  const day = new Date(monday)
  day.setHours(0, 0, 0, 0)
  day.setDate(day.getDate() + dayData.dayInWeekIdx) // rollovers to the next month if necessary
  const readableDate = day.toISOString().slice(0, 10)

  return `${readableDate} ${dayData.from} ${dayData.to} ${dayData.event} ${dayData.employee} ${dayData.tariff} ${dayData.note}`
}