describe("AI Grading — Objective / Multiple Choice", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	it("should display the Objective Grading home page with hero, stats, and action cards", () => {
		cy.visit("/lms/ai-grading/multiple-choice");
		cy.closeOnboardingModal();

		// Hero section
		cy.contains("Smart Multiple Choice Grading").should("be.visible");
		cy.contains("Auto-evaluate MCQ submissions").should("be.visible");

		// Stats cards
		cy.contains("Queued Submissions").should("be.visible");
		cy.contains("Avg. Accuracy").should("be.visible");
		cy.contains("Flagged Answers").should("be.visible");

		// Action cards
		cy.contains("Batch Grading").should("be.visible");
		cy.contains("Review Flags").should("be.visible");
		cy.contains("Analytics & Export").should("be.visible");

		// Buttons on cards
		cy.contains("Start Batch Grading").should("be.visible");
		cy.contains("Review Now").should("be.visible");
		cy.contains("View Analytics").should("be.visible");
	});

	it("should have Support link visible", () => {
		cy.visit("/lms/ai-grading/multiple-choice");
		cy.closeOnboardingModal();

		cy.contains("Grading Guide & Support").should("be.visible");
	});
});
