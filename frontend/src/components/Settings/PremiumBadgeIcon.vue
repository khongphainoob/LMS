<template>
	<div class="relative flex items-center justify-center select-none" :style="containerStyle">
		<!-- Dynamic SVG Render based on resolved badge key -->
		<svg
			v-if="resolvedKey === 'champion'"
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#FFE082" />
					<stop offset="30%" stop-color="#FFC107" />
					<stop offset="70%" stop-color="#FF8F00" />
					<stop offset="100%" stop-color="#FF6F00" />
				</linearGradient>
				<linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#2D3748" />
					<stop offset="100%" stop-color="#1A202C" />
				</linearGradient>
				<linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#FFF5F5" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#FFC107" stop-opacity="0" />
				</linearGradient>
			</defs>

			<!-- Aura Glow -->
			<circle cx="100" cy="105" r="75" fill="url(#gold-grad)" opacity="0.15" class="animate-pulse-slow" />

			<!-- Outer Rotating Star Gear -->
			<g class="animate-spin-slow origin-center">
				<circle cx="100" cy="100" r="75" fill="none" stroke="url(#gold-grad)" stroke-width="1.5" stroke-dasharray="10 12" opacity="0.4" />
				<polygon points="100,17 103,27 113,27 105,33 108,43 100,37 92,43 95,33 87,27 97,27" fill="url(#gold-grad)" />
				<polygon points="100,183 103,173 113,173 105,167 108,157 100,163 92,157 95,167 87,173 97,173" fill="url(#gold-grad)" />
				<polygon points="17,100 27,97 27,87 33,95 43,92 37,100 43,108 33,105 27,113 27,103" fill="url(#gold-grad)" />
				<polygon points="183,100 173,97 173,87 167,95 157,92 163,100 157,108 167,105 173,113 173,103" fill="url(#gold-grad)" />
			</g>

			<!-- Main Gold Shield -->
			<path
				d="M100,30 L160,50 C160,110 135,150 100,175 C65,150 40,110 40,50 Z"
				fill="url(#shield-grad)"
				stroke="url(#gold-grad)"
				stroke-width="5"
				stroke-linejoin="round"
			/>

			<!-- Inner Gold Rim -->
			<path
				d="M100,40 L148,56 C148,104 127,137 100,158 C73,137 52,104 52,56 Z"
				fill="none"
				stroke="url(#gold-grad)"
				stroke-width="1.5"
				opacity="0.6"
			/>

			<!-- Crown and Trophy Center -->
			<g class="animate-float origin-center">
				<!-- Gold Crown -->
				<path d="M80,95 L88,75 L100,85 L112,75 L120,95 Z" fill="url(#gold-grad)" />
				<circle cx="88" cy="73" r="3" fill="#FFF" />
				<circle cx="100" cy="83" r="3" fill="#FFF" />
				<circle cx="112" cy="73" r="3" fill="#FFF" />

				<!-- Trophy Cup -->
				<path d="M85,100 H115 V115 C115,125 108,132 100,132 C92,132 85,125 85,115 Z" fill="url(#gold-grad)" />
				<path d="M100,132 V142 H90 V148 H110 V142 H100 Z" fill="url(#gold-grad)" />
				<path d="M83,104 C77,104 77,114 83,114 Z" fill="none" stroke="url(#gold-grad)" stroke-width="3" />
				<path d="M117,104 C123,104 123,114 117,114 Z" fill="none" stroke="url(#gold-grad)" stroke-width="3" />
			</g>

			<!-- Sparkling Stars overlay -->
			<polygon points="135,70 137,74 142,74 138,77 139,82 135,79 131,82 132,77 128,74 133,74" fill="#FFF" opacity="0.9" class="animate-pulse" />
			<polygon points="65,120 67,124 72,124 68,127 69,132 65,129 61,132 62,127 58,124 63,124" fill="#FFF" opacity="0.9" class="animate-pulse" />
		</svg>

		<svg
			v-else-if="resolvedKey === 'podium'"
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#E2E8F0" />
					<stop offset="50%" stop-color="#CBD5E1" />
					<stop offset="100%" stop-color="#94A3B8" />
				</linearGradient>
				<linearGradient id="podium-bg" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#1E293B" />
					<stop offset="100%" stop-color="#0F172A" />
				</linearGradient>
			</defs>

			<!-- Aura Glow -->
			<circle cx="100" cy="105" r="75" fill="url(#silver-grad)" opacity="0.12" class="animate-pulse-slow" />

			<!-- Outer Circle -->
			<circle cx="100" cy="100" r="72" fill="none" stroke="url(#silver-grad)" stroke-width="4" stroke-dasharray="8 6" />

			<!-- Main Shield -->
			<path
				d="M100,32 L155,50 C155,105 132,142 100,165 C68,142 45,105 45,50 Z"
				fill="url(#podium-bg)"
				stroke="url(#silver-grad)"
				stroke-width="5"
				stroke-linejoin="round"
			/>

			<!-- Laurel Wreath behind cup -->
			<path d="M70,120 Q60,95 72,70 M130,120 Q140,95 128,70" fill="none" stroke="url(#silver-grad)" stroke-width="3" stroke-dasharray="4 4" opacity="0.7" />

			<!-- Silver Cup -->
			<g class="animate-float origin-center">
				<path d="M82,85 H118 V105 C118,118 110,125 100,125 C90,125 82,118 82,105 Z" fill="url(#silver-grad)" />
				<path d="M100,125 V138 H92 V144 H108 V138 H100 Z" fill="url(#silver-grad)" />
				<!-- Handles -->
				<path d="M80,90 C72,90 72,102 80,102" fill="none" stroke="url(#silver-grad)" stroke-width="3.5" />
				<path d="M120,90 C128,90 128,102 120,102" fill="none" stroke="url(#silver-grad)" stroke-width="3.5" />
				<!-- Bold Center '3' -->
				<text x="100" y="112" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#1E293B" text-anchor="middle">3</text>
			</g>
		</svg>

		<svg
			v-else-if="resolvedKey === 'top10'"
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#FB923C" />
					<stop offset="50%" stop-color="#D97706" />
					<stop offset="100%" stop-color="#78350F" />
				</linearGradient>
				<linearGradient id="dark-core" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#27272A" />
					<stop offset="100%" stop-color="#09090B" />
				</linearGradient>
			</defs>

			<!-- Rotating Outer Gear -->
			<circle cx="100" cy="100" r="75" fill="none" stroke="url(#bronze-grad)" stroke-width="2.5" stroke-dasharray="1 10" class="animate-spin-slow origin-center" />

			<!-- Bronze Ribbon Badge Shape -->
			<g transform="translate(100, 100) scale(1.05) translate(-100, -100)">
				<!-- Ribbon tails -->
				<path d="M75,120 L60,170 L85,155 L100,170 L115,155 L140,170 L125,120" fill="url(#bronze-grad)" opacity="0.85" />
				
				<!-- Outer Polygon Star -->
				<polygon
					points="100,32 120,45 143,38 147,62 168,68 158,90 168,112 147,118 143,142 120,135 100,148 80,135 57,142 53,118 32,112 42,90 32,68 53,62 57,38 80,45"
					fill="url(#bronze-grad)"
				/>
				
				<!-- Dark Center Core -->
				<circle cx="100" cy="90" r="43" fill="url(#dark-core)" stroke="url(#bronze-grad)" stroke-width="4.5" />
				
				<!-- Bold 10 Text -->
				<text x="100" y="99" font-family="'Outfit', sans-serif" font-size="28" font-weight="900" fill="url(#bronze-grad)" text-anchor="middle" class="animate-pulse">TOP 10</text>
			</g>
		</svg>

		<svg
			v-else-if="resolvedKey === 'streak7'"
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="fire-grad" x1="0%" y1="100%" x2="0%" y2="0%">
					<stop offset="0%" stop-color="#EA580C" />
					<stop offset="40%" stop-color="#F97316" />
					<stop offset="85%" stop-color="#FBBF24" />
					<stop offset="100%" stop-color="#FEF08A" />
				</linearGradient>
				<filter id="flame-glow">
					<feGaussianBlur stdDeviation="6" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
			</defs>

			<!-- Fire Glow Aura -->
			<path
				d="M100,25 Q135,70 135,110 A35,35 0 0,1 65,110 Q65,70 100,25 Z"
				fill="url(#fire-grad)"
				opacity="0.3"
				filter="url(#flame-glow)"
				class="animate-pulse-slow origin-center scale-110"
			/>

			<!-- Layered Animated Fire Base -->
			<!-- Outer Flame -->
			<path
				d="M100,20 Q145,65 145,115 A45,45 0 0,1 55,115 Q55,65 100,20 Z"
				fill="url(#fire-grad)"
				class="animate-pulse-slow origin-center"
			/>

			<!-- Middle Flame Layer -->
			<path
				d="M100,42 Q130,80 130,118 A30,30 0 0,1 70,118 Q70,80 100,42 Z"
				fill="#EA580C"
				opacity="0.85"
				class="animate-pulse origin-center scale-95"
			/>

			<!-- Inner Hot Core -->
			<path
				d="M100,60 Q120,90 120,120 A20,20 0 0,1 80,120 Q80,90 100,60 Z"
				fill="#FDE047"
				class="animate-pulse-slow origin-center scale-90"
			/>

			<!-- Giant Number 7 inside core -->
			<text
				x="102"
				y="125"
				font-family="'Inter', sans-serif"
				font-size="34"
				font-weight="900"
				fill="#7C2D12"
				text-anchor="middle"
				class="animate-float"
			>7</text>

			<!-- Fire Sparks -->
			<circle cx="65" cy="60" r="3" fill="#FDE047" class="animate-float" opacity="0.8" />
			<circle cx="130" cy="50" r="4.5" fill="#F97316" class="animate-pulse-slow" opacity="0.9" />
			<circle cx="100" cy="10" r="2.5" fill="#FEF08A" class="animate-float" />
		</svg>

		<svg
			v-else-if="resolvedKey === 'unstoppable'"
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="cosmic-grad" x1="0%" y1="100%" x2="100%" y2="0%">
					<stop offset="0%" stop-color="#4F46E5" />
					<stop offset="35%" stop-color="#06B6D4" />
					<stop offset="70%" stop-color="#3B82F6" />
					<stop offset="100%" stop-color="#EC4899" />
				</linearGradient>
				<filter id="cosmic-glow">
					<feGaussianBlur stdDeviation="8" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
			</defs>

			<!-- Cosmic Plasma Aura -->
			<path
				d="M100,15 Q145,60 145,115 A45,45 0 0,1 55,115 Q55,60 100,15 Z"
				fill="url(#cosmic-grad)"
				opacity="0.35"
				filter="url(#cosmic-glow)"
				class="animate-pulse-slow origin-center scale-110"
			/>

			<!-- Neon Plasma Fire Outer -->
			<path
				d="M100,12 Q150,60 150,120 A50,50 0 0,1 50,120 Q50,60 100,12 Z"
				fill="url(#cosmic-grad)"
				class="animate-pulse-slow origin-center"
			/>

			<!-- Deep Purple Plasma Core -->
			<path
				d="M100,38 Q128,75 128,118 A28,28 0 0,1 72,118 Q72,75 100,38 Z"
				fill="#312E81"
				opacity="0.9"
				class="animate-pulse origin-center"
			/>

			<!-- Neon Light Core -->
			<path
				d="M100,58 Q118,88 118,120 A18,18 0 0,1 82,120 Q82,88 100,58 Z"
				fill="#67E8F9"
				class="animate-pulse-slow origin-center"
			/>

			<!-- Giant Number 30 inside -->
			<text
				x="100"
				y="126"
				font-family="'Outfit', sans-serif"
				font-size="30"
				font-weight="900"
				fill="#0F172A"
				text-anchor="middle"
				class="animate-float"
			>30</text>

			<!-- Sparkles -->
			<polygon points="135,45 137,49 142,49 138,52 139,57 135,54 131,57 132,52 128,49 133,49" fill="#FFF" class="animate-pulse" />
			<polygon points="60,75 62,79 67,79 63,82 64,87 60,84 56,87 57,82 53,79 58,79" fill="#22D3EE" class="animate-pulse-slow" />
		</svg>

		<svg
			v-else-if="resolvedKey === 'scholar'"
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#C084FC" />
					<stop offset="50%" stop-color="#818CF8" />
					<stop offset="100%" stop-color="#4F46E5" />
				</linearGradient>
				<linearGradient id="book-grad" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#EEF2F6" />
					<stop offset="100%" stop-color="#94A3B8" />
				</linearGradient>
			</defs>

			<!-- Glowing Sapphire Ring -->
			<circle cx="100" cy="100" r="75" fill="none" stroke="url(#purple-grad)" stroke-width="4.5" opacity="0.8" />
			<circle cx="100" cy="100" r="69" fill="none" stroke="url(#purple-grad)" stroke-width="1" stroke-dasharray="4 6" opacity="0.5" class="animate-spin-slow origin-center" />

			<!-- Glowing background -->
			<circle cx="100" cy="100" r="65" fill="#4F46E5" opacity="0.08" class="animate-pulse-slow" />

			<!-- Graduation Cap and Book Group -->
			<g class="animate-float origin-center">
				<!-- Open Book -->
				<path d="M55,125 C75,115 95,123 100,128 C105,123 125,115 145,125 V102 C125,92 105,100 100,105 C95,100 75,92 55,102 Z" fill="url(#book-grad)" stroke="url(#purple-grad)" stroke-width="2" />
				<path d="M100,105 V128" stroke="url(#purple-grad)" stroke-width="2.5" />
				
				<!-- Graduation Mortarboard Hat -->
				<!-- Cap base -->
				<path d="M78,82 V92 C78,96 88,99 100,99 C112,99 122,96 122,92 V82" fill="#1E293B" stroke="url(#purple-grad)" stroke-width="2" />
				<!-- Diamond Top -->
				<polygon points="100,50 148,66 100,82 52,66" fill="#1E293B" stroke="url(#purple-grad)" stroke-width="3" />
				<!-- Tassel hanging -->
				<path d="M100,66 L135,76 V93" fill="none" stroke="url(#purple-grad)" stroke-width="2" stroke-linecap="round" />
				<circle cx="135" cy="94" r="3.5" fill="url(#purple-grad)" />
			</g>

			<!-- Sparkling Stars of knowledge -->
			<polygon points="148,45 150,48 154,48 151,51 152,55 148,52 144,55 145,51 142,48 146,48" fill="#FFF" class="animate-pulse" />
			<polygon points="52,142 54,145 58,145 55,148 56,152 52,149 48,152 49,148 46,145 50,145" fill="#FFF" class="animate-pulse-slow" />
		</svg>

		<svg
			v-else
			viewBox="0 0 200 200"
			class="w-full h-full filter drop-shadow-lg"
		>
			<defs>
				<linearGradient id="sprout-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#A7F3D0" />
					<stop offset="50%" stop-color="#10B981" />
					<stop offset="100%" stop-color="#047857" />
				</linearGradient>
				<linearGradient id="earth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#D97706" />
					<stop offset="100%" stop-color="#78350F" />
				</linearGradient>
			</defs>

			<!-- Glowing circle -->
			<circle cx="100" cy="100" r="75" fill="none" stroke="url(#sprout-grad)" stroke-width="4.5" opacity="0.8" />
			<circle cx="100" cy="100" r="69" fill="none" stroke="url(#sprout-grad)" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.4" class="animate-spin-slow origin-center" stroke-linecap="round" />

			<g class="animate-float origin-center">
				<!-- Mounded Ground -->
				<path d="M55,140 C75,130 125,130 145,140 C135,152 65,152 55,140 Z" fill="url(#earth-grad)" stroke="url(#sprout-grad)" stroke-width="1.5" />

				<!-- Sprout Stem -->
				<path d="M100,140 C100,110 90,85 105,70" fill="none" stroke="url(#sprout-grad)" stroke-width="5" stroke-linecap="round" />
				
				<!-- Leaf Left -->
				<path d="M96,96 C78,92 72,78 94,84 C96,89 96,93 96,96 Z" fill="url(#sprout-grad)" stroke="#FFF" stroke-width="1" class="animate-pulse" />

				<!-- Leaf Right -->
				<path d="M103,82 C120,72 124,58 107,72 C103,76 103,80 103,82 Z" fill="url(#sprout-grad)" stroke="#FFF" stroke-width="1" class="animate-pulse-slow" />
			</g>
		</svg>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
	badgeName: {
		type: String,
		required: true,
	},
	size: {
		type: [Number, String],
		default: 80,
	},
})

// Resolve the dynamic badge rendering key based on title (vietnamese or english)
const resolvedKey = computed(() => {
	if (!props.badgeName) return 'first_step'
	const title = props.badgeName.toLowerCase().trim()

	if (title.includes('champion') || title.includes('vô địch')) {
		return 'champion'
	}
	if (title.includes('podium') || title.includes('top 3')) {
		return 'podium'
	}
	if (title.includes('top 10')) {
		return 'top10'
	}
	if (title.includes('7-day') || title.includes('chuỗi 7')) {
		return 'streak7'
	}
	if (title.includes('unstoppable') || title.includes('không thể cản') || title.includes('chuỗi 30')) {
		return 'unstoppable'
	}
	if (title.includes('scholar') || title.includes('học giả')) {
		return 'scholar'
	}
	return 'first_step'
})

const containerStyle = computed(() => {
	const val = typeof props.size === 'number' ? `${props.size}px` : props.size
	return {
		width: val,
		height: val,
	}
})
</script>

<style scoped>
/* Keyframes for micro-animations */
@keyframes spin-slow {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes pulse-slow {
	0%, 100% {
		transform: scale(1);
		opacity: 0.85;
	}
	50% {
		transform: scale(1.04);
		opacity: 1;
	}
}

@keyframes float-slow {
	0%, 100% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-4px);
	}
}

/* Responsive CSS classes trigger animations */
.animate-spin-slow {
	animation: spin-slow 18s linear infinite;
}

.animate-pulse-slow {
	animation: pulse-slow 3.5s ease-in-out infinite;
}

.animate-float {
	animation: float-slow 4s ease-in-out infinite;
}
</style>
