import frappe
import json

def execute():
	frappe.reload_doc("LMS", "doctype", "LMS Gamification Question Bank")
	
	questions = [
		# Tech - MCQ
		{"type": "mcq", "text": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], "correct": "0", "cat": "Tech", "diff": "Easy"},
		{"type": "mcq", "text": "Which tag is used for creating a hyperlink?", "options": ["<link>", "<a>", "<href>", "<url>"], "correct": "1", "cat": "Tech", "diff": "Easy"},
		{"type": "mcq", "text": "What does CSS stand for?", "options": ["Colorful Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets"], "correct": "2", "cat": "Tech", "diff": "Easy"},
		{"type": "mcq", "text": "Which HTML tag is used to define an internal style sheet?", "options": ["<script>", "<style>", "<css>", "<design>"], "correct": "1", "cat": "Tech", "diff": "Easy"},
		{"type": "mcq", "text": "In JavaScript, how do you write 'Hello World' in an alert box?", "options": ["msgBox('Hello World');", "alertBox('Hello World');", "msg('Hello World');", "alert('Hello World');"], "correct": "3", "cat": "Tech", "diff": "Medium"},
		{"type": "mcq", "text": "Which of these is a JavaScript framework?", "options": ["Django", "Laravel", "Vue", "Flask"], "correct": "2", "cat": "Tech", "diff": "Medium"},
		{"type": "mcq", "text": "What does SQL stand for?", "options": ["Structured Query Language", "Strong Question Language", "Structured Question Language", "System Query Language"], "correct": "0", "cat": "Tech", "diff": "Medium"},
		{"type": "mcq", "text": "Which programming language is known as the 'mother of all languages'?", "options": ["Java", "C", "Python", "Assembly"], "correct": "1", "cat": "Tech", "diff": "Hard"},
		
		# Science - MCQ
		{"type": "mcq", "text": "Which planet is known as the Red Planet?", "options": ["Venus", "Mars", "Jupiter", "Saturn"], "correct": "1", "cat": "Science", "diff": "Easy"},
		{"type": "mcq", "text": "What is the chemical symbol for gold?", "options": ["Go", "Gd", "Au", "Ag"], "correct": "2", "cat": "Science", "diff": "Easy"},
		{"type": "mcq", "text": "What is the hardest natural substance on Earth?", "options": ["Gold", "Iron", "Diamond", "Platinum"], "correct": "2", "cat": "Science", "diff": "Easy"},
		{"type": "mcq", "text": "What gas do plants absorb from the atmosphere?", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], "correct": "1", "cat": "Science", "diff": "Easy"},
		{"type": "mcq", "text": "What is the speed of light in a vacuum?", "options": ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], "correct": "0", "cat": "Science", "diff": "Medium"},
		{"type": "mcq", "text": "Who developed the theory of relativity?", "options": ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"], "correct": "2", "cat": "Science", "diff": "Medium"},
		
		# Math - MCQ
		{"type": "mcq", "text": "What is 15% of 200?", "options": ["20", "25", "30", "35"], "correct": "2", "cat": "Math", "diff": "Easy"},
		{"type": "mcq", "text": "What is the square root of 144?", "options": ["10", "11", "12", "14"], "correct": "2", "cat": "Math", "diff": "Easy"},
		{"type": "mcq", "text": "What is the value of Pi to two decimal places?", "options": ["3.12", "3.14", "3.16", "3.18"], "correct": "1", "cat": "Math", "diff": "Easy"},
		{"type": "mcq", "text": "Solve for x: 2x + 5 = 15", "options": ["5", "10", "15", "20"], "correct": "0", "cat": "Math", "diff": "Medium"},
		{"type": "mcq", "text": "What is the next prime number after 7?", "options": ["8", "9", "10", "11"], "correct": "3", "cat": "Math", "diff": "Medium"},
		
		# Art & General - MCQ
		{"type": "mcq", "text": "Who painted the Mona Lisa?", "options": ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], "correct": "2", "cat": "Art", "diff": "Easy"},
		{"type": "mcq", "text": "Which language has the most native speakers?", "options": ["English", "Spanish", "Hindi", "Mandarin Chinese"], "correct": "3", "cat": "General", "diff": "Medium"},
		{"type": "mcq", "text": "In which year did World War II end?", "options": ["1943", "1944", "1945", "1946"], "correct": "2", "cat": "History", "diff": "Medium"},
		{"type": "mcq", "text": "What is the capital of Japan?", "options": ["Seoul", "Beijing", "Tokyo", "Bangkok"], "correct": "2", "cat": "General", "diff": "Easy"},
		
		# Word Scramble
		{"type": "word_scramble", "text": "Unscramble this popular programming language:", "correct": "PYTHON", "cat": "Tech", "diff": "Easy"},
		{"type": "word_scramble", "text": "Unscramble this web framework:", "correct": "DJANGO", "cat": "Tech", "diff": "Medium"},
		{"type": "word_scramble", "text": "Unscramble this database type:", "correct": "RELATIONAL", "cat": "Tech", "diff": "Hard"},
		{"type": "word_scramble", "text": "Unscramble this planet:", "correct": "JUPITER", "cat": "Science", "diff": "Easy"},
		{"type": "word_scramble", "text": "Unscramble this chemical element (Au):", "correct": "GOLD", "cat": "Science", "diff": "Easy"},
		{"type": "word_scramble", "text": "Unscramble this animal:", "correct": "ELEPHANT", "cat": "Nature", "diff": "Easy"},
		{"type": "word_scramble", "text": "Unscramble this geometric shape:", "correct": "TRIANGLE", "cat": "Math", "diff": "Easy"},
		{"type": "word_scramble", "text": "Unscramble this famous artist:", "correct": "PICASSO", "cat": "Art", "diff": "Medium"},
		{"type": "word_scramble", "text": "Unscramble this ocean:", "correct": "PACIFIC", "cat": "General", "diff": "Easy"},
		
		# Sort Order
		{"type": "sort_order", "text": "Order these planets from closest to the Sun to furthest:", "sort_items": ["Mercury", "Venus", "Earth", "Mars"], "cat": "Science", "diff": "Easy"},
		{"type": "sort_order", "text": "Order these historical events chronologically:", "sort_items": ["Invention of the Wheel", "Fall of Rome", "Discovery of America", "Moon Landing"], "cat": "History", "diff": "Medium"},
		{"type": "sort_order", "text": "Order these numbers from smallest to largest:", "sort_items": ["-5", "0", "3.14", "10"], "cat": "Math", "diff": "Easy"},
		{"type": "sort_order", "text": "Order these software development lifecycle phases:", "sort_items": ["Planning", "Design", "Development", "Testing", "Deployment"], "cat": "Tech", "diff": "Medium"},
		{"type": "sort_order", "text": "Order these units of digital storage from smallest to largest:", "sort_items": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte"], "cat": "Tech", "diff": "Easy"},
		{"type": "sort_order", "text": "Order these steps of the scientific method:", "sort_items": ["Observation", "Hypothesis", "Experiment", "Analysis", "Conclusion"], "cat": "Science", "diff": "Medium"},
	]

	# Additional MCQs to reach ~50
	more_mcqs = [
		{"type": "mcq", "text": "Which of these is NOT a primary color?", "options": ["Red", "Green", "Blue", "Yellow"], "correct": "1", "cat": "Art", "diff": "Easy"},
		{"type": "mcq", "text": "How many continents are there?", "options": ["5", "6", "7", "8"], "correct": "2", "cat": "General", "diff": "Easy"},
		{"type": "mcq", "text": "Who wrote 'Hamlet'?", "options": ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], "correct": "1", "cat": "General", "diff": "Medium"},
		{"type": "mcq", "text": "What is the largest ocean on Earth?", "options": ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], "correct": "3", "cat": "Nature", "diff": "Easy"},
		{"type": "mcq", "text": "Which animal is the largest mammal?", "options": ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"], "correct": "1", "cat": "Nature", "diff": "Easy"},
		{"type": "mcq", "text": "What is the main ingredient in guacamole?", "options": ["Tomato", "Avocado", "Onion", "Pepper"], "correct": "1", "cat": "General", "diff": "Easy"},
		{"type": "mcq", "text": "What year did the Titanic sink?", "options": ["1905", "1912", "1920", "1923"], "correct": "1", "cat": "History", "diff": "Medium"},
		{"type": "mcq", "text": "Which element has the atomic number 1?", "options": ["Helium", "Hydrogen", "Oxygen", "Carbon"], "correct": "1", "cat": "Science", "diff": "Medium"},
		{"type": "mcq", "text": "What is the capital of Australia?", "options": ["Sydney", "Melbourne", "Canberra", "Perth"], "correct": "2", "cat": "General", "diff": "Medium"},
		{"type": "mcq", "text": "In computer science, what does RAM stand for?", "options": ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Real Access Memory"], "correct": "1", "cat": "Tech", "diff": "Easy"},
		{"type": "mcq", "text": "What is the longest river in the world?", "options": ["Amazon", "Nile", "Yangtze", "Mississippi"], "correct": "1", "cat": "Nature", "diff": "Hard"},
		{"type": "mcq", "text": "Which planet has the most moons?", "options": ["Jupiter", "Saturn", "Uranus", "Neptune"], "correct": "1", "cat": "Science", "diff": "Hard"}, # Saturn passed Jupiter recently
	]
	questions.extend(more_mcqs)

	count = 0
	for q in questions:
		if not frappe.db.exists("LMS Gamification Question Bank", {"question_text": q["text"]}):
			doc = frappe.new_doc("LMS Gamification Question Bank")
			doc.question_text = q["text"]
			doc.question_type = q["type"]
			doc.category = q["cat"]
			doc.difficulty = q["diff"]
			
			if q["type"] == "mcq":
				doc.options = json.dumps(q["options"])
				doc.correct_answer = q["correct"]
			elif q["type"] == "word_scramble":
				doc.correct_answer = q["correct"]
			elif q["type"] == "sort_order":
				doc.sort_items = json.dumps(q["sort_items"])
				
			doc.insert()
			count += 1
			
	print(f"Seeded {count} gamification questions.")
