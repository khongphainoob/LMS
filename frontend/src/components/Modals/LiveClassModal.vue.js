/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, createResource, Tooltip, FormControl, Autocomplete, toast, } from 'frappe-ui';
import { reactive, inject, onMounted } from 'vue';
import { getTimezones, getUserTimezone } from '@/utils/';
const liveClasses = defineModel('reloadLiveClasses');
const show = defineModel();
const user = inject('$user');
const dayjs = inject('$dayjs');
const props = defineProps({
    batch: {
        type: String,
        required: true,
    },
    zoomAccount: {
        type: String,
        required: true,
    },
});
let liveClass = reactive({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    timezone: '',
    auto_recording: 'No Recording',
    batch: props.batch,
    host: user.data.name,
});
onMounted(() => {
    liveClass.timezone = getUserTimezone();
});
const getTimezoneOptions = () => {
    return getTimezones().map((timezone) => {
        return {
            label: timezone,
            value: timezone,
        };
    });
};
const getRecordingOptions = () => {
    return [
        {
            label: __('No Recording'),
            value: 'No Recording',
        },
        {
            label: __('Local'),
            value: 'Local',
        },
        {
            label: __('Cloud'),
            value: 'Cloud',
        },
    ];
};
const createLiveClass = createResource({
    url: 'lms.lms.doctype.lms_batch.lms_batch.create_live_class',
    makeParams(values) {
        return {
            doctype: 'LMS Live Class',
            batch_name: values.batch,
            zoom_account: props.zoomAccount,
            ...values,
        };
    },
});
const submitLiveClass = (close) => {
    return createLiveClass.submit(liveClass, {
        validate() {
            validateFormFields();
        },
        onSuccess() {
            liveClasses.value.reload();
            refreshForm();
            close();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const validateFormFields = () => {
    if (!liveClass.title) {
        return __('Please enter a title.');
    }
    if (!liveClass.date) {
        return __('Please select a date.');
    }
    if (!liveClass.time) {
        return __('Please select a time.');
    }
    if (!liveClass.timezone) {
        return __('Please select a timezone.');
    }
    if (!valideTime()) {
        return __('Please enter a valid time in the format HH:mm.');
    }
    const liveClassDateTime = dayjs(`${liveClass.date}T${liveClass.time}`).tz(liveClass.timezone, true);
    if (liveClassDateTime.isSameOrBefore(dayjs().tz(liveClass.timezone, false), 'minute')) {
        return __('Please select a future date and time.');
    }
    if (!liveClass.duration) {
        return __('Please select a duration.');
    }
};
const valideTime = () => {
    let time = liveClass.time.split(':');
    if (time.length != 2) {
        return false;
    }
    if (time[0] < 0 || time[0] > 23) {
        return false;
    }
    if (time[1] < 0 || time[1] > 59) {
        return false;
    }
    return true;
};
const refreshForm = () => {
    liveClass.title = '';
    liveClass.description = '';
    liveClass.date = '';
    liveClass.time = '';
    liveClass.duration = '';
    liveClass.timezone = getUserTimezone();
    liveClass.auto_recording = 'No Recording';
};
let __VLS_modelEmit;
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Create a Live Class'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: ({ close }) => __VLS_ctx.submitLiveClass(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Create a Live Class'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Submit'),
                variant: 'solid',
                onClick: ({ close }) => __VLS_ctx.submitLiveClass(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        type: "text",
        modelValue: (__VLS_ctx.liveClass.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        type: "text",
        modelValue: (__VLS_ctx.liveClass.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.liveClass.date),
        type: "date",
        label: (__VLS_ctx.__('Date')),
        required: (true),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.liveClass.date),
        type: "date",
        label: (__VLS_ctx.__('Date')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        text: (__VLS_ctx.__('Duration of the live class in minutes')),
    }));
    const __VLS_20 = __VLS_19({
        text: (__VLS_ctx.__('Duration of the live class in minutes')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    const { default: __VLS_23 } = __VLS_21.slots;
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        type: "number",
        modelValue: (__VLS_ctx.liveClass.duration),
        label: (__VLS_ctx.__('Duration')),
        required: (true),
    }));
    const __VLS_26 = __VLS_25({
        type: "number",
        modelValue: (__VLS_ctx.liveClass.duration),
        label: (__VLS_ctx.__('Duration')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore
    [show, __, __, __, __, __, __, submitLiveClass, liveClass, liveClass, liveClass,];
    var __VLS_21;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        text: (__VLS_ctx.__('Time must be in 24 hour format (HH:mm). Example 11:30 or 22:00')),
    }));
    const __VLS_31 = __VLS_30({
        text: (__VLS_ctx.__('Time must be in 24 hour format (HH:mm). Example 11:30 or 22:00')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const { default: __VLS_34 } = __VLS_32.slots;
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        modelValue: (__VLS_ctx.liveClass.time),
        type: "time",
        label: (__VLS_ctx.__('Time')),
        required: (true),
    }));
    const __VLS_37 = __VLS_36({
        modelValue: (__VLS_ctx.liveClass.time),
        type: "time",
        label: (__VLS_ctx.__('Time')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    // @ts-ignore
    [__, __, liveClass,];
    var __VLS_32;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-ink-gray-5 text-xs" },
        for: "batchTimezone",
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__('Timezone'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.Autocomplete} */
    Autocomplete;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.liveClass.timezone),
        options: (__VLS_ctx.getTimezoneOptions()),
        required: (true),
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.liveClass.timezone),
        options: (__VLS_ctx.getTimezoneOptions()),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_45;
    const __VLS_46 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': ((opt) => (__VLS_ctx.liveClass.timezone = opt.value)) });
    var __VLS_43;
    var __VLS_44;
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        modelValue: (__VLS_ctx.liveClass.auto_recording),
        type: "select",
        options: (__VLS_ctx.getRecordingOptions()),
        label: (__VLS_ctx.__('Auto Recording')),
    }));
    const __VLS_49 = __VLS_48({
        modelValue: (__VLS_ctx.liveClass.auto_recording),
        type: "select",
        options: (__VLS_ctx.getRecordingOptions()),
        label: (__VLS_ctx.__('Auto Recording')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        modelValue: (__VLS_ctx.liveClass.description),
        type: "textarea",
        label: (__VLS_ctx.__('Description')),
    }));
    const __VLS_54 = __VLS_53({
        modelValue: (__VLS_ctx.liveClass.description),
        type: "textarea",
        label: (__VLS_ctx.__('Description')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    // @ts-ignore
    [__, __, __, liveClass, liveClass, liveClass, liveClass, getTimezoneOptions, getRecordingOptions,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            batch: {
                type: String,
                required: true,
            },
            zoomAccount: {
                type: String,
                required: true,
            },
        },
    },
});
export default {};
