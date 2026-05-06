/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, createResource, toast } from 'frappe-ui';
import Link from '@/components/Controls/Link.vue';
import { reactive, watch } from 'vue';
import IconPicker from '@/components/Controls/IconPicker.vue';
const sidebar = defineModel('reloadSidebar');
const show = defineModel();
const page = reactive({
    icon: '',
    webpage: '',
});
const props = defineProps({
    page: {
        type: Object,
        default: null,
    },
});
const webPage = createResource({
    url: 'lms.lms.api.update_sidebar_item',
    makeParams(values) {
        return {
            webpage: page.webpage,
            icon: page.icon,
        };
    },
});
watch(() => props.page, (newPage) => {
    if (newPage) {
        page.icon = newPage.icon;
        page.webpage = newPage.web_page;
    }
}, { immediate: true });
const addWebPage = (close) => {
    webPage.submit({}, {
        onSuccess() {
            sidebar.value.reload();
            close();
            toast.success(__('Web page added to sidebar'));
        },
        onError(err) {
            toast.error(err.message[0] || err);
            close();
        },
    });
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
        title: __VLS_ctx.__('Add web page to sidebar'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Add'),
                variant: 'solid',
                onClick: (close) => {
                    __VLS_ctx.addWebPage(close);
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Add web page to sidebar'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Add'),
                variant: 'solid',
                onClick: (close) => {
                    __VLS_ctx.addWebPage(close);
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
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    const __VLS_8 = Link;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.page.webpage),
        doctype: "Web Page",
        label: (__VLS_ctx.__('Web Page')),
        filters: ({
            published: 1,
        }),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.page.webpage),
        doctype: "Web Page",
        label: (__VLS_ctx.__('Web Page')),
        filters: ({
            published: 1,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_13 = IconPicker;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.page.icon),
        label: (__VLS_ctx.__('Icon')),
        ...{ class: "mt-4" },
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.page.icon),
        label: (__VLS_ctx.__('Icon')),
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    // @ts-ignore
    [show, __, __, __, __, addWebPage, page, page,];
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
            page: {
                type: Object,
                default: null,
            },
        },
    },
});
export default {};
