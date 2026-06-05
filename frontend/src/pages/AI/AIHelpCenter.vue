<template>
	<div class="min-h-screen bg-gray-50/50 p-6 sm:p-12">
		<!-- Header -->
		<div class="mx-auto max-w-6xl mb-12">
			<button
				class="mb-6 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
				@click="$router.back()"
			>
				← Quay lại
			</button>
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-4xl font-black text-gray-900 tracking-tight mb-4">
						Cẩm nang sử dụng Trí Tuệ Nhân Tạo 📖
					</h1>
					<p class="text-lg text-gray-600 leading-relaxed max-w-2xl">
						Hướng dẫn toàn tập về Luồng thao tác (Workflow), cơ chế cốt lõi (Core) và cách thiết kế Prompt để tối ưu hóa sức mạnh của các trợ lý AI Tomosa trong giảng dạy.
					</p>
				</div>
			</div>
		</div>

		<!-- Content Grid -->
		<div class="mx-auto max-w-6xl flex flex-col md:flex-row gap-8">
			<!-- Sidebar Navigation -->
			<div class="w-full md:w-1/4 flex-shrink-0">
				<div class="sticky top-24 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-1">
					<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">Danh mục AI</div>
					<button
						v-for="(svc, idx) in services"
						:key="idx"
						@click="scrollTo(svc.id)"
						class="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3"
						:class="activeSection === svc.id ? svc.activeClass : 'text-gray-600 hover:bg-gray-50'"
					>
						<span class="text-lg">{{ svc.icon }}</span>
						<span class="font-semibold text-sm">{{ svc.title }}</span>
					</button>
				</div>
			</div>

			<!-- Main Content -->
			<div class="w-full md:w-3/4 space-y-12 pb-24">
				
				<!-- AI Grading (Essay) -->
				<section id="ai-grading-essay" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">✍️</span>
						1. Chấm Điểm Tự Luận (AI Grading)
					</h2>
					<div class="prose prose-violet max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-violet-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-violet-900 mb-4 flex items-center gap-2">
								<span class="bg-violet-100 text-violet-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Tạo Session (AIGradingEssayHome):</strong> Chọn <em>"Chấm điểm mới"</em> để mở phiên làm việc.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Cấu hình (AIGradingEssayConfig):</strong> Chọn định dạng bài nộp (Ảnh/PDF/Text). Chọn Rubric đã tạo sẵn. Viết thêm Hướng dẫn phụ (Prompt) cho AI.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Thực thi & Duyệt (AIGradingEssayWorkspace):</strong> Tải file của học sinh lên ➔ Bấm "Bắt đầu chấm". Đợi AI sinh ra điểm thành phần theo Rubric ➔ Sửa điểm tay (nếu cần) ➔ Bấm <strong>Approve</strong> để chốt điểm và tự động gửi email cho học sinh.</p>
								</div>
							</div>
						</div>

						<div class="bg-violet-50 p-4 rounded-xl border border-violet-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> AI hoạt động hoàn toàn dựa trên <strong>Rubric (Tiêu chí chấm điểm)</strong>. Nó phân tích bài viết thành các Embeddings, đối chiếu chéo với từng tiêu chí của Rubric, sau đó gọi LLM để đánh giá mức độ đạt được (Level) và kết xuất nhận xét JSON.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Cách viết Prompt (Chỉ dẫn hệ thống) tối ưu:</h3>
						<p>Tại ô <em>"Hướng dẫn bổ sung cho AI"</em> khi cấu hình bài chấm, đừng chỉ ghi "Chấm điểm bài này". Hãy áp dụng công thức <strong>[Vai trò] + [Ngữ cảnh] + [Quy tắc trừ điểm]</strong>.</p>
						
						<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs text-gray-800 relative">
							<span class="absolute top-2 right-3 text-gray-400 text-[10px]">Ví dụ Prompt tốt</span>
							"Bạn là một Giám khảo chấm thi môn Ngữ Văn IELTS khắt khe. Hãy phân tích bài viết của học sinh, chú trọng vào (1) Tính logic của lập luận và (2) Từ vựng học thuật. <br><br>Quy tắc: Tuyệt đối trừ 0.25 điểm cho mỗi lỗi sai chính tả. Nếu học sinh viết lạc đề, không cho quá 4.0 điểm."
						</div>
					</div>
				</section>

				<!-- AI Grading (MCQ) -->
				<section id="ai-grading-mcq" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">🎯</span>
						2. Chấm Điểm Trắc Nghiệm (MCQ)
					</h2>
					<div class="prose prose-blue max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-blue-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-blue-900 mb-4 flex items-center gap-2">
								<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Tạo Phiên (ObjectiveGrading):</strong> Khởi tạo phiên chấm MCQ. Nhập <strong>Answer Key (Đáp án chuẩn)</strong> cho từng câu hỏi.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Upload:</strong> Tải lên File ZIP chứa toàn bộ ảnh phiếu trả lời trắc nghiệm của lớp.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Kiểm duyệt (MCQGradingWorkspace):</strong> AI tự động bóc tách SBD, Mã đề và đáp án. <br>- Những bài nét/đúng ➔ tự động <strong>Approved</strong>. <br>- Những bài bị rách, nhòe, học sinh bôi xóa ➔ Hệ thống gán nhãn <strong>Flagged (Cắm cờ)</strong> để giáo viên click vào giao diện, tự tay chọn lại đáp án đúng.</p>
								</div>
							</div>
						</div>

						<div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Hệ thống kết hợp <strong>Computer Vision (Thị giác máy tính OpenCV)</strong> để dò tìm 4 điểm neo (Anchor points) trên tờ giấy, làm phẳng ảnh (Perspective Transform), quét tọa độ ô tròn và trích xuất độ đậm/nhạt để nhận diện đáp án. Hỗ trợ đầy đủ format <em>Đúng/Sai tính điểm lũy tiến (Chuẩn Bộ GDĐT 2025)</em>.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Mẹo thao tác để đạt tỷ lệ nhận dạng 100%:</h3>
						<ul class="list-disc pl-5 space-y-2">
							<li><strong>Ánh sáng & Góc chụp:</strong> Chụp thẳng góc từ trên xuống, chụp trong môi trường đủ sáng, không để bóng đổ che khuất vùng neo (Anchor).</li>
							<li><strong>Mã đề & SBD:</strong> Đảm bảo học sinh tô kín vùng Mã đề và SBD. Bút chì 2B là lý tưởng nhất.</li>
						</ul>
					</div>
				</section>

				<!-- AI Quiz Generator -->
				<section id="ai-quiz" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">💡</span>
						3. Tạo Câu Hỏi Tự Động (Quiz Generator)
					</h2>
					<div class="prose prose-emerald max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-emerald-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-emerald-900 mb-4 flex items-center gap-2">
								<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Tạo Mới (QuizDashboard):</strong> Click <em>Tạo Quiz AI</em>.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Cấu hình (QuizForm):</strong> Tải file tài liệu PDF/Word lên. Cài đặt số lượng câu hỏi, loại câu hỏi (MCQ/T-F) và <strong>Mức độ nhận thức Bloom</strong> (Nhớ, Hiểu, Vận dụng, Phân tích).</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Chỉnh sửa & Lưu:</strong> AI sinh ra danh sách câu hỏi. Giáo viên xem trước, chỉnh sửa trực tiếp trên giao diện rồi Lưu thẳng vào hệ thống LMS làm bài tập.</p>
								</div>
							</div>
						</div>

						<div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Công nghệ Document Parsing bóc tách nội dung Text từ PDF/Word, đẩy vào hệ thống LLM kết hợp với Prompt định hình cấu trúc (JSON Schema). LLM sẽ tái tạo nội dung thành các câu hỏi trắc nghiệm bám sát thang tư duy Bloom.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Cách viết Prompt tối ưu:</h3>
						<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs text-gray-800 relative">
							<span class="absolute top-2 right-3 text-gray-400 text-[10px]">Ví dụ Prompt tốt</span>
							"Từ tài liệu đính kèm, hãy chỉ tập trung vào Chương 2 và Chương 3. Hãy tạo 15 câu trắc nghiệm dạng 'Áp dụng' (Apply). <br><br>Yêu cầu: Các đáp án sai (distractors) phải là những lỗi tư duy phổ biến mà học sinh thường hay mắc phải, không được làm đáp án sai quá lộ liễu."
						</div>
					</div>
				</section>

				<!-- AI Exam Creator -->
				<section id="ai-exam" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl">📋</span>
						4. Trợ Lý Thiết Kế Đề Thi (Exam Creator)
					</h2>
					<div class="prose prose-orange max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-orange-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-orange-900 mb-4 flex items-center gap-2">
								<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Setup (ExamForm):</strong> Nhập thông tin (Môn học, Lớp, Thời lượng, Tổng số điểm).</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Tạo Ma trận (Blueprint):</strong> Click <em>"Generate Blueprint"</em>. Hệ thống sẽ sinh ra một bảng ma trận đề thi phân bổ % chủ đề và độ khó.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Sinh Đề & Duyệt (ExamDetail):</strong> Sau khi Approve ma trận, bấm Generate để AI sinh chi tiết từng câu hỏi dựa trên ma trận đó. Giáo viên có thể chỉnh tay nội dung từng câu.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">4</div>
									<p class="m-0 leading-tight"><strong>In ấn (ExamExportPreview):</strong> Thêm Tiêu đề trường học, Header, Footer và xuất thẳng ra file PDF hoặc DOCX hoàn chỉnh, kèm trang Đáp án riêng.</p>
								</div>
							</div>
						</div>

						<div class="bg-orange-50 p-4 rounded-xl border border-orange-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Quá trình sinh đề phức tạp được chia làm cơ chế <strong>Two-shot generation (Sinh 2 bước)</strong>. AI buộc phải bị giới hạn tư duy bởi khung Blueprint trước (bước 1), nhờ đó đảm bảo đề thi (bước 2) khi sinh ra không bị lệch trọng tâm kiến thức và giữ vững tỷ lệ điểm Nhận biết - Vận dụng cao.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Cách viết Prompt tạo Ma trận tối ưu:</h3>
						<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs text-gray-800 relative">
							<span class="absolute top-2 right-3 text-gray-400 text-[10px]">Ví dụ Prompt tốt</span>
							"Tạo ma trận đề kiểm tra Giữa kì môn Vật Lý 10 (Chương trình mới). <br>
- Phân bổ độ khó: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao. <br>
- Bao phủ các chủ đề: Động học (15 câu), Động lực học (25 câu)."
						</div>
					</div>
				</section>

				<!-- Socratic AI Tutor -->
				<section id="socratic-tutor" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-xl">🤖</span>
						5. Gia Sư Socratic (Dành cho Học Sinh)
					</h2>
					<div class="prose prose-pink max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-pink-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-pink-900 mb-4 flex items-center gap-2">
								<span class="bg-pink-100 text-pink-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Tạo Phiên (Socratic_tutor):</strong> Học sinh truy cập và tạo 1 phiên học mới (Nhập chủ đề cần học).</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Trò chuyện (SocraticTutorWorkspace):</strong> Học sinh gửi tin nhắn hoặc upload ảnh đề bài (có hỗ trợ Vision). AI sẽ phản hồi bằng các câu hỏi gợi mở, hướng dẫn học sinh từng bước thay vì in đáp án.</p>
								</div>
							</div>
						</div>

						<div class="bg-pink-50 p-4 rounded-xl border border-pink-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Áp dụng <em>Phương pháp sư phạm Socratic (Socratic Method)</em>. System Prompt của AI được thiết kế cực kỳ nghiêm ngặt: <strong>"Tuyệt đối không bao giờ đưa ra lời giải trực tiếp"</strong>. AI sẽ phân tích lỗi sai trong tư duy của học sinh và đặt câu hỏi ngược lại để đánh thức khả năng tự học.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Hướng dẫn học sinh cách hỏi AI:</h3>
						<ul class="list-disc pl-5 space-y-2">
							<li>❌ Không nên hỏi: <em>"Giải giúp em bài toán này: x^2 - 4 = 0"</em></li>
							<li>✅ Nên hỏi (Cho AI bối cảnh): <em>"Em đang tắc ở bài toán x^2 - 4 = 0. Em biết phải chuyển vế nhưng không biết làm gì tiếp theo, thầy gợi ý bước kế tiếp giúp em nhé."</em></li>
						</ul>
					</div>
				</section>

				<!-- Rubric Builder -->
				<section id="rubric-builder" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-xl">📊</span>
						6. Xây Dựng Tiêu Chí (Rubric Builder)
					</h2>
					<div class="prose prose-cyan max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-cyan-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-cyan-900 mb-4 flex items-center gap-2">
								<span class="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Nhập liệu (RubricBuilder):</strong> Nhập Mô tả bài thi (Assignment Prompt) và Điểm tối đa.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Xử lý:</strong> AI sẽ tự động tính toán, phân rã điểm số và sinh ra bảng Rubric hoàn chỉnh (Cột tiêu chí, Cột mô tả cấp độ năng lực từ Xuất sắc đến Yếu kém).</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Tinh chỉnh:</strong> Giáo viên có thể bấm "Chỉnh sửa" để điều chỉnh lại text hoặc điểm của từng khung năng lực. Sau đó Lưu để mang đi chấm điểm tự luận.</p>
								</div>
							</div>
						</div>

						<div class="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Hệ thống sử dụng <strong>LangGraph (Luồng đồ thị)</strong> để đảm bảo xuất ra định dạng JSON hoàn hảo. Khi LLM tạo ra dữ liệu hỏng, Graph sẽ tự động bắt lỗi và bắt LLM sinh lại (Self-correction) tối đa 2 lần trước khi hiển thị ra giao diện.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Cách viết Prompt tạo Rubric tối ưu:</h3>
						<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs text-gray-800 relative">
							<span class="absolute top-2 right-3 text-gray-400 text-[10px]">Ví dụ Prompt tốt</span>
							"Đề bài: Viết bài luận phân tích tâm lý nhân vật Chí Phèo. <br><br>
Yêu cầu tạo Rubric: <br>
1. Thang điểm 10. <br>
2. Chia làm 4 tiêu chí: Cấu trúc bài (2đ), Luận điểm rõ ràng (4đ), Dẫn chứng văn bản (3đ), Lỗi chính tả (1đ)."
						</div>
					</div>
				</section>

				<!-- Lesson Planning -->
				<section id="lesson-plan" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-xl">📅</span>
						7. Soạn Giáo Án (Lesson Planning)
					</h2>
					<div class="prose prose-purple max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-purple-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-purple-900 mb-4 flex items-center gap-2">
								<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Nhập yêu cầu (LessonPlanning):</strong> Cung cấp Tên bài học, Khối lớp, Thời lượng (phút), Mục tiêu và Yêu cầu đặc biệt (Prompt).</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Trình diễn:</strong> Hệ thống sinh ra một bản Document hiển thị theo các phần Khởi động, Hoạt động chính, Củng cố.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Xuất bản:</strong> Bấm <em>Export Word</em> để tải file DOCX về máy.</p>
								</div>
							</div>
						</div>

						<div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Cấu trúc prompt đằng sau buộc AI phải chia nhỏ thời gian (Time-blocking). Ví dụ giáo án 45 phút sẽ ép AI phải tính toán sao cho Khởi động (5'), Hoạt động 1 (20'), Hoạt động 2 (15'), Củng cố (5') để tránh giáo án bị phi thực tế.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Cách viết Prompt thiết kế Giáo án:</h3>
						<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs text-gray-800 relative">
							"Soạn giáo án 45 phút bài 'Các loại lực cơ học'. Đối tượng là học sinh mất gốc lý. <br>
Yêu cầu: Phần khởi động (Warm-up) hãy gợi ý một trò chơi vật lý vui nhộn. Ở phần củng cố, thiết kế 3 câu hỏi nhanh dạng thảo luận cặp đôi (Pair-share)."
						</div>
					</div>
				</section>

				<!-- Smart Chatbot -->
				<section id="smart-chatbot" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-xl">💬</span>
						8. Chatbot Học Tập Bổ Trợ
					</h2>
					<div class="prose prose-yellow max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-yellow-200 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-yellow-900 mb-4 flex items-center gap-2">
								<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Truy cập (StudentAIHelper):</strong> Học sinh mở khung chat và nhập câu hỏi.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Truy xuất RAG:</strong> Bot sẽ ngầm quét qua Kho tài liệu nhà trường (RAG Documents). Nếu thấy kiến thức liên quan, nó sẽ ghép vào não bộ để trả lời. Nếu không, nó sẽ dùng kiến thức nền (World Knowledge).</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Render:</strong> Kết quả trả về được render dưới dạng Markdown đẹp mắt (bảng, danh sách gạch đầu dòng, tô đậm).</p>
								</div>
							</div>
						</div>

						<div class="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Tích hợp LLM phản hồi thời gian thực qua cơ chế Streaming. Được huấn luyện System Prompt ngầm để đưa ra các câu trả lời súc tích, thân thiện và tuân thủ các quy tắc an toàn (Không chửi bậy, không bàn chuyện chính trị).
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Mẹo Prompt cho Chatbot:</h3>
						<ul class="list-disc pl-5 space-y-2">
							<li><strong>Sử dụng phép so sánh:</strong> <em>"Hãy giải thích nguyên lý hoạt động của DNA như đang giải thích cho một học sinh lớp 5, lấy ví dụ về cuốn sổ tay nấu ăn."</em></li>
							<li><strong>Yêu cầu định dạng:</strong> <em>"Hãy tóm tắt sự kiện Thế chiến 2 trong 5 gạch đầu dòng, tô đậm tên các quốc gia."</em></li>
						</ul>
					</div>
				</section>

				<!-- RAG Document -->
				<section id="rag-doc" class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-24">
					<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">📚</span>
						9. Trí Tuệ Tài Liệu (RAG Documents)
					</h2>
					<div class="prose prose-slate max-w-none text-gray-600 space-y-4 text-sm">
						
						<!-- WORKFLOW BOX -->
						<div class="bg-white border-2 border-dashed border-slate-300 p-5 rounded-2xl mb-6">
							<h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
								<span class="bg-slate-200 text-slate-800 px-2 py-1 rounded-md text-[10px] tracking-wider uppercase">Workflow</span>
								Luồng thao tác trên hệ thống
							</h4>
							<div class="flex flex-col gap-3">
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">1</div>
									<p class="m-0 leading-tight"><strong>Upload (Documents):</strong> Giáo viên tải lên các tài liệu PDF/Word vào kho dữ liệu khóa học.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">2</div>
									<p class="m-0 leading-tight"><strong>Vectorize (Chạy ngầm):</strong> Một Background Job sẽ băm nhỏ file (Chunking) và mã hóa nội dung thành các chuỗi số (Embeddings) lưu vào Vector Database.</p>
								</div>
								<div class="flex items-start gap-3">
									<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">3</div>
									<p class="m-0 leading-tight"><strong>Sẵn sàng:</strong> File chuyển trạng thái sang "Ready". Từ lúc này, mọi AI trong hệ thống (như Chatbot) đều có thể truy cập kho tri thức này.</p>
								</div>
							</div>
						</div>

						<div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
							<strong>⚙️ Core (Cơ chế lõi):</strong> Công nghệ RAG (Retrieval-Augmented Generation). Biến hàng nghìn trang tài liệu tĩnh (Sách, PDF, Slide) thành <strong>Cơ sở dữ liệu Vector</strong>. Kỹ thuật này ép AI chỉ được trả lời dựa trên tài liệu nhà trường cung cấp, dập tắt "ảo giác" (Hallucination) triệt để.
						</div>
						
						<h3 class="text-lg font-bold text-gray-900 mt-6">Mẹo tối ưu file tài liệu (Để AI đọc hiểu tốt nhất):</h3>
						<ul class="list-disc pl-5 space-y-2">
							<li><strong>Cấu trúc rõ ràng:</strong> File Word/PDF nên có phân cấp Tiêu đề Heading (H1, H2, H3). Chunking logic sẽ cắt văn bản dựa trên các thẻ này để giữ trọn vẹn ngữ cảnh.</li>
							<li><strong>Không để dạng ảnh thuần túy:</strong> Tránh up PDF chỉ chứa ảnh chụp (không quét bôi đen được text). Nên dùng file PDF xuất trực tiếp từ Word/PowerPoint.</li>
							<li><strong>Làm sạch dữ liệu:</strong> Xóa bớt các trang phụ lục rác hoặc các bảng biểu (Table) có thiết kế quá dị biệt trước khi upload.</li>
						</ul>
					</div>
				</section>

			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeSection = ref('ai-grading-essay')

const services = [
	{ id: 'ai-grading-essay', title: 'Chấm Tự Luận', icon: '✍️', activeClass: 'bg-violet-50 text-violet-700' },
	{ id: 'ai-grading-mcq', title: 'Chấm Trắc Nghiệm', icon: '🎯', activeClass: 'bg-blue-50 text-blue-700' },
	{ id: 'ai-quiz', title: 'Tạo Câu Hỏi (Quiz)', icon: '💡', activeClass: 'bg-emerald-50 text-emerald-700' },
	{ id: 'ai-exam', title: 'Trợ Lý Tạo Đề', icon: '📋', activeClass: 'bg-orange-50 text-orange-700' },
	{ id: 'socratic-tutor', title: 'Gia Sư Socratic', icon: '🤖', activeClass: 'bg-pink-50 text-pink-700' },
	{ id: 'rubric-builder', title: 'Xây Dựng Rubric', icon: '📊', activeClass: 'bg-cyan-50 text-cyan-700' },
	{ id: 'lesson-plan', title: 'Soạn Giáo Án', icon: '📅', activeClass: 'bg-purple-50 text-purple-700' },
	{ id: 'smart-chatbot', title: 'Chatbot Học Tập', icon: '💬', activeClass: 'bg-yellow-50 text-yellow-700' },
	{ id: 'rag-doc', title: 'Kho Tài Liệu RAG', icon: '📚', activeClass: 'bg-slate-100 text-slate-800' },
]

const scrollTo = (id) => {
	const el = document.getElementById(id)
	if (el) {
		el.scrollIntoView({ behavior: 'smooth' })
	}
}

// Intersection Observer for scroll spy
let observer
onMounted(() => {
	const options = { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
	observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				activeSection.value = entry.target.id
			}
		})
	}, options)
	
	services.forEach(svc => {
		const el = document.getElementById(svc.id)
		if (el) observer.observe(el)
	})
})

onUnmounted(() => {
	if (observer) observer.disconnect()
})
</script>
