/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, createListResource, Dialog, FormControl, ListSelectBanner, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, toast, } from 'frappe-ui';
import { computed, ref, watch, getCurrentInstance } from 'vue';
import { Plus, Trash2, TrendingUp } from 'lucide-vue-next';
import { escapeHTML, openSettings } from '@/utils';
import Link from '@/components/Controls/Link.vue';
import Draggable from 'vuedraggable';
import ProgramProgressSummary from '@/pages/Programs/ProgramProgressSummary.vue';
const show = defineModel();
const programs = defineModel('programs');
const showFormDialog = ref(false);
const currentForm = ref('course');
const course = ref('');
const member = ref('');
const showProgressDialog = ref(false);
const dirty = ref(false);
const app = getCurrentInstance();
const { $dialog } = app.appContext.config.globalProperties;
const props = withDefaults(defineProps(), {
    programName: 'new',
});
const program = ref({
    name: '',
    title: '',
    published: false,
    enforce_course_order: false,
    program_courses: [],
    program_members: [],
});
watch(() => props.programName, () => {
    setProgramData();
    fetchCourses();
    fetchMembers();
});
const setProgramData = () => {
    let isNew = true;
    programs.value?.data.forEach((p) => {
        if (p.name === props.programName) {
            isNew = false;
            program.value = { ...p };
        }
    });
    if (isNew) {
        program.value = {
            name: '',
            title: '',
            published: false,
            enforce_course_order: false,
            program_courses: [],
            program_members: [],
        };
    }
    dirty.value = false;
};
const programCourses = createListResource({
    doctype: 'LMS Program Course',
    fields: ['course', 'course_title', 'name', 'idx'],
    cache: ['programCourses', props.programName],
    parent: 'LMS Program',
    orderBy: 'idx',
    onSuccess(data) {
        program.value.program_courses = data;
    },
});
const programMembers = createListResource({
    doctype: 'LMS Program Member',
    fields: ['member', 'full_name', 'progress', 'name'],
    cache: ['programMembers', props.programName],
    parent: 'LMS Program',
    orderBy: 'creation desc',
    onSuccess(data) {
        program.value.program_members = data;
    },
});
const fetchCourses = () => {
    programCourses.update({
        filters: {
            parent: props.programName,
            parenttype: 'LMS Program',
            parentfield: 'program_courses',
        },
    });
    programCourses.reload();
};
const fetchMembers = () => {
    programMembers.update({
        filters: {
            parent: props.programName,
            parenttype: 'LMS Program',
            parentfield: 'program_members',
        },
    });
    programMembers.reload();
};
const validateTitle = () => {
    program.value.name = escapeHTML(program.value.name.trim());
};
const saveProgram = (close) => {
    validateTitle();
    if (props.programName === 'new')
        createNewProgram(close);
    else
        updateProgram(close);
    dirty.value = false;
};
const createNewProgram = (close) => {
    programs.value.insert.submit({
        ...program.value,
        title: program.value.name,
    }, {
        onSuccess() {
            close();
            programs.value.reload();
            toast.success(__('Program created successfully'));
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
const updateProgram = (close) => {
    programs.value.setValue.submit({
        name: props.programName,
        ...program.value,
    }, {
        onSuccess() {
            close();
            programs.value.reload();
            toast.success(__('Program updated successfully'));
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
const openForm = (formType) => {
    currentForm.value = formType;
    showFormDialog.value = true;
    if (formType === 'course') {
        course.value = '';
    }
    else {
        member.value = '';
    }
};
const addCourse = (close) => {
    if (!course.value) {
        toast.warning(__('Please select a course'));
        return;
    }
    const existingCourse = program.value.program_courses.find((c) => c.course === course.value);
    if (!existingCourse) {
        program.value.program_courses.push({
            course: course.value,
            idx: program.value.program_courses.length + 1,
        });
        if (props.programName !== 'new') {
            dirty.value = true;
        }
        close();
        toast.success(__('Course added to program successfully'));
    }
    else {
        toast.warning(__('Course already added to program'));
    }
};
const addMember = (close) => {
    if (!member.value) {
        toast.warning(__('Please select a member'));
        return;
    }
    const existingMember = program.value.program_members.find((m) => m.member === member.value);
    if (!existingMember) {
        program.value.program_members.push({
            member: member.value,
        });
        if (props.programName !== 'new') {
            dirty.value = true;
        }
        close();
        toast.success(__('Member added to program successfully'));
    }
    else {
        toast.warning(__('Member already added to program'));
    }
};
const updateCounts = async (type, action) => {
    if (!props.programName)
        return;
    let memberCount = programMembers.data?.length || 0;
    let courseCount = programCourses.data?.length || 0;
    if (type === 'member') {
        memberCount += action === 'add' ? 1 : -1;
    }
    else {
        courseCount += action === 'add' ? 1 : -1;
    }
    await programs.value.setValue.submit({
        name: props.programName,
        member_count: memberCount,
        course_count: courseCount,
    }, {
        onSuccess() {
            setProgramData();
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
const updateOrder = async (e) => {
    let sourceIdx = e.from.dataset.idx;
    let targetIdx = e.to.dataset.idx;
    if (props.programName === 'new') {
        let courses = program.value.program_courses;
        courses.splice(targetIdx, 0, courses.splice(sourceIdx, 1)[0]);
        courses.forEach((course, index) => {
            course.idx = index + 1;
        });
        dirty.value = true;
    }
    else {
        let courses = programCourses.data;
        courses.splice(targetIdx, 0, courses.splice(sourceIdx, 1)[0]);
        for (const [index, course] of courses.entries()) {
            programCourses.setValue.submit({
                name: course.name,
                idx: index + 1,
            }, {
                onError(err) {
                    toast.warning(__(err.messages?.[0] || err));
                },
            });
            await wait(100);
        }
    }
};
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const remove = (selections, unselectAll, type) => {
    const selectionsArray = Array.from(selections);
    if (type === 'courses') {
        program.value.program_courses = program.value.program_courses.filter((c) => !selectionsArray.includes(c.name || c.course));
    }
    else {
        program.value.program_members = program.value.program_members.filter((m) => !selectionsArray.includes(m.name || m.member));
    }
    dirty.value = true;
    unselectAll();
};
const deleteProgram = (close) => {
    if (props.programName == 'new')
        return;
    $dialog({
        title: __('Delete Program'),
        message: __('Are you sure you want to delete this program? This action cannot be undone.'),
        actions: [
            {
                label: __('Delete'),
                theme: 'red',
                variant: 'solid',
                onClick(closeDialog) {
                    programs.value?.delete.submit(props.programName, {
                        onSuccess() {
                            toast.success(__('Program deleted successfully'));
                            close();
                            closeDialog();
                        },
                        onError(err) {
                            toast.warning(__(err.messages?.[0] || err));
                            closeDialog();
                        },
                    });
                },
            },
        ],
    });
};
const courseColumns = computed(() => {
    return [
        {
            label: __('Title'),
            key: props.programName === 'new' ? 'course' : 'course_title',
            width: 1,
        },
    ];
});
const memberColumns = computed(() => {
    return [
        {
            label: __('Member'),
            key: 'member',
            width: 3,
            align: 'left',
        },
        {
            label: __('Full Name'),
            key: 'full_name',
            width: 3,
            align: 'left',
        },
    ];
});
let __VLS_modelEmit;
const __VLS_defaults = {
    programName: 'new',
};
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
    options: ({
        size: '2xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '2xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-title': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between space-x-2 text-base w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xl font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.programName === 'new' ? __VLS_ctx.__('Create Program') : __VLS_ctx.__('Edit Program'));
    if (__VLS_ctx.dirty) {
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            theme: "orange",
        }));
        const __VLS_10 = __VLS_9({
            theme: "orange",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        const { default: __VLS_13 } = __VLS_11.slots;
        (__VLS_ctx.__('Not Saved'));
        // @ts-ignore
        [show, programName, __, __, __, dirty,];
        var __VLS_11;
    }
    // @ts-ignore
    [];
}
{
    const { 'body-content': __VLS_14 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-5 pb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.program.name),
        label: (__VLS_ctx.__('Title')),
        type: "text",
        required: (true),
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.program.name),
        label: (__VLS_ctx.__('Title')),
        type: "text",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_20;
    const __VLS_21 = ({ change: {} },
        { onChange: (...[$event]) => {
                __VLS_ctx.dirty = true;
                // @ts-ignore
                [__, dirty, program,];
            } });
    var __VLS_18;
    var __VLS_19;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.program.published),
        label: (__VLS_ctx.__('Published')),
        type: "checkbox",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.program.published),
        label: (__VLS_ctx.__('Published')),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ change: {} },
        { onChange: (...[$event]) => {
                __VLS_ctx.dirty = true;
                // @ts-ignore
                [__, dirty, program,];
            } });
    var __VLS_25;
    var __VLS_26;
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.program.enforce_course_order),
        label: (__VLS_ctx.__('Enforce Course Order')),
        type: "checkbox",
    }));
    const __VLS_31 = __VLS_30({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.program.enforce_course_order),
        label: (__VLS_ctx.__('Enforce Course Order')),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    let __VLS_34;
    const __VLS_35 = ({ change: {} },
        { onChange: (...[$event]) => {
                __VLS_ctx.dirty = true;
                // @ts-ignore
                [__, dirty, program,];
            } });
    var __VLS_32;
    var __VLS_33;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mt-5 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Courses'));
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_41;
    const __VLS_42 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openForm('course');
                // @ts-ignore
                [__, openForm,];
            } });
    const { default: __VLS_43 } = __VLS_39.slots;
    {
        const { prefix: __VLS_44 } = __VLS_39.slots;
        let __VLS_45;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_47 = __VLS_46({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Add'));
    // @ts-ignore
    [__,];
    var __VLS_39;
    var __VLS_40;
    if (__VLS_ctx.program.program_courses?.length > 0) {
        let __VLS_50;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            columns: (__VLS_ctx.courseColumns),
            rows: (__VLS_ctx.program.program_courses),
            options: ({
                selectable: true,
                resizeColumn: true,
                showTooltip: false,
            }),
            rowKey: (__VLS_ctx.programName === 'new' ? 'course' : 'name'),
        }));
        const __VLS_52 = __VLS_51({
            columns: (__VLS_ctx.courseColumns),
            rows: (__VLS_ctx.program.program_courses),
            options: ({
                selectable: true,
                resizeColumn: true,
                showTooltip: false,
            }),
            rowKey: (__VLS_ctx.programName === 'new' ? 'course' : 'name'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        const { default: __VLS_55 } = __VLS_53.slots;
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
        ListHeader;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }));
        const __VLS_58 = __VLS_57({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const { default: __VLS_61 } = __VLS_59.slots;
        for (const [item] of __VLS_vFor((__VLS_ctx.courseColumns))) {
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem} */
            ListHeaderItem;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                item: (item),
            }));
            const __VLS_64 = __VLS_63({
                item: (item),
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            // @ts-ignore
            [programName, program, program, courseColumns, courseColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_59;
        let __VLS_67;
        /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
        ListRows;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        const { default: __VLS_72 } = __VLS_70.slots;
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.Draggable | typeof __VLS_components.Draggable} */
        Draggable;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            ...{ 'onEnd': {} },
            list: (__VLS_ctx.program.program_courses),
            itemKey: (__VLS_ctx.programName === 'new' ? 'course' : 'name'),
            group: "items",
            ...{ class: "cursor-move" },
        }));
        const __VLS_75 = __VLS_74({
            ...{ 'onEnd': {} },
            list: (__VLS_ctx.program.program_courses),
            itemKey: (__VLS_ctx.programName === 'new' ? 'course' : 'name'),
            group: "items",
            ...{ class: "cursor-move" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        let __VLS_78;
        const __VLS_79 = ({ end: {} },
            { onEnd: (__VLS_ctx.updateOrder) });
        /** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
        const { default: __VLS_80 } = __VLS_76.slots;
        {
            const { item: __VLS_81 } = __VLS_76.slots;
            const [{ element: row }] = __VLS_vSlot(__VLS_81);
            let __VLS_82;
            /** @ts-ignore @type { | typeof __VLS_components.ListRow} */
            ListRow;
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
                row: (row),
            }));
            const __VLS_84 = __VLS_83({
                row: (row),
            }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            // @ts-ignore
            [programName, program, updateOrder,];
        }
        // @ts-ignore
        [];
        var __VLS_76;
        var __VLS_77;
        // @ts-ignore
        [];
        var __VLS_70;
        let __VLS_87;
        /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
        ListSelectBanner;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({}));
        const __VLS_89 = __VLS_88({}, ...__VLS_functionalComponentArgsRest(__VLS_88));
        const { default: __VLS_92 } = __VLS_90.slots;
        {
            const { actions: __VLS_93 } = __VLS_90.slots;
            const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_93);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_94;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
                ...{ 'onClick': {} },
                variant: "ghost",
            }));
            const __VLS_96 = __VLS_95({
                ...{ 'onClick': {} },
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_95));
            let __VLS_99;
            const __VLS_100 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.program.program_courses?.length > 0))
                            return;
                        __VLS_ctx.remove(selections, unselectAll, 'courses');
                        // @ts-ignore
                        [remove,];
                    } });
            const { default: __VLS_101 } = __VLS_97.slots;
            let __VLS_102;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_104 = __VLS_103({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_103));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
            var __VLS_97;
            var __VLS_98;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_90;
        // @ts-ignore
        [];
        var __VLS_53;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('No courses added yet.'));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mt-5 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Members'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.programMembers.data.length > 0) {
        let __VLS_107;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
            ...{ 'onClick': {} },
        }));
        const __VLS_109 = __VLS_108({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        let __VLS_112;
        const __VLS_113 = ({ click: {} },
            { onClick: (() => {
                    __VLS_ctx.showProgressDialog = true;
                }) });
        const { default: __VLS_114 } = __VLS_110.slots;
        {
            const { prefix: __VLS_115 } = __VLS_110.slots;
            let __VLS_116;
            /** @ts-ignore @type { | typeof __VLS_components.TrendingUp} */
            TrendingUp;
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_118 = __VLS_117({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_117));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [__, __, programMembers, showProgressDialog,];
        }
        (__VLS_ctx.__('Progress Summary'));
        // @ts-ignore
        [__,];
        var __VLS_110;
        var __VLS_111;
    }
    let __VLS_121;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
        ...{ 'onClick': {} },
    }));
    const __VLS_123 = __VLS_122({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    let __VLS_126;
    const __VLS_127 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openForm('member');
                // @ts-ignore
                [openForm,];
            } });
    const { default: __VLS_128 } = __VLS_124.slots;
    {
        const { prefix: __VLS_129 } = __VLS_124.slots;
        let __VLS_130;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_132 = __VLS_131({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Add'));
    // @ts-ignore
    [__,];
    var __VLS_124;
    var __VLS_125;
    if (__VLS_ctx.program.program_members?.length > 0) {
        let __VLS_135;
        /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
        ListView;
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
            columns: (__VLS_ctx.memberColumns),
            rows: (__VLS_ctx.program.program_members),
            options: ({
                selectable: true,
                resizeColumn: true,
            }),
            rowKey: (__VLS_ctx.programName === 'new' ? 'member' : 'name'),
        }));
        const __VLS_137 = __VLS_136({
            columns: (__VLS_ctx.memberColumns),
            rows: (__VLS_ctx.program.program_members),
            options: ({
                selectable: true,
                resizeColumn: true,
            }),
            rowKey: (__VLS_ctx.programName === 'new' ? 'member' : 'name'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_136));
        const { default: __VLS_140 } = __VLS_138.slots;
        let __VLS_141;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
        ListHeader;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }));
        const __VLS_143 = __VLS_142({
            ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const { default: __VLS_146 } = __VLS_144.slots;
        for (const [item] of __VLS_vFor((__VLS_ctx.memberColumns))) {
            let __VLS_147;
            /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem} */
            ListHeaderItem;
            // @ts-ignore
            const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
                item: (item),
            }));
            const __VLS_149 = __VLS_148({
                item: (item),
            }, ...__VLS_functionalComponentArgsRest(__VLS_148));
            // @ts-ignore
            [programName, program, program, memberColumns, memberColumns,];
        }
        // @ts-ignore
        [];
        var __VLS_144;
        let __VLS_152;
        /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
        ListRows;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({}));
        const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
        const { default: __VLS_157 } = __VLS_155.slots;
        for (const [row] of __VLS_vFor((__VLS_ctx.program.program_members))) {
            let __VLS_158;
            /** @ts-ignore @type { | typeof __VLS_components.ListRow} */
            ListRow;
            // @ts-ignore
            const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
                row: (row),
            }));
            const __VLS_160 = __VLS_159({
                row: (row),
            }, ...__VLS_functionalComponentArgsRest(__VLS_159));
            // @ts-ignore
            [program,];
        }
        // @ts-ignore
        [];
        var __VLS_155;
        let __VLS_163;
        /** @ts-ignore @type { | typeof __VLS_components.ListSelectBanner | typeof __VLS_components.ListSelectBanner} */
        ListSelectBanner;
        // @ts-ignore
        const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({}));
        const __VLS_165 = __VLS_164({}, ...__VLS_functionalComponentArgsRest(__VLS_164));
        const { default: __VLS_168 } = __VLS_166.slots;
        {
            const { actions: __VLS_169 } = __VLS_166.slots;
            const [{ unselectAll, selections }] = __VLS_vSlot(__VLS_169);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_170;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_171 = __VLS_asFunctionalComponent1(__VLS_170, new __VLS_170({
                ...{ 'onClick': {} },
                variant: "ghost",
            }));
            const __VLS_172 = __VLS_171({
                ...{ 'onClick': {} },
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_171));
            let __VLS_175;
            const __VLS_176 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.program.program_members?.length > 0))
                            return;
                        __VLS_ctx.remove(selections, unselectAll, 'members');
                        // @ts-ignore
                        [remove,];
                    } });
            const { default: __VLS_177 } = __VLS_173.slots;
            let __VLS_178;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_180 = __VLS_179({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_179));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
            var __VLS_173;
            var __VLS_174;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_166;
        // @ts-ignore
        [];
        var __VLS_138;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('No members added yet.'));
    }
    let __VLS_183;
    /** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
    Dialog;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent1(__VLS_183, new __VLS_183({
        modelValue: (__VLS_ctx.showFormDialog),
        options: ({
            title: __VLS_ctx.currentForm == 'course'
                ? __VLS_ctx.__('Add Course to Program')
                : __VLS_ctx.__('Enroll Member to Program'),
            actions: [
                {
                    label: __VLS_ctx.__('Add'),
                    variant: 'solid',
                    onClick: ({ close }) => __VLS_ctx.currentForm == 'course'
                        ? __VLS_ctx.addCourse(close)
                        : __VLS_ctx.addMember(close),
                },
            ],
        }),
    }));
    const __VLS_185 = __VLS_184({
        modelValue: (__VLS_ctx.showFormDialog),
        options: ({
            title: __VLS_ctx.currentForm == 'course'
                ? __VLS_ctx.__('Add Course to Program')
                : __VLS_ctx.__('Enroll Member to Program'),
            actions: [
                {
                    label: __VLS_ctx.__('Add'),
                    variant: 'solid',
                    onClick: ({ close }) => __VLS_ctx.currentForm == 'course'
                        ? __VLS_ctx.addCourse(close)
                        : __VLS_ctx.addMember(close),
                },
            ],
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    const { default: __VLS_188 } = __VLS_186.slots;
    {
        const { 'body-content': __VLS_189 } = __VLS_186.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
        });
        if (__VLS_ctx.currentForm == 'course') {
            const __VLS_190 = Link;
            // @ts-ignore
            const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
                modelValue: (__VLS_ctx.course),
                doctype: "LMS Course",
                label: (__VLS_ctx.__('Course')),
            }));
            const __VLS_192 = __VLS_191({
                modelValue: (__VLS_ctx.course),
                doctype: "LMS Course",
                label: (__VLS_ctx.__('Course')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_191));
        }
        if (__VLS_ctx.currentForm == 'member') {
            const __VLS_195 = Link;
            // @ts-ignore
            const __VLS_196 = __VLS_asFunctionalComponent1(__VLS_195, new __VLS_195({
                modelValue: (__VLS_ctx.member),
                doctype: "User",
                filters: ({
                    ignore_user_type: 1,
                }),
                label: (__VLS_ctx.__('Program Member')),
                onCreate: ((value, close) => __VLS_ctx.openSettings('Members', close)),
            }));
            const __VLS_197 = __VLS_196({
                modelValue: (__VLS_ctx.member),
                doctype: "User",
                filters: ({
                    ignore_user_type: 1,
                }),
                label: (__VLS_ctx.__('Program Member')),
                onCreate: ((value, close) => __VLS_ctx.openSettings('Members', close)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_196));
        }
        // @ts-ignore
        [__, __, __, __, __, __, showFormDialog, currentForm, currentForm, currentForm, currentForm, addCourse, addMember, course, member, openSettings,];
    }
    // @ts-ignore
    [];
    var __VLS_186;
    const __VLS_200 = ProgramProgressSummary;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
        modelValue: (__VLS_ctx.showProgressDialog),
        programName: (__VLS_ctx.programName),
        programMembers: (__VLS_ctx.programMembers.data),
    }));
    const __VLS_202 = __VLS_201({
        modelValue: (__VLS_ctx.showProgressDialog),
        programName: (__VLS_ctx.programName),
        programMembers: (__VLS_ctx.programMembers.data),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    // @ts-ignore
    [programName, programMembers, showProgressDialog,];
}
{
    const { actions: __VLS_205 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_205);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.programName != 'new') {
        let __VLS_206;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
            ...{ 'onClick': {} },
            variant: "outline",
            theme: "red",
        }));
        const __VLS_208 = __VLS_207({
            ...{ 'onClick': {} },
            variant: "outline",
            theme: "red",
        }, ...__VLS_functionalComponentArgsRest(__VLS_207));
        let __VLS_211;
        const __VLS_212 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.programName != 'new'))
                        return;
                    __VLS_ctx.deleteProgram(close);
                    // @ts-ignore
                    [programName, deleteProgram,];
                } });
        const { default: __VLS_213 } = __VLS_209.slots;
        {
            const { prefix: __VLS_214 } = __VLS_209.slots;
            let __VLS_215;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_217 = __VLS_216({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_216));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Delete'));
        // @ts-ignore
        [__,];
        var __VLS_209;
        var __VLS_210;
    }
    let __VLS_220;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent1(__VLS_220, new __VLS_220({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_222 = __VLS_221({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    let __VLS_225;
    const __VLS_226 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.saveProgram(close);
                // @ts-ignore
                [saveProgram,];
            } });
    const { default: __VLS_227 } = __VLS_223.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_223;
    var __VLS_224;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
