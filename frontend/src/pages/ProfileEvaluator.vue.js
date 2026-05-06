/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, FormControl, Button, Badge, toast } from 'frappe-ui';
import { computed, reactive, ref, onMounted, inject } from 'vue';
import { convertToTitleCase } from '@/utils';
import { Plus, X, Check, CircleAlert } from 'lucide-vue-next';
const user = inject('$user');
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});
onMounted(() => {
    if (user.data?.name !== props.profile.data?.name && !hasHigherAccess()) {
        window.location.href = `/user/${props.profile.data?.username}`;
    }
});
const hasHigherAccess = () => {
    return user.data?.is_evaluator || user.data?.is_moderator;
};
const isSessionUser = () => {
    return user.data?.email === props.profile.data?.name;
};
const showSlotsTemplate = ref(0);
const from = ref(null);
const to = ref(null);
const newSlot = reactive({
    day: '',
    start_time: '',
    end_time: '',
});
const evaluator = createResource({
    url: 'lms.lms.api.get_evaluator_details',
    params: {
        evaluator: props.profile.data?.name,
    },
    auto: true,
    onSuccess(data) {
        if (data.slots.unavailable_from)
            from.value = data.slots.unavailable_from;
        if (data.slots.unavailable_to)
            to.value = data.slots.unavailable_to;
    },
});
const createSlot = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Evaluator Schedule',
                parent: evaluator.data?.slots.name,
                parentfield: 'schedule',
                parenttype: 'Course Evaluator',
                ...newSlot,
            },
        };
    },
    onSuccess() {
        toast.success(__('Slot added successfully'));
        evaluator.reload();
        showSlotsTemplate.value = 0;
        newSlot.day = '';
        newSlot.start_time = '';
        newSlot.end_time = '';
    },
    onError(err) {
        toast.error(err.messages?.[0] || err);
    },
});
const updateSlot = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'Evaluator Schedule',
            name: values.name,
            fieldname: values.field,
            value: values.value,
        };
    },
    onSuccess() {
        toast.success(__('Availability updated successfully'));
    },
    onError(err) {
        toast.error(err.messages?.[0] || err);
    },
});
const deleteSlot = createResource({
    url: 'frappe.client.delete',
    makeParams(values) {
        return {
            doctype: 'Evaluator Schedule',
            name: values.name,
        };
    },
    onSuccess() {
        toast.success(__('Slot deleted successfully'));
        evaluator.reload();
    },
    onError(err) {
        toast.error(err.messages?.[0] || err);
    },
});
const updateUnavailability = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'Course Evaluator',
            name: evaluator.data?.slots.name,
            fieldname: values.field,
            value: values.value,
        };
    },
    onSuccess() {
        toast.success(__('Unavailability updated successfully'));
    },
    onError(err) {
        toast.error(err.messages?.[0] || err);
    },
});
const update = (name, field, value) => {
    updateSlot.submit({
        name,
        field,
        value,
    }, {
        validate() {
            if (!value) {
                return `Please enter a value for ${convertToTitleCase(field)}`;
            }
        },
    });
};
const add = () => {
    if (!newSlot.day || !newSlot.start_time || !newSlot.end_time) {
        return;
    }
    createSlot.submit();
};
const deleteRow = (name) => {
    deleteSlot.submit({ name });
};
const authorizeCalendar = createResource({
    url: 'frappe.integrations.doctype.google_calendar.google_calendar.authorize_access',
    makeParams() {
        return {
            g_calendar: evaluator.data?.calendar,
            reauthorize: 1,
        };
    },
    onSuccess(data) {
        window.open(data.url);
    },
});
const days = computed(() => {
    return [
        {
            label: __('Monday'),
            value: 'Monday',
        },
        {
            label: __('Tuesday'),
            value: 'Tuesday',
        },
        {
            label: __('Wednesday'),
            value: 'Wednesday',
        },
        {
            label: __('Thursday'),
            value: 'Thursday',
        },
        {
            label: __('Friday'),
            value: 'Friday',
        },
        {
            label: __('Saturday'),
            value: 'Saturday',
        },
        {
            label: __('Sunday'),
            value: 'Sunday',
        },
    ];
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-7 mb-20" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "mb-4 text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('My availability'));
if (__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 text-sm text-ink-gray-7 bg-surface-gray-1 px-3 py-2 rounded-md w-full text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.CircleAlert} */
    CircleAlert;
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
    (__VLS_ctx.__('You cannot change the availability when the site is being updated.'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 md:grid-cols-4 gap-4 text-sm text-ink-gray-7 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    (__VLS_ctx.__('Day'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    (__VLS_ctx.__('Start Time'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    (__VLS_ctx.__('End Time'));
    if (__VLS_ctx.evaluator.data) {
        for (const [slot] of __VLS_vFor((__VLS_ctx.evaluator.data.slots.schedule))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-3 md:grid-cols-4 gap-4 mb-4 group" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            let __VLS_5;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                ...{ 'onFocusout': {} },
                type: "select",
                options: (__VLS_ctx.days),
                modelValue: (slot.day),
                disabled: (!__VLS_ctx.isSessionUser()),
            }));
            const __VLS_7 = __VLS_6({
                ...{ 'onFocusout': {} },
                type: "select",
                options: (__VLS_ctx.days),
                modelValue: (slot.day),
                disabled: (!__VLS_ctx.isSessionUser()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            let __VLS_10;
            const __VLS_11 = ({ focusout: {} },
                { onFocusout: (...[$event]) => {
                        if (!!(__VLS_ctx.readOnlyMode))
                            return;
                        if (!(__VLS_ctx.evaluator.data))
                            return;
                        __VLS_ctx.update(slot.name, 'day', slot.day);
                        // @ts-ignore
                        [__, __, __, __, __, readOnlyMode, evaluator, evaluator, days, isSessionUser, update,];
                    } });
            var __VLS_8;
            var __VLS_9;
            let __VLS_12;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                ...{ 'onFocusout': {} },
                type: "time",
                modelValue: (slot.start_time),
                disabled: (!__VLS_ctx.isSessionUser()),
            }));
            const __VLS_14 = __VLS_13({
                ...{ 'onFocusout': {} },
                type: "time",
                modelValue: (slot.start_time),
                disabled: (!__VLS_ctx.isSessionUser()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            let __VLS_17;
            const __VLS_18 = ({ focusout: {} },
                { onFocusout: (...[$event]) => {
                        if (!!(__VLS_ctx.readOnlyMode))
                            return;
                        if (!(__VLS_ctx.evaluator.data))
                            return;
                        __VLS_ctx.update(slot.name, 'start_time', slot.start_time);
                        // @ts-ignore
                        [isSessionUser, update,];
                    } });
            var __VLS_15;
            var __VLS_16;
            let __VLS_19;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                ...{ 'onFocusout': {} },
                type: "time",
                modelValue: (slot.end_time),
                disabled: (!__VLS_ctx.isSessionUser()),
            }));
            const __VLS_21 = __VLS_20({
                ...{ 'onFocusout': {} },
                type: "time",
                modelValue: (slot.end_time),
                disabled: (!__VLS_ctx.isSessionUser()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
            let __VLS_24;
            const __VLS_25 = ({ focusout: {} },
                { onFocusout: (...[$event]) => {
                        if (!!(__VLS_ctx.readOnlyMode))
                            return;
                        if (!(__VLS_ctx.evaluator.data))
                            return;
                        __VLS_ctx.update(slot.name, 'end_time', slot.end_time);
                        // @ts-ignore
                        [isSessionUser, update,];
                    } });
            var __VLS_22;
            var __VLS_23;
            if (__VLS_ctx.isSessionUser()) {
                let __VLS_26;
                /** @ts-ignore @type { | typeof __VLS_components.X} */
                X;
                // @ts-ignore
                const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                    ...{ 'onClick': {} },
                    ...{ class: "w-6 h-auto stroke-1.5 text-red-900 rounded-md cursor-pointer p-1 bg-surface-red-2 hidden group-hover:block" },
                }));
                const __VLS_28 = __VLS_27({
                    ...{ 'onClick': {} },
                    ...{ class: "w-6 h-auto stroke-1.5 text-red-900 rounded-md cursor-pointer p-1 bg-surface-red-2 hidden group-hover:block" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_27));
                let __VLS_31;
                const __VLS_32 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.readOnlyMode))
                                return;
                            if (!(__VLS_ctx.evaluator.data))
                                return;
                            if (!(__VLS_ctx.isSessionUser()))
                                return;
                            __VLS_ctx.deleteRow(slot.name);
                            // @ts-ignore
                            [isSessionUser, deleteRow,];
                        } });
                /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-red-900']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-surface-red-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:block']} */ ;
                var __VLS_29;
                var __VLS_30;
            }
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 md:grid-cols-4 gap-4 mb-4" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.showSlotsTemplate) }, null, null);
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        ...{ 'onFocusout': {} },
        type: "select",
        options: (__VLS_ctx.days),
        modelValue: (__VLS_ctx.newSlot.day),
        disabled: (!__VLS_ctx.isSessionUser()),
    }));
    const __VLS_35 = __VLS_34({
        ...{ 'onFocusout': {} },
        type: "select",
        options: (__VLS_ctx.days),
        modelValue: (__VLS_ctx.newSlot.day),
        disabled: (!__VLS_ctx.isSessionUser()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_38;
    const __VLS_39 = ({ focusout: {} },
        { onFocusout: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.add();
                // @ts-ignore
                [days, isSessionUser, showSlotsTemplate, newSlot, add,];
            } });
    var __VLS_36;
    var __VLS_37;
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        ...{ 'onFocusout': {} },
        type: "time",
        modelValue: (__VLS_ctx.newSlot.start_time),
        disabled: (!__VLS_ctx.isSessionUser()),
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onFocusout': {} },
        type: "time",
        modelValue: (__VLS_ctx.newSlot.start_time),
        disabled: (!__VLS_ctx.isSessionUser()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_45;
    const __VLS_46 = ({ focusout: {} },
        { onFocusout: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.add();
                // @ts-ignore
                [isSessionUser, newSlot, add,];
            } });
    var __VLS_43;
    var __VLS_44;
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        ...{ 'onFocusout': {} },
        type: "time",
        modelValue: (__VLS_ctx.newSlot.end_time),
        disabled: (!__VLS_ctx.isSessionUser()),
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onFocusout': {} },
        type: "time",
        modelValue: (__VLS_ctx.newSlot.end_time),
        disabled: (!__VLS_ctx.isSessionUser()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_52;
    const __VLS_53 = ({ focusout: {} },
        { onFocusout: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.add();
                // @ts-ignore
                [isSessionUser, newSlot, add,];
            } });
    var __VLS_50;
    var __VLS_51;
    if (__VLS_ctx.isSessionUser()) {
        let __VLS_54;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
            ...{ 'onClick': {} },
        }));
        const __VLS_56 = __VLS_55({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        let __VLS_59;
        const __VLS_60 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.readOnlyMode))
                        return;
                    if (!(__VLS_ctx.isSessionUser()))
                        return;
                    __VLS_ctx.showSlotsTemplate = 1;
                    // @ts-ignore
                    [isSessionUser, showSlotsTemplate,];
                } });
        const { default: __VLS_61 } = __VLS_57.slots;
        {
            const { prefix: __VLS_62 } = __VLS_57.slots;
            let __VLS_63;
            /** @ts-ignore @type { | typeof __VLS_components.Plus} */
            Plus;
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
            }));
            const __VLS_65 = __VLS_64({
                ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_64));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Add Slot'));
        // @ts-ignore
        [__,];
        var __VLS_57;
        var __VLS_58;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "my-10" },
    });
    /** @type {__VLS_StyleScopedClasses['my-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "mb-4 text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('I am unavailable'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 md:grid-cols-4 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    let __VLS_68;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        ...{ 'onBlur': {} },
        type: "date",
        label: (__VLS_ctx.__('From')),
        modelValue: (__VLS_ctx.from),
        disabled: (!__VLS_ctx.isSessionUser()),
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onBlur': {} },
        type: "date",
        label: (__VLS_ctx.__('From')),
        modelValue: (__VLS_ctx.from),
        disabled: (!__VLS_ctx.isSessionUser()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_73;
    const __VLS_74 = ({ blur: {} },
        { onBlur: (() => {
                __VLS_ctx.updateUnavailability.submit({
                    field: 'unavailable_from',
                    value: __VLS_ctx.from,
                });
            }) });
    var __VLS_71;
    var __VLS_72;
    let __VLS_75;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
        ...{ 'onBlur': {} },
        type: "date",
        label: (__VLS_ctx.__('To')),
        modelValue: (__VLS_ctx.to),
        disabled: (!__VLS_ctx.isSessionUser()),
    }));
    const __VLS_77 = __VLS_76({
        ...{ 'onBlur': {} },
        type: "date",
        label: (__VLS_ctx.__('To')),
        modelValue: (__VLS_ctx.to),
        disabled: (!__VLS_ctx.isSessionUser()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_80;
    const __VLS_81 = ({ blur: {} },
        { onBlur: (() => {
                __VLS_ctx.updateUnavailability.submit({
                    field: 'unavailable_to',
                    value: __VLS_ctx.to,
                });
            }) });
    var __VLS_78;
    var __VLS_79;
    if (__VLS_ctx.isSessionUser()) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "mb-4 text-lg font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.__('My calendar'));
        if (__VLS_ctx.evaluator.data?.calendar && __VLS_ctx.evaluator.data?.is_authorized) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center bg-surface-green-2 text-green-900 text-sm p-1 rounded-md mb-4 w-fit" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-green-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            let __VLS_82;
            /** @ts-ignore @type { | typeof __VLS_components.Check} */
            Check;
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
                ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
            }));
            const __VLS_84 = __VLS_83({
                ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
            (__VLS_ctx.__('Your calendar is set.'));
        }
        let __VLS_87;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
            ...{ 'onClick': {} },
        }));
        const __VLS_89 = __VLS_88({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        let __VLS_92;
        const __VLS_93 = ({ click: {} },
            { onClick: (() => __VLS_ctx.authorizeCalendar.submit()) });
        const { default: __VLS_94 } = __VLS_90.slots;
        (__VLS_ctx.__('Authorize Google Calendar Access'));
        // @ts-ignore
        [__, __, __, __, __, __, evaluator, evaluator, isSessionUser, isSessionUser, isSessionUser, from, from, updateUnavailability, updateUnavailability, to, to, authorizeCalendar,];
        var __VLS_90;
        var __VLS_91;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        profile: {
            type: Object,
            required: true,
        },
    },
});
export default {};
