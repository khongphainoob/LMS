/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, inject, onMounted } from 'vue';
import { createResource, toast } from 'frappe-ui';
import { Check, AlertCircle, Info, Globe } from 'lucide-vue-next';
const $user = inject('$user');
const currentLanguage = ref('en');
const isUpdatingLanguage = ref(false);
// Language options
const languages = [
    {
        code: 'en',
        name: 'English',
        native: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'vi',
        name: 'Vietnamese',
        native: 'Tiếng Việt',
        flag: '🇻🇳'
    }
];
// Check if user can change language (admin, moderator, or teacher)
const canChangeLanguage = computed(() => {
    if (!$user.data)
        return false;
    const userRoles = $user.data.roles || [];
    return userRoles.includes('System Manager') ||
        userRoles.includes('Moderator') ||
        userRoles.includes('Course Creator');
});
// Get current user language
const getUserLanguage = createResource({
    url: 'frappe.client.get_value',
    makeParams() {
        return {
            doctype: 'User',
            filters: { name: $user.data?.name },
            fieldname: 'language'
        };
    },
    onSuccess(data) {
        if (data && data.language) {
            currentLanguage.value = data.language;
        }
    }
});
// Update language using frappe.call instead of createResource
const selectLanguage = async (languageCode) => {
    if (!canChangeLanguage.value) {
        toast.error(__('You do not have permission to change language settings'));
        return;
    }
    if (languageCode === currentLanguage.value)
        return;
    isUpdatingLanguage.value = true;
    try {
        // Use frappe.call with POST method to update user language with proper CSRF handling
        const result = await window.frappe.call({
            method: 'lms.lms.api.update_user_language',
            type: 'POST',
            args: {
                language: languageCode
            }
        });
        currentLanguage.value = languageCode;
        toast.success(__('Language updated successfully. Reloading...'));
        // Reload after 1 second to apply language changes
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    catch (error) {
        isUpdatingLanguage.value = false;
        console.error('Language update error:', error);
        // Show user-friendly error message
        const errorMsg = error?.message || error?._server_messages || __('Failed to update language. Please try refreshing the page.');
        toast.error(errorMsg);
    }
};
// Load current language on mount
onMounted(() => {
    if (canChangeLanguage.value) {
        getUserLanguage.fetch();
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-2xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Language Preference'));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-2 text-sm text-ink-gray-7" },
});
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
(__VLS_ctx.__('Select your preferred language for the interface'));
if (!__VLS_ctx.canChangeLanguage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-lg bg-amber-50 p-4 border border-amber-200" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-start gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.AlertCircle} */
    AlertCircle;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "size-5 text-amber-600 shrink-0 mt-0.5" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "size-5 text-amber-600 shrink-0 mt-0.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-amber-800" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "font-semibold mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.__('Permission Required'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.__('Only administrators, moderators, and teachers can change language settings.'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-lg bg-blue-50 p-4 border border-blue-200" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blue-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-start gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Info} */
    Info;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ class: "size-5 text-blue-600 shrink-0 mt-0.5" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ class: "size-5 text-blue-600 shrink-0 mt-0.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-blue-800" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.__('The page will automatically reload after changing the language to apply the changes.'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-4 sm:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    for (const [lang] of __VLS_vFor((__VLS_ctx.languages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.canChangeLanguage))
                        return;
                    __VLS_ctx.selectLanguage(lang.code);
                    // @ts-ignore
                    [__, __, __, __, __, canChangeLanguage, languages, selectLanguage,];
                } },
            key: (lang.code),
            ...{ class: "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200" },
            ...{ class: ({
                    'border-blue-500 bg-blue-50 shadow-md': __VLS_ctx.currentLanguage === lang.code,
                    'border-surface-gray-3 bg-surface-white hover:border-blue-300 hover:shadow-sm': __VLS_ctx.currentLanguage !== lang.code
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-surface-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-blue-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-6" },
        });
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-5xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-5xl']} */ ;
        (lang.flag);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-lg font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (lang.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (lang.native);
        if (__VLS_ctx.currentLanguage === lang.code) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex h-8 w-8 items-center justify-center rounded-full bg-blue-500" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
            let __VLS_10;
            /** @ts-ignore @type { | typeof __VLS_components.Check} */
            Check;
            // @ts-ignore
            const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                ...{ class: "size-5 text-white stroke-[3]" },
            }));
            const __VLS_12 = __VLS_11({
                ...{ class: "size-5 text-white stroke-[3]" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_11));
            /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-[3]']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-gray-3 opacity-0 group-hover:opacity-100 transition-opacity" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-surface-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (__VLS_ctx.__('Select'));
        }
        if (__VLS_ctx.currentLanguage === lang.code) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
            /** @type {__VLS_StyleScopedClasses['from-blue-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['to-blue-600']} */ ;
        }
        // @ts-ignore
        [__, currentLanguage, currentLanguage, currentLanguage, currentLanguage,];
    }
    if (__VLS_ctx.isUpdatingLanguage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3 rounded-lg bg-surface-gray-1 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" },
        });
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t-transparent']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('Updating language preference...'));
    }
    else if (__VLS_ctx.currentLanguage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 text-sm text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.Globe} */
        Globe;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            ...{ class: "size-4" },
        }));
        const __VLS_17 = __VLS_16({
            ...{ class: "size-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Current language:'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.languages.find(l => l.code === __VLS_ctx.currentLanguage)?.name);
    }
}
// @ts-ignore
[__, __, languages, currentLanguage, currentLanguage, isUpdatingLanguage,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
