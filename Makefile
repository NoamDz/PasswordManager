# Project Makefile – provides unified test commands

.PHONY: test e2e backend frontend dev db

# -------------------------
# Unit + integration tests
# -------------------------

test:
	pytest backend/tests -q
	# ensure front-end dev deps are installed and run tests from the frontend folder
	npm --prefix frontend install --no-fund --no-audit
	npm --prefix frontend run test

# -------------------------
# End-to-end browser tests
# -------------------------
 e2e:
	bash tools/run-e2e.sh


# -------------------------
# Development servers
# -------------------------

backend:
	python -m uvicorn backend.app.main:app --reload --port 8000

frontend:
	npm --prefix frontend run dev

# new dev script handles cleanup
dev:
	bash tools/dev.sh

# start postgres container
db:
	docker compose up -d db