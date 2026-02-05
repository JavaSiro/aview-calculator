import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { findBestHardware } from './hardwareDb'
import './App.css'

const ENGINES = [
  { id: 'apsLungNodule', label: 'apsLungNodule', vramLoad: 6, description: 'Lung nodule detection (LCS)' },
  { id: 'apsCAC', label: 'apsCAC', vramLoad: 4, description: 'Coronary artery calcification' },
  { id: 'apsLungCOPD', label: 'apsLungCOPD', vramLoad: 8, description: 'Emphysema & COPD analysis' },
] as const

const MB_PER_STUDY = 300
const TB_IN_MB = 1_000_000
const STORAGE_TIERS_TB = [1, 2, 4, 8, 16, 32, 64]

function roundUpToStandardStorageTB(requiredTB: number): string {
  const tier = STORAGE_TIERS_TB.find((t) => requiredTB <= t)
  return tier ? `${tier} TB` : `${Math.ceil(requiredTB / 64) * 64} TB`
}

type Config = { storage: string; cpu: string; ram: string; gpu: string }

type SolutionSpec = {
  minimum: Config
  recommended: Config
  requiredStorageTB: number
  enginesUsed: string[]
}

function calculateSolution(
  engines: Record<string, boolean>,
  studies: number,
  slices: number,
  concurrentUsers: number,
  retentionMonths: number,
  targetProcessingTime: number
): SolutionSpec | null {
  const enginesUsed = ENGINES.filter((e) => engines[e.id]).map((e) => e.label)
  if (enginesUsed.length === 0) return null

  // Required VRAM = Sum of active engines + (ConcurrentUsers * 1.5GB buffer)
  // + slice-based bump (benchmark: higher slices = more memory pressure)
  const engineVRAM = ENGINES.filter((e) => engines[e.id]).reduce((sum, e) => sum + e.vramLoad, 0)
  const sliceVRAMBump = slices >= 900 ? 4 : slices >= 600 ? 2 : 0
  const requiredVRAM = Math.max(6, engineVRAM + concurrentUsers * 1.5 + sliceVRAMBump)

  // Required Cores = 8 (base) + (ConcurrentUsers * 2) – allows simpler CPUs for light workloads
  const requiredCores = 8 + concurrentUsers * 2

  // Processing Time Factor: TargetTime < 7 → exclude lower-tier GPUs (3060, 4070)
  const targetTimeCritical = targetProcessingTime < 7

  // Users > 5 → prioritize Threadripper/Xeon/Core i9
  const prioritizeHighEndCPU = concurrentUsers > 5

  const hw = findBestHardware({
    requiredVRAM,
    requiredCores,
    concurrentUsers,
    slices,
    targetProcessingTime,
    targetTimeCritical,
    prioritizeHighEndCPU,
  })

  // A. STORAGE (Independent of Speed)
  const requiredStorageMB = studies * MB_PER_STUDY * retentionMonths
  const requiredStorageTB = requiredStorageMB / TB_IN_MB
  const storageMin = `${requiredStorageTB.toFixed(1)} TB`
  const storageRec = roundUpToStandardStorageTB(requiredStorageTB)

  return {
    minimum: {
      storage: storageMin,
      cpu: hw.cpuMin.name,
      ram: `${hw.ramMin.capacityGB} GB`,
      gpu: hw.gpuMin.name,
    },
    recommended: {
      storage: storageRec,
      cpu: hw.cpuRec.name,
      ram: `${hw.ramRec.capacityGB} GB`,
      gpu: hw.gpuRec.name,
    },
    requiredStorageTB,
    enginesUsed,
  }
}

const inputClass =
  'w-full px-4 py-3 bg-[#1a1d21] text-white border border-aview-emerald rounded-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-aview-emerald/50'

function App() {
  const [engines, setEngines] = useState<Record<string, boolean>>({
    apsLungNodule: true,
    apsCAC: true,
    apsLungCOPD: true,
  })
  const [studiesPerMonth, setStudiesPerMonth] = useState('500')
  const [slicesPerStudy, setSlicesPerStudy] = useState('300')
  const [concurrentUsers, setConcurrentUsers] = useState('1')
  const [targetProcessingTime, setTargetProcessingTime] = useState('10')
  const [retentionMonths, setRetentionMonths] = useState('12')
  const [solution, setSolution] = useState<SolutionSpec | null>(null)

  const toggleEngine = useCallback((id: string) => {
    setEngines((prev) => ({ ...prev, [id]: !prev[id] }))
    setSolution(null)
  }, [])

  const clearSolution = useCallback(() => setSolution(null), [])

  const studiesNum = Math.max(0, Math.min(100000, Math.floor(Number(studiesPerMonth) || 0)))
  const slicesNum = Math.max(0, Math.min(10000, Math.floor(Number(slicesPerStudy) || 0)))
  const usersNum = Math.max(1, Math.min(10, Number(concurrentUsers) || 1))
  const targetTimeNum = Math.max(5, Math.min(15, Number(targetProcessingTime) || 10))
  const retentionNum = Math.max(1, Math.min(120, Math.floor(Number(retentionMonths) || 1)))
  const activeEngineCount = Object.values(engines).filter(Boolean).length

  const isValidInteger = (s: string) => {
    if (s === '') return false
    const n = Number(s)
    if (Number.isNaN(n)) return false
    if (!Number.isInteger(n)) return false
    return true
  }

  const studiesInvalid =
    !isValidInteger(studiesPerMonth) ||
    Number(studiesPerMonth) < 1 ||
    Number(studiesPerMonth) > 100000
  const slicesInvalid =
    !isValidInteger(slicesPerStudy) ||
    Number(slicesPerStudy) < 1 ||
    Number(slicesPerStudy) > 10000
  const retentionInvalid =
    !isValidInteger(retentionMonths) ||
    Number(retentionMonths) < 1 ||
    Number(retentionMonths) > 120
  const usersInvalid =
    concurrentUsers === '' ||
    Number.isNaN(Number(concurrentUsers)) ||
    Number(concurrentUsers) < 1 ||
    Number(concurrentUsers) > 10
  const targetTimeInvalid =
    targetProcessingTime === '' ||
    Number.isNaN(Number(targetProcessingTime)) ||
    Number(targetProcessingTime) < 5 ||
    Number(targetProcessingTime) > 15
  const paramsValid = !studiesInvalid && !slicesInvalid && !retentionInvalid && !usersInvalid && !targetTimeInvalid

  const handleCalculate = () => {
    const result = calculateSolution(
      engines,
      studiesNum,
      slicesNum,
      usersNum,
      retentionNum,
      targetTimeNum
    )
    setSolution(result)
  }

  const handleDownloadPDF = async () => {
    const element = document.getElementById('hardware-results-panel')
    if (!element) {
      console.error('CRITICAL: Element not found')
      alert('Error: Could not find the results panel to print.')
      return
    }
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#1a1d21',
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as Window & { showSaveFilePicker: (opts: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: 'AVIEW_Hardware_Quote.pdf',
            types: [{
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          })
          const writable = await handle.createWritable()
          await writable.write(pdf.output('blob'))
          await writable.close()
          return
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return
        }
      }

      pdf.save('AVIEW_Hardware_Quote.pdf')
    } catch (error) {
      console.error('PDF Generation Failed:', error)
      alert('Failed to generate PDF. Check console for details.')
    }
  }

  const handleShareEmail = () => {
    if (!solution) return
    const body = [
      'Here are the required specs:',
      '',
      'Minimum Configuration:',
      `Storage: ${solution.minimum.storage}`,
      `CPU: ${solution.minimum.cpu}`,
      `RAM: ${solution.minimum.ram}`,
      `GPU: ${solution.minimum.gpu}`,
      '',
      'Recommended Configuration:',
      `Storage: ${solution.recommended.storage}`,
      `CPU: ${solution.recommended.cpu}`,
      `RAM: ${solution.recommended.ram}`,
      `GPU: ${solution.recommended.gpu}`,
    ].join('\n')
    const mailto = `mailto:?subject=${encodeURIComponent('AVIEW Hardware Specification Quote')}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  return (
    <div className="min-h-screen bg-aviewSlate text-gray-100 flex">
      {/* Left Sidebar */}
      <aside className="w-80 bg-[#141619] border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-aview-emerald font-semibold text-lg tracking-tight">
            AVIEW Calculator
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Solution Architect
          </p>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-6 overflow-auto">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              B3 Engines
            </h2>
            <ul className="space-y-2">
              {ENGINES.map((engine) => (
                <li key={engine.id}>
                  <button
                    type="button"
                    onClick={() => toggleEngine(engine.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      engines[engine.id]
                        ? 'bg-[#00bfa5]/15 border-2 border-[#00bfa5]'
                        : 'bg-gray-800/50 border-2 border-gray-700/50 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        engines[engine.id]
                          ? 'border-[#00bfa5] bg-[#00bfa5]'
                          : 'border-gray-500'
                      }`}
                    >
                      {engines[engine.id] && (
                        <svg className="w-2.5 h-2.5 text-aview-slate" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-medium text-sm ${engines[engine.id] ? 'text-white' : ''}`}>
                        {engine.label}
                      </div>
                      <div className={`text-xs truncate ${engines[engine.id] ? 'text-gray-400' : 'text-gray-500 opacity-75'}`}>
                        {engine.description}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Workload Parameters
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Studies per Month
                </label>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  value={studiesPerMonth}
                  onChange={(e) => {
                    setStudiesPerMonth(e.target.value)
                    clearSolution()
                  }}
                  placeholder="1–100,000"
                  className={`${inputClass} ${studiesInvalid ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                />
                {studiesInvalid && (
                  <p className="text-red-500 text-xs mt-1">Enter a whole number between 1 and 100,000</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Slices per Study
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  value={slicesPerStudy}
                  onChange={(e) => {
                    setSlicesPerStudy(e.target.value)
                    clearSolution()
                  }}
                  placeholder="1–10,000"
                  className={`${inputClass} ${slicesInvalid ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                />
                {slicesInvalid && (
                  <p className="text-red-500 text-xs mt-1">Enter a whole number between 1 and 10,000</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Concurrent Users
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={concurrentUsers}
                  onChange={(e) => {
                    setConcurrentUsers(e.target.value)
                    clearSolution()
                  }}
                  placeholder="1–10"
                  className={`${inputClass} ${usersInvalid ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                />
                {usersInvalid && (
                  <p className="text-red-500 text-xs mt-1">Enter a value between 1 and 10</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target Processing Time (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={15}
                  value={targetProcessingTime}
                  onChange={(e) => {
                    setTargetProcessingTime(e.target.value)
                    clearSolution()
                  }}
                  placeholder="5–15, default 10"
                  className={`${inputClass} ${targetTimeInvalid ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                />
                {targetTimeInvalid ? (
                  <p className="text-red-500 text-xs mt-1">Enter a value between 5 and 15</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Range: 5–15 min</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Retention Period (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={retentionMonths}
                  onChange={(e) => {
                    setRetentionMonths(e.target.value)
                    clearSolution()
                  }}
                  placeholder="1–120"
                  className={`${inputClass} ${retentionInvalid ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                />
                {retentionInvalid && (
                  <p className="text-red-500 text-xs mt-1">Enter a whole number between 1 and 120</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={activeEngineCount === 0 || !paramsValid}
            className="w-full px-6 py-3 bg-aview-emerald text-aview-slate font-semibold rounded-lg hover:bg-aview-emerald/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-aview-emerald focus:ring-offset-2 focus:ring-offset-aview-slate transition-colors"
          >
            Calculate
          </button>
          <p className="text-xs text-gray-600 text-center">
            {!paramsValid
              ? 'Fix invalid values (whole numbers only, no letters or symbols)'
              : `${activeEngineCount} engine${activeEngineCount !== 1 ? 's' : ''} selected`}
          </p>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="flex-1 overflow-auto p-8 flex items-start justify-center">
        <div className="w-full max-w-6xl">
          {solution ? (
            <>
            <div
              id="hardware-results-panel"
              className="bg-[#1a1d21] rounded-xl border-2 border-aview-emerald/50 overflow-hidden"
            >
            <section className="bg-[#141619] rounded-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-800 bg-aview-emerald/10">
                <h2 className="text-xl font-semibold text-aview-emerald">
                  Tailored Solution Specification
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Based on {solution.enginesUsed.join(', ')} • {studiesNum} studies/mo • {slicesNum} slices/study • {retentionNum} mo retention
                  {solution.requiredStorageTB > 0 && (
                    <span> • {solution.requiredStorageTB.toFixed(1)} TB required</span>
                  )}
                </p>
              </div>
              <div className="grid md:grid-cols-2 divide-x divide-gray-800">
                <div className="p-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Minimum Required
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Barely meets 15 min / 1 user specs</p>
                  <dl className="space-y-5">
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Storage</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.minimum.storage}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">CPU</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.minimum.cpu}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">RAM</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.minimum.ram}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">GPU</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.minimum.gpu}</dd>
                    </div>
                  </dl>
                </div>
                <div className="p-8">
                  <h3 className="text-sm font-semibold text-aview-emerald uppercase tracking-wider mb-4">
                    Recommended Performance
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Comfortably meets 5 min / 10 user specs</p>
                  <dl className="space-y-5">
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Storage</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.recommended.storage}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">CPU</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.recommended.cpu}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">RAM</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.recommended.ram}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">GPU</dt>
                      <dd className="text-aview-emerald font-medium text-base">{solution.recommended.gpu}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 px-5 py-3 bg-aview-emerald text-aview-slate font-semibold rounded-lg hover:bg-aview-emerald/90 focus:outline-none focus:ring-2 focus:ring-aview-emerald focus:ring-offset-2 focus:ring-offset-aviewSlate transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Quote as PDF
              </button>
              <button
                type="button"
                onClick={handleShareEmail}
                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-aview-emerald text-aview-emerald font-semibold rounded-lg hover:bg-aview-emerald/10 focus:outline-none focus:ring-2 focus:ring-aview-emerald focus:ring-offset-2 focus:ring-offset-aviewSlate transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Share via Email
              </button>
            </div>
            </>
          ) : (
            <div className="bg-[#141619] rounded-xl border border-gray-800 p-16 text-center">
              <p className="text-gray-500 text-lg">
                Configure your parameters in the sidebar and click <strong className="text-aview-emerald">Calculate</strong> to generate your tailored solution specification.
              </p>
              {activeEngineCount === 0 && (
                <p className="text-amber-400/90 text-sm mt-4">
                  Enable at least one B3 engine to calculate.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
