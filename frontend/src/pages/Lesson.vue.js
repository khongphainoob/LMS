/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Breadcrumbs, Button, call, createListResource, createResource, TabButtons, Tooltip, usePageMeta, toast, } from 'frappe-ui';
import { computed, watch, inject, ref, onMounted, onBeforeUnmount, nextTick, } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ChevronLeft, ChevronRight, LockKeyholeIcon, LogIn, Focus, Info, MessageCircleQuestion, TrendingUp, } from 'lucide-vue-next';
import { getEditorTools, enablePlyr, highlightText } from '@/utils';
import { sessionStore } from '@/stores/session';
import { useSidebar } from '@/stores/sidebar';
import EditorJS from '@editorjs/editorjs';
import LessonContent from '@/components/LessonContent.vue';
import CourseInstructors from '@/components/CourseInstructors.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import Discussions from '@/components/Discussions.vue';
import CertificationLinks from '@/components/CertificationLinks.vue';
import VideoStatistics from '@/components/Modals/VideoStatistics.vue';
import CourseOutline from '@/components/CourseOutline.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import Notes from '@/components/Notes/Notes.vue';
import InlineLessonMenu from '@/components/Notes/InlineLessonMenu.vue';
import { getLmsRoute } from '@/utils/basePath';
const user = inject('$user');
const socket = inject('$socket');
const router = useRouter();
const route = useRoute();
const allowDiscussions = ref(false);
const editor = ref(null);
const instructorEditor = ref(null);
const lessonProgress = ref(0);
const lessonContainer = ref(null);
const zenModeEnabled = ref(false);
const showStatsDialog = ref(false);
const hasQuiz = ref(false);
const discussionsContainer = ref(null);
const timer = ref(0);
const { brand } = sessionStore();
const sidebarStore = useSidebar();
const plyrSources = ref([]);
const showInlineMenu = ref(false);
const currentTab = ref('Notes');
let timerInterval;
const tabs = ref([
    {
        label: __('Notes'),
        value: 'Notes',
    },
]);
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
    chapterNumber: {
        type: String,
        required: true,
    },
    lessonNumber: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    startTimer();
    sidebarStore.isSidebarCollapsed = true;
    document.addEventListener('fullscreenchange', attachFullscreenEvent);
    socket.on('update_lesson_progress', (data) => {
        if (data.course === props.courseName) {
            lessonProgress.value = data.progress;
        }
    });
});
const attachFullscreenEvent = () => {
    if (document.fullscreenElement) {
        zenModeEnabled.value = true;
        allowDiscussions.value = false;
    }
    else {
        zenModeEnabled.value = false;
        if (!hasQuiz.value) {
            allowDiscussions.value = true;
        }
    }
};
onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', attachFullscreenEvent);
    sidebarStore.isSidebarCollapsed = false;
    trackVideoWatchDuration();
});
const lesson = createResource({
    url: 'lms.lms.utils.get_lesson',
    makeParams(values) {
        return {
            course: props.courseName,
            chapter: values ? values.chapter : props.chapterNumber,
            lesson: values ? values.lesson : props.lessonNumber,
        };
    },
    auto: true,
});
const setupLesson = (data) => {
    if (Object.keys(data).length === 0) {
        router.push({
            name: 'CourseDetail',
            params: { courseName: props.courseName },
        });
        return;
    }
    if (data.is_scorm_package) {
        router.push({
            name: 'SCORMChapter',
            params: {
                courseName: props.courseName,
                chapterName: data.chapter_name,
            },
        });
    }
    lessonProgress.value = data.membership?.progress;
    if (data.content)
        editor.value = renderEditor('editor', data.content);
    if (data.instructor_content &&
        JSON.parse(data.instructor_content)?.blocks?.length > 1)
        instructorEditor.value = renderEditor('instructor-content', data.instructor_content);
    editor.value?.isReady.then(() => {
        checkIfDiscussionsAllowed();
    });
    checkQuiz();
};
const checkQuiz = () => {
    if (!editor.value && lesson.body) {
        const quizRegex = /\{\{ Quiz\(".*"\) \}\}/;
        hasQuiz.value = quizRegex.test(lesson.body);
        if (!hasQuiz.value && !zenModeEnabled) {
            allowDiscussions.value = true;
        }
        else {
            allowDiscussions.value = false;
        }
    }
};
const renderEditor = (holder, content) => {
    if (document.getElementById(holder))
        document.getElementById(holder).innerHTML = '';
    return new EditorJS({
        holder: holder,
        tools: getEditorTools(),
        data: JSON.parse(content),
        readOnly: true,
        defaultBlock: 'embed',
    });
};
const markProgress = () => {
    if (user.data && lesson.data && !lesson.data.progress) {
        progress.submit();
    }
};
const progress = createResource({
    url: 'lms.lms.doctype.course_lesson.course_lesson.save_progress',
    makeParams() {
        return {
            lesson: lesson.data.name,
            course: props.courseName,
        };
    },
    onSuccess(data) {
        lessonProgress.value = data;
    },
});
const notes = createListResource({
    doctype: 'LMS Lesson Note',
    filters: {
        lesson: lesson.data?.name,
        member: user.data?.name,
    },
    fields: ['name', 'color', 'highlighted_text', 'note'],
    cache: ['notes', lesson.data?.name, user.data?.name],
    onSuccess(data) {
        data.forEach((note) => {
            setTimeout(() => {
                highlightText(note);
            }, 500);
        });
    },
});
const breadcrumbs = computed(() => {
    let items = [{ label: __('Courses'), route: { name: 'Courses' } }];
    items.push({
        label: lesson?.data?.course_title,
        route: { name: 'CourseDetail', params: { courseName: props.courseName } },
    });
    items.push({
        label: lesson?.data?.title,
        route: {
            name: 'Lesson',
            params: {
                courseName: props.courseName,
                chapterNumber: props.chapterNumber,
                lessonNumber: props.lessonNumber,
            },
        },
    });
    return items;
});
const switchLesson = (direction) => {
    trackVideoWatchDuration();
    let lessonIndex = direction === 'prev'
        ? lesson.data.prev.split('.')
        : lesson.data.next.split('.');
    router.push({
        name: 'Lesson',
        params: {
            courseName: props.courseName,
            chapterNumber: lessonIndex[0],
            lessonNumber: lessonIndex[1],
        },
    });
};
watch([() => route.params.chapterNumber, () => route.params.lessonNumber], async ([newChapterNumber, newLessonNumber], [oldChapterNumber, oldLessonNumber]) => {
    if (newChapterNumber || newLessonNumber) {
        plyrSources.value = [];
        await nextTick();
        resetLessonState(newChapterNumber, newLessonNumber);
        startTimer();
        updateNotes();
        checkIfDiscussionsAllowed();
        checkQuiz();
    }
});
const resetLessonState = (newChapterNumber, newLessonNumber) => {
    editor.value = null;
    instructorEditor.value = null;
    allowDiscussions.value = false;
    lesson.submit({
        chapter: newChapterNumber,
        lesson: newLessonNumber,
    });
    clearInterval(timerInterval);
    timer.value = 0;
};
const trackVideoWatchDuration = () => {
    if (!lesson.data.membership)
        return;
    let videoDetails = getVideoDetails();
    videoDetails = videoDetails.concat(getPlyrSourceDetails());
    call('lms.lms.api.track_video_watch_duration', {
        lesson: lesson.data.name,
        videos: videoDetails,
    });
};
const getVideoDetails = () => {
    let details = [];
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
        videos.forEach((video) => {
            if (video.currentTime == video.duration)
                markProgress();
            details.push({
                source: video.src,
                watch_time: video.currentTime,
            });
        });
    }
    return details;
};
const getPlyrSourceDetails = () => {
    let details = [];
    plyrSources.value.forEach((source) => {
        if (source.currentTime == source.duration)
            markProgress();
        let src = cleanYouTubeUrl(source.source);
        details.push({
            source: src,
            watch_time: source.currentTime,
        });
    });
    return details;
};
const cleanYouTubeUrl = (url) => {
    if (!url)
        return url;
    const urlObj = new URL(url);
    urlObj.searchParams.delete('t');
    return urlObj.toString();
};
watch(() => lesson.data, async (data) => {
    setupLesson(data);
    getPlyrSource();
    updateNotes();
    if (data.icon == 'icon-youtube')
        clearInterval(timerInterval);
});
const getPlyrSource = async () => {
    await nextTick();
    if (plyrSources.value.length == 0) {
        plyrSources.value = await enablePlyr();
    }
    updateVideoWatchDuration();
};
const updateVideoWatchDuration = () => {
    if (lesson.data.videos && lesson.data.videos.length > 0) {
        lesson.data.videos.forEach((video) => {
            if (video.source.includes('youtube') || video.source.includes('vimeo')) {
                updatePlyrVideoTime(video);
            }
            else {
                updateVideoTime(video);
            }
        });
    }
};
const updatePlyrVideoTime = (video) => {
    plyrSources.value.forEach((plyrSource) => {
        let lastWatchedTime = 0;
        let isSeeking = false;
        plyrSource.on('ready', () => {
            if (plyrSource.source === video.source) {
                plyrSource.embed.seekTo(video.watch_time, true);
                plyrSource.play();
                plyrSource.pause();
            }
        });
    });
};
const updateVideoTime = (video) => {
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
        videos.forEach((vid) => {
            if (vid.src === video.source) {
                let watch_time = video.watch_time < vid.duration ? video.watch_time : 0;
                if (vid.readyState >= 1) {
                    vid.currentTime = watch_time;
                }
                else {
                    vid.addEventListener('loadedmetadata', () => {
                        vid.currentTime = watch_time;
                    });
                }
            }
        });
    }
};
const startTimer = () => {
    if (!lesson.data?.membership)
        return;
    let timerInterval = setInterval(() => {
        timer.value++;
        if (timer.value == 30) {
            clearInterval(timerInterval);
            markProgress();
        }
    }, 1000);
};
onBeforeUnmount(() => {
    clearInterval(timerInterval);
});
const checkIfDiscussionsAllowed = () => {
    hasQuiz.value = false;
    JSON.parse(lesson.data?.content)?.blocks?.forEach((block) => {
        if (block.type === 'quiz') {
            hasQuiz.value = true;
        }
    });
    if (!hasQuiz.value &&
        !zenModeEnabled.value &&
        (lesson.data?.membership ||
            user.data?.is_moderator ||
            user.data?.is_instructor)) {
        allowDiscussions.value = true;
    }
    else {
        allowDiscussions.value = false;
    }
};
const allowEdit = () => {
    if (window.read_only_mode)
        return false;
    if (user.data?.is_moderator)
        return true;
    if (lesson.data?.instructors?.includes(user.data?.name))
        return true;
    return false;
};
const allowInstructorContent = () => {
    if (user.data?.is_moderator)
        return true;
    if (lesson.data?.instructors?.includes(user.data?.name))
        return true;
    return false;
};
const enrollment = createResource({
    url: 'frappe.client.insert',
    makeParams() {
        return {
            doc: {
                doctype: 'LMS Enrollment',
                course: props.courseName,
                member: user.data?.name,
            },
        };
    },
});
const enrollStudent = () => {
    enrollment.submit({}, {
        onSuccess() {
            window.location.reload();
        },
        onError(err) {
            toast.error(__(err.messages?.[0] || err));
            console.error(err);
        },
    });
};
const toggleInlineMenu = async () => {
    showInlineMenu.value = false;
    await nextTick();
    let selection = window.getSelection();
    if (selection.toString()) {
        showInlineMenu.value = true;
    }
};
const canSeeStats = () => {
    if (user.data?.is_moderator || user.data?.is_instructor)
        return true;
    return false;
};
const showVideoStats = () => {
    showStatsDialog.value = true;
};
const canGoZen = () => {
    if (user.data?.is_moderator ||
        user.data?.is_instructor ||
        user.data?.is_evaluator)
        return true;
    if (lesson.data?.membership)
        return true;
    return false;
};
const goFullScreen = () => {
    if (lessonContainer.value.requestFullscreen) {
        lessonContainer.value.requestFullscreen();
    }
    else if (lessonContainer.value.mozRequestFullScreen) {
        lessonContainer.value.mozRequestFullScreen();
    }
    else if (lessonContainer.value.webkitRequestFullscreen) {
        lessonContainer.value.webkitRequestFullscreen();
    }
    else if (lessonContainer.value.msRequestFullscreen) {
        lessonContainer.value.msRequestFullscreen();
    }
};
const showDiscussionsInZenMode = () => {
    if (allowDiscussions.value) {
        allowDiscussions.value = false;
    }
    else {
        allowDiscussions.value = true;
        currentTab.value = 'Community';
        scrollDiscussionsIntoView();
    }
};
const scrollDiscussionsIntoView = () => {
    nextTick(() => {
        discussionsContainer.value?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
        });
    });
};
const updateNotes = () => {
    if (!user.data)
        return;
    notes.update({
        filters: {
            lesson: lesson.data?.name,
            member: user.data?.name,
        },
    });
    notes.reload();
};
watch(allowDiscussions, () => {
    if (allowDiscussions.value) {
        tabs.value = [
            {
                label: __('Notes'),
                value: 'Notes',
            },
            {
                label: __('Community'),
                value: 'Community',
            },
        ];
    }
    else {
        tabs.value = [
            {
                label: __('Notes'),
                value: 'Notes',
            },
        ];
    }
});
const redirectToLogin = () => {
    window.location.href = `/login?redirect-to=${getLmsRoute(`courses/${props.courseName}`)}`;
};
usePageMeta(() => {
    return {
        title: lesson?.data?.title,
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
if (__VLS_ctx.lesson.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
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
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.canGoZen()) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            text: (__VLS_ctx.__('Zen Mode')),
        }));
        const __VLS_7 = __VLS_6({
            text: (__VLS_ctx.__('Zen Mode')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        const { default: __VLS_10 } = __VLS_8.slots;
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
                    if (!(__VLS_ctx.lesson.data))
                        return;
                    if (!(__VLS_ctx.canGoZen()))
                        return;
                    __VLS_ctx.goFullScreen();
                    // @ts-ignore
                    [lesson, breadcrumbs, canGoZen, __, goFullScreen,];
                } });
        const { default: __VLS_18 } = __VLS_14.slots;
        {
            const { icon: __VLS_19 } = __VLS_14.slots;
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.Focus} */
            Focus;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                ...{ class: "w-4 h-4 stroke-2" },
            }));
            const __VLS_22 = __VLS_21({
                ...{ class: "w-4 h-4 stroke-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_14;
        var __VLS_15;
        // @ts-ignore
        [];
        var __VLS_8;
    }
    if (__VLS_ctx.canSeeStats()) {
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_30;
        const __VLS_31 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.lesson.data))
                        return;
                    if (!(__VLS_ctx.canSeeStats()))
                        return;
                    __VLS_ctx.showVideoStats();
                    // @ts-ignore
                    [canSeeStats, showVideoStats,];
                } });
        const { default: __VLS_32 } = __VLS_28.slots;
        {
            const { icon: __VLS_33 } = __VLS_28.slots;
            let __VLS_34;
            /** @ts-ignore @type { | typeof __VLS_components.TrendingUp} */
            TrendingUp;
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_36 = __VLS_35({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_35));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_28;
        var __VLS_29;
    }
    const __VLS_39 = CertificationLinks;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        courseName: (__VLS_ctx.courseName),
    }));
    const __VLS_41 = __VLS_40({
        courseName: (__VLS_ctx.courseName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    if (__VLS_ctx.lesson.data.prev) {
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_49;
        const __VLS_50 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.lesson.data))
                        return;
                    if (!(__VLS_ctx.lesson.data.prev))
                        return;
                    __VLS_ctx.switchLesson('prev');
                    // @ts-ignore
                    [lesson, courseName, switchLesson,];
                } });
        const { default: __VLS_51 } = __VLS_47.slots;
        {
            const { prefix: __VLS_52 } = __VLS_47.slots;
            let __VLS_53;
            /** @ts-ignore @type { | typeof __VLS_components.ChevronLeft} */
            ChevronLeft;
            // @ts-ignore
            const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
                ...{ class: "w-4 h-4 stroke-1" },
            }));
            const __VLS_55 = __VLS_54({
                ...{ class: "w-4 h-4 stroke-1" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_54));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Previous'));
        // @ts-ignore
        [__,];
        var __VLS_47;
        var __VLS_48;
    }
    if (__VLS_ctx.allowEdit()) {
        let __VLS_58;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            to: ({
                name: 'LessonForm',
                params: {
                    courseName: __VLS_ctx.courseName,
                    chapterNumber: props.chapterNumber,
                    lessonNumber: props.lessonNumber,
                },
            }),
        }));
        const __VLS_60 = __VLS_59({
            to: ({
                name: 'LessonForm',
                params: {
                    courseName: __VLS_ctx.courseName,
                    chapterNumber: props.chapterNumber,
                    lessonNumber: props.lessonNumber,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        const { default: __VLS_63 } = __VLS_61.slots;
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
        const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
        const { default: __VLS_69 } = __VLS_67.slots;
        (__VLS_ctx.__('Edit'));
        // @ts-ignore
        [__, courseName, allowEdit,];
        var __VLS_67;
        // @ts-ignore
        [];
        var __VLS_61;
    }
    if (__VLS_ctx.lesson.data.next) {
        let __VLS_70;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
            ...{ 'onClick': {} },
        }));
        const __VLS_72 = __VLS_71({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        let __VLS_75;
        const __VLS_76 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.lesson.data))
                        return;
                    if (!(__VLS_ctx.lesson.data.next))
                        return;
                    __VLS_ctx.switchLesson('next');
                    // @ts-ignore
                    [lesson, switchLesson,];
                } });
        const { default: __VLS_77 } = __VLS_73.slots;
        {
            const { suffix: __VLS_78 } = __VLS_73.slots;
            let __VLS_79;
            /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
            ChevronRight;
            // @ts-ignore
            const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
                ...{ class: "w-4 h-4 stroke-1" },
            }));
            const __VLS_81 = __VLS_80({
                ...{ class: "w-4 h-4 stroke-1" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_80));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Next'));
        // @ts-ignore
        [__,];
        var __VLS_73;
        var __VLS_74;
    }
    else {
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            to: ({
                name: 'CourseDetail',
                params: { courseName: __VLS_ctx.courseName },
            }),
        }));
        const __VLS_86 = __VLS_85({
            to: ({
                name: 'CourseDetail',
                params: { courseName: __VLS_ctx.courseName },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        const { default: __VLS_89 } = __VLS_87.slots;
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({}));
        const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
        const { default: __VLS_95 } = __VLS_93.slots;
        (__VLS_ctx.__('Back to Course'));
        // @ts-ignore
        [__, courseName,];
        var __VLS_93;
        // @ts-ignore
        [];
        var __VLS_87;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid md:grid-cols-[70%,30%] h-screen" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-[70%,30%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
    if (__VLS_ctx.lesson.data.no_preview) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-r" },
        });
        /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "shadow rounded-md w-3/4 mt-10 mx-auto text-center p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3/4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-center mt-4 space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        let __VLS_96;
        /** @ts-ignore @type { | typeof __VLS_components.LockKeyholeIcon} */
        LockKeyholeIcon;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            ...{ class: "size-4 stroke-2 text-ink-gray-5" },
        }));
        const __VLS_98 = __VLS_97({
            ...{ class: "size-4 stroke-2 text-ink-gray-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-lg font-semibold text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('This lesson is locked'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 mb-4 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.__('This lesson is not available for preview. Please enroll in the course to access it.'));
        if (__VLS_ctx.user.data && !__VLS_ctx.lesson.data.disable_self_learning) {
            let __VLS_101;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
                ...{ 'onClick': {} },
                variant: "solid",
            }));
            const __VLS_103 = __VLS_102({
                ...{ 'onClick': {} },
                variant: "solid",
            }, ...__VLS_functionalComponentArgsRest(__VLS_102));
            let __VLS_106;
            const __VLS_107 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.lesson.data))
                            return;
                        if (!(__VLS_ctx.lesson.data.no_preview))
                            return;
                        if (!(__VLS_ctx.user.data && !__VLS_ctx.lesson.data.disable_self_learning))
                            return;
                        __VLS_ctx.enrollStudent();
                        // @ts-ignore
                        [lesson, lesson, __, __, user, enrollStudent,];
                    } });
            const { default: __VLS_108 } = __VLS_104.slots;
            (__VLS_ctx.__('Start Learning'));
            // @ts-ignore
            [__,];
            var __VLS_104;
            var __VLS_105;
        }
        else if (__VLS_ctx.lesson.data.disable_self_learning) {
            let __VLS_109;
            /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
            Badge;
            // @ts-ignore
            const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
                theme: "blue",
                size: "lg",
                ...{ class: "mt-2" },
            }));
            const __VLS_111 = __VLS_110({
                theme: "blue",
                size: "lg",
                ...{ class: "mt-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_110));
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            const { default: __VLS_114 } = __VLS_112.slots;
            (__VLS_ctx.__('Contact the Administrator to enroll for this course.'));
            // @ts-ignore
            [lesson, __,];
            var __VLS_112;
        }
        else {
            let __VLS_115;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
                ...{ 'onClick': {} },
            }));
            const __VLS_117 = __VLS_116({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_116));
            let __VLS_120;
            const __VLS_121 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.lesson.data))
                            return;
                        if (!(__VLS_ctx.lesson.data.no_preview))
                            return;
                        if (!!(__VLS_ctx.user.data && !__VLS_ctx.lesson.data.disable_self_learning))
                            return;
                        if (!!(__VLS_ctx.lesson.data.disable_self_learning))
                            return;
                        __VLS_ctx.redirectToLogin();
                        // @ts-ignore
                        [redirectToLogin,];
                    } });
            const { default: __VLS_122 } = __VLS_118.slots;
            {
                const { prefix: __VLS_123 } = __VLS_118.slots;
                let __VLS_124;
                /** @ts-ignore @type { | typeof __VLS_components.LogIn} */
                LogIn;
                // @ts-ignore
                const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
                    ...{ class: "w-4 h-4 stroke-1" },
                }));
                const __VLS_126 = __VLS_125({
                    ...{ class: "w-4 h-4 stroke-1" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_125));
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                // @ts-ignore
                [];
            }
            (__VLS_ctx.__('Login'));
            // @ts-ignore
            [__,];
            var __VLS_118;
            var __VLS_119;
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ref: "lessonContainer",
            ...{ class: "bg-surface-white" },
            ...{ class: ({
                    'overflow-y-auto': __VLS_ctx.zenModeEnabled,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-r pt-5 pb-10 h-full" },
            ...{ class: ({
                    'w-full md:w-3/5 mx-auto border-none !pt-10': __VLS_ctx.zenModeEnabled,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:w-3/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['!pt-10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "px-5" },
        });
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:space-y-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-3xl font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (__VLS_ctx.lesson.data.title);
        if (__VLS_ctx.zenModeEnabled) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "relative flex items-center space-x-2 text-sm mt-1 text-ink-gray-7 group w-fit mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.lesson.data.chapter_title);
            (__VLS_ctx.lesson.data.course_title);
            let __VLS_129;
            /** @ts-ignore @type { | typeof __VLS_components.Info} */
            Info;
            // @ts-ignore
            const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
                ...{ class: "size-3" },
            }));
            const __VLS_131 = __VLS_130({
                ...{ class: "size-3" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_130));
            /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "hidden group-hover:block rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-xl absolute left-0 top-full mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:block']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            (Math.ceil(__VLS_ctx.lesson.data.membership.progress));
            (__VLS_ctx.__('completed'));
        }
        if (__VLS_ctx.zenModeEnabled) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2 mt-2 md:mt-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:mt-0']} */ ;
            let __VLS_134;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
                ...{ 'onClick': {} },
            }));
            const __VLS_136 = __VLS_135({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_135));
            let __VLS_139;
            const __VLS_140 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.lesson.data))
                            return;
                        if (!!(__VLS_ctx.lesson.data.no_preview))
                            return;
                        if (!(__VLS_ctx.zenModeEnabled))
                            return;
                        __VLS_ctx.showDiscussionsInZenMode();
                        // @ts-ignore
                        [lesson, lesson, lesson, lesson, __, zenModeEnabled, zenModeEnabled, zenModeEnabled, zenModeEnabled, showDiscussionsInZenMode,];
                    } });
            const { default: __VLS_141 } = __VLS_137.slots;
            {
                const { icon: __VLS_142 } = __VLS_137.slots;
                let __VLS_143;
                /** @ts-ignore @type { | typeof __VLS_components.MessageCircleQuestion} */
                MessageCircleQuestion;
                // @ts-ignore
                const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
                    ...{ class: "w-4 h-4 stroke-1.5" },
                }));
                const __VLS_145 = __VLS_144({
                    ...{ class: "w-4 h-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_144));
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_137;
            var __VLS_138;
            if (__VLS_ctx.lesson.data.prev) {
                let __VLS_148;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
                    ...{ 'onClick': {} },
                }));
                const __VLS_150 = __VLS_149({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_149));
                let __VLS_153;
                const __VLS_154 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(__VLS_ctx.lesson.data))
                                return;
                            if (!!(__VLS_ctx.lesson.data.no_preview))
                                return;
                            if (!(__VLS_ctx.zenModeEnabled))
                                return;
                            if (!(__VLS_ctx.lesson.data.prev))
                                return;
                            __VLS_ctx.switchLesson('prev');
                            // @ts-ignore
                            [lesson, switchLesson,];
                        } });
                const { default: __VLS_155 } = __VLS_151.slots;
                {
                    const { prefix: __VLS_156 } = __VLS_151.slots;
                    let __VLS_157;
                    /** @ts-ignore @type { | typeof __VLS_components.ChevronLeft} */
                    ChevronLeft;
                    // @ts-ignore
                    const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
                        ...{ class: "w-4 h-4 stroke-1" },
                    }));
                    const __VLS_159 = __VLS_158({
                        ...{ class: "w-4 h-4 stroke-1" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
                    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                    // @ts-ignore
                    [];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.__('Previous'));
                // @ts-ignore
                [__,];
                var __VLS_151;
                var __VLS_152;
            }
            if (__VLS_ctx.allowEdit()) {
                let __VLS_162;
                /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                routerLink;
                // @ts-ignore
                const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
                    to: ({
                        name: 'LessonForm',
                        params: {
                            courseName: __VLS_ctx.courseName,
                            chapterNumber: props.chapterNumber,
                            lessonNumber: props.lessonNumber,
                        },
                    }),
                }));
                const __VLS_164 = __VLS_163({
                    to: ({
                        name: 'LessonForm',
                        params: {
                            courseName: __VLS_ctx.courseName,
                            chapterNumber: props.chapterNumber,
                            lessonNumber: props.lessonNumber,
                        },
                    }),
                }, ...__VLS_functionalComponentArgsRest(__VLS_163));
                const { default: __VLS_167 } = __VLS_165.slots;
                let __VLS_168;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({}));
                const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
                const { default: __VLS_173 } = __VLS_171.slots;
                (__VLS_ctx.__('Edit'));
                // @ts-ignore
                [__, courseName, allowEdit,];
                var __VLS_171;
                // @ts-ignore
                [];
                var __VLS_165;
            }
            if (__VLS_ctx.lesson.data.next) {
                let __VLS_174;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
                    ...{ 'onClick': {} },
                }));
                const __VLS_176 = __VLS_175({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_175));
                let __VLS_179;
                const __VLS_180 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(__VLS_ctx.lesson.data))
                                return;
                            if (!!(__VLS_ctx.lesson.data.no_preview))
                                return;
                            if (!(__VLS_ctx.zenModeEnabled))
                                return;
                            if (!(__VLS_ctx.lesson.data.next))
                                return;
                            __VLS_ctx.switchLesson('next');
                            // @ts-ignore
                            [lesson, switchLesson,];
                        } });
                const { default: __VLS_181 } = __VLS_177.slots;
                {
                    const { suffix: __VLS_182 } = __VLS_177.slots;
                    let __VLS_183;
                    /** @ts-ignore @type { | typeof __VLS_components.ChevronRight} */
                    ChevronRight;
                    // @ts-ignore
                    const __VLS_184 = __VLS_asFunctionalComponent1(__VLS_183, new __VLS_183({
                        ...{ class: "w-4 h-4 stroke-1" },
                    }));
                    const __VLS_185 = __VLS_184({
                        ...{ class: "w-4 h-4 stroke-1" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
                    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
                    // @ts-ignore
                    [];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.__('Next'));
                // @ts-ignore
                [__,];
                var __VLS_177;
                var __VLS_178;
            }
            else {
                let __VLS_188;
                /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                routerLink;
                // @ts-ignore
                const __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188({
                    to: ({
                        name: 'CourseDetail',
                        params: { courseName: __VLS_ctx.courseName },
                    }),
                }));
                const __VLS_190 = __VLS_189({
                    to: ({
                        name: 'CourseDetail',
                        params: { courseName: __VLS_ctx.courseName },
                    }),
                }, ...__VLS_functionalComponentArgsRest(__VLS_189));
                const { default: __VLS_193 } = __VLS_191.slots;
                let __VLS_194;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194({}));
                const __VLS_196 = __VLS_195({}, ...__VLS_functionalComponentArgsRest(__VLS_195));
                const { default: __VLS_199 } = __VLS_197.slots;
                (__VLS_ctx.__('Back to Course'));
                // @ts-ignore
                [__, courseName,];
                var __VLS_197;
                // @ts-ignore
                [];
                var __VLS_191;
            }
        }
        if (!__VLS_ctx.zenModeEnabled) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center mt-4 md:mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:mt-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "h-6 mr-1" },
                ...{ class: ({
                        'avatar-group overlap': __VLS_ctx.lesson.data.instructors?.length > 1,
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
            /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
            for (const [instructor] of __VLS_vFor((__VLS_ctx.lesson.data.instructors))) {
                const __VLS_200 = UserAvatar;
                // @ts-ignore
                const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
                    user: (instructor),
                }));
                const __VLS_202 = __VLS_201({
                    user: (instructor),
                }, ...__VLS_functionalComponentArgsRest(__VLS_201));
                // @ts-ignore
                [lesson, lesson, zenModeEnabled,];
            }
            if (__VLS_ctx.lesson.data?.instructors) {
                const __VLS_205 = CourseInstructors;
                // @ts-ignore
                const __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205({
                    instructors: (__VLS_ctx.lesson.data.instructors),
                }));
                const __VLS_207 = __VLS_206({
                    instructors: (__VLS_ctx.lesson.data.instructors),
                }, ...__VLS_functionalComponentArgsRest(__VLS_206));
            }
        }
        if (__VLS_ctx.lesson.data.instructor_content &&
            JSON.parse(__VLS_ctx.lesson.data.instructor_content)?.blocks?.length >
                1 &&
            __VLS_ctx.allowInstructorContent()) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-surface-gray-2 p-3 rounded-md mt-6" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-5 font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.__('Instructor Notes'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                id: "instructor-content",
                ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
        }
        else if (__VLS_ctx.lesson.data.instructor_notes) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal mt-8" },
            });
            /** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
            const __VLS_210 = LessonContent;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                content: (__VLS_ctx.lesson.data.instructor_notes),
            }));
            const __VLS_212 = __VLS_211({
                content: (__VLS_ctx.lesson.data.instructor_notes),
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        }
        if (__VLS_ctx.lesson.data.content) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onMouseup: (__VLS_ctx.toggleInlineMenu) },
                ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal mt-8" },
            });
            /** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                id: "editor",
            });
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal mt-8" },
            });
            /** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
            if (__VLS_ctx.lesson.data?.body) {
                const __VLS_215 = LessonContent;
                // @ts-ignore
                const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
                    content: (__VLS_ctx.lesson.data.body),
                    youtube: (__VLS_ctx.lesson.data.youtube),
                    quizId: (__VLS_ctx.lesson.data.quiz_id),
                }));
                const __VLS_217 = __VLS_216({
                    content: (__VLS_ctx.lesson.data.body),
                    youtube: (__VLS_ctx.lesson.data.youtube),
                    quizId: (__VLS_ctx.lesson.data.quiz_id),
                }, ...__VLS_functionalComponentArgsRest(__VLS_216));
            }
        }
        if (__VLS_ctx.lesson.data) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-10 pb-20 pt-5 border-t px-5" },
                ref: "discussionsContainer",
            });
            /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
            if (__VLS_ctx.tabs.length > 1) {
                let __VLS_220;
                /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
                TabButtons;
                // @ts-ignore
                const __VLS_221 = __VLS_asFunctionalComponent1(__VLS_220, new __VLS_220({
                    buttons: (__VLS_ctx.tabs),
                    modelValue: (__VLS_ctx.currentTab),
                    ...{ class: "w-fit mb-10" },
                }));
                const __VLS_222 = __VLS_221({
                    buttons: (__VLS_ctx.tabs),
                    modelValue: (__VLS_ctx.currentTab),
                    ...{ class: "w-fit mb-10" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_221));
                /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
            }
            if (__VLS_ctx.currentTab === 'Notes') {
                const __VLS_225 = Notes;
                // @ts-ignore
                const __VLS_226 = __VLS_asFunctionalComponent1(__VLS_225, new __VLS_225({
                    ...{ 'onUpdateNotes': {} },
                    lesson: (__VLS_ctx.lesson.data?.name),
                    notes: (__VLS_ctx.notes),
                }));
                const __VLS_227 = __VLS_226({
                    ...{ 'onUpdateNotes': {} },
                    lesson: (__VLS_ctx.lesson.data?.name),
                    notes: (__VLS_ctx.notes),
                }, ...__VLS_functionalComponentArgsRest(__VLS_226));
                let __VLS_230;
                const __VLS_231 = ({ updateNotes: {} },
                    { onUpdateNotes: (__VLS_ctx.updateNotes) });
                var __VLS_228;
                var __VLS_229;
            }
            else if (__VLS_ctx.allowDiscussions) {
                const __VLS_232 = Discussions;
                // @ts-ignore
                const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({
                    title: ('Questions'),
                    doctype: ('Course Lesson'),
                    docname: (__VLS_ctx.lesson.data.name),
                    key: (__VLS_ctx.lesson.data.name),
                    emptyStateText: (__VLS_ctx.__('Ask a question to get help from the community.')),
                }));
                const __VLS_234 = __VLS_233({
                    title: ('Questions'),
                    doctype: ('Course Lesson'),
                    docname: (__VLS_ctx.lesson.data.name),
                    key: (__VLS_ctx.lesson.data.name),
                    emptyStateText: (__VLS_ctx.__('Ask a question to get help from the community.')),
                }, ...__VLS_functionalComponentArgsRest(__VLS_233));
            }
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sticky top-10" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-surface-menu-bar py-5 px-2 border-b" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-menu-bar']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.lesson.data.course_title);
    if (__VLS_ctx.user && __VLS_ctx.lesson.data.membership) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm mt-4 mb-2 text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (Math.ceil(__VLS_ctx.lessonProgress));
        (__VLS_ctx.__('completed'));
    }
    if (__VLS_ctx.user && __VLS_ctx.lesson.data.membership) {
        const __VLS_237 = ProgressBar;
        // @ts-ignore
        const __VLS_238 = __VLS_asFunctionalComponent1(__VLS_237, new __VLS_237({
            progress: (__VLS_ctx.lessonProgress),
        }));
        const __VLS_239 = __VLS_238({
            progress: (__VLS_ctx.lessonProgress),
        }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    }
    const __VLS_242 = CourseOutline;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({
        courseName: (__VLS_ctx.courseName),
        key: (__VLS_ctx.chapterNumber),
        getProgress: (__VLS_ctx.lesson.data.membership ? true : false),
        lessonProgress: (__VLS_ctx.lessonProgress),
    }));
    const __VLS_244 = __VLS_243({
        courseName: (__VLS_ctx.courseName),
        key: (__VLS_ctx.chapterNumber),
        getProgress: (__VLS_ctx.lesson.data.membership ? true : false),
        lessonProgress: (__VLS_ctx.lessonProgress),
    }, ...__VLS_functionalComponentArgsRest(__VLS_243));
}
if (__VLS_ctx.lesson.data?.name) {
    const __VLS_247 = InlineLessonMenu;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent1(__VLS_247, new __VLS_247({
        ...{ 'onUpdateNotes': {} },
        modelValue: (__VLS_ctx.showInlineMenu),
        lesson: (__VLS_ctx.lesson.data?.name),
        notes: (__VLS_ctx.notes),
    }));
    const __VLS_249 = __VLS_248({
        ...{ 'onUpdateNotes': {} },
        modelValue: (__VLS_ctx.showInlineMenu),
        lesson: (__VLS_ctx.lesson.data?.name),
        notes: (__VLS_ctx.notes),
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    let __VLS_252;
    const __VLS_253 = ({ updateNotes: {} },
        { onUpdateNotes: (__VLS_ctx.updateNotes) });
    var __VLS_250;
    var __VLS_251;
}
if (__VLS_ctx.showStatsDialog) {
    const __VLS_254 = VideoStatistics;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent1(__VLS_254, new __VLS_254({
        modelValue: (__VLS_ctx.showStatsDialog),
        lessonName: (__VLS_ctx.lesson.data?.name),
        lessonTitle: (__VLS_ctx.lesson.data?.title),
    }));
    const __VLS_256 = __VLS_255({
        modelValue: (__VLS_ctx.showStatsDialog),
        lessonName: (__VLS_ctx.lesson.data?.name),
        lessonTitle: (__VLS_ctx.lesson.data?.title),
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
}
// @ts-ignore
[lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, lesson, __, __, __, courseName, user, user, allowInstructorContent, toggleInlineMenu, tabs, tabs, currentTab, currentTab, notes, notes, updateNotes, updateNotes, allowDiscussions, lessonProgress, lessonProgress, lessonProgress, chapterNumber, showInlineMenu, showStatsDialog, showStatsDialog,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
        chapterNumber: {
            type: String,
            required: true,
        },
        lessonNumber: {
            type: String,
            required: true,
        },
    },
});
export default {};
