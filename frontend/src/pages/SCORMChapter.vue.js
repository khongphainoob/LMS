/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, call, createDocumentResource, createListResource, createResource, usePageMeta, } from 'frappe-ui';
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useSidebar } from '@/stores/sidebar';
import { sessionStore } from '../stores/session';
const { brand } = sessionStore();
const sidebarStore = useSidebar();
const user = inject('$user');
const readyToRender = ref(false);
const isSuccessfullyCompleted = ref(false);
// If courseRestartOnFailure is true, student has to restart the whole course if failed.
// Otherwise, student could retake the final quiz portion.
// Ideally, this should be configurable along with `Number of failures before course should restart`.
const courseRestartOnFailure = false;
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
    chapterName: {
        type: String,
        required: true,
    },
});
onBeforeMount(() => {
    sidebarStore.isSidebarCollapsed = true;
    setupSCORMAPI();
});
const chapter = createDocumentResource({
    doctype: 'Course Chapter',
    name: props.chapterName,
    auto: true,
    cache: ['chapter', props.chapterName],
    onSuccess(data) {
        progress.submit();
    },
});
const enrollment = createListResource({
    doctype: 'LMS Enrollment',
    fields: ['member', 'course'],
    filters: {
        course: props.courseName,
        member: user.data?.name,
    },
    auto: true,
    cache: ['enrollments', props.courseName, user.data?.name],
});
const getDataFromLMS = (key) => {
    if (key === 'cmi.core.lesson_status') {
        return progress.data?.status === 'Complete' ? 'passed' : 'incomplete';
    }
    else if (key === 'cmi.launch_data') {
        return progress.data?.scorm_content || '';
    }
    else if (key === 'cmi.suspend_data') {
        return progress.data?.scorm_content || '';
    }
    return '';
};
let saveTimeout = null;
const debouncedSaveProgress = (scormDetails) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveProgress(scormDetails);
    }, 300);
};
const saveDataToLMS = (key, value) => {
    const isLessonStatus = key === 'cmi.core.lesson_status' && value === 'passed';
    const isCompletionStatus = key === 'cmi.completion_status' && value === 'completed';
    const shouldRestart = (key === 'cmi.core.lesson_status' && value === 'failed') ||
        (key === 'cmi.completion_status' && value === 'incomplete');
    if (isLessonStatus || isCompletionStatus) {
        isSuccessfullyCompleted.value = true;
    }
    if (isLessonStatus ||
        isCompletionStatus ||
        (shouldRestart && courseRestartOnFailure)) {
        saveProgress({
            is_complete: isSuccessfullyCompleted.value,
            scorm_content: '',
        });
        return;
    }
    if (key === 'cmi.suspend_data' && !isSuccessfullyCompleted.value) {
        debouncedSaveProgress({
            is_complete: false,
            scorm_content: value,
        });
    }
};
const saveProgress = (scormDetails = null) => {
    call('lms.lms.doctype.course_lesson.course_lesson.save_progress', {
        lesson: chapter.doc.lessons[0].lesson,
        course: props.courseName,
        scorm_details: scormDetails,
    });
};
const progress = createResource({
    url: 'frappe.client.get_value',
    makeParams(values) {
        return {
            doctype: 'LMS Course Progress',
            fieldname: ['status', 'scorm_content'],
            filters: {
                member: user.data?.name,
                lesson: chapter.doc.lessons[0].lesson,
                chapter: chapter.doc.name,
                course: chapter.doc?.course,
            },
        };
    },
    onSuccess(data) {
        readyToRender.value = true;
    },
});
const enrollStudent = () => {
    enrollment.insert.submit({
        course: props.courseName,
        member: user.data?.name,
    }, {
        onSuccess(data) {
            window.location.reload();
        },
    });
};
const setupSCORMAPI = () => {
    window.API_1484_11 = {
        Initialize: () => 'true',
        Terminate: () => 'true',
        GetValue: (key) => {
            console.log(`GET: ${key}`);
            return getDataFromLMS(key);
        },
        SetValue: (key, value) => {
            console.log(`SET: ${key} to value: ${value}`);
            saveDataToLMS(key, value);
            return 'true';
        },
        Commit: () => 'true',
        GetLastError: () => '0',
        GetErrorString: () => '',
        GetDiagnostic: () => '',
    };
    window.API = {
        LMSInitialize: () => 'true',
        LMSFinish: () => 'true',
        LMSGetValue: (key) => {
            console.log(`GET: ${key}`);
            return getDataFromLMS(key);
        },
        LMSSetValue: (key, value) => {
            console.log(`SET: ${key} to value: ${value}`);
            saveDataToLMS(key, value);
            return 'true';
        },
        LMSCommit: () => 'true',
        LMSGetLastError: () => '0',
        LMSGetErrorString: () => '',
        LMSGetDiagnostic: () => '',
    };
};
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Courses'),
            route: { name: 'Courses' },
        },
        {
            label: chapter.doc?.course_title,
            route: { name: 'CourseDetail', params: { courseName: props.courseName } },
        },
        {
            label: chapter.doc?.title,
        },
    ];
});
usePageMeta(() => {
    return {
        title: chapter.doc?.title,
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
Breadcrumbs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
if (__VLS_ctx.readyToRender &&
    (__VLS_ctx.enrollment.data?.length ||
        __VLS_ctx.user.data?.is_moderator ||
        __VLS_ctx.user.data?.is_instructor)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.iframe)({
        src: (__VLS_ctx.chapter.doc.launch_file),
        ...{ class: "w-full h-[calc(100vh-3.00rem)]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[calc(100vh-3.00rem)]']} */ ;
}
else if (!__VLS_ctx.enrollment.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center pt-10 px-5 md:px-0 pb-10" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:px-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.__('You are not enrolled in this course. Please enroll to access this lesson.'));
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.readyToRender &&
                    (__VLS_ctx.enrollment.data?.length ||
                        __VLS_ctx.user.data?.is_moderator ||
                        __VLS_ctx.user.data?.is_instructor)))
                    return;
                if (!(!__VLS_ctx.enrollment.data?.length))
                    return;
                __VLS_ctx.enrollStudent();
                // @ts-ignore
                [breadcrumbs, readyToRender, enrollment, enrollment, user, user, chapter, __, enrollStudent,];
            } });
    const { default: __VLS_12 } = __VLS_8.slots;
    (__VLS_ctx.__('Start Learning'));
    // @ts-ignore
    [__,];
    var __VLS_8;
    var __VLS_9;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
        chapterName: {
            type: String,
            required: true,
        },
    },
});
export default {};
