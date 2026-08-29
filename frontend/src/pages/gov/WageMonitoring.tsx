import { TrendingDown, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react'

// ─── DEMO DATA ──────────────────────────────────────────────────────────────
interface WageRecord {
  workerId: string
  occupation: string
  district: string
  reportedWage: number
  referenceWage: number
  discrepancyAmt: number
  discrepancyPct: number
  riskLevel: 'Normal' | 'Monitor' | 'Potential Discrepancy'
}

const WAGE_RECORDS: WageRecord[] = [
  { workerId: 'W-4412', occupation: 'Mason',            district: 'Surat',       reportedWage: 8500,  referenceWage: 12000, discrepancyAmt: 3500, discrepancyPct: 29.2, riskLevel: 'Potential Discrepancy' },
  { workerId: 'W-2891', occupation: 'Diamond Polisher', district: 'Surat',       reportedWage: 11200, referenceWage: 14000, discrepancyAmt: 2800, discrepancyPct: 20.0, riskLevel: 'Potential Discrepancy' },
  { workerId: 'W-3309', occupation: 'Weaver',           district: 'Ahmedabad',   reportedWage: 9800,  referenceWage: 11000, discrepancyAmt: 1200, discrepancyPct: 10.9, riskLevel: 'Monitor'               },
  { workerId: 'W-5571', occupation: 'Electrician',      district: 'Vadodara',    reportedWage: 14500, referenceWage: 15000, discrepancyAmt:  500, discrepancyPct:  3.3, riskLevel: 'Normal'                },
  { workerId: 'W-1023', occupation: 'Machine Operator', district: 'Rajkot',      reportedWage: 10200, referenceWage: 12500, discrepancyAmt: 2300, discrepancyPct: 18.4, riskLevel: 'Monitor'               },
  { workerId: 'W-7784', occupation: 'Plumber',          district: 'Gandhinagar', reportedWage: 7800,  referenceWage: 12000, discrepancyAmt: 4200, discrepancyPct: 35.0, riskLevel: 'Potential Discrepancy' },
]

const REFERENCE_WAGES = [
  { sector: 'Construction',  occupation: 'Mason',            minWage: 10000, refWage: 12000 },
  { sector: 'Construction',  occupation: 'Plumber',          minWage: 10000, refWage: 12000 },
  { sector: 'Construction',  occupation: 'Electrician',      minWage: 12000, refWage: 15000 },
  { sector: 'Construction',  occupation: 'Carpenter',        minWage: 10000, refWage: 11500 },
  { sector: 'Textiles',      occupation: 'Weaver',           minWage:  9000, refWage: 11000 },
  { sector: 'Textiles',      occupation: 'Embroidery Worker',minWage:  8500, refWage: 10000 },
  { sector: 'Diamond',       occupation: 'Diamond Polisher', minWage: 12000, refWage: 14000 },
  { sector: 'Diamond',       occupation: 'Sorter',           minWage: 10000, refWage: 12000 },
  { sector: 'Manufacturing', occupation: 'Machine Operator', minWage: 10000, refWage: 12500 },
]

const RISK_BADGE: Record<string, string> = {
  Normal:                 'bg-green-100 text-green-800',
  Monitor:                'bg-blue-100 text-blue-800',
  'Potential Discrepancy':'bg-amber-100 text-amber-800',
}
// ─────────────────────────────────────────────────────────────────────────────

export default function WageMonitoring() {
  const totalRecords  = 8234
  const normalCount   = 7031
  const monitorCount  = 892
  const discrepCount  = 311

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-indigo-600" />
          Wage Monitoring
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review reported wages against reference levels to identify cases that may require investigation</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Wage Records',        value: totalRecords.toLocaleString(), icon: <BarChart2    className="h-4 w-4 text-gray-500"  />, bg: 'bg-gray-50',   border: 'border-l-gray-400'  },
          { label: 'Normal Range',              value: normalCount.toLocaleString(),  icon: <CheckCircle  className="h-4 w-4 text-green-600" />, bg: 'bg-green-50',  border: 'border-l-green-500' },
          { label: 'Monitor',                   value: monitorCount.toLocaleString(), icon: <TrendingDown className="h-4 w-4 text-blue-500"  />, bg: 'bg-blue-50',   border: 'border-l-blue-500'  },
          { label: 'Potential Discrepancies',   value: discrepCount.toLocaleString(), icon: <AlertTriangle className="h-4 w-4 text-amber-500"/>, bg: 'bg-amber-50',  border: 'border-l-amber-500' },
        ].map((c) => (
          <div key={c.label} className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${c.border} p-4 flex items-center gap-4`}>
            <div className={`p-2 rounded-lg ${c.bg}`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
        <p className="font-semibold">⚠ Important Notice</p>
        <p className="mt-1 text-xs leading-relaxed">
          "Potential Discrepancy" indicates the reported wage may be below reference levels. This requires{' '}
          <strong>official investigation</strong> before any conclusions are drawn. Labels such as "Potential Discrepancy"
          are not legal determinations. Reference data shown is <strong>DEMO DATA</strong> for illustration purposes only.
        </p>
      </div>

      {/* Discrepancy Alert Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="font-semibold text-gray-800 text-sm">Wage Comparison — Sample Records</h2>
          <span className="ml-auto text-xs text-gray-400">DEMO DATA</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Worker ID</th>
                <th className="px-4 py-3 font-semibold">Occupation</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <th className="px-4 py-3 font-semibold">Reported Wage</th>
                <th className="px-4 py-3 font-semibold">Reference Wage</th>
                <th className="px-4 py-3 font-semibold">Difference</th>
                <th className="px-4 py-3 font-semibold">Diff %</th>
                <th className="px-4 py-3 font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {WAGE_RECORDS.map((r, idx) => (
                <tr key={r.workerId} className={`hover:bg-indigo-50/20 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.workerId}</td>
                  <td className="px-4 py-3 text-gray-700">{r.occupation}</td>
                  <td className="px-4 py-3 text-gray-600">{r.district}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">₹{r.reportedWage.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">₹{r.referenceWage.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {r.discrepancyAmt > 0 ? (
                      <span className="text-amber-700 font-medium">−₹{r.discrepancyAmt.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.discrepancyPct > 0 ? (
                      <span className="text-amber-700 font-medium">−{r.discrepancyPct.toFixed(1)}%</span>
                    ) : (
                      <span className="text-green-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_BADGE[r.riskLevel]}`}>
                      {r.riskLevel === 'Potential Discrepancy' ? '⚠ ' : ''}{r.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Wage Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-indigo-500" />
          <h2 className="font-semibold text-gray-800 text-sm">Reference Wage Table — Gujarat</h2>
          <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
            DEMO DATA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Occupation</th>
                <th className="px-4 py-3 font-semibold">Min. Wage (₹/mo)</th>
                <th className="px-4 py-3 font-semibold">Reference Wage (₹/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {REFERENCE_WAGES.map((r, idx) => (
                <tr key={idx} className={`${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.sector === 'Construction' ? 'bg-blue-100 text-blue-800' :
                      r.sector === 'Textiles'     ? 'bg-purple-100 text-purple-800' :
                      r.sector === 'Diamond'      ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {r.sector}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{r.occupation}</td>
                  <td className="px-4 py-2.5 text-gray-700">₹{r.minWage.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">₹{r.refWage.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] text-gray-400">
            ⚠ Reference wages are illustrative DEMO DATA and do not represent official Gujarat government minimum wage schedules.
            Always consult official GLCD notifications for enforcement purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
