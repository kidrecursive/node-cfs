test:
	@./node_modules/.bin/mocha -R spec --globals testModuleInitialized

.PHONY: test