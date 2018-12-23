include ./.env

build: clean
	tsc && make lint && web-ext build -s ext

clean:
	rm -r etx/js

watch:
	tsc --watch

run:
	web-ext run -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

runNightly:
	web-ext run -f nightly -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

dataServer:
	cd testdata && python3 -m http.server

lint:
	web-ext lint -s ext