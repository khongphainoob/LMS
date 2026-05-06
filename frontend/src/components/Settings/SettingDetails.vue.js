/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, Badge, toast } from 'frappe-ui';
import SettingFields from '@/components/Settings/SettingFields.vue';
const props = defineProps({
    sections: {
        type: Array,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
});
const update = () => {
    props.data.save.submit({}, {
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col h-full text-base overflow-y-hidden" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold leading-none text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__(__VLS_ctx.label));
if (__VLS_ctx.data.isDirty) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Badge} */
    Badge;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: (__VLS_ctx.__('Not Saved')),
        variant: "subtle",
        theme: "orange",
    }));
    const __VLS_2 = __VLS_1({
        label: (__VLS_ctx.__('Not Saved')),
        variant: "subtle",
        theme: "orange",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
    variant: "solid",
    loading: (__VLS_ctx.data.save.loading),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    variant: "solid",
    loading: (__VLS_ctx.data.save.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = ({ click: {} },
    { onClick: (__VLS_ctx.update) });
const { default: __VLS_12 } = __VLS_8.slots;
(__VLS_ctx.__('Update'));
// @ts-ignore
[__, __, __, label, data, data, update,];
var __VLS_8;
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-ink-gray-6 leading-5" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
(__VLS_ctx.__(__VLS_ctx.description));
const __VLS_13 = SettingFields;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    sections: (__VLS_ctx.sections),
    data: (__VLS_ctx.data.doc),
}));
const __VLS_15 = __VLS_14({
    sections: (__VLS_ctx.sections),
    data: (__VLS_ctx.data.doc),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
// @ts-ignore
[__, data, description, sections,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        sections: {
            type: Array,
            required: true,
        },
        data: {
            type: Object,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
    },
});
export default {};
