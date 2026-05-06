/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, DatePicker, toast } from 'frappe-ui';
import { ref, watch } from 'vue';
import { cleanError } from '@/utils';
import Link from '@/components/Controls/Link.vue';
const show = defineModel({ required: true, default: false });
const defaultBadgeAssignment = {
    name: '',
    badge: '',
    member: '',
    issued_on: '',
    member_name: '',
    member_username: '',
    member_image: '',
};
const badgeAssignments = defineModel('badgeAssignments');
const badgeAssignment = ref(defaultBadgeAssignment);
const props = defineProps();
watch(() => props.badgeAssignmentID, (newID) => {
    if (newID === 'new') {
        badgeAssignment.value = {
            ...defaultBadgeAssignment,
            badge: props.badge || '',
        };
    }
    else {
        const assignment = badgeAssignments.value?.data?.find((assignment) => assignment.name === newID);
        if (assignment) {
            badgeAssignment.value = { ...assignment };
        }
    }
});
const saveBadgeAssignment = (close) => {
    if (props.badgeAssignmentID === 'new') {
        createBadgeAssignment(close);
    }
    else {
        updateBadgeAssignment(close);
    }
};
const updateBadgeAssignment = async (close) => {
    badgeAssignments.value?.setValue.submit({
        ...badgeAssignment.value,
    }, {
        onSuccess: () => {
            toast.success(__('Badge assignment updated successfully'));
            close();
        },
        onError: (error) => {
            toast.error(__('Failed to update badge assignment: ') + cleanError(error));
        },
    });
};
const createBadgeAssignment = (close) => {
    badgeAssignments.value?.insert.submit({
        ...badgeAssignment.value,
    }, {
        onSuccess: () => {
            toast.success(__('Badge assignment created successfully'));
            close();
        },
        onError: (error) => {
            toast.error(__('Failed to create badge assignment: ') + cleanError(error));
        },
    });
};
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
        title: props.badgeAssignmentID === 'new'
            ? __VLS_ctx.__('Assign a Badge')
            : __VLS_ctx.__('Edit Badge Assignment'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.saveBadgeAssignment(close);
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: props.badgeAssignmentID === 'new'
            ? __VLS_ctx.__('Assign a Badge')
            : __VLS_ctx.__('Edit Badge Assignment'),
        size: 'sm',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.saveBadgeAssignment(close);
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    const __VLS_8 = Link;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        doctype: "User",
        modelValue: (__VLS_ctx.badgeAssignment.member),
        label: (__VLS_ctx.__('Member')),
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        doctype: "User",
        modelValue: (__VLS_ctx.badgeAssignment.member),
        label: (__VLS_ctx.__('Member')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_13 = Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        doctype: "LMS Badge",
        modelValue: (__VLS_ctx.badgeAssignment.badge),
        label: (__VLS_ctx.__('Badge')),
        required: (true),
    }));
    const __VLS_15 = __VLS_14({
        doctype: "LMS Badge",
        modelValue: (__VLS_ctx.badgeAssignment.badge),
        label: (__VLS_ctx.__('Badge')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-xs text-ink-gray-5 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.__('Issued On'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.DatePicker} */
    DatePicker;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        modelValue: (__VLS_ctx.badgeAssignment.issued_on),
        placeholder: (__VLS_ctx.__('Select Date')),
        required: (true),
    }));
    const __VLS_20 = __VLS_19({
        modelValue: (__VLS_ctx.badgeAssignment.issued_on),
        placeholder: (__VLS_ctx.__('Select Date')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    // @ts-ignore
    [show, __, __, __, __, __, __, __, saveBadgeAssignment, badgeAssignment, badgeAssignment, badgeAssignment,];
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
