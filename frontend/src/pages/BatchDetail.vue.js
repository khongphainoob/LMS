/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, Clock } from 'lucide-vue-next';
import { formatTime } from '@/utils';
import { Breadcrumbs, createResource, usePageMeta } from 'frappe-ui';
import { sessionStore } from '@/stores/session';
import CourseCard from '@/components/CourseCard.vue';
import BatchOverlay from '@/components/BatchOverlay.vue';
import DateRange from '../components/Common/DateRange.vue';
import CourseInstructors from '@/components/CourseInstructors.vue';
import UserAvatar from '@/components/UserAvatar.vue';
const user = inject('$user');
const router = useRouter();
const { brand } = sessionStore();
const props = defineProps({
    batchName: {
        type: String,
        required: true,
    },
});
const batch = createResource({
    url: 'lms.lms.utils.get_batch_details',
    cache: ['batch', props.batchName],
    params: {
        batch: props.batchName,
    },
    auto: true,
    onSuccess: (data) => {
        if (!data) {
            router.push({ name: 'Batches' });
        }
    },
});
const courses = createResource({
    url: 'lms.lms.utils.get_batch_courses',
    params: {
        batch: props.batchName,
    },
    cache: ['batchCourses', props.batchName],
    auto: true,
});
const breadcrumbs = computed(() => {
    let items = [{ label: __('Batches'), route: { name: 'Batches' } }];
    items.push({
        label: batch?.data?.title,
        route: { name: 'BatchDetail', params: { batchName: batch?.data?.name } },
    });
    return items;
});
usePageMeta(() => {
    return {
        title: batch?.data?.title,
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
if (__VLS_ctx.batch.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "sticky top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
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
        items: (__VLS_ctx.breadcrumbs),
    }));
    const __VLS_2 = __VLS_1({
        items: (__VLS_ctx.breadcrumbs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "m-5 pb-10" },
    });
    /** @type {__VLS_StyleScopedClasses['m-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "md:w-2/3" },
    });
    /** @type {__VLS_StyleScopedClasses['md:w-2/3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.batch.data.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "my-3 leading-6 text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['my-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    (__VLS_ctx.batch.data.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex avatar-group overlap" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-6 mr-1" },
        ...{ class: ({
                'avatar-group overlap': __VLS_ctx.batch.data.instructors.length > 1,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
    for (const [instructor] of __VLS_vFor((__VLS_ctx.batch.data.instructors))) {
        const __VLS_5 = UserAvatar;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            user: (instructor),
        }));
        const __VLS_7 = __VLS_6({
            user: (instructor),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        // @ts-ignore
        [batch, batch, batch, batch, batch, breadcrumbs,];
    }
    const __VLS_10 = CourseInstructors;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        instructors: (__VLS_ctx.batch.data.instructors),
    }));
    const __VLS_12 = __VLS_11({
        instructors: (__VLS_ctx.batch.data.instructors),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const __VLS_15 = BatchOverlay;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        batch: (__VLS_ctx.batch),
        ...{ class: "md:hidden mt-5" },
    }));
    const __VLS_17 = __VLS_16({
        batch: (__VLS_ctx.batch),
        ...{ class: "md:hidden mt-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    /** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal mt-10" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.batch.data.batch_details) }, null, null);
    /** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hidden md:block" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:block']} */ ;
    const __VLS_20 = BatchOverlay;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        batch: (__VLS_ctx.batch),
    }));
    const __VLS_22 = __VLS_21({
        batch: (__VLS_ctx.batch),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    if (__VLS_ctx.batch.data.courses.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center mt-10" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-2xl font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('Courses'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-5" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
        if (__VLS_ctx.batch.data.courses) {
            for (const [course] of __VLS_vFor((__VLS_ctx.courses.data))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (course.course),
                });
                let __VLS_25;
                /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                routerLink;
                // @ts-ignore
                const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                    to: ({
                        name: 'CourseDetail',
                        params: {
                            courseName: course.name,
                        },
                    }),
                }));
                const __VLS_27 = __VLS_26({
                    to: ({
                        name: 'CourseDetail',
                        params: {
                            courseName: course.name,
                        },
                    }),
                }, ...__VLS_functionalComponentArgsRest(__VLS_26));
                const { default: __VLS_30 } = __VLS_28.slots;
                const __VLS_31 = CourseCard;
                // @ts-ignore
                const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                    course: (course),
                    key: (course.name),
                }));
                const __VLS_33 = __VLS_32({
                    course: (course),
                    key: (course.name),
                }, ...__VLS_functionalComponentArgsRest(__VLS_32));
                // @ts-ignore
                [batch, batch, batch, batch, batch, batch, __, courses,];
                var __VLS_28;
                // @ts-ignore
                [];
            }
        }
        if (__VLS_ctx.batch.data.batch_details_raw) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "batch-description" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.batch.data.batch_details_raw) }, null, null);
            /** @type {__VLS_StyleScopedClasses['batch-description']} */ ;
        }
    }
}
// @ts-ignore
[batch, batch,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batchName: {
            type: String,
            required: true,
        },
    },
});
export default {};
