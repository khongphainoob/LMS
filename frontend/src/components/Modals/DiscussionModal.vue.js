/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, FormControl, TextEditor, createResource, toast, } from 'frappe-ui';
import { reactive } from 'vue';
import { singularize } from '@/utils';
const topics = defineModel('reloadTopics');
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    doctype: {
        type: String,
        required: true,
    },
    docname: {
        type: String,
        required: true,
    },
});
const topic = reactive({
    title: '',
    reply: '',
});
const topicResource = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Discussion Topic',
                reference_doctype: props.doctype,
                reference_docname: props.docname,
                title: topic.title,
            },
        };
    },
});
const replyResource = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Discussion Reply',
                topic: values.topic,
                reply: topic.reply,
            },
        };
    },
});
const submitTopic = (close) => {
    topicResource.submit({}, {
        validate() {
            if (!topic.title) {
                return 'Title cannot be empty.';
            }
            if (!topic.reply) {
                return 'Reply cannot be empty.';
            }
        },
        onSuccess(data) {
            replyResource.submit({
                topic: data.name,
            }, {
                onSuccess() {
                    topic.title = '';
                    topic.reply = '';
                    topics.value.reload();
                    close();
                },
            });
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
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
    options: ({
        title: __VLS_ctx.singularize(props.title),
        size: '2xl',
        actions: [
            {
                label: __VLS_ctx.__('Post'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.submitTopic(close),
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    options: ({
        title: __VLS_ctx.singularize(props.title),
        size: '2xl',
        actions: [
            {
                label: __VLS_ctx.__('Post'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.submitTopic(close),
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.topic.title),
        label: (__VLS_ctx.__('Title')),
        type: "text",
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.topic.title),
        label: (__VLS_ctx.__('Title')),
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Details'));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.topic.reply),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.topic.reply),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    const __VLS_19 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.topic.reply = val)) });
    var __VLS_16;
    var __VLS_17;
    // @ts-ignore
    [singularize, __, __, __, submitTopic, topic, topic, topic,];
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
            title: {
                type: String,
                required: true,
            },
            doctype: {
                type: String,
                required: true,
            },
            docname: {
                type: String,
                required: true,
            },
        },
    },
});
export default {};
