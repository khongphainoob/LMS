describe("AI Grading Session Statistics", () => {
	Cypress.on("uncaught:exception", (err) => {
		if (String(err?.message || "").includes("get_batch_students TypeError")) {
			return false;
		}
	});

	const ts = Date.now();
	const sessionName = `E2E Stats Session ${ts}`;
	const batchTitle = `Stats Batch ${ts}`;

	beforeEach(() => {
		cy.login("Administrator", "admin");
	});

	function setupSessionWithSlug() {
		// Create batch
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

		// Create session via config page
		cy.visit("/lms/ai-grading/essay/config/exam");
		cy.closeOnboardingModal();
		cy.contains("button", "Create new session").click();
		cy.get("[role='dialog'] input").first().type(sessionName);
		cy.get("[role='dialog'] select").first().select(batchTitle);
		cy.contains("button", "Create & Open").click();
		cy.url().should("include", "/lms/ai-grading/essay/exam/workspace/");
	}

	it("should display session statistics page from workspace config", () => {
		setupSessionWithSlug();

		// Navigate to statistics from config page
		cy.visit("/lms/ai-grading/essay/config/exam");
		cy.closeOnboardingModal();

		// Find and click Statistics button on the session
		cy.get("button").contains("Statistics").first().click();
		cy.url().should("include", "/lms/ai-grading/essay/exam/statistics/");

		// Page title
		cy.contains("Session Statistics").should("be.visible");
		cy.contains("Detailed insights and performance analysis").should("be.visible");

		// Stats cards
		cy.contains("Grading Progress").should("be.visible");
		cy.contains("Average Score").should("be.visible");
		cy.contains("High Scores (≥8)").should("be.visible");
		cy.contains("Low Scores (<5)").should("be.visible");

		// Score Distribution chart
		cy.contains("Score Distribution").should("be.visible");

		// Challenging Questions section
		cy.contains("Challenging Questions").should("be.visible");

		// At-Risk Students section
		cy.contains("At-Risk Students (< 5.0)").should("be.visible");

		// Back button
		cy.contains("Back to Config").should("be.visible");
	});
});
