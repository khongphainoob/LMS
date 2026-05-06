/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, FormControl, LoadingIndicator, createListResource, createResource, toast, } from 'frappe-ui';
import { Plus, Trash2, X } from 'lucide-vue-next';
import { ref } from 'vue';
import { cleanError } from '@/utils';
const showForm = ref(false);
const category = ref(null);
const categoryInput = ref(null);
const saving = ref(false);
const editing = ref(null);
const editedValue = ref('');
const editInputRef = ref([]);
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
});
const categories = createListResource({
    doctype: 'LMS Category',
    fields: ['name', 'category'],
    auto: true,
});
const addCategory = () => {
    categories.insert.submit({
        category: category.value,
    }, {
        onSuccess(data) {
            categories.reload();
            category.value = null;
            showForm.value = false;
            toast.success(__('Category added successfully'));
        },
        onError(err) {
            toast.error(__(cleanError(err.messages[0]) || 'Unable to add category'));
        },
    });
};
const showCategoryForm = () => {
    showForm.value = !showForm.value;
    setTimeout(() => {
        categoryInput.value.$el.querySelector('input').focus();
    }, 0);
};
const updateCategory = createResource({
    url: 'frappe.client.rename_doc',
    makeParams(values) {
        return {
            doctype: 'LMS Category',
            old_name: values.name,
            new_name: values.category,
        };
    },
});
const update = (name, value) => {
    saving.value = true;
    updateCategory.submit({
        name: name,
        category: value,
    }, {
        onSuccess() {
            saving.value = false;
            categories.reload();
            editing.value = null;
            editedValue.value = '';
            toast.success(__('Category updated successfully'));
        },
        onError(err) {
            saving.value = false;
            editing.value = null;
            editedValue.value = '';
            toast.error(__(cleanError(err.messages[0]) || 'Unable to update category'));
        },
    });
};
const deleteCategory = (name) => {
    saving.value = true;
    categories.delete.submit(name, {
        onSuccess() {
            saving.value = false;
            categories.reload();
            toast.success(__('Category deleted successfully'));
        },
        onError(err) {
            saving.value = false;
            toast.error(__(cleanError(err.messages[0]) || 'Unable to delete category'));
        },
    });
};
const saveChanges = (name, value) => {
    saving.value = true;
    update(name, value);
};
const allowEdit = (cat, index) => {
    editing.value = cat;
    editedValue.value = cat.category;
    setTimeout(() => {
        editInputRef.value[index].$el.querySelector('input').focus();
    }, 0);
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
    ...{ class: "flex flex-col min-h-0 text-base" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col space-y-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.label);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xs text-ink-gray-5" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
(__VLS_ctx.__(__VLS_ctx.description));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
if (__VLS_ctx.saving) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-1 text-ink-amber-3 border border-outline-amber-1 bg-surface-amber-1 rounded-lg px-2 py-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-amber-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-amber-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-amber-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.LoadingIndicator} */
    LoadingIndicator;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "size-2" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "size-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['size-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.__('saving...'));
}
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = ({ click: {} },
    { onClick: (() => __VLS_ctx.showCategoryForm()) });
const { default: __VLS_12 } = __VLS_8.slots;
{
    const { prefix: __VLS_13 } = __VLS_8.slots;
    if (!__VLS_ctx.showForm) {
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    }
    else {
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }));
        const __VLS_21 = __VLS_20({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    }
    // @ts-ignore
    [label, __, __, description, saving, showCategoryForm, showForm,];
}
(__VLS_ctx.showForm ? __VLS_ctx.__('Close') : __VLS_ctx.__('New'));
// @ts-ignore
[__, __, showForm,];
var __VLS_8;
var __VLS_9;
if (__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between my-4 space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        ref: "categoryInput",
        modelValue: (__VLS_ctx.category),
        placeholder: (__VLS_ctx.__('Category Name')),
        ...{ class: "flex-1" },
    }));
    const __VLS_26 = __VLS_25({
        ref: "categoryInput",
        modelValue: (__VLS_ctx.category),
        placeholder: (__VLS_ctx.__('Category Name')),
        ...{ class: "flex-1" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_29 = {};
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    var __VLS_27;
    let __VLS_31;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        ...{ 'onClick': {} },
        variant: "subtle",
    }));
    const __VLS_33 = __VLS_32({
        ...{ 'onClick': {} },
        variant: "subtle",
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    let __VLS_36;
    const __VLS_37 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    return;
                __VLS_ctx.addCategory();
                // @ts-ignore
                [__, showForm, category, addCategory,];
            } });
    const { default: __VLS_38 } = __VLS_34.slots;
    (__VLS_ctx.__('Add'));
    // @ts-ignore
    [__,];
    var __VLS_34;
    var __VLS_35;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overflow-y-scroll" },
});
/** @type {__VLS_StyleScopedClasses['overflow-y-scroll']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "divide-y space-y-2" },
});
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
for (const [cat, index] of __VLS_vFor((__VLS_ctx.categories.data))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (cat.name),
        ...{ class: "pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    if (__VLS_ctx.editing?.name !== cat.name) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between group text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.editing?.name !== cat.name))
                        return;
                    __VLS_ctx.allowEdit(cat, index);
                    // @ts-ignore
                    [categories, editing, allowEdit,];
                } },
        });
        (cat.category);
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            ...{ 'onClick': {} },
            variant: "ghost",
            theme: "red",
            ...{ class: "invisible group-hover:visible" },
        }));
        const __VLS_41 = __VLS_40({
            ...{ 'onClick': {} },
            variant: "ghost",
            theme: "red",
            ...{ class: "invisible group-hover:visible" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        let __VLS_44;
        const __VLS_45 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.editing?.name !== cat.name))
                        return;
                    __VLS_ctx.deleteCategory(cat.name);
                    // @ts-ignore
                    [deleteCategory,];
                } });
        /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
        const { default: __VLS_46 } = __VLS_42.slots;
        {
            const { icon: __VLS_47 } = __VLS_42.slots;
            let __VLS_48;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
                ...{ class: "size-4 stroke-1.5 text-ink-red-4" },
            }));
            const __VLS_50 = __VLS_49({
                ...{ class: "size-4 stroke-1.5 text-ink-red-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-red-4']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_42;
        var __VLS_43;
    }
    else {
        let __VLS_53;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
            ...{ 'onKeyup': {} },
            ref: ((el) => (__VLS_ctx.editInputRef[index] = el)),
            modelValue: (__VLS_ctx.editedValue),
            type: "text",
            ...{ class: "w-full" },
        }));
        const __VLS_55 = __VLS_54({
            ...{ 'onKeyup': {} },
            ref: ((el) => (__VLS_ctx.editInputRef[index] = el)),
            modelValue: (__VLS_ctx.editedValue),
            type: "text",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        let __VLS_58;
        const __VLS_59 = ({ keyup: {} },
            { onKeyup: (...[$event]) => {
                    if (!!(__VLS_ctx.editing?.name !== cat.name))
                        return;
                    __VLS_ctx.saveChanges(cat.name, __VLS_ctx.editedValue);
                    // @ts-ignore
                    [editInputRef, editedValue, editedValue, saveChanges,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_56;
        var __VLS_57;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
var __VLS_30 = __VLS_29;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        label: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
});
export default {};
