<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-ink-gray-9">{{ __("Spin the Wheel") }}</h3>
			<div class="text-sm text-ink-gray-6">
				{{ __("Points: {0}").format(totalPoints) }}
			</div>
		</div>

		<div class="border border-outline-gray-2 bg-surface-white rounded-xl p-6">
			<!-- Wheel -->
			<div class="flex justify-center mb-5">
				<div class="relative" :style="{ width: wheelSize + 'px', height: wheelSize + 'px' }">
					<!-- Pointer -->
					<div class="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
						<div class="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md"></div>
					</div>

					<!-- SVG Wheel -->
					<svg
						:width="wheelSize"
						:height="wheelSize"
						:viewBox="`0 0 ${wheelSize} ${wheelSize}`"
						class="rounded-full shadow-lg"
						:style="{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }"
					>
						<g v-for="(segment, idx) in segments" :key="idx">
							<path
								:d="getSegmentPath(idx)"
								:fill="segment.color"
								stroke="white"
								stroke-width="2"
							/>
							<text
								:x="wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * textRadius"
								:y="wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * textRadius"
								:text-anchor="middle"
								dominant-baseline="middle"
								:transform="`rotate(${getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * textRadius}, ${wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * textRadius})`"
								fill="white"
								class="text-[10px] font-bold pointer-events-none"
								style="font-size: 11px;"
							>
								{{ segment.points }}
							</text>
							<text
								:x="wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 18)"
								:y="wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 18)"
								:text-anchor="middle"
								dominant-baseline="middle"
								:transform="`rotate(${getSegmentAngle(idx) * (180 / Math.PI) + 90}, ${wheelSize / 2 + Math.cos(getSegmentAngle(idx)) * (textRadius - 18)}, ${wheelSize / 2 + Math.sin(getSegmentAngle(idx)) * (textRadius - 18)})`"
								fill="white"
								class="pointer-events-none"
								style="font-size: 9px; opacity: 0.8;"
							>
								{{ segment.label }}
							</text>
						</g>
						<circle :cx="wheelSize / 2" :cy="wheelSize / 2" :r="20" fill="white" />
					</svg>
				</div>
			</div>

			<!-- Spin Button -->
			<div class="text-center">
				<button
					@click="spin"
					:disabled="isSpinning || spinsLeft <= 0"
					class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
					:class="isSpinning || spinsLeft <= 0
						? 'bg-surface-gray-2 text-ink-gray-4 cursor-not-allowed'
						: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95'"
				>
					{{ isSpinning ? __("Spinning...") : __("SPIN!") }}
				</button>
				<div class="text-xs text-ink-gray-5 mt-2">
					{{ __("Spins left: {0}").format(spinsLeft) }}
				</div>
			</div>

			<!-- Result -->
			<transition
				enter-active-class="transition-all duration-300"
				enter-from-class="opacity-0 scale-90"
				leave-active-class="transition-all duration-200"
				leave-to-class="opacity-0 scale-90"
			>
				<div
					v-if="showResult"
					class="mt-4 text-center p-4 rounded-xl"
					:class="lastResult === 'miss'
						? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
						: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'"
				>
					<div class="text-2xl mb-1">
						{{ lastResult === 'miss' ? "\u{1F614}" : "\u{1F389}" }}
					</div>
					<div class="text-sm font-semibold text-ink-gray-9">
						{{ lastResult === 'miss' ? __("Try again!") : __("+" + lastResult + " points!") }}
					</div>
				</div>
			</transition>
		</div>

		<!-- History -->
		<div v-if="history.length" class="flex items-center gap-2 justify-center flex-wrap">
			<span class="text-xs text-ink-gray-5">{{ __("History:") }}</span>
			<span
				v-for="(h, idx) in history.slice(-10)"
				:key="idx"
				class="text-xs px-2 py-0.5 rounded-full font-medium"
				:class="h === 'miss'
					? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
					: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'"
			>
				{{ h === 'miss' ? __("Miss") : "+" + h }}
			</span>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const wheelSize = 280
const textRadius = (wheelSize / 2) - 40
const rotation = ref(0)
const isSpinning = ref(false)
const showResult = ref(false)
const lastResult = ref(null)
const totalPoints = ref(0)
const spinsLeft = ref(5)
const history = ref([])

const segments = [
	{ points: 10, label: "", color: "#3B82F6" },
	{ points: "miss", label: "", color: "#EF4444" },
	{ points: 25, label: "", color: "#10B981" },
	{ points: 5, label: "", color: "#F59E0B" },
	{ points: 50, label: "\u{1F31F}", color: "#8B5CF6" },
	{ points: "miss", label: "", color: "#EF4444" },
	{ points: 15, label: "", color: "#06B6D4" },
	{ points: 30, label: "", color: "#EC4899" },
	{ points: "miss", label: "", color: "#EF4444" },
	{ points: 20, label: "", color: "#14B8A6" },
	{ points: 100, label: "\u{1F389}", color: "#F97316" },
	{ points: 5, label: "", color: "#6366F1" },
]

function getSegmentAngle(idx) {
	const segAngle = (2 * Math.PI) / segments.length
	return -Math.PI / 2 + segAngle * idx + segAngle / 2
}

function getSegmentPath(idx) {
	const cx = wheelSize / 2
	const cy = wheelSize / 2
	const r = wheelSize / 2 - 2
	const segAngle = (2 * Math.PI) / segments.length
	const startAngle = -Math.PI / 2 + segAngle * idx
	const endAngle = startAngle + segAngle
	const x1 = cx + r * Math.cos(startAngle)
	const y1 = cy + r * Math.sin(startAngle)
	const x2 = cx + r * Math.cos(endAngle)
	const y2 = cy + r * Math.sin(endAngle)
	const largeArc = segAngle > Math.PI ? 1 : 0
	return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function spin() {
	if (isSpinning.value || spinsLeft.value <= 0) return
	isSpinning.value = true
	showResult.value = false
	spinsLeft.value--

	const spinAmount = 1800 + Math.random() * 1440
	rotation.value += spinAmount

	setTimeout(() => {
		const normalizedDeg = (rotation.value % 360 + 360) % 360
		const segAngle = 360 / segments.length
		const pointerAngle = (360 - normalizedDeg + 90) % 360
		const segIndex = Math.floor(pointerAngle / segAngle) % segments.length
		const result = segments[segIndex].points

		lastResult.value = result
		showResult.value = true

		if (result !== "miss") {
			totalPoints.value += result
		}
		history.value.push(result)
		isSpinning.value = false
	}, 4200)
}
</script>
