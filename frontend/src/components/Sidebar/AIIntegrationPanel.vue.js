/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import * as icons from 'lucide-vue-next';
import { ShieldCheck, GraduationCap } from 'lucide-vue-next';
const emit = defineEmits(['navigate']);
const props = defineProps({
    isTeacher: {
        type: Boolean,
        default: false,
    },
    isModerator: {
        type: Boolean,
        default: false,
    },
    isStudent: {
        type: Boolean,
        default: false,
    },
    isEnabled: {
        type: Boolean,
        default: true,
    },
});
const router = useRouter();
const teacherItems = computed(() => {
    if (!props.isTeacher)
        return [];
    const items = [
        {
            label: 'Grading Book',
            icon: 'BookText',
            to: 'GradingBook',
            activeFor: ['GradingBook'],
        },
        {
            label: 'AI Grading',
            icon: 'Bot',
            to: 'AIGradingObjective',
            activeFor: [
                'AIGrading',
                'AIGradingObjective',
                'AIGradingEssay',
                'AIGradingEssayConfig',
                'AIGradingEssayWorkspace',
                'AIGradingSessionStatistics',
            ],
        },
    ];
    if (props.isModerator) {
        items.push({
            label: 'AI Analytics',
            icon: 'ChartColumnBig',
            to: 'AIGradingAdmin',
            activeFor: ['AIGradingAdmin'],
        });
    }
    return items;
});
const studentItems = computed(() => [
    {
        label: 'Smart Chatbot',
        icon: 'MessageCircleMore',
        to: 'StudentAIHelper',
        activeFor: ['StudentAIHelper'],
    },
    {
        label: 'Q&A Support',
        icon: 'MessagesSquare',
        to: 'Search',
        activeFor: ['Search'],
    },
]);
const isActive = (item) => item.activeFor?.includes(router.currentRoute.value.name);
const go = (item) => {
    if (item.to && router.hasRoute(item.to)) {
        router.push({ name: item.to });
        emit('navigate');
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.isEnabled && (__VLS_ctx.isTeacher || __VLS_ctx.isStudent)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "mx-2 my-2.5" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-2.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-2 mt-3 flex gap-1.5 px-1 text-base font-medium text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('AI Integration'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    if (__VLS_ctx.isTeacher) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-1 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-ink-gray-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.ShieldCheck} */
        ShieldCheck;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ class: "h-3.5 w-3.5 text-ink-gray-6" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "h-3.5 w-3.5 text-ink-gray-6" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Teacher'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.teacherItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isEnabled && (__VLS_ctx.isTeacher || __VLS_ctx.isStudent)))
                            return;
                        if (!(__VLS_ctx.isTeacher))
                            return;
                        __VLS_ctx.go(item);
                        // @ts-ignore
                        [isEnabled, isTeacher, isTeacher, isStudent, __, __, teacherItems, go,];
                    } },
                key: (item.label),
                ...{ class: "group flex w-full min-h-[44px] items-center rounded-r-md border-l-[3px] px-3 py-2 text-left text-base transition duration-200" },
                ...{ class: (__VLS_ctx.isActive(item)
                        ? 'bg-surface-selected text-ink-gray-9 border-ink-gray-5 font-semibold shadow-sm'
                        : 'border-transparent text-ink-gray-7 hover:bg-surface-gray-2 hover:text-ink-gray-9') },
            });
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-r-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-l-[3px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
            const __VLS_5 = (__VLS_ctx.icons[item.icon]);
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                ...{ class: "h-[18px] w-[18px] stroke-1.5" },
                ...{ class: (__VLS_ctx.isActive(item) ? 'text-ink-gray-9' : 'text-ink-gray-6 group-hover:text-ink-gray-9') },
            }));
            const __VLS_7 = __VLS_6({
                ...{ class: "h-[18px] w-[18px] stroke-1.5" },
                ...{ class: (__VLS_ctx.isActive(item) ? 'text-ink-gray-9' : 'text-ink-gray-6 group-hover:text-ink-gray-9') },
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            /** @type {__VLS_StyleScopedClasses['h-[18px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-[18px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__(item.label));
            // @ts-ignore
            [__, isActive, isActive, icons,];
        }
    }
    if (__VLS_ctx.isStudent) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-1 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-ink-gray-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
        GraduationCap;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            ...{ class: "h-3.5 w-3.5 text-ink-gray-6" },
        }));
        const __VLS_12 = __VLS_11({
            ...{ class: "h-3.5 w-3.5 text-ink-gray-6" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Student'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.studentItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isEnabled && (__VLS_ctx.isTeacher || __VLS_ctx.isStudent)))
                            return;
                        if (!(__VLS_ctx.isStudent))
                            return;
                        __VLS_ctx.go(item);
                        // @ts-ignore
                        [isStudent, __, go, studentItems,];
                    } },
                key: (item.label),
                ...{ class: "group flex w-full min-h-[44px] items-center rounded-r-md border-l-[3px] px-3 py-2 text-left text-base transition duration-200" },
                ...{ class: (__VLS_ctx.isActive(item)
                        ? 'bg-surface-selected text-ink-gray-9 border-ink-gray-5 font-semibold shadow-sm'
                        : 'border-transparent text-ink-gray-7 hover:bg-surface-gray-2 hover:text-ink-gray-9') },
            });
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-r-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-l-[3px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
            const __VLS_15 = (__VLS_ctx.icons[item.icon]);
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                ...{ class: "h-[18px] w-[18px] stroke-1.5" },
                ...{ class: (__VLS_ctx.isActive(item) ? 'text-ink-gray-9' : 'text-ink-gray-6 group-hover:text-ink-gray-9') },
            }));
            const __VLS_17 = __VLS_16({
                ...{ class: "h-[18px] w-[18px] stroke-1.5" },
                ...{ class: (__VLS_ctx.isActive(item) ? 'text-ink-gray-9' : 'text-ink-gray-6 group-hover:text-ink-gray-9') },
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            /** @type {__VLS_StyleScopedClasses['h-[18px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-[18px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__(item.label));
            // @ts-ignore
            [__, isActive, isActive, icons,];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    props: {
        isTeacher: {
            type: Boolean,
            default: false,
        },
        isModerator: {
            type: Boolean,
            default: false,
        },
        isStudent: {
            type: Boolean,
            default: false,
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
    },
});
export default {};
