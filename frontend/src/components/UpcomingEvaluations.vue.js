/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Ban, Calendar, Clock, GraduationCap, HeadsetIcon, EllipsisVertical, } from 'lucide-vue-next';
import { inject, ref, getCurrentInstance, computed } from 'vue';
import { formatTime } from '@/utils';
import { Button, createResource, createListResource, call } from 'frappe-ui';
import EvaluationModal from '@/components/Modals/EvaluationModal.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
const dayjs = inject('$dayjs');
const user = inject('$user');
const showEvalModal = ref(false);
const app = getCurrentInstance();
const { $dialog } = app.appContext.config.globalProperties;
const props = defineProps({
    batch: {
        type: String,
        default: null,
    },
    courses: {
        type: Array,
        default: [],
    },
    endDate: {
        type: String,
        default: null,
    },
    forHome: {
        type: Boolean,
        default: false,
    },
});
const upcoming_evals = createListResource({
    doctype: 'LMS Certificate Request',
    filters: {
        course: props.courses?.length
            ? ['in', props.courses.map((course) => course.course)]
            : undefined,
        batch_name: props.batch || undefined,
        status: 'Upcoming',
        member: user?.data?.name,
        date: ['>=', dayjs().format('YYYY-MM-DD')],
    },
    fields: [
        'name',
        'date',
        'start_time',
        'evaluator_name',
        'course_title',
        'google_meet_link',
    ],
    orderBy: 'date',
    auto: true,
});
function openEvalModal() {
    showEvalModal.value = true;
}
const openEvalCall = (evl) => {
    window.open(evl.google_meet_link, '_blank');
};
const evaluationCourses = computed(() => {
    return props.courses.filter((course) => {
        return course.evaluator != '';
    });
});
const canScheduleEvals = computed(() => {
    return (upcoming_evals.data?.length != evaluationCourses.value?.length &&
        !props.forHome &&
        !endDateHasPassed.value);
});
const endDateHasPassed = computed(() => {
    return dayjs().isSameOrAfter(dayjs(props.endDate));
});
const cancelEvaluation = (evl) => {
    $dialog({
        title: __('Cancel this evaluation?'),
        message: __('Are you sure you want to cancel this evaluation? This action cannot be undone.'),
        actions: [
            {
                label: __('Cancel'),
                theme: 'red',
                variant: 'solid',
                onClick(close) {
                    call('lms.lms.api.cancel_evaluation', { evaluation: evl }).then(() => {
                        upcoming_evals.reload();
                    });
                    close();
                },
            },
        ],
    });
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
if (!__VLS_ctx.forHome || (__VLS_ctx.forHome && __VLS_ctx.upcoming_evals.data?.length)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg text-ink-gray-9 font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.__('Upcoming Evaluations'));
    if (__VLS_ctx.canScheduleEvals) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ 'onClick': {} },
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = ({ click: {} },
            { onClick: (__VLS_ctx.openEvalModal) });
        const { default: __VLS_7 } = __VLS_3.slots;
        (__VLS_ctx.__('Schedule Evaluation'));
        // @ts-ignore
        [forHome, forHome, upcoming_evals, __, __, canScheduleEvals, openEvalModal,];
        var __VLS_3;
        var __VLS_4;
    }
    if (__VLS_ctx.endDate && !__VLS_ctx.endDateHasPassed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm leading-5 bg-surface-amber-1 text-ink-amber-3 p-2 rounded-md mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-amber-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (__VLS_ctx.__('The last day to schedule your evaluations is '));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.dayjs(__VLS_ctx.endDate).format('DD MMMM YYYY'));
        (__VLS_ctx.__('Please make sure to schedule your evaluation before this date.'));
    }
    else if (__VLS_ctx.endDateHasPassed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm leading-5 bg-surface-red-1 text-ink-red-3 p-2 rounded-md mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-red-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        (__VLS_ctx.__('The deadline to schedule evaluations has passed. Please contact the Instructor for assistance.'));
    }
    if (__VLS_ctx.upcoming_evals.data?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid gap-4" },
            ...{ class: (__VLS_ctx.forHome ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-3') },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        for (const [evl] of __VLS_vFor((__VLS_ctx.upcoming_evals.data))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border text-ink-gray-7 rounded-md p-3" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-lg font-semibold text-ink-gray-9 leading-5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            (evl.course_title);
            if (evl.date > __VLS_ctx.dayjs().format()) {
                let __VLS_8;
                /** @ts-ignore @type { | typeof __VLS_components.Menu | typeof __VLS_components.Menu} */
                Menu;
                // @ts-ignore
                const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                    as: "div",
                    ...{ class: "relative inline-block text-left" },
                }));
                const __VLS_10 = __VLS_9({
                    as: "div",
                    ...{ class: "relative inline-block text-left" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_9));
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
                const { default: __VLS_13 } = __VLS_11.slots;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_14;
                /** @ts-ignore @type { | typeof __VLS_components.MenuButton | typeof __VLS_components.MenuButton} */
                MenuButton;
                // @ts-ignore
                const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
                    ...{ class: "inline-flex w-full justify-center" },
                }));
                const __VLS_16 = __VLS_15({
                    ...{ class: "inline-flex w-full justify-center" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_15));
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                const { default: __VLS_19 } = __VLS_17.slots;
                let __VLS_20;
                /** @ts-ignore @type { | typeof __VLS_components.EllipsisVertical} */
                EllipsisVertical;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                    ...{ class: "w-4 h-4 stroke-1.5" },
                }));
                const __VLS_22 = __VLS_21({
                    ...{ class: "w-4 h-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                // @ts-ignore
                [forHome, upcoming_evals, upcoming_evals, __, __, __, endDate, endDate, endDateHasPassed, endDateHasPassed, dayjs, dayjs,];
                var __VLS_17;
                let __VLS_25;
                /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
                transition;
                // @ts-ignore
                const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                    enterActiveClass: "transition duration-100 ease-out",
                    enterFromClass: "transform scale-95 opacity-0",
                    enterToClass: "transform scale-100 opacity-100",
                    leaveActiveClass: "transition duration-75 ease-in",
                    leaveFromClass: "transform scale-100 opacity-100",
                    leaveToClass: "transform scale-95 opacity-0",
                }));
                const __VLS_27 = __VLS_26({
                    enterActiveClass: "transition duration-100 ease-out",
                    enterFromClass: "transform scale-95 opacity-0",
                    enterToClass: "transform scale-100 opacity-100",
                    leaveActiveClass: "transition duration-75 ease-in",
                    leaveFromClass: "transform scale-100 opacity-100",
                    leaveToClass: "transform scale-95 opacity-0",
                }, ...__VLS_functionalComponentArgsRest(__VLS_26));
                const { default: __VLS_30 } = __VLS_28.slots;
                let __VLS_31;
                /** @ts-ignore @type { | typeof __VLS_components.MenuItems | typeof __VLS_components.MenuItems} */
                MenuItems;
                // @ts-ignore
                const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                    ...{ class: "absolute mt-2 w-32 rounded-md bg-surface-white border p-1.5" },
                }));
                const __VLS_33 = __VLS_32({
                    ...{ class: "absolute mt-2 w-32 rounded-md bg-surface-white border p-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_32));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
                const { default: __VLS_36 } = __VLS_34.slots;
                let __VLS_37;
                /** @ts-ignore @type { | typeof __VLS_components.MenuItem | typeof __VLS_components.MenuItem} */
                MenuItem;
                // @ts-ignore
                const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
                const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
                {
                    const { default: __VLS_42 } = __VLS_40.slots;
                    const [{ active }] = __VLS_vSlot(__VLS_42);
                    let __VLS_43;
                    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                    Button;
                    // @ts-ignore
                    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
                        ...{ 'onClick': {} },
                        variant: "ghost",
                        ...{ class: "w-full" },
                    }));
                    const __VLS_45 = __VLS_44({
                        ...{ 'onClick': {} },
                        variant: "ghost",
                        ...{ class: "w-full" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
                    let __VLS_48;
                    const __VLS_49 = ({ click: {} },
                        { onClick: (...[$event]) => {
                                if (!(!__VLS_ctx.forHome || (__VLS_ctx.forHome && __VLS_ctx.upcoming_evals.data?.length)))
                                    return;
                                if (!(__VLS_ctx.upcoming_evals.data?.length))
                                    return;
                                if (!(evl.date > __VLS_ctx.dayjs().format()))
                                    return;
                                __VLS_ctx.cancelEvaluation(evl);
                                // @ts-ignore
                                [cancelEvaluation,];
                            } });
                    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                    const { default: __VLS_50 } = __VLS_46.slots;
                    {
                        const { prefix: __VLS_51 } = __VLS_46.slots;
                        let __VLS_52;
                        /** @ts-ignore @type { | typeof __VLS_components.Ban} */
                        Ban;
                        // @ts-ignore
                        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                            active: (active),
                            ...{ class: "size-4 stroke-1.5" },
                            'aria-hidden': "true",
                        }));
                        const __VLS_54 = __VLS_53({
                            active: (active),
                            ...{ class: "size-4 stroke-1.5" },
                            'aria-hidden': "true",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                        // @ts-ignore
                        [];
                    }
                    (__VLS_ctx.__('Cancel'));
                    // @ts-ignore
                    [__,];
                    var __VLS_46;
                    var __VLS_47;
                    // @ts-ignore
                    [];
                    __VLS_40.slots['' /* empty slot name completion */];
                }
                var __VLS_40;
                // @ts-ignore
                [];
                var __VLS_34;
                // @ts-ignore
                [];
                var __VLS_28;
                // @ts-ignore
                [];
                var __VLS_11;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            let __VLS_57;
            /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
            Calendar;
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_59 = __VLS_58({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_58));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ml-2" },
            });
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            (__VLS_ctx.dayjs(evl.date).format('DD MMMM YYYY'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.Clock} */
            Clock;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_64 = __VLS_63({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ml-2" },
            });
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            (__VLS_ctx.formatTime(evl.start_time));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            let __VLS_67;
            /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
            GraduationCap;
            // @ts-ignore
            const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_69 = __VLS_68({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_68));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ml-2" },
            });
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            (evl.evaluator_name);
            if (evl.google_meet_link) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center justify-between space-x-2 mt-4" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                let __VLS_72;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
                    ...{ 'onClick': {} },
                    ...{ class: "w-full" },
                }));
                const __VLS_74 = __VLS_73({
                    ...{ 'onClick': {} },
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_73));
                let __VLS_77;
                const __VLS_78 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(!__VLS_ctx.forHome || (__VLS_ctx.forHome && __VLS_ctx.upcoming_evals.data?.length)))
                                return;
                            if (!(__VLS_ctx.upcoming_evals.data?.length))
                                return;
                            if (!(evl.google_meet_link))
                                return;
                            __VLS_ctx.openEvalCall(evl);
                            // @ts-ignore
                            [dayjs, formatTime, openEvalCall,];
                        } });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                const { default: __VLS_79 } = __VLS_75.slots;
                {
                    const { prefix: __VLS_80 } = __VLS_75.slots;
                    let __VLS_81;
                    /** @ts-ignore @type { | typeof __VLS_components.HeadsetIcon} */
                    HeadsetIcon;
                    // @ts-ignore
                    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                        ...{ class: "w-4 h-4 stroke-1.5" },
                    }));
                    const __VLS_83 = __VLS_82({
                        ...{ class: "w-4 h-4 stroke-1.5" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
                    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                    // @ts-ignore
                    [];
                }
                (__VLS_ctx.__('Join Call'));
                // @ts-ignore
                [__,];
                var __VLS_75;
                var __VLS_76;
            }
            // @ts-ignore
            [];
        }
    }
    else if (!__VLS_ctx.endDateHasPassed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.__('Schedule an evaluation to get certified.'));
    }
}
const __VLS_86 = EvaluationModal;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    batch: (__VLS_ctx.batch),
    endDate: (__VLS_ctx.endDate),
    courses: (__VLS_ctx.courses),
    modelValue: (__VLS_ctx.showEvalModal),
    reloadEvals: (__VLS_ctx.upcoming_evals),
}));
const __VLS_88 = __VLS_87({
    batch: (__VLS_ctx.batch),
    endDate: (__VLS_ctx.endDate),
    courses: (__VLS_ctx.courses),
    modelValue: (__VLS_ctx.showEvalModal),
    reloadEvals: (__VLS_ctx.upcoming_evals),
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
// @ts-ignore
[upcoming_evals, __, endDate, endDateHasPassed, batch, courses, showEvalModal,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: String,
            default: null,
        },
        courses: {
            type: Array,
            default: [],
        },
        endDate: {
            type: String,
            default: null,
        },
        forHome: {
            type: Boolean,
            default: false,
        },
    },
});
export default {};
