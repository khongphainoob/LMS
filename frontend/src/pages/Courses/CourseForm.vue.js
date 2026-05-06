/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { TextEditor, Button, createResource, createDocumentResource, FormControl, usePageMeta, toast, } from 'frappe-ui';
import { inject, onMounted, onBeforeUnmount, ref, reactive, watch, getCurrentInstance, } from 'vue';
import { escapeHTML, getMetaInfo, openSettings, sanitizeHTML, updateMetaInfo, } from '@/utils';
import { Trash2, X } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { sessionStore } from '../../stores/session';
import Link from '@/components/Controls/Link.vue';
import CourseOutline from '@/components/CourseOutline.vue';
import MultiSelect from '@/components/Controls/MultiSelect.vue';
import ColorSwatches from '@/components/Controls/ColorSwatches.vue';
import Uploader from '@/components/Controls/Uploader.vue';
const user = inject('$user');
const newTag = ref('');
const { brand } = sessionStore();
const router = useRouter();
const instructors = ref([]);
const related_courses = ref([]);
const app = getCurrentInstance();
const { $dialog } = app.appContext.config.globalProperties;
const isDirty = ref(false);
const props = defineProps({
    course: {
        type: Object,
    },
});
const meta = reactive({
    description: '',
    keywords: '',
});
onMounted(() => {
    if (!user.data?.is_moderator && !user.data?.is_instructor) {
        router.push({ name: 'Courses' });
    }
    window.addEventListener('keydown', keyboardShortcut);
});
const courseResource = createDocumentResource({
    doctype: 'LMS Course',
    name: props.course.data?.name,
    auto: true,
});
watch(() => courseResource.doc, () => {
    check_permission();
    getMetaInfo('courses', courseResource.doc?.name, meta);
    updateCourseData();
});
const updateCourseData = () => {
    Object.keys(courseResource.doc).forEach((key) => {
        if (key == 'instructors') {
            instructors.value = [];
            courseResource.doc.instructors.forEach((instructor) => {
                instructors.value.push(instructor.instructor);
            });
        }
        else if (key == 'related_courses') {
            related_courses.value = [];
            courseResource.doc.related_courses.forEach((course) => {
                related_courses.value.push(course.course);
            });
        }
    });
    let checkboxes = [
        'published',
        'upcoming',
        'disable_self_learning',
        'paid_course',
        'featured',
        'enable_certification',
        'paid_certificate',
    ];
    for (let idx in checkboxes) {
        let key = checkboxes[idx];
        courseResource.doc[key] = courseResource.doc[key] ? true : false;
    }
};
const submitCourse = () => {
    validateFields();
    updateCourse();
};
const validateFields = () => {
    courseResource.doc.description = sanitizeHTML(courseResource.doc.description);
    Object.keys(courseResource.doc).forEach((key) => {
        if (key != 'description' && typeof courseResource.doc[key] === 'string') {
            courseResource.doc[key] = escapeHTML(courseResource.doc[key]);
        }
    });
};
const updateCourse = () => {
    courseResource.setValue.submit({
        ...courseResource.doc,
        instructors: instructors.value.map((instructor) => ({
            instructor: instructor,
        })),
        related_courses: related_courses.value.map((course) => ({
            course: course,
        })),
    }, {
        onSuccess() {
            updateMetaInfo('courses', courseResource.doc?.name, meta);
            toast.success(__('Course updated successfully'));
            isDirty.value = false;
            courseResource.reload();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
            console.error(err);
        },
    });
};
const keyboardShortcut = (e) => {
    if (e.key === 's' &&
        (e.ctrlKey || e.metaKey) &&
        !e.target.classList.contains('ProseMirror')) {
        submitCourse();
        e.preventDefault();
    }
};
onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyboardShortcut);
});
const deleteCourse = createResource({
    url: 'lms.lms.api.delete_course',
    makeParams(values) {
        return {
            course: courseResource.doc?.name,
        };
    },
    onSuccess() {
        toast.success(__('Course deleted successfully'));
        router.push({ name: 'Courses' });
    },
});
const trashCourse = () => {
    $dialog({
        title: __('Delete Course'),
        message: __('Deleting the course will also delete all its chapters and lessons. Are you sure you want to delete this course?'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick(close) {
                    deleteCourse.submit();
                    close();
                },
            },
        ],
    });
};
const updateTags = () => {
    if (newTag.value) {
        courseResource.doc.tags = courseResource.doc.tags
            ? `${courseResource.doc.tags}, ${newTag.value}`
            : newTag.value;
        newTag.value = '';
        makeFormDirty();
    }
};
const removeTag = (tag) => {
    courseResource.doc.tags = courseResource.doc.tags
        ?.split(', ')
        .filter((t) => t !== tag)
        .join(', ');
    newTag.value = '';
    makeFormDirty();
};
const check_permission = () => {
    let user_is_instructor = false;
    if (user.data?.is_moderator)
        return;
    instructors.value.forEach((instructor) => {
        if (!user_is_instructor && instructor == user.data?.name) {
            user_is_instructor = true;
        }
    });
    if (!user_is_instructor) {
        router.push({ name: 'Courses' });
    }
};
const makeFormDirty = () => {
    isDirty.value = true;
};
usePageMeta(() => {
    return {
        title: courseResource.doc?.title,
        icon: brand.favicon,
    };
});
const __VLS_exposed = {
    submitCourse,
    trashCourse,
    isDirty,
};
defineExpose(__VLS_exposed);
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pl-5" },
});
/** @type {__VLS_StyleScopedClasses['pl-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-[70%,30%] overflow-hidden" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-[70%,30%]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
if (__VLS_ctx.courseResource.doc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-[88vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['h-[88vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "my-5" },
    });
    /** @type {__VLS_StyleScopedClasses['my-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pr-5 md:pr-10 pb-5 mb-5 space-y-5 border-b" },
    });
    /** @type {__VLS_StyleScopedClasses['pr-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:pr-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold mb-4 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Details'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.courseResource.doc.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.courseResource.doc.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ input: {} },
        { onInput: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, courseResource, __, __, makeFormDirty,];
            } });
    var __VLS_3;
    var __VLS_4;
    const __VLS_7 = Link;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onUpdate:modelValue': {} },
        doctype: "LMS Category",
        modelValue: (__VLS_ctx.courseResource.doc.category),
        label: (__VLS_ctx.__('Category')),
        onCreate: ((value, close) => __VLS_ctx.openSettings('Categories', close)),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onUpdate:modelValue': {} },
        doctype: "LMS Category",
        modelValue: (__VLS_ctx.courseResource.doc.category),
        label: (__VLS_ctx.__('Category')),
        onCreate: ((value, close) => __VLS_ctx.openSettings('Categories', close)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty, openSettings,];
            } });
    var __VLS_10;
    var __VLS_11;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    const __VLS_14 = MultiSelect;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.instructors),
        doctype: "User",
        label: (__VLS_ctx.__('Instructors')),
        filters: ({ ignore_user_type: 1 }),
        onCreate: ((close) => __VLS_ctx.openSettings('Members', close)),
        required: (true),
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.instructors),
        doctype: "User",
        label: (__VLS_ctx.__('Instructors')),
        filters: ({ ignore_user_type: 1 }),
        onCreate: ((close) => __VLS_ctx.openSettings('Members', close)),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_19;
    const __VLS_20 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [__, makeFormDirty, openSettings, instructors,];
            } });
    var __VLS_17;
    var __VLS_18;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Tags'));
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.newTag),
        placeholder: (__VLS_ctx.__('Add a keyword and then press enter')),
        ...{ class: (['w-full', 'flex-1', 'my-1']) },
        id: "tags",
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.newTag),
        placeholder: (__VLS_ctx.__('Add a keyword and then press enter')),
        ...{ class: (['w-full', 'flex-1', 'my-1']) },
        id: "tags",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_26;
    const __VLS_27 = ({ keyup: {} },
        { onKeyup: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.updateTags();
                // @ts-ignore
                [__, __, newTag, updateTags,];
            } });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-1']} */ ;
    var __VLS_24;
    var __VLS_25;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center flex-wrap gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    if (__VLS_ctx.courseResource.doc.tags) {
        for (const [tag] of __VLS_vFor((__VLS_ctx.courseResource.doc.tags?.split(', ')))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center bg-surface-gray-2 text-ink-gray-7 p-2 rounded-md" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            (tag);
            let __VLS_28;
            /** @ts-ignore @type { | typeof __VLS_components.X} */
            X;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
                ...{ 'onClick': {} },
                ...{ class: "stroke-1.5 w-3 h-3 ml-2 cursor-pointer" },
            }));
            const __VLS_30 = __VLS_29({
                ...{ 'onClick': {} },
                ...{ class: "stroke-1.5 w-3 h-3 ml-2 cursor-pointer" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            let __VLS_33;
            const __VLS_34 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.courseResource.doc))
                            return;
                        if (!(__VLS_ctx.courseResource.doc.tags))
                            return;
                        __VLS_ctx.removeTag(tag);
                        // @ts-ignore
                        [courseResource, courseResource, removeTag,];
                    } });
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            var __VLS_31;
            var __VLS_32;
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    const __VLS_35 = Uploader;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.courseResource.doc.image),
        label: (__VLS_ctx.__('Course Image')),
        required: (false),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.courseResource.doc.image),
        label: (__VLS_ctx.__('Course Image')),
        required: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    const __VLS_41 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty,];
            } });
    var __VLS_38;
    var __VLS_39;
    const __VLS_42 = ColorSwatches;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.courseResource.doc.card_gradient),
        label: (__VLS_ctx.__('Color')),
        description: (__VLS_ctx.__('Choose a color for the course card')),
        ...{ class: "w-full" },
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.courseResource.doc.card_gradient),
        label: (__VLS_ctx.__('Color')),
        description: (__VLS_ctx.__('Choose a color for the course card')),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    const __VLS_48 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, __, makeFormDirty,];
            } });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_45;
    var __VLS_46;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pr-5 md:pr-10 pb-5 mb-5 space-y-5 border-b" },
    });
    /** @type {__VLS_StyleScopedClasses['pr-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:pr-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Settings'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    if (__VLS_ctx.user.data?.is_moderator) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            ...{ 'onChange': {} },
            type: "checkbox",
            modelValue: (__VLS_ctx.courseResource.doc.published),
            label: (__VLS_ctx.__('Published')),
        }));
        const __VLS_51 = __VLS_50({
            ...{ 'onChange': {} },
            type: "checkbox",
            modelValue: (__VLS_ctx.courseResource.doc.published),
            label: (__VLS_ctx.__('Published')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_54;
        const __VLS_55 = ({ change: {} },
            { onChange: (...[$event]) => {
                    if (!(__VLS_ctx.courseResource.doc))
                        return;
                    if (!(__VLS_ctx.user.data?.is_moderator))
                        return;
                    __VLS_ctx.makeFormDirty();
                    // @ts-ignore
                    [courseResource, __, __, makeFormDirty, user,];
                } });
        var __VLS_52;
        var __VLS_53;
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.courseResource.doc.published_on),
            label: (__VLS_ctx.__('Published On')),
            type: "date",
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.courseResource.doc.published_on),
            label: (__VLS_ctx.__('Published On')),
            type: "date",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_61;
        const __VLS_62 = ({ change: {} },
            { onChange: (...[$event]) => {
                    if (!(__VLS_ctx.courseResource.doc))
                        return;
                    if (!(__VLS_ctx.user.data?.is_moderator))
                        return;
                    __VLS_ctx.makeFormDirty();
                    // @ts-ignore
                    [courseResource, __, makeFormDirty,];
                } });
        var __VLS_59;
        var __VLS_60;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    let __VLS_63;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.upcoming),
        label: (__VLS_ctx.__('Upcoming')),
    }));
    const __VLS_65 = __VLS_64({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.upcoming),
        label: (__VLS_ctx.__('Upcoming')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    let __VLS_68;
    const __VLS_69 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty,];
            } });
    var __VLS_66;
    var __VLS_67;
    let __VLS_70;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.featured),
        label: (__VLS_ctx.__('Featured')),
    }));
    const __VLS_72 = __VLS_71({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.featured),
        label: (__VLS_ctx.__('Featured')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_75;
    const __VLS_76 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty,];
            } });
    var __VLS_73;
    var __VLS_74;
    let __VLS_77;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.disable_self_learning),
        label: (__VLS_ctx.__('Disable Self Enrollment')),
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.disable_self_learning),
        label: (__VLS_ctx.__('Disable Self Enrollment')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_82;
    const __VLS_83 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty,];
            } });
    var __VLS_80;
    var __VLS_81;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pr-5 md:pr-10 pb-5 mb-5 space-y-5 border-b" },
    });
    /** @type {__VLS_StyleScopedClasses['pr-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:pr-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('About the Course'));
    let __VLS_84;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.courseResource.doc.short_introduction),
        type: "textarea",
        rows: (5),
        label: (__VLS_ctx.__('Short Introduction')),
        placeholder: (__VLS_ctx.__('A one line introduction to the course that appears on the course card')),
        required: (true),
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.courseResource.doc.short_introduction),
        type: "textarea",
        rows: (5),
        label: (__VLS_ctx.__('Short Introduction')),
        placeholder: (__VLS_ctx.__('A one line introduction to the course that appears on the course card')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_89;
    const __VLS_90 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, __, __, makeFormDirty,];
            } });
    var __VLS_87;
    var __VLS_88;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Course Description'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_91;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.courseResource.doc.description),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
    }));
    const __VLS_93 = __VLS_92({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.courseResource.doc.description),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    let __VLS_96;
    const __VLS_97 = ({ change: {} },
        { onChange: ((val) => {
                __VLS_ctx.courseResource.doc.description = val;
                __VLS_ctx.makeFormDirty();
            }) });
    var __VLS_94;
    var __VLS_95;
    let __VLS_98;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.courseResource.doc.video_link),
        label: (__VLS_ctx.__('Preview Video')),
        placeholder: (__VLS_ctx.__('Paste the youtube link of a short video introducing the course')),
    }));
    const __VLS_100 = __VLS_99({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.courseResource.doc.video_link),
        label: (__VLS_ctx.__('Preview Video')),
        placeholder: (__VLS_ctx.__('Paste the youtube link of a short video introducing the course')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_103;
    const __VLS_104 = ({ input: {} },
        { onInput: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, courseResource, courseResource, __, __, __, makeFormDirty, makeFormDirty,];
            } });
    var __VLS_101;
    var __VLS_102;
    const __VLS_105 = MultiSelect;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.related_courses),
        doctype: "LMS Course",
        label: (__VLS_ctx.__('Related Courses')),
        filters: ({ name: ['!=', __VLS_ctx.courseResource.doc?.name] }),
        onCreate: ((close) => {
            __VLS_ctx.router.push({
                name: 'Courses',
                query: { newCourse: '1' },
            });
        }),
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.related_courses),
        doctype: "LMS Course",
        label: (__VLS_ctx.__('Related Courses')),
        filters: ({ name: ['!=', __VLS_ctx.courseResource.doc?.name] }),
        onCreate: ((close) => {
            __VLS_ctx.router.push({
                name: 'Courses',
                query: { newCourse: '1' },
            });
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_110;
    const __VLS_111 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty, related_courses, router,];
            } });
    var __VLS_108;
    var __VLS_109;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pr-5 md:pr-10 pb-5 space-y-5 border-b" },
    });
    /** @type {__VLS_StyleScopedClasses['pr-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:pr-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold mt-5 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Pricing and Certification'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_112;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.paid_course),
        label: (__VLS_ctx.__('Paid Course')),
    }));
    const __VLS_114 = __VLS_113({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.paid_course),
        label: (__VLS_ctx.__('Paid Course')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    let __VLS_117;
    const __VLS_118 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, __, makeFormDirty,];
            } });
    var __VLS_115;
    var __VLS_116;
    let __VLS_119;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.enable_certification),
        label: (__VLS_ctx.__('Completion Certificate')),
    }));
    const __VLS_121 = __VLS_120({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.enable_certification),
        label: (__VLS_ctx.__('Completion Certificate')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    let __VLS_124;
    const __VLS_125 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty,];
            } });
    var __VLS_122;
    var __VLS_123;
    let __VLS_126;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.paid_certificate),
        label: (__VLS_ctx.__('Paid Certificate')),
    }));
    const __VLS_128 = __VLS_127({
        ...{ 'onChange': {} },
        type: "checkbox",
        modelValue: (__VLS_ctx.courseResource.doc.paid_certificate),
        label: (__VLS_ctx.__('Paid Certificate')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    let __VLS_131;
    const __VLS_132 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [courseResource, __, makeFormDirty,];
            } });
    var __VLS_129;
    var __VLS_130;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    if (__VLS_ctx.courseResource.doc.paid_course ||
        __VLS_ctx.courseResource.doc.paid_certificate) {
        let __VLS_133;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.courseResource.doc.course_price),
            label: (__VLS_ctx.__('Amount')),
            required: (__VLS_ctx.courseResource.doc.paid_course ||
                __VLS_ctx.courseResource.doc.paid_certificate),
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.courseResource.doc.course_price),
            label: (__VLS_ctx.__('Amount')),
            required: (__VLS_ctx.courseResource.doc.paid_course ||
                __VLS_ctx.courseResource.doc.paid_certificate),
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_138;
        const __VLS_139 = ({ input: {} },
            { onInput: (...[$event]) => {
                    if (!(__VLS_ctx.courseResource.doc))
                        return;
                    if (!(__VLS_ctx.courseResource.doc.paid_course ||
                        __VLS_ctx.courseResource.doc.paid_certificate))
                        return;
                    __VLS_ctx.makeFormDirty();
                    // @ts-ignore
                    [courseResource, courseResource, courseResource, courseResource, courseResource, __, makeFormDirty,];
                } });
        var __VLS_136;
        var __VLS_137;
    }
    if (__VLS_ctx.courseResource.doc.paid_certificate) {
        const __VLS_140 = Link;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
            ...{ 'onUpdate:modelValue': {} },
            doctype: "Course Evaluator",
            modelValue: (__VLS_ctx.courseResource.doc.evaluator),
            label: (__VLS_ctx.__('Evaluator')),
            required: (__VLS_ctx.courseResource.doc.paid_certificate),
            onCreate: ((value, close) => __VLS_ctx.openSettings('Evaluators', close)),
        }));
        const __VLS_142 = __VLS_141({
            ...{ 'onUpdate:modelValue': {} },
            doctype: "Course Evaluator",
            modelValue: (__VLS_ctx.courseResource.doc.evaluator),
            label: (__VLS_ctx.__('Evaluator')),
            required: (__VLS_ctx.courseResource.doc.paid_certificate),
            onCreate: ((value, close) => __VLS_ctx.openSettings('Evaluators', close)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        let __VLS_145;
        const __VLS_146 = ({ 'update:modelValue': {} },
            { 'onUpdate:modelValue': (...[$event]) => {
                    if (!(__VLS_ctx.courseResource.doc))
                        return;
                    if (!(__VLS_ctx.courseResource.doc.paid_certificate))
                        return;
                    __VLS_ctx.makeFormDirty();
                    // @ts-ignore
                    [courseResource, courseResource, courseResource, __, makeFormDirty, openSettings,];
                } });
        var __VLS_143;
        var __VLS_144;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    if (__VLS_ctx.courseResource.doc.paid_course ||
        __VLS_ctx.courseResource.doc.paid_certificate) {
        const __VLS_147 = Link;
        // @ts-ignore
        const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
            ...{ 'onUpdate:modelValue': {} },
            doctype: "Currency",
            modelValue: (__VLS_ctx.courseResource.doc.currency),
            filters: ({ enabled: 1 }),
            label: (__VLS_ctx.__('Currency')),
            required: (__VLS_ctx.courseResource.doc.paid_course ||
                __VLS_ctx.courseResource.doc.paid_certificate),
        }));
        const __VLS_149 = __VLS_148({
            ...{ 'onUpdate:modelValue': {} },
            doctype: "Currency",
            modelValue: (__VLS_ctx.courseResource.doc.currency),
            filters: ({ enabled: 1 }),
            label: (__VLS_ctx.__('Currency')),
            required: (__VLS_ctx.courseResource.doc.paid_course ||
                __VLS_ctx.courseResource.doc.paid_certificate),
        }, ...__VLS_functionalComponentArgsRest(__VLS_148));
        let __VLS_152;
        const __VLS_153 = ({ 'update:modelValue': {} },
            { 'onUpdate:modelValue': (...[$event]) => {
                    if (!(__VLS_ctx.courseResource.doc))
                        return;
                    if (!(__VLS_ctx.courseResource.doc.paid_course ||
                        __VLS_ctx.courseResource.doc.paid_certificate))
                        return;
                    __VLS_ctx.makeFormDirty();
                    // @ts-ignore
                    [courseResource, courseResource, courseResource, courseResource, courseResource, __, makeFormDirty,];
                } });
        var __VLS_150;
        var __VLS_151;
    }
    if (__VLS_ctx.courseResource.doc.paid_certificate) {
        let __VLS_154;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.courseResource.doc.timezone),
            label: (__VLS_ctx.__('Timezone')),
            required: (__VLS_ctx.courseResource.doc.paid_certificate),
            placeholder: (__VLS_ctx.__('e.g. IST, UTC, GMT...')),
        }));
        const __VLS_156 = __VLS_155({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.courseResource.doc.timezone),
            label: (__VLS_ctx.__('Timezone')),
            required: (__VLS_ctx.courseResource.doc.paid_certificate),
            placeholder: (__VLS_ctx.__('e.g. IST, UTC, GMT...')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_155));
        let __VLS_159;
        const __VLS_160 = ({ input: {} },
            { onInput: (...[$event]) => {
                    if (!(__VLS_ctx.courseResource.doc))
                        return;
                    if (!(__VLS_ctx.courseResource.doc.paid_certificate))
                        return;
                    __VLS_ctx.makeFormDirty();
                    // @ts-ignore
                    [courseResource, courseResource, courseResource, __, __, makeFormDirty,];
                } });
        var __VLS_157;
        var __VLS_158;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pr-5 md:pr-10 pb-5 space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['pr-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:pr-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold mt-5 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Meta Tags'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    let __VLS_161;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.meta.description),
        label: (__VLS_ctx.__('Meta Description')),
        type: "textarea",
        rows: (7),
    }));
    const __VLS_163 = __VLS_162({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.meta.description),
        label: (__VLS_ctx.__('Meta Description')),
        type: "textarea",
        rows: (7),
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    let __VLS_166;
    const __VLS_167 = ({ input: {} },
        { onInput: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [__, __, makeFormDirty, meta,];
            } });
    var __VLS_164;
    var __VLS_165;
    let __VLS_168;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.meta.keywords),
        label: (__VLS_ctx.__('Meta Keywords')),
        type: "textarea",
        rows: (7),
        placeholder: (__VLS_ctx.__('Comma separated keywords for SEO')),
    }));
    const __VLS_170 = __VLS_169({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.meta.keywords),
        label: (__VLS_ctx.__('Meta Keywords')),
        type: "textarea",
        rows: (7),
        placeholder: (__VLS_ctx.__('Comma separated keywords for SEO')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    let __VLS_173;
    const __VLS_174 = ({ input: {} },
        { onInput: (...[$event]) => {
                if (!(__VLS_ctx.courseResource.doc))
                    return;
                __VLS_ctx.makeFormDirty();
                // @ts-ignore
                [__, __, makeFormDirty, meta,];
            } });
    var __VLS_171;
    var __VLS_172;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-l h-[88vh] overflow-y-auto" },
});
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[88vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
if (__VLS_ctx.courseResource.doc) {
    const __VLS_175 = CourseOutline;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
        courseName: (__VLS_ctx.courseResource.doc.name),
        title: (__VLS_ctx.__('Chapters')),
        allowEdit: (true),
    }));
    const __VLS_177 = __VLS_176({
        courseName: (__VLS_ctx.courseResource.doc.name),
        title: (__VLS_ctx.__('Chapters')),
        allowEdit: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
}
// @ts-ignore
[courseResource, courseResource, __,];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    props: {
        course: {
            type: Object,
        },
    },
});
export default {};
