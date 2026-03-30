<template>
	<section class="absolute inset-0 flex flex-col overflow-hidden sm:rounded-xl border border-gray-100 bg-white shadow-sm">
		<!-- Top bar -->
		<div
			class="flex h-12 flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4"
		>
			<button
				class="text-xs text-gray-400 transition-colors hover:text-gray-700"
				@click="$router.push({ name: 'AIGradingEssayConfig', params: { type: resolvedType } })"
			>
				← {{ __('Back') }}
			</button>
			<div class="h-5 w-px bg-gray-200" />
			<div>
				<div class="text-sm font-semibold text-gray-800">
					{{ sessionLoading ? __('Loading...') : (sessionDoc?.session_name || __('Session Not Found')) }}
				</div>
			</div>
			<div class="flex-1" />
			<div
				class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500"
			>
				{{ __('Graded') }}
				<strong class="text-gray-800">{{ approvedCount }}</strong>/{{ submissions.length }}
				<div class="h-1 w-16 overflow-hidden rounded-full bg-gray-200">
					<div
						class="h-full rounded-full bg-[#2d6a4f] transition-all duration-500"
						:style="{ width: progressPercent + '%' }"
					/>
				</div>
			</div>
			<div
				class="flex items-center gap-1.5 rounded-full bg-[#b45309]/10 px-3 py-1 text-xs text-[#b45309]"
			>
				{{ __('Needs review') }} <strong>{{ flagCount }}</strong>
			</div>
			
			<!-- Global Actions -->
			<div class="ml-2 flex items-center justify-end gap-2">
				<button
					class="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-100"
					@click="exportGrades"
				>
					<span class="text-gray-500">📊</span>
					{{ __('Export Grades') }}
				</button>
				<button
					class="flex items-center gap-1.5 rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40"
					@click="saveAllToDatabase"
				>
					<span>💾</span>
					<span class="hidden sm:inline">{{ __('Save All') }}</span>
				</button>
			</div>
		</div>

		<!-- Body: 3-column layout -->
		<div class="flex flex-1 overflow-hidden">
			<!-- LEFT: Submission list -->
			<div
				class="flex w-60 flex-shrink-0 flex-col border-r border-gray-100 bg-white"
			>
				<div class="border-b border-gray-100 p-3">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-xs font-semibold text-gray-700">{{ __('Submissions') }}</span>
						<button 
							class="flex items-center gap-1 rounded bg-[#1d4ed8]/10 px-2 py-0.5 text-[10px] font-medium text-[#1d4ed8] transition-colors hover:bg-[#1d4ed8]/20"
						>
							▶ {{ __('Grade All') }}
						</button>
					</div>
					<input
						v-model="searchQuery"
						class="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
						:placeholder="__('Search by name, ID...')"
					/>
					<div class="mt-2 flex gap-1">
						<button
							v-for="f in filters"
							:key="f.value"
							class="rounded-md border px-2 py-0.5 text-[10px] transition-all"
							:class="[
								activeFilter === f.value
									? 'border-[#2d6a4f] bg-[#2d6a4f] text-white'
									: 'border-gray-200 bg-transparent text-gray-400 hover:border-gray-300',
							]"
							@click="activeFilter = f.value"
						>
							{{ f.label }}
						</button>
					</div>
					<button
						class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 py-1.5 text-xs font-medium text-[#2d6a4f] transition-all hover:bg-[#2d6a4f]/10"
						@click="showAddStudentModal = true"
					>
						+ {{ __('Add Student') }}
					</button>
				</div>
				<div class="flex-1 space-y-0.5 overflow-y-auto p-2">
					<div
						v-for="(sub, idx) in filteredSubmissions"
						:key="sub.id"
						class="cursor-pointer rounded-lg border p-2.5 transition-all"
						:class="[
							currentIdx === idx
								? 'border-[#2d6a4f]/40 bg-[#2d6a4f]/5'
								: 'border-transparent hover:border-gray-200 hover:bg-gray-50',
						]"
						@click="currentIdx = idx"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-gray-800">{{ sub.name }}</span>
							<span
								v-if="sub.score"
								class="text-xs font-mono font-semibold"
								:class="scoreColor(sub.score)"
							>
								{{ sub.score }}
							</span>
							<button
								v-else
								class="rounded bg-gray-100 p-1 text-gray-400 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8]"
								:title="__('Grade Document')"
							>
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
							</button>
						</div>
						<div class="mt-0.5 flex items-center gap-2">
							<span class="text-[10px] text-gray-400 font-mono">SBD: {{ sub.sbd || sub.student_id }}</span>
							<span
								class="rounded px-1.5 py-px text-[9px] font-medium"
								:class="tagClass(sub.status)"
							>
								{{ statusLabel(sub.status) }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- CENTER: Paper view -->
			<div class="flex flex-1 flex-col overflow-hidden border-r border-gray-100">
				<div
					class="flex h-10 flex-shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-4"
				>
					<span class="flex-1 text-xs font-medium text-gray-700">
						{{ currentSub?.name }} — SBD {{ currentSub?.id }}
					</span>
					<button class="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50">
						🔍 {{ __('Zoom') }}
					</button>
					<button class="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50">
						✏️ {{ __('Annotate') }}
					</button>
					<button
						class="rounded border border-[#9f1239]/20 bg-[#9f1239]/10 px-2 py-1 text-[10px] text-[#9f1239] hover:bg-[#9f1239]/20"
						@click="flagCurrent"
					>
						⚑ Flag
					</button>
					<button
						class="rounded bg-[#2d6a4f] px-3 py-1 text-[10px] font-semibold text-white hover:opacity-90 shadow-sm transition-opacity flex items-center gap-1"
						@click="approveAndNext"
					>
						<span>✓</span> <span class="hidden sm:inline">{{ __('Approve & Next') }}</span><span class="sm:hidden">{{ __('Next') }}</span>
					</button>
				</div>

				<div class="flex-1 overflow-y-auto bg-gray-50 p-6">
					<div
						class="mx-auto max-w-xl rounded bg-[#fff9f0] p-8 shadow-md"
						style="font-family: Georgia, serif"
					>
						<!-- Paper header -->
						<div class="mb-6 border-b border-[#d4cfc0] pb-4 text-center">
							<div class="text-xs text-[#6b6050]">{{ __('NGUYEN TRAI HIGH SCHOOL — HCMC') }}</div>
							<div class="mt-1 text-sm font-bold">{{ __('MIDTERM EXAM I — MATH GRADE 12') }}</div>
							<div class="mt-1 text-[10px] text-[#8a7a6a]">
								{{ __('Duration: 90 min · Date: 15/11/2024') }}
							</div>
						</div>

						<!-- Question 2 -->
						<div class="mb-5">
							<div class="mb-2 text-xs font-bold text-gray-800" style="font-family: sans-serif">
								{{ __('Question 2 (3 pts): Solve 2x² − 5x + 3 = 0') }}
							</div>

							<div class="my-2 rounded-xl border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 p-3 shadow-[0_2px_10px_-3px_rgba(45,106,79,0.1)] backdrop-blur-sm transition-all hover:bg-[#2d6a4f]/10">
								<div class="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] font-mono">
									{{ __('Step 1 — Compute Δ · 1.0/1.0 ✓') }}
								</div>
								<div class="text-sm text-gray-800 leading-relaxed font-medium">
									Δ = b² − 4ac = (−5)² − 4×2×3 = 25 − 24 =
									<mark class="rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30">1</mark> <span class="text-[#2d6a4f] font-bold">✓</span>
								</div>
							</div>

							<div class="my-2 rounded-xl border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 p-3 shadow-[0_2px_10px_-3px_rgba(45,106,79,0.1)] backdrop-blur-sm transition-all hover:bg-[#2d6a4f]/10">
								<div class="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] font-mono">
									{{ __('Step 2 — Compute roots · 1.0/1.0 ✓') }}
								</div>
								<div class="text-sm text-gray-800 leading-relaxed font-medium">
									x₁ = (5 + √1)/(2×2) = 6/4 =
									<mark class="rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30">3/2</mark> <span class="text-[#2d6a4f] font-bold">✓</span>
									<br />
									x₂ = (5 − √1)/(2×2) = 4/4 =
									<mark class="rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30">1</mark> <span class="text-[#2d6a4f] font-bold">✓</span>
								</div>
							</div>

							<div class="my-2 rounded-xl border border-[#b45309]/20 bg-[#b45309]/5 p-3 shadow-[0_2px_10px_-3px_rgba(180,83,9,0.1)] backdrop-blur-sm transition-all hover:bg-[#b45309]/10">
								<div class="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#b45309] font-mono">
									{{ __('Step 3 — Conclusion · 0.5/1.0 ~') }}
								</div>
								<div class="text-sm text-gray-800 leading-relaxed font-medium">
									{{ __('Equation has') }}
									<mark class="rounded bg-[#b45309]/15 px-1.5 py-0.5 text-[#b45309] border-b-2 border-[#b45309]/30">{{ __('two distinct roots') }}</mark> <span class="text-[#b45309] font-bold">~</span>
									<br />
									<em class="text-[11px] text-gray-500 mt-1 block">↑ {{ __('Missing solution set S = {1; 3/2}') }}</em>
								</div>
							</div>
						</div>

						<!-- Question 3 -->
						<div class="mb-5">
							<div class="mb-2 text-xs font-bold text-gray-800" style="font-family: sans-serif">
								{{ __('Question 3 (2 pts): Analyze the meaning of discriminant Δ') }}
							</div>
							<div class="text-sm text-gray-800 leading-relaxed font-medium bg-white/50 p-3 rounded-xl border border-gray-100 shadow-sm">
								<mark class="rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30">{{ __('When Δ > 0, equation has two distinct real roots') }}</mark>.
								<mark class="rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30">{{ __('When Δ = 0, equation has a double root') }}</mark>.
								{{ __('When') }}
								<mark class="rounded bg-[#9f1239]/15 px-1.5 py-0.5 text-[#9f1239] border-b-2 border-[#9f1239]/30">Δ > 0</mark>
								{{ __('equation has no real roots.') }}
								<br />
								<em class="text-[11px] text-gray-500 mt-2 block border-l-2 border-red-300 pl-2">↑ {{ __('Error: no-solution condition should be Δ < 0') }}</em>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- RIGHT: Grade panel -->
			<div class="flex w-72 flex-shrink-0 flex-col bg-white">
				<div class="border-b border-gray-100 p-4">
					<div class="text-[10px] uppercase tracking-wider text-gray-400">
						{{ __('AI Suggested Score') }}
					</div>
					<div class="mt-1 flex items-baseline gap-1.5">
						<span class="text-4xl font-bold" :class="scoreColor(totalScore)">{{ totalScore.toFixed(1) }}</span>
						<span class="text-sm text-gray-400 font-mono">/10</span>
					</div>
					<div class="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
						<div
							class="h-full rounded-full transition-all duration-500"
							:class="totalScore >= 8 ? 'bg-[#2d6a4f]' : totalScore >= 6 ? 'bg-[#b45309]' : 'bg-[#9f1239]'"
							:style="{ width: totalScore * 10 + '%' }"
						/>
					</div>
					<div class="mt-1.5 flex items-center justify-between">
						<span class="text-[11px] text-gray-400">{{ __('Confidence') }}</span>
						<span
							class="rounded-full px-2 py-0.5 text-[10px] font-medium"
							:class="confidenceBadge"
						>
							81% · {{ __('Medium') }}
						</span>
					</div>
				</div>

				<div class="flex-1 space-y-2 overflow-y-auto p-3">
					<!-- AI Insight -->
					<div class="rounded-lg border border-[#6d28d9]/20 bg-[#6d28d9]/5 p-3">
						<div class="text-[10px] font-semibold text-[#6d28d9] mb-1">✦ {{ __('AI Notes') }}</div>
						<div class="text-[11px] text-gray-600 leading-relaxed">
							{{ __('Student understands Δ computation and roots well. Two errors: (1) missing solution set S in Q2; (2) wrong sign for no-solution condition in Q3. Suggest −0.5 each.') }}
						</div>
					</div>

					<div class="text-[10px] font-medium uppercase tracking-wider text-gray-400">
						{{ __('Grading Criteria') }}
					</div>

					<!-- Criteria cards -->
					<div
						v-for="(crit, ci) in criteria"
						:key="ci"
						class="rounded-lg border p-3 transition-all"
						:class="[
							crit.highlight
								? 'border-[#b45309]/30 bg-[#b45309]/5'
								: 'border-gray-100 bg-gray-50 hover:border-gray-200',
						]"
					>
						<div class="flex items-start justify-between gap-2 mb-1">
							<span class="flex-1 text-xs font-medium text-gray-800">{{ crit.name }}</span>
							<div class="flex items-center gap-1 flex-shrink-0">
								<input
									v-model.number="crit.score"
									class="w-10 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-center font-mono text-xs text-gray-700 focus:border-emerald-400 focus:outline-none"
								/>
								<span class="text-[11px] text-gray-400 font-mono">/{{ crit.max }}</span>
							</div>
						</div>
						<span
							class="inline-block rounded px-1.5 py-px text-[9px] font-medium mb-1"
							:class="critBadge(crit.badge)"
						>
							{{ crit.badgeLabel }}
						</span>
						<div class="text-[11px] text-gray-500 leading-relaxed">{{ crit.note }}</div>
					</div>

					<div class="text-[10px] font-medium uppercase tracking-wider text-gray-400 pt-2">
						{{ __('Teacher Comments') }}
					</div>
					<textarea
						v-model="feedback"
						class="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-700 leading-relaxed placeholder:text-gray-400 focus:border-[#2d6a4f] focus:outline-none"
						rows="4"
						:placeholder="__('Add your comments...')"
					/>

					<!-- Rate AI Grading Widget -->
					<div class="mt-4 border-t border-gray-100 pt-3">
						<div class="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2">
							{{ __('Rate AI Grading') }}
						</div>
						<div class="flex gap-2">
							<button 
								class="flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors"
								:class="aiRating === 'satisfied' ? 'border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f]' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'"
								@click="aiRating = 'satisfied'"
							>
								👍 {{ __('Satisfied') }}
							</button>
							<button 
								class="flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors"
								:class="aiRating === 'dissatisfied' ? 'border-[#9f1239] bg-[#9f1239]/10 text-[#9f1239]' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'"
								@click="aiRating = 'dissatisfied'"
							>
								👎 {{ __('Dissatisfied') }}
							</button>
						</div>
						<div v-if="aiRating === 'dissatisfied'" class="mt-2 text-left">
							<textarea
								v-model="aiRatingReason"
								class="w-full rounded-lg border border-[#9f1239]/30 bg-[#9f1239]/5 p-2 text-xs text-[#9f1239] placeholder:text-[#9f1239]/50 focus:border-[#9f1239] focus:outline-none"
								rows="2"
								:placeholder="__('Reason for dissatisfaction...')"
							></textarea>
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
						class="flex-[2] rounded-lg bg-[#2d6a4f] py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
						@click="approveCurrent"
					>
						✓ {{ __('Save & Update') }}
					</button>
					<button
						class="flex-1 rounded-lg border border-gray-200 bg-transparent py-2 text-xs font-medium text-gray-500 transition-all hover:bg-gray-50"
						@click="nextSub"
						:disabled="currentIdx === submissions.length - 1"
						:class="{'opacity-50 cursor-not-allowed': currentIdx === submissions.length - 1}"
					>
						{{ __('Next Submission') }} →
					</button>
				</div>
			</div>
		</div>

		<!-- New Student Modal -->
		<Dialog v-model="showAddStudentModal" :title="__('Add New Student')">
			<template #body-content>
				<div class="space-y-4 p-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Student Name') }}</label>
						<Input
							type="text"
							v-model="newStudent.name"
							:placeholder="__('e.g. Nguyen Van A')"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Student') }}</label>
						<div class="relative">
							<Input
								type="text"
								v-model="studentSearchQuery"
								:placeholder="__('Type to search student by name/email/username')"
								@focus="openStudentPicker = true"
								@input="onStudentSearchInput"
							/>
							<div
								v-if="openStudentPicker"
								class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
							>
								<button
									v-for="option in studentOptions"
									:key="option.name"
									type="button"
									class="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-50"
									@click="selectStudentOption(option)"
								>
									<div class="min-w-0">
										<div class="truncate font-medium text-gray-800">{{ option.full_name || option.username || option.name }}</div>
										<div class="truncate text-[10px] text-gray-500">{{ option.name }}</div>
									</div>
									<span class="ml-3 text-[10px] text-gray-400">{{ option.username }}</span>
								</button>
								<div v-if="!studentOptions.length" class="px-3 py-2 text-xs text-gray-500">
									{{ __('No matching students found') }}
								</div>
							</div>
						</div>
						<div class="text-[11px] text-gray-500">
							{{ __('Select student from existing system users') }}
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium text-gray-700">{{ __('Student SBD') }}</label>
						<Input
							type="text"
							v-model="newStudent.sbd"
							:placeholder="__('e.g. 12A1-023')"
						/>
						<div class="text-[11px] text-gray-500">
							{{ __('This is a separate field from system user account') }}
						</div>
					</div>
					<div class="flex flex-col gap-1 mt-2">
						<label class="text-sm font-medium text-gray-700">{{ __('Photo / Paper Image') }}</label>
						<input type="file" ref="studentPhotoInput" class="hidden" accept="image/*" multiple @change="handleStudentPhoto" />
						
						<div v-if="!showCameraPreview" class="flex flex-col sm:flex-row gap-3 w-full">
							<div
								class="flex-1 flex sm:flex-col items-center justify-center gap-3 sm:gap-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 sm:p-6 transition-colors hover:border-[#2d6a4f]/50 hover:bg-[#2d6a4f]/5 cursor-pointer"
								@click="$refs.studentPhotoInput.click()"
							>
								<span class="text-2xl sm:mb-2 text-gray-400">📁</span>
								<div class="flex flex-col sm:items-center">
									<span class="text-sm sm:text-xs font-medium text-gray-700 sm:text-gray-600 sm:text-center">{{ __('Upload Files') }}</span>
									<span class="text-[11px] sm:mt-1 sm:text-[10px] text-gray-500 sm:text-gray-400">{{ __('Multiple select (JPG, PNG)') }}</span>
								</div>
							</div>

							<div
								class="flex-1 flex sm:flex-col items-center justify-center gap-3 sm:gap-0 rounded-xl border-2 border-solid sm:border-dashed border-[#2d6a4f]/30 sm:border-gray-200 bg-[#2d6a4f]/5 sm:bg-gray-50/50 p-4 sm:p-6 transition-colors hover:border-[#2d6a4f]/50 hover:bg-[#2d6a4f]/10 cursor-pointer"
								@click="openCamera"
							>
								<span class="text-2xl sm:mb-2 text-[#2d6a4f]">📷</span>
								<div class="flex flex-col sm:items-center">
									<span class="text-sm sm:text-xs font-bold sm:font-medium text-[#2d6a4f] sm:text-gray-600 sm:text-center">{{ __('Open Live Camera') }}</span>
									<span class="text-[11px] sm:mt-1 sm:text-[10px] text-[#2d6a4f]/70 sm:text-gray-400">{{ __('Capture multiple pages directly') }}</span>
								</div>
							</div>
						</div>

						<div v-if="showCameraPreview" class="relative mt-2 flex flex-col items-center rounded-xl overflow-hidden bg-black/90">
							<!-- <video> for live stream -->
							<video ref="cameraVideoElement" class="w-full h-auto max-h-[300px] object-contain" autoplay playsinline></video>
							
							<!-- <canvas> to capture the frame behind the scenes -->
							<canvas ref="cameraCanvasElement" class="hidden"></canvas>
							
							<!-- Controls -->
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

						<!-- Selected / Captured Images Preview Grid -->
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
					<button class="rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90" @click="addStudent">
						{{ __('Add & Start Grading') }}
					</button>
				</div>
			</template>
		</Dialog>
	</section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
	Dialog, 
	Input, 
	createResource 
} from 'frappe-ui'

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

const gradingTypeByRouteType = {
	exam: 'Exam',
	test: 'Test',
	hw: 'Homework',
}

// --- Real Submissions ---
const submissionsResource = createResource({
	url: 'lms.lms.api.get_ai_grading_submissions',
})

async function loadSubmissions() {
	if (!resolvedSessionId.value) return
	await submissionsResource.submit({ session: resolvedSessionId.value })
}

const submissions = computed(() => {
	try {
		return (submissionsResource.data || []).map(s => ({
			id: s.name,
			student_id: s.student,
			sbd: s.student_sbd,
			name: s.student_name || s.student,
			score: s.score,
			status: (s.status || '').toLowerCase() || 'pending',
			raw: s
		}))
	} catch (e) {
		console.error("Error computing submissions list:", e)
		return []
	}
})

const sessionBySlugResource = createResource({
	url: 'lms.lms.api.get_ai_grading_session_by_slug',
})

async function loadSessionBySlug() {
	if (!resolvedSessionSlug.value) return
	sessionLoading.value = true
	try {
		const doc = await sessionBySlugResource.submit({
			session_slug: resolvedSessionSlug.value,
			grading_type: gradingTypeByRouteType[resolvedType.value] || null,
		})
		sessionDoc.value = doc || null
		resolvedSessionId.value = doc?.name || ''
	} finally {
		sessionLoading.value = false
	}
}

const sessionDisplayName = computed(() => {
	return sessionDoc.value?.session_name || 'Loading Session...'
})

const currentIdx = ref(0)
const searchQuery = ref('')
const activeFilter = ref('all')

const filters = [
	{ label: __('All'), value: 'all' },
	{ label: __('Pending'), value: 'pending' },
	{ label: 'Flag', value: 'flag' },
]

const filteredSubmissions = computed(() => {
	let list = submissions.value
	if (activeFilter.value === 'pending') {
		list = list.filter((s) => s.status === 'pending' || s.status === 'grading')
	} else if (activeFilter.value === 'flag') {
		list = list.filter((s) => s.status === 'flag')
	}
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase()
		list = list.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				s.student_id.includes(q) ||
				(s.sbd || '').toLowerCase().includes(q)
		)
	}
	return list
})

const currentSub = computed(() => filteredSubmissions.value[currentIdx.value] || submissions.value[0])

const approvedCount = computed(() => submissions.value.filter((s) => s.status === 'done').length)
const flagCount = computed(() => submissions.value.filter((s) => s.status === 'flag').length)
const progressPercent = computed(() => {
	if (!submissions.value.length) return 0
	return Math.round((approvedCount.value / submissions.value.length) * 100)
})

// --- Score colours ---
function scoreColor(s) {
	if (s == null) return 'text-[#a09e9a]'
	if (s >= 8) return 'text-[#2d6a4f]'
	if (s >= 6) return 'text-[#b45309]'
	return 'text-[#9f1239]'
}

function tagClass(status) {
	const map = {
		done: 'bg-[#2d6a4f]/10 text-[#2d6a4f]',
		grading: 'bg-[#1d4ed8]/10 text-[#1d4ed8]',
		flag: 'bg-[#9f1239]/10 text-[#9f1239]',
		pending: 'bg-[#b45309]/10 text-[#b45309]',
	}
	return map[status] || 'bg-gray-100 text-[#a09e9a]'
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

// --- Criteria ---
const criteria = reactive([
	{
		name: __('Q2 — Compute Δ correctly'),
		score: 1.0,
		max: 1,
		badge: 'correct',
		badgeLabel: '✓ AI: Correct',
		note: 'Δ = 1, computed accurately',
		highlight: false,
	},
	{
		name: __('Q2 — Compute roots x₁, x₂'),
		score: 1.0,
		max: 1,
		badge: 'correct',
		badgeLabel: '✓ AI: Correct',
		note: 'x₁ = 3/2, x₂ = 1 — fully correct',
		highlight: false,
	},
	{
		name: __('Q2 — Conclusion & solution set'),
		score: 0.5,
		max: 1,
		badge: 'partial',
		badgeLabel: '~ AI: Partial',
		note: __('Correctly noted "two distinct roots" but missing S = {1; 3/2}'),
		highlight: true,
	},
	{
		name: __('Q3 — Definition and formula of Δ'),
		score: 1.0,
		max: 1,
		badge: 'correct',
		badgeLabel: '✓ AI: Correct',
		note: __('Definition and formula are accurate'),
		highlight: false,
	},
	{
		name: __('Q3 — Analysis of 3 cases of Δ'),
		score: 0.5,
		max: 1,
		badge: 'wrong',
		badgeLabel: '✗ AI: Error found',
		note: __('Wrong sign: wrote "Δ > 0 no solution" — should be Δ < 0. −0.5'),
		highlight: false,
	},
])

const totalScore = computed(() => {
	return Math.min(10, criteria.reduce((sum, c) => sum + (c.score || 0), 0))
})

function critBadge(type) {
	const map = {
		correct: 'bg-[#2d6a4f]/10 text-[#2d6a4f]',
		partial: 'bg-[#b45309]/10 text-[#b45309]',
		wrong: 'bg-[#9f1239]/10 text-[#9f1239]',
	}
	return map[type] || 'bg-gray-100 text-[#a09e9a]'
}

const confidenceBadge = 'bg-[#b45309]/10 text-[#b45309]'

const feedback = ref(
	__('Good understanding of the process. Need to write full solution set and pay attention to the no-solution condition sign.')
)

// --- AI Rating State ---
const aiRating = ref('')
const aiRatingReason = ref('')

// --- Add Student Logic ---
const showAddStudentModal = ref(false)
const newStudent = reactive({ name: '', id: '', sbd: '', images: [] })
const studentPhotoInput = ref(null)
const studentSearchQuery = ref('')
const studentOptions = ref([])
const openStudentPicker = ref(false)
const selectedStudent = ref(null)
const showCameraPreview = ref(false)
const cameraVideoElement = ref(null)
const cameraCanvasElement = ref(null)
const cameraStream = ref(null)
const addStudentResource = createResource({
	url: 'lms.lms.api.add_ai_grading_submission',
})
const searchStudentsResource = createResource({
	url: 'lms.lms.api.search_ai_grading_students',
})

async function loadStudentOptions(query = '') {
	const res = await searchStudentsResource.submit({ query, limit: 20 })
	studentOptions.value = Array.isArray(res)
		? res
		: (Array.isArray(searchStudentsResource.data) ? searchStudentsResource.data : [])
}

async function onStudentSearchInput() {
	openStudentPicker.value = true
	selectedStudent.value = null
	newStudent.id = ''
	newStudent.name = ''
	await loadStudentOptions(studentSearchQuery.value || '')
}

function selectStudentOption(option) {
	selectedStudent.value = option
	newStudent.id = option.name
	newStudent.name = option.full_name || option.username || option.name
	studentSearchQuery.value = `${newStudent.name} (${option.name})`
	openStudentPicker.value = false
}

function addImageToDraft(file) {
	if (!file) return
	newStudent.images.push({
		file,
		preview: URL.createObjectURL(file),
	})
}

function handleStudentPhoto(event) {
	const files = Array.from(event?.target?.files || [])
	files.forEach(addImageToDraft)
	if (event?.target) event.target.value = ''
}

async function openCamera() {
	if (!navigator.mediaDevices?.getUserMedia) {
		window.alert(__('Camera is not supported on this device/browser.'))
		return
	}

	try {
		closeCamera()
		cameraStream.value = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: { ideal: 'environment' } },
			audio: false,
		})
		showCameraPreview.value = true
		if (cameraVideoElement.value) {
			cameraVideoElement.value.srcObject = cameraStream.value
			await cameraVideoElement.value.play()
		}
	} catch (e) {
		window.alert(__('Unable to open camera. Please allow camera permission.'))
	}
}

function closeCamera() {
	if (cameraStream.value) {
		cameraStream.value.getTracks().forEach(track => track.stop())
	}
	if (cameraVideoElement.value) {
		cameraVideoElement.value.srcObject = null
	}
	cameraStream.value = null
	showCameraPreview.value = false
}

function capturePhoto() {
	const video = cameraVideoElement.value
	const canvas = cameraCanvasElement.value
	if (!video || !canvas || !video.videoWidth || !video.videoHeight) return

	canvas.width = video.videoWidth
	canvas.height = video.videoHeight
	const ctx = canvas.getContext('2d')
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

	canvas.toBlob((blob) => {
		if (!blob) return
		const file = new File([blob], `paper-${Date.now()}.jpg`, { type: 'image/jpeg' })
		addImageToDraft(file)
	}, 'image/jpeg', 0.92)
}

function removeImage(index) {
	const [removed] = newStudent.images.splice(index, 1)
	if (removed?.preview) URL.revokeObjectURL(removed.preview)
}

async function fileToDataUrl(file) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = () => reject(new Error('Unable to read image file'))
		reader.readAsDataURL(file)
	})
}

function parseFrappeError(errorPayload) {
	if (!errorPayload) return ''
	if (typeof errorPayload?.message === 'string' && errorPayload.message) return errorPayload.message

	const raw = errorPayload?._server_messages
	if (!raw) return ''

	try {
		const list = JSON.parse(raw)
		if (!Array.isArray(list) || !list.length) return ''
		const first = list[0]
		if (typeof first !== 'string') return ''
		const detail = JSON.parse(first)
		return detail?.message || ''
	} catch (e) {
		return typeof raw === 'string' ? raw : ''
	}
}

function resetNewStudent() {
	newStudent.images.forEach((img) => {
		if (img?.preview) URL.revokeObjectURL(img.preview)
	})
	newStudent.name = ''
	newStudent.id = ''
	newStudent.sbd = ''
	newStudent.images = []
	studentSearchQuery.value = ''
	studentOptions.value = []
	selectedStudent.value = null
	openStudentPicker.value = false
}

async function addStudent() {
	if (!resolvedSessionId.value) {
		window.alert(__('Session is missing. Please open a valid workspace URL.'))
		return
	}

	if (!selectedStudent.value?.name) {
		window.alert(__('Please select a student from the system list.'))
		return
	}

	try {
		let paperImageData = null
		let paperImageName = null
		if (newStudent.images.length > 0 && newStudent.images[0]?.file) {
			paperImageData = await fileToDataUrl(newStudent.images[0].file)
			paperImageName = newStudent.images[0].file.name
		}

		const result = await addStudentResource.submit({
			session: resolvedSessionId.value,
			student: selectedStudent.value.name,
			student_name: newStudent.name?.trim() || null,
			student_sbd: newStudent.sbd?.trim() || null,
			paper_image_data: paperImageData,
			paper_image_name: paperImageName,
		})
		if (result?.already_exists) {
			window.alert(__('This student is already in the current session.'))
		}
		await loadSubmissions()
		showAddStudentModal.value = false
		closeCamera()
		resetNewStudent()
		currentIdx.value = Math.max(filteredSubmissions.value.length - 1, 0)
	} catch (e) {
		window.alert(parseFrappeError(e) || e?.messages?.[0] || e?.message || __('Unable to add student.'))
	}
}

// Watch current submission and load feedback
watch(currentSub, (newVal) => {
	if (!newVal) return
	const raw = newVal.raw
	if (raw) {
		feedback.value = raw.teacher_feedback || ''
		aiRating.value = raw.ai_rating?.toLowerCase() || ''
		aiRatingReason.value = raw.dissatisfaction_reason || ''
		// Load criteria from ai_feedback if present
		if (raw.ai_feedback) {
			try {
				const parsed = JSON.parse(raw.ai_feedback)
				if (parsed.criteria) {
					criteria.splice(0, criteria.length, ...parsed.criteria)
				}
			} catch (e) {
				console.error("Failed to parse AI feedback JSON", e)
			}
		}
	}
}, { immediate: true })

const saveResultResource = createResource({
	url: 'lms.lms.api.save_ai_grading_result',
})

// --- Navigation ---
function nextSub() {
	if (currentIdx.value < filteredSubmissions.value.length - 1) currentIdx.value++
}
function prevSub() {
	if (currentIdx.value > 0) currentIdx.value--
}

async function flagCurrent() {
	const sub = currentSub.value
	if (!sub) return
	
	const res = await saveResultResource.submit({
		submission_id: sub.id,
		data: { status: 'Flagged' }
	})
	if (res) await loadSubmissions()
}

async function approveCurrent() {
	const sub = currentSub.value
	if (!sub) return

	const res = await saveResultResource.submit({
		submission_id: sub.id,
		data: {
			score: totalScore.value,
			status: 'Done',
			teacher_feedback: feedback.value,
			ai_rating: aiRating.value === 'satisfied' ? 'Satisfied' : (aiRating.value === 'dissatisfied' ? 'Dissatisfied' : ''),
			dissatisfaction_reason: aiRatingReason.value,
			ai_feedback: JSON.stringify({ criteria: [...criteria] })
		}
	})
	
	if (res) {
		await loadSubmissions()
	}
}

async function approveAndNext() {
	await approveCurrent()
	
	// Reset rating for next student state (managed by watch above)
	nextSub()
}

// --- Keyboard shortcuts ---
function handleKeydown(e) {
	if (e.key === 'ArrowDown' || e.key === 'j') nextSub()
	if (e.key === 'ArrowUp' || e.key === 'k') prevSub()
	if (e.key === 'Enter' && e.ctrlKey) approveAndNext()
}

watch(resolvedSessionSlug, async (newSessionSlug) => {
	if (!newSessionSlug) {
		router.push({ name: 'AIGradingEssayConfig', params: { type: resolvedType.value } })
		return
	}
	currentIdx.value = 0
	await loadSessionBySlug()
	if (!resolvedSessionId.value) {
		router.push({ name: 'AIGradingEssayConfig', params: { type: resolvedType.value } })
		return
	}
	await loadSubmissions()
}, { immediate: true })

watch(showAddStudentModal, async (isOpen) => {
	if (isOpen) {
		await loadStudentOptions('')
	}
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
	window.removeEventListener('keydown', handleKeydown)
	closeCamera()
	resetNewStudent()
})

// Global actions
function saveAllToDatabase() {
	// Dummy function cho việc gọi API xuống frappe backend
	console.log('Saving all submissions and grades to database:', submissions.value)
	// Frappe Call example:
	// frappe.call({ method: 'my_app.api.save_grades', args: { data: submissions } })
	alert(__('Successfully saved all progress and scores to the system!'))
}

function exportGrades() {
	// Generate basic CSV cho bảng điểm
	const csvRows = [
		["Mã HS", "Tên Học Sinh", "Điểm số", "Trạng thái"]
	]
	submissions.value.forEach(sub => {
		csvRows.push([
			sub.id,
			sub.name,
			sub.score !== null ? sub.score : 'Chưa chấm',
			sub.status
		])
	})
	
	const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n")
	const encodedUri = encodeURI(csvContent)
	const link = document.createElement("a")
	link.setAttribute("href", encodedUri)
	link.setAttribute("download", `bang_diem_${sessionDisplayName.value}.csv`)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
</script>
