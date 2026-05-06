/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, createResource, Dialog, FormControl, TextEditor, toast, } from 'frappe-ui';
import { ref, reactive, watch } from 'vue';
import { sanitizeHTML } from '@/utils';
import Link from '@/components/Controls/Link.vue';
const show = defineModel();
const reloadProfile = defineModel('reloadProfile');
const hasLanguageChanged = ref(false);
const isDirty = ref(false);
const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});
const profile = reactive({
    first_name: '',
    last_name: '',
    headline: '',
    bio: '',
    image: '',
    open_to: '',
    linkedin: '',
    github: '',
    twitter: '',
});
const updateProfile = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'User',
            name: props.profile.data.name,
            fieldname: {
                user_image: profile.image || null,
                ...profile,
            },
        };
    },
    onSuccess(data) {
        props.profile.data = data;
    },
});
const saveProfile = () => {
    profile.bio = sanitizeHTML(profile.bio);
    updateProfile.submit({}, {
        onSuccess() {
            show.value = false;
            reloadProfile.value.reload();
            if (hasLanguageChanged.value) {
                hasLanguageChanged.value = false;
                window.location.reload();
            }
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
watch(() => profile, (newVal) => {
    if (!props.profile.data)
        return;
    let keys = Object.keys(newVal);
    keys.splice(keys.indexOf('image'), 1);
    for (let key of keys) {
        if (newVal[key] !== props.profile.data[key]) {
            isDirty.value = true;
            return;
        }
    }
    if (profile.image !== props.profile.data.user_image) {
        isDirty.value = true;
        return;
    }
    isDirty.value = false;
}, { deep: true });
watch(() => props.profile.data, (newVal) => {
    if (newVal) {
        profile.first_name = newVal.first_name;
        profile.last_name = newVal.last_name;
        profile.headline = newVal.headline;
        profile.language = newVal.language;
        profile.bio = newVal.bio;
        profile.open_to = newVal.open_to;
        profile.linkedin = newVal.linkedin;
        profile.github = newVal.github;
        profile.twitter = newVal.twitter;
        profile.image = newVal.user_image;
        isDirty.value = false;
    }
});
watch(() => profile.language, () => {
    if (profile.language !== props.profile.data.language) {
        hasLanguageChanged.value = true;
    }
});
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
        size: '3xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '3xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-header': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-2xl font-semibold leading-6 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Edit Profile'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.isDirty) {
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            theme: "orange",
        }));
        const __VLS_10 = __VLS_9({
            theme: "orange",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        const { default: __VLS_13 } = __VLS_11.slots;
        (__VLS_ctx.__('Not Saved'));
        // @ts-ignore
        [show, __, __, isDirty,];
        var __VLS_11;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-5 float-right" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_19;
    const __VLS_20 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.saveProfile();
                // @ts-ignore
                [saveProfile,];
            } });
    const { default: __VLS_21 } = __VLS_17.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_17;
    var __VLS_18;
    // @ts-ignore
    [];
}
{
    const { 'body-content': __VLS_22 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-10" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.Uploader} */
    Uploader;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        modelValue: (__VLS_ctx.profile.image),
        label: (__VLS_ctx.__('Profile Image')),
        required: (true),
        shape: "circle",
    }));
    const __VLS_25 = __VLS_24({
        modelValue: (__VLS_ctx.profile.image),
        label: (__VLS_ctx.__('Profile Image')),
        required: (true),
        shape: "circle",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        modelValue: (__VLS_ctx.profile.first_name),
        label: (__VLS_ctx.__('First Name')),
    }));
    const __VLS_30 = __VLS_29({
        modelValue: (__VLS_ctx.profile.first_name),
        label: (__VLS_ctx.__('First Name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        modelValue: (__VLS_ctx.profile.last_name),
        label: (__VLS_ctx.__('Last Name')),
    }));
    const __VLS_35 = __VLS_34({
        modelValue: (__VLS_ctx.profile.last_name),
        label: (__VLS_ctx.__('Last Name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        modelValue: (__VLS_ctx.profile.headline),
        label: (__VLS_ctx.__('Headline')),
    }));
    const __VLS_40 = __VLS_39({
        modelValue: (__VLS_ctx.profile.headline),
        label: (__VLS_ctx.__('Headline')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_43;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        modelValue: (__VLS_ctx.profile.linkedin),
        label: (__VLS_ctx.__('LinkedIn ID')),
    }));
    const __VLS_45 = __VLS_44({
        modelValue: (__VLS_ctx.profile.linkedin),
        label: (__VLS_ctx.__('LinkedIn ID')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_48;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        modelValue: (__VLS_ctx.profile.github),
        label: (__VLS_ctx.__('GitHub ID')),
    }));
    const __VLS_50 = __VLS_49({
        modelValue: (__VLS_ctx.profile.github),
        label: (__VLS_ctx.__('GitHub ID')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_53;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        modelValue: (__VLS_ctx.profile.twitter),
        label: (__VLS_ctx.__('Twitter ID')),
    }));
    const __VLS_55 = __VLS_54({
        modelValue: (__VLS_ctx.profile.twitter),
        label: (__VLS_ctx.__('Twitter ID')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_58;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        modelValue: (__VLS_ctx.profile.open_to),
        type: "select",
        options: ([' ', 'Work', 'Hiring']),
        label: (__VLS_ctx.__('Open to')),
        placeholder: (__VLS_ctx.__('Looking for new work or hiring talent?')),
    }));
    const __VLS_60 = __VLS_59({
        modelValue: (__VLS_ctx.profile.open_to),
        type: "select",
        options: ([' ', 'Work', 'Hiring']),
        label: (__VLS_ctx.__('Open to')),
        placeholder: (__VLS_ctx.__('Looking for new work or hiring talent?')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const __VLS_63 = Link;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        label: (__VLS_ctx.__('Language')),
        modelValue: (__VLS_ctx.profile.language),
        doctype: "Language",
    }));
    const __VLS_65 = __VLS_64({
        label: (__VLS_ctx.__('Language')),
        modelValue: (__VLS_ctx.profile.language),
        doctype: "Language",
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Bio'));
    let __VLS_68;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        ...{ 'onChange': {} },
        fixedMenu: (true),
        content: (__VLS_ctx.profile.bio),
        rows: (15),
        editorClass: "prose-sm py-2 px-2 min-h-[280px] border-outline-gray-2 hover:border-outline-gray-3 rounded-b-md bg-surface-gray-3",
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onChange': {} },
        fixedMenu: (true),
        content: (__VLS_ctx.profile.bio),
        rows: (15),
        editorClass: "prose-sm py-2 px-2 min-h-[280px] border-outline-gray-2 hover:border-outline-gray-3 rounded-b-md bg-surface-gray-3",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_73;
    const __VLS_74 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.profile.bio = val)) });
    var __VLS_71;
    var __VLS_72;
    // @ts-ignore
    [__, __, __, __, __, __, __, __, __, __, __, profile, profile, profile, profile, profile, profile, profile, profile, profile, profile, profile,];
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
            profile: {
                type: Object,
                required: true,
            },
        },
    },
});
export default {};
