/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, Button, Badge } from 'frappe-ui';
import SettingFields from '@/components/Settings/SettingFields.vue';
import { watch, ref } from 'vue';
const isDirty = ref(false);
const props = defineProps({
    sections: {
        type: Array,
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
const branding = createResource({
    url: 'lms.lms.api.get_branding',
    auto: true,
    cache: 'brand',
});
const saveSettings = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'Website Settings',
            name: 'Website Settings',
            fieldname: values.fields,
        };
    },
});
const update = () => {
    saveSettings.submit({
        fields: getFieldsToSave(),
    }, {
        onSuccess(data) {
            isDirty.value = false;
        },
    });
};
const getFieldsToSave = () => {
    let imageFields = ['favicon', 'banner_image'];
    let fieldsToSave = {};
    props.sections.forEach((section) => {
        section.columns.forEach((column) => {
            column.fields.forEach((field) => {
                if (imageFields.includes(field.name)) {
                    fieldsToSave[field.name] =
                        branding.data[field.name] && branding.data[field.name].file_url
                            ? branding.data[field.name].file_url
                            : null;
                }
                else {
                    fieldsToSave[field.name] = branding.data[field.name];
                }
            });
        });
    });
    fieldsToSave['app_logo'] = fieldsToSave['banner_image'];
    return fieldsToSave;
};
watch(branding, (updatedDoc) => {
    updateDirtyState(updatedDoc);
});
const updateDirtyState = (updatedDoc) => {
    const { textFields, imageFields } = segregateFields();
    textFields.forEach((field) => {
        if (updatedDoc.data[field] != updatedDoc.previousData[field]) {
            isDirty.value = true;
        }
    });
    imageFields.forEach((field) => {
        if (updatedDoc.data[field]?.file_url !=
            updatedDoc.previousData[field]?.file_url) {
            isDirty.value = true;
        }
    });
};
const segregateFields = () => {
    let textFields = [];
    let imageFields = [];
    props.sections.forEach((section) => {
        section.columns.forEach((column) => {
            column.fields.forEach((field) => {
                if (field.type === 'Upload') {
                    imageFields.push(field.name);
                }
                else {
                    textFields.push(field.name);
                }
            });
        });
    });
    return { textFields, imageFields };
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
    ...{ class: "flex flex-col h-full" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-semibold mb-1 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__(__VLS_ctx.label));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.isDirty) {
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
    loading: (__VLS_ctx.saveSettings.loading),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    variant: "solid",
    loading: (__VLS_ctx.saveSettings.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = ({ click: {} },
    { onClick: (__VLS_ctx.update) });
const { default: __VLS_12 } = __VLS_8.slots;
(__VLS_ctx.__('Update'));
// @ts-ignore
[__, __, __, label, isDirty, saveSettings, update,];
var __VLS_8;
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xs text-ink-gray-5" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
(__VLS_ctx.__(__VLS_ctx.description));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overflow-y-auto" },
});
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
const __VLS_13 = SettingFields;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    sections: (__VLS_ctx.sections),
    data: (__VLS_ctx.branding.data),
}));
const __VLS_15 = __VLS_14({
    sections: (__VLS_ctx.sections),
    data: (__VLS_ctx.branding.data),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
// @ts-ignore
[__, description, sections, branding,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        sections: {
            type: Array,
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
