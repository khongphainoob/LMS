#!/bin/bash
echo "🚀 Chạy test script Deep Agents..."
cd /home/huyhoang/frappe-bench/sites
../env/bin/python ../apps/frappe/frappe/utils/bench_helper.py frappe --site lms.localhost execute lms.lms.services.ai_grading.test_graph.run_test
