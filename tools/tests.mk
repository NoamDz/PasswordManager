.PHONY: test e2e

# backend + frontend
test:
	pytest backend/tests -q
	npm --prefix frontend run test -- --coverage

# end-to-end
e2e:
	bash ./tools/run-e2e.sh