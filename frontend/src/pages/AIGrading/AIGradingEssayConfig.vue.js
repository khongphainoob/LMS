/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Dialog, Input, createListResource, createResource } from 'frappe-ui';
const props = defineProps({
    type: { type: String, required: true },
});
const router = useRouter();
const titles = {
    exam: __('Grade Exams'),
    test: __('Grade Quick Tests'),
    hw: __('Grade Homework'),
};
const subtitles = {
    exam: __('Set up information and choose a grading session before starting.'),
    test: __('Set up information and upload test papers.'),
    hw: __('Set up class information and upload homework for grading.'),
};
const pageTitle = computed(() => titles[props.type] || titles.exam);
const pageSubtitle = computed(() => subtitles[props.type] || subtitles.exam);
// --- Dynamic Styling Based on Type ---
const accentClasses = computed(() => {
    const map = {
        exam: {
            chipSelected: 'border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f] shadow-[0_0_12px_rgba(45,106,79,0.15)]',
            text: 'text-[#2d6a4f]',
            textLight: 'text-[#2d6a4f]/80',
            button: 'text-white transition-all',
            buttonStyle: 'background-color: #2d6a4f;',
            hoverSession: 'hover:border-[#2d6a4f]/50 hover:bg-[#2d6a4f]/5',
        },
        test: {
            chipSelected: 'border-[#1d4ed8] bg-[#1d4ed8]/10 text-[#1d4ed8] shadow-[0_0_12px_rgba(29,78,216,0.15)]',
            text: 'text-[#1d4ed8]',
            textLight: 'text-[#1d4ed8]/80',
            button: 'text-white transition-all',
            buttonStyle: 'background-color: #1d4ed8;',
            hoverSession: 'hover:border-[#1d4ed8]/50 hover:bg-[#1d4ed8]/5',
        },
        hw: {
            chipSelected: 'border-[#b45309] bg-[#b45309]/10 text-[#b45309] shadow-[0_0_12px_rgba(180,83,9,0.15)]',
            text: 'text-[#b45309]',
            textLight: 'text-[#b45309]/80',
            button: 'text-white transition-all',
            buttonStyle: 'background-color: #b45309;',
            hoverSession: 'hover:border-[#b45309]/50 hover:bg-[#b45309]/5',
        },
    };
    return map[props.type] || map.exam;
});
// --- Subjects ---
const subjects = [
    { label: __('Math'), value: 'math' },
    { label: __('Physics'), value: 'physics' },
    { label: __('Chemistry'), value: 'chemistry' },
    { label: __('Literature'), value: 'literature' },
    { label: __('English'), value: 'english' },
    { label: __('History'), value: 'history' },
    { label: __('Geography'), value: 'geography' },
    { label: __('Biology'), value: 'biology' },
];
const selectedSubject = ref('');
const isEnglish = computed(() => selectedSubject.value === 'english');
function selectSubject(val) {
    selectedSubject.value = val;
    selectedLevel.value = ''; // reset level when subject changes
}
// --- Grade levels ---
const standardGrades = [
    { value: '1', display: '1', label: __('Grade 1') },
    { value: '2', display: '2', label: __('Grade 2') },
    { value: '3', display: '3', label: __('Grade 3') },
    { value: '4', display: '4', label: __('Grade 4') },
    { value: '5', display: '5', label: __('Grade 5') },
    { value: '6', display: '6', label: __('Grade 6') },
    { value: '7', display: '7', label: __('Grade 7') },
    { value: '8', display: '8', label: __('Grade 8') },
    { value: '9', display: '9', label: __('Grade 9') },
    { value: '10', display: '10', label: __('Grade 10') },
    { value: '11', display: '11', label: __('Grade 11') },
    { value: '12', display: '12', label: __('Grade 12') },
    { value: 'uni', display: 'ĐH', label: __('University') },
];
const englishCerts = [
    { value: 'ielts', label: 'IELTS', icon: '🌍', desc: __('Academic & General Training') },
    { value: 'toeic', label: 'TOEIC', icon: '💼', desc: __('Listening & Reading / Speaking & Writing') },
    { value: 'toefl', label: 'TOEFL', icon: '🎓', desc: __('Internet-Based Test (iBT)') },
    { value: 'cambridge', label: 'Cambridge', icon: '🏛️', desc: __('KET / PET / FCE / CAE / CPE') },
    { value: 'vstep', label: 'VSTEP', icon: '🇻🇳', desc: __('Vietnamese Standardized Test') },
    { value: 'aptis', label: 'Aptis', icon: '📊', desc: __('British Council Assessment') },
    { value: 'sat', label: 'SAT', icon: '📘', desc: __('College Board English') },
    { value: 'grade', label: __('School Grade'), icon: '🏫', desc: __('Grade 1–12 school English') },
];
const selectedLevel = ref('');
// --- Audiences ---
const audiences = [
    __('General'),
    __('Advanced'),
    __('Remedial'),
    __('Specialized'),
    __('Exam Prep'),
    __('University Prep'),
];
const selectedAudience = ref('');
const sessionSearchQuery = ref('');
const selectedSession = ref('');
const sessionStart = ref(0);
const sessionLimit = 20;
const hasMoreSessions = ref(true);
const allSessions = ref([]);
const sessionsResource = createResource({
    url: 'lms.lms.api.get_ai_grading_sessions',
    makeParams() {
        return {
            grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
            start: sessionStart.value,
            limit: sessionLimit,
            search: sessionSearchQuery.value,
        };
    },
    onSuccess(data) {
        if (data && data.length < sessionLimit) {
            hasMoreSessions.value = false;
        }
        else if (!data || data.length === 0) {
            hasMoreSessions.value = false;
        }
        else {
            hasMoreSessions.value = true;
        }
        if (data) {
            const formatted = data.map(s => ({
                name: s.session_name,
                meta: `${s.subject || ''} ${s.level || ''}`,
                id: s.name,
                routeSlug: s.route_slug || toRouteSlug(s.session_name || s.name),
                status: s.status,
                progress: s.status || __('Open'),
                color: ['#2d6a4f', '#1d4ed8', '#b45309', '#9f1239'][Math.abs(s.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 4],
            }));
            if (sessionStart.value === 0) {
                allSessions.value = formatted;
            }
            else {
                // Append unique sessions
                const existingIds = new Set(allSessions.value.map(s => s.id));
                formatted.forEach(s => {
                    if (!existingIds.has(s.id)) {
                        allSessions.value.push(s);
                    }
                });
            }
        }
    }
});
const sessions = computed(() => {
    // Filtering is now largely handled server-side, 
    // but we keep this computed to return the aggregated list
    return allSessions.value;
});
onMounted(() => {
    refreshSessions();
});
// Debounced search
let searchTimeout = null;
watch(sessionSearchQuery, (val) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        refreshSessions();
    }, 300);
});
async function loadMoreSessions() {
    if (!hasMoreSessions.value || sessionsResource.loading)
        return;
    sessionStart.value = allSessions.value.length;
    await sessionsResource.fetch();
}
function onScroll(e) {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadMoreSessions();
    }
}
// --- New Session Modal ---
const showNewSessionModal = ref(false);
const newSession = reactive({ name: '', className: '', notes: '' });
const fileInput = ref(null);
const uploadedFileName = ref('');
const showEditSessionModal = ref(false);
const editSessionForm = reactive({
    id: '',
    session_name: '',
    subject: '',
    level: '',
    ai_notes: '',
    status: 'Open',
});
const createSessionResource = createResource({
    url: 'lms.lms.api.create_ai_grading_session',
});
const sessionDetailResource = createResource({
    url: 'lms.lms.api.get_ai_grading_session_detail',
});
const updateSessionResource = createResource({
    url: 'lms.lms.api.update_ai_grading_session',
});
const deleteSessionResource = createResource({
    url: 'lms.lms.api.delete_ai_grading_session',
});
function toRouteSlug(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedFileName.value = file.name;
    }
}
async function createSession() {
    if (!newSession.name)
        return;
    const res = await createSessionResource.submit({
        data: {
            session_name: newSession.name,
            grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
            subject: selectedSubject.value,
            level: selectedLevel.value,
            ai_notes: newSession.notes,
            status: 'Open',
        }
    });
    if (res) {
        const sessionDoc = typeof res === 'string'
            ? { name: res, route_slug: toRouteSlug(newSession.name) }
            : res;
        const newSessionSlug = sessionDoc.route_slug || toRouteSlug(newSession.name);
        showNewSessionModal.value = false;
        newSession.name = '';
        newSession.className = '';
        newSession.notes = '';
        await refreshSessions();
        enterSession(newSessionSlug);
    }
}
// --- System Resources (Quizzes & Assignments) ---
const selectedResource = ref('');
const aiNotes = ref('');
const quizzes = createListResource({
    doctype: 'LMS Quiz',
    fields: ['name', 'title'],
    limit: 50,
    orderBy: 'modified desc',
    auto: props.type === 'test',
});
const assignments = createListResource({
    doctype: 'LMS Assignment',
    fields: ['name', 'title', 'type'],
    filters: { type: 'Text' },
    limit: 50,
    orderBy: 'modified desc',
    auto: props.type === 'hw',
});
// --- Proceed ---
async function refreshSessions() {
    sessionStart.value = 0;
    hasMoreSessions.value = true;
    await sessionsResource.fetch();
}
function enterSession(sessionSlug, additionalQuery = {}) {
    router.push({
        name: 'AIGradingEssayWorkspace',
        params: {
            type: props.type,
            sessionSlug: sessionSlug,
        },
        query: additionalQuery,
    });
}
async function openSession(session) {
    if (session.status !== 'Open') {
        await updateSessionResource.submit({
            session: session.id,
            data: { status: 'Open' }
        });
    }
    enterSession(session.routeSlug);
}
function viewSessionStats(session) {
    router.push({
        name: 'AIGradingSessionStatistics',
        params: {
            type: props.type,
            sessionSlug: session.routeSlug,
        },
    });
}
async function openEditSessionModal(sessionId) {
    const res = await sessionDetailResource.submit({ session: sessionId });
    if (!res)
        return;
    editSessionForm.id = res.name || sessionId;
    editSessionForm.session_name = res.session_name || '';
    editSessionForm.subject = res.subject || '';
    editSessionForm.level = res.level || '';
    editSessionForm.ai_notes = res.ai_notes || '';
    editSessionForm.status = res.status || 'Open';
    showEditSessionModal.value = true;
}
async function saveSessionEdit() {
    if (!editSessionForm.id || !editSessionForm.session_name?.trim())
        return;
    await updateSessionResource.submit({
        session: editSessionForm.id,
        data: {
            session_name: editSessionForm.session_name.trim(),
            subject: editSessionForm.subject,
            level: editSessionForm.level,
            ai_notes: editSessionForm.ai_notes,
            status: editSessionForm.status,
        },
    });
    showEditSessionModal.value = false;
    await refreshSessions();
}
async function deleteSession(sessionId) {
    if (!sessionId)
        return;
    const confirmed = window.confirm(__('Delete this grading session? All submissions in this session will also be deleted.'));
    if (!confirmed)
        return;
    await deleteSessionResource.submit({ session: sessionId });
    await refreshSessions();
}
async function proceed() {
    if (props.type !== 'exam' && !selectedResource.value)
        return;
    if (selectedSession.value) {
        enterSession(selectedSession.value);
        return;
    }
    // Create a dynamic session if none selected but resource is provided
    const quickSessionName = `Quick Session - ${new Date().toLocaleDateString()}`;
    const res = await createSessionResource.submit({
        data: {
            session_name: quickSessionName,
            grading_type: props.type === 'exam' ? 'Exam' : (props.type === 'test' ? 'Test' : 'Homework'),
            subject: selectedSubject.value,
            level: selectedLevel.value,
            reference_doc_type: props.type === 'test' ? 'LMS Quiz' : 'LMS Assignment',
            reference_doc: selectedResource.value || null,
            ai_notes: aiNotes.value,
            status: 'Open',
        }
    });
    if (res) {
        const sessionDoc = typeof res === 'string'
            ? { route_slug: toRouteSlug(quickSessionName) }
            : res;
        enterSession(sessionDoc.route_slug || toRouteSlug(quickSessionName));
    }
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
/** @type {__VLS_StyleScopedClasses['session-list']} */ ;
/** @type {__VLS_StyleScopedClasses['session-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push({ name: 'AIGradingEssay' });
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gray-800']} */ ;
(__VLS_ctx.__('Back'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-2xl font-bold text-gray-900 tracking-tight" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
(__VLS_ctx.pageTitle);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-gray-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
(__VLS_ctx.pageSubtitle);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('Subject'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-wrap gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
for (const [subj] of __VLS_vFor((__VLS_ctx.subjects))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectSubject(subj.value);
                // @ts-ignore
                [__, __, pageTitle, pageSubtitle, subjects, selectSubject,];
            } },
        key: (subj.value),
        ...{ class: "rounded-full border px-3.5 py-1.5 text-sm transition-all" },
        ...{ class: ([
                __VLS_ctx.selectedSubject === subj.value
                    ? __VLS_ctx.accentClasses.chipSelected
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    (subj.label);
    // @ts-ignore
    [selectedSubject, accentClasses,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.isEnglish ? __VLS_ctx.__('Certificate / Level') : __VLS_ctx.__('Grade Level'));
if (!__VLS_ctx.isEnglish) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-7']} */ ;
    for (const [grade] of __VLS_vFor((__VLS_ctx.standardGrades))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isEnglish))
                        return;
                    __VLS_ctx.selectedLevel = grade.value;
                    // @ts-ignore
                    [__, __, isEnglish, isEnglish, standardGrades, selectedLevel,];
                } },
            key: (grade.value),
            ...{ class: "rounded-lg border px-2 py-3 text-center transition-all" },
            ...{ class: ([
                    __VLS_ctx.selectedLevel === grade.value
                        ? __VLS_ctx.accentClasses.chipSelected
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-lg font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (grade.display);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] text-gray-400" },
            ...{ class: (__VLS_ctx.selectedLevel === grade.value ? __VLS_ctx.accentClasses.text : '') },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        (grade.label);
        // @ts-ignore
        [accentClasses, accentClasses, selectedLevel, selectedLevel,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
    for (const [cert] of __VLS_vFor((__VLS_ctx.englishCerts))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.isEnglish))
                        return;
                    __VLS_ctx.selectedLevel = cert.value;
                    // @ts-ignore
                    [selectedLevel, englishCerts,];
                } },
            key: (cert.value),
            ...{ class: "group rounded-xl border p-4 text-left transition-all" },
            ...{ class: ([
                    __VLS_ctx.selectedLevel === cert.value
                        ? __VLS_ctx.accentClasses.chipSelected
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-2xl mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (cert.icon);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-semibold" },
            ...{ class: (__VLS_ctx.selectedLevel === cert.value ? __VLS_ctx.accentClasses.text : 'text-gray-800') },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (cert.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-0.5 text-[10px] leading-tight" },
            ...{ class: (__VLS_ctx.selectedLevel === cert.value ? __VLS_ctx.accentClasses.textLight : 'text-gray-400') },
        });
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
        (cert.desc);
        // @ts-ignore
        [accentClasses, accentClasses, accentClasses, selectedLevel, selectedLevel, selectedLevel,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
(__VLS_ctx.__('Target Audience'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-wrap gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
for (const [aud] of __VLS_vFor((__VLS_ctx.audiences))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedAudience = aud;
                // @ts-ignore
                [__, audiences, selectedAudience,];
            } },
        key: (aud),
        ...{ class: "rounded-full border px-3.5 py-1.5 text-sm transition-all" },
        ...{ class: ([
                __VLS_ctx.selectedAudience === aud
                    ? __VLS_ctx.accentClasses.chipSelected
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700',
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    (aud);
    // @ts-ignore
    [accentClasses, selectedAudience,];
}
if (__VLS_ctx.type === 'exam') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-semibold text-gray-800" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    (__VLS_ctx.__('Grading Sessions'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-emerald-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-700']} */ ;
    (__VLS_ctx.__('Exam requires session'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#2d6a4f] focus:outline-none" },
        placeholder: (__VLS_ctx.__('Search session by ID or name...')),
    });
    (__VLS_ctx.sessionSearchQuery);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "absolute right-3 top-2.5 text-xs text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onScroll: (__VLS_ctx.onScroll) },
        ...{ class: "session-list space-y-2 pr-1 scroll-smooth rounded-lg bg-gray-100/60 p-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['session-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['scroll-smooth']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-100/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
    if (!__VLS_ctx.sessions.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        (__VLS_ctx.__('No grading sessions found.'));
    }
    for (const [session] of __VLS_vFor((__VLS_ctx.sessions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (session.id),
            ...{ class: "session-item group flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-all border-gray-100 bg-gray-50 shadow-sm sm:flex-nowrap" },
            ...{ class: (__VLS_ctx.accentClasses.hoverSession) },
        });
        /** @type {__VLS_StyleScopedClasses['session-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-nowrap']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ class: "h-2 w-2 rounded-full flex-shrink-0" },
            ...{ style: ({ background: session.color }) },
        });
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-0 flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "truncate text-sm font-medium text-gray-800 transition-colors" },
            ...{ class: ('group-hover:' + __VLS_ctx.accentClasses.text) },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (session.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[11px] text-gray-400 font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (session.meta);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ml-auto flex w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:flex-nowrap" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-nowrap']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.type === 'exam'))
                        return;
                    __VLS_ctx.openSession(session);
                    // @ts-ignore
                    [__, __, __, __, accentClasses, accentClasses, type, sessionSearchQuery, onScroll, sessions, sessions, openSession,];
                } },
            ...{ class: "rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-100" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-emerald-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-emerald-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-emerald-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-emerald-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-emerald-100']} */ ;
        (session.status === 'Open' ? __VLS_ctx.__('Open') : (session.progress || __VLS_ctx.__('Open')));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.type === 'exam'))
                        return;
                    __VLS_ctx.viewSessionStats(session);
                    // @ts-ignore
                    [__, __, viewSessionStats,];
                } },
            ...{ class: "rounded-md border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 px-2.5 py-1 text-[11px] font-bold text-[#2d6a4f] shadow-sm transition-all hover:bg-[#2d6a4f]/10" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#2d6a4f]/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#2d6a4f]/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#2d6a4f]']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2d6a4f]/10']} */ ;
        (__VLS_ctx.__('Statistics'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.type === 'exam'))
                        return;
                    __VLS_ctx.openEditSessionModal(session.id);
                    // @ts-ignore
                    [__, openEditSessionModal,];
                } },
            ...{ class: "rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-100" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-blue-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-blue-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-blue-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-blue-100']} */ ;
        (__VLS_ctx.__('Edit'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.type === 'exam'))
                        return;
                    __VLS_ctx.deleteSession(session.id);
                    // @ts-ignore
                    [__, deleteSession,];
                } },
            ...{ class: "rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-rose-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-rose-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-rose-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-rose-100']} */ ;
        (__VLS_ctx.__('Delete'));
        // @ts-ignore
        [__,];
    }
    if (__VLS_ctx.sessionsResource.loading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "py-4 text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-emerald-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-solid']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-emerald-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-r-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-[-0.125em]']} */ ;
        /** @type {__VLS_StyleScopedClasses['motion-reduce:animate-[spin_1.5s_linear_infinite]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ml-2 text-xs text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        (__VLS_ctx.__('Loading more...'));
    }
    if (!__VLS_ctx.hasMoreSessions && __VLS_ctx.allSessions.length > 5) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "py-4 text-center text-[10px] text-gray-400 uppercase tracking-widest" },
        });
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        (__VLS_ctx.__('End of list'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.type === 'exam'))
                    return;
                __VLS_ctx.showNewSessionModal = true;
                // @ts-ignore
                [__, __, sessionsResource, hasMoreSessions, allSessions, showNewSessionModal,];
            } },
        ...{ class: "mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-200 bg-gray-100/70 py-2.5 text-sm font-medium transition-all" },
        ...{ class: ([__VLS_ctx.accentClasses.text, __VLS_ctx.accentClasses.hoverSession]) },
    });
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-100/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    (__VLS_ctx.__('Create new session'));
}
if (__VLS_ctx.type === 'test' || __VLS_ctx.type === 'hw') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-semibold text-gray-800" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    (__VLS_ctx.type === 'test' ? __VLS_ctx.__('Select Quiz') : __VLS_ctx.__('Select Assignment'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rounded-full px-2 py-0.5 text-[10px] font-medium" },
        ...{ class: ([__VLS_ctx.type === 'test' ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-[#b45309]/10 text-[#b45309]']) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.type === 'test' ? __VLS_ctx.__('System Quizzes') : __VLS_ctx.__('Text Assignments Only'));
    if ((__VLS_ctx.type === 'test' && __VLS_ctx.quizzes.list.loading) || (__VLS_ctx.type === 'hw' && __VLS_ctx.assignments.list.loading)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-4 text-center text-sm text-gray-500" },
        });
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        (__VLS_ctx.__('Loading resources...'));
    }
    else if (__VLS_ctx.type === 'test') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.selectedResource),
            ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#1d4ed8] focus:bg-white focus:outline-none" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1d4ed8]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
            disabled: true,
        });
        (__VLS_ctx.__('Choose a quiz from the system...'));
        for (const [r] of __VLS_vFor((__VLS_ctx.quizzes.data))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (r.name),
                value: (r.name),
            });
            (r.title || r.name);
            // @ts-ignore
            [__, __, __, __, __, __, __, accentClasses, accentClasses, type, type, type, type, type, type, type, type, quizzes, quizzes, assignments, selectedResource,];
        }
    }
    else if (__VLS_ctx.type === 'hw') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.selectedResource),
            ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#b45309] focus:bg-white focus:outline-none" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#b45309]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
            disabled: true,
        });
        (__VLS_ctx.__('Choose a text assignment from the system...'));
        for (const [r] of __VLS_vFor((__VLS_ctx.assignments.data))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (r.name),
                value: (r.name),
            });
            (r.title || r.name);
            // @ts-ignore
            [__, type, assignments, selectedResource,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-5 border-t border-gray-100 pt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    (__VLS_ctx.__('AI Grading Notes'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-normal lowercase text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['lowercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    (__VLS_ctx.__('Optional'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.aiNotes),
        ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 transition-colors focus:bg-white focus:outline-none" },
        ...{ class: (__VLS_ctx.type === 'test' ? 'focus:border-[#1d4ed8]' : 'focus:border-[#b45309]') },
        rows: "3",
        placeholder: (__VLS_ctx.__('Enter specific instructions, deductions, focal points for AI to evaluate...')),
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
}
if (__VLS_ctx.type !== 'exam') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.proceed) },
        ...{ class: "w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed" },
        ...{ class: ([__VLS_ctx.accentClasses.button, __VLS_ctx.accentClasses.hover]) },
        ...{ style: (__VLS_ctx.accentClasses.buttonStyle) },
        disabled: (!__VLS_ctx.selectedResource && __VLS_ctx.type !== 'exam'),
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    (__VLS_ctx.__('Start Grading'));
}
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.showNewSessionModal),
    title: (__VLS_ctx.__('Create New Session')),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.showNewSessionModal),
    title: (__VLS_ctx.__('Create New Session')),
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
    (__VLS_ctx.__('Session Name (Tên phiên)'));
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        type: "text",
        modelValue: (__VLS_ctx.newSession.name),
        placeholder: (__VLS_ctx.__('e.g. Midterm II — 2024–2025')),
    }));
    const __VLS_9 = __VLS_8({
        type: "text",
        modelValue: (__VLS_ctx.newSession.name),
        placeholder: (__VLS_ctx.__('e.g. Midterm II — 2024–2025')),
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
    (__VLS_ctx.__('Class (Lớp)'));
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        type: "text",
        modelValue: (__VLS_ctx.newSession.className),
        placeholder: (__VLS_ctx.__('e.g. 12A1, 12A2')),
    }));
    const __VLS_14 = __VLS_13({
        type: "text",
        modelValue: (__VLS_ctx.newSession.className),
        placeholder: (__VLS_ctx.__('e.g. 12A1, 12A2')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
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
    (__VLS_ctx.__('Upload File Đề bài & Đáp án'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.handleFileChange) },
        type: "file",
        ref: "fileInput",
        ...{ class: "hidden" },
        accept: ".pdf,.doc,.docx",
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$refs.fileInput.click();
                // @ts-ignore
                [__, __, __, __, __, __, __, __, __, __, accentClasses, accentClasses, accentClasses, type, type, type, showNewSessionModal, selectedResource, aiNotes, proceed, newSession, newSession, handleFileChange, $refs,];
            } },
        ...{ class: "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-all cursor-pointer" },
        ...{ class: (__VLS_ctx.accentClasses.hoverSession) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mb-2 text-2xl text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    if (__VLS_ctx.uploadedFileName) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm font-bold text-center" },
            ...{ class: (__VLS_ctx.accentClasses.text) },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        (__VLS_ctx.uploadedFileName);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-medium text-gray-600 text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        (__VLS_ctx.__('Kéo thả hoặc click để upload file'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-1 text-[10px] text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    (__VLS_ctx.__('Hỗ trợ: PDF, DOCX (Tối đa 10MB)'));
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
    (__VLS_ctx.__('AI Grading Notes'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-normal lowercase text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['lowercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    (__VLS_ctx.__('Optional'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.newSession.notes),
        ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none" },
        rows: "3",
        placeholder: (__VLS_ctx.__('Enter specific instructions, deductions, focal points for AI to evaluate...')),
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    // @ts-ignore
    [__, __, __, __, __, accentClasses, accentClasses, newSession, uploadedFileName, uploadedFileName,];
}
{
    const { actions: __VLS_17 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-2 px-4 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onClick': {} },
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showNewSessionModal = false;
                // @ts-ignore
                [showNewSessionModal,];
            } });
    const { default: __VLS_25 } = __VLS_21.slots;
    (__VLS_ctx.__('Cancel'));
    // @ts-ignore
    [__,];
    var __VLS_21;
    var __VLS_22;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.createSession) },
        ...{ class: "rounded-lg px-4 py-2 text-sm font-bold shadow-md transition-all" },
        ...{ class: ([__VLS_ctx.accentClasses.button, __VLS_ctx.accentClasses.hover]) },
        ...{ style: (__VLS_ctx.accentClasses.buttonStyle) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    (__VLS_ctx.__('Create & Open'));
    // @ts-ignore
    [__, accentClasses, accentClasses, accentClasses, createSession,];
}
// @ts-ignore
[];
var __VLS_3;
let __VLS_26;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.showEditSessionModal),
    title: (__VLS_ctx.__('Edit Session')),
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.showEditSessionModal),
    title: (__VLS_ctx.__('Edit Session')),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
{
    const { 'body-content': __VLS_32 } = __VLS_29.slots;
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
    (__VLS_ctx.__('Session Name'));
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        type: "text",
        modelValue: (__VLS_ctx.editSessionForm.session_name),
        placeholder: (__VLS_ctx.__('Enter session name')),
    }));
    const __VLS_35 = __VLS_34({
        type: "text",
        modelValue: (__VLS_ctx.editSessionForm.session_name),
        placeholder: (__VLS_ctx.__('Enter session name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
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
    (__VLS_ctx.__('Subject'));
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        type: "text",
        modelValue: (__VLS_ctx.editSessionForm.subject),
        placeholder: (__VLS_ctx.__('Enter subject')),
    }));
    const __VLS_40 = __VLS_39({
        type: "text",
        modelValue: (__VLS_ctx.editSessionForm.subject),
        placeholder: (__VLS_ctx.__('Enter subject')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
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
    (__VLS_ctx.__('Level'));
    let __VLS_43;
    /** @ts-ignore @type { | typeof __VLS_components.Input} */
    Input;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        type: "text",
        modelValue: (__VLS_ctx.editSessionForm.level),
        placeholder: (__VLS_ctx.__('Enter level')),
    }));
    const __VLS_45 = __VLS_44({
        type: "text",
        modelValue: (__VLS_ctx.editSessionForm.level),
        placeholder: (__VLS_ctx.__('Enter level')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
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
    (__VLS_ctx.__('Status'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.editSessionForm.status),
        ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-800 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Open",
    });
    (__VLS_ctx.__('Open'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Closed",
    });
    (__VLS_ctx.__('Closed'));
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
    (__VLS_ctx.__('AI Grading Notes'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.editSessionForm.ai_notes),
        ...{ class: "w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 transition-colors focus:border-[#2d6a4f] focus:bg-white focus:outline-none" },
        rows: "3",
        placeholder: (__VLS_ctx.__('Enter notes for this session...')),
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-[#2d6a4f]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    // @ts-ignore
    [__, __, __, __, __, __, __, __, __, __, __, __, showEditSessionModal, editSessionForm, editSessionForm, editSessionForm, editSessionForm, editSessionForm,];
}
{
    const { actions: __VLS_48 } = __VLS_29.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-2 px-4 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    let __VLS_49;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        ...{ 'onClick': {} },
    }));
    const __VLS_51 = __VLS_50({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    let __VLS_54;
    const __VLS_55 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showEditSessionModal = false;
                // @ts-ignore
                [showEditSessionModal,];
            } });
    const { default: __VLS_56 } = __VLS_52.slots;
    (__VLS_ctx.__('Cancel'));
    // @ts-ignore
    [__,];
    var __VLS_52;
    var __VLS_53;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveSessionEdit) },
        ...{ class: "rounded-lg px-4 py-2 text-sm font-bold shadow-md transition-all" },
        ...{ class: ([__VLS_ctx.accentClasses.button, __VLS_ctx.accentClasses.hover]) },
        ...{ style: (__VLS_ctx.accentClasses.buttonStyle) },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    (__VLS_ctx.__('Save Changes'));
    // @ts-ignore
    [__, accentClasses, accentClasses, accentClasses, saveSessionEdit,];
}
// @ts-ignore
[];
var __VLS_29;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        type: { type: String, required: true },
    },
});
export default {};
