/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { BookOpen, BookText, CreditCard, GraduationCap, Pencil, Star, TrendingUp, Users, } from 'lucide-vue-next';
import { computed, inject, ref } from 'vue';
import { Badge, Button, call, createResource, toast } from 'frappe-ui';
import { formatAmount } from '@/utils/';
import { useRouter } from 'vue-router';
import CertificationLinks from '@/components/CertificationLinks.vue';
import { useTelemetry } from 'frappe-ui/frappe';
const router = useRouter();
const user = inject('$user');
const readOnlyMode = window.read_only_mode;
const { capture } = useTelemetry();
const props = defineProps({
    course: {
        type: Object,
        default: null,
    },
});
const video_link = computed(() => {
    if (props.course.data.video_link) {
        return 'https://www.youtube.com/embed/' + props.course.data.video_link;
    }
    return null;
});
function enrollStudent() {
    if (!user.data) {
        toast.warning(__('You need to login first to enroll for this course'));
        setTimeout(() => {
            window.location.href = `/login?redirect-to=${window.location.pathname}`;
        }, 500);
    }
    else {
        call('frappe.client.insert', {
            doc: {
                doctype: 'LMS Enrollment',
                course: props.course.data.name,
                member: user.data.name,
            },
        })
            .then(() => {
            capture('enrolled_in_course', {
                course: props.course.data.name,
            });
            toast.success(__('You have been enrolled in this course'));
            setTimeout(() => {
                router.push({
                    name: 'Lesson',
                    params: {
                        courseName: props.course.data.name,
                        chapterNumber: 1,
                        lessonNumber: 1,
                    },
                });
            }, 1000);
        })
            .catch((err) => {
            toast.warning(__(err.messages?.[0] || err));
            console.error(err);
        });
    }
}
const is_instructor = () => {
    let user_is_instructor = false;
    props.course.data.instructors.forEach((instructor) => {
        if (!user_is_instructor && instructor.name == user.data?.name) {
            user_is_instructor = true;
        }
    });
    return user_is_instructor;
};
const canGetCertificate = computed(() => {
    if (props.course.data?.enable_certification &&
        props.course.data?.membership?.progress == 100) {
        return true;
    }
    return false;
});
const certificate = createResource({
    url: 'lms.lms.doctype.lms_certificate.lms_certificate.create_certificate',
    makeParams(values) {
        return {
            course: values.course,
        };
    },
    onSuccess(data) {
        window.open(`/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${data.name}&format=${encodeURIComponent(data.template)}`, '_blank');
    },
});
const fetchCertificate = () => {
    certificate.submit({
        course: props.course.data?.name,
        member: user.data?.name,
    });
};
const isAdmin = computed(() => {
    return user.data?.is_moderator || is_instructor();
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-2 rounded-md min-w-80 max-w-sm" },
});
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-80']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
if (__VLS_ctx.course.data.video_link) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.iframe)({
        src: (__VLS_ctx.video_link),
        ...{ class: "rounded-t-md min-h-56 w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-t-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-5" },
});
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
if (__VLS_ctx.course.data.paid_course) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-2xl font-semibold mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.course.data.price);
}
if (!__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (__VLS_ctx.course.data.membership) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            to: ({
                name: 'Lesson',
                params: {
                    courseName: __VLS_ctx.course.name,
                    chapterNumber: __VLS_ctx.course.data.current_lesson
                        ? __VLS_ctx.course.data.current_lesson.split('-')[0]
                        : 1,
                    lessonNumber: __VLS_ctx.course.data.current_lesson
                        ? __VLS_ctx.course.data.current_lesson.split('-')[1]
                        : 1,
                },
            }),
        }));
        const __VLS_2 = __VLS_1({
            to: ({
                name: 'Lesson',
                params: {
                    courseName: __VLS_ctx.course.name,
                    chapterNumber: __VLS_ctx.course.data.current_lesson
                        ? __VLS_ctx.course.data.current_lesson.split('-')[0]
                        : 1,
                    lessonNumber: __VLS_ctx.course.data.current_lesson
                        ? __VLS_ctx.course.data.current_lesson.split('-')[1]
                        : 1,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const { default: __VLS_5 } = __VLS_3.slots;
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            variant: "solid",
            size: "md",
            ...{ class: "w-full" },
        }));
        const __VLS_8 = __VLS_7({
            variant: "solid",
            size: "md",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_11 } = __VLS_9.slots;
        {
            const { prefix: __VLS_12 } = __VLS_9.slots;
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.BookText} */
            BookText;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_15 = __VLS_14({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [course, course, course, course, course, course, course, course, course, video_link, readOnlyMode,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Continue Learning'));
        // @ts-ignore
        [__,];
        var __VLS_9;
        // @ts-ignore
        [];
        var __VLS_3;
        const __VLS_18 = CertificationLinks;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            courseName: (__VLS_ctx.course.data.name),
            ...{ class: "w-full" },
        }));
        const __VLS_20 = __VLS_19({
            courseName: (__VLS_ctx.course.data.name),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    else if (__VLS_ctx.course.data.paid_course && !__VLS_ctx.isAdmin) {
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            to: ({
                name: 'Billing',
                params: {
                    type: 'course',
                    name: __VLS_ctx.course.data.name,
                },
            }),
        }));
        const __VLS_25 = __VLS_24({
            to: ({
                name: 'Billing',
                params: {
                    type: 'course',
                    name: __VLS_ctx.course.data.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        const { default: __VLS_28 } = __VLS_26.slots;
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            variant: "solid",
            size: "md",
            ...{ class: "w-full" },
        }));
        const __VLS_31 = __VLS_30({
            variant: "solid",
            size: "md",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_34 } = __VLS_32.slots;
        {
            const { prefix: __VLS_35 } = __VLS_32.slots;
            let __VLS_36;
            /** @ts-ignore @type { | typeof __VLS_components.CreditCard} */
            CreditCard;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_38 = __VLS_37({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [course, course, course, isAdmin,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Buy this course'));
        // @ts-ignore
        [__,];
        var __VLS_32;
        // @ts-ignore
        [];
        var __VLS_26;
    }
    else if (__VLS_ctx.course.data.disable_self_learning && !__VLS_ctx.isAdmin) {
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            theme: "blue",
            size: "lg",
            ...{ class: "mb-4" },
        }));
        const __VLS_43 = __VLS_42({
            theme: "blue",
            size: "lg",
            ...{ class: "mb-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        const { default: __VLS_46 } = __VLS_44.slots;
        (__VLS_ctx.__('Contact the Administrator to enroll for this course'));
        // @ts-ignore
        [course, __, isAdmin,];
        var __VLS_44;
    }
    else if (!__VLS_ctx.isAdmin) {
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            ...{ 'onClick': {} },
            variant: "solid",
            ...{ class: "w-full" },
            size: "md",
        }));
        const __VLS_49 = __VLS_48({
            ...{ 'onClick': {} },
            variant: "solid",
            ...{ class: "w-full" },
            size: "md",
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        let __VLS_52;
        const __VLS_53 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.readOnlyMode))
                        return;
                    if (!!(__VLS_ctx.course.data.membership))
                        return;
                    if (!!(__VLS_ctx.course.data.paid_course && !__VLS_ctx.isAdmin))
                        return;
                    if (!!(__VLS_ctx.course.data.disable_self_learning && !__VLS_ctx.isAdmin))
                        return;
                    if (!(!__VLS_ctx.isAdmin))
                        return;
                    __VLS_ctx.enrollStudent();
                    // @ts-ignore
                    [isAdmin, enrollStudent,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_54 } = __VLS_50.slots;
        {
            const { prefix: __VLS_55 } = __VLS_50.slots;
            let __VLS_56;
            /** @ts-ignore @type { | typeof __VLS_components.BookText} */
            BookText;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_58 = __VLS_57({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Start Learning'));
        // @ts-ignore
        [__,];
        var __VLS_50;
        var __VLS_51;
    }
    if (__VLS_ctx.canGetCertificate) {
        let __VLS_61;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
            ...{ 'onClick': {} },
            variant: "subtle",
            ...{ class: "w-full mt-2" },
            size: "md",
        }));
        const __VLS_63 = __VLS_62({
            ...{ 'onClick': {} },
            variant: "subtle",
            ...{ class: "w-full mt-2" },
            size: "md",
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        let __VLS_66;
        const __VLS_67 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.readOnlyMode))
                        return;
                    if (!(__VLS_ctx.canGetCertificate))
                        return;
                    __VLS_ctx.fetchCertificate();
                    // @ts-ignore
                    [canGetCertificate, fetchCertificate,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        const { default: __VLS_68 } = __VLS_64.slots;
        {
            const { prefix: __VLS_69 } = __VLS_64.slots;
            let __VLS_70;
            /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
            GraduationCap;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_72 = __VLS_71({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Get Certificate'));
        // @ts-ignore
        [__,];
        var __VLS_64;
        var __VLS_65;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-medium text-ink-gray-9" },
    ...{ class: ({ 'mt-8': __VLS_ctx.course.data.membership && !__VLS_ctx.readOnlyMode }) },
});
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
(__VLS_ctx.__('This course has:'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
let __VLS_75;
/** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
BookOpen;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    ...{ class: "h-4 w-4 stroke-1.5" },
}));
const __VLS_77 = __VLS_76({
    ...{ class: "h-4 w-4 stroke-1.5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "ml-2" },
});
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
(__VLS_ctx.course.data.lessons);
(__VLS_ctx.__('Lessons'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
let __VLS_80;
/** @ts-ignore @type { | typeof __VLS_components.Users} */
Users;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    ...{ class: "h-4 w-4 stroke-1.5" },
}));
const __VLS_82 = __VLS_81({
    ...{ class: "h-4 w-4 stroke-1.5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "ml-2" },
});
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
(__VLS_ctx.formatAmount(__VLS_ctx.course.data.enrollments));
(__VLS_ctx.__('Enrolled Students'));
if (parseInt(__VLS_ctx.course.data.rating) > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    let __VLS_85;
    /** @ts-ignore @type { | typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
        ...{ class: "size-4 stroke-1.5 fill-yellow-500 text-transparent" },
    }));
    const __VLS_87 = __VLS_86({
        ...{ class: "size-4 stroke-1.5 fill-yellow-500 text-transparent" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['fill-yellow-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ml-2" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    (__VLS_ctx.course.data.rating);
    (__VLS_ctx.__('Rating'));
}
if (__VLS_ctx.course.data.enable_certification) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    let __VLS_90;
    /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
    GraduationCap;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        ...{ class: "h-4 w-4 stroke-2" },
    }));
    const __VLS_92 = __VLS_91({
        ...{ class: "h-4 w-4 stroke-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ml-2" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    (__VLS_ctx.__('Certificate of Completion'));
}
if (__VLS_ctx.course.data.paid_certificate) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    let __VLS_95;
    /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
    GraduationCap;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        ...{ class: "h-4 w-4 stroke-2" },
    }));
    const __VLS_97 = __VLS_96({
        ...{ class: "h-4 w-4 stroke-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ml-2" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    (__VLS_ctx.__('Paid Certificate after Evaluation'));
}
// @ts-ignore
[course, course, course, course, course, course, course, readOnlyMode, __, __, __, __, __, __, formatAmount,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        course: {
            type: Object,
            default: null,
        },
    },
});
export default {};
