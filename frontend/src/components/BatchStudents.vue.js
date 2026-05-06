/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, createListResource, createResource, FeatherIcon, ListHeader, ListHeaderItem, ListSelectBanner, ListRow, ListRows, ListView, ListRowItem, toast, } from 'frappe-ui';
import { Plus, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';
import StudentModal from '@/components/Modals/StudentModal.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import BatchStudentProgress from '@/components/Modals/BatchStudentProgress.vue';
const showStudentModal = ref(false);
const showStudentProgressModal = ref(false);
const selectedStudent = ref(null);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    batch: {
        type: Object,
        default: null,
    },
});
const studentCount = createResource({
    url: 'frappe.client.get_count',
    cache: ['batch_student_count', props.batch?.data?.name],
    params: {
        doctype: 'LMS Batch Enrollment',
        filters: { batch: props.batch?.data?.name },
    },
    auto: true,
});
const students = createListResource({
    doctype: 'LMS Batch Enrollment',
    url: 'lms.lms.utils.get_batch_students',
    cache: ['batch_students', props.batch?.data?.name],
    pageLength: 50,
    filters: {
        batch: props.batch?.data?.name,
    },
    auto: true,
});
const studentColumns = [
    {
        label: __('Full Name'),
        key: 'full_name',
        width: '25rem',
        icon: 'user',
    },
    {
        label: __('Progress'),
        key: 'progress',
        width: '15rem',
        icon: 'activity',
    },
    {
        label: __('Last Active'),
        key: 'last_active',
        width: '10rem',
        align: 'center',
        icon: 'clock',
    },
];
const openStudentModal = () => {
    showStudentModal.value = true;
};
const openStudentProgressModal = (row) => {
    showStudentProgressModal.value = true;
    selectedStudent.value = row;
};
const deleteStudents = createResource({
    url: 'lms.lms.api.delete_documents',
    makeParams(values) {
        return {
            doctype: 'LMS Batch Enrollment',
            documents: values.students,
        };
    },
});
const removeStudents = (selections, unselectAll) => {
    deleteStudents.submit({
        students: Array.from(selections),
    }, {
        onSuccess(data) {
            students.reload();
            studentCount.reload();
            props.batch.reload();
            toast.success(__('Students deleted successfully'));
            unselectAll();
        },
    });
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-ink-gray-9 font-medium" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.studentCount.data ?? 0);
(__VLS_ctx.__('Students'));
if (!__VLS_ctx.readOnlyMode) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.openStudentModal();
                // @ts-ignore
                [studentCount, __, readOnlyMode, openStudentModal,];
            } });
    const { default: __VLS_7 } = __VLS_3.slots;
    {
        const { prefix: __VLS_8 } = __VLS_3.slots;
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ class: "h-4 w-4" },
        }));
        const __VLS_11 = __VLS_10({
            ...{ class: "h-4 w-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Add'));
    // @ts-ignore
    [__,];
    var __VLS_3;
    var __VLS_4;
}
if (__VLS_ctx.students.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        ...{ class: "max-h-[75vh]" },
        columns: (__VLS_ctx.studentColumns),
        rows: (__VLS_ctx.students.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
        }),
    }));
    const __VLS_16 = __VLS_15({
        ...{ class: "max-h-[75vh]" },
        columns: (__VLS_ctx.studentColumns),
        rows: (__VLS_ctx.students.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    /** @type {__VLS_StyleScopedClasses['max-h-[75vh]']} */ ;
    const { default: __VLS_19 } = __VLS_17.slots;
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_25 } = __VLS_23.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.studentColumns))) {
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            item: (item),
            title: (item.label),
        }));
        const __VLS_28 = __VLS_27({
            item: (item),
            title: (item.label),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const { default: __VLS_31 } = __VLS_29.slots;
        {
            const { prefix: __VLS_32 } = __VLS_29.slots;
            const [{ item }] = __VLS_vSlot(__VLS_32);
            if (item.icon) {
                let __VLS_33;
                /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                FeatherIcon;
                // @ts-ignore
                const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }));
                const __VLS_35 = __VLS_34({
                    name: (item.icon),
                    ...{ class: "h-4 w-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_34));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            }
            // @ts-ignore
            [students, students, studentColumns, studentColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_29;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_23;
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({}));
    const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const { default: __VLS_43 } = __VLS_41.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.students.data))) {
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
            row: (row),
            ...{ class: "group cursor-pointer hover:bg-surface-gray-2 rounded" },
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            row: (row),
            ...{ class: "group cursor-pointer hover:bg-surface-gray-2 rounded" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_49;
        const __VLS_50 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.students.data?.length))
                        return;
                    __VLS_ctx.openStudentProgressModal(row);
                    // @ts-ignore
                    [students, openStudentProgressModal,];
                } });
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        const { default: __VLS_51 } = __VLS_47.slots;
        {
            const { default: __VLS_52 } = __VLS_47.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_52);
            let __VLS_53;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
                item: (row[column.key]),
                align: (column.align),
                ...{ class: "text-sm" },
            }));
            const __VLS_55 = __VLS_54({
                item: (row[column.key]),
                align: (column.align),
                ...{ class: "text-sm" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_54));
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            const { default: __VLS_58 } = __VLS_56.slots;
            {
                const { prefix: __VLS_59 } = __VLS_56.slots;
                if (column.key == 'full_name') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    let __VLS_60;
                    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                    Avatar;
                    // @ts-ignore
                    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
                        ...{ class: "flex items-center" },
                        image: (row['user_image']),
                        label: (item),
                        size: "sm",
                    }));
                    const __VLS_62 = __VLS_61({
                        ...{ class: "flex items-center" },
                        image: (row['user_image']),
                        label: (item),
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                }
                // @ts-ignore
                [];
            }
            if (column.key == 'progress') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-4 w-full" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                const __VLS_65 = ProgressBar;
                // @ts-ignore
                const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                    progress: (row[column.key]),
                    size: "sm",
                }));
                const __VLS_67 = __VLS_66({
                    progress: (row[column.key]),
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_66));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-xs" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                (row[column.key]);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            // @ts-ignore
            [];
            var __VLS_56;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_47;
        var __VLS_48;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_41;
    let __VLS_70;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
    const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const { default: __VLS_75 } = __VLS_73.slots;
    {
        const { actions: __VLS_76 } = __VLS_73.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_76);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_77;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_82;
        const __VLS_83 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.students.data?.length))
                        return;
                    __VLS_ctx.removeStudents(selections, unselectAll);
                    // @ts-ignore
                    [removeStudents,];
                } });
        const { default: __VLS_84 } = __VLS_80.slots;
        let __VLS_85;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_87 = __VLS_86({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_80;
        var __VLS_81;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_73;
    if (__VLS_ctx.students.hasNextPage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4 flex justify-center" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            ...{ 'onClick': {} },
        }));
        const __VLS_92 = __VLS_91({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_95;
        const __VLS_96 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.students.data?.length))
                        return;
                    if (!(__VLS_ctx.students.hasNextPage))
                        return;
                    __VLS_ctx.students.next();
                    // @ts-ignore
                    [students, students,];
                } });
        const { default: __VLS_97 } = __VLS_93.slots;
        (__VLS_ctx.__('Load More'));
        // @ts-ignore
        [__,];
        var __VLS_93;
        var __VLS_94;
    }
    // @ts-ignore
    [];
    var __VLS_17;
}
else if (!__VLS_ctx.students.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm italic text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('There are no students in this batch.'));
}
const __VLS_98 = StudentModal;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
    batch: (props.batch.data.name),
    modelValue: (__VLS_ctx.showStudentModal),
    reloadStudents: (__VLS_ctx.students),
    batchModal: (props.batch),
}));
const __VLS_100 = __VLS_99({
    batch: (props.batch.data.name),
    modelValue: (__VLS_ctx.showStudentModal),
    reloadStudents: (__VLS_ctx.students),
    batchModal: (props.batch),
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
const __VLS_103 = BatchStudentProgress;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    student: (__VLS_ctx.selectedStudent),
    modelValue: (__VLS_ctx.showStudentProgressModal),
}));
const __VLS_105 = __VLS_104({
    student: (__VLS_ctx.selectedStudent),
    modelValue: (__VLS_ctx.showStudentProgressModal),
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
// @ts-ignore
[__, students, students, showStudentModal, selectedStudent, showStudentProgressModal,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: Object,
            default: null,
        },
    },
});
export default {};
