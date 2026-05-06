/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, call, Dialog, FormControl, toast } from 'frappe-ui';
import { computed, ref, watch } from 'vue';
import { cleanError } from '@/utils';
import Autocomplete from '@/components/Controls/Autocomplete.vue';
import CodeEditor from '@/components/Controls/CodeEditor.vue';
import Uploader from '@/components/Controls/Uploader.vue';
const defaultBadge = {
    name: '',
    title: '',
    enabled: true,
    description: '',
    image: '',
    grant_only_once: false,
    event: 'New',
    reference_doctype: '',
    condition: '',
    user_field: 'member',
    field_to_check: '',
};
const show = defineModel({ required: true, default: false });
const badges = defineModel('badges');
const badge = ref(defaultBadge);
const props = defineProps();
watch(() => props.badgeName, (val) => {
    if (val != 'new') {
        badges.value?.data.forEach((bdg) => {
            if (bdg.name === val) {
                badge.value = bdg;
            }
        });
    }
    else {
        badge.value = { ...defaultBadge };
    }
});
const saveBadge = (close) => {
    if (props.badgeName == 'new') {
        createBadge(close);
    }
    else {
        updateBadge(close);
    }
};
const updateBadge = async (close) => {
    if (props.badgeName != badge.value?.title) {
        await renameDoc();
    }
    setValue(close);
};
const renameDoc = async () => {
    await call('frappe.client.rename_doc', {
        doctype: 'LMS Badge',
        old_name: props.badgeName,
        new_name: badge.value?.title,
    });
};
const setValue = (close) => {
    badges.value?.setValue.submit({
        ...badge.value,
        name: badge.value.title,
    }, {
        onSuccess() {
            badges.value?.reload();
            close();
            toast.success(__('Badge updated successfully'));
        },
        onError(err) {
            close();
            toast.error(cleanError(err.messages[0]) || err);
        },
    });
};
const createBadge = (close) => {
    badges.value?.insert.submit({
        ...badge.value,
        name: badge.value.name,
    }, {
        onSuccess() {
            badges.value?.reload();
            close();
            toast.success(__('Badge created successfully'));
        },
        onError(err) {
            close();
            toast.error(cleanError(err.messages[0]) || __('Error creating badge'));
        },
    });
};
const referenceDoctypeOptions = computed(() => {
    return [
        { label: __('Course'), value: 'LMS Course' },
        { label: __('Batch'), value: 'LMS Batch' },
        { label: __('User'), value: 'Member' },
        { label: __('Quiz Submission'), value: 'LMS Quiz Submission' },
        { label: __('Assignment Submission'), value: 'LMS Assignment Submission' },
        {
            label: __('Programming Exercise Submission'),
            value: 'LMS Programming Exercise Submission',
        },
        { label: __('Course Enrollment'), value: 'LMS Enrollment' },
        { label: __('Batch Enrollment'), value: 'LMS Batch Enrollment' },
    ];
});
const eventOptions = computed(() => {
    let options = ['New', 'Value Change', 'Auto Assign'];
    return options.map((event) => ({ label: __(event), value: event }));
});
const userFieldOptions = computed(() => {
    return [
        { label: __('Member'), value: 'member' },
        { label: __('Owner'), value: 'owner' },
    ];
});
const __VLS_defaultModels = {
    'modelValue': false,
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
        title: __VLS_ctx.badge ? __VLS_ctx.__('Edit Badge') : __VLS_ctx.__('Create a new Badge'),
        size: '3xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.badge ? __VLS_ctx.__('Edit Badge') : __VLS_ctx.__('Create a new Badge'),
        size: '3xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-x-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-x-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.badge.enabled),
        label: (__VLS_ctx.__('Enabled')),
        type: "checkbox",
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.badge.enabled),
        label: (__VLS_ctx.__('Enabled')),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.badge.title),
        label: (__VLS_ctx.__('Title')),
        type: "text",
        required: (true),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.badge.title),
        label: (__VLS_ctx.__('Title')),
        type: "text",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const __VLS_18 = Autocomplete;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.badge.reference_doctype),
        options: (__VLS_ctx.referenceDoctypeOptions),
        required: (true),
        label: (__VLS_ctx.__('Assign For')),
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.badge.reference_doctype),
        options: (__VLS_ctx.referenceDoctypeOptions),
        required: (true),
        label: (__VLS_ctx.__('Assign For')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': ((opt) => (__VLS_ctx.badge.reference_doctype = opt.value)) });
    var __VLS_21;
    var __VLS_22;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        modelValue: (__VLS_ctx.badge.description),
        label: (__VLS_ctx.__('Description')),
        required: (true),
        type: "textarea",
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (__VLS_ctx.badge.description),
        label: (__VLS_ctx.__('Description')),
        required: (true),
        type: "textarea",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const __VLS_30 = Uploader;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        modelValue: (__VLS_ctx.badge.image),
        label: "Badge Image",
        description: "An image that represents the badge.",
    }));
    const __VLS_32 = __VLS_31({
        modelValue: (__VLS_ctx.badge.image),
        label: "Badge Image",
        description: "An image that represents the badge.",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        modelValue: (__VLS_ctx.badge.grant_only_once),
        label: (__VLS_ctx.__('Grant Only Once')),
        type: "checkbox",
    }));
    const __VLS_37 = __VLS_36({
        modelValue: (__VLS_ctx.badge.grant_only_once),
        label: (__VLS_ctx.__('Grant Only Once')),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        modelValue: (__VLS_ctx.badge.event),
        label: (__VLS_ctx.__('Event')),
        type: "select",
        options: (__VLS_ctx.eventOptions),
        required: (true),
    }));
    const __VLS_42 = __VLS_41({
        modelValue: (__VLS_ctx.badge.event),
        label: (__VLS_ctx.__('Event')),
        type: "select",
        options: (__VLS_ctx.eventOptions),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_45;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        modelValue: (__VLS_ctx.badge.user_field),
        label: (__VLS_ctx.__('Assign To')),
        type: "select",
        options: (__VLS_ctx.userFieldOptions),
        required: (true),
    }));
    const __VLS_47 = __VLS_46({
        modelValue: (__VLS_ctx.badge.user_field),
        label: (__VLS_ctx.__('Assign To')),
        type: "select",
        options: (__VLS_ctx.userFieldOptions),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const __VLS_50 = CodeEditor;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        modelValue: (__VLS_ctx.badge.condition),
        label: (__VLS_ctx.__('Condition')),
        type: "JavaScript",
        required: (true),
        showBorder: (true),
        height: "82px",
    }));
    const __VLS_52 = __VLS_51({
        modelValue: (__VLS_ctx.badge.condition),
        label: (__VLS_ctx.__('Condition')),
        type: "JavaScript",
        required: (true),
        showBorder: (true),
        height: "82px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    // @ts-ignore
    [show, badge, badge, badge, badge, badge, badge, badge, badge, badge, badge, badge, __, __, __, __, __, __, __, __, __, __, referenceDoctypeOptions, eventOptions, userFieldOptions,];
}
{
    const { actions: __VLS_55 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_55);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-5 float-right" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
    let __VLS_56;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_61;
    const __VLS_62 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.saveBadge(close);
                // @ts-ignore
                [saveBadge,];
            } });
    const { default: __VLS_63 } = __VLS_59.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_59;
    var __VLS_60;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
