/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Calendar, createListResource, Button } from 'frappe-ui';
import { inject, ref } from 'vue';
import Event from '@/components/Modals/Event.vue';
const user = inject('$user');
const currentEvent = ref(null);
const showEvent = ref(false);
const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});
const evaluations = createListResource({
    doctype: 'LMS Certificate Request',
    filters: {
        evaluator: props.profile.data?.name,
        status: ['!=', 'Cancelled'],
    },
    fields: [
        'name',
        'member_name',
        'member',
        'course',
        'course_title',
        'batch_name',
        'batch_title',
        'evaluator',
        'evaluator_name',
        'date',
        'start_time',
        'end_time',
        'google_meet_link',
    ],
    auto: true,
    orderBy: 'creation desc',
    pageLength: 500,
    cache: ['schedule', user.data?.name],
    transform(data) {
        return data.map((d) => {
            let mappedData = Object.assign({}, d);
            mappedData.title = `${d.member_name}'s Evaluation`;
            mappedData.participant = d.member_name;
            mappedData.id = d.name;
            mappedData.venue = d.google_meet_link;
            mappedData.fromDate = `${d.date}`;
            mappedData.toDate = `${d.date}`;
            mappedData.fromTime = d.start_time;
            mappedData.toTime = d.end_time;
            mappedData.color = 'green';
            return mappedData;
        });
    },
});
const openEvent = (event) => {
    currentEvent.value = event.calendarEvent;
    showEvent.value = true;
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
    ...{ class: "mt-7 mb-20" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-screen flex-col overflow-hidden" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
if (__VLS_ctx.evaluations.data?.length) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Calendar | typeof __VLS_components.Calendar} */
    Calendar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        config: ({
            defaultMode: 'Week',
            disableModes: ['Day', 'Week'],
            redundantCellHeight: 100,
            enableShortcuts: false,
        }),
        events: (__VLS_ctx.evaluations.data),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        config: ({
            defaultMode: 'Week',
            disableModes: ['Day', 'Week'],
            redundantCellHeight: 100,
            enableShortcuts: false,
        }),
        events: (__VLS_ctx.evaluations.data),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: ((event) => __VLS_ctx.openEvent(event)) });
    const { default: __VLS_7 } = __VLS_3.slots;
    {
        const { header: __VLS_8 } = __VLS_3.slots;
        const [{ currentMonthYear, decrement, increment }] = __VLS_vSlot(__VLS_8);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-2 flex justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-lg text-ink-gray-9 font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (currentMonthYear);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-x-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-x-1']} */ ;
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "h-4 w-4" },
            icon: "chevron-left",
        }));
        const __VLS_11 = __VLS_10({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "h-4 w-4" },
            icon: "chevron-left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        let __VLS_14;
        const __VLS_15 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.evaluations.data?.length))
                        return;
                    decrement();
                    // @ts-ignore
                    [evaluations, evaluations, openEvent,];
                } });
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        var __VLS_12;
        var __VLS_13;
        let __VLS_16;
        /** @ts-ignore @type { | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "h-4 w-4" },
            icon: "chevron-right",
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onClick': {} },
            variant: "ghost",
            ...{ class: "h-4 w-4" },
            icon: "chevron-right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_21;
        const __VLS_22 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.evaluations.data?.length))
                        return;
                    increment();
                    // @ts-ignore
                    [];
                } });
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        var __VLS_19;
        var __VLS_20;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
}
const __VLS_23 = Event;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.showEvent),
    event: (__VLS_ctx.currentEvent),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.showEvent),
    event: (__VLS_ctx.currentEvent),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[showEvent, currentEvent,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        profile: {
            type: Object,
            required: true,
        },
    },
});
export default {};
