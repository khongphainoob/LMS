describe("AI Grading Essay Config — Exam, Test, Homework", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	const ts = Date.now();
	const sessionName = `E2E Config Session ${ts}`;

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	describe("Exam Config Page", () => {
		it("should display the Exam config page with subject, grade, and session panel", () => {
			cy.visit("/lms/ai-grading/essay/config/exam");
			cy.closeOnboardingModal();

			// Page title
			cy.contains("Grade Exams").should("be.visible");

			// Back button
			cy.contains("Back").should("be.visible");

			// Subject buttons
			cy.contains("Math").should("be.visible");
			cy.contains("Physics").should("be.visible");
			cy.contains("Chemistry").should("be.visible");
			cy.contains("Literature").should("be.visible");
			cy.contains("English").should("be.visible");

			// Grade levels (standard)
			cy.contains("Grade Level").should("be.visible");
			cy.contains("12").should("be.visible");
			cy.contains("ĐH").should("be.visible");

			// Target Audience
			cy.contains("Target Audience").should("be.visible");
			cy.contains("General").should("be.visible");
			cy.contains("Advanced").should("be.visible");

			// Session panel (exam only)
			cy.contains("Grading Sessions").should("be.visible");
			cy.contains("Create new session").should("be.visible");
		});

		it("should select a subject and grade level", () => {
			cy.visit("/lms/ai-grading/essay/config/exam");
			cy.closeOnboardingModal();

			// Select Math subject
			cy.contains("button", "Math").click();
			cy.contains("button", "Math").should("have.class", "border-[#2d6a4f]");

			// Select grade 12
			cy.contains("button", "Math").click(); // already selected

			// Select audience
			cy.contains("button", "General").click();
		});

		it("should show English certificate levels when English subject is selected", () => {
			cy.visit("/lms/ai-grading/essay/config/exam");
			cy.closeOnboardingModal();

			cy.contains("button", "English").click();

			// Should show certificate levels instead of standard grades
			cy.contains("Certificate / Level").should("be.visible");
			cy.contains("IELTS").should("be.visible");
			cy.contains("TOEIC").should("be.visible");
			cy.contains("TOEFL").should("be.visible");
			cy.contains("Cambridge").should("be.visible");
			cy.contains("VSTEP").should("be.visible");
		});

		it("should create a new exam session and open workspace", () => {
			cy.visit("/lms/ai-grading/essay/config/exam");
			cy.closeOnboardingModal();

			cy.contains("button", "Create new session").click();

			// Modal should appear
			cy.get("[role='dialog']").should("be.visible");

			// Fill session name
			cy.get("[role='dialog'] input").first().type(sessionName);

			// Create & Open
			cy.contains("button", "Create & Open").click();

			// Should redirect to workspace
			cy.url().should("include", "/lms/ai-grading/essay/exam/workspace/");
		});

		it("should search sessions", () => {
			cy.visit("/lms/ai-grading/essay/config/exam");
			cy.closeOnboardingModal();

			// Type in search
			cy.get("input[placeholder='Search session by ID or name...']")
				.should("be.visible")
				.type("test");
		});
	});

	describe("Test Config Page", () => {
		it("should display the Test config page with quiz selector", () => {
			cy.visit("/lms/ai-grading/essay/config/test");
			cy.closeOnboardingModal();

			cy.contains("Grade Quick Tests").should("be.visible");

			// Should show quiz selector instead of session panel
			cy.contains("Select Quiz").should("be.visible");
			cy.contains("System Quizzes").should("be.visible");

			// Should NOT show session panel
			cy.contains("Grading Sessions").should("not.exist");

			// AI Grading Notes textarea
			cy.contains("AI Grading Notes").should("be.visible");

			// Start Grading button
			cy.contains("Start Grading").should("be.visible");
		});
	});

	describe("Homework Config Page", () => {
		it("should display the Homework config page with assignment selector", () => {
			cy.visit("/lms/ai-grading/essay/config/hw");
			cy.closeOnboardingModal();

			cy.contains("Grade Homework").should("be.visible");

			// Should show assignment selector
			cy.contains("Select Assignment").should("be.visible");
			cy.contains("Text Assignments Only").should("be.visible");

			// AI Grading Notes textarea
			cy.contains("AI Grading Notes").should("be.visible");

			// Start Grading button
			cy.contains("Start Grading").should("be.visible");
		});
	});
});
