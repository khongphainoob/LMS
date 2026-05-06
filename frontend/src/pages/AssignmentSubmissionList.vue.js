/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Breadcrumbs, createListResource, FormControl, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, usePageMeta, } from 'frappe-ui';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Pencil } from 'lucide-vue-next';
import { sessionStore } from '../stores/session';
import Link from '@/components/Controls/Link.vue';
const user = inject('$user');
const dayjs = inject('$dayjs');
const { brand } = sessionStore();
const router = useRouter();
const assignmentID = ref('');
const member = ref('');
const status = ref('');
onMounted(() => {
    if (!user.data?.is_instructor && !user.data?.is_moderator) {
        router.push({ name: 'Courses' });
    }
    assignmentID.value = router.currentRoute.value.query.assignmentID;
    member.value = router.currentRoute.value.query.member;
    status.value = router.currentRoute.value.query.status;
    reloadSubmissions();
});
const getAssignmentFilters = () => {
    let filters = {};
    if (assignmentID.value) {
        filters.assignment = assignmentID.value;
    }
    if (member.value) {
        filters.member = member.value;
    }
    if (status.value) {
        filters.status = status.value;
    }
    return filters;
};
const submissions = createListResource({
    doctype: 'LMS Assignment Submission',
    fields: [
        'name',
        'assignment',
        'assignment_title',
        'member_name',
        'creation',
        'status',
    ],
    orderBy: 'creation desc',
    transform(data) {
        return data.map((row) => {
            return {
                ...row,
                creation: dayjs(row.creation).fromNow(),
            };
        });
    },
});
watch([assignmentID, member, status], () => {
    router.push({
        query: {
            assignmentID: assignmentID.value,
            member: member.value,
            status: status.value,
        },
    });
    reloadSubmissions();
});
const reloadSubmissions = () => {
    submissions.update({
        filters: getAssignmentFilters(),
    });
    submissions.reload();
};
const submissionColumns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member_name',
            width: 1,
        },
        {
            label: __('Assignment'),
            key: 'assignment_title',
            width: 2,
        },
        {
            label: __('Submitted'),
            key: 'creation',
            width: 1,
            align: 'left',
        },
        {
            label: __('Status'),
            key: 'status',
            width: 1,
            align: 'center',
        },
    ];
});
const statusOptions = computed(() => {
    return [
        { label: '', value: '' },
        { label: __('Pass'), value: 'Pass' },
        { label: __('Fail'), value: 'Fail' },
        { label: __('Not Graded'), value: 'Not Graded' },
    ];
});
const getStatusTheme = (status) => {
    if (status === 'Pass') {
        return 'green';
    }
    else if (status === 'Not Graded') {
        return 'blue';
    }
    else {
        return 'red';
    }
};
const breadcrumbs = computed(() => {
    return [
        {
            label: __('Assignment Submissions'),
        },
    ];
});
usePageMeta(() => {
    return {
        title: __('Assignment Submissions'),
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
    ...{ class: "sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
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
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "md:w-3/4 md:mx-auto py-5 mx-5" },
});
/** @type {__VLS_StyleScopedClasses['md:w-3/4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-3 gap-5 mb-5" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
const __VLS_5 = Link;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    doctype: "LMS Assignment",
    modelValue: (__VLS_ctx.assignmentID),
    placeholder: (__VLS_ctx.__('Assignment')),
}));
const __VLS_7 = __VLS_6({
    doctype: "LMS Assignment",
    modelValue: (__VLS_ctx.assignmentID),
    placeholder: (__VLS_ctx.__('Assignment')),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = Link;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    doctype: "User",
    modelValue: (__VLS_ctx.member),
    placeholder: (__VLS_ctx.__('Member')),
}));
const __VLS_12 = __VLS_11({
    doctype: "User",
    modelValue: (__VLS_ctx.member),
    placeholder: (__VLS_ctx.__('Member')),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.status),
    type: "select",
    options: (__VLS_ctx.statusOptions),
    placeholder: (__VLS_ctx.__('Status')),
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.status),
    type: "select",
    options: (__VLS_ctx.statusOptions),
    placeholder: (__VLS_ctx.__('Status')),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
if (__VLS_ctx.submissions.loading || __VLS_ctx.submissions.data?.length) {
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        columns: (__VLS_ctx.submissionColumns),
        rows: (__VLS_ctx.submissions.data),
        rowKey: "name",
    }));
    const __VLS_22 = __VLS_21({
        columns: (__VLS_ctx.submissionColumns),
        rows: (__VLS_ctx.submissions.data),
        rowKey: "name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const { default: __VLS_25 } = __VLS_23.slots;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_28 = __VLS_27({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_31 } = __VLS_29.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.submissionColumns))) {
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            item: (item),
        }));
        const __VLS_34 = __VLS_33({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        // @ts-ignore
        [breadcrumbs, assignmentID, __, __, __, member, status, statusOptions, submissions, submissions, submissions, submissionColumns, submissionColumns,];
    }
    // @ts-ignore
    [];
    var __VLS_29;
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.submissions.data))) {
        let __VLS_43;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
            to: ({
                name: 'AssignmentSubmission',
                params: {
                    assignmentID: row.assignment,
                    submissionName: row.name,
                },
            }),
        }));
        const __VLS_45 = __VLS_44({
            to: ({
                name: 'AssignmentSubmission',
                params: {
                    assignmentID: row.assignment,
                    submissionName: row.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        const { default: __VLS_48 } = __VLS_46.slots;
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            row: (row),
        }));
        const __VLS_51 = __VLS_50({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        const { default: __VLS_54 } = __VLS_52.slots;
        {
            const { default: __VLS_55 } = __VLS_52.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_55);
            let __VLS_56;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_58 = __VLS_57({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            const { default: __VLS_61 } = __VLS_59.slots;
            if (column.key == 'status') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_62;
                /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                Badge;
                // @ts-ignore
                const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                    theme: (__VLS_ctx.getStatusTheme(row[column.key])),
                }));
                const __VLS_64 = __VLS_63({
                    theme: (__VLS_ctx.getStatusTheme(row[column.key])),
                }, ...__VLS_functionalComponentArgsRest(__VLS_63));
                const { default: __VLS_67 } = __VLS_65.slots;
                (row[column.key]);
                // @ts-ignore
                [submissions, getStatusTheme,];
                var __VLS_65;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            // @ts-ignore
            [];
            var __VLS_59;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_52;
        // @ts-ignore
        [];
        var __VLS_46;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_40;
    // @ts-ignore
    [];
    var __VLS_23;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center p-5 text-ink-gray-5 mt-52 w-3/4 md:w-1/2 mx-auto space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-52']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-3/4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    let __VLS_68;
    /** @ts-ignore @type { | typeof __VLS_components.Pencil} */
    Pencil;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        ...{ class: "size-8 mx-auto stroke-1 text-ink-gray-4" },
    }));
    const __VLS_70 = __VLS_69({
        ...{ class: "size-8 mx-auto stroke-1 text-ink-gray-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xl font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.__('No submissions'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "leading-5" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    (__VLS_ctx.__('There are no submissions for this assignment.'));
}
// @ts-ignore
[__, __,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
