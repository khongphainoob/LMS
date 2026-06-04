import { createRouter, createWebHistory } from 'vue-router'
import { usersStore } from './stores/user'
import { sessionStore } from './stores/session'
import { useSettings } from './stores/settings'
import { getLmsBasePath } from './utils/basePath'

const routes = [
  {
    path: '/ai-dashboard',
    name: 'AIDashboard',
    component: () => import('./pages/AI/Dashboard/AIDashboard.vue'),
    meta: { title: 'AI Observability Dashboard' }
  },
	{
		path: '/',
		name: 'Home',
		component: () => import('@/pages/Home/Home.vue'),
	},
	{
		path: '/courses',
		name: 'Courses',
		component: () => import('@/pages/Courses/Courses.vue'),
	},
	{
		path: '/courses/:courseName',
		name: 'CourseDetail',
		component: () => import('@/pages/Courses/CourseDetail.vue'),
		props: true,
	},
	{
		path: '/courses/:courseName/learn/:chapterNumber-:lessonNumber',
		name: 'Lesson',
		component: () => import('@/pages/Lesson.vue'),
		props: true,
	},
	{
		path: '/courses/:courseName/certification',
		name: 'CourseCertification',
		component: () => import('@/pages/Courses/CourseCertification.vue'),
		props: true,
	},
	{
		path: '/courses/:courseName/learn/:chapterName',
		name: 'SCORMChapter',
		component: () => import('@/pages/SCORMChapter.vue'),
		props: true,
	},
	{
		path: '/batches',
		name: 'Batches',
		component: () => import('@/pages/Batches.vue'),
	},
	{
		path: '/batches/details/:batchName',
		name: 'BatchDetail',
		component: () => import('@/pages/BatchDetail.vue'),
		props: true,
	},
	{
		path: '/jobs',
		name: 'Jobs',
		component: () => import('@/pages/Jobs.vue'),
	},
	{
		path: '/job-openings/:job',
		name: 'JobDetail',
		component: () => import('@/pages/JobDetail.vue'),
		props: true,
	},
	{
		path: '/job-openings/:job/applications',
		name: 'JobApplications',
		component: () => import('@/pages/JobApplications.vue'),
		props: true,
	},
	{
		path: '/courses/:courseName/learn/:chapterNumber-:lessonNumber/edit',
		name: 'LessonForm',
		component: () => import('@/pages/LessonForm.vue'),
		props: true,
	},
	{
		path: '/batches/:batchName',
		name: 'Batch',
		component: () => import('@/pages/Batch.vue'),
		props: true,
	},
	{
		path: '/batches/:batchName/edit',
		name: 'BatchForm',
		component: () => import('@/pages/BatchForm.vue'),
		props: true,
	},
	{
		path: '/job-opening/:jobName/edit',
		name: 'JobForm',
		component: () => import('@/pages/JobForm.vue'),
		props: true,
	},
	{
		path: '/certified-participants',
		name: 'CertifiedParticipants',
		component: () => import('@/pages/CertifiedParticipants.vue'),
	},
	{
		path: '/notifications',
		name: 'Notifications',
		component: () => import('@/pages/Notifications.vue'),
	},
	{
		path: '/badges/:badgeName/:email',
		name: 'Badge',
		component: () => import('@/pages/Badge.vue'),
		props: true,
	},
	{
		path: '/quizzes',
		name: 'Quizzes',
		component: () => import('@/pages/Quizzes.vue'),
	},
	{
		path: '/quizzes/:quizID',
		name: 'QuizForm',
		component: () => import('@/pages/QuizForm.vue'),
		props: true,
	},
	{
		path: '/quiz/:quizID',
		name: 'QuizPage',
		component: () => import('@/pages/QuizPage.vue'),
		props: true,
	},
	{
		path: '/quiz-submissions/:quizID',
		name: 'QuizSubmissionList',
		component: () => import('@/pages/QuizSubmissionList.vue'),
		props: true,
	},
	{
		path: '/quiz-submission/:submission',
		name: 'QuizSubmission',
		component: () => import('@/pages/QuizSubmission.vue'),
		props: true,
	},
	{
		path: '/user/:username',
		name: 'Profile',
		component: () => import('@/pages/Profile.vue'),
		props: true,
		redirect: { name: 'ProfileAbout' },
		children: [
			{
				name: 'ProfileAbout',
				path: '',
				component: () => import('@/pages/ProfileAbout.vue'),
			},
			{
				name: 'ProfileCertificates',
				path: 'certificates',
				component: () => import('@/pages/ProfileCertificates.vue'),
			},
			{
				name: 'ProfileRoles',
				path: 'roles',
				component: () => import('@/pages/ProfileRoles.vue'),
			},
			{
				name: 'ProfileEvaluator',
				path: 'slots',
				component: () => import('@/pages/ProfileEvaluator.vue'),
			},
			{
				name: 'ProfileEvaluationSchedule',
				path: 'schedule',
				component: () =>
					import('@/pages/ProfileEvaluationSchedule.vue'),
			},
		],
	},
	{
		path: '/programs',
		name: 'Programs',
		component: () => import('@/pages/Programs/Programs.vue'),
	},
	{
		path: '/programs/:programName',
		name: 'ProgramDetail',
		component: () => import('@/pages/Programs/ProgramDetail.vue'),
		props: true,
	},
	{
		path: '/assignments',
		name: 'Assignments',
		component: () => import('@/pages/Assignments.vue'),
	},
	{
		path: '/gradingbook/:courseName?/:batchName?',
		name: 'GradingBook',
		component: () => import('@/pages/GradingBook.vue'),
	},
	{
		path: '/ai-integration/quiz-creator',
		name: 'AIQuizDashboard',
		component: () => import('@/pages/AI/Quiz/QuizDashboard.vue'),
	},
	{
		path: '/ai-integration/quiz-creator/new',
		name: 'AIQuizForm',
		component: () => import('@/pages/AI/Quiz/QuizForm.vue'),
	},
	{
		path: '/ai-integration/quiz-creator/:quizID',
		name: 'AIQuizDetail',
		component: () => import('@/pages/AI/Quiz/QuizDetail.vue'),
		props: true,
	},
	{
		path: '/ai-integration/exam-generator',
		name: 'ExamDashboard',
		component: () => import('@/pages/AI/Exam/ExamDashboard.vue'),
	},
	{
		path: '/ai-integration/exam-generator/new',
		name: 'ExamForm',
		component: () => import('@/pages/AI/Exam/ExamForm.vue'),
	},
	{
		path: '/ai-integration/exam-generator/:examID',
		name: 'ExamDetail',
		component: () => import('@/pages/AI/Exam/ExamDetail.vue'),
		props: true,
	},
	{
		path: '/ai-integration/exam-generator/:examID/preview',
		name: 'ExamExportPreview',
		component: () => import('@/pages/AI/Exam/ExamExportPreview.vue'),
		props: true,
	},
	{
		path: '/ai-integration',
		name: 'AIIntegration',
		component: () => import('@/pages/AI/AIIntegration.vue'),
	},
	{
		path: '/ai-helper',
		name: 'StudentAIHelper',
		component: () => import('@/pages/AI/Chatbot/StudentAIHelper.vue'),
	},
	{
		path: '/socratic-tutor',
		name: 'SocraticTutor',
		component: () => import('@/pages/AI/Chatbot/Socratic_tutor.vue'),
	},
	{
		path: '/socratic-tutor/workspace/:sessionKey',
		name: 'SocraticTutorWorkspace',
		component: () => import('@/pages/AI/Chatbot/SocraticTutorWorkspace.vue'),
		props: true,
	},
	{
		path: '/ai-student-score-dashboard',
		name: 'StudentScoreDashboard',
		component: () => import('@/pages/AI/StudentScoreDashboard.vue'),
	},
	{
		path: '/documents',
		name: 'Documents',
		component: () => import('@/pages/Documents.vue'),
	},
	{
		path: '/lesson-planning',
		name: 'LessonPlanning',
		component: () => import('@/pages/LessonPlanning.vue'),
	},
	{
		path: '/ai-grading',
		name: 'AIGrading',
		component: () => import('@/pages/AI/AIGrading.vue'),
		redirect: { name: 'AIGradingEssay' },
		children: [
			{
				path: 'help',
				name: 'AIGradingHelp',
				component: () => import('@/pages/AI/AIGrading/AIGradingHelpCenter.vue'),
			},
			{
				path: 'rubric-builder',
				name: 'AIGradingRubric',
				component: () => import('@/pages/AI/AIGrading/RubricBuilder.vue'),
			},
			{
				path: 'objective',
				name: 'AIGradingObjective',
				component: () => import('@/pages/AI/AIGrading/ObjectiveGrading.vue'),
			},
			{
				path: 'objective/workspace/:sessionSlug',
				name: 'MCQGradingWorkspace',
				component: () => import('@/pages/AI/AIGrading/MCQGradingWorkspace.vue'),
				props: true,
			},
			{
				path: 'essay',
				name: 'AIGradingEssay',
				component: () => import('@/pages/AI/AIGrading/AIGradingEssayHome.vue'),
			},
			{
				path: 'essay/config/:type',
				name: 'AIGradingEssayConfig',
				component: () => import('@/pages/AI/AIGrading/AIGradingEssayConfig.vue'),
				props: true,
			},
			{
				path: 'essay/:type/workspace/:sessionId/:sessionSlug',
				name: 'AIGradingEssayWorkspaceLegacy',
				redirect: (to) => ({
					name: 'AIGradingEssayWorkspace',
					params: {
						type: to.params.type,
						sessionSlug: to.params.sessionSlug,
					},
					query: to.query,
				}),
			},
			{
				path: 'essay/:type/workspace/:sessionSlug',
				name: 'AIGradingEssayWorkspace',
				component: () => import('@/pages/AI/AIGrading/AIGradingEssayWorkspace.vue'),
				props: true,
			},
			{
				path: 'admin',
				name: 'AIGradingAdmin',
				component: () => import('@/pages/AI/AIGrading/AIGradingAdmin.vue'),
			},
			{
				path: 'essay/:type/statistics/:sessionSlug',
				name: 'AIGradingSessionStatistics',
				component: () => import('@/pages/AI/AIGrading/AIGradingSessionStatistics.vue'),
				props: true,
			},
			{
				path: 'rubric/:rubricName',
				name: 'AIGradingRubricDetail',
				component: () => import('@/pages/AI/AIGrading/RubricDetail.vue'),
				props: true,
			},
		],
	},
	{
		path: '/assignment-submission/:assignmentID/:submissionName',
		name: 'AssignmentSubmission',
		component: () => import('@/pages/AssignmentSubmission.vue'),
		props: true,
	},
	{
		path: '/assignment-submissions',
		name: 'AssignmentSubmissionList',
		component: () => import('@/pages/AssignmentSubmissionList.vue'),
	},
	{
		path: '/persona',
		name: 'PersonaForm',
		component: () => import('@/pages/PersonaForm.vue'),
	},
	{
		path: '/programming-exercises',
		name: 'ProgrammingExercises',
		component: () =>
			import('@/pages/ProgrammingExercises/ProgrammingExercises.vue'),
	},
	{
		path: '/programming-exercises/submissions',
		name: 'ProgrammingExerciseSubmissions',
		component: () =>
			import(
				'@/pages/ProgrammingExercises/ProgrammingExerciseSubmissions.vue'
			),
		props: true,
	},
	{
		path: '/programming-exercises/:exerciseID/submission/:submissionID',
		name: 'ProgrammingExerciseSubmission',
		component: () =>
			import(
				'@/pages/ProgrammingExercises/ProgrammingExerciseSubmission.vue'
			),
		props: true,
	},
	{
		path: '/search',
		name: 'Search',
		component: () => import('@/pages/Search/Search.vue'),
	},
	{
		path: '/data-import',
		name: 'DataImportList',
		component: () => import('@/pages/DataImport.vue'),
	},
	{
		path: '/data-import/doctype/:doctype',
		name: 'NewDataImport',
		component: () => import('@/pages/DataImport.vue'),
		props: true,
	},
	{
		path: '/data-import/:importName',
		name: 'DataImport',
		component: () => import('@/pages/DataImport.vue'),
		props: true,
	},
	{
		path: '/game-center',
		name: 'GameCenter',
		redirect: { name: 'GameCenterTab', params: { tab: 'overview' } }
	},
	{
		path: '/game-center/play/:gameId',
		name: 'GameCenterGame',
		component: () => import('@/pages/GameCenter.vue'),
	},
	{
		path: '/game-center/:tab(overview|games|leaderboard|badges|manage)',
		name: 'GameCenterTab',
		component: () => import('@/pages/GameCenter.vue'),
	},
	{
		path: '/game-center/lobby',
		name: 'GameLobby',
		component: () => import('@/pages/GameCenter/GameLobby.vue'),
	},
]

let router = createRouter({
	history: createWebHistory(`/${getLmsBasePath()}`),
	routes,
})

router.beforeEach(async (to, from, next) => {
	const { userResource } = usersStore()
	let { isLoggedIn } = sessionStore()
	const { settings } = useSettings()

	try {
		if (isLoggedIn) {
			await userResource.promise
		}
	} catch (error) {
		isLoggedIn = false
	}

	if (!isLoggedIn) {
		if (to.name == 'Home') router.push({ name: 'Courses' })

		await settings.promise
		if (!settings.data.allow_guest_access) {
			window.location.href = '/login'
			return
		}
	}

	if (to.name === 'AIDashboard') {
		if (!userResource.data?.is_system_manager) {
			return next({ name: 'Home' })
		}
	}

	await settings.promise
	const aiRouteMap = {
		'AIIntegration': 'ai_integration',
		'AIGrading': 'ai_grading',
		'AIGradingHelp': 'ai_grading',
		'AIGradingRubric': 'ai_grading',
		'AIGradingObjective': 'ai_grading',
		'MCQGradingWorkspace': 'ai_grading',
		'AIGradingEssay': 'ai_grading',
		'AIGradingEssayConfig': 'ai_grading',
		'AIGradingEssayWorkspaceLegacy': 'ai_grading',
		'AIGradingEssayWorkspace': 'ai_grading',
		'AIGradingAdmin': 'ai_grading',
		'AIGradingSessionStatistics': 'ai_grading',
		'AIGradingRubricDetail': 'ai_grading',
		'GradingBook': 'grading_book',
		'LessonPlanning': 'enable_lesson_planning',
		'AIQuizDashboard': 'enable_quiz_creator',
		'AIQuizForm': 'enable_quiz_creator',
		'AIQuizDetail': 'enable_quiz_creator',
		'ExamDashboard': 'enable_exam_generator',
		'ExamForm': 'enable_exam_generator',
		'ExamDetail': 'enable_exam_generator',
		'ExamExportPreview': 'enable_exam_generator',
		'Documents': 'enable_documents',
		'StudentScoreDashboard': 'enable_score_insights',
		'StudentAIHelper': 'enable_smart_chatbot',
		'SocraticTutor': 'enable_socratic_tutor',
		'SocraticTutorWorkspace': 'enable_socratic_tutor',
	}

	if (aiRouteMap[to.name]) {
		const settingKey = aiRouteMap[to.name]
		if (parseInt(settings.data?.[settingKey]) === 0) {
			return next({ name: 'Home' })
		}

		const instructorRoutes = [
			'AIGrading', 'AIGradingHelp', 'AIGradingRubric', 'AIGradingObjective', 'MCQGradingWorkspace',
			'AIGradingEssay', 'AIGradingEssayConfig', 'AIGradingEssayWorkspaceLegacy', 'AIGradingEssayWorkspace',
			'AIGradingAdmin', 'AIGradingSessionStatistics', 'AIGradingRubricDetail', 'GradingBook',
			'LessonPlanning',
			'AIQuizDashboard', 'AIQuizForm', 'AIQuizDetail',
			'ExamDashboard', 'ExamForm', 'ExamDetail', 'ExamExportPreview'
		]

		if (instructorRoutes.includes(to.name)) {
			const hasAccess = userResource.data?.is_instructor || userResource.data?.is_moderator || userResource.data?.is_system_manager
			if (!hasAccess) {
				return next({ name: 'Home' })
			}
		}
	}

	return next()
})

export default router
