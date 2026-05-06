/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/theme-chrome';
import 'ace-builds/src-min-noconflict/theme-twilight';
import { onMounted, ref, watch } from 'vue';
import { Button } from 'frappe-ui';
const isDark = ref(false);
const props = defineProps({
    modelValue: {
        type: [Object, String, Array],
    },
    type: {
        type: String,
        default: 'JSON',
    },
    label: {
        type: String,
        default: '',
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    height: {
        type: String,
        default: '250px',
    },
    showLineNumbers: {
        type: Boolean,
        default: false,
    },
    autofocus: {
        type: Boolean,
        default: true,
    },
    showSaveButton: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        default: '',
    },
});
const emit = defineEmits(['save', 'update:modelValue']);
const editor = ref(null);
let aceEditor = null;
onMounted(() => {
    isDark.value = localStorage.getItem('theme') === 'dark';
    setupEditor();
});
const setupEditor = () => {
    aceEditor = ace.edit(editor.value);
    resetEditor(props.modelValue, true);
    aceEditor.setReadOnly(props.readonly);
    aceEditor.setOptions({
        fontSize: '12px',
        useWorker: false,
        showGutter: props.showLineNumbers,
        wrap: props.showLineNumbers,
    });
    if (props.type === 'CSS') {
        import('ace-builds/src-noconflict/mode-css').then(() => {
            aceEditor?.session.setMode('ace/mode/css');
        });
    }
    else if (props.type === 'JavaScript') {
        import('ace-builds/src-noconflict/mode-javascript').then(() => {
            aceEditor?.session.setMode('ace/mode/javascript');
        });
    }
    else if (props.type === 'Python') {
        import('ace-builds/src-noconflict/mode-python').then(() => {
            aceEditor?.session.setMode('ace/mode/python');
        });
    }
    else if (props.type === 'JSON') {
        import('ace-builds/src-noconflict/mode-json').then(() => {
            aceEditor?.session.setMode('ace/mode/json');
        });
    }
    else {
        import('ace-builds/src-noconflict/mode-html').then(() => {
            aceEditor?.session.setMode('ace/mode/html');
        });
    }
    aceEditor.on('blur', () => {
        try {
            let value = aceEditor?.getValue() || '';
            if (props.type === 'JSON') {
                value = JSON.parse(value);
            }
            if (value === props.modelValue)
                return;
            if (!props.showSaveButton && !props.readonly) {
                emit('update:modelValue', value);
            }
        }
        catch (e) {
            // do nothing
        }
    });
};
const getModelValue = () => {
    let value = props.modelValue || '';
    try {
        if (props.type === 'JSON' || typeof value === 'object') {
            value = JSON.stringify(value, null, 2);
        }
    }
    catch (e) {
        // do nothing
    }
    return value;
};
function resetEditor(value, resetHistory = false) {
    value = getModelValue();
    aceEditor?.setValue(value);
    aceEditor?.clearSelection();
    aceEditor?.setTheme(isDark.value ? 'ace/theme/twilight' : 'ace/theme/chrome');
    props.autofocus && aceEditor?.focus();
    if (resetHistory) {
        aceEditor?.session.getUndoManager().reset();
    }
}
watch(isDark, () => {
    console.log(isDark.value);
    aceEditor?.setTheme(isDark.value ? 'ace/theme/twilight' : 'ace/theme/chrome');
});
watch(() => props.type, () => {
    setupEditor();
});
watch(() => props.modelValue, () => {
    resetEditor(props.modelValue);
});
const __VLS_exposed = { resetEditor };
defineExpose(__VLS_exposed);
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor flex flex-col gap-1" },
    ...{ style: ({
            height: __VLS_ctx.height,
        }) },
});
/** @type {__VLS_StyleScopedClasses['editor']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-ink-gray-7 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.label);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ref: "editor",
    ...{ class: "h-auto flex-1 overflow-hidden overscroll-none !rounded border border-outline-gray-2 bg-surface-gray-2 dark:bg-gray-900" },
});
/** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['overscroll-none']} */ ;
/** @type {__VLS_StyleScopedClasses['!rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "mt-1 text-xs text-ink-gray-5" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.description) }, null, null);
__VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.description) }, null, null);
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
if (__VLS_ctx.showSaveButton) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "mt-3" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "mt-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSaveButton))
                    return;
                __VLS_ctx.emit('save', __VLS_ctx.aceEditor?.getValue());
                // @ts-ignore
                [height, label, label, description, description, showSaveButton, emit, aceEditor,];
            } });
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    const { default: __VLS_7 } = __VLS_3.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_3;
    var __VLS_4;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    emits: {},
    props: {
        modelValue: {
            type: [Object, String, Array],
        },
        type: {
            type: String,
            default: 'JSON',
        },
        label: {
            type: String,
            default: '',
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        height: {
            type: String,
            default: '250px',
        },
        showLineNumbers: {
            type: Boolean,
            default: false,
        },
        autofocus: {
            type: Boolean,
            default: true,
        },
        showSaveButton: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            default: '',
        },
    },
});
export default {};
