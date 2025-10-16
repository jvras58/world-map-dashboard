"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Upload, FileText, AlertCircle, CheckCircle, Table, Info } from "lucide-react"
import Papa from "papaparse"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply: (data: any) => void
}

interface ParsedData {
  headers: string[]
  rows: any[]
  summary: {
    totalRows: number
    validRows: number
    countries: string[]
    dateRange: { start: string; end: string }
    avgRating: number
  }
  ignoredRows: {
    row: any
    reason: string
    lineNumber: number
  }[]
}

// List of valid country codes (ISO 3166-1 alpha-2)
const validCountryCodes = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW",
]

export default function UploadDialog({ isOpen, onClose, onApply }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [showIgnoredRows, setShowIgnoredRows] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setError(null)
      setParsedData(null)
      setIsUploading(false)
      setShowIgnoredRows(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setParsedData(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
      setParsedData(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const validateAndParseCSV = (csvData: string) => {
    try {
      // Parse CSV
      const results = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        dynamicTyping: false, // Keep as strings to preserve leading zeros
      })

      if (results.errors && results.errors.length > 0) {
        setError(`CSV parsing error: ${results.errors[0].message}`)
        return null
      }

      if (!results.data || results.data.length === 0) {
        setError("No data found in the CSV file")
        return null
      }

      // Check required columns
      const requiredColumns = ["Date", "Package Name", "Country", "Daily Average Rating", "Total Average Rating"]
      const headers = Object.keys(results.data[0])

      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(", ")}`)
        return null
      }

      // Validate data types and track ignored rows
      const ignoredRows = []
      const validatedData = []

      results.data.forEach((row: any, index: number) => {
        // Track if this row should be ignored
        let shouldIgnore = false
        let ignoreReason = ""

        // Check if date is valid
        if (!row.Date || !row.Date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          shouldIgnore = true
          ignoreReason = "Invalid date format"
        }

        // Check if country code is valid (in our list of valid codes)
        else if (!row.Country || !validCountryCodes.includes(row.Country)) {
          shouldIgnore = true
          ignoreReason = "Unrecognized country code"
        }

        // Check if daily rating is zero (ignore as requested)
        else if (row["Daily Average Rating"] === "0.0" || row["Daily Average Rating"] === "0") {
          shouldIgnore = true
          ignoreReason = "Zero daily rating"
        }

        // Check if ratings are valid numbers
        else {
          const dailyRating = Number.parseFloat(row["Daily Average Rating"])
          const totalRating = Number.parseFloat(row["Total Average Rating"])

          if (isNaN(dailyRating) || dailyRating < 0 || dailyRating > 5) {
            shouldIgnore = true
            ignoreReason = "Invalid daily rating value"
          } else if (isNaN(totalRating) || totalRating < 0 || totalRating > 5) {
            shouldIgnore = true
            ignoreReason = "Invalid total rating value"
          }
        }

        // Add to appropriate array
        if (shouldIgnore) {
          ignoredRows.push({
            row,
            reason: ignoreReason,
            lineNumber: index + 2, // +2 because index is 0-based and we have a header row
          })
        } else {
          validatedData.push(row)
        }
      })

      if (validatedData.length === 0) {
        setError("No valid data found after validation")
        return null
      }

      // Calculate summary statistics
      const countries = [...new Set(validatedData.map((row: any) => row.Country))]
      const dates = validatedData.map((row: any) => row.Date)
      const startDate = dates.reduce((a, b) => (a < b ? a : b))
      const endDate = dates.reduce((a, b) => (a > b ? a : b))

      const avgRating =
        validatedData.reduce((sum: number, row: any) => {
          return sum + Number.parseFloat(row["Daily Average Rating"])
        }, 0) / validatedData.length

      // Prepare data for preview
      const parsedResult: ParsedData = {
        headers: requiredColumns,
        rows: validatedData.slice(0, 10), // Show only first 10 rows in preview
        summary: {
          totalRows: results.data.length,
          validRows: validatedData.length,
          countries,
          dateRange: { start: startDate, end: endDate },
          avgRating: Number.parseFloat(avgRating.toFixed(2)),
        },
        ignoredRows: ignoredRows,
      }

      return parsedResult
    } catch (err) {
      console.error("Error processing CSV:", err)
      setError(`Error processing file: ${err.message}`)
      return null
    }
  }

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const csvData = e.target?.result as string
      const parsedResult = validateAndParseCSV(csvData)

      if (parsedResult) {
        setParsedData(parsedResult)
      }

      setIsUploading(false)
    }
    reader.onerror = () => {
      setError("Error reading file")
      setIsUploading(false)
    }
    reader.readAsText(file)
  }

  const handleApply = () => {
    if (!parsedData) return

    // Process the data into the format expected by the map
    const processedData = {}

    // Read the full data from the file again to process all rows
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvData = e.target?.result as string

      const results = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      })

      // Create a set of ignored row indices for quick lookup
      const ignoredIndices = new Set(parsedData.ignoredRows.map((item) => item.lineNumber - 2))

      // Group by date
      results.data.forEach((row: any, index: number) => {
        // Skip ignored rows
        if (ignoredIndices.has(index)) {
          return
        }

        const date = row.Date
        const country = row.Country
        const packageName = row["Package Name"]
        const dailyRating = Number.parseFloat(row["Daily Average Rating"])
        const totalRating = Number.parseFloat(row["Total Average Rating"])

        if (!processedData[date]) {
          processedData[date] = {}
        }

        processedData[date][country] = {
          packageName,
          dailyRating,
          totalRating,
          highlighted: true,
        }
      })

      onApply(processedData)
    }

    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Rating Data</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {!parsedData ? (
          <>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" ref={fileInputRef} />

              {file ? (
                <div className="flex flex-col items-center">
                  <FileText size={40} className="text-teal-500 mb-2" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB • CSV</p>
                  <button
                    className="mt-4 text-sm text-teal-600 hover:text-teal-800"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Drag & drop your CSV file here</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">or</p>
                  <button
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse files
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start space-x-2 bg-red-50 p-3 rounded-md mb-4">
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-4">
              <p>Expected CSV format:</p>
              <p className="font-mono bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                Date,Package Name,Country,Daily Average Rating,Total Average Rating
              </p>
              <p className="mt-2">Example:</p>
              <p className="font-mono bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                2025-04-01,com.example.app,US,4.5909,4.4646
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleUpload}
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  "Validate & Preview"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle size={20} className="text-green-500" />
                <h4 className="font-medium">File validated successfully</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Valid Rows</p>
                  <p className="text-lg font-medium">
                    {parsedData.summary.validRows.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">
                      of {parsedData.summary.totalRows.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Countries</p>
                  <p className="text-lg font-medium">{parsedData.summary.countries.length}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Date Range</p>
                  <p className="text-sm font-medium">
                    {parsedData.summary.dateRange.start} to {parsedData.summary.dateRange.end}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                  <p className="text-lg font-medium">{parsedData.summary.avgRating}/5</p>
                </div>
              </div>

              {parsedData.ignoredRows.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowIgnoredRows(!showIgnoredRows)}
                    className="flex items-center text-sm text-amber-600 hover:text-amber-800 mb-2"
                  >
                    <Info size={16} className="mr-1" />
                    {parsedData.ignoredRows.length} rows were ignored
                    <span className="ml-1 underline">{showIgnoredRows ? "Hide details" : "Show details"}</span>
                  </button>

                  {showIgnoredRows && (
                    <div className="border rounded-md overflow-x-auto bg-amber-50 mb-4">
                      <table className="min-w-full divide-y divide-amber-200">
                        <thead className="bg-amber-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                              Line
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                              Reason
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                              Data
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-200">
                          {parsedData.ignoredRows.slice(0, 10).map((item, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs text-amber-800">{item.lineNumber}</td>
                              <td className="px-3 py-2 text-xs text-amber-800">{item.reason}</td>
                              <td className="px-3 py-2 text-xs font-mono text-amber-800 truncate max-w-xs">
                                {Object.values(item.row).join(",")}
                              </td>
                            </tr>
                          ))}
                          {parsedData.ignoredRows.length > 10 && (
                            <tr>
                              <td colSpan={3} className="px-3 py-2 text-xs text-center text-amber-800">
                                ...and {parsedData.ignoredRows.length - 10} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Table size={16} className="mr-1" />
                  Data Preview (First 10 valid rows)
                </h4>
                <div className="border rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {parsedData.headers.map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.rows.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {parsedData.headers.map((header) => (
                            <td key={`${index}-${header}`} className="px-3 py-2 text-xs text-gray-500">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={onClose}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600" onClick={handleApply}>
                Apply Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
