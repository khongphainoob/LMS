describe("LMS End-to-End Flow: Course, Batch, Program, AI Grading", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	const ts = Date.now();
	const courseTitle = `E2E Course ${ts}`;
	const courseIntro = `E2E short intro ${ts}`;
	const batchTitle = `E2E Batch ${ts}`;
	const programTitle = `E2E Program ${ts}`;
	const gradingSessionName = `E2E Grading Session ${ts}`;
	const studentEmail = `e2e_student_${ts}@example.com`;
	const studentName = `E2E Student ${ts}`;
	const instructorQuery = "Administrator";

	it("creates course, class, program and validates class-scoped AI grading", () => {
		cy.login("Administrator", "admin");

		// 1) Create a student user via API for enrollment and AI grading
		cy.window().then((win) => {
			cy.request({
				method: "POST",
				url: "/api/method/frappe.client.insert",
				headers: {
					"X-Frappe-CSRF-Token": win.csrf_token,
				},
				body: {
					doc: {
						doctype: "User",
						email: studentEmail,
						username: studentEmail.split("@")[0],
						first_name: studentName,
						send_welcome_email: 0,
						enabled: 1,
					},
				},
				failOnStatusCode: false,
			}).then((res) => {
				expect([200, 417]).to.include(res.status);
			});
		});

		// 2) Create Course
		cy.visit("/lms/courses");
		cy.closeOnboardingModal();
		cy.get("button").contains("Create").click();
		cy.get("span").contains("New Course").click();
		cy.get("label").contains("Title").type(courseTitle);
		cy.get("label").contains("Short Introduction").type(courseIntro);
		cy.get("div[contenteditable=true").first().click().type(`Description for ${courseTitle}`);

		cy.get("label")
			.contains("Instructors")
			.parent()
			.within(() => {
				cy.get("input").click().type(instructorQuery);
				cy.get("input").invoke("attr", "aria-controls").as("instructor_list_id");
			});

		cy.get("@instructor_list_id").then((instructorListId) => {
			cy.get(`[id^=${instructorListId}] [id^=headlessui-combobox-option-]`)
				.first()
				.click({ force: true });
		});

		cy.button("Create").last().click();
		cy.url().should("include", "/lms/courses/");
		cy.url().then((url) => {
			const createdCourseName = (url.split("/").pop() || "").split("#")[0];
			cy.wrap(createdCourseName).as("createdCourseName");
		});
		cy.get("label").contains("Published").click();
		cy.button("Save").click();

		// 3) Create Batch and enroll student
		cy.visit("/lms/batches");
		cy.closeOnboardingModal();
		cy.get("button").contains("Create").click();
		cy.get("span").contains("New Batch").click();
		cy.get("label").contains("Title").type(batchTitle);
		cy.get("label").contains("Start Date").type("2030-10-01");
		cy.get("label").contains("End Date").type("2030-10-31");
		cy.get("label").contains("Start Time").type("10:00");
		cy.get("label").contains("End Time").type("11:00");
		cy.get("label").contains("Timezone").type("IST");
		cy.get("label").contains("Seat Count").type("10");
		cy.get("label").contains("Published").click();
		cy.get("label").contains("Short Description").type(`Short desc for ${batchTitle}`);
		cy.get("div[contenteditable=true").first().click().type(`Description for ${batchTitle}`);

		cy.get("label")
			.contains("Instructors")
			.parent()
			.within(() => {
				cy.get("input").click().type(instructorQuery);
				cy.get("input").invoke("attr", "aria-controls").as("batch_instructor_list_id");
			});

		cy.get("@batch_instructor_list_id").then((listId) => {
			cy.get(`[id^=${listId}] [id^=headlessui-combobox-option-]`)
				.first()
				.click({ force: true });
		});

		cy.button("Save").click();
		cy.url().should("include", "/lms/batches/");

		cy.get("button:visible").contains("Manage Batch").click();
		cy.get("button").contains("Students").click();
		cy.get("button").contains("Add").click();
		cy.get("div[role='dialog']").first().find("button").eq(1).click();
		cy.get("input[id^='headlessui-combobox-input-v-']").type(studentEmail);
		cy.contains("div", studentEmail).click();
		cy.get("button").contains("Submit").click();
		cy.contains("body", studentEmail).should("be.visible");

		// 4) Create Program with created course + member (API-backed)
		cy.get("@createdCourseName").then((createdCourseName) => {
			cy.window().then((win) => {
				cy.request({
					method: "POST",
					url: "/api/method/frappe.client.insert",
					headers: {
						"X-Frappe-CSRF-Token": win.csrf_token,
					},
					body: {
						doc: {
							doctype: "LMS Program",
							title: programTitle,
							published: 1,
							course_count: 1,
							member_count: 1,
							program_courses: [{ course: createdCourseName }],
							program_members: [{ member: studentEmail }],
						},
					},
				});
			});
		});

		// 5) AI Grading exam session must select class and student from class
		cy.visit("/lms/ai-grading/essay/config/exam");
		cy.closeOnboardingModal();
		cy.contains("button", "Create new session").click();
		cy.get("[role='dialog'] input").first().type(gradingSessionName);
		cy.get("[role='dialog'] select").first().select(batchTitle);
		cy.contains("button", "Create & Open").click();
		cy.url().should("include", "/lms/ai-grading/essay/exam/workspace/");

		cy.intercept("POST", "**/api/method/lms.lms.api.search_ai_grading_students").as("searchStudents");
		cy.contains("button", "Add Student").click();
		cy.get("[role='dialog'] input").eq(1).click().type(studentEmail);
		cy.wait("@searchStudents").its("request.body").should("contain", "session");
		cy.contains("button", studentEmail).click();
		cy.contains("button", "Add & Start Grading").click();

		cy.contains("div", studentName).should("be.visible");
	});
});
