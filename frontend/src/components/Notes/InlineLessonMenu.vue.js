/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, inject, ref, watch } from 'vue';
import { NotepadText, Trash2 } from 'lucide-vue-next';
import { blockQuotesClick, getColor, highlightText } from '@/utils';
const user = inject('$user');
const show = defineModel();
const notes = defineModel('notes');
const top = ref(0);
const left = ref(0);
const currentSelection = ref(null);
const selectedText = ref('');
const emit = defineEmits();
const props = defineProps();
watch(show, () => {
    if (!show.value) {
        return resetMenuPosition();
    }
    currentSelection.value = window.getSelection();
    if (!currentSelection.value?.toString()) {
        return resetMenuPosition();
    }
    updateMenuPosition();
});
const updateMenuPosition = () => {
    selectedText.value = currentSelection.value?.toString() || '';
    const range = currentSelection.value?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();
    if (!rect)
        return;
    const offsetY = window.scrollY;
    const offsetX = window.scrollX;
    top.value = Math.floor(rect.top + offsetY - 40);
    left.value = Math.floor(rect.right + offsetX + 10);
};
const resetMenuPosition = () => {
    top.value = 0;
    left.value = 0;
};
const colors = computed(() => {
    return ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];
});
const highlightExists = () => {
    return notes.value?.data?.some((note) => note.highlighted_text === selectedText.value);
};
const saveHighLight = (color) => {
    if (!selectedText.value)
        return;
    notes.value?.insert.submit({
        lesson: props.lesson,
        member: user?.data?.name,
        highlighted_text: selectedText.value,
        color: color,
        name: '',
    }, {
        onSuccess(data) {
            highlightText(data);
            resetStates();
            emit('updateNotes');
        },
        onError(err) {
            console.error('Error saving highlight:', err);
            resetStates();
        },
    });
};
const deleteHighlight = () => {
    let notesToDelete = notes.value?.data.find((note) => note.highlighted_text === selectedText.value);
    if (!notesToDelete)
        return;
    notes.value?.delete.submit(notesToDelete.name, {
        onSuccess() {
            resetStates();
            document.querySelectorAll('.highlighted-text').forEach((el) => {
                const element = el;
                if (element.dataset.name === notesToDelete.name) {
                    element.style.backgroundColor = 'transparent';
                }
            });
        },
        onError(err) {
            console.error('Error deleting highlight:', err);
            resetStates();
        },
    });
};
const addToNotes = () => {
    if (!selectedText.value)
        return;
    let noteToUpdate = notes.value?.data.find((note) => {
        return !note.highlighted_text && note.note !== '';
    });
    if (!noteToUpdate) {
        createNote();
    }
    else {
        updateNote(noteToUpdate);
    }
};
const createNote = () => {
    notes.value?.insert.submit({
        lesson: props.lesson,
        member: user?.data?.name,
        note: `<blockquote><p>${selectedText.value}</p></blockquote><br>`,
        color: 'Yellow',
        name: '',
    }, {
        onSuccess(data) {
            emit('updateNotes');
            setTimeout(() => {
                scrollToText(selectedText.value);
                blockQuotesClick();
                resetStates();
            }, 100);
        },
        onError(err) {
            console.error('Error creating note:', err);
            resetStates();
        },
    });
};
const updateNote = (noteToUpdate) => {
    notes.value?.setValue.submit({
        name: noteToUpdate.name,
        note: `${noteToUpdate.note}\n\n<blockquote><p>${selectedText.value}</p></blockquote><br>`,
    }, {
        onSuccess(data) {
            emit('updateNotes');
            setTimeout(() => {
                scrollToText(selectedText.value);
                blockQuotesClick();
                resetStates();
            }, 100);
        },
        onError(err) {
            console.error('Error updating note:', err);
            resetStates();
        },
    });
};
const scrollToText = (text) => {
    const elements = document.querySelectorAll('blockquote p');
    Array.from(elements).forEach((el) => {
        const element = el;
        if (element.textContent?.toLowerCase().includes(text.toLowerCase())) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
};
const resetStates = () => {
    selectedText.value = '';
    show.value = false;
    resetMenuPosition();
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
    ...{ class: "text-sm absolute bg-white border rounded-md z-10 w-44" },
    ...{ style: ({
            display: __VLS_ctx.top > 0 ? 'block' : 'none',
            top: __VLS_ctx.top + 'px',
            left: __VLS_ctx.left + 'px',
        }) },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-44']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-2 py-2" },
});
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xs text-ink-gray-5 font-medium px-3" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
(__VLS_ctx.__('Highlight'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
for (const [color] of __VLS_vFor((__VLS_ctx.colors))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.saveHighLight(color);
                // @ts-ignore
                [top, top, left, __, colors, saveHighLight,];
            } },
        ...{ class: "flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-surface-gray-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "size-3 rounded-full" },
        ...{ style: ({
                backgroundColor: __VLS_ctx.getColor(color.toLowerCase(), 400),
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__(color));
    // @ts-ignore
    [__, getColor,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-t" },
});
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.addToNotes();
            // @ts-ignore
            [addToNotes,];
        } },
    ...{ class: "flex items-center space-x-2 hover:bg-surface-gray-2 cursor-pointer rounded-b-md py-2 px-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-b-md']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.NotepadText} */
NotepadText;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-3 stroke-1.5" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-3 stroke-1.5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-3']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.__('Add to Notes'));
if (__VLS_ctx.highlightExists()) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.deleteHighlight) },
        ...{ class: "flex items-center space-x-2 hover:bg-surface-gray-2 cursor-pointer rounded-b-md py-2 px-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-b-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
    Trash2;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ class: "size-3 stroke-1.5" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ class: "size-3 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Remove Highlight'));
}
// @ts-ignore
[__, __, highlightExists, deleteHighlight,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
