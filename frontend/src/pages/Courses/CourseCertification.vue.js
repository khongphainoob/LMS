/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, inject, onMounted, ref } from 'vue';
import { Breadcrumbs, call, createResource, usePageMeta } from 'frappe-ui';
import { useRouter } from 'vue-router';
import { sessionStore } from '../../stores/session';
import UpcomingEvaluations from '@/components/UpcomingEvaluations.vue';
const courseTitle = ref(null);
const evaluator = ref(null);
const { brand } = sessionStore();
const courses = ref([]);
const user = inject('$user');
const dayjs = inject('$dayjs');
const router = useRouter();
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    fetchEnrollmentDetails();
    fetchCourseDetails();
});
const certificate = createResource({
    url: 'frappe.client.get_value',
    params: {
        doctype: 'LMS Certificate',
        filters: {
            member: user.data?.name,
            course: props.courseName,
        },
        fieldname: ['name', 'template', 'issue_date'],
    },
    cache: [user.data?.name, props.courseName],
});
const fetchEnrollmentDetails = () => {
    call('frappe.client.get_value', {
        doctype: 'LMS Enrollment',
        filters: { member: user.data?.name, course: props.courseName },
        fieldname: ['purchased_certificate'],
    }).then((data) => {
        if (data.purchased_certificate) {
            certificate.reload();
        }
        else {
            router.push({
                name: 'CourseDetail',
                params: { courseName: props.courseName },
            });
        }
    });
};
const fetchCourseDetails = () => {
    call('frappe.client.get_value', {
        doctype: 'LMS Course',
        filters: { name: props.courseName },
        fieldname: ['title', 'evaluator'],
    }).then((data) => {
        courseTitle.value = data.title;
        evaluator.value = data.evaluator;
        populateCourses();
    });
};
const populateCourses = () => {
    courses.value = [
        {
            course: props.courseName,
            title: courseTitle.value,
            evaluator: evaluator.value,
        },
    ];
};
const openCertificate = (certificate) => {
    window.open(`/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${certificate.name}&format=${encodeURIComponent(certificate.template)}`, '_blank');
};
const breadcrumbs = computed(() => [
    {
        label: __('Courses'),
        route: { name: 'Courses' },
    },
    {
        label: courseTitle.value,
        route: { name: 'CourseDetail', params: { courseName: props.courseName } },
    },
    {
        label: __('Certification'),
    },
]);
usePageMeta(() => {
    return {
        title: courseTitle.value,
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
if (__VLS_ctx.certificate.data && Object.keys(__VLS_ctx.certificate.data).length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg text-ink-gray-9 font-semibold mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.__('Certification'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-9 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.__('You are already certified for this course. Click on the card below to open your certificate.'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.certificate.data && Object.keys(__VLS_ctx.certificate.data).length))
                    return;
                __VLS_ctx.openCertificate(__VLS_ctx.certificate.data);
                // @ts-ignore
                [breadcrumbs, certificate, certificate, certificate, __, __, openCertificate,];
            } },
        ...{ class: "border p-3 w-fit min-w-60 rounded-md space-y-2 hover:bg-surface-gray-1 cursor-pointer mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-60']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-9 font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.courseTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-7 font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.__('Issued On'));
    (__VLS_ctx.dayjs(__VLS_ctx.certificate.data.issue_date).format('DD MMM YYYY'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (__VLS_ctx.courses.length) {
        const __VLS_5 = UpcomingEvaluations;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            courses: (__VLS_ctx.courses),
        }));
        const __VLS_7 = __VLS_6({
            courses: (__VLS_ctx.courses),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
}
// @ts-ignore
[certificate, __, courseTitle, dayjs, courses, courses,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
    },
});
export default {};
