/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { TextEditor } from 'frappe-ui';
import { useDebounceFn } from '@vueuse/core';
import { inject, ref, onMounted, watch } from 'vue';
import { blockQuotesClick } from '@/utils/';
const note = ref(null);
const currentNoteName = ref(null);
const user = inject('$user');
const notes = defineModel('notes');
const emit = defineEmits();
const props = defineProps();
onMounted(() => {
    updateCurrentNote();
});
watch(() => notes.value?.data, () => {
    updateCurrentNote();
    blockQuotesClick();
});
const updateCurrentNote = () => {
    const currentNote = notes.value?.data?.filter((row) => {
        return !row.highlighted_text && row.note !== '';
    });
    if (currentNote?.length === 0) {
        note.value = null;
        currentNoteName.value = null;
        return;
    }
    else if (currentNote && currentNote.length > 0) {
        currentNoteName.value = currentNote[0].name;
        note.value = currentNote[0].note || null;
    }
};
const updateNoteText = (val) => {
    note.value = val;
    debouncedSave();
};
const debouncedSave = useDebounceFn(() => {
    saveNotes();
}, 2000);
const saveNotes = () => {
    if (currentNoteName.value) {
        updateNote();
    }
    else {
        createNote();
    }
};
const createNote = () => {
    notes.value?.insert.submit({
        lesson: props.lesson,
        member: user?.data?.name,
        note: note.value,
        color: 'Yellow',
        name: '',
    }, {
        onSuccess(data) {
            currentNoteName.value = data.name || null;
            emit('updateNotes');
        },
        onError(err) {
            console.error('Error creating note:', err);
        },
    });
};
const updateNote = () => {
    if (!currentNoteName.value)
        return;
    notes.value?.setValue.submit({
        name: currentNoteName.value,
        lesson: props.lesson,
        member: user?.data?.name,
        note: note.value,
    }, {
        onSuccess(data) {
            emit('updateNotes');
        },
        onError(err) {
            console.error('Error updating note:', err);
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-lg font-semibold mb-4 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('My Notes'));
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
TextEditor;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    content: (__VLS_ctx.note),
    placeholder: (__VLS_ctx.__('Make notes for quick revision. Press / for menu.')),
    editable: (true),
    uploadArgs: ({
        private: true,
    }),
    editorClass: "prose prose-sm min-h-[200px] max-w-none",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    content: (__VLS_ctx.note),
    placeholder: (__VLS_ctx.__('Make notes for quick revision. Press / for menu.')),
    editable: (true),
    uploadArgs: ({
        private: true,
    }),
    editorClass: "prose prose-sm min-h-[200px] max-w-none",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: ((val) => __VLS_ctx.updateNoteText(val)) });
var __VLS_3;
var __VLS_4;
// @ts-ignore
[__, __, note, updateNoteText,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
