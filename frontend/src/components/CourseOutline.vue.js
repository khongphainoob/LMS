/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, createResource, Tooltip, toast } from 'frappe-ui';
import { getCurrentInstance, inject, ref, watch } from 'vue';
import Draggable from 'vuedraggable';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { Check, ChevronRight, FileText, FilePenLine, HelpCircle, MonitorPlay, NotebookPen, Plus, SquareCode, Trash2, Notebook, } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import ChapterModal from '@/components/Modals/ChapterModal.vue';
const route = useRoute();
const router = useRouter();
const user = inject('$user');
const showChapterModal = ref(false);
const currentChapter = ref(null);
const app = getCurrentInstance();
const { $dialog } = app.appContext.config.globalProperties;
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
    showOutline: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    allowEdit: {
        type: Boolean,
        default: false,
    },
    getProgress: {
        type: Boolean,
        default: false,
    },
    lessonProgress: {
        type: Number,
        default: 0,
    },
});
const outline = createResource({
    url: 'lms.lms.utils.get_course_outline',
    cache: ['course_outline', props.courseName],
    makeParams() {
        return {
            course: props.courseName,
            progress: props.getProgress,
        };
    },
    auto: true,
});
watch(() => props.courseName, () => {
    outline.reload();
});
watch(() => props.lessonProgress, () => {
    outline.reload();
});
const deleteLesson = createResource({
    url: 'lms.lms.api.delete_lesson',
    makeParams(values) {
        return {
            lesson: values.lesson,
            chapter: values.chapter,
        };
    },
    onSuccess() {
        outline.reload();
        toast.success(__('Lesson deleted successfully'));
    },
});
const updateLessonIndex = createResource({
    url: 'lms.lms.api.update_lesson_index',
    makeParams(values) {
        return {
            lesson: values.lesson,
            sourceChapter: values.sourceChapter,
            targetChapter: values.targetChapter,
            idx: values.idx,
        };
    },
    onSuccess() {
        toast.success(__('Lesson moved successfully'));
    },
});
const updateChapterIndex = createResource({
    url: 'lms.lms.api.update_chapter_index',
    makeParams(values) {
        return {
            chapter: values.chapter,
            course: values.course,
            idx: values.idx,
        };
    },
    onSuccess() {
        toast.success(__('Chapter moved successfully'));
    },
});
const trashLesson = (lessonName, chapterName) => {
    $dialog({
        title: __('Delete this lesson?'),
        message: __('Deleting this lesson will permanently remove it from the course. This action cannot be undone. Are you sure you want to continue?'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick(close) {
                    deleteLesson.submit({
                        lesson: lessonName,
                        chapter: chapterName,
                    });
                    close();
                },
            },
        ],
    });
};
const openChapterDetail = (index) => {
    return index == route.params.chapterNumber || index == 1;
};
const openChapterModal = (chapter = null) => {
    currentChapter.value = chapter;
    showChapterModal.value = true;
};
const getCurrentChapter = () => {
    return currentChapter.value;
};
const updateOutline = (e) => {
    updateLessonIndex.submit({
        lesson: e.item.__draggable_context.element.name,
        sourceChapter: e.from.dataset.chapter,
        targetChapter: e.to.dataset.chapter,
        idx: e.newIndex,
    });
};
const updateChapterOrder = (e) => {
    updateChapterIndex.submit({
        chapter: e.item.__draggable_context.element.name,
        course: props.courseName,
        idx: e.newIndex,
    });
};
const deleteChapter = createResource({
    url: 'lms.lms.api.delete_chapter',
    makeParams(values) {
        return {
            chapter: values.chapter,
        };
    },
    onSuccess() {
        outline.reload();
        toast.success(__('Chapter deleted successfully'));
    },
});
const trashChapter = (chapterName) => {
    $dialog({
        title: __('Delete this chapter?'),
        message: __('Deleting this chapter will also delete all its lessons and permanently remove it from the course. This action cannot be undone. Are you sure you want to continue?'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick(close) {
                    deleteChapter.submit({ chapter: chapterName });
                    close();
                },
            },
        ],
    });
};
const redirectToChapter = (chapter) => {
    if (!chapter.is_scorm_package)
        return;
    event.preventDefault();
    if (props.allowEdit)
        return;
    if (!user.data) {
        toast.success(__('Please enroll for this course to view this lesson'));
        return;
    }
    router.push({
        name: 'SCORMChapter',
        params: {
            courseName: props.courseName,
            chapterName: chapter.name,
        },
    });
};
const isActiveLesson = (lessonNumber) => {
    return (route.params.chapterNumber == lessonNumber.split('-')[0] &&
        route.params.lessonNumber == lessonNumber.split('-')[1]);
};
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
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
if (__VLS_ctx.title && (__VLS_ctx.outline.data?.length || __VLS_ctx.allowEdit)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between space-x-2 mb-4 px-2" },
        ...{ class: ({
                'sticky top-0 z-10 bg-surface-white border-b px-3 py-2.5 sm:px-5': __VLS_ctx.allowEdit,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-semibold text-lg leading-5 text-ink-gray-9" },
        ...{ class: ({ 'font-medium text-p-base': __VLS_ctx.allowEdit }) },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-p-base']} */ ;
    (__VLS_ctx.__(__VLS_ctx.title));
    if (__VLS_ctx.allowEdit) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ 'onClick': {} },
            size: "sm",
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
            size: "sm",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.title && (__VLS_ctx.outline.data?.length || __VLS_ctx.allowEdit)))
                        return;
                    if (!(__VLS_ctx.allowEdit))
                        return;
                    __VLS_ctx.openChapterModal();
                    // @ts-ignore
                    [title, title, outline, allowEdit, allowEdit, allowEdit, allowEdit, __, openChapterModal,];
                } });
        const { default: __VLS_7 } = __VLS_3.slots;
        {
            const { prefix: __VLS_8 } = __VLS_3.slots;
            let __VLS_9;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_11 = __VLS_10({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_10));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Add'));
        // @ts-ignore
        [__,];
        var __VLS_3;
        var __VLS_4;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: ({
            'border-2 rounded-md py-2 px-2': __VLS_ctx.showOutline && __VLS_ctx.outline.data?.length,
        }) },
});
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.Draggable | typeof __VLS_components.Draggable} */
Draggable;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    ...{ 'onEnd': {} },
    list: (__VLS_ctx.outline.data),
    disabled: (!__VLS_ctx.allowEdit),
    itemKey: "name",
    group: "chapters",
}));
const __VLS_16 = __VLS_15({
    ...{ 'onEnd': {} },
    list: (__VLS_ctx.outline.data),
    disabled: (!__VLS_ctx.allowEdit),
    itemKey: "name",
    group: "chapters",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
let __VLS_19;
const __VLS_20 = ({ end: {} },
    { onEnd: (__VLS_ctx.updateChapterOrder) });
const { default: __VLS_21 } = __VLS_17.slots;
{
    const { item: __VLS_22 } = __VLS_17.slots;
    const [{ element: chapter, index }] = __VLS_vSlot(__VLS_22);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chapter-item" },
    });
    /** @type {__VLS_StyleScopedClasses['chapter-item']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.Disclosure | typeof __VLS_components.Disclosure} */
    Disclosure;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        key: (chapter.name),
        defaultOpen: (__VLS_ctx.openChapterDetail(chapter.idx)),
    }));
    const __VLS_25 = __VLS_24({
        key: (chapter.name),
        defaultOpen: (__VLS_ctx.openChapterDetail(chapter.idx)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    {
        const { default: __VLS_28 } = __VLS_26.slots;
        const [{ open }] = __VLS_vSlot(__VLS_28);
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.DisclosureButton | typeof __VLS_components.DisclosureButton} */
        DisclosureButton;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            ref: "",
            ...{ class: "flex items-center w-full p-2 group" },
        }));
        const __VLS_31 = __VLS_30({
            ref: "",
            ...{ class: "flex items-center w-full p-2 group" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_34 = {};
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        const { default: __VLS_36 } = __VLS_32.slots;
        let __VLS_37;
        /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
        ChevronRight;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            ...{ class: ({
                    'rotate-90 transform duration-200': open,
                    'duration-200': !open,
                    hidden: chapter.is_scorm_package,
                    open: index == 1,
                }) },
            ...{ class: "h-4 w-4 text-ink-gray-9 stroke-1" },
        }));
        const __VLS_39 = __VLS_38({
            ...{ class: ({
                    'rotate-90 transform duration-200': open,
                    'duration-200': !open,
                    hidden: chapter.is_scorm_package,
                    open: index == 1,
                }) },
            ...{ class: "h-4 w-4 text-ink-gray-9 stroke-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['open']} */ ;
        /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
        /** @type {__VLS_StyleScopedClasses['transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.redirectToChapter(chapter);
                    // @ts-ignore
                    [outline, outline, allowEdit, showOutline, updateChapterOrder, openChapterDetail, redirectToChapter,];
                } },
            ...{ class: "text-base text-left text-ink-gray-9 font-medium leading-5 ml-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        (chapter.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex ml-auto space-x-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        let __VLS_42;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            text: (__VLS_ctx.__('Edit Chapter')),
            placement: "bottom",
        }));
        const __VLS_44 = __VLS_43({
            text: (__VLS_ctx.__('Edit Chapter')),
            placement: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        const { default: __VLS_47 } = __VLS_45.slots;
        if (__VLS_ctx.allowEdit) {
            let __VLS_48;
            /** @ts-ignore @type { | typeof __VLS_components.FilePenLine} */
            FilePenLine;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
                ...{ 'onClick': {} },
                ...{ class: "h-4 w-4 text-ink-gray-9 invisible group-hover:visible" },
            }));
            const __VLS_50 = __VLS_49({
                ...{ 'onClick': {} },
                ...{ class: "h-4 w-4 text-ink-gray-9 invisible group-hover:visible" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            let __VLS_53;
            const __VLS_54 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.allowEdit))
                            return;
                        __VLS_ctx.openChapterModal(chapter);
                        // @ts-ignore
                        [allowEdit, __, openChapterModal,];
                    } });
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
            var __VLS_51;
            var __VLS_52;
        }
        // @ts-ignore
        [];
        var __VLS_45;
        let __VLS_55;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
            text: (__VLS_ctx.__('Delete Chapter')),
            placement: "bottom",
        }));
        const __VLS_57 = __VLS_56({
            text: (__VLS_ctx.__('Delete Chapter')),
            placement: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        const { default: __VLS_60 } = __VLS_58.slots;
        if (__VLS_ctx.allowEdit) {
            let __VLS_61;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                ...{ 'onClick': {} },
                ...{ class: "h-4 w-4 text-ink-red-3 invisible group-hover:visible" },
            }));
            const __VLS_63 = __VLS_62({
                ...{ 'onClick': {} },
                ...{ class: "h-4 w-4 text-ink-red-3 invisible group-hover:visible" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            let __VLS_66;
            const __VLS_67 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.allowEdit))
                            return;
                        __VLS_ctx.trashChapter(chapter.name);
                        // @ts-ignore
                        [allowEdit, __, trashChapter,];
                    } });
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
            var __VLS_64;
            var __VLS_65;
        }
        // @ts-ignore
        [];
        var __VLS_58;
        // @ts-ignore
        [];
        var __VLS_32;
        if (!chapter.is_scorm_package) {
            let __VLS_68;
            /** @ts-ignore @type { | typeof __VLS_components.DisclosurePanel | typeof __VLS_components.DisclosurePanel} */
            DisclosurePanel;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({}));
            const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
            const { default: __VLS_73 } = __VLS_71.slots;
            if (!chapter.is_scorm_package) {
                let __VLS_74;
                /** @ts-ignore @type { | typeof __VLS_components.Draggable | typeof __VLS_components.Draggable} */
                Draggable;
                // @ts-ignore
                const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
                    ...{ 'onEnd': {} },
                    list: (chapter.lessons),
                    disabled: (!__VLS_ctx.allowEdit),
                    itemKey: "name",
                    group: "items",
                    dataChapter: (chapter.name),
                }));
                const __VLS_76 = __VLS_75({
                    ...{ 'onEnd': {} },
                    list: (chapter.lessons),
                    disabled: (!__VLS_ctx.allowEdit),
                    itemKey: "name",
                    group: "items",
                    dataChapter: (chapter.name),
                }, ...__VLS_functionalComponentArgsRest(__VLS_75));
                let __VLS_79;
                const __VLS_80 = ({ end: {} },
                    { onEnd: (__VLS_ctx.updateOutline) });
                const { default: __VLS_81 } = __VLS_77.slots;
                {
                    const { item: __VLS_82 } = __VLS_77.slots;
                    const [{ element: lesson }] = __VLS_vSlot(__VLS_82);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "outline-lesson pl-8 py-2 pr-4 text-ink-gray-9" },
                        ...{ class: (__VLS_ctx.isActiveLesson(lesson.number) ? 'bg-surface-gray-3' : '') },
                    });
                    /** @type {__VLS_StyleScopedClasses['outline-lesson']} */ ;
                    /** @type {__VLS_StyleScopedClasses['pl-8']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                    let __VLS_83;
                    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                    routerLink;
                    // @ts-ignore
                    const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
                        to: ({
                            name: __VLS_ctx.allowEdit ? 'LessonForm' : 'Lesson',
                            params: {
                                courseName: __VLS_ctx.courseName,
                                chapterNumber: lesson.number.split('-')[0],
                                lessonNumber: lesson.number.split('-')[1],
                            },
                        }),
                    }));
                    const __VLS_85 = __VLS_84({
                        to: ({
                            name: __VLS_ctx.allowEdit ? 'LessonForm' : 'Lesson',
                            params: {
                                courseName: __VLS_ctx.courseName,
                                chapterNumber: lesson.number.split('-')[0],
                                lessonNumber: lesson.number.split('-')[1],
                            },
                        }),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
                    const { default: __VLS_88 } = __VLS_86.slots;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center text-sm leading-5 group" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['group']} */ ;
                    if (lesson.icon === 'icon-youtube') {
                        let __VLS_89;
                        /** @ts-ignore @type { | typeof __VLS_components.MonitorPlay} */
                        MonitorPlay;
                        // @ts-ignore
                        const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }));
                        const __VLS_91 = __VLS_90({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                    }
                    else if (lesson.icon === 'icon-quiz') {
                        let __VLS_94;
                        /** @ts-ignore @type { | typeof __VLS_components.HelpCircle} */
                        HelpCircle;
                        // @ts-ignore
                        const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }));
                        const __VLS_96 = __VLS_95({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_95));
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                    }
                    else if (lesson.icon === 'icon-assignment') {
                        let __VLS_99;
                        /** @ts-ignore @type { | typeof __VLS_components.NotebookPen} */
                        NotebookPen;
                        // @ts-ignore
                        const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }));
                        const __VLS_101 = __VLS_100({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_100));
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                    }
                    else if (lesson.icon === 'icon-code') {
                        let __VLS_104;
                        /** @ts-ignore @type { | typeof __VLS_components.SquareCode} */
                        SquareCode;
                        // @ts-ignore
                        const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }));
                        const __VLS_106 = __VLS_105({
                            ...{ class: "h-4 w-4 stroke-1 mr-2" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                    }
                    else if (lesson.icon === 'icon-list') {
                        let __VLS_109;
                        /** @ts-ignore @type { | typeof __VLS_components.FileText} */
                        FileText;
                        // @ts-ignore
                        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
                            ...{ class: "h-4 w-4 text-ink-gray-9 stroke-1 mr-2" },
                        }));
                        const __VLS_111 = __VLS_110({
                            ...{ class: "h-4 w-4 text-ink-gray-9 stroke-1 mr-2" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                        /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                    }
                    (lesson.title);
                    if (__VLS_ctx.allowEdit) {
                        let __VLS_114;
                        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
                        Trash2;
                        // @ts-ignore
                        const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
                            ...{ 'onClick': {} },
                            ...{ class: "h-4 w-4 text-ink-red-3 ml-auto invisible group-hover:visible" },
                        }));
                        const __VLS_116 = __VLS_115({
                            ...{ 'onClick': {} },
                            ...{ class: "h-4 w-4 text-ink-red-3 ml-auto invisible group-hover:visible" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
                        let __VLS_119;
                        const __VLS_120 = ({ click: {} },
                            { onClick: (...[$event]) => {
                                    if (!(!chapter.is_scorm_package))
                                        return;
                                    if (!(!chapter.is_scorm_package))
                                        return;
                                    if (!(__VLS_ctx.allowEdit))
                                        return;
                                    __VLS_ctx.trashLesson(lesson.name, chapter.name);
                                    // @ts-ignore
                                    [allowEdit, allowEdit, allowEdit, updateOutline, isActiveLesson, courseName, trashLesson,];
                                } });
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
                        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
                        /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
                        /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
                        var __VLS_117;
                        var __VLS_118;
                    }
                    if (lesson.is_complete) {
                        let __VLS_121;
                        /** @ts-ignore @type { | typeof __VLS_components.Check} */
                        Check;
                        // @ts-ignore
                        const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
                            ...{ class: "h-4 w-4 text-green-700 ml-2" },
                        }));
                        const __VLS_123 = __VLS_122({
                            ...{ class: "h-4 w-4 text-green-700 ml-2" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_122));
                        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-green-700']} */ ;
                        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
                    }
                    // @ts-ignore
                    [];
                    var __VLS_86;
                    // @ts-ignore
                    [];
                }
                // @ts-ignore
                [];
                var __VLS_77;
                var __VLS_78;
            }
            if (__VLS_ctx.allowEdit) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex mt-2 mb-4 pl-8" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-8']} */ ;
                if (!chapter.is_scorm_package) {
                    let __VLS_126;
                    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                    routerLink;
                    // @ts-ignore
                    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
                        to: ({
                            name: 'LessonForm',
                            params: {
                                courseName: __VLS_ctx.courseName,
                                chapterNumber: chapter.idx,
                                lessonNumber: chapter.lessons.length + 1,
                            },
                        }),
                    }));
                    const __VLS_128 = __VLS_127({
                        to: ({
                            name: 'LessonForm',
                            params: {
                                courseName: __VLS_ctx.courseName,
                                chapterNumber: chapter.idx,
                                lessonNumber: chapter.lessons.length + 1,
                            },
                        }),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
                    const { default: __VLS_131 } = __VLS_129.slots;
                    let __VLS_132;
                    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                    Button;
                    // @ts-ignore
                    const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({}));
                    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
                    const { default: __VLS_137 } = __VLS_135.slots;
                    (__VLS_ctx.__('Add Lesson'));
                    // @ts-ignore
                    [allowEdit, __, courseName,];
                    var __VLS_135;
                    // @ts-ignore
                    [];
                    var __VLS_129;
                }
            }
            // @ts-ignore
            [];
            var __VLS_71;
        }
        // @ts-ignore
        [];
        __VLS_26.slots['' /* empty slot name completion */];
    }
    var __VLS_26;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_17;
var __VLS_18;
if (__VLS_ctx.user.data) {
    const __VLS_138 = ChapterModal;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        modelValue: (__VLS_ctx.showChapterModal),
        outline: (__VLS_ctx.outline),
        course: (__VLS_ctx.courseName),
        chapterDetail: (__VLS_ctx.getCurrentChapter()),
    }));
    const __VLS_140 = __VLS_139({
        modelValue: (__VLS_ctx.showChapterModal),
        outline: (__VLS_ctx.outline),
        course: (__VLS_ctx.courseName),
        chapterDetail: (__VLS_ctx.getCurrentChapter()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
}
// @ts-ignore
var __VLS_35 = __VLS_34;
// @ts-ignore
[outline, courseName, user, showChapterModal, getCurrentChapter,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
        showOutline: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: '',
        },
        allowEdit: {
            type: Boolean,
            default: false,
        },
        getProgress: {
            type: Boolean,
            default: false,
        },
        lessonProgress: {
            type: Number,
            default: 0,
        },
    },
});
export default {};
