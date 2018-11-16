include ./.env

build:
	make lint && web-ext build -s ext

run:
	web-ext run --firefox="/Applications/Firefox Beta.app/Contents/MacOS/firefox-bin" -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

runNightly:
	web-ext run -f nightly -s ext --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

lint:
	web-ext lint -s ext