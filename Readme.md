# ![icon](ext/icons/icon-color.svg) WANT MY RSS

An [extension for Firefox](https://addons.mozilla.org/addon/want-my-rss/) that restores some of RSS functionality which Firefox abandoned. Functionality includes:

- Show indicator in the url bar if feed link available
- Show preview page with rss feed
- Subscribe button
- Keyboard navigation with ←|j for previous and →|k for next article

[![Screencap](https://img.youtube.com/vi/d3tP7JFOLqc/0.jpg)](https://youtu.be/d3tP7JFOLqc)

## Add Feed Reader

If you want to add feed reader of your choice, see [following link](https://github.com/Reeywhaar/want-my-rss/issues/6)

Also you can add your preferred reader in extension's preferences.

## Contributing

Contributions are welcome. Fill issues, make prs!

## Changelog

### 0.28

_They hold no quarter_

- Fixed links selection on page, thanks to @oleastre

### 0.27

_Spring clean for the May queen_

- Updated dependencies

### 0.26

_You don't clutch no straw_

- Added lazy loading for articles

### 0.25

_What colors_

- Fixed bar icon presentation

### 0.24

_New Windows_

- Fixed middle click on popup link
- Shadow replaced with border on item in dark mode

### 0.23

_Long Time Run_

- Updated packages
- Subscribe button now can be activated by enter button

### 0.22

_Pixel Pixie_

- Updated bar icon to make it play nicely with firefox style

### 0.21

_In the search of path_

- Updated code dependencies
- Link to rss are now searched in entire document https://github.com/Reeywhaar/want-my-rss/pull/49

### 0.20

_Return of Hi-Fi_

- Updated code dependencies
- Fixed charset extraction
- Added %r interpolation placeholder

### 0.19

_Roman the Technician_

- technical release

### 0.18

_Yellow brickroad quality_

- fix rss content with relative urls

### 0.17

_Stig comes to rescue_

- fix unescaped subscription url (by https://github.com/StigNygaard)

### 0.16

_Alan Hewston is critical_

- fix Nooshub subscribe url

### 0.16

_Alan Hewston is critical_

- fix Nooshub subscribe url

### 0.15

_Lorenzo can't believe it's not butterfly_

- Add additional headers preventing feed caching
- Nooshub added

### 0.14

_Ivan's Localized harpsichord_

- Fix "Invalid Date" in non En/Us Firefox
- CommaFeed added

### 0.13

_Solomon's Key features_

- option to open feed links in new tab
- fix hover color of subscribe button in dark mode
- fix wrong url (not properly encoded) of popup.html
- intercept rss 1.0 feeds

### 0.12

_CSS issues of Balton Brando_

- restored bottom item link color
- wider item shadow in dark mode

### 0.11

- added link to media
- increased color difference of visited and unvisited links

### 0.10

- added G2Reader and Feedbin
- added options page which includes ability to define custom feed reader and reset options
- option to open hyperlinks to feeds in extension's viewer directly
- migrated to TypeScript (helped to spot some errors)

### 0.9

- add "summary" tag to content lookup tags.
- fix parsing feeds without `<?xml` header
- registered `ext+rss` protocol handler. Feeds may be opened by typing something like `ext+rss:http://example.com/feed.rss` in an url bar.

### 0.8

- show original url in extension's popup
- loose xml parsing from first occurance of `<?xml`

### 0.7

- added BazQux

### 0.6

- added Netvibes
- fix subscribe button icon click

### 0.5

- JSON feeds support
- Data escaping (:
- Slight design modifications

### 0.4

- Additional prev/next keyboard navigation with ←/→ arrow keys
- Better keyboard navigation

### 0.3

- Article sorting
- Better error handling
- Show time relative feature
- Bug fixes
- Minor style changes

### 0.2

- "Feed not found" message
- Better picking of feeds
- Line with article link at bottom
- \<enclosure> tag handling
- `j/k` navigation for previous/next article
- subscribe button

### 0.1

- Initial version with basic notification and displaying capabilities

## Credits

Extension uses [PT Sans](https://company.paratype.com/pt-sans-pt-serif) font
