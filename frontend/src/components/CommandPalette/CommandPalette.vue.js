/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, debounce, Dialog } from 'frappe-ui';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, Briefcase, CornerDownLeft, FileSearch, MoveUp, MoveDown, Search, Users, } from 'lucide-vue-next';
import CommandPaletteGroup from './CommandPaletteGroup.vue';
const show = defineModel({ required: true, default: false });
const router = useRouter();
const query = ref('');
const searchResults = ref([]);
const search = createResource({
    url: 'lms.command_palette.search_sqlite',
    makeParams: () => ({
        query: query.value,
    }),
    onSuccess() {
        generateSearchResults();
    },
});
const debouncedSearch = debounce(() => {
    if (query.value.length > 2) {
        search.reload();
    }
}, 500);
const onInput = () => {
    debouncedSearch();
};
const generateSearchResults = () => {
    search.data?.forEach((type) => {
        let result = { title: '', items: [] };
        result.title = type.title;
        type.items.forEach((item) => {
            let paramName = item.doctype === 'LMS Course' ? 'courseName' : 'batchName';
            item.route = {
                name: item.doctype === 'LMS Course' ? 'CourseDetail' : 'BatchDetail',
                params: {
                    [paramName]: item.name,
                },
            };
            item.isActive = false;
        });
        result.items = type.items;
        searchResults.value.push(result);
    });
};
const appendSearchPage = () => {
    let searchPage = {
        title: '',
        items: [],
    };
    searchPage.title = __('Jump to');
    searchPage.items = [
        {
            title: __('Search for ') + `"${query.value}"`,
            route: {
                name: 'Search',
                query: {
                    q: query.value,
                },
            },
            icon: FileSearch,
            isActive: true,
        },
    ];
    searchResults.value = [searchPage];
};
watch(query, () => {
    appendSearchPage();
}, { immediate: true });
watch(show, () => {
    if (!show.value) {
        query.value = '';
        searchResults.value = [];
    }
});
onMounted(() => {
    addKeyboardShortcuts();
});
const addKeyboardShortcuts = () => {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && show.value) {
            e.preventDefault();
            shortcutForArrowKey(-1);
        }
        else if (e.key === 'ArrowDown' && show.value) {
            shortcutForArrowKey(1);
        }
        else if (e.key === 'Enter' && show.value) {
            shortcutForEnter();
        }
        else if (e.key === 'Escape' && show.value) {
            show.value = false;
        }
    });
};
const shortcutForArrowKey = (direction) => {
    let currentList = query.value.length
        ? searchResults.value
        : jumpToOptions.value;
    let allItems = currentList.flatMap((result) => result.items);
    let indexOfActive = allItems.findIndex((option) => option.isActive);
    let newIndex = indexOfActive + direction;
    if (newIndex < 0)
        newIndex = allItems.length - 1;
    if (newIndex >= allItems.length)
        newIndex = 0;
    allItems[indexOfActive].isActive = false;
    allItems[newIndex].isActive = true;
    nextTick(scrollActiveItemIntoView);
};
const scrollActiveItemIntoView = () => {
    const activeItem = document.querySelector('.hover\\:bg-surface-gray-2.bg-surface-gray-2');
    if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
    }
};
const shortcutForEnter = () => {
    let currentList = query.value.length
        ? searchResults.value
        : jumpToOptions.value;
    let allItems = currentList.flatMap((result) => result.items);
    let activeOption = allItems.find((option) => option.isActive);
    if (activeOption) {
        navigateTo(activeOption.route);
    }
};
const navigateTo = (route) => {
    show.value = false;
    query.value = '';
    router.replace({ name: route.name, params: route.params, query: route.query });
};
const jumpToOptions = ref([
    {
        title: __('Jump to'),
        items: [
            {
                title: __('Advanced Search'),
                icon: Search,
                route: {
                    name: 'Search',
                },
                isActive: true,
            },
            {
                title: __('Courses'),
                icon: BookOpen,
                route: {
                    name: 'Courses',
                },
                isActive: false,
            },
            {
                title: __('Batches'),
                icon: Users,
                route: {
                    name: 'Batches',
                },
                isActive: false,
            },
            {
                title: __('Jobs'),
                icon: Briefcase,
                route: {
                    name: 'Jobs',
                },
                isActive: false,
            },
        ],
    },
]);
const __VLS_defaultModels = {
    'modelValue': false,
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
    options: ({ size: '2xl' }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({ size: '2xl' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 pl-4.5 border-b" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pl-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ class: "size-4 text-ink-gray-4" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "size-4 text-ink-gray-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onInput: (__VLS_ctx.onInput) },
        ref: "inputRef",
        type: "text",
        placeholder: "Search",
        ...{ class: "w-full border-none bg-transparent py-3 !pl-2 pr-4.5 text-base text-ink-gray-7 placeholder-ink-gray-4 focus:ring-0" },
        value: (__VLS_ctx.query),
        autocomplete: "off",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['!pl-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder-ink-gray-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-h-96 overflow-auto mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['max-h-96']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    if (__VLS_ctx.query.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-5 space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        const __VLS_13 = CommandPaletteGroup;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            ...{ 'onNavigateTo': {} },
            list: (__VLS_ctx.searchResults),
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onNavigateTo': {} },
            list: (__VLS_ctx.searchResults),
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = ({ navigateTo: {} },
            { onNavigateTo: (__VLS_ctx.navigateTo) });
        var __VLS_16;
        var __VLS_17;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-5 space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        const __VLS_20 = CommandPaletteGroup;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            ...{ 'onNavigateTo': {} },
            list: (__VLS_ctx.jumpToOptions),
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onNavigateTo': {} },
            list: (__VLS_ctx.jumpToOptions),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_25;
        const __VLS_26 = ({ navigateTo: {} },
            { onNavigateTo: (__VLS_ctx.navigateTo) });
        var __VLS_23;
        var __VLS_24;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-5 w-full border-t py-2 text-sm text-ink-gray-7 px-4.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.MoveUp} */
    MoveUp;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        ...{ class: "size-5 stroke-1.5 bg-surface-gray-2 p-1 rounded-sm" },
    }));
    const __VLS_29 = __VLS_28({
        ...{ class: "size-5 stroke-1.5 bg-surface-gray-2 p-1 rounded-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.MoveDown} */
    MoveDown;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        ...{ class: "size-5 stroke-1.5 bg-surface-gray-2 p-1 rounded-sm" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "size-5 stroke-1.5 bg-surface-gray-2 p-1 rounded-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('to navigate'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.CornerDownLeft} */
    CornerDownLeft;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        ...{ class: "size-5 stroke-1.5 bg-surface-gray-2 p-1 rounded-sm" },
    }));
    const __VLS_39 = __VLS_38({
        ...{ class: "size-5 stroke-1.5 bg-surface-gray-2 p-1 rounded-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('to select'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bg-surface-gray-2 p-1 rounded-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('to close'));
    // @ts-ignore
    [show, onInput, query, query, searchResults, navigateTo, navigateTo, jumpToOptions, __, __, __,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
