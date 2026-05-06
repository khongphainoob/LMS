/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createListResource, Button, Tooltip } from 'frappe-ui';
import { Plus, Clock, Calendar, Video, Monitor, Info, AlertCircle, } from 'lucide-vue-next';
import { inject, ref } from 'vue';
import { formatTime } from '@/utils/';
import LiveClassModal from '@/components/Modals/LiveClassModal.vue';
import LiveClassAttendance from '@/components/Modals/LiveClassAttendance.vue';
const user = inject('$user');
const showLiveClassModal = ref(false);
const dayjs = inject('$dayjs');
const readOnlyMode = window.read_only_mode;
const showAttendance = ref(false);
const attendanceFor = ref(null);
const props = defineProps({
    batch: {
        type: String,
        required: true,
    },
    zoomAccount: String,
});
const liveClasses = createListResource({
    doctype: 'LMS Live Class',
    filters: {
        batch_name: props.batch,
    },
    fields: [
        'title',
        'description',
        'time',
        'date',
        'duration',
        'attendees',
        'start_url',
        'join_url',
        'owner',
    ],
    orderBy: 'date',
    auto: true,
});
const openLiveClassModal = () => {
    showLiveClassModal.value = true;
};
const canCreateClass = () => {
    if (readOnlyMode)
        return false;
    if (!props.zoomAccount)
        return false;
    return hasPermission();
};
const hasPermission = () => {
    return user.data?.is_moderator || user.data?.is_evaluator;
};
const canAccessClass = (cls) => {
    if (cls.date < dayjs().format('YYYY-MM-DD'))
        return false;
    if (cls.date > dayjs().format('YYYY-MM-DD'))
        return false;
    if (hasClassEnded(cls))
        return false;
    return true;
};
const getClassStart = (cls) => {
    return new Date(`${cls.date}T${cls.time}`);
};
const getClassEnd = (cls) => {
    const classStart = getClassStart(cls);
    return new Date(classStart.getTime() + cls.duration * 60000);
};
const hasClassEnded = (cls) => {
    const classEnd = getClassEnd(cls);
    const now = new Date();
    return now > classEnd;
};
const openAttendanceModal = (cls) => {
    if (!hasPermission())
        return;
    if (cls.attendees <= 0)
        return;
    showAttendance.value = true;
    attendanceFor.value = cls;
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
if (__VLS_ctx.hasPermission() && !props.zoomAccount) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 mb-5 bg-surface-amber-1 py-1 px-2 rounded-md text-ink-amber-3 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-amber-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.AlertCircle} */
    AlertCircle;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "size-4 stroke-1.5" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "size-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Please add a zoom account to the batch to create live classes.'));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Live Class'));
if (__VLS_ctx.canCreateClass()) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (__VLS_ctx.openLiveClassModal) });
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { prefix: __VLS_13 } = __VLS_8.slots;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "h-4 w-4" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "h-4 w-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        // @ts-ignore
        [hasPermission, __, __, canCreateClass, openLiveClassModal,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Add'));
    // @ts-ignore
    [__,];
    var __VLS_8;
    var __VLS_9;
}
if (__VLS_ctx.liveClasses.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    for (const [cls] of __VLS_vFor((__VLS_ctx.liveClasses.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (() => {
                    __VLS_ctx.openAttendanceModal(cls);
                }) },
            ...{ class: "flex flex-col border rounded-md h-full text-ink-gray-7 hover:border-outline-gray-3 p-3" },
            ...{ class: ({
                    'cursor-pointer': __VLS_ctx.hasPermission() && cls.attendees > 0,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-semibold text-ink-gray-9 text-lg mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (cls.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "short-introduction" },
        });
        /** @type {__VLS_StyleScopedClasses['short-introduction']} */ ;
        (cls.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-auto space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
        Calendar;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_21 = __VLS_20({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.dayjs(cls.date).format('DD MMMM YYYY'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }));
        const __VLS_26 = __VLS_25({
            ...{ class: "w-4 h-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.dayjs(__VLS_ctx.getClassStart(cls)).format('hh:mm A'));
        (__VLS_ctx.dayjs(__VLS_ctx.getClassEnd(cls)).format('hh:mm A'));
        if (__VLS_ctx.canAccessClass(cls)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2 text-ink-gray-9 mt-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
            if (__VLS_ctx.user.data?.is_moderator || __VLS_ctx.user.data?.is_evaluator) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                    href: (cls.start_url),
                    target: "_blank",
                    ...{ class: "cursor-pointer inline-flex items-center justify-center gap-2 transition-colors focus:outline-none text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-visible:ring focus-visible:ring-outline-gray-3 h-7 text-base px-2 rounded" },
                    ...{ class: (cls.join_url ? 'w-full' : 'w-1/2') },
                });
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['active:bg-surface-gray-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-outline-gray-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                let __VLS_29;
                /** @ts-ignore @type { | typeof __VLS_components.Monitor} */
                Monitor;
                // @ts-ignore
                const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_31 = __VLS_30({
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_30));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                (__VLS_ctx.__('Start'));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (cls.join_url),
                target: "_blank",
                ...{ class: "w-full cursor-pointer inline-flex items-center justify-center gap-2 transition-colors focus:outline-none text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-visible:ring focus-visible:ring-outline-gray-3 h-7 text-base px-2 rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['active:bg-surface-gray-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-outline-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            let __VLS_34;
            /** @ts-ignore @type { | typeof __VLS_components.Video} */
            Video;
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_36 = __VLS_35({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_35));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            (__VLS_ctx.__('Join'));
        }
        else if (__VLS_ctx.hasClassEnded(cls)) {
            let __VLS_39;
            /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
            Tooltip;
            // @ts-ignore
            const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                text: (__VLS_ctx.__('This class has ended')),
                placement: "right",
            }));
            const __VLS_41 = __VLS_40({
                text: (__VLS_ctx.__('This class has ended')),
                placement: "right",
            }, ...__VLS_functionalComponentArgsRest(__VLS_40));
            const { default: __VLS_44 } = __VLS_42.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2 text-ink-amber-3 w-fit" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            let __VLS_45;
            /** @ts-ignore @type { | typeof __VLS_components.Info} */
            Info;
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_47 = __VLS_46({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__('Ended'));
            // @ts-ignore
            [hasPermission, __, __, __, __, liveClasses, liveClasses, openAttendanceModal, dayjs, dayjs, dayjs, getClassStart, getClassEnd, canAccessClass, user, user, hasClassEnded,];
            var __VLS_42;
        }
        // @ts-ignore
        [];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm italic text-ink-gray-5 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.__('No live classes scheduled'));
}
const __VLS_50 = LiveClassModal;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    batch: (props.batch),
    zoomAccount: (props.zoomAccount),
    modelValue: (__VLS_ctx.showLiveClassModal),
    reloadLiveClasses: (__VLS_ctx.liveClasses),
}));
const __VLS_52 = __VLS_51({
    batch: (props.batch),
    zoomAccount: (props.zoomAccount),
    modelValue: (__VLS_ctx.showLiveClassModal),
    reloadLiveClasses: (__VLS_ctx.liveClasses),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
if (__VLS_ctx.showAttendance) {
    const __VLS_55 = LiveClassAttendance;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        modelValue: (__VLS_ctx.showAttendance),
        live_class: (__VLS_ctx.attendanceFor),
    }));
    const __VLS_57 = __VLS_56({
        modelValue: (__VLS_ctx.showAttendance),
        live_class: (__VLS_ctx.attendanceFor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
}
// @ts-ignore
[__, liveClasses, showLiveClassModal, showAttendance, showAttendance, attendanceFor,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: String,
            required: true,
        },
        zoomAccount: String,
    },
});
export default {};
