/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref, computed, watch } from 'vue';
import { Button } from 'frappe-ui';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { tomorrow } from 'thememirror';
const props = withDefaults(defineProps(), {
    language: 'javascript',
    modelValue: null,
    height: 'auto',
    maxHeight: '250px',
    showLineNumbers: true,
    completions: null,
});
const emit = defineEmits(['update:modelValue', 'save']);
const code = ref('');
watch(() => props.modelValue, (newVal) => {
    code.value =
        typeof newVal === 'string' ? newVal : JSON.stringify(newVal, null, 2);
}, { immediate: true });
watch(code, (val) => {
    emit('update:modelValue', val);
});
const errorMessage = ref('');
const emitEditorValue = () => {
    try {
        errorMessage.value = '';
        let value = code.value || '';
        if (!props.showSaveButton && !props.readonly) {
            emit('update:modelValue', value);
        }
    }
    catch (e) {
        console.error('Error while parsing JSON for editor', e);
        errorMessage.value = `Invalid object/JSON: ${e.message}`;
    }
};
const languageExtension = ref();
const autocompleteExtension = ref();
async function setLanguageExtension() {
    const importMap = {
        json: () => import('@codemirror/lang-json'),
        javascript: () => import('@codemirror/lang-javascript'),
        html: () => import('@codemirror/lang-html'),
        css: () => import('@codemirror/lang-css'),
        python: () => import('@codemirror/lang-python'),
    };
    const languageImport = importMap[props.language];
    if (!languageImport)
        return;
    const module = await languageImport();
    languageExtension.value = module[props.language]?.();
    if (props.completions) {
        const languageData = module[`${props.language}Language`];
        autocompleteExtension.value = languageData.data.of({
            autocomplete: props.completions,
        });
    }
}
onMounted(async () => {
    await setLanguageExtension();
});
watch(() => props.language, async () => {
    await setLanguageExtension();
}, { immediate: true });
const extensions = computed(() => {
    const baseExtensions = [
        closeBrackets(),
        tomorrow,
        EditorView.theme({
            '&': {
                fontFamily: 'monospace',
                fontSize: '12px',
            },
            '.cm-gutters': {
                display: props.showLineNumbers ? 'flex' : 'none',
            },
        }),
    ];
    if (languageExtension.value) {
        baseExtensions.push(languageExtension.value);
    }
    if (autocompleteExtension.value) {
        baseExtensions.push(autocompleteExtension.value);
    }
    const autocompletionOptions = {
        activateOnTyping: true,
        maxRenderedOptions: 10,
        closeOnBlur: false,
        icons: false,
        optionClass: () => 'flex h-7 !px-2 items-center rounded !text-gray-600',
    };
    baseExtensions.push(autocompletion(autocompletionOptions));
    return baseExtensions;
});
const __VLS_defaults = {
    language: 'javascript',
    modelValue: null,
    height: 'auto',
    maxHeight: '250px',
    showLineNumbers: true,
    completions: null,
};
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
    ...{ class: "flex w-full flex-col gap-1.5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__(__VLS_ctx.label));
}
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.codemirror | typeof __VLS_components.Codemirror} */
codemirror;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.code),
    extensions: (__VLS_ctx.extensions),
    tabSize: (2),
    autofocus: (__VLS_ctx.autofocus),
    indentWithTab: (true),
    ...{ style: ({ height: __VLS_ctx.height, maxHeight: __VLS_ctx.maxHeight }) },
    disabled: (__VLS_ctx.readonly),
    ...{ class: ({
            'border border-outline-gray-1': __VLS_ctx.showBorder,
        }) },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.code),
    extensions: (__VLS_ctx.extensions),
    tabSize: (2),
    autofocus: (__VLS_ctx.autofocus),
    indentWithTab: (true),
    ...{ style: ({ height: __VLS_ctx.height, maxHeight: __VLS_ctx.maxHeight }) },
    disabled: (__VLS_ctx.readonly),
    ...{ class: ({
            'border border-outline-gray-1': __VLS_ctx.showBorder,
        }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ blur: {} },
    { onBlur: (__VLS_ctx.emitEditorValue) });
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-outline-gray-1']} */ ;
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.showSaveButton) {
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
        ...{ class: "mt-3 w-full text-base" },
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
        ...{ class: "mt-3 w-full text-base" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSaveButton))
                    return;
                __VLS_ctx.emit('save', __VLS_ctx.code);
                // @ts-ignore
                [label, label, __, code, code, extensions, autofocus, height, maxHeight, readonly, showBorder, emitEditorValue, showSaveButton, emit,];
            } });
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    const { default: __VLS_14 } = __VLS_10.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_10;
    var __VLS_11;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
    props: {},
});
export default {};
