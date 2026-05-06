/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, TabButtons } from 'frappe-ui';
import { computed, ref } from 'vue';
import { BookOpen, User } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { convertToTitleCase } from '@/utils';
import ProgressBar from '@/components/ProgressBar.vue';
import ProgramEnrollment from '@/pages/Programs/ProgramEnrollment.vue';
import EmptyState from '@/components/EmptyState.vue';
const currentTab = ref('enrolled');
const router = useRouter();
const showEnrollmentConfirmation = ref(false);
const enrollmentProgram = ref(null);
const programs = createResource({
    url: 'lms.lms.utils.get_programs',
    auto: true,
});
const openDetails = (programName, category) => {
    if (category === 'enrolled') {
        router.push({
            name: 'ProgramDetail',
            params: { programName: programName },
        });
    }
    else {
        showEnrollmentConfirmation.value = true;
        enrollmentProgram.value = programName;
    }
};
const tabs = computed(() => {
    return [
        {
            label: __('Enrolled'),
            value: 'enrolled',
        },
        {
            label: __('Published'),
            value: 'published',
        },
    ];
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "py-5 px-5 w-full lg:w-3/4 lg:px-0 mx-auto" },
});
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-3/4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg text-ink-gray-9 font-semibold" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
(__VLS_ctx.__('All Programs'));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
TabButtons;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.currentTab),
    buttons: (__VLS_ctx.tabs),
    ...{ class: "w-fit" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.currentTab),
    buttons: (__VLS_ctx.tabs),
    ...{ class: "w-fit" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
for (const [data, category] of __VLS_vFor((__VLS_ctx.programs.data))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (category == __VLS_ctx.currentTab) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (data.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-1 lg:grid-cols-3 gap-5" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
            for (const [program] of __VLS_vFor((data))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ onClick: (...[$event]) => {
                            if (!(category == __VLS_ctx.currentTab))
                                return;
                            if (!(data.length > 0))
                                return;
                            __VLS_ctx.openDetails(program.name, category);
                            // @ts-ignore
                            [__, currentTab, currentTab, tabs, programs, openDetails,];
                        } },
                    ...{ class: "border rounded-md p-3 hover:border-outline-gray-3 cursor-pointer" },
                });
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-lg font-semibold text-ink-gray-9 mb-2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
                (program.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-5 text-sm text-ink-gray-7" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
                let __VLS_5;
                /** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
                BookOpen;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                    ...{ class: "size-3 stroke-1.5" },
                }));
                const __VLS_7 = __VLS_6({
                    ...{ class: "size-3 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_6));
                /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (program.course_count);
                (program.course_count == 1 ? __VLS_ctx.__('course') : __VLS_ctx.__('courses'));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
                let __VLS_10;
                /** @ts-ignore @type { | typeof __VLS_components.User} */
                User;
                // @ts-ignore
                const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                    ...{ class: "size-4 stroke-1.5" },
                }));
                const __VLS_12 = __VLS_11({
                    ...{ class: "size-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_11));
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (program.member_count || 0);
                (program.member_count == 1 ? __VLS_ctx.__('member') : __VLS_ctx.__('members'));
                if (Object.keys(program).includes('progress')) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "mt-5" },
                    });
                    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
                    const __VLS_15 = ProgressBar;
                    // @ts-ignore
                    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                        progress: (program.progress),
                    }));
                    const __VLS_17 = __VLS_16({
                        progress: (program.progress),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "text-sm text-ink-gray-7 mt-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                    (Math.ceil(program.progress));
                    (__VLS_ctx.__('completed'));
                }
                // @ts-ignore
                [__, __, __, __, __,];
            }
        }
        else {
            const __VLS_20 = EmptyState;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                type: (__VLS_ctx.convertToTitleCase(category) + ' Programs'),
            }));
            const __VLS_22 = __VLS_21({
                type: (__VLS_ctx.convertToTitleCase(category) + ' Programs'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        }
    }
    // @ts-ignore
    [convertToTitleCase,];
}
const __VLS_25 = ProgramEnrollment;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    modelValue: (__VLS_ctx.showEnrollmentConfirmation),
    programName: (__VLS_ctx.enrollmentProgram),
}));
const __VLS_27 = __VLS_26({
    modelValue: (__VLS_ctx.showEnrollmentConfirmation),
    programName: (__VLS_ctx.enrollmentProgram),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
// @ts-ignore
[showEnrollmentConfirmation, enrollmentProgram,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
