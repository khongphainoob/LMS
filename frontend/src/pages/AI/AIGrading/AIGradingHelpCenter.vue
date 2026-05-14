<template>
	<div class="min-h-screen bg-gray-50/50 p-6 sm:p-12">
		<!-- Header -->
		<div class="mx-auto max-w-4xl mb-12">
			<button
				class="mb-6 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
				@click="$router.back()"
			>
				← {{ __('Quay lại') }}
			</button>
			<h1 class="text-4xl font-black text-gray-900 tracking-tight mb-4">
				{{ __('AI Grading Help Center') }} 📖
			</h1>
			<p class="text-lg text-gray-600 leading-relaxed">
				{{ __('Hướng dẫn chi tiết cách sử dụng hệ thống chấm điểm thông minh bằng trí tuệ nhân tạo (AI).') }}
			</p>
		</div>

		<!-- Content Grid -->
		<div class="mx-auto max-w-4xl space-y-12">
			<!-- Section 1: Overview -->
			<section class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">🤖</span>
					{{ __('Giới thiệu chung') }}
				</h2>
				<div class="prose prose-blue max-w-none text-gray-600 space-y-4">
					<p>{{ __('Hệ thống AI Grading sử dụng các mô hình ngôn ngữ lớn (LLM) tiên tiến nhất hiện nay để phân tích hình ảnh, nhận diện chữ viết và chấm điểm dựa trên tiêu chí bạn cung cấp.') }}</p>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
						<div class="rounded-2xl bg-gray-50 p-4 border border-gray-100">
							<div class="font-bold text-gray-900 mb-1">✍️ {{ __('Chấm Tự luận (Essay)') }}</div>
							<p class="text-xs">{{ __('Phân tích nội dung, cấu trúc, ngữ pháp và tính sáng tạo dựa trên Rubric.') }}</p>
						</div>
						<div class="rounded-2xl bg-gray-50 p-4 border border-gray-100">
							<div class="font-bold text-gray-900 mb-1">🎯 {{ __('Chấm Trắc nghiệm (MCQ)') }}</div>
							<p class="text-xs">{{ __('Tự động nhận diện các ô khoanh, đúng/sai và tính điểm chính xác tuyệt đối.') }}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Section 2: Essay Grading Guide -->
			<section class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">📝</span>
					{{ __('Hướng dẫn Chấm Tự luận') }}
				</h2>
				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">1</div>
						<div>
							<div class="font-bold text-gray-900">{{ __('Tạo Phiên & Rubric') }}</div>
							<p class="text-sm text-gray-500 mt-1">{{ __('Tải lên file đề bài hoặc sử dụng AI để tự động tạo tiêu chí chấm điểm (Rubric). Rubric càng chi tiết, AI chấm càng chính xác.') }}</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">2</div>
						<div>
							<div class="font-bold text-gray-900">{{ __('Tải bài làm của học sinh') }}</div>
							<p class="text-sm text-gray-500 mt-1">{{ __('Chụp ảnh bài làm (viết tay hoặc đánh máy). Đảm bảo ảnh đủ sáng và không bị mờ.') }}</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">3</div>
						<div>
							<div class="font-bold text-gray-900">{{ __('Chấm điểm & Phê duyệt') }}</div>
							<p class="text-sm text-gray-500 mt-1">{{ __('Nhấn nút Chấm điểm. AI sẽ đưa ra điểm số kèm nhận xét chi tiết. Bạn có thể chỉnh sửa lại điểm nếu cần trước khi lưu.') }}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Section 3: MCQ Grading Guide -->
			<section class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">✅</span>
					{{ __('Hướng dẫn Chấm Trắc nghiệm') }}
				</h2>
				<div class="space-y-8">
					<!-- Image Mode -->
					<div class="rounded-2xl border border-violet-100 bg-violet-50/30 p-6">
						<div class="font-bold text-violet-900 mb-2 flex items-center gap-2">
							📸 {{ __('Chế độ Chấm theo Ảnh đáp án') }}
						</div>
						<p class="text-sm text-violet-700 leading-relaxed">
							{{ __('Bạn chỉ cần tải lên ảnh chụp hoặc file Word/PDF chứa đáp án. AI sẽ tự động đọc danh sách đáp án từ file đó để làm căn cứ chấm bài cho học sinh.') }}
						</p>
					</div>

					<!-- Form Mode -->
					<div class="rounded-2xl border border-blue-100 bg-blue-50/30 p-6">
						<div class="font-bold text-blue-900 mb-2 flex items-center gap-2">
							📝 {{ __('Chế độ Chấm theo Form') }}
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
					{{ __('Mẹo để AI chấm chuẩn nhất') }}
				</h2>
				<ul class="space-y-4 text-rose-800 text-sm font-medium">
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('Chụp ảnh chính diện, không chụp nghiêng.') }}
					</li>
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('Ánh sáng đủ, tránh đổ bóng của điện thoại lên tờ giấy.') }}
					</li>
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('Chữ viết tay nên rõ ràng, tránh tẩy xóa chồng chéo quá nhiều.') }}
					</li>
					<li class="flex items-center gap-3">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
						{{ __('Đối với trắc nghiệm, hãy khoanh tròn đậm hoặc đánh dấu X rõ ràng vào ô đáp án.') }}
					</li>
				</ul>
			</section>

			<!-- Footer Support -->
			<div class="text-center pb-12">
				<p class="text-gray-400 text-sm">{{ __('Bạn vẫn gặp khó khăn?') }}</p>
				<button class="mt-2 font-bold text-blue-600 hover:underline">{{ __('Liên hệ Hỗ trợ Kỹ thuật') }}</button>
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
