/**
 * Centralized CSV Export Utility
 * Provides robust, cross-browser CSV generation and download functionality
 * with UTF-8 BOM encoding for proper international character support (Hindi, Gujarati, currency symbols).
 */

export function downloadCSV(filename: string, csvContent: string): void {
  // UTF-8 BOM (\uFEFF) ensures Excel and text viewers parse unicode correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  link.style.display = 'none'
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()

  // Delay cleanup to allow browser download stream to establish
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link)
      }
      URL.revokeObjectURL(url)
    } catch {
      // Ignore cleanup error
    }
  }, 1000)
}

export interface CSVColumn<T> {
  header: string
  key: keyof T | ((item: T) => string | number | boolean | null | undefined)
}

export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  columns: CSVColumn<T>[],
  data: T[]
): void {
  const headerRow = columns.map((col) => `"${String(col.header).replace(/"/g, '""')}"`).join(',')

  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        const val = typeof col.key === 'function' ? col.key(item) : item[col.key]
        if (val === null || val === undefined) return '""'
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      })
      .join(',')
  })

  const fullCsv = [headerRow, ...dataRows].join('\r\n')
  downloadCSV(filename, fullCsv)
}
