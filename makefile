include ./.env

build: clean
	node_modules/.bin/tsc && make lint && node_modules/.bin/web-ext build -s ext

clean:
	rm -rf ext/js

watch:
	node_modules/.bin/tsc --watch

run:
	node_modules/.bin/web-ext run -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

runNightly:
	node_modules/.bin/web-ext run -f nightly -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

dataServer:
	cd testdata && python3 -m http.server

lint:
	node_modules/.bin/web-ext lint -s ext