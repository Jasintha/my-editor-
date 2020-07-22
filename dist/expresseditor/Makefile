# Helper variables and Make settings
.PHONY: help clean build proto-link proto-vendor run
.DEFAULT_GOAL := help
.ONESHELL :
.SHELLFLAGS := -ec
SHELL := /bin/bash

help:                                  ## Print list of tasks
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_%-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' Makefile

docker-build:    ## building docker image
		cd ../../
		npm install
		npm run build
		rm -rf dist/expresseditor/build
		cp -r target/generated-resources/public dist/expresseditor/build
		cd dist/expresseditor/
		docker build -t twillodotio/twillo-studio-editor-ui -f Dockerfile .

docker-run:      ## runing docker image
		docker run --network host  -it  twillodotio/twillo-studio-editor-ui

docker-push:      ## pusing to docker hub
		docker push twillodotio/twillo-studio-editor-ui

publish:  ## build and push to docker hub as twillodotio/twillo-studio-editor-ui ex : make publish v=latest
		cd ../../
		npm install
		npm run build
		cp -r target/generated-resources/public dist/expresseditor/build
		cd dist/expresseditor/
		docker build -t twillodotio/twillo-studio-editor-ui:$(v) -f Dockerfile .
		docker push twillodotio/twillo-studio-editor-ui:$(v)