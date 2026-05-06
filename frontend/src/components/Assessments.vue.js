/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ListView, ListRow, ListRows, ListHeader, ListHeaderItem, ListRowItem, ListSelectBanner, createResource, Button, Badge, } from 'frappe-ui';
import { inject, ref } from 'vue';
import AssessmentModal from '@/components/Modals/AssessmentModal.vue';
import { Plus, Trash2 } from 'lucide-vue-next';
const user = inject('$user');
const showModal = ref(false);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    batch: {
        type: String,
        required: true,
    },
    rows: {
        type: Array,
    },
    columns: {
        type: Array,
    },
    options: {
        type: Object,
        default: () => ({
            selectable: true,
            totalCount: 0,
            rowCount: 0,
        }),
    },
});
const assessments = createResource({
    url: 'lms.lms.utils.get_assessments',
    params: {
        batch: props.batch,
    },
    auto: true,
});
const deleteAssessments = createResource({
    url: 'lms.lms.api.delete_documents',
    makeParams(values) {
        return {
            doctype: 'LMS Assessment',
            documents: values.assessments,
        };
    },
});
const removeAssessments = (selections, unselectAll) => {
    deleteAssessments.submit({ assessments: Array.from(selections) }, {
        onSuccess(data) {
            assessments.reload();
            unselectAll();
        },
    });
};
const getRowRoute = (row) => {
    if (row.assessment_type == 'LMS Assignment') {
        if (row.submission) {
            return {
                name: 'AssignmentSubmission',
                params: {
                    assignmentID: row.assessment_name,
                    submissionName: row.submission.name,
                },
            };
        }
        else {
            return {
                name: 'AssignmentSubmission',
                params: {
                    assignmentID: row.assessment_name,
                    submissionName: 'new',
                },
            };
        }
    }
    else if (row.assessment_type == 'LMS Programming Exercise') {
        if (row.submission) {
            return {
                name: 'ProgrammingExerciseSubmission',
                params: {
                    exerciseID: row.assessment_name,
                    submissionID: row.submission.name,
                },
            };
        }
        else {
            return {
                name: 'ProgrammingExerciseSubmission',
                params: {
                    exerciseID: row.assessment_name,
                    submissionID: 'new',
                },
            };
        }
    }
    else {
        return {
            name: 'QuizPage',
            params: {
                quizID: row.assessment_name,
            },
        };
    }
};
const canAddAssessments = () => {
    if (readOnlyMode)
        return false;
    return user.data?.is_moderator || user.data?.is_evaluator;
};
const getAssessmentColumns = () => {
    let columns = [
        {
            label: __('Assessment'),
            key: 'title',
            width: '25rem',
        },
        {
            label: __('Type'),
            key: 'assessment_type',
            width: '15rem',
        },
    ];
    if (!user.data?.is_moderator) {
        columns.push({
            label: __('Status/Percentage'),
            key: 'status',
            align: 'left',
            width: '10rem',
        });
    }
    return columns;
};
const getStatusTheme = (status) => {
    if (status === 'Pass' || status === 'Passed') {
        return 'green';
    }
    else if (status === 'Not Graded') {
        return 'orange';
    }
    else {
        return 'red';
    }
};
const getAssessmentTypeLabel = (type) => {
    if (type == 'LMS Assignment') {
        return __('Assignment');
    }
    else if (type == 'LMS Quiz') {
        return __('Quiz');
    }
    else if (type == 'LMS Programming Exercise') {
        return __('Programming Exercise');
    }
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
    ...{ class: "text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Assessments'));
if (__VLS_ctx.canAddAssessments()) {
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
                if (!(__VLS_ctx.canAddAssessments()))
                    return;
                __VLS_ctx.showModal = true;
                // @ts-ignore
                [__, canAddAssessments, showModal,];
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
if (__VLS_ctx.assessments.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        columns: (__VLS_ctx.getAssessmentColumns()),
        rows: (__VLS_ctx.assessments.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            getRowRoute: (row) => __VLS_ctx.getRowRoute(row),
            selectable: __VLS_ctx.user.data?.is_student ? false : true,
        }),
    }));
    const __VLS_16 = __VLS_15({
        columns: (__VLS_ctx.getAssessmentColumns()),
        rows: (__VLS_ctx.assessments.data),
        rowKey: "name",
        options: ({
            showTooltip: false,
            getRowRoute: (row) => __VLS_ctx.getRowRoute(row),
            selectable: __VLS_ctx.user.data?.is_student ? false : true,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
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
    for (const [item] of __VLS_vFor((__VLS_ctx.getAssessmentColumns()))) {
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            item: (item),
        }));
        const __VLS_28 = __VLS_27({
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const { default: __VLS_31 } = __VLS_29.slots;
        {
            const { prefix: __VLS_32 } = __VLS_29.slots;
            const [{ item }] = __VLS_vSlot(__VLS_32);
            if (item.icon) {
                const __VLS_33 = (item.icon);
                // @ts-ignore
                const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
                    ...{ class: "h-4 w-4 stroke-1.5 ml-4" },
                }));
                const __VLS_35 = __VLS_34({
                    ...{ class: "h-4 w-4 stroke-1.5 ml-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_34));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
            }
            // @ts-ignore
            [assessments, assessments, getAssessmentColumns, getAssessmentColumns, getRowRoute, user,];
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
    for (const [row] of __VLS_vFor((__VLS_ctx.assessments.data))) {
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            row: (row),
        }));
        const __VLS_46 = __VLS_45({
            row: (row),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        const { default: __VLS_49 } = __VLS_47.slots;
        {
            const { default: __VLS_50 } = __VLS_47.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_50);
            let __VLS_51;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                item: (row[column.key]),
                align: (column.align),
            }));
            const __VLS_53 = __VLS_52({
                item: (row[column.key]),
                align: (column.align),
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            const { default: __VLS_56 } = __VLS_54.slots;
            if (column.key == 'assessment_type') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (__VLS_ctx.getAssessmentTypeLabel(row[column.key]));
            }
            else if (column.key == 'title') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            else if (isNaN(row[column.key])) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_57;
                /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                Badge;
                // @ts-ignore
                const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
                    theme: (__VLS_ctx.getStatusTheme(row[column.key])),
                }));
                const __VLS_59 = __VLS_58({
                    theme: (__VLS_ctx.getStatusTheme(row[column.key])),
                }, ...__VLS_functionalComponentArgsRest(__VLS_58));
                const { default: __VLS_62 } = __VLS_60.slots;
                (row[column.key]);
                // @ts-ignore
                [assessments, getAssessmentTypeLabel, getStatusTheme,];
                var __VLS_60;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (row[column.key]);
            }
            // @ts-ignore
            [];
            var __VLS_54;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_47;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_41;
    let __VLS_63;
    /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
    ListSelectBanner;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({}));
    const __VLS_65 = __VLS_64({}, ...__VLS_functionalComponentArgsRest(__VLS_64));
    const { default: __VLS_68 } = __VLS_66.slots;
    {
        const { actions: __VLS_69 } = __VLS_66.slots;
        const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_69);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_70;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_72 = __VLS_71({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        let __VLS_75;
        const __VLS_76 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.assessments.data?.length))
                        return;
                    __VLS_ctx.removeAssessments(selections, unselectAll);
                    // @ts-ignore
                    [removeAssessments,];
                } });
        const { default: __VLS_77 } = __VLS_73.slots;
        let __VLS_78;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_80 = __VLS_79({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
        var __VLS_73;
        var __VLS_74;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_66;
    // @ts-ignore
    [];
    var __VLS_17;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm italic text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('No Assessments'));
}
const __VLS_83 = AssessmentModal;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    modelValue: (__VLS_ctx.showModal),
    assessments: (__VLS_ctx.assessments),
    batch: (props.batch),
}));
const __VLS_85 = __VLS_84({
    modelValue: (__VLS_ctx.showModal),
    assessments: (__VLS_ctx.assessments),
    batch: (props.batch),
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
// @ts-ignore
[__, showModal, assessments,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batch: {
            type: String,
            required: true,
        },
        rows: {
            type: Array,
        },
        columns: {
            type: Array,
        },
        options: {
            type: Object,
            default: () => ({
                selectable: true,
                totalCount: 0,
                rowCount: 0,
            }),
        },
    },
});
export default {};
