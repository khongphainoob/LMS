/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { usePageMeta } from 'frappe-ui';
import { DataImport } from 'frappe-ui/frappe';
import { sessionStore } from '../stores/session';
import { useRoute, useRouter } from 'vue-router';
import { inject, onMounted } from 'vue';
const { brand } = sessionStore();
const route = useRoute();
const router = useRouter();
const user = inject('$user');
onMounted(() => {
    if (!user.data?.is_moderator) {
        router.push({
            name: 'Courses',
        });
    }
});
const doctypeMap = {
    'LMS Course': {
        title: __('Courses'),
        listRoute: '/courses',
        pageRoute: `/courses/docname`,
    },
    'LMS Batch': {
        title: __('Batches'),
        listRoute: '/batches',
    },
    'LMS Category': {
        title: __('Categories'),
        listRoute: '/lms',
    },
};
usePageMeta(() => {
    return {
        title: __('Data Import'),
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.DataImport} */
DataImport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    doctype: (__VLS_ctx.route.params.doctype),
    importName: (__VLS_ctx.route.params.importName),
    doctypeMap: (__VLS_ctx.doctypeMap),
}));
const __VLS_2 = __VLS_1({
    doctype: (__VLS_ctx.route.params.doctype),
    importName: (__VLS_ctx.route.params.importName),
    doctypeMap: (__VLS_ctx.doctypeMap),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
var __VLS_3;
// @ts-ignore
[route, route, doctypeMap,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
