<template>
	<section class="absolute inset-0 flex flex-col overflow-hidden bg-white sm:rounded-xl border border-gray-100 shadow-sm">
		<!-- Top bar -->
		<div class="flex h-12 flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4">
			<button
				class="group flex items-center gap-1.5 text-[11px] font-medium text-gray-500 transition-all hover:text-gray-900"
				@click="$router.push({ name: 'AIGradingEssayConfig', params: { type: resolvedType || $route.params.type || 'exam' } })"
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
			<div class="flex items-center gap-2">
				<button
					class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
					@click="runBatchGrading"
					:disabled="isBatchGrading"
				>
					<icons.Loader2 v-if="isBatchGrading" class="h-3.5 w-3.5 animate-spin" />
					<span v-else>🚀</span>
					{{ isBatchGrading ? __('Dotted...') : __('Full stop') }}
				</button>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50"
					@click="exportGrades"
					:title="__('Export score')"
				>
					<icons.Download class="h-4 w-4" />
				</button>
				<button
					class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
					@click="saveAllToDatabase"
				>
					<icons.Save class="h-3.5 w-3.5" />
					{{ __('Save All') }}
				</button>
			</div>
		</div>

			<!-- Body: 3-column layout -->
			<div class="flex flex-1 overflow-hidden">
				<!-- LEFT: Submission list -->
				<div class="flex w-72 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
					<div class="p-4 border-b border-gray-100">
						<div class="mb-3 flex items-center justify-between">
							<span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ __('Work List') }}</span>
							<button 
								v-if="sessionDoc?.reference_doc"
								class="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all disabled:opacity-50"
								@click="syncSubmissions"
								:disabled="isSyncing"
								:title="__('Synchronize submissions from the system')"
							>
								<icons.RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isSyncing }" />
								{{ isSyncing ? __('Syncing...') : __('Synchronization') }}
							</button>
						</div>
						<div class="relative">
							<icons.Search class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
							<input
								v-model="searchQuery"
								class="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-xs text-gray-700 focus:border-blue-400 focus:outline-none transition-all"
								:placeholder="__('Student Search')"
							/>
						</div>
					</div>
					<div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
						<div
							v-for="(sub, idx) in filteredSubmissions"
							:key="sub.id"
							class="group cursor-pointer rounded-xl border p-3 transition-all"
							:class="[
								currentIdx === idx
									? 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100 shadow-sm'
									: 'border-transparent hover:bg-gray-50',
							]"
							@click="currentIdx = idx"
						>
							<div class="flex items-center justify-between mb-1.5">
								<span class="text-[13px] font-bold text-gray-900 truncate">{{ sub.name }}</span>
								<span v-if="sub.score != null" class="text-sm font-black font-mono text-blue-600">{{ sub.score }}</span>
							</div>
							<div class="flex items-center justify-between mt-auto pt-1">
								<div class="flex items-center gap-2.5">
									<div v-if="sub.status === 'grading'" class="flex items-center gap-1">
										<button @click.stop="stopGrading(sub)" class="p-1 hover:bg-rose-100 rounded text-rose-600" :title="__('Stop marking')">
											<icons.Square class="w-4 h-4 fill-current" />
										</button>
										<icons.Loader2 class="w-4 h-4 animate-spin text-amber-600" />
									</div>
									<button 
										v-else
										class="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
										@click.stop="handleGradeSubmission(sub)"
										:title="__('Evaluate Quiz for User')"
									>
										<icons.Play class="h-4 w-4 fill-current" />
									</button>
									<button 
										class="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
										@click.stop="handleEditSubmission(sub)"
										:title="__('Edit')"
									>
										<icons.Edit class="h-4 w-4" />
									</button>
									<button 
										class="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
										@click.stop="handleDeleteSubmission(sub)"
										:title="__('[Delete]')"
									>
										<icons.Trash2 class="h-4 w-4" />
									</button>
								</div>
								<span
									class="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-tight"
									:class="tagClass(sub.status)"
								>
									{{ statusLabel(sub.status) }}
								</span>
							</div>
						</div>

						<button
							class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-[11px] font-bold text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
							@click="showAddStudentModal = true"
						>
							<icons.UserPlus class="h-3.5 w-3.5" />
							{{ __('Add Student(s)') }}
						</button>
					</div>
				</div>

				<!-- CENTER: Paper view -->
				<div class="flex flex-1 flex-col overflow-hidden bg-gray-50/50">
					<div class="flex h-10 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
						<div class="flex items-center gap-3">
							<span class="text-xs font-semibold text-gray-700">
								{{ currentSub?.name }} — {{ currentSub?.id }}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<button
								class="flex items-center gap-1 rounded bg-white border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-all"
								@click="showDocument = !showDocument"
								v-if="paperImages.length || currentSub?.text_content"
							>
								<icons.EyeOff v-if="showDocument" class="h-3 w-3" />
								<icons.Eye v-else class="h-3 w-3" />
								{{ showDocument ? __('Hide Document') : __('Show Document') }}
							</button>
							<button
								class="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-[10px] font-bold text-white hover:opacity-90 shadow-sm transition-opacity"
								@click="approveAndNext"
							>
								✓ {{ __('Browse & Next') }}
							</button>
							<button
								class="flex items-center gap-1 rounded bg-white border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-all"
								@click="flagCurrent"
							>
								<icons.Flag class="h-3 w-3" />
								{{ __('Flag') }}
							</button>
						</div>
					</div>

					<div class="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
						<div v-show="showDocument" v-if="paperImages.length || currentSub?.text_content" class="mx-auto max-w-5xl space-y-6">
							<!-- Image Viewer -->
							<div v-if="paperImages.length" class="rounded-xl bg-white p-4 shadow-md border border-gray-100 relative">
								<div class="absolute top-6 right-6 z-10">
									<div
										v-if="hasMultiplePaperImages"
										class="flex items-center gap-3 rounded-lg border border-gray-100 bg-white/90 p-1.5 text-[10px] text-gray-500 shadow-lg backdrop-blur-md"
									>
										<button class="h-6 w-6 rounded flex items-center justify-center hover:bg-gray-100 transition-all" @click="prevPaperPage"><icons.ChevronLeft class="h-3 w-3" /></button>
										<span class="font-bold font-mono">{{ paperPageIndex + 1 }} / {{ paperImages.length }}</span>
										<button class="h-6 w-6 rounded flex items-center justify-center hover:bg-gray-100 transition-all" @click="nextPaperPage"><icons.ChevronRight class="h-3 w-3" /></button>
									</div>
								</div>
								<img
									:src="currentPaperImage"
									class="max-h-[1000px] w-full rounded-lg object-contain border border-gray-50"
								/>
							</div>

							<!-- Text Viewer -->
							<div v-if="currentSub?.text_content" class="rounded-xl bg-white p-6 shadow-md border border-gray-100">
								<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">{{ __('Student Submission Document / Text') }}</div>
								<div class="text-sm text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
									{{ currentSub.text_content }}
								</div>
							</div>
						</div>
						
						<!-- AI Feedback View -->
						<div v-else class="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm border border-gray-100">
							<div class="mb-6 text-center border-b border-gray-50 pb-6">
								<div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ __('Tomosa AI System') }}</div>
								<div class="text-lg font-bold text-gray-900 uppercase tracking-tight">{{ __('RESULTS OF INDEPENDENT ANALYSIS') }}</div>
							</div>
							<div class="space-y-6">
								<div class="p-6 rounded-xl bg-blue-50/50 border border-blue-100">
									<div class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">{{ __('✦ AI CONTENT ANALYSIS') }}</div>
									<div class="text-sm text-gray-700 font-medium leading-relaxed italic whitespace-pre-line">
										{{ feedback || __('Waiting for analysis results from AI...') }}
									</div>
								</div>
							</div>
						</div>
						
						<!-- Evaluation Widget for each grading -->
						<div class="mx-auto max-w-3xl mt-6 flex justify-center">
							<AIFeedbackWidget 
								v-if="currentSub && ['done', 'flagged', 'grading'].includes(currentSub.status?.toLowerCase())"
								serviceType="AI Grading"
								:referenceId="currentSub.id"
								:key="currentSub.id"
							/>
						</div>
					</div>
				</div>

				<!-- RIGHT: Grade panel -->
				<div 
					class="flex flex-shrink-0 flex-col bg-white border-l border-gray-100 transition-all duration-300"
					:class="showDocument ? 'w-80' : 'flex-1'"
				>
					<div class="p-6 border-b border-gray-100 bg-gray-50/30">
						<div class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
							{{ __('PROPOSED SCORE') }}
						</div>
						<div class="flex items-baseline gap-1">
							<span class="text-5xl font-black tracking-tighter text-blue-600">{{ totalScore.toFixed(1) }}</span>
							<span class="text-base text-gray-300 font-bold">/10</span>
						</div>
						<div class="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100 shadow-inner">
							<div
								class="h-full rounded-full bg-blue-600 transition-all duration-1000"
								:style="{ width: totalScore * 10 + '%' }"
							/>
						</div>
						<div class="mt-4 flex items-center justify-between">
							<span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ __('Reliability') }}</span>
							<span 
								class="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border"
								:class="(parsedFeedback?.confidence || 0) >= 0.8 || parsedFeedback?.confidence_level === 'HIGH' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'"
							>
								{{ parsedFeedback?.confidence ? Math.round(parsedFeedback.confidence * 100) + '%' : (parsedFeedback?.confidence_score || '80%') }}
							</span>
						</div>
					</div>

					<div class="flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar">
						<div class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ __('Key to Grading') }}</div>

						<div
							v-for="(crit, ci) in activeCriteria"
							:key="ci"
							class="rounded-xl border p-4 transition-all"
							:class="[
								crit.score < crit.max
									? 'border-rose-100 bg-rose-50/20'
									: 'border-gray-100 bg-white hover:border-blue-200',
							]"
						>
							<div class="flex items-start justify-between gap-2 mb-2">
								<span class="text-[12px] font-bold text-gray-800 leading-tight uppercase">{{ crit.name }}</span>
								<div class="flex items-center gap-1 flex-shrink-0">
									<input
										v-model.number="crit.score"
										class="w-10 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-center font-bold text-[11px] text-gray-900 focus:border-blue-400 outline-none"
									/>
									<span class="text-[10px] text-gray-400 font-medium">/{{ crit.max }}</span>
								</div>
							</div>
							<div class="text-[11px] text-gray-500 leading-relaxed">{{ crit.note }}</div>
						</div>

						<div class="pt-2">
							<div class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{{ __('TEACHER\'S COMMENTS') }}</div>
							<textarea
								v-model="manualFeedback"
								class="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs font-medium text-gray-800 placeholder:text-gray-300 focus:border-blue-400 outline-none transition-all resize-none shadow-inner"
								rows="4"
							/>
						</div>
					</div>

					<div class="p-4 border-t border-gray-100 bg-white">
						<button
							class="w-full rounded-lg bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
							@click="saveCurrent('Grading')"
							:disabled="isApproving"
						>
							<icons.Loader2 v-if="isApproving" class="h-3.5 w-3.5 inline mr-1.5 animate-spin" />
							<icons.CheckCircle v-else class="h-3.5 w-3.5 inline mr-1.5" />
							{{ isApproving ? __('SAVING ...') : __('SAVE RESULTS') }}
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Modals -->
		<Dialog v-model="showAddStudentModal" :title="__('Add New Student')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">{{ __('Full name') }}</label>
						<Input type="text" v-model="newStudent.name" :placeholder="__('For example: Nguyen Van A')" />
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">{{ __('Identification Number (SBD)') }}</label>
						<Input type="text" v-model="newStudent.sbd" placeholder="123456" />
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">{{ __('Child’s Email') }}</label>
						<Input type="email" v-model="newStudent.email" placeholder="student@example.com" />
					</div>
					<div class="flex flex-col gap-1 mt-4">
						<label class="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">{{ __('Image of the assignment') }}</label>
						<div v-if="newStudent.images.length" class="grid grid-cols-3 gap-2 mb-4">
							<div v-for="(img, idx) in newStudent.images" :key="idx" class="relative group aspect-square">
								<img :src="img.preview" class="w-full h-full object-cover rounded-lg border border-gray-100" />
								<button @click.stop="newStudent.images.splice(idx, 1)" class="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">✕</button>
							</div>
						</div>
						<div class="flex gap-2">
							<button class="flex-1 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3 text-[10px] font-bold text-gray-500 uppercase hover:bg-blue-50 hover:border-blue-300 transition-all" @click="$refs.newPhotoInput.click()">📁 {{ __('Download file') }}</button>
							<button class="flex-1 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3 text-[10px] font-bold text-gray-500 uppercase hover:bg-blue-50 hover:border-blue-300 transition-all" @click="openCameraForNew">📷 {{ __('Take Photo') }}</button>
							<input type="file" ref="newPhotoInput" class="hidden" accept="image/*" multiple @change="handleNewPhotoUpload" />
						</div>
						<div v-if="showNewCamera" class="relative mt-4 overflow-hidden rounded-2xl bg-black">
							<video ref="newVideoEl" class="w-full h-auto max-h-[300px] object-contain" autoplay playsinline></video>
							<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
								<button class="h-10 w-10 rounded-full bg-rose-500 text-white shadow-lg" @click="closeNewCamera">✕</button>
								<button class="h-14 w-14 rounded-full bg-white text-black border-4 border-gray-200 shadow-xl" @click="captureNewPhoto">📸</button>
							</div>
						</div>
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-3 p-4">
					<button class="rounded-xl border border-slate-100 bg-white px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50" @click="showAddStudentModal = false">{{ __('Cancel') }}</button>
					<button class="rounded-xl bg-slate-900 px-6 py-2 text-xs font-black text-amber-400 uppercase tracking-widest shadow-lg disabled:opacity-50" @click="addStudent" :disabled="isAddingStudent">
						{{ isAddingStudent ? __('Saving...') : __('Add') }}
					</button>
				</div>
			</template>
		</Dialog>

		<Dialog v-model="showEditStudentModal" :title="__('Student Information')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">{{ __('Full name') }}</label>
						<Input type="text" v-model="editingStudent.name" />
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">{{ __('Identification Number (SBD)') }}</label>
						<Input type="text" v-model="editingStudent.sbd" />
					</div>
					
					<!-- Edit Images -->
					<div class="flex flex-col gap-1 mt-4">
						<label class="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">{{ __('Image of the assignment') }}</label>
						
						<!-- Existing Images -->
						<div v-if="editingStudent.images.length" class="grid grid-cols-3 gap-2 mb-4">
							<div v-for="(img, idx) in editingStudent.images" :key="idx" class="relative group aspect-square">
								<img :src="img.file_url" class="w-full h-full object-cover rounded-lg border border-gray-100" />
								<button 
									@click.stop="deleteExistingImage(img)" 
									class="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-rose-600"
									:title="__('Delete this image')"
								>
									✕
								</button>
							</div>
						</div>

						<!-- New Image Uploads (Draft) -->
						<div v-if="editingStudent.newImages.length" class="grid grid-cols-3 gap-2 mb-4">
							<div v-for="(img, idx) in editingStudent.newImages" :key="idx" class="relative group aspect-square">
								<img :src="img.preview" class="w-full h-full object-cover rounded-lg border border-blue-100 ring-2 ring-blue-50" />
								<button 
									@click.stop="removeDraftImage(idx)" 
									class="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
								>
									✕
								</button>
								<div class="absolute bottom-1 left-1 right-1 bg-blue-600 text-[8px] text-white py-0.5 rounded text-center uppercase font-black">{{ __('New') }}</div>
							</div>
						</div>

						<!-- Upload Actions -->
						<div class="flex gap-2">
							<button 
								class="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
								@click="$refs.editPhotoInput.click()"
							>
								<span class="text-xl mb-1">📁</span>
								<span class="text-[10px] font-bold text-gray-500 uppercase">{{ __('Download file') }}</span>
							</button>
							<button 
								class="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
								@click="openCameraForEdit"
							>
								<span class="text-xl mb-1">📷</span>
								<span class="text-[10px] font-bold text-gray-500 uppercase">{{ __('Take Photo') }}</span>
							</button>
							<input type="file" ref="editPhotoInput" class="hidden" accept="image/*" multiple @change="handleEditPhotoUpload" />
						</div>

						<!-- Camera Preview -->
						<div v-if="showEditCamera" class="relative mt-4 overflow-hidden rounded-2xl bg-black shadow-2xl">
							<video ref="editVideoEl" class="w-full h-auto max-h-[300px] object-contain" autoplay playsinline></video>
							<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
								<button class="h-10 w-10 rounded-full bg-rose-500 text-white shadow-lg" @click="closeEditCamera">✕</button>
								<button class="h-14 w-14 rounded-full bg-white text-black border-4 border-gray-200 shadow-xl" @click="captureEditPhoto">📸</button>
							</div>
						</div>
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-3 p-4">
					<button class="rounded-xl border border-slate-100 bg-white px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50" @click="showEditStudentModal = false">{{ __('Cancel') }}</button>
					<button class="rounded-xl bg-slate-900 px-6 py-2 text-xs font-black text-amber-400 uppercase tracking-widest shadow-lg disabled:opacity-50" @click="saveEditedStudent" :disabled="isSavingStudent">
						{{ isSavingStudent ? __('Saving...') : __('Save changes') }}
					</button>
				</div>
			</template>
		</Dialog>

		<!-- New Dialog for Image Management (Optional but I'll put it inside Edit Student) -->

</template>

<script setup>
async function fileToDataUrl(file) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = () => reject(new Error('Unable to read image file'))
		reader.readAsDataURL(file)
	})
}
import { ref, computed, reactive, onMounted, watch, onUnmounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Dialog, Input, createResource } from 'frappe-ui'
import * as icons from 'lucide-vue-next'
import dayjs from '@/utils/dayjs'
import AIFeedbackWidget from '@/components/ai/AIFeedbackWidget.vue'

const props = defineProps({
	sessionSlug: { type: String, required: false, default: '' },
	type: { type: String, required: false, default: 'exam' },
})

const route = useRoute()
const router = useRouter()
const resolvedSessionSlug = computed(() => route.params.sessionSlug || props.sessionSlug || '')
const resolvedType = computed(() => route.params.type || props.type || 'exam')
const resolvedSessionId = ref('')
const sessionDoc = ref(null)
const sessionLoading = ref(false)
const activePolls = new Map() // Theo dõi các vòng lặp đang chạy

const socket = inject('$socket')

const handleGradingUpdate = (data) => {
  const subId = data.submission_id || data.submission
  if (data.session === resolvedSessionId.value || (subId && submissions.value.some(s => s.id === subId))) {
    loadSubmissions()
  }
}

onUnmounted(() => {
  // Dọn dẹp tất cả vòng lặp khi rời trang
  activePolls.forEach(interval => clearInterval(interval))
  activePolls.clear()
  stopCamera()
  if (socket) {
    socket.off('ai_grading_update', handleGradingUpdate)
    socket.off('ai_grading_score_update', handleGradingUpdate)
  }
})

const submissionsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_submissions',
})

const sessionBySlugResource = createResource({
	url: 'lms.lms.services.ai_grading.api.get_ai_grading_session_by_slug',
})

const startGradingResource = createResource({
	url: 'lms.lms.services.ai_grading.api.start_ai_grading_sync',
})

const startBatchGradingResource = createResource({
	url: 'lms.lms.services.ai_grading.api.start_batch_ai_grading',
})

const addSubmissionResource = createResource({
	url: 'lms.lms.services.ai_grading.api.add_ai_grading_submission',
})

const stopGradingResource = ref(null)

const statusResource = createResource({
  url: 'lms.lms.services.ai_grading.api.get_ai_grading_status',
})

const saveResultResource = createResource({
	url: 'lms.lms.services.ai_grading.api.save_ai_grading_result',
})

const syncSubmissionsResource = createResource({
	url: 'lms.lms.services.ai_grading.api.sync_ai_grading_submissions',
})

const isGradingCurrent = ref(false)
const isBatchGrading = ref(false)
const isApproving = ref(false)
const isSyncing = ref(false)
const showAddStudentModal = ref(false)
const showDocument = ref(true)
const showEditStudentModal = ref(false)
const isAddingStudent = ref(false)
const isSavingStudent = ref(false)

// Adding a new student modal
const newStudent = reactive({
	name: '',
	sbd: '',
	email: '',
	images: []
})

const editingStudent = reactive({
	id: '',
	name: '',
	sbd: '',
	images: [],
	newImages: []
})

// Camera Refs
const showNewCamera = ref(false)
const showEditCamera = ref(false)
const newVideoEl = ref(null)
const editVideoEl = ref(null)
const newPhotoInput = ref(null)
const editPhotoInput = ref(null)
let cameraStream = null


async function startCamera(videoEl) {
	try {
		stopCamera()
		cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
		if (videoEl) videoEl.srcObject = cameraStream
	} catch (e) {
		frappe.show_alert({ message: __('Failed to open camera'), indicator: 'red' })
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

function removeDraftImage(idx) {
	const [item] = editingStudent.newImages.splice(idx, 1)
	if (item.preview) URL.revokeObjectURL(item.preview)
}

async function deleteExistingImage(img) {
	if (!confirm(__('Are you sure you want to delete this photo?'))) return
	try {
		await createResource({ url: 'lms.lms.services.ai_grading.api.delete_ai_grading_submission_attachment', auto: false }).submit({
			submission: editingStudent.id,
			file_url: typeof img === 'string' ? img : img.file_url
		})
		editingStudent.images = editingStudent.images.filter(i => {
			const u = typeof i === 'string' ? i : i.file_url;
			const targetU = typeof img === 'string' ? img : img.file_url;
			return u !== targetU;
		})
		frappe.show_alert({ message: __('Photo removed'), indicator: 'blue' })
		await loadSubmissions()
	} catch (e) {
		editingStudent.images = editingStudent.images.filter(i => {
			const u = typeof i === 'string' ? i : i.file_url;
			const targetU = typeof img === 'string' ? img : img.file_url;
			return u !== targetU;
		})
	}
}

async function syncSubmissions() {
	if (!resolvedSessionId.value || isSyncing.value) return
	isSyncing.value = true
	try {
		const res = await syncSubmissionsResource.submit({ session: resolvedSessionId.value })
		if (res && res.status === 'success') {
			frappe.show_alert({ 
				message: __('{0} new submissions synced').replace('{0}', res.synced_count), 
				indicator: 'green' 
			})
			await loadSubmissions()
		}
	} catch (e) {
		console.error("Sync error:", e)
	} finally {
		isSyncing.value = false
	}
}

const currentIdx = ref(0)
const searchQuery = ref('')
const paperPageIndex = ref(0)

onMounted(async () => {
  // 1. Làm sạch dữ liệu cũ ngay lập tức
  sessionDoc.value = null
  submissionsResource.data = []
  resolvedSessionId.value = ''
  
  // 2. Nạp lại dữ liệu mới từ đầu
  try {
    await loadSessionBySlug()
    if (resolvedSessionId.value) {
      await loadSubmissions()
      
      // Khởi động poll cho các submission đã ở trạng thái grading trước đó
      submissions.value.forEach(s => {
        if (s.status === 'grading') {
          pollGradingStatus(s.id)
        }
      })
    }
  } catch (e) {
    console.error("Lỗi nạp dữ liệu Workspace:", e)
  }
  
  if (socket) {
    socket.on('ai_grading_update', handleGradingUpdate)
    socket.on('ai_grading_score_update', handleGradingUpdate)
  }
})

async function loadSessionBySlug() {
	if (!resolvedSessionSlug.value) return
	sessionLoading.value = true
	try {
		const doc = await sessionBySlugResource.submit({ session_slug: resolvedSessionSlug.value })
		sessionDoc.value = doc
		resolvedSessionId.value = doc?.name || ''
	} finally {
		sessionLoading.value = false
	}
}

async function loadSubmissions() {
	if (!resolvedSessionId.value) return
	await submissionsResource.submit({ session: resolvedSessionId.value })
}

const submissions = computed(() => (submissionsResource.data || []).map(s => ({
	id: s.name,
	student_id: s.student,
	sbd: s.student_sbd,
	name: s.student_name || s.student,
	score: s.score,
	status: (s.status || '').toLowerCase() || 'pending',
	paper_images: s.paper_images || [s.paper_image],
	text_content: s.text_content,
	ai_feedback: s.ai_feedback,
})))

const filteredSubmissions = computed(() => {
	if (!searchQuery.value) return submissions.value
	const q = searchQuery.value.toLowerCase()
	return submissions.value.filter(s => s.name.toLowerCase().includes(q) || (s.sbd || '').toLowerCase().includes(q))
})

const currentSub = computed(() => filteredSubmissions.value[currentIdx.value])

const parsedFeedback = computed(() => {
  if (!currentSub.value?.ai_feedback) return null
  try {
    const raw = currentSub.value.ai_feedback
    if (typeof raw === 'object') return raw
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      return JSON.parse(raw)
    }
    return null
  } catch (e) {
    return null
  }
})

const activeCriteria = ref([])

watch([() => parsedFeedback.value, () => currentSub.value?.id], ([fb, subId]) => {
  if (!fb) {
    if (currentSub.value?.criteria_scores) {
      try {
        const raw = currentSub.value.criteria_scores
        let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        activeCriteria.value = Array.isArray(parsed) ? JSON.parse(JSON.stringify(parsed)) : []
        return
      } catch (e) {}
    }
    activeCriteria.value = []
    return
  }

  // Tier 4 Multi-Expert Pipeline (Mixed/MCQ/Solution)
  let results = []
  
  // MCQ Results
  if (Array.isArray(fb.mcq_results)) {
    fb.mcq_results.forEach(m => {
      results.push({
        name: m.question_no || __('MCQ Question'),
        score: m.score || 0,
        max: m.max_score || 0.25,
        note: m.details?.map(d => `${d.label}: ${d.feedback || (d.is_correct ? 'Correct' : 'Incorrect')}`).join("; ") || ""
      })
    })
  }

  // Solution/Essay Results
  if (Array.isArray(fb.solution_results)) {
    fb.solution_results.forEach(s => {
      results.push({
        name: s.question_no || __('Solution Question'),
        score: s.score || 0,
        max: s.max_score || 1.0,
        note: s.feedback || ""
      })
    })
  }

  if (results.length > 0) {
    if (Array.isArray(fb.criteria_results)) {
      results = results.concat(fb.criteria_results)
    } else if (Array.isArray(fb.criteria)) {
      results = results.concat(fb.criteria)
    }
    activeCriteria.value = JSON.parse(JSON.stringify(results))
    return
  }

  // Standard criteria/results fallback
  if (Array.isArray(fb.criteria_results)) {
    activeCriteria.value = JSON.parse(JSON.stringify(fb.criteria_results))
    return
  }
  if (Array.isArray(fb.criteria)) {
    activeCriteria.value = JSON.parse(JSON.stringify(fb.criteria))
    return
  }

  activeCriteria.value = []
}, { immediate: true })

const paperImages = computed(() => {
  const images = currentSub.value?.paper_images || []
  return images.map(img => typeof img === 'string' ? img : img.file_url).filter(Boolean)
})
const currentPaperImage = computed(() => paperImages.value[paperPageIndex.value] || '')
const hasMultiplePaperImages = computed(() => paperImages.value.length > 1)

const approvedCount = computed(() => submissions.value.filter(s => s.status?.toLowerCase() === 'done').length)
const flagCount = computed(() => submissions.value.filter(s => ['flag', 'flagged'].includes(s.status?.toLowerCase())).length)
const progressPercent = computed(() => submissions.value.length ? Math.round((approvedCount.value / submissions.value.length) * 100) : 0)

const totalScore = computed(() => {
	if (activeCriteria.value && activeCriteria.value.length > 0) {
		return activeCriteria.value.reduce((sum, c) => sum + (Number(c.score) || 0), 0)
	}
	if (parsedFeedback.value?.total_score != null) return parsedFeedback.value.total_score
	return 0
})

const feedback = computed(() => {
	return parsedFeedback.value?.overall_feedback || parsedFeedback.value?.summary || currentSub.value?.ai_feedback || ''
})

const manualFeedback = ref('')
watch(() => currentSub.value?.id, () => {
	manualFeedback.value = feedback.value
}, { immediate: true })

function tagClass(status) {
	const map = {
		done: 'bg-blue-600 text-white',
		grading: 'bg-amber-100 text-amber-900 border border-amber-300',
		flag: 'bg-rose-50 text-rose-700 border border-rose-200',
		flagged: 'bg-rose-50 text-rose-700 border border-rose-200',
		failed: 'bg-red-100 text-red-800 border border-red-300',
		pending: 'bg-gray-100 text-gray-400',
	}
	return map[status] || map.pending
}

function statusLabel(status) {
	const map = { done: __('Approved'), grading: __('Grading'), flagged: __('Flagged'), flag: __('Flagged'), failed: __('Failed'), pending: __('Pending') }
	return map[status] || status
}

function prevPaperPage() { if (paperPageIndex.value > 0) paperPageIndex.value-- }
function nextPaperPage() { if (paperPageIndex.value < paperImages.value.length - 1) paperPageIndex.value++ }

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
    // Gọi API và ĐỢI (await) cho đến khi xong
    const res = await startGradingResource.submit({
      submission: submissionId
    })
    
    // Khởi động polling ngay lập tức
    pollGradingStatus(submissionId)
    
    // Khi có kết quả (hoặc timeout), nạp lại dữ liệu
    await loadSubmissions()
    
    if (res && res.success) {
      frappe.show_alert({ message: __('Grading Started'), indicator: 'green' })
    }
  } catch (e) {
    console.error('Grading error:', e)
    frappe.show_alert({ 
      message: __('Connection error or Timeout. AI is still running in the background, please wait or reload the page.'), 
      indicator: 'orange' 
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
        
        // TỰ ĐỘNG HIỆN KẾT QUẢ: Nạp lại dữ liệu thật từ server
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
  if (!confirm(__('Are you sure you want to start grading this student?'))) return
  currentIdx.value = filteredSubmissions.value.findIndex(s => s.id === sub.id)
  await gradeCurrent()
}

function handleEditSubmission(sub) {
  editingStudent.id = sub.id
  editingStudent.name = sub.name
  editingStudent.sbd = sub.sbd
  editingStudent.images = sub.paper_images ? JSON.parse(JSON.stringify(sub.paper_images)) : []
  editingStudent.newImages = []
  showEditStudentModal.value = true
}
async function addStudent() {
	if (!newStudent.name && !newStudent.sbd && !newStudent.email) {
		frappe.show_alert({ message: __('Please enter at least one piece of student information (Name, SBD, or Email)'), indicator: 'orange' })
		return
	}
	if (!resolvedSessionId.value || isAddingStudent.value) return
	isAddingStudent.value = true
	try {
		const imageFiles = newStudent.images.filter(i => i.file).map(i => i.file)
		const paperImagesData = await Promise.all(imageFiles.map(f => fileToDataUrl(f)))
		const paperImagesNames = imageFiles.map(f => f.name)

		await addSubmissionResource.submit({
			session: resolvedSessionId.value,
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
		showAddStudentModal.value = false
		await loadSubmissions()
	} catch (e) {
		console.error(e)
	} finally {
		isAddingStudent.value = false
	}
}

async function saveEditedStudent() {
	if (!editingStudent.id || isSavingStudent.value) return
	isSavingStudent.value = true
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

			await createResource({ url: 'lms.lms.services.ai_grading.api.upload_ai_grading_submission_attachments', auto: false }).submit({
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
  if (!confirm(__('Are you sure you want to delete this student?'))) return
  await createResource({
    url: 'frappe.client.delete',
    auto: false
  }).submit({
    doctype: 'AI Grading Submission',
    name: sub.id
  })
  await loadSubmissions()
}

async function runBatchGrading() {
  if (isBatchGrading.value || !resolvedSessionId.value) return
  if (!confirm(__('Are you sure you want to grade THE ENTIRE work in this session?'))) return
  isBatchGrading.value = true
  
  // Hiển thị spinner ngay lập tức cho các bài đang pending/failed
  submissions.value.forEach(s => {
    if (['pending', 'failed', 'flagged'].includes(s.status)) {
      s.status = 'grading'
    }
  })

  try {
    const res = await startBatchGradingResource.submit({ 
      session: resolvedSessionId.value 
    })
    if (res && res.submission_ids && res.submission_ids.length > 0) {
      frappe.show_alert({ message: __('Batch marking in progress...'), indicator: 'blue' })
      res.submission_ids.forEach(id => pollGradingStatus(id))
    } else if (res && res.message) {
      frappe.show_alert({ message: res.message, indicator: 'orange' })
    } else {
      frappe.show_alert({ message: __('No pending papers found or limit reached.'), indicator: 'orange' })
    }
    await loadSubmissions()
  } catch (e) {
    console.error(e)
  } finally {
    isBatchGrading.value = false
  }
}

function approveAndNext() {
	saveCurrent('Done')
	if (currentIdx.value < filteredSubmissions.value.length - 1) {
		currentIdx.value++
	}
}

async function saveCurrent(targetStatus = 'Done') {
	if (!currentSub.value || isApproving.value) return
	
	const result = parsedFeedback.value ? { ...parsedFeedback.value } : {}
	
	let offset = 0
	if (Array.isArray(result.mcq_results)) {
		result.mcq_results = activeCriteria.value.slice(offset, offset + result.mcq_results.length)
		offset += result.mcq_results.length
	}
	if (Array.isArray(result.solution_results)) {
		result.solution_results = activeCriteria.value.slice(offset, offset + result.solution_results.length)
		offset += result.solution_results.length
	}
	if (Array.isArray(result.criteria_results)) {
		result.criteria_results = activeCriteria.value.slice(offset, offset + result.criteria_results.length)
		offset += result.criteria_results.length
	} else if (!result.mcq_results && !result.solution_results && activeCriteria.value.length > 0) {
		result.criteria_results = activeCriteria.value
	}

	result.total_score = totalScore.value
	result.overall_feedback = manualFeedback.value
	
	isApproving.value = true
	try {
		await saveResultResource.submit({
			submission_id: currentSub.value.id,
			data: {
				score: totalScore.value,
				criteria_scores: JSON.stringify(activeCriteria.value),
				ai_feedback: JSON.stringify(result),
				status: targetStatus
			}
		})
		if (targetStatus === 'Flagged') {
			frappe.show_alert({ message: __('Flagged {0} \'s post').format(currentSub.value.name), indicator: 'orange' })
		} else if (targetStatus === 'Done') {
			frappe.show_alert({ message: __('Approved {0} \'s post').format(currentSub.value.name), indicator: 'green' })
		} else {
			frappe.show_alert({ message: __('Saved {0} \'s post').format(currentSub.value.name), indicator: 'blue' })
		}
		await loadSubmissions()
	} catch (e) {
		console.error(e)
	} finally {
		isApproving.value = false
	}
}

function flagCurrent() {
	saveCurrent('Flagged')
}

function exportGrades() {
	if (!submissions.value || submissions.value.length === 0) {
		frappe.msgprint(__('No data to export'))
		return
	}
	let csv = '\uFEFF'
	csv += 'ID,Họ và tên,Trạng thái,Điểm\n'
	submissions.value.forEach(s => {
		const score = s.score != null ? s.score : ''
		const name = s.name ? s.name.replace(/"/g, '""') : ''
		csv += `${s.id || ''},"${name}","${s.status || ''}",${score}\n`
	})
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.setAttribute('href', url)
	link.setAttribute('download', `Grades_Essay_${sessionDoc.value?.name || 'export'}.csv`)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

async function saveAllToDatabase() {
	frappe.show_alert({ message: __('Data has been synced automatically.'), indicator: 'blue' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
</style>
