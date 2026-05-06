/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, Dialog, FormControl, TextEditor, toast } from 'frappe-ui';
import { Link, useOnboarding, useTelemetry } from 'frappe-ui/frappe';
import { inject, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { openSettings } from '@/utils';
import MultiSelect from '@/components/Controls/MultiSelect.vue';
import Uploader from '@/components/Controls/Uploader.vue';
const show = defineModel({ required: true, default: false });
const router = useRouter();
const { capture } = useTelemetry();
const { updateOnboardingStep } = useOnboarding('learning');
const user = inject('$user');
const props = defineProps();
const course = ref({
    title: '',
    short_introduction: '',
    description: '',
    instructors: [],
    category: null,
    image: null,
});
const saveCourse = (close = () => { }) => {
    props.courses.insert.submit({
        ...course.value,
        instructors: course.value.instructors.map((instructor) => ({
            instructor: instructor,
        })),
    }, {
        onSuccess(data) {
            toast.success(__('Course created successfully'));
            close();
            capture('course_created');
            router.push({
                name: 'CourseDetail',
                params: { courseName: data.name },
                hash: '#settings',
            });
            if (user.data?.is_system_manager) {
                updateOnboardingStep('create_first_course', true, false, () => {
                    localStorage.setItem('firstCourse', data.name);
                });
            }
        },
    });
};
const keyboardShortcut = (e) => {
    if (e.key === 's' &&
        (e.ctrlKey || e.metaKey) &&
        e.target &&
        e.target instanceof HTMLElement &&
        !e.target.classList.contains('ProseMirror')) {
        saveCourse();
        e.preventDefault();
    }
};
onMounted(() => {
    window.addEventListener('keydown', keyboardShortcut);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyboardShortcut);
});
watch(show, () => {
    capture('course_form_opened');
});
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
    options: ({
        title: __VLS_ctx.__('Create Course'),
        size: '3xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Create Course'),
        size: '3xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-5 border-b mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.course.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.course.title),
        label: (__VLS_ctx.__('Title')),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.Link} */
    Link;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ 'onCreate': {} },
        doctype: "LMS Category",
        modelValue: (__VLS_ctx.course.category),
        label: (__VLS_ctx.__('Category')),
        allowCreate: (true),
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onCreate': {} },
        doctype: "LMS Category",
        modelValue: (__VLS_ctx.course.category),
        label: (__VLS_ctx.__('Category')),
        allowCreate: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    const __VLS_19 = ({ create: {} },
        { onCreate: (() => {
                __VLS_ctx.openSettings('Categories');
                __VLS_ctx.show = false;
            }) });
    var __VLS_16;
    var __VLS_17;
    const __VLS_20 = MultiSelect;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.course.instructors),
        doctype: "User",
        label: (__VLS_ctx.__('Instructors')),
        filters: ({ ignore_user_type: 1 }),
        onCreate: ((close) => __VLS_ctx.openSettings('Members', close)),
        required: (true),
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.course.instructors),
        doctype: "User",
        label: (__VLS_ctx.__('Instructors')),
        filters: ({ ignore_user_type: 1 }),
        onCreate: ((close) => __VLS_ctx.openSettings('Members', close)),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_25 = Uploader;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        modelValue: (__VLS_ctx.course.image),
        label: (__VLS_ctx.__('Course Image')),
        required: (false),
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (__VLS_ctx.course.image),
        label: (__VLS_ctx.__('Course Image')),
        required: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        modelValue: (__VLS_ctx.course.short_introduction),
        label: (__VLS_ctx.__('Short Introduction')),
        type: "textarea",
        required: (true),
        rows: (4),
    }));
    const __VLS_32 = __VLS_31({
        modelValue: (__VLS_ctx.course.short_introduction),
        label: (__VLS_ctx.__('Short Introduction')),
        type: "textarea",
        required: (true),
        rows: (4),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-1.5 text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Course Description'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-ink-red-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.course.description),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[10rem]",
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.course.description),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[10rem]",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    const __VLS_41 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.course.description = val)) });
    var __VLS_38;
    var __VLS_39;
    // @ts-ignore
    [show, show, __, __, __, __, __, __, __, course, course, course, course, course, course, course, openSettings, openSettings,];
}
{
    const { actions: __VLS_42 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_42);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    let __VLS_43;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_48;
    const __VLS_49 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.saveCourse(close);
                // @ts-ignore
                [saveCourse,];
            } });
    const { default: __VLS_50 } = __VLS_46.slots;
    (__VLS_ctx.__('Create'));
    // @ts-ignore
    [__,];
    var __VLS_46;
    var __VLS_47;
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
});
export default {};
