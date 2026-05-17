#!/bin/bash
cd /home/huyhoang/frappe-bench
bench --site lms.localhost mariadb -e "DESC \`tabLMS Game\`;"
