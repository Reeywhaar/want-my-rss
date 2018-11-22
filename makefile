include ./.env

build:
	make lint && web-ext build -s ext

run:
	web-ext run -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

runNightly:
	web-ext run -f nightly -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

dataServer:
	cd testdata && python3 -m http.server

lint:
	web-ext lint -s ext