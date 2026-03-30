.PHONY: help dev-up dev-down dev-logs dev-shell prod-up prod-down staging-up install-deps test clean

help:
	@echo "LMS Management Commands"
	@echo "======================="
	@echo ""
	@echo "Development:"
	@echo "  make dev-up          Start development environment"
	@echo "  make dev-down        Stop development environment"
	@echo "  make dev-logs        View development logs"
	@echo "  make dev-shell       Access development shell"
	@echo "  make dev-restart     Restart development services"
	@echo ""
	@echo "Production:"
	@echo "  make prod-up         Start production environment"
	@echo "  make prod-down       Stop production environment"
	@echo "  make prod-logs       View production logs"
	@echo "  make prod-backup     Run backup"
	@echo ""
	@echo "Staging:"
	@echo "  make staging-up      Start staging environment"
	@echo "  make staging-down    Stop staging environment"
	@echo ""
	@echo "Utilities:"
	@echo "  make install-deps    Install all dependencies"
	@echo "  make test            Run tests"
	@echo "  make clean           Clean up containers and volumes"

# Development
dev-up:
	cd docker/dev && docker-compose -f docker-compose.dev.yml up -d

dev-down:
	cd docker/dev && docker-compose -f docker-compose.dev.yml down

dev-logs:
	cd docker/dev && docker-compose -f docker-compose.dev.yml logs -f

dev-shell:
	docker exec -it lms_frappe_dev bash

dev-restart:
	cd docker/dev && docker-compose -f docker-compose.dev.yml restart

# Production
prod-up:
	cd docker/production && docker-compose -f docker-compose.prod.yml up -d

prod-down:
	cd docker/production && docker-compose -f docker-compose.prod.yml down

prod-logs:
	cd docker/production && docker-compose -f docker-compose.prod.yml logs -f

prod-backup:
	./scripts/backup.sh prod

# Staging
staging-up:
	cd docker/staging && docker-compose -f docker-compose.staging.yml up -d

staging-down:
	cd docker/staging && docker-compose -f docker-compose.staging.yml down

# Utilities
install-deps:
	./scripts/install-deps.sh dev

test:
	docker exec lms_frappe_dev bash -c "cd /home/frappe/frappe-bench && bench --site lms.localhost run-tests --app lms"

clean:
	docker system prune -af
	@echo "⚠️  This will remove all volumes. Are you sure? [y/N]"
	@read ans; if [ "$$ans" = "y" ]; then docker volume prune -f; fi
