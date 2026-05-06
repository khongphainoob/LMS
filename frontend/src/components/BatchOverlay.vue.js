/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject, computed } from 'vue';
import { Button, createResource, toast } from 'frappe-ui';
import { BookOpen, Clock, CreditCard, Globe, GraduationCap, LogIn, Pencil, Settings, } from 'lucide-vue-next';
import { formatNumberIntoCurrency, formatTime } from '@/utils';
import DateRange from '@/components/Common/DateRange.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const user = inject('$user');
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    batch: {
        type: Object,
        default: null,
    },
});
const enroll = createResource({
    url: 'lms.lms.utils.enroll_in_batch',
    makeParams(values) {
        return {
            batch: props.batch.data.name,
        };
    },
});
const enrollInBatch = () => {
    if (!user.data) {
        window.location.href = `/login?redirect-to=/batches/details/${props.batch.data.name}`;
    }
    enroll.submit({}, {
        onSuccess(data) {
            toast.success(__('You have been enrolled in this batch'));
            router.push({
                name: 'Batch',
                params: {
                    batchName: props.batch.data.name,
                },
            });
        },
    });
};
const isStudent = computed(() => {
    return user.data
        ? props.batch.data?.students?.includes(user.data?.name)
        : false;
});
const isModerator = computed(() => {
    return user.data?.is_moderator;
});
const isEvaluator = computed(() => {
    return user.data?.is_evaluator;
});
const isInstructor = computed(() => {
    return (props.batch.data?.instructors?.filter((instructor) => instructor.name === user.data?.name).length > 0);
});
const canAccessBatch = computed(() => {
    if (!user.data) {
        return false;
    }
    return isModerator.value || isStudent.value || isEvaluator.value;
});
const canEditBatch = computed(() => {
    return isModerator.value || isInstructor.value;
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
        ...{ class: "border-2 rounded-md p-5 lg:w-72" },
    });
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:w-72']} */ ;
    if (__VLS_ctx.batch.data.seat_count && __VLS_ctx.batch.data.seats_left > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm bg-green-100 text-green-700 px-2 py-1 rounded-md" },
            ...{ class: (__VLS_ctx.batch.data.amount || __VLS_ctx.batch.data.courses.length
                    ? 'float-right'
                    : 'w-fit mb-4') },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-green-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-green-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        (__VLS_ctx.batch.data.seats_left);
        if (__VLS_ctx.batch.data.seats_left > 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Seats Left'));
        }
        else if (__VLS_ctx.batch.data.seats_left == 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Seat Left'));
        }
    }
    else if (__VLS_ctx.batch.data.seat_count && __VLS_ctx.batch.data.seats_left <= 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs bg-red-100 text-red-700 float-right px-2 py-0.5 rounded-md" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        (__VLS_ctx.__('Sold Out'));
    }
    if (__VLS_ctx.batch.data.amount) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-lg font-semibold mb-3 text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.formatNumberIntoCurrency(__VLS_ctx.batch.data.amount, __VLS_ctx.batch.data.currency));
    }
    if (__VLS_ctx.batch.data.courses.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center mb-3 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
        BookOpen;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.batch.data.courses.length);
        (__VLS_ctx.__('Courses'));
    }
    const __VLS_5 = DateRange;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        startDate: (__VLS_ctx.batch.data.start_date),
        endDate: (__VLS_ctx.batch.data.end_date),
        ...{ class: "mb-3" },
    }));
    const __VLS_7 = __VLS_6({
        startDate: (__VLS_ctx.batch.data.start_date),
        endDate: (__VLS_ctx.batch.data.end_date),
        ...{ class: "mb-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center mb-3 text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.Clock} */
    Clock;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
    }));
    const __VLS_12 = __VLS_11({
        ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatTime(__VLS_ctx.batch.data.start_time));
    (__VLS_ctx.formatTime(__VLS_ctx.batch.data.end_time));
    if (__VLS_ctx.batch.data.timezone) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.Globe} */
        Globe;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
        }));
        const __VLS_17 = __VLS_16({
            ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.batch.data.timezone);
    }
    if (!__VLS_ctx.readOnlyMode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (__VLS_ctx.canAccessBatch) {
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                to: ({
                    name: 'Batch',
                    params: {
                        batchName: __VLS_ctx.batch.data.name,
                    },
                }),
            }));
            const __VLS_22 = __VLS_21({
                to: ({
                    name: 'Batch',
                    params: {
                        batchName: __VLS_ctx.batch.data.name,
                    },
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            const { default: __VLS_25 } = __VLS_23.slots;
            let __VLS_26;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                variant: "solid",
                ...{ class: "w-full mt-4" },
            }));
            const __VLS_28 = __VLS_27({
                variant: "solid",
                ...{ class: "w-full mt-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            const { default: __VLS_31 } = __VLS_29.slots;
            {
                const { prefix: __VLS_32 } = __VLS_29.slots;
                if (__VLS_ctx.isStudent) {
                    let __VLS_33;
                    /** @ts-ignore @type { | typeof __VLS_components.LogIn} */
                    LogIn;
                    // @ts-ignore
                    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
                        ...{ class: "size-4 stroke-1.5" },
                    }));
                    const __VLS_35 = __VLS_34({
                        ...{ class: "size-4 stroke-1.5" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
                    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                }
                else {
                    let __VLS_38;
                    /** @ts-ignore @type { | typeof __VLS_components.Settings} */
                    Settings;
                    // @ts-ignore
                    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
                        ...{ class: "size-4 stroke-1.5" },
                    }));
                    const __VLS_40 = __VLS_39({
                        ...{ class: "size-4 stroke-1.5" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
                    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                }
                // @ts-ignore
                [batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, __, __, __, __, formatNumberIntoCurrency, formatTime, formatTime, readOnlyMode, canAccessBatch, isStudent,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.isStudent ? __VLS_ctx.__('Visit Batch') : __VLS_ctx.__('Manage Batch'));
            // @ts-ignore
            [__, __, isStudent,];
            var __VLS_29;
            // @ts-ignore
            [];
            var __VLS_23;
        }
        else if (__VLS_ctx.batch.data.paid_batch &&
            __VLS_ctx.batch.data.seats_left > 0 &&
            __VLS_ctx.batch.data.accept_enrollments) {
            let __VLS_43;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
                to: ({
                    name: 'Billing',
                    params: {
                        type: 'batch',
                        name: __VLS_ctx.batch.data.name,
                    },
                }),
            }));
            const __VLS_45 = __VLS_44({
                to: ({
                    name: 'Billing',
                    params: {
                        type: 'batch',
                        name: __VLS_ctx.batch.data.name,
                    },
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_44));
            const { default: __VLS_48 } = __VLS_46.slots;
            if (!__VLS_ctx.isStudent) {
                let __VLS_49;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
                    ...{ class: "w-full mt-4" },
                    variant: "solid",
                }));
                const __VLS_51 = __VLS_50({
                    ...{ class: "w-full mt-4" },
                    variant: "solid",
                }, ...__VLS_functionalComponentArgsRest(__VLS_50));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                const { default: __VLS_54 } = __VLS_52.slots;
                {
                    const { prefix: __VLS_55 } = __VLS_52.slots;
                    let __VLS_56;
                    /** @ts-ignore @type { | typeof __VLS_components.CreditCard} */
                    CreditCard;
                    // @ts-ignore
                    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                        ...{ class: "size-4 stroke-1.5" },
                    }));
                    const __VLS_58 = __VLS_57({
                        ...{ class: "size-4 stroke-1.5" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                    // @ts-ignore
                    [batch, batch, batch, batch, isStudent,];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.__('Register Now'));
                // @ts-ignore
                [__,];
                var __VLS_52;
            }
            // @ts-ignore
            [];
            var __VLS_46;
        }
        else if (__VLS_ctx.batch.data.allow_self_enrollment &&
            __VLS_ctx.batch.data.seats_left &&
            __VLS_ctx.batch.data.accept_enrollments) {
            let __VLS_61;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                ...{ 'onClick': {} },
                variant: "solid",
                ...{ class: "w-full mt-2" },
            }));
            const __VLS_63 = __VLS_62({
                ...{ 'onClick': {} },
                variant: "solid",
                ...{ class: "w-full mt-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            let __VLS_66;
            const __VLS_67 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.batch.data))
                            return;
                        if (!(!__VLS_ctx.readOnlyMode))
                            return;
                        if (!!(__VLS_ctx.canAccessBatch))
                            return;
                        if (!!(__VLS_ctx.batch.data.paid_batch &&
                            __VLS_ctx.batch.data.seats_left > 0 &&
                            __VLS_ctx.batch.data.accept_enrollments))
                            return;
                        if (!(__VLS_ctx.batch.data.allow_self_enrollment &&
                            __VLS_ctx.batch.data.seats_left &&
                            __VLS_ctx.batch.data.accept_enrollments))
                            return;
                        __VLS_ctx.enrollInBatch();
                        // @ts-ignore
                        [batch, batch, batch, enrollInBatch,];
                    } });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            const { default: __VLS_68 } = __VLS_64.slots;
            {
                const { prefix: __VLS_69 } = __VLS_64.slots;
                let __VLS_70;
                /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
                GraduationCap;
                // @ts-ignore
                const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                    ...{ class: "size-4 stroke-1.5" },
                }));
                const __VLS_72 = __VLS_71({
                    ...{ class: "size-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_71));
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                // @ts-ignore
                [];
            }
            (__VLS_ctx.__('Enroll Now'));
            // @ts-ignore
            [__,];
            var __VLS_64;
            var __VLS_65;
        }
        if (__VLS_ctx.canEditBatch) {
            let __VLS_75;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                to: ({
                    name: 'BatchForm',
                    params: {
                        batchName: __VLS_ctx.batch.data.name,
                    },
                }),
            }));
            const __VLS_77 = __VLS_76({
                to: ({
                    name: 'BatchForm',
                    params: {
                        batchName: __VLS_ctx.batch.data.name,
                    },
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_76));
            const { default: __VLS_80 } = __VLS_78.slots;
            let __VLS_81;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                ...{ class: "w-full mt-2" },
            }));
            const __VLS_83 = __VLS_82({
                ...{ class: "w-full mt-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            const { default: __VLS_86 } = __VLS_84.slots;
            {
                const { prefix: __VLS_87 } = __VLS_84.slots;
                let __VLS_88;
                /** @ts-ignore @type { | typeof __VLS_components.Pencil} */
                Pencil;
                // @ts-ignore
                const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
                    ...{ class: "size-4 stroke-1.5" },
                }));
                const __VLS_90 = __VLS_89({
                    ...{ class: "size-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                // @ts-ignore
                [batch, canEditBatch,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Edit'));
            // @ts-ignore
            [__,];
            var __VLS_84;
            // @ts-ignore
            [];
            var __VLS_78;
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: Object,
            default: null,
        },
    },
});
export default {};
