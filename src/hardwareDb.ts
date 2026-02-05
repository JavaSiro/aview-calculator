/**
 * AVIEW Calculator - Hardware Database
 * Benchmark-calibrated: LCS/CAC/LAA on RTX 2070, Tesla T4, RTX 4090
 * Tier 0–2: Entry (GTX/2060/2070/T4), 3–5: Mid (3080/4080), 6: 4090, 7+: Workstation
 */

export type GPU = {
  id: string
  name: string
  vramGB: number
  tier: number
  category: 'consumer' | 'workstation'
  excludeWhenTimeCritical?: boolean
}

export type CPU = {
  id: string
  name: string
  cores: number
  vendor: 'intel' | 'amd'
  isHighEnd: boolean
}

export type RAM = {
  capacityGB: number
}

export const GPUS: GPU[] = [
  // Tier 0 – Very entry (slower than benchmark 2070/T4)
  { id: 'gtx-1660-ti', name: 'NVIDIA GTX 1660 Ti (6 GB)', vramGB: 6, tier: 0, category: 'consumer', excludeWhenTimeCritical: true },
  { id: 'rtx-2060', name: 'NVIDIA RTX 2060 (6 GB)', vramGB: 6, tier: 0, category: 'consumer', excludeWhenTimeCritical: true },
  { id: 'rtx-3050', name: 'NVIDIA RTX 3050 (8 GB)', vramGB: 8, tier: 0, category: 'consumer', excludeWhenTimeCritical: true },
  // Tier 1 – Entry
  { id: 'rtx-2060-super', name: 'NVIDIA RTX 2060 Super (8 GB)', vramGB: 8, tier: 1, category: 'consumer', excludeWhenTimeCritical: true },
  { id: 'rtx-3060-8gb', name: 'NVIDIA RTX 3060 (8 GB)', vramGB: 8, tier: 1, category: 'consumer', excludeWhenTimeCritical: true },
  { id: 'rtx-4060', name: 'NVIDIA RTX 4060 (8 GB)', vramGB: 8, tier: 1, category: 'consumer', excludeWhenTimeCritical: true },
  // Tier 2 – Benchmark baseline (RTX 2070 / Tesla T4 level)
  { id: 'rtx-2070', name: 'NVIDIA RTX 2070 (8 GB)', vramGB: 8, tier: 2, category: 'consumer' },
  { id: 'rtx-2070-super', name: 'NVIDIA RTX 2070 Super (8 GB)', vramGB: 8, tier: 2, category: 'consumer' },
  { id: 'tesla-t4', name: 'NVIDIA Tesla T4 (16 GB)', vramGB: 16, tier: 2, category: 'workstation' },
  { id: 'rtx-3060', name: 'NVIDIA RTX 3060 (12 GB)', vramGB: 12, tier: 2, category: 'consumer', excludeWhenTimeCritical: true },
  { id: 'rtx-3070', name: 'NVIDIA RTX 3070 (8 GB)', vramGB: 8, tier: 2, category: 'consumer' },
  { id: 'rtx-4060-ti', name: 'NVIDIA RTX 4060 Ti (8 GB)', vramGB: 8, tier: 2, category: 'consumer', excludeWhenTimeCritical: true },
  // Tier 3
  { id: 'rtx-3070-ti', name: 'NVIDIA RTX 3070 Ti (8 GB)', vramGB: 8, tier: 3, category: 'consumer' },
  { id: 'rtx-4070', name: 'NVIDIA RTX 4070 (12 GB)', vramGB: 12, tier: 3, category: 'consumer', excludeWhenTimeCritical: true },
  { id: 'rtx-4070-super', name: 'NVIDIA RTX 4070 Super (12 GB)', vramGB: 12, tier: 3, category: 'consumer' },
  { id: 'quadro-rtx-4000', name: 'NVIDIA Quadro RTX 4000 (8 GB)', vramGB: 8, tier: 3, category: 'workstation' },
  // Tier 4 – Above 2070, below 4090
  { id: 'rtx-3080', name: 'NVIDIA RTX 3080 (10 GB)', vramGB: 10, tier: 4, category: 'consumer' },
  { id: 'rtx-3080-12gb', name: 'NVIDIA RTX 3080 (12 GB)', vramGB: 12, tier: 4, category: 'consumer' },
  { id: 'rtx-3090', name: 'NVIDIA RTX 3090 (24 GB)', vramGB: 24, tier: 4, category: 'consumer' },
  { id: 'rtx-4070-ti', name: 'NVIDIA RTX 4070 Ti (12 GB)', vramGB: 12, tier: 4, category: 'consumer' },
  { id: 'rtx-4070-ti-super', name: 'NVIDIA RTX 4070 Ti Super (16 GB)', vramGB: 16, tier: 4, category: 'consumer' },
  { id: 'rtx-a4000', name: 'NVIDIA RTX A4000 (16 GB)', vramGB: 16, tier: 4, category: 'workstation' },
  { id: 'quadro-rtx-5000', name: 'NVIDIA Quadro RTX 5000 (16 GB)', vramGB: 16, tier: 4, category: 'workstation' },
  // Tier 5
  { id: 'rtx-4080', name: 'NVIDIA RTX 4080 (16 GB)', vramGB: 16, tier: 5, category: 'consumer' },
  { id: 'rtx-4080-super', name: 'NVIDIA RTX 4080 Super (16 GB)', vramGB: 16, tier: 5, category: 'consumer' },
  { id: 'rtx-a4500', name: 'NVIDIA RTX A4500 (20 GB)', vramGB: 20, tier: 5, category: 'workstation' },
  { id: 'rtx-a5000', name: 'NVIDIA RTX A5000 (24 GB)', vramGB: 24, tier: 5, category: 'workstation' },
  // Tier 6 – RTX 4090 (benchmark “better” tier)
  { id: 'rtx-4090', name: 'NVIDIA RTX 4090 (24 GB)', vramGB: 24, tier: 6, category: 'consumer' },
  { id: 'rtx-4090-d', name: 'NVIDIA RTX 4090 D (24 GB)', vramGB: 24, tier: 6, category: 'consumer' },
  // Tier 7
  { id: 'rtx-5080', name: 'NVIDIA RTX 5080 (16 GB)', vramGB: 16, tier: 7, category: 'consumer' },
  { id: 'rtx-5090', name: 'NVIDIA RTX 5090 (32 GB)', vramGB: 32, tier: 7, category: 'consumer' },
  { id: 'rtx-a5500', name: 'NVIDIA RTX A5500 (24 GB)', vramGB: 24, tier: 7, category: 'workstation' },
  // Tier 8–10 – Workstation / high concurrency
  { id: 'rtx-a6000', name: 'NVIDIA RTX A6000 (48 GB)', vramGB: 48, tier: 8, category: 'workstation' },
  { id: 'a40', name: 'NVIDIA A40 (48 GB)', vramGB: 48, tier: 8, category: 'workstation' },
  { id: 'rtx-6000-ada', name: 'NVIDIA RTX 6000 Ada (48 GB)', vramGB: 48, tier: 9, category: 'workstation' },
  { id: 'l40', name: 'NVIDIA L40 (48 GB)', vramGB: 48, tier: 9, category: 'workstation' },
  { id: 'h100-pcie', name: 'NVIDIA H100 PCIe (80 GB)', vramGB: 80, tier: 10, category: 'workstation' },
]

export const CPUS: CPU[] = [
  // Budget / light (6–10 cores)
  { id: 'i3-12100', name: 'Intel Core i3-12100 (4-Core)', cores: 4, vendor: 'intel', isHighEnd: false },
  { id: 'i5-12400', name: 'Intel Core i5-12400 (6-Core)', cores: 6, vendor: 'intel', isHighEnd: false },
  { id: 'i5-13400', name: 'Intel Core i5-13400 (10-Core)', cores: 10, vendor: 'intel', isHighEnd: false },
  { id: 'ryzen-5-5600', name: 'AMD Ryzen 5 5600 (6-Core)', cores: 6, vendor: 'amd', isHighEnd: false },
  { id: 'ryzen-5-7600', name: 'AMD Ryzen 5 7600 (6-Core)', cores: 6, vendor: 'amd', isHighEnd: false },
  { id: 'ryzen-7-5700x', name: 'AMD Ryzen 7 5700X (8-Core)', cores: 8, vendor: 'amd', isHighEnd: false },
  { id: 'ryzen-7-7700', name: 'AMD Ryzen 7 7700 (8-Core)', cores: 8, vendor: 'amd', isHighEnd: false },
  // Mid (12–16 cores)
  { id: 'i5-13600k', name: 'Intel Core i5-13600K (14-Core)', cores: 14, vendor: 'intel', isHighEnd: false },
  { id: 'i5-14600k', name: 'Intel Core i5-14600K (14-Core)', cores: 14, vendor: 'intel', isHighEnd: false },
  { id: 'i7-13700k', name: 'Intel Core i7-13700K (16-Core)', cores: 16, vendor: 'intel', isHighEnd: false },
  { id: 'i7-14700k', name: 'Intel Core i7-14700K (20-Core)', cores: 20, vendor: 'intel', isHighEnd: false },
  { id: 'ryzen-9-7900', name: 'AMD Ryzen 9 7900 (12-Core)', cores: 12, vendor: 'amd', isHighEnd: false },
  { id: 'ryzen-9-7900x', name: 'AMD Ryzen 9 7900X (12-Core)', cores: 12, vendor: 'amd', isHighEnd: false },
  { id: 'ryzen-9-7950x', name: 'AMD Ryzen 9 7950X (16-Core)', cores: 16, vendor: 'amd', isHighEnd: false },
  { id: 'ryzen-9-7950x3d', name: 'AMD Ryzen 9 7950X3D (16-Core)', cores: 16, vendor: 'amd', isHighEnd: false },
  // High (20–24 cores)
  { id: 'i9-13900k', name: 'Intel Core i9-13900K (24-Core)', cores: 24, vendor: 'intel', isHighEnd: true },
  { id: 'i9-14900k', name: 'Intel Core i9-14900K (24-Core)', cores: 24, vendor: 'intel', isHighEnd: true },
  { id: 'xeon-w5-3435x', name: 'Intel Xeon w5-3435X (16-Core)', cores: 16, vendor: 'intel', isHighEnd: true },
  { id: 'xeon-w7-3455x', name: 'Intel Xeon w7-3455X (20-Core)', cores: 20, vendor: 'intel', isHighEnd: true },
  // Workstation (24+ cores)
  { id: 'threadripper-7960x', name: 'AMD Threadripper 7960X (24-Core)', cores: 24, vendor: 'amd', isHighEnd: true },
  { id: 'threadripper-7970x', name: 'AMD Threadripper 7970X (32-Core)', cores: 32, vendor: 'amd', isHighEnd: true },
  { id: 'threadripper-7980x', name: 'AMD Threadripper 7980X (64-Core)', cores: 64, vendor: 'amd', isHighEnd: true },
  { id: 'xeon-w9-3595x', name: 'Intel Xeon w9-3595X (24-Core)', cores: 24, vendor: 'intel', isHighEnd: true },
  { id: 'xeon-w9-3495x', name: 'Intel Xeon w9-3495X (56-Core)', cores: 56, vendor: 'intel', isHighEnd: true },
]

export const RAM_OPTIONS: RAM[] = [
  { capacityGB: 16 },
  { capacityGB: 32 },
  { capacityGB: 48 },
  { capacityGB: 64 },
  { capacityGB: 96 },
  { capacityGB: 128 },
  { capacityGB: 192 },
  { capacityGB: 256 },
  { capacityGB: 384 },
  { capacityGB: 512 },
]

const SLICE_BASELINE = 300

export type HardwareRequirements = {
  requiredVRAM: number
  requiredCores: number
  concurrentUsers: number
  slices: number
  targetProcessingTime: number
  targetTimeCritical: boolean
  prioritizeHighEndCPU: boolean
}

export type HardwareResult = {
  gpuMin: GPU
  gpuRec: GPU
  cpuMin: CPU
  cpuRec: CPU
  ramMin: RAM
  ramRec: RAM
}

/**
 * Benchmark: 302 slices ~4 min, 1004 slices ~7.7 min on RTX 4090.
 * Simple workload (low slices, relaxed target) → tier 0–2 (2070/T4 or below).
 * Heavy workload → tier 5–6 (4080/4090).
 */
function getMinGPUTierFromBenchmark(slices: number, targetMin: number, users: number): number {
  const sliceFactor = slices / SLICE_BASELINE
  const timePressure = targetMin <= 7 ? 2 : targetMin <= 10 ? 1 : 0
  const userPressure = users > 5 ? 1 : users > 3 ? 0.5 : 0

  if (sliceFactor <= 0.5 && timePressure === 0 && users <= 1) return 0
  if (sliceFactor <= 1 && timePressure === 0 && users <= 2) return 1
  if (sliceFactor <= 1 && timePressure <= 1 && users <= 2) return 2
  if (sliceFactor > 2.5 || (sliceFactor > 2 && timePressure >= 1)) return 6
  if (sliceFactor > 1.8 || (sliceFactor > 1.5 && timePressure >= 1)) return 5
  if (timePressure >= 2) return 5
  if (timePressure >= 1 || userPressure > 0) return 4
  return 2
}

function getRecommendedTierOffset(slices: number, targetMin: number, users: number): number {
  if (users > 5) return 3
  const sliceFactor = slices / SLICE_BASELINE
  const timePressure = targetMin <= 7 ? 2 : targetMin <= 10 ? 1 : 0
  if (sliceFactor > 2 || timePressure >= 2) return 2
  if (sliceFactor > 1.5 || timePressure >= 1) return 1
  return 1
}

export function findBestHardware(req: HardwareRequirements): HardwareResult {
  const { requiredVRAM, requiredCores, concurrentUsers, slices, targetProcessingTime, targetTimeCritical, prioritizeHighEndCPU } = req

  const minTierFromBenchmark = getMinGPUTierFromBenchmark(slices, targetProcessingTime, concurrentUsers)
  const recTierOffset = getRecommendedTierOffset(slices, targetProcessingTime, concurrentUsers)

  let gpuCandidates = GPUS.filter((g) => g.vramGB >= requiredVRAM && g.tier >= minTierFromBenchmark)
  if (targetTimeCritical) {
    gpuCandidates = gpuCandidates.filter((g) => !g.excludeWhenTimeCritical)
  }
  gpuCandidates.sort((a, b) => a.tier - b.tier)

  const fallbackGpu = [...GPUS].sort((a, b) => b.vramGB - a.vramGB)[0]
  const gpuMin = gpuCandidates[0] ?? fallbackGpu
  const recTierTarget = gpuMin.tier + recTierOffset
  const gpuRec =
    concurrentUsers > 5
      ? gpuCandidates.find((g) => g.tier >= 8) ?? gpuCandidates[gpuCandidates.length - 1] ?? gpuMin
      : gpuCandidates.find((g) => g.tier >= recTierTarget) ?? gpuCandidates[gpuCandidates.length - 1] ?? gpuMin

  let cpuCandidates = CPUS.filter((c) => c.cores >= requiredCores)
  if (prioritizeHighEndCPU && cpuCandidates.some((c) => c.isHighEnd)) {
    cpuCandidates = cpuCandidates.filter((c) => c.isHighEnd)
  }
  cpuCandidates.sort((a, b) => a.cores - b.cores)

  const fallbackCpu = [...CPUS].sort((a, b) => b.cores - a.cores)[0]
  const cpuMin = cpuCandidates[0] ?? fallbackCpu
  const cpuRec =
    cpuCandidates.length > 1
      ? cpuCandidates[Math.min(1, cpuCandidates.length - 1)]
      : cpuMin

  const ramMinRequired = concurrentUsers > 5 ? 64 : concurrentUsers > 3 ? 64 : concurrentUsers > 1 ? 32 : 16
  const ramRecRequired = concurrentUsers > 5 ? 128 : concurrentUsers > 3 ? 128 : concurrentUsers > 1 ? 64 : 32

  const ramMin = RAM_OPTIONS.find((r) => r.capacityGB >= ramMinRequired) ?? RAM_OPTIONS[0]
  const ramRecIdx = RAM_OPTIONS.findIndex((r) => r.capacityGB >= ramRecRequired)
  const ramRec =
    ramRecIdx >= 0
      ? RAM_OPTIONS[ramRecIdx]
      : RAM_OPTIONS[RAM_OPTIONS.length - 1]

  return {
    gpuMin,
    gpuRec,
    cpuMin,
    cpuRec,
    ramMin,
    ramRec,
  }
}
