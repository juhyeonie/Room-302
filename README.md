# Room 302

Designed and developed by **Justine Pelgone**.

**Live:** [juhyeonie.github.io/Room-302](https://juhyeonie.github.io/Room-302/)

My portfolio as a 3D bedroom. Instead of scrolling a page, you look around the room and click things:
the desktop shows my projects, the bookshelf my stack, the calendar my timeline, the phone how to reach me.

## Run it locally

The site is static files with no build step. It has to be served over HTTP (ES modules don't load from `file://`):

```
npx http-server room-302
```

Three.js, Preact and the fonts load from CDNs, so you need an internet connection.

## Layout

```
room-302/
  index.html    page shell
  app.js        UI: top bar, hover labels, side panels, modals, sound, day/night (Preact + htm)
  content.js    all the copy — projects, skills, timeline, contacts, facts, music
  room3d.js     the 3D room (Three.js)
  styles.css    styles
  images/       project screenshots
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/pages.yml`.
