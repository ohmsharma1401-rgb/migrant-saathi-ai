import { DollarSign, Plus, Edit2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const DEMO_WAGES = [
  { id: 'RW001', state: 'Gujarat', sector: 'Construction', occupation: 'Mason', skill_level: 'semi_skilled', daily_wage: 520, monthly_wage: 13520, effective_date: '2024-04-01', source: 'Gujarat Labour Dept' },
  { id: 'RW002', state: 'Maharashtra', sector: 'Construction', occupation: 'Helper', skill_level: 'unskilled', daily_wage: 425, monthly_wage: 11050, effective_date: '2024-04-01', source: 'Maharashtra Labour Dept' },
  { id: 'RW003', state: 'Gujarat', sector: 'Textile', occupation: 'Weaver', skill_level: 'skilled', daily_wage: 580, monthly_wage: 15080, effective_date: '2024-04-01', source: 'Gujarat Labour Dept' },
  { id: 'RW004', state: 'Karnataka', sector: 'Manufacturing', occupation: 'Technician', skill_level: 'skilled', daily_wage: 640, monthly_wage: 16640, effective_date: '2024-04-01', source: 'Karnataka Labour Dept' },
]

const skillVariant = {
  unskilled: 'outline' as const,
  semi_skilled: 'secondary' as const,
  skilled: 'default' as const,
  highly_skilled: 'success' as const,
}

export default function ReferenceWages() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Reference Wages
          </h1>
          <p className="text-sm text-muted-foreground">Minimum wage reference data by state, sector, and skill level</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-1.5 h-4 w-4" /> Sync from Govt
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">State</th>
              <th className="px-4 py-3 text-left font-medium">Sector / Occupation</th>
              <th className="px-4 py-3 text-left font-medium">Skill Level</th>
              <th className="px-4 py-3 text-right font-medium">Daily</th>
              <th className="px-4 py-3 text-right font-medium">Monthly</th>
              <th className="px-4 py-3 text-left font-medium">Effective</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {DEMO_WAGES.map((w) => (
              <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{w.state}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {w.sector} / {w.occupation}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={skillVariant[w.skill_level as keyof typeof skillVariant]}>
                    {w.skill_level}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium">₹{w.daily_wage}</td>
                <td className="px-4 py-3 text-right font-medium">₹{w.monthly_wage.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.effective_date}</td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
