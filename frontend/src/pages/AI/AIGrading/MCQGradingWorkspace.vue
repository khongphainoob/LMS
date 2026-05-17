<template>
	<section class="absolute inset-0 flex flex-col overflow-hidden sm:rounded-xl border border-gray-100 bg-white shadow-sm">
		<!-- Top bar -->
		<div class="flex h-12 flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4">
			<button
				class="group flex items-center gap-1.5 text-[11px] font-medium text-gray-500 transition-all hover:text-gray-900"
				@click="$router.push({ name: 'AIGradingObjective' })"
			>
				<icons.ChevronLeft class="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
				{{ __('Revert') }}
			</button>
			<div class="h-5 w-px bg-gray-200" />
			<div>
				<div class="text-sm font-semibold text-gray-800">
					{{ sessionLoading ? __('Loading...') : (sessionDoc?.session_name || __('Session Not Found')) }}
				</div>
			</div>
			<div class="flex-1" />
			
      <!-- Global Actions -->
			<div class="ml-2 flex items-center justify-end gap-2">
				<button
					class="flex items-center gap-1.5 rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40"
					@click="runBatchGrading"
          :disabled="isBatchGrading"
				>
          <RefreshCw v-if="isBatchGrading" class="h-3.5 w-3.5 animate-spin" />
					<span v-else>🚀</span>
					<span class="hidden sm:inline">{{ isBatchGrading ? __('Grading...') : __('Run Batch') }}</span>
				</button>
			</div>
		</div>

		<!-- Body: 3-column layout -->
		<div class="flex flex-1 overflow-hidden">
			<!-- LEFT: Submission list -->
			<div class="flex w-72 flex-shrink-0 flex-col border-r border-gray-100 bg-white transition-all shadow-sm">
				<div class="p-4 border-b border-gray-100">
          <div class="mb-3 flex items-center justify-between">
						<span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ __('Students') }}</span>
					</div>
					<div class="relative">
            <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
              :placeholder="__('Search...')"
            />
          </div>
				</div>
				<div class="flex-1 overflow-y-auto p-3 space-y-2">
					<div
						v-for="(sub, idx) in filteredSubmissions"
						:key="sub.id"
						class="group flex cursor-pointer flex-col rounded-xl border p-2.5 transition-all duration-200"
						:class="[
							currentIdx === idx
								? 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100 shadow-sm'
								: 'border-transparent bg-white hover:bg-gray-50',
						]"
						@click="currentIdx = idx"
					>
						<div class="flex items-center justify-between gap-2 mb-1">
							<div class="text-[13px] font-bold text-gray-900 truncate group-hover:text-blue-600">{{ sub.student_name }}</div>
							<div v-if="sub.score != null" class="text-sm font-black font-mono text-blue-600">
								{{ sub.score }}
							</div>
						</div>
						
            <!-- Action Row -->
            <div class="flex items-center justify-between mt-auto pt-1">
							<div class="flex items-center gap-3">
								<div v-if="sub.status === 'grading'" class="flex items-center gap-1">
									<button @click.stop="stopGrading(sub)" class="p-1 hover:bg-rose-100 rounded text-rose-600" :title="__('Stop marking')">
										<Square class="w-4 h-4 fill-current" />
									</button>
									<Loader2 class="w-4 h-4 animate-spin text-amber-600" />
								</div>
								<button 
									v-else
									class="flex items-center gap-1 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
									@click.stop="handleGradeSubmission(sub)"
									:title="__('Grade')"
								>
									<Play class="h-4 w-4" />
								</button>
								<button 
									class="flex items-center gap-1 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
									@click.stop="handleEditSubmission(sub)"
									:title="__('Edit')"
								>
									<Edit class="h-4 w-4" />
								</button>
								<button 
									class="flex items-center gap-1 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
									@click.stop="handleDeleteSubmission(sub)"
									:title="__('Delete')"
								>
									<Trash2 class="h-4 w-4" />
								</button>
							</div>
							<span
								class="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-tight"
								:class="statusBadgeClasses(sub.status)"
							>
								{{ statusLabel(sub.status) }}
							</span>
						</div>
					</div>
          
          <button
						class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-1.5 text-[11px] font-bold text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
						@click="showAddStudentModal = true"
					>
						<UserPlus class="h-3.5 w-3.5" /> {{ __('Add Student') }}
					</button>

          <div v-if="!submissions.length" class="flex flex-col items-center justify-center py-12 text-center text-gray-300">
            <div class="text-4xl mb-4 opacity-20">👥</div>
            <div class="text-xs font-medium">{{ __('No Students') }}</div>
          </div>
				</div>
			</div>

			<!-- CENTER: Paper view -->
			<div class="flex flex-1 flex-col overflow-hidden border-r border-gray-100 bg-gray-50">
        <div class="flex h-10 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
          <span v-if="currentSub" class="flex-1 text-xs font-medium text-gray-700">
            {{ currentSub.student_name }} — SBD {{ currentSub.sbd }}
          </span>
          <div class="flex items-center gap-2">
            <button class="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50">
              🔍 {{ __('Zoom') }}
            </button>
            <button
						  class="rounded bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white hover:opacity-90 shadow-sm transition-opacity flex items-center gap-1"
						  @click="approveAndNext"
					  >
						  <span>✓</span> <span class="hidden sm:inline">{{ __('Approve & Next') }}</span>
					  </button>
          </div>
        </div>

				<div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
					<div v-if="paperImages.length" class="mx-auto max-w-5xl rounded bg-white p-4 shadow-md border border-gray-200/50 relative">
            <div v-if="paperImages.length > 1" class="absolute top-6 right-6 z-10 flex items-center gap-2 bg-white/80 p-1 rounded-lg shadow border">
              <button class="p-1 hover:bg-gray-100 rounded" @click="paperPageIndex = Math.max(0, paperPageIndex - 1)">←</button>
              <span class="text-[10px] font-bold">{{ paperPageIndex + 1 }} / {{ paperImages.length }}</span>
              <button class="p-1 hover:bg-gray-100 rounded" @click="paperPageIndex = Math.min(paperImages.length - 1, paperPageIndex + 1)">→</button>
            </div>
						<img 
							:src="paperImages[paperPageIndex]" 
							class="w-full rounded border border-gray-200 object-contain max-h-[calc(100vh-11rem)]"
              :alt="__('Student submission image')"
						/>
					</div>
					<div v-else-if="currentSub" class="flex h-full flex-col items-center justify-center text-center p-12">
						<div class="h-32 w-32 rounded-3xl border-4 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-5xl mb-6">
							📸
						</div>
						<h4 class="text-lg font-bold text-gray-900">{{ __('No Paper Image') }}</h4>
						<p class="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
							{{ __('Please upload the student\'s submission image for AI grading.') }}
						</p>
						<button 
              class="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 active:scale-95" 
              @click="triggerFileUpload"
            >
							{{ __('Upload Image') }}
						</button>
						<input type="file" ref="paperInput" class="hidden" accept="image/*" @change="handlePaperUpload" />
					</div>
          <div v-else class="flex h-full flex-col items-center justify-center text-center p-12 text-gray-400">
            <div class="h-40 w-40 rounded-full border-4 border-dashed border-gray-100 flex items-center justify-center text-6xl mb-8">
              👤
            </div>
            <h3 class="text-xl font-bold text-gray-900">{{ __('Select Student') }}</h3>
            <p class="text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              {{ __('Select a student from the list to view their results.') }}
            </p>
          </div>
				</div>
			</div>

			<!-- RIGHT: Grade panel -->
			<div class="relative flex w-96 flex-shrink-0 flex-col bg-white overflow-hidden shadow-sm border-l border-gray-100">
				<!-- Loading Overlay -->
				<div 
					v-if="isGradingCurrent"
					class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
				>
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
					<div class="mt-3 text-xs font-bold text-blue-600 uppercase tracking-widest animate-pulse">
						{{ __('AI Grading...') }}
					</div>
				</div>

				<div v-if="currentSub" class="flex-1 flex flex-col overflow-hidden">
					<div class="border-b border-gray-100 p-4">
						<div class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{{ __('AI Suggested Score') }}</div>
						<div v-if="currentSub.status === 'done'">
							<div class="flex items-center gap-1.5">
								<span class="text-3xl font-black font-mono tracking-tighter text-blue-700">
									{{ parsedFeedback?.total_score ?? currentSub.score }}
								</span>
								<span class="text-xs font-bold text-gray-400 mt-2">/ 10</span>
							</div>
							<div class="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
								<div
									class="h-full rounded-full bg-blue-600 transition-all duration-500"
									:style="{ width: (currentSub.score * 10) + '%' }"
								/>
							</div>
						</div>
						<div v-else class="py-4 text-center">
							<div class="text-xs text-gray-400 italic">{{ __('Awaiting Grading...') }}</div>
						</div>
					</div>

					<div class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
						<!-- Feedback Section -->
						<div v-if="currentSub.status === 'done'" class="space-y-3">
							<label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ __('AI Notes') }}</label>
							<div class="rounded-lg border border-[#6d28d9]/20 bg-[#6d28d9]/5 p-3 text-[11px] text-gray-600 leading-relaxed">
								{{ parsedFeedback?.overall_feedback || parsedFeedback?.summary || currentSub.ai_feedback || __('No detailed feedback available.') }}
							</div>
						</div>

					<!-- Detailed Table -->
						<div v-if="currentSub.status === 'done' && parsedCriteria.length" class="space-y-3">
							<label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ __('Grading Criteria') }}</label>
							<div class="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white overflow-hidden shadow-sm">
								<div v-for="q in parsedCriteria" :key="q.question_no || q.q_no" class="flex flex-col p-3 text-[11px] hover:bg-gray-50 transition-colors">
									
									<!-- Header của Câu hỏi -->
									<div class="flex items-center justify-between mb-1">
										<span class="font-bold text-gray-800">
											{{ (q.question_no || q.q_no || '').startsWith(__('Sentence')) ? (q.question_no || q.q_no) : __('Question') + ' ' + (q.question_no || q.q_no) }}
										</span>
										<div class="flex items-center gap-1">
											<input v-model.number="q.score" class="w-10 rounded border border-gray-200 px-1 py-0.5 text-center font-mono text-xs text-blue-600 focus:border-blue-400 focus:outline-none" />
											<span class="text-[10px] text-gray-400">/{{ q.max_score }}</span>
										</div>
									</div>

									<!-- Nếu có các ý nhỏ (details) -->
									<div v-if="q.details && q.details.length" class="mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
										<div v-for="(detail, idx) in q.details" :key="idx" class="flex flex-col gap-1">
											<div class="flex justify-between items-center">
												<span class="font-semibold text-gray-700 uppercase">{{ detail.label }}.</span>
												<div class="flex items-center gap-3">
													<span class="text-gray-500 font-mono text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded">
														HS: <span class="text-gray-800 font-bold">{{ detail.student_choice || '-' }}</span> 
														{{ __('| MULTI:') }} <span class="text-emerald-600 font-bold">{{ detail.correct_answer || '-' }}</span>
													</span>
													<input 
														v-model.number="detail.score"
														class="w-8 rounded border border-gray-200 px-1 py-0.5 text-center font-mono text-[10px] text-gray-700 focus:border-emerald-400 focus:outline-none"
													/>
												</div>
											</div>
											<div v-if="detail.feedback" class="text-[10px] text-gray-500 leading-relaxed italic bg-gray-50 p-1.5 rounded">
												{{ detail.feedback }}
											</div>
										</div>
									</div>

									<!-- Fallback nếu không có details (như format cũ) -->
									<div v-else class="flex flex-col mt-1">
										<div class="flex items-center justify-between">
											<span v-if="q.student_ans || q.correct_ans" class="text-gray-400 font-mono text-[10px]">
												{{ q.student_ans || '-' }} vs {{ q.correct_ans || '-' }}
											</span>
										</div>
										<div v-if="q.feedback" class="text-[10px] text-gray-500 leading-relaxed italic bg-gray-50 p-1.5 rounded mt-1 border border-gray-100/50">
											{{ q.feedback }}
										</div>
									</div>

								</div>
							</div>
						</div>
					</div>

					<div class="flex gap-2 border-t border-gray-100 p-3 mt-auto">
						<button
							class="flex-1 rounded-lg border border-gray-200 bg-transparent py-2 text-xs font-medium text-gray-500 transition-all hover:bg-gray-50"
							@click="prevSub"
							:disabled="currentIdx === 0"
							:class="{'opacity-50 cursor-not-allowed': currentIdx === 0}"
						>
							← {{ __('Back') }}
						</button>
						<button
							class="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 shadow-sm"
							@click="gradeCurrent"
							:disabled="isGradingCurrent"
						>
							🤖 {{ isGradingCurrent ? __('Grading...') : __('AI Grade') }}
						</button>
						<button
							class="flex-[2] rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
							@click="saveManualScores"
						>
							✓ {{ __('Save Scores') }}
						</button>
						<button
							class="flex-1 rounded-lg border border-gray-200 bg-transparent py-2 text-xs font-medium text-gray-500 transition-all hover:bg-gray-50"
							@click="nextSub"
							:disabled="currentIdx === submissions.length - 1"
							:class="{'opacity-50 cursor-not-allowed': currentIdx === submissions.length - 1}"
						>
							{{ __('Next') }} →
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modals -->
		<Dialog v-model="showAddStudentModal" :title="__('Add New Student')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ __('Search Student') }}</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input 
                v-model="studentSearchQuery" 
                class="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-400 focus:outline-none"
                :placeholder="__('Type to search student...')"
                @input="searchStudents"
              />
            </div>
            <div v-if="studentOptions.length" class="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg z-20">
              <div 
                v-for="opt in studentOptions" 
                :key="opt.name"
                class="cursor-pointer p-3 text-xs hover:bg-blue-50 transition-colors flex flex-col gap-0.5"
                @click="selectStudent(opt)"
              >
                <div class="font-bold text-gray-900">{{ opt.full_name }}</div>
                <div class="text-[10px] text-gray-400 font-mono">{{ opt.name }}</div>
              </div>
            </div>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ __('Student SBD') }}</label>
						<Input v-model="newStudent.sbd" :placeholder="__('e.g. 12A1-023')" class="!text-xs" />
					</div>

          <!-- Image/Camera Section (Matches Essay Workspace) -->
					<div class="flex flex-col gap-1 mt-2">
						<label class="text-[11px] font-bold uppercase tracking-wide text-gray-500">{{ __('Photo / Paper Image') }}</label>
						<input type="file" ref="studentPhotoInput" class="hidden" accept="image/*" multiple @change="handleStudentPhoto" />
						
						<div v-if="!showCameraPreview" class="flex gap-2 w-full">
							<div
								class="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-3 transition-colors hover:border-blue-500/50 hover:bg-blue-50/10 cursor-pointer"
								@click="$refs.studentPhotoInput.click()"
							>
								<span class="text-xl mb-1">📁</span>
								<span class="text-[11px] font-medium text-gray-600">{{ __('Upload Files') }}</span>
							</div>

							<div
								class="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-3 transition-colors hover:border-blue-500/50 hover:bg-blue-50/10 cursor-pointer"
								@click="openCamera"
							>
								<span class="text-xl mb-1 text-blue-600">📷</span>
								<span class="text-[11px] font-medium text-gray-600">{{ __('Camera') }}</span>
							</div>
						</div>

						<div v-if="showCameraPreview" class="relative mt-2 flex flex-col items-center rounded-xl overflow-hidden bg-black/90">
							<video ref="cameraVideoElement" class="w-full h-auto max-h-[300px] object-contain" autoplay playsinline></video>
							<canvas ref="cameraCanvasElement" class="hidden"></canvas>
							<div class="absolute bottom-4 flex items-center gap-6">
								<button class="flex h-10 w-10 items-center justify-center bg-red-500 rounded-full text-white shadow-lg shadow-red-500/30 transition-transform active:scale-90 hover:bg-red-600" @click="closeCamera">
									✕
								</button>
								<button class="flex h-14 w-14 items-center justify-center bg-white rounded-full text-black shadow-lg border-4 border-gray-300 transition-transform active:scale-90 hover:bg-gray-100" @click="capturePhoto">
									<span class="text-2xl">📸</span>
								</button>
							</div>
							<div v-if="newStudent.images.length > 0" class="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
								{{ __('Captured') }}: {{ newStudent.images.length }}
							</div>
						</div>

						<div v-if="newStudent.images.length > 0" class="mt-4 grid grid-cols-3 gap-2">
							<div v-for="(img, idx) in newStudent.images" :key="idx" class="relative group aspect-square">
								<img :src="img.preview" class="w-full h-full object-cover rounded-lg border border-gray-200" />
								<button 
									@click.stop="removeImage(idx)" 
									class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity"
								>
									✕
								</button>
							</div>
						</div>
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2 px-4 pb-4">
					<button class="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white" @click="showAddStudentModal = false">
						{{ __('Cancel') }}
					</button>
					<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90" @click="addStudent" :loading="isAddingStudent" :disabled="!newStudent.email">
            {{ __('Add & Start Grading') }}
          </button>
				</div>
			</template>
		</Dialog>

    <!-- Edit Student Modal (Matches Essay Workspace) -->
		<Dialog v-model="showEditStudentModal" :title="__('Edit Student Info')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Student Name') }}</label>
						<Input
							type="text"
							v-model="editingStudent.name"
							:placeholder="__('Display name in this session')"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Student SBD') }}</label>
						<Input
							type="text"
							v-model="editingStudent.sbd"
							:placeholder="__('Candidate number (SBD)')"
						/>
					</div>

          <!-- Edit Images -->
          <div class="flex flex-col gap-1 mt-4">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{{ __('Images') }}</label>
            
            <!-- Existing -->
            <div v-if="editingStudent.images.length" class="grid grid-cols-3 gap-2 mb-4">
              <div v-for="(img, idx) in editingStudent.images" :key="idx" class="relative group aspect-square">
                <img :src="img.file_url" class="w-full h-full object-cover rounded-lg border border-gray-100" />
                <button 
                  @click.stop="deleteExistingImage(img)" 
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Draft -->
            <div v-if="editingStudent.newImages.length" class="grid grid-cols-3 gap-2 mb-4">
              <div v-for="(img, idx) in editingStudent.newImages" :key="idx" class="relative group aspect-square">
                <img :src="img.preview" class="w-full h-full object-cover rounded-lg border border-blue-100 ring-2 ring-blue-50" />
                <button 
                  @click.stop="removeDraftEditImage(idx)" 
                  class="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <button class="flex-1 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase hover:bg-blue-50 transition-all" @click="$refs.editPhotoInput.click()">📁 {{ __('Files') }}</button>
              <button class="flex-1 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase hover:bg-blue-50 transition-all" @click="openCameraForEdit">📷 {{ __('Camera') }}</button>
              <input type="file" ref="editPhotoInput" class="hidden" accept="image/*" multiple @change="handleEditPhotoUpload" />
            </div>

            <div v-if="showEditCamera" class="relative mt-4 overflow-hidden rounded-xl bg-black">
              <video ref="editVideoEl" class="w-full h-auto max-h-[250px] object-contain" autoplay playsinline></video>
              <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button class="h-8 w-8 rounded-full bg-red-500 text-white" @click="closeEditCamera">✕</button>
                <button class="h-10 w-10 rounded-full bg-white text-black border-2 border-gray-200" @click="captureEditPhoto">📸</button>
              </div>
            </div>
          </div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2 px-4 pb-4">
					<button class="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white" @click="showEditStudentModal = false">
						{{ __('Cancel') }}
					</button>
					<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90" @click="saveEditedStudent">
						{{ __('Save Changes') }}
					</button>
				</div>
			</template>
		</Dialog>
	</section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button, Dialog, Input, createResource } from 'frappe-ui'
import { Search, UserPlus, Play, Trash2, Edit, RefreshCw, Maximize2, Square, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const resolvedSessionSlug = computed(() => route.params.sessionSlug || '')

const sessionDoc = ref(null)
const sessionLoading = ref(false)
const activePolls = new Map() // Theo dõi các vòng lặp đang chạy

onUnmounted(() => {
  // Dọn dẹp tất cả vòng lặp khi rời trang
  activePolls.forEach(interval => clearInterval(interval))
  activePolls.clear()
})

const submissionsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_submissions',
})

const currentIdx = ref(-1)
const paperPageIndex = ref(0)
const searchQuery = ref('')
const studentSearchQuery = ref('')
const studentOptions = ref([])
const showAddStudentModal = ref(false)
const showEditStudentModal = ref(false)
const isAddingStudent = ref(false)
const isBatchGrading = ref(false)
const isGradingCurrent = ref(false)
const paperInput = ref(null)

const newStudent = reactive({ name: '', sbd: '', email: '', images: [] })
const editingStudent = reactive({ name: '', sbd: '', id: '', images: [], newImages: [] })

const showNewCamera = ref(false)
const showEditCamera = ref(false)
const newVideoEl = ref(null)
const editVideoEl = ref(null)
const newPhotoInput = ref(null)
const editPhotoInput = ref(null)
let cameraStream = null

const sessionBySlugResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_session_by_slug',
})

const addSubmissionResource = createResource({
	url: 'lms.lms.services.ai_grading.api.add_ai_grading_submission',
})

const uploadAttachmentResource = createResource({
	url: 'lms.lms.api.upload_ai_grading_submission_attachment',
})

const startGradingResource = createResource({
	url: 'lms.lms.services.ai_grading.api.start_ai_grading_sync',
})

const startBatchGradingResource = createResource({
	url: 'lms.lms.services.ai_grading.api.start_batch_ai_grading',
})

const searchStudentsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.search_ai_grading_students',
})

const saveResultResource = createResource({
	url: 'lms.lms.services.ai_grading.api.save_ai_grading_result',
})

const stopGradingResource = createResource({
  url: 'lms.lms.services.ai_grading.api.stop_ai_grading',
})

const statusResource = createResource({
  url: 'lms.lms.services.ai_grading.api.get_ai_grading_status',
})

onMounted(async () => {
  sessionDoc.value = null
  submissionsResource.data = []
	await loadSession()
	await loadSubmissions()
})

onUnmounted(() => {
  stopCamera()
})

async function loadSession() {
  sessionLoading.value = true
	try {
    const doc = await sessionBySlugResource.submit({
      session_slug: resolvedSessionSlug.value,
    })
    sessionDoc.value = doc
  } finally {
    sessionLoading.value = false
  }
}

async function loadSubmissions() {
	if (!sessionDoc.value?.name) return
	await submissionsResource.submit({
		session: sessionDoc.value.name
	})
	if (submissions.value.length > 0 && currentIdx.value === -1) {
		currentIdx.value = 0
	}
}

const submissions = computed(() => {
	return (submissionsResource.data || []).map(s => ({
		id: s.name,
		student_name: s.student_name || s.student,
		sbd: s.student_sbd,
		score: s.score,
		status: (s.status || '').toLowerCase() || 'pending',
		paper_images: s.paper_images || [],
		ai_feedback: s.ai_feedback,
    criteria_scores: s.criteria_scores
	}))
})

const filteredSubmissions = computed(() => {
	if (!searchQuery.value) return submissions.value
	const q = searchQuery.value.toLowerCase()
	return submissions.value.filter(s => 
		s.student_name.toLowerCase().includes(q) || 
		(s.sbd && s.sbd.toLowerCase().includes(q))
	)
})

const currentSub = computed(() => filteredSubmissions.value[currentIdx.value])

const paperImages = computed(() => {
  return (currentSub.value?.paper_images || []).map(img => typeof img === 'string' ? img : img.file_url).filter(Boolean)
})

const parsedFeedback = computed(() => {
  if (!currentSub.value?.ai_feedback) return null
  try {
    const raw = currentSub.value.ai_feedback
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      return JSON.parse(raw)
    }
    return null
  } catch (e) {
    return null
  }
})

const parsedCriteria = computed(() => {
  if (parsedFeedback.value?.mcq_results) {
    return parsedFeedback.value.mcq_results
  }
  
  if (currentSub.value?.criteria_scores) {
    try {
      const raw = currentSub.value.criteria_scores
      if (typeof raw === 'string') return JSON.parse(raw)
      return Array.isArray(raw) ? raw : []
    } catch (e) {}
  }
  return []
})

async function deleteExistingImage(img) {
  if (!confirm(__('Are you sure you want to delete this image?'))) return
  try {
    await createResource({ url: 'frappe.client.delete', auto: false }).submit({
      doctype: 'File',
      name: img.name
    })
    editingStudent.images = editingStudent.images.filter(i => i.file_url !== img.file_url)
    frappe.show_alert({ message: __('Deleted image'), indicator: 'blue' })
    await loadSubmissions()
  } catch (e) {
    console.error(e)
  }
}

async function searchStudents() {
  if (studentSearchQuery.value.length < 2) {
    studentOptions.value = []
    return
  }
  const res = await searchStudentsResource.submit({
    query: studentSearchQuery.value
  })
  studentOptions.value = res || []
}

function selectStudent(opt) {
  newStudent.email = opt.name
  newStudent.name = opt.full_name
  studentSearchQuery.value = opt.full_name
  studentOptions.value = []
}

function removeDraftImage(index) {
	const [removed] = newStudent.images.splice(index, 1)
	if (removed?.preview) URL.revokeObjectURL(removed.preview)
}

function removeDraftEditImage(index) {
	const [removed] = editingStudent.newImages.splice(index, 1)
	if (removed?.preview) URL.revokeObjectURL(removed.preview)
}

async function startCamera(videoEl) {
  try {
    stopCamera()
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (videoEl) videoEl.srcObject = cameraStream
  } catch (e) {
    frappe.show_alert({ message: __('Camera Error'), indicator: 'red' })
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop())
    cameraStream = null
  }
}

function openCameraForNew() {
  showNewCamera.value = true
  setTimeout(() => startCamera(newVideoEl.value), 100)
}

function closeNewCamera() {
  showNewCamera.value = false
  stopCamera()
}

function openCameraForEdit() {
  showEditCamera.value = true
  setTimeout(() => startCamera(editVideoEl.value), 100)
}

function closeEditCamera() {
  showEditCamera.value = false
  stopCamera()
}

function capturePhoto(targetList) {
  const video = showNewCamera.value ? newVideoEl.value : editVideoEl.value
  if (!video) return
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  canvas.toBlob(blob => {
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
    const item = { file, preview: URL.createObjectURL(file) }
    targetList.push(item)
  }, 'image/jpeg', 0.9)
}

function captureNewPhoto() { capturePhoto(newStudent.images) }
function captureEditPhoto() { capturePhoto(editingStudent.newImages) }

function handleNewPhotoUpload(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    newStudent.images.push({ file, preview: URL.createObjectURL(file) })
  })
}

function handleEditPhotoUpload(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    editingStudent.newImages.push({ file, preview: URL.createObjectURL(file) })
  })
}

async function fileToDataUrl(file) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = () => reject(new Error('Unable to read image file'))
		reader.readAsDataURL(file)
	})
}

async function addStudent() {
	if (!newStudent.email || !sessionDoc.value?.name) return
	isAddingStudent.value = true
	try {
		let paperImagesData = []
		let paperImagesNames = []
		const imageFiles = newStudent.images.filter((img) => img?.file)
		if (imageFiles.length > 0) {
			paperImagesData = await Promise.all(imageFiles.map((img) => fileToDataUrl(img.file)))
			paperImagesNames = imageFiles.map((img) => img.file.name)
		}

		await addSubmissionResource.submit({
			session: sessionDoc.value.name,
			student: newStudent.email,
      student_name: newStudent.name,
			student_sbd: newStudent.sbd,
			paper_images_data: paperImagesData,
			paper_images_names: paperImagesNames,
		})
		
    newStudent.name = ''
    newStudent.email = ''
		newStudent.sbd = ''
    newStudent.images = []
    studentSearchQuery.value = ''
		showAddStudentModal.value = false
    closeNewCamera()
		await loadSubmissions()
    currentIdx.value = submissions.value.length - 1
	} finally {
		isAddingStudent.value = false
	}
}

function statusBadgeClasses(status) {
	const map = {
		done: 'bg-blue-600 text-white',
		grading: 'bg-amber-100 text-amber-900 border border-amber-300',
		flag: 'bg-rose-50 text-rose-700 border border-rose-200',
		pending: 'bg-gray-100 text-gray-400',
	}
	return map[status] || 'bg-gray-100 text-gray-600'
}

function statusLabel(status) {
	const map = {
		done: __('Approved'),
		grading: __('Grading'),
		flag: __('Need review'),
		pending: __('Pending'),
	}
	return map[status] || status
}

function triggerFileUpload() {
	paperInput.value?.click()
}

async function handlePaperUpload(e) {
	const file = e.target.files[0]
	if (!file || !currentSub.value) return
	
	const reader = new FileReader()
	reader.onload = async () => {
		await uploadAttachmentResource.submit({
			submission: currentSub.value.id,
			data_url: reader.result,
			file_name: file.name
		})
		await loadSubmissions()
	}
	reader.readAsDataURL(file)
}

async function stopGrading(sub) {
  try {
    await stopGradingResource.submit({
      submission: sub.id
    })
    sub.status = 'pending'
    loadSubmissions()
  } catch (e) {
    console.error(e)
  }
}

async function gradeCurrent() {
  if (!currentSub.value) return
  
  const submissionId = currentSub.value.id
  
  // HIỆN VÒNG XOAY NGAY LẬP TỨC
  if (submissionsResource.data) {
    const sub = submissionsResource.data.find(s => s.name === submissionId)
    if (sub) sub.status = 'Grading'
  }
  
  isGradingCurrent.value = true
  
  try {
		// Gọi API và enqueue job (không chờ chấm xong)
		await startGradingResource.submit({
      submission: submissionId
    })
    
		// Nạp lại để thấy trạng thái "Grading" ngay
    await loadSubmissions()

		// Bắt đầu poll để tự động nạp kết quả khi xong
		pollGradingStatus(submissionId)

		frappe.show_alert({ message: __('Grading started (background run). Can do something else.'), indicator: 'blue' })
  } catch (e) {
    console.error('Grading error:', e)
    frappe.show_alert({ 
			message: __('Failed to start grading. Please try again.'),
			indicator: 'red'
    })
    loadSubmissions()
  } finally {
    isGradingCurrent.value = false
  }
}

function pollGradingStatus(submissionId) {
  // Nếu đã có vòng lặp cho học sinh này rồi thì không tạo thêm
  if (activePolls.has(submissionId)) return

  const interval = setInterval(async () => {
    try {
      const res = await statusResource.submit({
        submission: submissionId
      })
      
      // Nếu trạng thái đã hoàn thành hoặc lỗi thì dừng thăm dò
      if (res && (res.status === 'Done' || res.status === 'Flagged' || res.status === 'Failed')) {
        clearInterval(interval)
        activePolls.delete(submissionId)
        
        // TỰ ĐỘNG HIỆN KẾT QUẢ
        await loadSubmissions()
        
        if (currentSub.value && currentSub.value.id === submissionId) {
          isGradingCurrent.value = false
        }
      }
    } catch (e) {
      clearInterval(interval)
      activePolls.delete(submissionId)
      isGradingCurrent.value = false
    }
  }, 5000) // Tăng lên 5 giây để giảm tần suất gọi API

  activePolls.set(submissionId, interval)
}

async function handleGradeSubmission(sub) {
  currentIdx.value = filteredSubmissions.value.findIndex(s => s.id === sub.id)
  await gradeCurrent()
}

async function saveManualScores() {
	if (!currentSub.value) return
	
	const feedback = parsedFeedback.value
	if (!feedback) {
        frappe.msgprint(__('No feedback data available to save.'))
        return
    }

	let newTotal = 0
	if (feedback.mcq_results) {
		for (const q of feedback.mcq_results) {
			let qScore = 0
			if (q.details && q.details.length) {
				for (const d of q.details) {
					qScore += Number(d.score) || 0
				}
				q.score = qScore
			} else {
                qScore = Number(q.score) || 0
            }
			newTotal += qScore
		}
	}
    if (feedback.solution_results) {
        for (const q of feedback.solution_results) {
            newTotal += Number(q.score) || 0
        }
    }
	feedback.total_score = newTotal
	
	const newFeedbackStr = JSON.stringify(feedback)
	currentSub.value.score = newTotal
	currentSub.value.ai_feedback = newFeedbackStr

	try {
		await saveResultResource.submit({
			submission_id: currentSub.value.id,
			data: {
				score: newTotal,
				ai_feedback: newFeedbackStr,
				status: 'Done'
			}
		})
		frappe.show_alert({ message: __('Scores updated successfully!'), indicator: 'green' })
		await loadSubmissions()
	} catch (error) {
		frappe.msgprint(__('Error saving scores: ') + error.message)
	}
}

function handleEditSubmission(sub) {
  editingStudent.id = sub.id
  editingStudent.name = sub.student_name
  editingStudent.sbd = sub.sbd
  editingStudent.images = sub.paper_images ? JSON.parse(JSON.stringify(sub.paper_images)) : []
  editingStudent.newImages = []
  showEditStudentModal.value = true
}

async function saveEditedStudent() {
	if (!editingStudent.id) return
	try {
		// Save name/sbd
		await createResource({
			url: 'frappe.client.set_value',
			auto: false
		}).submit({
			doctype: 'AI Grading Submission',
			name: editingStudent.id,
			fieldname: {
				student_name: editingStudent.name,
				student_sbd: editingStudent.sbd
			}
		})

		// Save new images
		if (editingStudent.newImages.length) {
			const newFiles = editingStudent.newImages.filter(i => i.file).map(i => i.file)
			const imagesData = await Promise.all(newFiles.map(f => fileToDataUrl(f)))
			const imagesNames = newFiles.map(f => f.name)

			await createResource({ url: 'lms.lms.api.upload_ai_grading_submission_attachments', auto: false }).submit({
				submission: editingStudent.id,
				images_data: imagesData,
				images_names: imagesNames
			})
		}

		showEditStudentModal.value = false
		stopCamera()
		await loadSubmissions()
	} catch (e) {
		console.error(e)
	}
}

async function handleDeleteSubmission(sub) {
  await deleteSubmission(sub.id)
}

async function approveAndNext() {
  nextSub()
}

function nextSub() {
  if (currentIdx.value < filteredSubmissions.value.length - 1) {
    currentIdx.value++
  }
}

function prevSub() {
  if (currentIdx.value > 0) {
    currentIdx.value--
  }
}

async function runBatchGrading() {
  if (isBatchGrading.value || !sessionDoc.value?.name) return
  isBatchGrading.value = true
  try {
    await startBatchGradingResource.submit({ 
      session: sessionDoc.value.name 
    })
    setTimeout(loadSubmissions, 5000)
  } catch (e) {
    console.error(e)
  } finally {
    isBatchGrading.value = false
  }
}

async function deleteSubmission(id) {
  if (!confirm(__('Are you sure you want to delete this student?'))) return
  await createResource({
    url: 'frappe.client.delete',
    auto: false
  }).submit({
    doctype: 'AI Grading Submission',
    name: id
  })
  await loadSubmissions()
  if (currentIdx.value >= submissions.value.length) {
    currentIdx.value = submissions.value.length - 1
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
