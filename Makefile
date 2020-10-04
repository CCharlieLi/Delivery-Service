DEBUG = DEBUG=delivery,delivery:*
BIN = ./node_modules/.bin
TESTS = test/**/*.test.js
MOCHA_OPTS = --recursive -b --timeout 15000 --reporter spec --exit
NODEMON_CONFIG = ./configs/nodemon.json

lint: doc-gen
	@echo "Linting ..."
	@$(BIN)/eslint .
lint-fix: doc-gen
	@echo "Linting with fix flag..."
	@$(BIN)/eslint --fix .
test: lint-fix
	@echo "Testing..."
	@NODE_ENV=test $(DEBUG) $(BIN)/_mocha $(MOCHA_OPTS) $(TESTS)
test-watch: lint
	@echo "Testing..."
	@NODE_ENV=test $(DEBUG) $(BIN)/_mocha --watch $(MOCHA_OPTS) $(TESTS)
test-cov: lint
	@echo "Generating coverage html..."
	@NODE_ENV=test $(DEBUG) $(BIN)/nyc --reporter=lcov --reporter=text-summary $(BIN)/_mocha $(MOCHA_OPTS) $(TESTS)
test-coveralls: test-cov
	@echo "Submit coveralls job..."
	@cat ./coverage/lcov.info | $(BIN)/coveralls --verbose
.PHONY: doc-view doc-gen lint lint-fix test test-cov test-coveralls

start:
	@NODE_ENV=production DEBUG=$(DEBUG) $(BIN)/nodemon --config ${NODEMON_CONFIG} .
start-dev:
	@NODE_ENV=development DEBUG=$(DEBUG) $(BIN)/nodemon --config ${NODEMON_CONFIG} .
start-staging:
	@NODE_ENV=staging DEBUG=$(DEBUG) $(BIN)/nodemon --config ${NODEMON_CONFIG} .
.PHONY: start start-dev start-staging
