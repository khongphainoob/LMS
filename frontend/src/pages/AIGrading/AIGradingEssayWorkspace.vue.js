/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Dialog, Input, createResource } from 'frappe-ui';
const props = defineProps({
    sessionSlug: { type: String, required: false, default: '' },
    type: { type: String, required: false, default: 'exam' },
});
const route = useRoute();
const router = useRouter();
const resolvedSessionSlug = computed(() => route.params.sessionSlug || props.sessionSlug || '');
const resolvedType = computed(() => route.params.type || props.type || 'exam');
const resolvedSessionId = ref('');
const sessionDoc = ref(null);
const sessionLoading = ref(false);
const gradingTypeByRouteType = {
    exam: 'Exam',
    test: 'Test',
    hw: 'Homework',
};
// --- Real Submissions ---
const submissionsResource = createResource({
    url: 'lms.lms.api.get_ai_grading_submissions',
});
async function loadSubmissions() {
    if (!resolvedSessionId.value)
        return;
    await submissionsResource.submit({ session: resolvedSessionId.value });
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
            paper_image: s.paper_image,
            paper_images: s.paper_images,
            raw: s
        }));
    }
    catch (e) {
        console.error("Error computing submissions list:", e);
        return [];
    }
});
const sessionBySlugResource = createResource({
    url: 'lms.lms.api.get_ai_grading_session_by_slug',
});
async function loadSessionBySlug() {
    if (!resolvedSessionSlug.value)
        return;
    sessionLoading.value = true;
    try {
        const doc = await sessionBySlugResource.submit({
            session_slug: resolvedSessionSlug.value,
            grading_type: gradingTypeByRouteType[resolvedType.value] || null,
        });
        sessionDoc.value = doc || null;
        resolvedSessionId.value = doc?.name || '';
    }
    finally {
        sessionLoading.value = false;
    }
}
const sessionDisplayName = computed(() => {
    return sessionDoc.value?.session_name || 'Loading Session...';
});
const currentIdx = ref(0);
const searchQuery = ref('');
const activeFilter = ref('all');
const filters = [
    { label: __('All'), value: 'all' },
    { label: __('Pending'), value: 'pending' },
    { label: 'Flag', value: 'flag' },
];
const filteredSubmissions = computed(() => {
    let list = submissions.value;
    if (activeFilter.value === 'pending') {
        list = list.filter((s) => s.status === 'pending' || s.status === 'grading');
    }
    else if (activeFilter.value === 'flag') {
        list = list.filter((s) => s.status === 'flag');
    }
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((s) => s.name.toLowerCase().includes(q) ||
            s.student_id.includes(q) ||
            (s.sbd || '').toLowerCase().includes(q));
    }
    return list;
});
const currentSub = computed(() => filteredSubmissions.value[currentIdx.value] || submissions.value[0]);
const paperPageIndex = ref(0);
const paperImages = computed(() => {
    const images = currentSub.value?.paper_images;
    if (Array.isArray(images))
        return images.filter(Boolean);
    if (typeof images === 'string' && images.trim()) {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed))
                return parsed.filter(Boolean);
        }
        catch (e) {
            return [images];
        }
        return [images];
    }
    if (currentSub.value?.paper_image)
        return [currentSub.value.paper_image];
    return [];
});
const currentPaperImage = computed(() => paperImages.value[paperPageIndex.value] || paperImages.value[0] || '');
const hasMultiplePaperImages = computed(() => paperImages.value.length > 1);
const approvedCount = computed(() => submissions.value.filter((s) => s.status === 'done').length);
const flagCount = computed(() => submissions.value.filter((s) => s.status === 'flag').length);
const progressPercent = computed(() => {
    if (!submissions.value.length)
        return 0;
    return Math.round((approvedCount.value / submissions.value.length) * 100);
});
// --- Score colours ---
function scoreColor(s) {
    if (s == null)
        return 'text-[#a09e9a]';
    if (s >= 8)
        return 'text-[#2d6a4f]';
    if (s >= 6)
        return 'text-[#b45309]';
    return 'text-[#9f1239]';
}
function tagClass(status) {
    const map = {
        done: 'bg-[#2d6a4f]/10 text-[#2d6a4f]',
        grading: 'bg-[#1d4ed8]/10 text-[#1d4ed8]',
        flag: 'bg-[#9f1239]/10 text-[#9f1239]',
        pending: 'bg-[#b45309]/10 text-[#b45309]',
    };
    return map[status] || 'bg-gray-100 text-[#a09e9a]';
}
function statusLabel(status) {
    const map = {
        done: __('Approved'),
        grading: __('Grading'),
        flag: __('Need review'),
        pending: __('Pending'),
    };
    return map[status] || status;
}
function nextPaperPage() {
    if (!paperImages.value.length)
        return;
    paperPageIndex.value = (paperPageIndex.value + 1) % paperImages.value.length;
}
function prevPaperPage() {
    if (!paperImages.value.length)
        return;
    paperPageIndex.value = (paperPageIndex.value - 1 + paperImages.value.length) % paperImages.value.length;
}
// --- Criteria ---
const criteria = reactive([]);
const defaultCriteria = ref([]);
watch(resolvedSessionId, async (newId) => {
    if (!newId || !sessionDoc.value?.rubric_template)
        return;
    try {
        const res = await frappe.call({
            method: 'frappe.client.get',
            args: {
                doctype: 'LMS Rubric Template',
                name: sessionDoc.value.rubric_template
            }
        });
        if (res?.message?.criteria) {
            defaultCriteria.value = res.message.criteria.map(c => ({
                name: c.criterion_name,
                score: 0.0,
                max: c.max_score,
                badge: '',
                badgeLabel: '',
                note: '',
                highlight: false
            }));
        }
    }
    catch (e) {
        console.log('No rubric found', e);
    }
}, { immediate: true });
const totalScore = computed(() => {
    return Math.min(10, criteria.reduce((sum, c) => sum + (c.score || 0), 0));
});
function critBadge(type) {
    const map = {
        correct: 'bg-[#2d6a4f]/10 text-[#2d6a4f]',
        partial: 'bg-[#b45309]/10 text-[#b45309]',
        wrong: 'bg-[#9f1239]/10 text-[#9f1239]',
    };
    return map[type] || 'bg-gray-100 text-[#a09e9a]';
}
const confidenceBadge = 'bg-[#b45309]/10 text-[#b45309]';
const feedback = ref(__('Good understanding of the process. Need to write full solution set and pay attention to the no-solution condition sign.'));
// --- AI Rating State ---
const aiRating = ref('');
const aiRatingReason = ref('');
// --- Add Student Logic ---
const showAddStudentModal = ref(false);
const newStudent = reactive({ name: '', id: '', sbd: '', images: [] });
const studentPhotoInput = ref(null);
const studentSearchQuery = ref('');
const studentOptions = ref([]);
const openStudentPicker = ref(false);
const selectedStudent = ref(null);
const showCameraPreview = ref(false);
const cameraVideoElement = ref(null);
const cameraCanvasElement = ref(null);
const cameraStream = ref(null);
const addStudentResource = createResource({
    url: 'lms.lms.api.add_ai_grading_submission',
});
const searchStudentsResource = createResource({
    url: 'lms.lms.api.search_ai_grading_students',
});
async function loadStudentOptions(query = '') {
    const res = await searchStudentsResource.submit({ query, limit: 20 });
    studentOptions.value = Array.isArray(res)
        ? res
        : (Array.isArray(searchStudentsResource.data) ? searchStudentsResource.data : []);
}
async function onStudentSearchInput() {
    openStudentPicker.value = true;
    selectedStudent.value = null;
    newStudent.id = '';
    newStudent.name = '';
    await loadStudentOptions(studentSearchQuery.value || '');
}
function selectStudentOption(option) {
    selectedStudent.value = option;
    newStudent.id = option.name;
    newStudent.name = option.full_name || option.username || option.name;
    studentSearchQuery.value = `${newStudent.name} (${option.name})`;
    openStudentPicker.value = false;
}
function addImageToDraft(file) {
    if (!file)
        return;
    newStudent.images.push({
        file,
        preview: URL.createObjectURL(file),
    });
}
function handleStudentPhoto(event) {
    const files = Array.from(event?.target?.files || []);
    files.forEach(addImageToDraft);
    if (event?.target)
        event.target.value = '';
}
async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
        window.alert(__('Camera is not supported on this device/browser.'));
        return;
    }
    try {
        closeCamera();
        cameraStream.value = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
        });
        showCameraPreview.value = true;
        if (cameraVideoElement.value) {
            cameraVideoElement.value.srcObject = cameraStream.value;
            await cameraVideoElement.value.play();
        }
    }
    catch (e) {
        window.alert(__('Unable to open camera. Please allow camera permission.'));
    }
}
function closeCamera() {
    if (cameraStream.value) {
        cameraStream.value.getTracks().forEach(track => track.stop());
    }
    if (cameraVideoElement.value) {
        cameraVideoElement.value.srcObject = null;
    }
    cameraStream.value = null;
    showCameraPreview.value = false;
}
function capturePhoto() {
    const video = cameraVideoElement.value;
    const canvas = cameraCanvasElement.value;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight)
        return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        if (!blob)
            return;
        const file = new File([blob], `paper-${Date.now()}.jpg`, { type: 'image/jpeg' });
        addImageToDraft(file);
    }, 'image/jpeg', 0.92);
}
function removeImage(index) {
    const [removed] = newStudent.images.splice(index, 1);
    if (removed?.preview)
        URL.revokeObjectURL(removed.preview);
}
async function fileToDataUrl(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read image file'));
        reader.readAsDataURL(file);
    });
}
function parseFrappeError(errorPayload) {
    if (!errorPayload)
        return '';
    if (typeof errorPayload?.message === 'string' && errorPayload.message)
        return errorPayload.message;
    const raw = errorPayload?._server_messages;
    if (!raw)
        return '';
    try {
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || !list.length)
            return '';
        const first = list[0];
        if (typeof first !== 'string')
            return '';
        const detail = JSON.parse(first);
        return detail?.message || '';
    }
    catch (e) {
        return typeof raw === 'string' ? raw : '';
    }
}
function resetNewStudent() {
    newStudent.images.forEach((img) => {
        if (img?.preview)
            URL.revokeObjectURL(img.preview);
    });
    newStudent.name = '';
    newStudent.id = '';
    newStudent.sbd = '';
    newStudent.images = [];
    studentSearchQuery.value = '';
    studentOptions.value = [];
    selectedStudent.value = null;
    openStudentPicker.value = false;
}
async function addStudent() {
    if (!resolvedSessionId.value) {
        window.alert(__('Session is missing. Please open a valid workspace URL.'));
        return;
    }
    if (!selectedStudent.value?.name) {
        window.alert(__('Please select a student from the system list.'));
        return;
    }
    try {
        let paperImageData = null;
        let paperImageName = null;
        let paperImagesData = [];
        let paperImagesNames = [];
        const imageFiles = newStudent.images.filter((img) => img?.file);
        if (imageFiles.length > 0) {
            paperImagesData = await Promise.all(imageFiles.map((img) => fileToDataUrl(img.file)));
            paperImagesNames = imageFiles.map((img) => img.file.name);
            paperImageData = paperImagesData[0] || null;
            paperImageName = paperImagesNames[0] || null;
        }
        const result = await addStudentResource.submit({
            session: resolvedSessionId.value,
            student: selectedStudent.value.name,
            student_name: newStudent.name?.trim() || null,
            student_sbd: newStudent.sbd?.trim() || null,
            paper_image_data: paperImageData,
            paper_image_name: paperImageName,
            paper_images_data: paperImagesData,
            paper_images_names: paperImagesNames,
        });
        if (result?.already_exists) {
            window.alert(__('This student is already in the current session.'));
        }
        await loadSubmissions();
        showAddStudentModal.value = false;
        closeCamera();
        resetNewStudent();
        currentIdx.value = Math.max(filteredSubmissions.value.length - 1, 0);
    }
    catch (e) {
        window.alert(parseFrappeError(e) || e?.messages?.[0] || e?.message || __('Unable to add student.'));
    }
}
// Watch current submission and load feedback
watch(currentSub, (newVal) => {
    paperPageIndex.value = 0;
    if (!newVal)
        return;
    const raw = newVal.raw;
    if (raw) {
        feedback.value = raw.teacher_feedback || '';
        aiRating.value = raw.ai_rating?.toLowerCase() || '';
        aiRatingReason.value = raw.dissatisfaction_reason || '';
        // Load criteria from ai_feedback if present
        if (raw.ai_feedback) {
            try {
                const parsed = typeof raw.ai_feedback === 'string' ? JSON.parse(raw.ai_feedback) : raw.ai_feedback;
                if (parsed.criteria) {
                    criteria.splice(0, criteria.length, ...parsed.criteria);
                }
            }
            catch (e) {
                console.error("Failed to parse AI feedback JSON", e);
                criteria.splice(0, criteria.length, ...JSON.parse(JSON.stringify(defaultCriteria.value)));
            }
        }
        else {
            criteria.splice(0, criteria.length, ...JSON.parse(JSON.stringify(defaultCriteria.value)));
        }
    }
}, { immediate: true });
const saveResultResource = createResource({
    url: 'lms.lms.api.save_ai_grading_result',
});
// --- Navigation ---
function nextSub() {
    if (currentIdx.value < filteredSubmissions.value.length - 1)
        currentIdx.value++;
}
function prevSub() {
    if (currentIdx.value > 0)
        currentIdx.value--;
}
async function flagCurrent() {
    const sub = currentSub.value;
    if (!sub)
        return;
    const res = await saveResultResource.submit({
        submission_id: sub.id,
        data: { status: 'Flagged' }
    });
    if (res)
        await loadSubmissions();
}
async function approveCurrent() {
    const sub = currentSub.value;
    if (!sub)
        return;
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
    });
    if (res) {
        await loadSubmissions();
    }
}
async function approveAndNext() {
    await approveCurrent();
    // Reset rating for next student state (managed by watch above)
    nextSub();
}
// --- Keyboard shortcuts ---
function handleKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'j')
        nextSub();
    if (e.key === 'ArrowUp' || e.key === 'k')
        prevSub();
    if (e.key === 'Enter' && e.ctrlKey)
        approveAndNext();
}
watch(resolvedSessionSlug, async (newSessionSlug) => {
    if (!newSessionSlug) {
        router.push({ name: 'AIGradingEssayConfig', params: { type: resolvedType.value } });
        return;
    }
    currentIdx.value = 0;
    await loadSessionBySlug();
    if (!resolvedSessionId.value) {
        router.push({ name: 'AIGradingEssayConfig', params: { type: resolvedType.value } });
        return;
    }
    await loadSubmissions();
}, { immediate: true });
watch(showAddStudentModal, async (isOpen) => {
    if (isOpen) {
        await loadStudentOptions('');
    }
});
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    closeCamera();
    resetNewStudent();
});
// Global actions
function saveAllToDatabase() {
    // Dummy function cho việc gọi API xuống frappe backend
    console.log('Saving all submissions and grades to database:', submissions.value);
    // Frappe Call example:
    // frappe.call({ method: 'my_app.api.save_grades', args: { data: submissions } })
    alert(__('Successfully saved all progress and scores to the system!'));
}
function exportGrades() {
    // Generate basic CSV cho bảng điểm
    const csvRows = [
        ["Mã HS", "Tên Học Sinh", "Điểm số", "Trạng thái"]
    ];
    submissions.value.forEach(sub => {
        csvRows.push([
            sub.id,
            sub.name,
            sub.score !== null ? sub.score : 'Chưa chấm',
            sub.status
        ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bang_diem_${sessionDisplayName.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "absolute inset-0 flex flex-col overflow-hidden sm:rounded-xl border border-gray-100 bg-white shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-12 flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push({ name: 'AIGradingEssayConfig', params: { type: __VLS_ctx.resolvedType } });
            // @ts-ignore
            [$router, resolvedType,];
        } },
    ...{ class: "text-xs text-gray-400 transition-colors hover:text-gray-700" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gray-700']} */ ;
(__VLS_ctx.__('Back'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "h-5 w-px bg-gray-200" },
});
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-px']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm font-semibold text-gray-800" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
(__VLS_ctx.sessionLoading ? __VLS_ctx.__('Loading...') : (__VLS_ctx.sessionDoc?.session_name || __VLS_ctx.__('Session Not Found')));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "flex-1" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
(__VLS_ctx.__('Graded'));
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
    ...{ class: "text-gray-800" },
});
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
(__VLS_ctx.approvedCount);
(__VLS_ctx.submissions.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "h-1 w-16 overflow-hidden rounded-full bg-gray-200" },
});
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "h-full rounded-full bg-[#2d6a4f] transition-all duration-500" },
    ...{ style: ({ width: __VLS_ctx.progressPercent + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 rounded-full bg-[#b45309]/10 px-3 py-1 text-xs text-[#b45309]" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#b45309]/10']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#b45309]']} */ ;
(__VLS_ctx.__('Needs review'));
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.flagCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ml-2 flex items-center justify-end gap-2" },
});
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.exportGrades) },
    ...{ class: "hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-100" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-gray-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-gray-500" },
});
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
(__VLS_ctx.__('Export Grades'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.saveAllToDatabase) },
    ...{ class: "flex items-center gap-1.5 rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1d4ed8]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-90']} */ ;
/** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-[#1d4ed8]/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hidden sm:inline" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
(__VLS_ctx.__('Save All'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-1 overflow-hidden" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex w-60 flex-shrink-0 flex-col border-r border-gray-100 bg-white" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-60']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-b border-gray-100 p-3" },
});
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-2 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xs font-semibold text-gray-700" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
(__VLS_ctx.__('Submissions'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "flex items-center gap-1 rounded bg-[#1d4ed8]/10 px-2 py-0.5 text-[10px] font-medium text-[#1d4ed8] transition-colors hover:bg-[#1d4ed8]/20" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1d4ed8]/10']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#1d4ed8]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-[#1d4ed8]/20']} */ ;
(__VLS_ctx.__('Grade All'));
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none" },
    placeholder: (__VLS_ctx.__('Search by name, ID...')),
});
(__VLS_ctx.searchQuery);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-emerald-400']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-2 flex gap-1" },
});
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
for (const [f] of __VLS_vFor((__VLS_ctx.filters))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeFilter = f.value;
                // @ts-ignore
                [__, __, __, __, __, __, __, __, __, __, sessionLoading, sessionDoc, approvedCount, submissions, progressPercent, flagCount, exportGrades, saveAllToDatabase, searchQuery, filters, activeFilter,];
            } },
        key: (f.value),
        ...{ class: "rounded-md border px-2 py-0.5 text-[10px] transition-all" },
        ...{ class: ([
                __VLS_ctx.activeFilter === f.value
                    ? 'border-[#2d6a4f] bg-[#2d6a4f] text-white'
                    : 'border-gray-200 bg-transparent text-gray-400 hover:border-gray-300',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    (f.label);
    // @ts-ignore
    [activeFilter,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAddStudentModal = true;
            // @ts-ignore
            [showAddStudentModal,];
        } },
    ...{ class: "mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 py-1.5 text-xs font-medium text-[#2d6a4f] transition-all hover:bg-[#2d6a4f]/10" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-[#2d6a4f]/10']} */ ;
(__VLS_ctx.__('Add Student'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 space-y-0.5 overflow-y-auto p-2" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
for (const [sub, idx] of __VLS_vFor((__VLS_ctx.filteredSubmissions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.currentIdx = idx;
                // @ts-ignore
                [__, filteredSubmissions, currentIdx,];
            } },
        key: (sub.id),
        ...{ class: "cursor-pointer rounded-lg border p-2.5 transition-all" },
        ...{ class: ([
                __VLS_ctx.currentIdx === idx
                    ? 'border-[#2d6a4f]/40 bg-[#2d6a4f]/5'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-medium text-gray-800" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    (sub.name);
    if (sub.score) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-mono font-semibold" },
            ...{ class: (__VLS_ctx.scoreColor(sub.score)) },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (sub.score);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ class: "rounded bg-gray-100 p-1 text-gray-400 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8]" },
            title: (__VLS_ctx.__('Grade Document')),
        });
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1d4ed8]/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-[#1d4ed8]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            ...{ class: "h-3 w-3" },
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
        });
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.path, __VLS_intrinsics.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path, __VLS_intrinsics.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-0.5 flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] text-gray-400 font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (sub.sbd || sub.student_id);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rounded px-1.5 py-px text-[9px] font-medium" },
        ...{ class: (__VLS_ctx.tagClass(sub.status)) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.statusLabel(sub.status));
    // @ts-ignore
    [__, currentIdx, scoreColor, tagClass, statusLabel,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-1 flex-col overflow-hidden border-r border-gray-100" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-10 flex-shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex-1 text-xs font-medium text-gray-700" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
(__VLS_ctx.currentSub?.name);
(__VLS_ctx.currentSub?.id);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50" },
});
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
(__VLS_ctx.__('Zoom'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50" },
});
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
(__VLS_ctx.__('Annotate'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.flagCurrent) },
    ...{ class: "rounded border border-[#9f1239]/20 bg-[#9f1239]/10 px-2 py-1 text-[10px] text-[#9f1239] hover:bg-[#9f1239]/20" },
});
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#9f1239]/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#9f1239]/10']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#9f1239]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-[#9f1239]/20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.approveAndNext) },
    ...{ class: "rounded bg-[#2d6a4f] px-3 py-1 text-[10px] font-semibold text-white hover:opacity-90 shadow-sm transition-opacity flex items-center gap-1" },
});
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-90']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hidden sm:inline" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
(__VLS_ctx.__('Approve & Next'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "sm:hidden" },
});
/** @type {__VLS_StyleScopedClasses['sm:hidden']} */ ;
(__VLS_ctx.__('Next'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 overflow-y-auto bg-gray-50 p-6" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
if (__VLS_ctx.paperImages.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mx-auto max-w-4xl rounded bg-white p-4 shadow-md" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.currentSub.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[10px] text-gray-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    (__VLS_ctx.currentSub.sbd || __VLS_ctx.currentSub.student_id);
    if (__VLS_ctx.hasMultiplePaperImages) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-500" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.prevPaperPage) },
            ...{ class: "rounded-full px-2 py-1 transition-colors hover:bg-white hover:text-gray-700" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-gray-700']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "min-w-14 text-center font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (__VLS_ctx.paperPageIndex + 1);
        (__VLS_ctx.paperImages.length);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.nextPaperPage) },
            ...{ class: "rounded-full px-2 py-1 transition-colors hover:bg-white hover:text-gray-700" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-gray-700']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.currentPaperImage),
        alt: (__VLS_ctx.__('Student submission image')),
        ...{ class: "max-h-[calc(100vh-11rem)] w-full rounded border border-gray-200 object-contain" },
    });
    /** @type {__VLS_StyleScopedClasses['max-h-[calc(100vh-11rem)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mx-auto max-w-xl rounded bg-[#fff9f0] p-8 shadow-md" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#fff9f0]']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-6 border-b border-[#d4cfc0] pb-4 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#d4cfc0]']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-[#6b6050]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#6b6050]']} */ ;
    (__VLS_ctx.__('NGUYEN TRAI HIGH SCHOOL — HCMC'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-1 text-sm font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.__('MIDTERM EXAM I — MATH GRADE 12'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-1 text-[10px] text-[#8a7a6a]" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#8a7a6a]']} */ ;
    (__VLS_ctx.__('Duration: 90 min · Date: 15/11/2024'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-2 text-xs font-bold text-gray-800" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    (__VLS_ctx.__('Question 2 (3 pts): Solve 2x² − 5x + 3 = 0'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "my-2 rounded-xl border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 p-3 shadow-[0_2px_10px_-3px_rgba(45,106,79,0.1)] backdrop-blur-sm transition-all hover:bg-[#2d6a4f]/10" },
    });
    /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_2px_10px_-3px_rgba(45,106,79,0.1)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#2d6a4f]/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1 text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.__('Step 1 — Compute Δ · 1.0/1.0 ✓'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-gray-800 leading-relaxed font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/30']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[#2d6a4f] font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "my-2 rounded-xl border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 p-3 shadow-[0_2px_10px_-3px_rgba(45,106,79,0.1)] backdrop-blur-sm transition-all hover:bg-[#2d6a4f]/10" },
    });
    /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_2px_10px_-3px_rgba(45,106,79,0.1)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#2d6a4f]/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1 text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.__('Step 2 — Compute roots · 1.0/1.0 ✓'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-gray-800 leading-relaxed font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/30']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[#2d6a4f] font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/30']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[#2d6a4f] font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "my-2 rounded-xl border border-[#b45309]/20 bg-[#b45309]/5 p-3 shadow-[0_2px_10px_-3px_rgba(180,83,9,0.1)] backdrop-blur-sm transition-all hover:bg-[#b45309]/10" },
    });
    /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#b45309]/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#b45309]/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_2px_10px_-3px_rgba(180,83,9,0.1)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#b45309]/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1 text-[10px] font-bold uppercase tracking-wider text-[#b45309] font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#b45309]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.__('Step 3 — Conclusion · 0.5/1.0 ~'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-gray-800 leading-relaxed font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.__('Equation has'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#b45309]/15 px-1.5 py-0.5 text-[#b45309] border-b-2 border-[#b45309]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#b45309]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#b45309]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#b45309]/30']} */ ;
    (__VLS_ctx.__('two distinct roots'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[#b45309] font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#b45309]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
        ...{ class: "text-[11px] text-gray-500 mt-1 block" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    (__VLS_ctx.__('Missing solution set S = {1; 3/2}'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-2 text-xs font-bold text-gray-800" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    (__VLS_ctx.__('Question 3 (2 pts): Analyze the meaning of discriminant Δ'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-gray-800 leading-relaxed font-medium bg-white/50 p-3 rounded-xl border border-gray-100 shadow-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/30']} */ ;
    (__VLS_ctx.__('When Δ > 0, equation has two distinct real roots'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#2d6a4f]/15 px-1.5 py-0.5 text-[#2d6a4f] border-b-2 border-[#2d6a4f]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/30']} */ ;
    (__VLS_ctx.__('When Δ = 0, equation has a double root'));
    (__VLS_ctx.__('When'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.mark, __VLS_intrinsics.mark)({
        ...{ class: "rounded bg-[#9f1239]/15 px-1.5 py-0.5 text-[#9f1239] border-b-2 border-[#9f1239]/30" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#9f1239]/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#9f1239]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#9f1239]/30']} */ ;
    (__VLS_ctx.__('equation has no real roots.'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
        ...{ class: "text-[11px] text-gray-500 mt-2 block border-l-2 border-red-300 pl-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
    (__VLS_ctx.__('Error: no-solution condition should be Δ < 0'));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex w-72 flex-shrink-0 flex-col bg-white" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-72']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-b border-gray-100 p-4" },
});
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] uppercase tracking-wider text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('AI Suggested Score'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-1 flex items-baseline gap-1.5" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-baseline']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-4xl font-bold" },
    ...{ class: (__VLS_ctx.scoreColor(__VLS_ctx.totalScore)) },
});
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
(__VLS_ctx.totalScore.toFixed(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-sm text-gray-400 font-mono" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-2 h-1 overflow-hidden rounded-full bg-gray-100" },
});
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "h-full rounded-full transition-all duration-500" },
    ...{ class: (__VLS_ctx.totalScore >= 8 ? 'bg-[#2d6a4f]' : __VLS_ctx.totalScore >= 6 ? 'bg-[#b45309]' : 'bg-[#9f1239]') },
    ...{ style: ({ width: __VLS_ctx.totalScore * 10 + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-1.5 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[11px] text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('Confidence'));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rounded-full px-2 py-0.5 text-[10px] font-medium" },
    ...{ class: (__VLS_ctx.confidenceBadge) },
});
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.__('Medium'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 space-y-2 overflow-y-auto p-3" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rounded-lg border border-[#6d28d9]/20 bg-[#6d28d9]/5 p-3" },
});
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#6d28d9]/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#6d28d9]/5']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] font-semibold text-[#6d28d9] mb-1" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#6d28d9]']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
(__VLS_ctx.__('AI Notes'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[11px] text-gray-600 leading-relaxed" },
});
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
(__VLS_ctx.__('Student understands Δ computation and roots well. Two errors: (1) missing solution set S in Q2; (2) wrong sign for no-solution condition in Q3. Suggest −0.5 each.'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] font-medium uppercase tracking-wider text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('Grading Criteria'));
for (const [crit, ci] of __VLS_vFor((__VLS_ctx.criteria))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (ci),
        ...{ class: "rounded-lg border p-3 transition-all" },
        ...{ class: ([
                crit.highlight
                    ? 'border-[#b45309]/30 bg-[#b45309]/5'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-start justify-between gap-2 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex-1 text-xs font-medium text-gray-800" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    (crit.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1 flex-shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-10 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-center font-mono text-xs text-gray-700 focus:border-emerald-400 focus:outline-none" },
    });
    (crit.score);
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[11px] text-gray-400 font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (crit.max);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-block rounded px-1.5 py-px text-[9px] font-medium mb-1" },
        ...{ class: (__VLS_ctx.critBadge(crit.badge)) },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (crit.badgeLabel);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[11px] text-gray-500 leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    (crit.note);
    // @ts-ignore
    [__, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, scoreColor, currentSub, currentSub, currentSub, currentSub, currentSub, flagCurrent, approveAndNext, paperImages, paperImages, hasMultiplePaperImages, prevPaperPage, paperPageIndex, nextPaperPage, currentPaperImage, totalScore, totalScore, totalScore, totalScore, totalScore, confidenceBadge, criteria, critBadge,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] font-medium uppercase tracking-wider text-gray-400 pt-2" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
(__VLS_ctx.__('Teacher Comments'));
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    value: (__VLS_ctx.feedback),
    ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-700 leading-relaxed placeholder:text-gray-400 focus:border-[#2d6a4f] focus:outline-none" },
    rows: "4",
    placeholder: (__VLS_ctx.__('Add your comments...')),
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-[#2d6a4f]']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-4 border-t border-gray-100 pt-3" },
});
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
(__VLS_ctx.__('Rate AI Grading'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.aiRating = 'satisfied';
            // @ts-ignore
            [__, __, __, feedback, aiRating,];
        } },
    ...{ class: "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors" },
    ...{ class: (__VLS_ctx.aiRating === 'satisfied' ? 'border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f]' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100') },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
(__VLS_ctx.__('Satisfied'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.aiRating = 'dissatisfied';
            // @ts-ignore
            [__, aiRating, aiRating,];
        } },
    ...{ class: "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors" },
    ...{ class: (__VLS_ctx.aiRating === 'dissatisfied' ? 'border-[#9f1239] bg-[#9f1239]/10 text-[#9f1239]' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100') },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
(__VLS_ctx.__('Dissatisfied'));
if (__VLS_ctx.aiRating === 'dissatisfied') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-2 text-left" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.aiRatingReason),
        ...{ class: "w-full rounded-lg border border-[#9f1239]/30 bg-[#9f1239]/5 p-2 text-xs text-[#9f1239] placeholder:text-[#9f1239]/50 focus:border-[#9f1239] focus:outline-none" },
        rows: "2",
        placeholder: (__VLS_ctx.__('Reason for dissatisfaction...')),
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#9f1239]/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#9f1239]/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#9f1239]']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-[#9f1239]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-[#9f1239]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex gap-2 border-t border-gray-100 p-3 mt-auto" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.prevSub) },
    ...{ class: "flex-1 rounded-lg border border-gray-200 bg-transparent py-2 text-xs font-medium text-gray-500 transition-all hover:bg-gray-50" },
    disabled: (__VLS_ctx.currentIdx === 0),
    ...{ class: ({ 'opacity-50 cursor-not-allowed': __VLS_ctx.currentIdx === 0 }) },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-not-allowed']} */ ;
(__VLS_ctx.__('Back'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.approveCurrent) },
    ...{ class: "flex-[2] rounded-lg bg-[#2d6a4f] py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['flex-[2]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-90']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
(__VLS_ctx.__('Save & Update'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.nextSub) },
    ...{ class: "flex-1 rounded-lg border border-gray-200 bg-transparent py-2 text-xs font-medium text-gray-500 transition-all hover:bg-gray-50" },
    disabled: (__VLS_ctx.currentIdx === __VLS_ctx.submissions.length - 1),
    ...{ class: ({ 'opacity-50 cursor-not-allowed': __VLS_ctx.currentIdx === __VLS_ctx.submissions.length - 1 }) },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-not-allowed']} */ ;
(__VLS_ctx.__('Next Submission'));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.showAddStudentModal),
    title: (__VLS_ctx.__('Add New Student')),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.showAddStudentModal),
    title: (__VLS_ctx.__('Add New Student')),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Student Name'));
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        type: "text",
        modelValue: (__VLS_ctx.newStudent.name),
        placeholder: (__VLS_ctx.__('e.g. Nguyen Van A')),
    }));
    const __VLS_9 = __VLS_8({
        type: "text",
        modelValue: (__VLS_ctx.newStudent.name),
        placeholder: (__VLS_ctx.__('e.g. Nguyen Van A')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Student'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        ...{ 'onFocus': {} },
        ...{ 'onInput': {} },
        type: "text",
        modelValue: (__VLS_ctx.studentSearchQuery),
        placeholder: (__VLS_ctx.__('Type to search student by name/email/username')),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onFocus': {} },
        ...{ 'onInput': {} },
        type: "text",
        modelValue: (__VLS_ctx.studentSearchQuery),
        placeholder: (__VLS_ctx.__('Type to search student by name/email/username')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_17;
    const __VLS_18 = ({ focus: {} },
        { onFocus: (...[$event]) => {
                __VLS_ctx.openStudentPicker = true;
                // @ts-ignore
                [__, __, __, __, __, __, __, __, __, __, submissions, submissions, showAddStudentModal, currentIdx, currentIdx, currentIdx, currentIdx, aiRating, aiRating, aiRatingReason, prevSub, approveCurrent, nextSub, newStudent, studentSearchQuery, openStudentPicker,];
            } });
    const __VLS_19 = ({ input: {} },
        { onInput: (__VLS_ctx.onStudentSearchInput) });
    var __VLS_15;
    var __VLS_16;
    if (__VLS_ctx.openStudentPicker) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-56']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        for (const [option] of __VLS_vFor((__VLS_ctx.studentOptions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.openStudentPicker))
                            return;
                        __VLS_ctx.selectStudentOption(option);
                        // @ts-ignore
                        [openStudentPicker, onStudentSearchInput, studentOptions, selectStudentOption,];
                    } },
                key: (option.name),
                type: "button",
                ...{ class: "flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-50" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "truncate font-medium text-gray-800" },
            });
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
            (option.full_name || option.username || option.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "truncate text-[10px] text-gray-500" },
            });
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            (option.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ml-3 text-[10px] text-gray-400" },
            });
            /** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            (option.username);
            // @ts-ignore
            [];
        }
        if (!__VLS_ctx.studentOptions.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "px-3 py-2 text-xs text-gray-500" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            (__VLS_ctx.__('No matching students found'));
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[11px] text-gray-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    (__VLS_ctx.__('Select student from existing system users'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Student SBD'));
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        type: "text",
        modelValue: (__VLS_ctx.newStudent.sbd),
        placeholder: (__VLS_ctx.__('e.g. 12A1-023')),
    }));
    const __VLS_22 = __VLS_21({
        type: "text",
        modelValue: (__VLS_ctx.newStudent.sbd),
        placeholder: (__VLS_ctx.__('e.g. 12A1-023')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[11px] text-gray-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    (__VLS_ctx.__('This is a separate field from system user account'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-1 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    (__VLS_ctx.__('Photo / Paper Image'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.handleStudentPhoto) },
        type: "file",
        ref: "studentPhotoInput",
        ...{ class: "hidden" },
        accept: "image/*",
        multiple: true,
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    if (!__VLS_ctx.showCameraPreview) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row gap-3 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.showCameraPreview))
                        return;
                    __VLS_ctx.$refs.studentPhotoInput.click();
                    // @ts-ignore
                    [__, __, __, __, __, __, newStudent, studentOptions, handleStudentPhoto, showCameraPreview, $refs,];
                } },
            ...{ class: "flex-1 flex sm:flex-col items-center justify-center gap-3 sm:gap-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 sm:p-6 transition-colors hover:border-[#2d6a4f]/50 hover:bg-[#2d6a4f]/5 cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:gap-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-[#2d6a4f]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2d6a4f]/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-2xl sm:mb-2 text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm sm:text-xs font-medium text-gray-700 sm:text-gray-600 sm:text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-gray-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-center']} */ ;
        (__VLS_ctx.__('Upload Files'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[11px] sm:mt-1 sm:text-[10px] text-gray-500 sm:text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-gray-400']} */ ;
        (__VLS_ctx.__('Multiple select (JPG, PNG)'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_ctx.openCamera) },
            ...{ class: "flex-1 flex sm:flex-col items-center justify-center gap-3 sm:gap-0 rounded-xl border-2 border-solid sm:border-dashed border-[#2d6a4f]/30 sm:border-gray-200 bg-[#2d6a4f]/5 sm:bg-gray-50/50 p-4 sm:p-6 transition-colors hover:border-[#2d6a4f]/50 hover:bg-[#2d6a4f]/10 cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:gap-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-solid']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:border-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:bg-gray-50/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-[#2d6a4f]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2d6a4f]/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-2xl sm:mb-2 text-[#2d6a4f]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm sm:text-xs font-bold sm:font-medium text-[#2d6a4f] sm:text-gray-600 sm:text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-gray-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-center']} */ ;
        (__VLS_ctx.__('Open Live Camera'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[11px] sm:mt-1 sm:text-[10px] text-[#2d6a4f]/70 sm:text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-gray-400']} */ ;
        (__VLS_ctx.__('Capture multiple pages directly'));
    }
    if (__VLS_ctx.showCameraPreview) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative mt-2 flex flex-col items-center rounded-xl overflow-hidden bg-black/90" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
            ref: "cameraVideoElement",
            ...{ class: "w-full h-auto max-h-[300px] object-contain" },
            autoplay: true,
            playsinline: true,
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-[300px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.canvas, __VLS_intrinsics.canvas)({
            ref: "cameraCanvasElement",
            ...{ class: "hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute bottom-4 flex items-center gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.closeCamera) },
            ...{ class: "flex h-10 w-10 items-center justify-center bg-red-500 rounded-full text-white shadow-lg shadow-red-500/30 transition-transform active:scale-90 hover:bg-red-600" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-red-500/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-90']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-red-600']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.capturePhoto) },
            ...{ class: "flex h-14 w-14 items-center justify-center bg-white rounded-full text-black shadow-lg border-4 border-gray-300 transition-transform active:scale-90 hover:bg-gray-100" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-90']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-gray-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-2xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        if (__VLS_ctx.newStudent.images.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.__('Captured'));
            (__VLS_ctx.newStudent.images.length);
        }
    }
    if (__VLS_ctx.newStudent.images.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4 grid grid-cols-3 gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        for (const [img, idx] of __VLS_vFor((__VLS_ctx.newStudent.images))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (idx),
                ...{ class: "relative group aspect-square" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['aspect-square']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (img.preview),
                ...{ class: "w-full h-full object-cover rounded-lg border border-gray-200" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.newStudent.images.length > 0))
                            return;
                        __VLS_ctx.removeImage(idx);
                        // @ts-ignore
                        [__, __, __, __, __, newStudent, newStudent, newStudent, newStudent, showCameraPreview, openCamera, closeCamera, capturePhoto, removeImage,];
                    } },
                ...{ class: "absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:opacity-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
}
{
    const { actions: __VLS_25 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-2 px-4 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showAddStudentModal = false;
                // @ts-ignore
                [showAddStudentModal,];
            } },
        ...{ class: "rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    (__VLS_ctx.__('Cancel'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.addStudent) },
        ...{ class: "rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-90']} */ ;
    (__VLS_ctx.__('Add & Start Grading'));
    // @ts-ignore
    [__, __, addStudent,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        sessionSlug: { type: String, required: false, default: '' },
        type: { type: String, required: false, default: 'exam' },
    },
});
export default {};
