describe("AI Grading Essay Workspace", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	const ts = Date.now();
	const sessionName = `E2E Workspace Session ${ts}`;
	const studentEmail = `ws_student_${ts}@example.com`;
	const studentName = `WS Student ${ts}`;
	const batchTitle = `WS Batch ${ts}`;

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	// Helper: create a batch + student + session, then navigate to workspace
	function setupWorkspace() {
		// 1. Create student user via API
		cy.window().then((win) => {
			cy.request({
				method: "POST",
				url: "/api/method/frappe.client.insert",
				headers: { "X-Frappe-CSRF-Token": win.csrf_token },
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
			});
		});

		// 2. Create batch
		cy.window().then((win) => {
			cy.request({
				method: "POST",
				url: "/api/method/frappe.client.insert",
				headers: { "X-Frappe-CSRF-Token": win.csrf_token },
				body: {
					doc: {
						doctype: "LMS Batch",
						title: batchTitle,
						start_date: "2030-10-01",
						end_date: "2030-10-31",
						start_time: "10:00:00",
						end_time: "11:00:00",
						timezone: "Asia/Ho_Chi_Minh",
						seat_count: 10,
						published: 1,
					},
				},
			});
		});

		// 3. Create session via config page
		cy.visit("/lms/ai-grading/essay/config/exam");
		cy.closeOnboardingModal();
		cy.contains("button", "Create new session").click();
		cy.get("[role='dialog'] input").first().type(sessionName);
		cy.get("[role='dialog'] select").first().select(batchTitle);
		cy.contains("button", "Create & Open").click();
		cy.url().should("include", "/lms/ai-grading/essay/exam/workspace/");
	}

	it("should load workspace with top bar, 3-column layout", () => {
		setupWorkspace();

		// Top bar elements
		cy.contains("Back").should("be.visible");
		cy.contains("Graded").should("be.visible");
		cy.contains("Needs review").should("be.visible");
		cy.contains("Export Grades").should("be.visible");
		cy.contains("Save All").should("be.visible");

		// Left: Submissions panel
		cy.contains("Submissions").should("be.visible");
		cy.contains("Grade All").should("be.visible");
		cy.get("input[placeholder='Search by name, ID...']").should("be.visible");

		// Filters
		cy.contains("All").should("be.visible");
		cy.contains("Pending").should("be.visible");
		cy.contains("Flag").should("be.visible");

		// Add Student button
		cy.contains("Add Student").should("be.visible");

		// Center: Paper view area
		cy.contains("Zoom").should("be.visible");
		cy.contains("Annotate").should("be.visible");
		cy.contains("Flag").should("be.visible");
		cy.contains("Approve & Next").should("be.visible");

		// Right: Grade panel
		cy.contains("AI Suggested Score").should("be.visible");
		cy.contains("Confidence").should("be.visible");
		cy.contains("AI Notes").should("be.visible");
		cy.contains("Grading Criteria").should("be.visible");
		cy.contains("Teacher Comments").should("be.visible");
		cy.contains("Rate AI Grading").should("be.visible");

		// Bottom navigation buttons
		cy.contains("Save & Update").should("be.visible");
		cy.contains("Next Submission").should("be.visible");
	});

	it("should add a student via modal", () => {
		setupWorkspace();

		cy.contains("button", "Add Student").click();

		// Modal should appear
		cy.get("[role='dialog']").should("be.visible");
		cy.contains("Add New Student").should("be.visible");
		cy.contains("Student Name").should("be.visible");
		cy.contains("Student SBD").should("be.visible");
		cy.contains("Photo / Paper Image").should("be.visible");

		// Search for student
		cy.intercept("POST", "**/api/method/lms.lms.api.search_ai_grading_students").as(
			"searchStudents"
		);

		cy.get("[role='dialog'] input").eq(1).click().type(studentEmail);
		cy.wait("@searchStudents").its("request.body").should("contain", "session");

		cy.contains("button", studentEmail).click();
		cy.contains("button", "Add & Start Grading").click();

		// Student should appear in the submissions list
		cy.contains("div", studentName).should("be.visible");
	});

	it("should navigate submissions list with Back / Next buttons", () => {
		setupWorkspace();

		// Add 2 students
		for (let i = 0; i < 2; i++) {
			const email = `ws_nav_student_${ts}_${i}@example.com`;
			const name = `WS Nav Student ${i}`;

			cy.window().then((win) => {
				cy.request({
					method: "POST",
					url: "/api/method/frappe.client.insert",
					headers: { "X-Frappe-CSRF-Token": win.csrf_token },
					body: {
						doc: {
							doctype: "User",
							email,
							username: email.split("@")[0],
							first_name: name,
							send_welcome_email: 0,
							enabled: 1,
						},
					},
					failOnStatusCode: false,
				});
			});

			cy.contains("button", "Add Student").click();
			cy.intercept("POST", "**/api/method/lms.lms.api.search_ai_grading_students").as(
				`searchNav${i}`
			);
			cy.get("[role='dialog'] input").eq(1).click().type(email);
			cy.wait(`@searchNav${i}`);
			cy.contains("button", email).click();
			cy.contains("button", "Add & Start Grading").click();
		}

		// Navigate using Back/Next
		cy.contains("button", "Next Submission").first().click();
		cy.contains("button", "Back").first().click();
	});

	it("should use filter buttons (All, Pending, Flag)", () => {
		setupWorkspace();

		// Click each filter
		cy.contains("button", "All").first().click();
		cy.contains("button", "Pending").first().click();
		cy.contains("button", "Flag").first().click();
	});

	it("should show and use the Add Student modal with SBD field", () => {
		setupWorkspace();

		cy.contains("button", "Add Student").click();

		// Fill SBD
		cy.get("[role='dialog']").within(() => {
			cy.get("label")
				.contains("Student SBD")
				.siblings("input")
				.first()
				.type("12A1-023");
		});
	});

	it("should display AI Rating buttons (Satisfied / Dissatisfied)", () => {
		setupWorkspace();

		cy.contains("button", "Satisfied").should("be.visible");
		cy.contains("button", "Dissatisfied").should("be.visible");
	});

	it("should show dissatisfaction reason textarea when clicking Dissatisfied", () => {
		setupWorkspace();

		cy.contains("button", "Dissatisfied").click();
		cy.get("textarea[placeholder='Reason for dissatisfaction...']").should("be.visible");
	});

	it("should navigate back to config page", () => {
		setupWorkspace();

		cy.contains("button", "Back").first().click();
		cy.url().should("include", "/lms/ai-grading/essay/config/exam");
	});
});
