/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, createResource, Breadcrumbs, Tabs, usePageMeta, } from 'frappe-ui';
import { computed, inject, markRaw, onMounted, ref, watch } from 'vue';
import { sessionStore } from '@/stores/session';
import { useRouter, useRoute } from 'vue-router';
import { List, Settings2, Trash2, TrendingUp } from 'lucide-vue-next';
import CourseOverview from '@/pages/Courses/CourseOverview.vue';
import CourseDashboard from '@/pages/Courses/CourseDashboard.vue';
import CourseForm from '@/pages/Courses/CourseForm.vue';
const { brand } = sessionStore();
const router = useRouter();
const route = useRoute();
const user = inject('$user');
const tabIndex = ref(0);
const childRef = ref(null);
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    updateTabIndex();
});
const updateTabIndex = () => {
    const hash = route.hash;
    if (hash) {
        tabs.value.forEach((tab, index) => {
            if (tab.label?.toLowerCase() === hash.replace('#', '')) {
                tabIndex.value = index;
            }
        });
    }
};
watch(tabIndex, () => {
    const tab = tabs.value[tabIndex.value];
    if (tab.label != route.hash.replace('#', '')) {
        router.push({ ...route, hash: `#${tab.label.toLowerCase()}` });
    }
});
const course = createResource({
    url: 'lms.lms.utils.get_course_details',
    cache: ['course', props.courseName],
    makeParams() {
        return {
            course: props.courseName,
        };
    },
    auto: true,
});
const tabs = ref([
    {
        label: __('Overview'),
        component: markRaw(CourseOverview),
        icon: List,
    },
    {
        label: __('Dashboard'),
        component: markRaw(CourseDashboard),
        icon: TrendingUp,
    },
    {
        label: __('Settings'),
        component: markRaw(CourseForm),
        icon: Settings2,
    },
]);
watch(() => props.courseName, () => {
    course.reload();
});
watch(course, () => {
    if (!isAdmin.value && !course.data?.published && !course.data?.upcoming) {
        router.push({
            name: 'Courses',
        });
    }
});
const isInstructor = () => {
    let user_is_instructor = false;
    course.data?.instructors.forEach((instructor) => {
        if (!user_is_instructor && instructor.name == user.data?.name) {
            user_is_instructor = true;
        }
    });
    return user_is_instructor;
};
const isAdmin = computed(() => {
    return user.data?.is_moderator || isInstructor();
});
const breadcrumbs = computed(() => {
    let items = [{ label: __('Courses'), route: { name: 'Courses' } }];
    items.push({
        label: course?.data?.title,
        route: { name: 'CourseDetail', params: { courseName: course?.data?.name } },
    });
    return items;
});
usePageMeta(() => {
    return {
        title: course?.data?.title,
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.course.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
        ...{ class: "h-7" },
        items: (__VLS_ctx.breadcrumbs),
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "h-7" },
        items: (__VLS_ctx.breadcrumbs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    if (__VLS_ctx.tabIndex == 2) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        if (__VLS_ctx.childRef?.isDirty) {
            let __VLS_5;
            /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
            Badge;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                theme: "orange",
            }));
            const __VLS_7 = __VLS_6({
                theme: "orange",
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            const { default: __VLS_10 } = __VLS_8.slots;
            (__VLS_ctx.__('Not Saved'));
            // @ts-ignore
            [course, breadcrumbs, tabIndex, childRef, __,];
            var __VLS_8;
        }
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            ...{ 'onClick': {} },
        }));
        const __VLS_13 = __VLS_12({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        let __VLS_16;
        const __VLS_17 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.course.data))
                        return;
                    if (!(__VLS_ctx.tabIndex == 2))
                        return;
                    __VLS_ctx.childRef.trashCourse();
                    // @ts-ignore
                    [childRef,];
                } });
        const { default: __VLS_18 } = __VLS_14.slots;
        {
            const { icon: __VLS_19 } = __VLS_14.slots;
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
            Trash2;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }));
            const __VLS_22 = __VLS_21({
                ...{ class: "w-4 h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_14;
        var __VLS_15;
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
            variant: "solid",
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
            variant: "solid",
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_30;
        const __VLS_31 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.course.data))
                        return;
                    if (!(__VLS_ctx.tabIndex == 2))
                        return;
                    __VLS_ctx.childRef.submitCourse();
                    // @ts-ignore
                    [childRef,];
                } });
        const { default: __VLS_32 } = __VLS_28.slots;
        (__VLS_ctx.__('Save'));
        // @ts-ignore
        [__,];
        var __VLS_28;
        var __VLS_29;
    }
    if (!__VLS_ctx.isAdmin) {
        const __VLS_33 = CourseOverview;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            course: (__VLS_ctx.course),
        }));
        const __VLS_35 = __VLS_34({
            course: (__VLS_ctx.course),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_38;
        /** @ts-ignore @type { | typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
        Tabs;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
            tabs: (__VLS_ctx.tabs),
            modelValue: (__VLS_ctx.tabIndex),
        }));
        const __VLS_40 = __VLS_39({
            tabs: (__VLS_ctx.tabs),
            modelValue: (__VLS_ctx.tabIndex),
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        const { default: __VLS_43 } = __VLS_41.slots;
        {
            const { 'tab-panel': __VLS_44 } = __VLS_41.slots;
            const [{ tab }] = __VLS_vSlot(__VLS_44);
            const __VLS_45 = (tab.component);
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
                course: (__VLS_ctx.course),
                ref: "childRef",
            }));
            const __VLS_47 = __VLS_46({
                course: (__VLS_ctx.course),
                ref: "childRef",
            }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            var __VLS_50 = {};
            var __VLS_48;
            // @ts-ignore
            [course, course, tabIndex, isAdmin, tabs,];
        }
        // @ts-ignore
        [];
        var __VLS_41;
    }
}
// @ts-ignore
var __VLS_51 = __VLS_50;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
    },
});
export default {};
