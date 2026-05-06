/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Breadcrumbs, createResource, debounce, TextInput, Tooltip, usePageMeta, } from 'frappe-ui';
import { inject, onMounted, ref, watch } from 'vue';
import { Search, X } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { useRouter, useRoute } from 'vue-router';
const query = ref('');
const searchInput = ref(null);
const searchResults = ref([]);
const { brand } = sessionStore();
const router = useRouter();
const route = useRoute();
const queryChanged = ref(false);
const dayjs = inject('$dayjs');
onMounted(() => {
    if (router.currentRoute.value.query.q) {
        query.value = router.currentRoute.value.query.q;
        submit();
    }
});
const updateQuery = (value) => {
    query.value = value;
    router.replace({ query: value ? { q: value } : {} });
};
const submit = debounce(() => {
    if (query.value.length > 2) {
        search.reload();
    }
}, 500);
const search = createResource({
    url: 'lms.command_palette.search_sqlite',
    makeParams: () => ({
        query: query.value,
    }),
    onSuccess() {
        generateSearchResults();
    },
});
const generateSearchResults = () => {
    searchResults.value = [];
    if (search.data) {
        queryChanged.value = false;
        search.data.forEach((group) => {
            group.items.forEach((item) => {
                searchResults.value.push(item);
            });
        });
        sortResults();
    }
};
const sortResults = () => {
    searchResults.value.sort((a, b) => {
        const dateA = new Date(a.published_on || a.start_date || a.creation || a.modified).getTime();
        const dateB = new Date(b.published_on || b.start_date || b.creation || b.modified).getTime();
        return dateB - dateA;
    });
};
const navigate = (result) => {
    if (result.doctype == 'LMS Course') {
        router.push({
            name: 'CourseDetail',
            params: {
                courseName: result.name,
            },
        });
    }
    else if (result.doctype == 'LMS Batch') {
        router.push({
            name: 'BatchDetail',
            params: {
                batchName: result.name,
            },
        });
    }
    else if (result.doctype == 'Job Opportunity') {
        router.push({
            name: 'JobDetail',
            params: {
                job: result.name,
            },
        });
    }
};
watch(query, () => {
    if (query.value && query.value != search.params?.query) {
        queryChanged.value = true;
    }
    else if (!query.value) {
        queryChanged.value = false;
        searchResults.value = [];
    }
});
watch(() => route.query.q, (newQ) => {
    if (newQ && newQ !== query.value) {
        query.value = newQ;
        submit();
    }
});
const getDocTypeTitle = (doctype) => {
    if (doctype === 'LMS Course') {
        return __('Course');
    }
    else if (doctype === 'LMS Batch') {
        return __('Batch');
    }
    else if (doctype === 'Job Opportunity') {
        return __('Job');
    }
    else {
        return doctype;
    }
};
const clearSearch = () => {
    query.value = '';
    updateQuery('');
};
usePageMeta(() => {
    return {
        title: __('Search'),
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
Breadcrumbs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    items: ([{ label: __VLS_ctx.__('Search') }]),
}));
const __VLS_2 = __VLS_1({
    items: ([{ label: __VLS_ctx.__('Search') }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-4/6 mx-auto py-5" },
});
/** @type {__VLS_StyleScopedClasses['w-4/6']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-2.5" },
});
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.TextInput | typeof __VLS_components.TextInput} */
TextInput;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onKeydown': {} },
    ref: "searchInput",
    ...{ class: "flex-1" },
    placeholder: (__VLS_ctx.__('Search for a keyword or phrase and press enter')),
    autocomplete: "off",
    modelValue: (__VLS_ctx.query),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onKeydown': {} },
    ref: "searchInput",
    ...{ class: "flex-1" },
    placeholder: (__VLS_ctx.__('Search for a keyword or phrase and press enter')),
    autocomplete: "off",
    modelValue: (__VLS_ctx.query),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': (__VLS_ctx.updateQuery) });
const __VLS_12 = ({ keydown: {} },
    { onKeydown: (() => __VLS_ctx.submit()) });
var __VLS_13 = {};
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
const { default: __VLS_15 } = __VLS_8.slots;
{
    const { prefix: __VLS_16 } = __VLS_8.slots;
    let __VLS_17;
    /** @ts-ignore @type { | typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        ...{ class: "w-4 text-ink-gray-5" },
    }));
    const __VLS_19 = __VLS_18({
        ...{ class: "w-4 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    // @ts-ignore
    [__, __, query, updateQuery, submit,];
}
{
    const { suffix: __VLS_22 } = __VLS_8.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    if (__VLS_ctx.query) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.clearSearch) },
            ...{ class: "p-1 size-6 grid place-content-center focus:outline-none focus:ring focus:ring-outline-gray-3 rounded" },
        });
        /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['place-content-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring-outline-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.X} */
        X;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            ...{ class: "w-4 text-ink-gray-7" },
        }));
        const __VLS_25 = __VLS_24({
            ...{ class: "w-4 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    }
    // @ts-ignore
    [query, clearSearch,];
}
// @ts-ignore
[];
var __VLS_8;
var __VLS_9;
if (__VLS_ctx.query && __VLS_ctx.searchResults.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-5 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.searchResults.length);
    (__VLS_ctx.searchResults.length === 1 ? __VLS_ctx.__('match') : __VLS_ctx.__('matches'));
}
else if (__VLS_ctx.queryChanged) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-5 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.__('Press enter to search'));
}
else if (__VLS_ctx.query && !__VLS_ctx.searchResults.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-5 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.__('No results found'));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-5" },
});
/** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
if (__VLS_ctx.searchResults.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    for (const [result, index] of __VLS_vFor((__VLS_ctx.searchResults))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.searchResults.length))
                        return;
                    __VLS_ctx.navigate(result);
                    // @ts-ignore
                    [__, __, __, __, query, query, searchResults, searchResults, searchResults, searchResults, searchResults, searchResults, queryChanged, navigate,];
                } },
            ...{ class: "rounded-md cursor-pointer hover:bg-surface-gray-2 px-2" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex space-x-2 py-3" },
            ...{ class: ({
                    'border-b': index !== __VLS_ctx.searchResults.length - 1,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            text: (result.author_info.full_name),
        }));
        const __VLS_30 = __VLS_29({
            text: (result.author_info.full_name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        const { default: __VLS_33 } = __VLS_31.slots;
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
        Avatar;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            label: (result.author_info.full_name),
            image: (result.author_info.user_image),
            size: "md",
        }));
        const __VLS_36 = __VLS_35({
            label: (result.author_info.full_name),
            image: (result.author_info.user_image),
            size: "md",
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        // @ts-ignore
        [searchResults,];
        var __VLS_31;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-medium text-ink-gray-9" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (result.title) }, null, null);
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-ink-gray-5 ml-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        (__VLS_ctx.getDocTypeTitle(result.doctype));
        if (result.published_on ||
            result.start_date ||
            result.creation ||
            result.modified) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ml-auto text-sm text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            (__VLS_ctx.dayjs(result.published_on ||
                result.start_date ||
                result.creation ||
                result.modified).format('DD MMM YYYY'));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-5 text-ink-gray-7" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (result.content) }, null, null);
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        // @ts-ignore
        [getDocTypeTitle, dayjs,];
    }
}
// @ts-ignore
var __VLS_14 = __VLS_13;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
