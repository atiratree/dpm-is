all: test

generate-test:
	./scripts/generate-test.sh

test: generate-test
	./scripts/test.sh

deploy:
	./scripts/deploy.sh

pull:
	./scripts/pull.sh
