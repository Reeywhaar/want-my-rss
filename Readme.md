# ![icon](ext/icons/icon-color.svg) WANT MY RSS

[Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/want-my-rss/)

Firefox extension that restores some of RSS functionality which Firefox abandoned. Functionality includes:

* Show indicator in the url bar if feed link available
* Show preview page with rss feed
* Subscribe button
* Keyboard navigation with ←|j for previous and →|k for next article

[![Screencap](https://img.youtube.com/vi/d3tP7JFOLqc/0.jpg)](https://youtu.be/d3tP7JFOLqc)

## Add Feed Reader
If you want to add feed reader of your choice, see [following link](https://github.com/Reeywhaar/want-my-rss/issues/6)

## Contributing
Contributions are welcome. Fill issues, make prs!

## Changelog

### 0.10

* added G2Reader and Feedbin
* added options page which includes ability to define custom feed reader and reset options
* option to open hyperlinks to feeds in extension's viewer directly
* migrated to TypeScript (helped to spot some errors)

### 0.9

* add "summary" tag to content lookup tags.
* fix parsing feeds without `<?xml` header
* registered `ext+rss` protocol handler. Feeds may be opened by typing something like `ext+rss:http://example.com/feed.rss` in an url bar.

### 0.8

* show original url in extension's popup
* loose xml parsing from first occurance of `<?xml`

### 0.7

* added BazQux

### 0.6

* added Netvibes
* fix subscribe button icon click

### 0.5

* JSON feeds support
* Data escaping (:
* Slight design modifications

### 0.4

* Additional prev/next keyboard navigation with ←/→ arrow keys
* Better keyboard navigation

### 0.3

* Article sorting
* Better error handling
* Show time relative feature
* Bug fixes
* Minor style changes

### 0.2

* "Feed not found" message
* Better picking of feeds
* Line with article link at bottom
* \<enclosure> tag handling
* `j/k` navigation for previous/next article
* subscribe button

### 0.1

* Initial version with basic notification and displaying capabilities

## Credits
Extension uses [PT Sans](https://company.paratype.com/pt-sans-pt-serif) font