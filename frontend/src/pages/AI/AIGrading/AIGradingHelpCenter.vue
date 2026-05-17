<template>
	<div class="min-h-screen bg-gray-50/50 p-6 sm:p-12">
		<!-- Header -->
		<div class="mx-auto max-w-4xl mb-12">
			<button
				class="mb-6 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
				@click="$router.back()"
			>
				← {{ __('Revert') }}
			</button>
			<h1 class="text-4xl font-black text-gray-900 tracking-tight mb-4">
				{{ __('AI Grading Help Center') }} 📖
			</h1>
			<p class="text-lg text-gray-600 leading-relaxed">
				{{ __('Detailed instructions on how to use the artificial intelligence (AI) intelligent scoring system.') }}
			</p>
		</div>

		<!-- Content Grid -->
		<div class="mx-auto max-w-4xl space-y-12">
			<!-- Section 1: Overview -->
			<section class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">🤖</span>
					{{ __('Introduction') }}
				</h2>
				<div class="prose prose-blue max-w-none text-gray-600 space-y-4">
					<p>{{ __('The AI Grading system uses today\'s most advanced large language models (LLMs) for image analysis, handwriting recognition, and grading based on the criteria you provide.') }}</p>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
						<div class="rounded-2xl bg-gray-50 p-4 border border-gray-100">
							<div class="font-bold text-gray-900 mb-1">✍️ {{ __('Grading Essay') }}</div>
							<p class="text-xs">{{ __('Rubric-based content, structure, grammar, and creativity analysis.') }}</p>
						</div>
						<div class="rounded-2xl bg-gray-50 p-4 border border-gray-100">
							<div class="font-bold text-gray-900 mb-1">🎯 {{ __('Multiple Choice Quotation (MCQ)') }}</div>
							<p class="text-xs">{{ __('Automatically identify circled boxes, true/false and calculate points with absolute accuracy.') }}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Section 2: Essay Grading Guide -->
			<section class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">📝</span>
					{{ __('Essay Grading Guide') }}
				</h2>
				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">1</div>
						<div>
							<div class="font-bold text-gray-900">{{ __('Create & Rubric Session') }}</div>
							<p class="text-sm text-gray-500 mt-1">{{ __('Upload a title file or use AI to automatically create scoring criteria (Rubric). The more detailed the rubric, the more accurate the AI.') }}</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">2</div>
						<div>
							<div class="font-bold text-gray-900">{{ __('Download student work') }}</div>
							<p class="text-sm text-gray-500 mt-1">{{ __('Take a photo of your work (handwritten or typed). Make sure it\'s well-lit and not blurry.') }}</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">3</div>
						<div>
							<div class="font-bold text-gray-900">{{ __('Approval marks') }}</div>
							<p class="text-sm text-gray-500 mt-1">{{ __('Press the Scoring button. The AI will give a score with detailed comments. You can edit your score again if needed before saving.') }}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Section 3: MCQ Grading Guide -->
			<section class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">✅</span>
					{{ __('Punctuation Instructions') }}
				</h2>
				<div class="space-y-8">
					<!-- Image Mode -->
					<div class="rounded-2xl border border-violet-100 bg-violet-50/30 p-6">
						<div class="font-bold text-violet-900 mb-2 flex items-center gap-2">
							📸 {{ __('Answer Photo Dot Mode') }}
						</div>
						<p class="text-sm text-violet-700 leading-relaxed">
							{{ __('You just need to upload a photo or a Word/PDF file with the answer. The AI will automatically read the list of answers from that file to serve as a basis for grading students.') }}
						</p>
					</div>

					<!-- Form Mode -->
					<div class="rounded-2xl border border-blue-100 bg-blue-50/30 p-6">
						<div class="font-bold text-blue-900 mb-2 flex items-center gap-2">
							📝 {{ __('Form Dot Mode') }}
						</div>
						<p class="text-sm text-blue-700 leading-relaxed">
							{{ __('Nếu bạn không có file đáp án sẵn, hãy nhập thủ công đáp án cho từng câu (A, B, C...). Bạn nên tải lên thêm một "Ảnh mẫu tờ bài làm" để AI nhận diện vị trí các ô khoanh tốt hơn.') }}
						</p>
					</div>
				</div>
			</section>

			<!-- Section 4: Tips for Success -->
			<section class="rounded-3xl border border-rose-100 bg-rose-50 p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-rose-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl">💡</span>
					{{ __('Tips TO get the best grading') }}
				</h2>
				<ul class="space-y-4 text-rose-800 text-sm font-medium">
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('Take a picture of the front, not the side.') }}
					</li>
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('Light enough, avoid the shadow of the phone on the paper.') }}
					</li>
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('The handwriting should be clear, avoiding too much overlapping erasure.') }}
					</li>
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('For the quiz, circle it in bold or clearly mark it with an X in the answer box.') }}
					</li>
				</ul>
			</section>

			<!-- Footer Support -->
			<div class="text-center pb-12">
				<p class="text-gray-400 text-sm">{{ __('Still struggling?') }}</p>
				<button class="mt-2 font-bold text-blue-600 hover:underline">{{ __('Contact Technical Support') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
	window.scrollTo(0, 0)
})
</script>

<style scoped>
.prose p {
	line-height: 1.8;
}
</style>
