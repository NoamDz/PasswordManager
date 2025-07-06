# Project Makefile – provides unified test commands

.PHONY: test e2e

# -------------------------
# Unit + integration tests
# -------------------------

test:
	pytest backend/tests -q
	npm run test:fe

# -------------------------
# End-to-end browser tests
# -------------------------

ifeq ($(OS),Windows_NT)
# Windows uses PowerShell wrapper
 e2e:
	powershell -ExecutionPolicy Bypass -File tools/run-e2e.ps1
else
# Unix-like systems use bash wrapper
 e2e:
	bash tools/run-e2e.sh
endif