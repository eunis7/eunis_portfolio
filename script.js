/* =============================================================
   SCRIPT.JS  —  a tiny bit of JavaScript
   =============================================================
   This file does just two small jobs. You probably don't need to
   touch it, but here's what it does so nothing feels like magic.
   ============================================================= */

/* -------------------------------------------------------------
   1. MOBILE MENU
   On small screens, tapping the hamburger button shows/hides the
   navigation links.
   ------------------------------------------------------------- */
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    // Add or remove the "open" class that makes the menu visible.
    const isOpen = links.classList.toggle("nav__links--open");
    // Tell screen readers whether the menu is open, and match the label to it.
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // Close the menu again after tapping a link (or, on the sketchbook
  // page, a nav button).
  links.querySelectorAll("a, button").forEach((link) => {
    // (the "Work" dropdown button only opens its own menu, so it must not
    // close the phone menu it lives in — the two choices inside it do)
    if (link.classList.contains("nav__dropdown-toggle")) return;
    link.addEventListener("click", () => {
      links.classList.remove("nav__links--open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

/* -------------------------------------------------------------
   2. AUTOMATIC YEAR IN THE FOOTER
   Fills in the current year so you never have to update it.
   ------------------------------------------------------------- */
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* -------------------------------------------------------------
   3. HERO VIDEO PAUSE BUTTON
   The hero video autoplays with no built-in controls bar, so this
   button is the only way to pause/resume it.
   ------------------------------------------------------------- */
const heroVideo = document.getElementById("hero-video");
const heroVideoToggle = document.getElementById("hero-video-toggle");

if (heroVideo && heroVideoToggle) {
  heroVideoToggle.addEventListener("click", () => {
    if (heroVideo.paused) {
      heroVideo.play();
      heroVideoToggle.textContent = "⏸";
      heroVideoToggle.setAttribute("aria-label", "Pause video");
    } else {
      heroVideo.pause();
      heroVideoToggle.textContent = "▶";
      heroVideoToggle.setAttribute("aria-label", "Play video");
    }
  });
}

/* -------------------------------------------------------------
   4. SKETCHBOOK SCREENS
   The home page is a carousel of closed sketchbooks (see section 6).
   Opening one (or using the matching "Work" / "About" nav button)
   swaps in that book's screen; the back button, or Escape, returns to
   the carousel. Only one screen is ever shown at a time (the others
   get the `hidden` attribute), so this is a straight show/hide swap.
   showScreen() is declared out here, not inside the `if`, so the
   carousel can call it too.
   ------------------------------------------------------------- */
const screens = document.querySelectorAll(".screen");

const showScreen = (id) => {
  let elementToFocus = null;
  let shownScreen = null;

  // (looked up live each time, so a screen created later — see section
  // 6 — is included without any extra wiring)
  document.querySelectorAll(".screen").forEach((screen) => {
    const isTarget = screen.id === `screen-${id}`;
    screen.hidden = !isTarget;
    if (isTarget) {
      shownScreen = screen;
      // Coming back to the carousel: land on the book that's in front.
      elementToFocus =
        screen.querySelector(".sketchbook-item.is-selected .sketchbook-visual") ||
        screen.querySelector("button, a");
    }
  });

  // Tell the screen it's now visible (the open-book screens use this to
  // re-measure themselves, since a hidden screen has no size).
  if (shownScreen) shownScreen.dispatchEvent(new CustomEvent("screen:shown"));

  // Move focus into the screen that just appeared, so keyboard and
  // screen-reader users land somewhere sensible instead of on a
  // button that's no longer visible.
  if (elementToFocus) {
    elementToFocus.focus();

    // On an open book, the "Back to shelf" button gets focus automatically.
    // That shouldn't draw the orange keyboard-focus box round it when the
    // visitor hasn't used the keyboard — so the box stays hidden until they
    // press a key (e.g. Tab), and then works as normal.
    if (elementToFocus.classList.contains("book__back")) {
      elementToFocus.classList.add("is-quiet-focus");
      const showRing = () => elementToFocus.classList.remove("is-quiet-focus");
      elementToFocus.addEventListener("blur", showRing, { once: true });
      document.addEventListener("keydown", showRing, { once: true, capture: true });
    }
  }
};

if (screens.length) {
  document.querySelectorAll("[data-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => showScreen(trigger.dataset.open));
  });

  document.querySelectorAll("[data-close]").forEach((trigger) => {
    trigger.addEventListener("click", () => showScreen("landing"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openBook = document.querySelector(".screen--book:not([hidden])");
      if (openBook) showScreen("landing");
    }
  });
}

/* -------------------------------------------------------------
   5. WORKS BOOK CONTENT
   -------------------------------------------------------------
   Everything shown on the open Works book — title, year, software,
   description and the big media on the right page — comes from the
   WORKS_PROJECTS array below. Each entry is one full page-spread; the
   "‹ Previous" / "Next ›" buttons step through them in order. Add,
   remove or reorder projects just by editing this array — nothing else
   needs to change.

   The book also opens on a CONTENTS page first (see .work-contents in
   index.html): its list is made from this same array, using each
   project's `number` and `title`, and the arrows step through
   Contents → project 1 → project 2 → … in order.

   REPLACE: swap in your own projects here. Each one needs:
     number      e.g. "01"
     title       the project's title
     year        e.g. "2026"
     software    tools/materials used, e.g. "Procreate Dreams"
     description about 40–70 words
     thumb       small image — kept for a future thumbnail-style
                 switcher, not currently shown on the page
     media       { type: "image" | "video", src: "..." }
     caption     optional short caption under the media (or "")
   ------------------------------------------------------------- */
const WORKS_PROJECTS = [
  {
    number: "01", // REPLACE: project number
    title: "Paper Plane", // REPLACE: project title
    year: "2026", // REPLACE: year
    software: "Procreate Dreams", // REPLACE: software / materials
    description:
      "This is a hand-drawn animation I created as my personal project for DSDN 142. It shows a piece of paper folding itself into a paper plane. I explore transformation, timing and movement while creating a smooth loop where the ending connects naturally back to the beginning. ",
    thumb: "assets/project-placeholder-1.svg", // REPLACE: small thumbnail image
    media: {
      type: "video", // REPLACE: "image" or "video"
      src: "assets/videos/dream-7.mp4", // REPLACE: the animation / image / video file
      autoplay: true, // plays on its own, muted, as soon as the book opens
      loop: true, // and repeats continuously
    },
    caption: "", // REPLACE (optional): a short caption under the media
  },
  {
    number: "02", // REPLACE: project number
    title: "Flying Too High", // REPLACE: project title
    year: "2026", // REPLACE: year
    software: "Procreate Dreams", // REPLACE: software / materials
    description:
      "This short hand-drawn animation was created for my DSDN 132 project and adapts the myth of Icarus into a modern workplace. It follows an employee whose early success and prise make him increasingly overconfident. He ignores the warnings of a senior worker which eventually leads to his downfall. The sun and wings act as visual metaphors for ambition, pride and the consequences of flying too high.",
    thumb: "assets/project-placeholder-2.svg", // REPLACE: small thumbnail image
    media: {
      type: "video", // REPLACE: "image" or "video"
      src: "assets/videos/dream-9.1.mp4", // REPLACE: the animation / image / video file
      autoplay: true, // plays on its own, muted, as soon as this page is shown
      loop: true, // and repeats continuously
    },
    caption: "", // REPLACE (optional): a short caption under the media
  },
];

/* -------------------------------------------------------------
   Everything below is wrapped in initWorksBook(): it drives one Works
   sketchbook screen (currently just the blue one; the dusty rose "Works
   2" book is plain pages for now). It looks up its elements INSIDE the
   screen it's given (by class, not by ID) and is handed that book's
   projects array, so another book with content can reuse it by calling
   it again with its own screen and data.
   ------------------------------------------------------------- */
const initWorksBook = (screenWorksEl, WORKS_PROJECTS) => {
  if (!screenWorksEl) return;

  const worksFrame = screenWorksEl.querySelector(".book__frame");
  const worksBookImg = screenWorksEl.querySelector(".book__img");
  const worksOverlay = screenWorksEl.querySelector(".book__overlay");
  const workNumberEl = screenWorksEl.querySelector(".work__number");
  const workTitleEl = screenWorksEl.querySelector(".work__title");
  const workMetaEl = screenWorksEl.querySelector(".work__meta");
  const workDescriptionEl = screenWorksEl.querySelector(".work__description");
  const workMediaEl = screenWorksEl.querySelector(".work__media");
  const workCaptionEl = screenWorksEl.querySelector(".work__caption");
  const worksPrevEl = screenWorksEl.querySelector(".work__nav--prev");
  const worksNextEl = screenWorksEl.querySelector(".work__nav--next");
  const worksTurnFlapEl = screenWorksEl.querySelector(".book__turn-flap");

  // The optional contents page. If a book's screen has no .work-contents
  // in its markup, it simply behaves as it always did (project pages only).
  const contentsEl = screenWorksEl.querySelector(".work-contents");
  const contentsListEl = contentsEl && contentsEl.querySelector(".work-contents__list");

  if (!(worksFrame && worksBookImg && worksOverlay && workMediaEl)) return;

  // Page order: Contents (page 0, if there is one), then one page per
  // project. `offset` is how many pages come before the first project.
  const offset = contentsEl ? 1 : 0;
  const pageCount = WORKS_PROJECTS.length + offset;
  let currentPage = 0;
  let isTurningPage = false;

  // True on devices with a real mouse (so hovering means something);
  // false on touch-only devices, which have no hover state at all.
  const supportsHover = window.matchMedia("(hover: hover)").matches;

  // Fills the right page with the selected project's media: an <img>
  // for "image", or a <video> for "video". An autoplaying/looping video
  // is always muted — browsers block autoplaying sound anyway — and
  // preload="auto" (rather than "metadata") asks the browser to start
  // buffering real frames straight away, so there's something to see
  // immediately instead of a blank box.
  //
  // The native controls bar is still the ONLY controls — play/pause,
  // scrubbing, volume, fullscreen, picture-in-picture all still work
  // exactly as the browser provides them. On a device with a mouse, it
  // just starts hidden and is toggled on/off by hovering or focusing
  // the video (never by pausing or seeking it, which .controls has no
  // effect on). On touch devices (no hover), controls just stay on.
  const renderWorkMedia = (media) => {
    workMediaEl.innerHTML = "";

    if (media.type === "video") {
      const video = document.createElement("video");
      video.className = "work__media-el";
      video.src = media.src;
      video.preload = "auto";
      video.playsInline = true;
      video.tabIndex = 0; // so it can still receive keyboard focus while controls are hidden
      if (media.autoplay) video.autoplay = true;
      if (media.loop) video.loop = true;
      if (media.autoplay || media.loop) video.muted = true;

      if (supportsHover) {
        video.controls = false;
        video.addEventListener("mouseenter", () => (video.controls = true));
        video.addEventListener("mouseleave", () => (video.controls = false));
        video.addEventListener("focus", () => (video.controls = true));
        video.addEventListener("blur", () => (video.controls = false));
      } else {
        video.controls = true;
      }

      workMediaEl.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.className = "work__media-el";
      img.src = media.src;
      img.alt = media.alt || "";
      workMediaEl.appendChild(img);
    }
  };

  const selectWorksProject = (index) => {
    const project = WORKS_PROJECTS[index];

    workNumberEl.textContent = `Project ${project.number}`;
    workTitleEl.textContent = project.title;
    workMetaEl.textContent = `${project.year} · ${project.software}`;
    workDescriptionEl.textContent = project.description;
    workCaptionEl.textContent = project.caption || "";
    workCaptionEl.hidden = !project.caption;

    renderWorkMedia(project.media);
  };

  // Shows one page of the book: the contents (page 0, when there is one)
  // or a project. The project text/media are hidden by CSS while the
  // contents show (the .is-contents class), and the media is emptied so a
  // video doesn't keep playing out of sight.
  const showPage = (page) => {
    currentPage = page;
    const onContents = Boolean(contentsEl) && page === 0;

    screenWorksEl.classList.toggle("is-contents", onContents);
    if (contentsEl) contentsEl.hidden = !onContents;

    if (onContents) {
      workMediaEl.innerHTML = "";
    } else {
      selectWorksProject(page - offset);
    }

    // Dim (not hide) whichever button would go past either end of the
    // book, so the page layout doesn't jump around.
    if (worksPrevEl) worksPrevEl.disabled = page === 0;
    if (worksNextEl) worksNextEl.disabled = page === pageCount - 1;
  };

  // Plays a simple page-turn: a visible paper-coloured flap (its own
  // position — see .book__turn-flap in styles.css, it doesn't borrow
  // .book__page's box) rotates over the spine and, at the animation's
  // midpoint — once it's edge-on — the real page content swaps
  // underneath it via `onMidpoint`. `onDone` fires once the flap has
  // finished and been hidden again, via the animation's own
  // `animationend` event (with a setTimeout as a fallback, in case that
  // never fires for some reason) rather than a second guessed timeout,
  // so cleanup can't happen before the animation is actually done.
  //
  // Anyone with prefers-reduced-motion set skips the flap altogether
  // and jumps straight to the new content — deliberately not just
  // relying on the site-wide reduced-motion rule in styles.css (which
  // shortens the CSS animation itself to near-zero), since that alone
  // would still leave the content swap waiting on a setTimeout tuned
  // for the full-length animation.
  const DURATION = 850;

  const playPageTurn = (direction, onMidpoint, onDone) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!worksTurnFlapEl || reduceMotion) {
      onMidpoint();
      onDone();
      return;
    }

    const isNext = direction === "next";
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      worksTurnFlapEl.removeEventListener("animationend", finish);
      worksTurnFlapEl.className = "book__turn-flap";
      onDone();
    };

    // Reset first (and force a reflow before adding the animation
    // class) so re-triggering the same direction twice in a row still
    // restarts the CSS animation from rotateY(0deg) instead of no-op'ing.
    worksTurnFlapEl.className = "book__turn-flap";
    void worksTurnFlapEl.offsetWidth; // force reflow
    worksTurnFlapEl.classList.add(
      "is-turning",
      isNext ? "book__turn-flap--next" : "book__turn-flap--prev"
    );

    worksTurnFlapEl.addEventListener("animationend", finish);
    setTimeout(onMidpoint, DURATION / 2);
    setTimeout(finish, DURATION + 100); // fallback, in case animationend doesn't fire
  };

  // Keeps #works-overlay positioned exactly on top of the rendered
  // book image, even though the image's on-screen size changes with
  // the viewport (see .book__frame / .book__img in styles.css, which
  // this step doesn't touch). Percentages inside the overlay are then
  // always percentages of the real artwork, not empty letterboxing.
  const syncWorksOverlay = () => {
    const frameRect = worksFrame.getBoundingClientRect();
    const imgRect = worksBookImg.getBoundingClientRect();
    if (imgRect.width === 0 || imgRect.height === 0) return; // screen is hidden

    worksOverlay.style.left = `${imgRect.left - frameRect.left}px`;
    worksOverlay.style.top = `${imgRect.top - frameRect.top}px`;
    worksOverlay.style.width = `${imgRect.width}px`;
    worksOverlay.style.height = `${imgRect.height}px`;
  };

  // Turns to any page (the arrows and the contents list both use this):
  // forwards turns right-to-left, backwards left-to-right, and the page
  // content swaps at the flap's halfway point.
  const goToPage = (target) => {
    if (isTurningPage || target === currentPage || target < 0 || target >= pageCount) return;
    isTurningPage = true;
    const focusWasInContents = Boolean(contentsEl) && contentsEl.contains(document.activeElement);
    playPageTurn(
      target > currentPage ? "next" : "prev",
      () => showPage(target),
      () => {
        isTurningPage = false;
        // The item that was clicked is no longer on the page, so keep
        // keyboard focus somewhere sensible instead of losing it.
        if (focusWasInContents && worksNextEl) worksNextEl.focus({ preventScroll: true });
      }
    );
  };

  // The contents list, made from the project data.
  if (contentsListEl) {
    WORKS_PROJECTS.forEach((project, index) => {
      const entry = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "work-contents__item";

      const number = document.createElement("span");
      number.className = "work-contents__num";
      number.textContent = project.number;
      number.setAttribute("aria-hidden", "true");

      const title = document.createElement("span");
      title.className = "work-contents__title";
      title.textContent = project.title;

      button.append(number, title);
      button.addEventListener("click", () => goToPage(index + offset));
      entry.appendChild(button);
      contentsListEl.appendChild(entry);
    });
  }

  showPage(0); // the book opens on the contents (or the first project, if there are none)

  if (worksPrevEl) worksPrevEl.addEventListener("click", () => goToPage(currentPage - 1));
  if (worksNextEl) worksNextEl.addEventListener("click", () => goToPage(currentPage + 1));

  if (worksBookImg.complete) {
    syncWorksOverlay();
  } else {
    worksBookImg.addEventListener("load", syncWorksOverlay, { once: true });
  }

  window.addEventListener("resize", () => {
    if (!screenWorksEl.hidden) syncWorksOverlay();
  });

  // The Works screen is `hidden` (and so measures as zero-size) until
  // it's opened, so re-sync as soon as showScreen() announces it's visible.
  screenWorksEl.addEventListener("screen:shown", () => {
    // Opening the book always starts at the contents page.
    if (contentsEl && !isTurningPage) showPage(0);
    syncWorksOverlay(); // right away (the screen has already been unhidden by then)...
    requestAnimationFrame(syncWorksOverlay); // ...and again once layout has settled
  });
};

initWorksBook(document.getElementById("screen-works"), WORKS_PROJECTS);

/* -------------------------------------------------------------
   DOODLES BOOK (the dusty rose sketchbook)
   -------------------------------------------------------------
   A picture-only book: several "spreads" (each a .doodle-spread in
   index.html, with doodles on both pages) and a page turn between them.
   This does the same two jobs as initWorksBook() for the Works book —
   keep an overlay pixel-matched to the book image, and play the
   page-turn flap — but is its own small function, so the Works book's
   code stays exactly as it was. The flap styling/animation is the
   shared .book__turn-flap CSS. Add a .doodle-spread to index.html and
   the arrows pick it up automatically.
   ------------------------------------------------------------- */
const initDoodleBook = (screenEl) => {
  if (!screenEl) return;

  const frame = screenEl.querySelector(".book__frame");
  const bookImg = screenEl.querySelector(".book__img");
  const overlay = screenEl.querySelector(".book__overlay");
  const spreads = [...screenEl.querySelectorAll(".doodle-spread")];
  const prevBtn = screenEl.querySelector(".doodle__nav--prev");
  const nextBtn = screenEl.querySelector(".doodle__nav--next");
  const flap = screenEl.querySelector(".book__turn-flap");

  if (!(frame && bookImg && overlay && spreads.length && prevBtn && nextBtn)) return;

  let current = 0;
  let isTurning = false;

  // Keeps the overlay exactly on top of the rendered book image, whatever
  // size the window makes it (a hidden screen measures zero, so skip then).
  const syncOverlay = () => {
    const frameRect = frame.getBoundingClientRect();
    const imgRect = bookImg.getBoundingClientRect();
    if (imgRect.width === 0 || imgRect.height === 0) return;

    overlay.style.left = `${imgRect.left - frameRect.left}px`;
    overlay.style.top = `${imgRect.top - frameRect.top}px`;
    overlay.style.width = `${imgRect.width}px`;
    overlay.style.height = `${imgRect.height}px`;
  };

  // Shows one spread, hides the rest, and greys out an arrow at either
  // end (the pages stop at the first and last spread — no looping).
  const showSpread = (index) => {
    current = index;
    spreads.forEach((spread, i) => (spread.hidden = i !== index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === spreads.length - 1;
  };

  // The same page turn as the Works book: a paper flap hinged at the
  // spine, with the spread swapping underneath it at the halfway point.
  // Skipped (instant swap) for anyone with reduced motion on.
  const DURATION = 850;

  const playTurn = (direction, onMidpoint, onDone) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!flap || reduceMotion) {
      onMidpoint();
      onDone();
      return;
    }

    const isNext = direction === "next";
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      flap.removeEventListener("animationend", finish);
      flap.className = "book__turn-flap";
      onDone();
    };

    flap.className = "book__turn-flap";
    void flap.offsetWidth; // restart the animation even on back-to-back turns
    flap.classList.add("is-turning", isNext ? "book__turn-flap--next" : "book__turn-flap--prev");

    flap.addEventListener("animationend", finish);
    setTimeout(onMidpoint, DURATION / 2);
    setTimeout(finish, DURATION + 100); // fallback if animationend never fires
  };

  const turn = (direction) => {
    const target = direction === "next" ? current + 1 : current - 1;
    if (isTurning || target < 0 || target >= spreads.length) return;
    isTurning = true;
    playTurn(
      direction,
      () => showSpread(target),
      () => (isTurning = false)
    );
  };

  prevBtn.addEventListener("click", () => turn("prev"));
  nextBtn.addEventListener("click", () => turn("next"));

  showSpread(0);

  if (bookImg.complete) {
    syncOverlay();
  } else {
    bookImg.addEventListener("load", syncOverlay, { once: true });
  }
  window.addEventListener("resize", () => {
    if (!screenEl.hidden) syncOverlay();
  });
  screenEl.addEventListener("screen:shown", () => {
    syncOverlay();
    requestAnimationFrame(syncOverlay);
  });
};

initDoodleBook(document.getElementById("screen-works2"));

/* -------------------------------------------------------------
   ABOUT ME BOOK (the sage-green sketchbook)
   -------------------------------------------------------------
   Just keeps .book__overlay (the layer holding the photo and the text)
   pixel-matched to the rendered book picture, the same way the other two
   books do, so the layout stays on the paper at any window size. There's
   only one page spread so far, so there's no page turn yet.
   ------------------------------------------------------------- */
const initAboutBook = (screenEl) => {
  if (!screenEl) return;

  const frame = screenEl.querySelector(".book__frame");
  const bookImg = screenEl.querySelector(".book__img");
  const overlay = screenEl.querySelector(".book__overlay");
  if (!(frame && bookImg && overlay)) return;

  const syncOverlay = () => {
    const frameRect = frame.getBoundingClientRect();
    const imgRect = bookImg.getBoundingClientRect();
    if (imgRect.width === 0 || imgRect.height === 0) return; // a hidden screen measures zero

    overlay.style.left = `${imgRect.left - frameRect.left}px`;
    overlay.style.top = `${imgRect.top - frameRect.top}px`;
    overlay.style.width = `${imgRect.width}px`;
    overlay.style.height = `${imgRect.height}px`;
    overlay.style.setProperty("--book-w", `${imgRect.width}px`); // (the About text is sized from this)
  };

  if (bookImg.complete) {
    syncOverlay();
  } else {
    bookImg.addEventListener("load", syncOverlay, { once: true });
  }
  window.addEventListener("resize", () => {
    if (!screenEl.hidden) syncOverlay();
  });
  screenEl.addEventListener("screen:shown", () => {
    syncOverlay();
    requestAnimationFrame(syncOverlay);
  });
};

initAboutBook(document.getElementById("screen-about"));



/* -------------------------------------------------------------
   6. SKETCHBOOK CAROUSEL (the closed books on the home screen)
   -------------------------------------------------------------
   The closed books sit in ONE fixed, straight row — the order of the
   SKETCHBOOKS array below — inside a "track" that slides sideways
   behind a window (the viewport). Moving to another book just slides
   the whole track so that book ends up centred; books never orbit,
   rotate round each other or loop: stepping right from the last book
   isn't possible (the right arrow greys out), and likewise at the
   first. Layout, spacing and speed live in styles.css (".carousel");
   this script builds the books, tracks which one is selected, and
   works out how far to slide the track.

   - Right/left arrow (or the ← / → keys): select the next / previous
     book. Clicking a book that isn't selected slides it to the centre;
     clicking the selected book opens it.
   - Arrows are disabled while the track is sliding, and the name
     underneath only changes once the slide has finished.
   ------------------------------------------------------------- */

/* ADD YOUR SKETCHBOOKS HERE. Each object becomes one book in the
   carousel, in this order — copy one, change the fields, done.
     id          short name with no spaces. It decides which screen
                 opens: the screen with the id "screen-<id>" in
                 index.html. If there isn't one, a plain open-book
                 screen showing `openImage` is created automatically.
     title       the name shown underneath when this book is selected
     closedImage the closed book picture shown in the carousel
     openImage   the open book picture
     alt         (optional) a description of the closed book for screen
                 readers
   These three are for the hover buttons (change cover colour / doodle
   on the cover) and are all optional:
     storageId      the name this book's cover colour and doodle are saved
                    under in the browser (localStorage). Keep it the same
                    forever so a visitor's choices aren't lost. If left
                    out, `id` is used.
     coverImage     a "cover only" picture made by
                    assets/covers/make_covers.py — just the fabric front
                    cover, so a new colour never touches the spine. If
                    left out, the whole closed picture is used instead.
     originalColour how the first (reset) dot looks in the palette: the
                    cover's own cream fabric colour, NOT the spine colour.
   The first three already have their own screens in index.html. */
const SKETCHBOOKS = [
  {
    id: "works",
    storageId: "animation",
    title: "Animation",
    closedImage: "assets/closed blue sketchbook for work.png",
    coverImage: "assets/covers/blue-cover.png",
    originalColour: "#e8dfd0",
    openImage: "assets/opened blue sketchbook for work.png",
    alt: "A closed blue sketchbook",
  },
  {
    id: "works2",
    storageId: "doodle",
    title: "Doodles",
    closedImage: "assets/closed dusty rose sketchbook for work.png",
    coverImage: "assets/covers/rose-cover.png",
    originalColour: "#e5dbcd",
    openImage: "assets/opened dusty rose sketchbook for work.png",
    alt: "A closed dusty rose sketchbook",
  },
  {
    id: "about",
    storageId: "about-me",
    title: "About Me",
    closedImage: "assets/closed sage-green sketchbook for about me.png",
    coverImage: "assets/covers/sage-cover.png",
    originalColour: "#e9e1d6",
    openImage: "assets/opened sage-green sketchbook for about me.png",
    alt: "A closed sage-green sketchbook",
  },
];

/* -------------------------------------------------------------
   6b. CUSTOMISING A CLOSED BOOK (cover colour + doodles)
   -------------------------------------------------------------
   Hovering (or keyboard-focusing) a closed book shows two small round
   buttons beside it: a palette and a pencil.

   COLOUR — the palette opens seven dots: the book's own original colour
   (a reset) and six pastels. A pastel is painted over the fabric front
   cover ONLY, as a picture of the cover (assets/covers/…) tinted with an
   SVG colour filter, so the real weave, rounded corners and shading show
   through and the spine, page edges and doodles on top are untouched.

   DOODLE — the pencil puts a transparent <canvas> over that book's front
   cover and shows a small toolbar (regular pen, crayon, eraser, undo,
   clear, done) plus eight drawing colours that both brushes share. The canvas is clipped to the cover shape, sits above
   the colour layer and only takes pointer input while drawing. Strokes are
   kept as numbers between 0 and 1 across the book (not pixels), so the
   drawing stays lined up with the cover at any size or after a resize.

   Each book saves its cover COLOUR in localStorage under its `storageId`
   (see SKETCHBOOKS): "sketchbookColour:<id>". Its DOODLE is different: it
   starts from the default artwork in default-drawings.js (see DEFAULT
   DRAWINGS above), is edited in memory only, and is never saved. A book
   added to SKETCHBOOKS gets all of this automatically.
   ------------------------------------------------------------- */
const BOOK_COLOURS = [
  { id: "beige", label: "Beige", hex: "#E5D5CA" },
  { id: "cream-yellow", label: "Cream yellow", hex: "#FEF1D1" },
  { id: "pale-green", label: "Pale green", hex: "#E4F0C9" },
  { id: "soft-mint", label: "Soft mint", hex: "#D0EAE8" },
  { id: "pale-blue", label: "Pale blue", hex: "#D2E5F3" },
  { id: "light-lavender", label: "Light lavender", hex: "#E2D6F3" },
  { id: "soft-pink", label: "Soft pink", hex: "#FBCDCF" },
];

// The two drawing brushes (plus the eraser). `size` is a fraction of the
// book's width: the pen is ~3.6px on a 290px-wide book, the crayon a bit
// thicker.
const BOOK_BRUSHES = {
  pen: { label: "Regular pen", size: 0.0125 },
  crayon: { label: "Crayon", size: 0.026 },
  eraser: { label: "Eraser", size: 0.045 },
};

// Colours both brushes can use. Black is picked to start with.
const BOOK_DRAW_COLOURS = [
  { id: "black", label: "Black", hex: "#2D2926" },
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "khaki-green", label: "Khaki green", hex: "#3E4827" },
  { id: "light-green", label: "Light green", hex: "#80E0A7" },
  { id: "light-blue", label: "Light blue", hex: "#5BC2E7" },
  { id: "light-pink", label: "Light pink", hex: "#E9B8E5" },
  { id: "fluorescent-yellow", label: "Fluorescent yellow", hex: "#FFFF2D" },
  { id: "ivory", label: "Ivory", hex: "#F2EEC9" },
];

// A small seeded random-number generator: the same seed always gives the
// same numbers, so a crayon stroke is redrawn identically (after a refresh,
// an undo or a resize) instead of looking different each time.
const seededRandom = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// The crayon's "paper tooth": a small tile of random speckles that is
// punched out of every crayon stroke, so the wax looks broken and grainy
// all the way along. Made once and shared.
let crayonGrainTile = null;
const getCrayonGrain = () => {
  if (crayonGrainTile) return crayonGrainTile;
  const size = 128;
  const tile = document.createElement("canvas");
  tile.width = tile.height = size;
  const tileCtx = tile.getContext("2d");
  const image = tileCtx.createImageData(size, size);
  const rand = seededRandom(20261003);
  for (let i = 0; i < size * size; i++) {
    image.data[i * 4 + 3] = rand() < 0.26 ? 150 + rand() * 105 : 0;
  }
  tileCtx.putImageData(image, 0, 0);
  tileCtx.fillStyle = "#000";
  for (let i = 0; i < 140; i++) {
    // a few bigger clumps
    tileCtx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 2, 2);
  }
  crayonGrainTile = tile;
  return tile;
};

/* -------------------------------------------------------------
   DEFAULT DRAWINGS (the permanent starting artwork)
   -------------------------------------------------------------
   The doodles that every visitor sees — on the page background and on
   each sketchbook cover — are stroke data kept in the file
   default-drawings.js (window.DEFAULT_DRAWINGS), which ships with the
   website, so they appear on any computer. Each page load copies them into
   editable in-memory canvases; visitors can draw over, erase or clear them
   for the length of their visit, but NOTHING a visitor does is saved
   anywhere (no localStorage, sessionStorage, cookies or IndexedDB) — a
   refresh brings back the original artwork. The defaults can only change
   by editing default-drawings.js itself.
   ------------------------------------------------------------- */
const DEFAULT_DRAWINGS = window.DEFAULT_DRAWINGS || {};

// A fresh copy of the default strokes for the page background
// ("background") or a cover (its storageId), as a plain array.
const getDefaultStrokes = (which) => {
  const list = which === "background" ? DEFAULT_DRAWINGS.background : (DEFAULT_DRAWINGS.covers || {})[which];
  return Array.isArray(list) ? JSON.parse(JSON.stringify(list)) : [];
};

const bookStorage = {
  read(kind, book) {
    try {
      return localStorage.getItem(`sketchbook${kind}:${book.storageId || book.id}`);
    } catch (error) {
      return null; // storage blocked: everything still works for this visit
    }
  },
  write(kind, book, value) {
    try {
      const key = `sketchbook${kind}:${book.storageId || book.id}`;
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (error) {
      // blocked or full — the change just won't be remembered
    }
  },
};

// The shared state the carousel checks: while a book is being drawn on,
// the arrows, sliding and opening are all locked.
const bookDrawing = { index: -1 };

// One tiny hidden <svg> holds a colour filter per pastel. Each filter
// multiplies the grey cover picture by that colour (keeping its alpha).
const tintFilterId = (hex) => `cover-tint-${hex.slice(1).toLowerCase()}`;

const ensureTintFilter = (hex) => {
  const id = tintFilterId(hex);
  if (document.getElementById(id)) return id;

  const SVG = "http://www.w3.org/2000/svg";
  let defs = document.getElementById("cover-tint-filters");
  if (!defs) {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    defs = document.createElementNS(SVG, "defs");
    defs.id = "cover-tint-filters";
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const filter = document.createElementNS(SVG, "filter");
  filter.id = id;
  filter.setAttribute("color-interpolation-filters", "sRGB");
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", "100%");
  filter.setAttribute("height", "100%");
  const matrix = document.createElementNS(SVG, "feColorMatrix");
  matrix.setAttribute("type", "matrix");
  // new red/green/blue = the pastel's red/green/blue x the cover's brightness; alpha unchanged
  matrix.setAttribute(
    "values",
    [r, g, b].map((c) => `${c * 0.3} ${c * 0.59} ${c * 0.11} 0 0`).join(" ") + " 0 0 0 1 0"
  );
  filter.appendChild(matrix);
  defs.appendChild(filter);
  return id;
};

const bookIcons = {
  palette:
    '<path d="M12 3.2c-5 0-8.8 3.6-8.8 8 0 4.6 3.8 8 8.2 8 1.6 0 2.2-.9 2-1.9-.3-1.2.5-2.1 1.6-2.1h2c1.9 0 3.6-1.2 3.6-3.4 0-4.2-3.7-8.6-8.6-8.6z"/><circle cx="7.6" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="10.4" cy="7.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.8" cy="7.4" r="1.1" fill="currentColor" stroke="none"/>',
  theme: '<circle cx="12" cy="12" r="7.8"/><path d="M12 4.2a7.8 7.8 0 0 0 0 15.6z" fill="currentColor"/>',
  wave: '<path d="M2.5 9.5c2-2.4 3.8-2.4 5.8 0s3.8 2.4 5.8 0 3.8-2.4 5.4 0"/><path d="M2.5 15c2-2.4 3.8-2.4 5.8 0s3.8 2.4 5.8 0 3.8-2.4 5.4 0"/>',
  plain: '<rect x="5" y="4.5" width="14" height="15" rx="2.2"/>',
  pencil:
    '<path d="M4.2 19.8l.9-4.1L16.3 4.5a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5L8.3 18.9z"/><path d="M14.4 6.4l3.2 3.2"/>',
  eraser:
    '<path d="M5.4 14.4l8.3-8.3a1.8 1.8 0 0 1 2.5 0l2.7 2.7a1.8 1.8 0 0 1 0 2.5l-6.6 6.6H8.6z"/><path d="M9.7 10.1l5.2 5.2"/><path d="M6.5 20h12"/>',
  undo: '<path d="M9 5.5L4.5 10 9 14.5"/><path d="M5 10h9.5a4.8 4.8 0 0 1 0 9.6H11"/>',
  clear:
    '<path d="M5 7h14"/><path d="M9.6 7V4.8h4.8V7"/><path d="M6.8 7l.8 12.4h8.8L17.2 7"/><path d="M10.3 10.8v5.4M13.7 10.8v5.4"/>',
  done: '<path d="M5 12.6l4.6 4.6L19 7.6"/>',
};

const makeIcon = (name, fill) => {
  const html = bookIcons[name];
  return (
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill || "none"}" stroke="currentColor" ` +
    `stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${html}</svg>`
  );
};

const makeToolButton = (className, label, iconName, iconFill) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `book-tool ${className}`;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = makeIcon(iconName, iconFill);
  return button;
};

// Builds the colour layer, the doodle canvas and the buttons for ONE book
// and wires them up. Returns a few handles the carousel uses.
//   item / visual / hoverLayer = the book's elements from the carousel
//   onDrawingChange = called whenever drawing mode starts or stops
const createBookCustomiser = (book, index, item, visual, hoverLayer, onDrawingChange) => {
  // ---------- the two picture layers (inside the hover layer, so they
  // move, scale and tilt with the cover exactly like the PNG does) ----------
  const tint = document.createElement("img");
  tint.className = "sketchbook-tint";
  tint.src = book.coverImage || book.closedImage;
  tint.alt = "";
  tint.hidden = true;

  const canvas = document.createElement("canvas");
  canvas.className = "sketchbook-doodle";
  canvas.setAttribute("aria-hidden", "true");

  // Three invisible dots at the picture's top-left, top-right and
  // bottom-left corners. Their on-screen positions (which already include
  // every scale/tilt) tell us where a pointer is on the cover.
  const corners = ["tl", "tr", "bl"].map((name) => {
    const dot = document.createElement("i");
    dot.className = `sketchbook-corner sketchbook-corner--${name}`;
    return dot;
  });
  const [cornerTL, cornerTR, cornerBL] = corners;

  hoverLayer.append(tint, canvas, ...corners);

  // ---------- the buttons ----------
  const tools = document.createElement("div");
  tools.className = "book-tools";
  tools.setAttribute("role", "group");
  tools.setAttribute("aria-label", `Customise the ${book.title} sketchbook`);

  const paletteButton = makeToolButton("book-tool--palette", `Change the ${book.title} cover colour`, "palette");
  paletteButton.setAttribute("aria-expanded", "false");
  const pencilButton = makeToolButton("book-tool--pencil", `Draw on the ${book.title} cover`, "pencil");

  const swatches = document.createElement("div");
  swatches.className = "book-swatches";
  swatches.setAttribute("role", "group");
  swatches.setAttribute("aria-label", `${book.title} cover colour`);
  swatches.hidden = true;

  const swatchOptions = [
    { id: "original", label: `Original ${book.title} cover colour (reset)`, hex: book.originalColour || "#d9cdb8" },
    ...BOOK_COLOURS,
  ];
  const swatchButtons = swatchOptions.map((option) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "book-swatch";
    swatch.style.background = option.hex;
    swatch.dataset.colour = option.id;
    swatch.setAttribute("aria-label", option.label);
    swatch.title = option.id === "original" ? "Original colour" : option.label;
    swatch.addEventListener("click", () => chooseColour(option.id));
    swatches.appendChild(swatch);
    return swatch;
  });

  tools.append(paletteButton, swatches, pencilButton);

  const bar = document.createElement("div");
  bar.className = "book-draw-bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", `Draw on the ${book.title} cover`);
  const penButton = makeToolButton("book-tool--pen", BOOK_BRUSHES.pen.label, "pencil", "#221d19");
  const crayonButton = makeToolButton("book-tool--crayon", BOOK_BRUSHES.crayon.label, "pencil", "#fffdf7");
  const eraserButton = makeToolButton("book-tool--eraser", BOOK_BRUSHES.eraser.label, "eraser");
  const undoButton = makeToolButton("book-tool--undo", "Undo", "undo");
  const clearButton = makeToolButton("book-tool--clear", "Clear drawing", "clear");
  const doneButton = makeToolButton("book-tool--done", "Done drawing", "done");
  const brushButtons = { pen: penButton, crayon: crayonButton, eraser: eraserButton };

  const drawTools = document.createElement("div");
  drawTools.className = "book-draw-tools";
  drawTools.append(penButton, crayonButton, eraserButton, undoButton, clearButton, doneButton);

  // The eight drawing colours, in a compact grid under the tools.
  const drawColours = document.createElement("div");
  drawColours.className = "book-draw-colours";
  drawColours.setAttribute("role", "group");
  drawColours.setAttribute("aria-label", "Drawing colour");
  const colourButtons = BOOK_DRAW_COLOURS.map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "book-colour";
    button.style.background = option.hex;
    button.dataset.colour = option.id;
    button.setAttribute("aria-label", option.label);
    button.title = option.label;
    button.addEventListener("click", () => setColour(option.id));
    drawColours.appendChild(button);
    return button;
  });

  bar.append(drawTools, drawColours);

  const status = document.createElement("p");
  status.className = "book-tools__status";
  status.setAttribute("role", "status");

  item.insertBefore(tools, visual.nextSibling);
  item.insertBefore(bar, tools.nextSibling);
  item.insertBefore(status, bar.nextSibling);

  // ---------- COLOUR ----------
  let colourId = "original";

  const applyColour = () => {
    const option = BOOK_COLOURS.find((colour) => colour.id === colourId);
    if (option) {
      tint.style.filter = `url(#${ensureTintFilter(option.hex)})`;
      tint.hidden = false;
    } else {
      tint.hidden = true; // original: the real PNG shows as it always did
    }
    swatchButtons.forEach((swatch) => {
      swatch.setAttribute("aria-pressed", swatch.dataset.colour === colourId);
    });
  };

  function chooseColour(id) {
    colourId = BOOK_COLOURS.some((colour) => colour.id === id) ? id : "original";
    applyColour();
    bookStorage.write("Colour", book, colourId === "original" ? null : colourId);
  }

  const setPaletteOpen = (open) => {
    swatches.hidden = !open;
    paletteButton.setAttribute("aria-expanded", open);
    syncCustomising();
  };
  const isPaletteOpen = () => !swatches.hidden;

  paletteButton.addEventListener("click", () => setPaletteOpen(!isPaletteOpen()));

  const saved = bookStorage.read("Colour", book);
  if (BOOK_COLOURS.some((colour) => colour.id === saved)) colourId = saved;
  applyColour();

  // The buttons stay on screen while the palette or drawing is in use,
  // even if the pointer wanders off the book.
  function syncCustomising() {
    item.classList.toggle("is-customising", isPaletteOpen() || drawing);
  }

  // ---------- DOODLE ----------
  let strokes = []; // finished strokes: { t: "pen"|"crayon"|"eraser", c: colour, s: size, k: seed, p: [x, y, x, y, …] }
  let history = []; // earlier versions of `strokes`, for Undo
  let current = null; // the stroke being drawn right now
  let brush = "pen"; // which tool is selected…
  let lastBrush = "pen"; // …and the last pen/crayon, for when a colour is picked while erasing
  let drawColour = BOOK_DRAW_COLOURS[0].id; // …and, separately, which colour
  let drawing = false;
  let activePointer = null;
  let frame = 0;

  const ctx = canvas.getContext("2d");

  // Off-screen canvases (same size as the visible one):
  //   layer   every finished stroke, drawn once and kept, so drawing a new
  //           stroke never has to redraw the old ones
  //   live    the crayon stroke in progress (before its grain is punched out)
  //   replay  scratch space for redrawing a saved crayon stroke
  //   scratch where a crayon stroke gets its grain
  const makeLayer = () => {
    const element = document.createElement("canvas");
    return [element, element.getContext("2d")];
  };
  const [layer, layerCtx] = makeLayer();
  const [live, liveCtx] = makeLayer();
  const [replay, replayCtx] = makeLayer();
  const [scratch, scratchCtx] = makeLayer();

  const colourHex = (stroke) => (/^#[0-9a-f]{6}$/i.test(stroke.c) ? stroke.c : BOOK_DRAW_COLOURS[0].hex);

  // The cover-shaped mask the doodle is clipped to.
  const maskImage = new Image();
  let maskReady = false;
  maskImage.addEventListener("load", () => {
    maskReady = true;
    render();
  });
  maskImage.src = book.coverImage || book.closedImage;

  // REGULAR PEN and ERASER: a smooth, solid, round-capped line.
  const paintStroke = (g, stroke) => {
    const w = canvas.width;
    const h = canvas.height;
    const pts = stroke.p;
    g.globalCompositeOperation = stroke.t === "eraser" ? "destination-out" : "source-over";
    g.strokeStyle = g.fillStyle = stroke.t === "eraser" ? "#000" : colourHex(stroke);
    g.lineWidth = stroke.s * w;
    g.lineCap = g.lineJoin = "round";

    if (pts.length <= 2) {
      g.beginPath(); // a single tap leaves a dot
      g.arc(pts[0] * w, pts[1] * h, g.lineWidth / 2, 0, Math.PI * 2);
      g.fill();
      return;
    }
    g.beginPath();
    g.moveTo(pts[0] * w, pts[1] * h);
    // Curve through the midpoints of the points, so the line looks smooth
    for (let i = 2; i < pts.length - 2; i += 2) {
      g.quadraticCurveTo(
        pts[i] * w,
        pts[i + 1] * h,
        ((pts[i] + pts[i + 2]) / 2) * w,
        ((pts[i + 1] + pts[i + 3]) / 2) * h
      );
    }
    g.lineTo(pts[pts.length - 2] * w, pts[pts.length - 1] * h);
    g.stroke();
  };

  // CRAYON: instead of one smooth line, the stroke is built from lots of
  // tiny flecks of wax scattered along the path, sparser and more ragged
  // towards the edges, with a slow pressure wobble (some stretches heavier,
  // some lighter). Then the paper-grain tile is punched out of it. Every
  // random choice comes from the stroke's own seed, so it always redraws
  // identically. `st` remembers how far along the path we've got, so a
  // stroke in progress only has to add its NEW points.
  const newCrayonState = (stroke) => {
    const rand = seededRandom(stroke.k || 1);
    return { rand, phase1: rand() * 6.283, phase2: rand() * 6.283, i: 0, started: false, x: 0, y: 0, carry: 0, dist: 0 };
  };

  const stampCrayon = (g, stroke, st, x, y, extra) => {
    const width = stroke.s * canvas.width;
    const radius = width / 2;
    const pressure = 0.78 + 0.22 * Math.sin(st.dist * 0.05 + st.phase1) * Math.sin(st.dist * 0.017 + st.phase2);
    const flecks = Math.round(40 * pressure * extra);
    for (let n = 0; n < flecks; n++) {
      const angle = st.rand() * 6.283;
      const reach = Math.sqrt(st.rand());
      if (st.rand() < reach * reach * reach * 0.55) continue; // the edge breaks up
      const size = width * (0.06 + 0.09 * st.rand());
      g.globalAlpha = Math.min(1, (0.5 + 0.5 * st.rand()) * (0.65 + 0.35 * pressure));
      g.fillRect(
        x + Math.cos(angle) * radius * 1.04 * reach - size / 2,
        y + Math.sin(angle) * radius * 1.04 * reach - size / 2,
        size,
        size * (0.7 + 0.6 * st.rand())
      );
    }
    g.globalAlpha = 1;
  };

  const stampCrayonPoints = (g, stroke, st) => {
    const w = canvas.width;
    const h = canvas.height;
    const pts = stroke.p;
    const step = Math.max(stroke.s * w * 0.18, 0.8);
    g.globalCompositeOperation = "source-over";
    g.fillStyle = colourHex(stroke);
    if (!st.started && pts.length >= 2) {
      st.started = true;
      st.x = pts[0] * w;
      st.y = pts[1] * h;
      st.i = 2;
      stampCrayon(g, stroke, st, st.x, st.y, 2.2); // pressing down: a heavier start (and a proper dot for a tap)
    }
    while (st.started && st.i < pts.length) {
      const nx = pts[st.i] * w;
      const ny = pts[st.i + 1] * h;
      const dx = nx - st.x;
      const dy = ny - st.y;
      const length = Math.hypot(dx, dy);
      let pos = step - st.carry; // distance along this piece to the next fleck-stamp
      let lastPos = -st.carry;
      while (pos <= length) {
        stampCrayon(g, stroke, st, st.x + (dx * pos) / length, st.y + (dy * pos) / length, 1);
        st.dist += step;
        lastPos = pos;
        pos += step;
      }
      st.carry = length - lastPos;
      st.x = nx;
      st.y = ny;
      st.i += 2;
    }
  };

  // Punch the grain out of the flecks and lay the result on `target`.
  const compositeCrayon = (target, stamps) => {
    const w = canvas.width;
    const h = canvas.height;
    scratchCtx.globalCompositeOperation = "source-over";
    scratchCtx.clearRect(0, 0, w, h);
    scratchCtx.drawImage(stamps, 0, 0);
    const grain = scratchCtx.createPattern(getCrayonGrain(), "repeat");
    if (grain && grain.setTransform) grain.setTransform(new DOMMatrix().scale(w / 600));
    scratchCtx.globalCompositeOperation = "destination-out";
    scratchCtx.fillStyle = grain;
    scratchCtx.fillRect(0, 0, w, h);
    scratchCtx.globalCompositeOperation = "source-over";
    target.globalCompositeOperation = "source-over";
    target.drawImage(scratch, 0, 0);
  };

  // A whole finished stroke, from scratch, onto `g`.
  const paintFull = (g, stroke) => {
    if (stroke.t === "crayon") {
      replayCtx.clearRect(0, 0, canvas.width, canvas.height);
      stampCrayonPoints(replayCtx, stroke, newCrayonState(stroke));
      compositeCrayon(g, replay);
    } else {
      paintStroke(g, stroke);
    }
  };

  // The stroke being drawn right now, onto the visible canvas.
  const paintLive = (stroke) => {
    if (stroke.t === "crayon") {
      if (!stroke.st || stroke.stWidth !== canvas.width) {
        liveCtx.clearRect(0, 0, canvas.width, canvas.height);
        stroke.st = newCrayonState(stroke);
        stroke.stWidth = canvas.width;
      }
      stampCrayonPoints(liveCtx, stroke, stroke.st);
      compositeCrayon(ctx, live);
    } else {
      paintStroke(ctx, stroke);
    }
  };

  const rebuildLayer = () => {
    if (!canvas.width) return;
    layerCtx.globalCompositeOperation = "source-over";
    layerCtx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => paintFull(layerCtx, stroke));
  };

  const render = () => {
    frame = 0;
    if (!canvas.width) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(layer, 0, 0);
    if (current) paintLive(current);
    if (maskReady) {
      // keep only what's inside the cover shape
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    }
  };
  const scheduleRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  // Keep the canvas's pixel size matched to how big the book is drawn
  // (a little extra so it stays crisp when the book scales up).
  const resizeCanvas = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 1.25;
    const width = Math.round(canvas.clientWidth * scale);
    const height = Math.round(canvas.clientHeight * scale);
    if (!width || (width === canvas.width && height === canvas.height)) return;
    [canvas, layer, live, replay, scratch].forEach((element) => {
      element.width = width;
      element.height = height;
    });
    rebuildLayer();
    render();
  };
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvas);
  }
  // (also on plain resize/load — belt and braces for browsers that hold back observer callbacks)
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("load", resizeCanvas);

  // The cover starts with its default doodle (a copy, in memory only). The
  // strokes are never written to any storage: a visitor's edits last only
  // until the page is refreshed.
  const loadDrawing = () => {
    try {
      strokes = getDefaultStrokes(book.storageId || book.id)
        .map((s) => {
          // doodles saved before the brushes existed used "black" / "white" pens
          if (s.t === "black") return { ...s, t: "pen", c: BOOK_DRAW_COLOURS[0].hex };
          if (s.t === "white") return { ...s, t: "pen", c: "#FFFFFF" };
          return s;
        })
        .filter((s) => BOOK_BRUSHES[s.t] && Array.isArray(s.p) && s.p.length >= 2 && s.p.length % 2 === 0)
        .map((s) => ({
          t: s.t,
          c: /^#[0-9a-f]{6}$/i.test(s.c) ? s.c : BOOK_DRAW_COLOURS[0].hex,
          s: Number(s.s) || BOOK_BRUSHES[s.t].size,
          k: Number(s.k) || 1,
          p: s.p.map(Number),
        }));
    } catch (error) {
      strokes = []; // unreadable data: start with a clean cover
    }
  };

  // Where is the pointer on the cover, as 0–1 across and down the book?
  const bookPoint = (event) => {
    const o = cornerTL.getBoundingClientRect();
    const r = cornerTR.getBoundingClientRect();
    const b = cornerBL.getBoundingClientRect();
    const ux = r.left - o.left;
    const uy = r.top - o.top;
    const vx = b.left - o.left;
    const vy = b.top - o.top;
    const det = ux * vy - uy * vx;
    if (!det) return null;
    const dx = event.clientX - o.left;
    const dy = event.clientY - o.top;
    return [(dx * vy - dy * vx) / det, (ux * dy - uy * dx) / det];
  };

  const remember = () => {
    history.push(strokes.slice());
    if (history.length > 60) history.shift();
  };

  const updateButtons = () => {
    Object.entries(brushButtons).forEach(([name, button]) => button.setAttribute("aria-pressed", name === brush));
    colourButtons.forEach((button) => button.setAttribute("aria-pressed", button.dataset.colour === drawColour));
    undoButton.disabled = !history.length; // Undo only undoes the visitor's own actions
    clearButton.disabled = !strokes.length;
  };

  const addPoint = (event) => {
    const point = bookPoint(event);
    if (!point || !current) return;
    const pts = current.p;
    const lastX = pts[pts.length - 2];
    const lastY = pts[pts.length - 1];
    if (pts.length && Math.hypot(point[0] - lastX, point[1] - lastY) < 0.0015) return; // too close to matter
    pts.push(point[0], point[1]);
  };

  visual.addEventListener("pointerdown", (event) => {
    if (!drawing || activePointer !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = bookPoint(event);
    if (!point) return;
    event.preventDefault();
    activePointer = event.pointerId;
    try {
      visual.setPointerCapture(event.pointerId);
    } catch (error) {
      // fine — the stroke just ends if the pointer leaves the window
    }
    current = {
      t: brush,
      c: BOOK_DRAW_COLOURS.find((colour) => colour.id === drawColour).hex,
      s: BOOK_BRUSHES[brush].size,
      k: (Math.random() * 4294967296) >>> 0, // the crayon's own random seed
      p: [point[0], point[1]],
    };
    scheduleRender();
  });

  visual.addEventListener("pointermove", (event) => {
    if (!current || event.pointerId !== activePointer) return;
    event.preventDefault();
    const moves = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
    (moves.length ? moves : [event]).forEach(addPoint);
    scheduleRender();
  });

  // Keeps the stroke in progress: it joins the finished strokes and is
  // painted once onto the kept layer.
  const finishStroke = () => {
    const stroke = current;
    current = null;
    activePointer = null;
    delete stroke.st;
    remember();
    strokes.push(stroke);
    paintFull(layerCtx, stroke);
    updateButtons();
    render();
  };

  const endStroke = (event) => {
    if (!current || event.pointerId !== activePointer) return;
    finishStroke();
  };
  visual.addEventListener("pointerup", endStroke);
  visual.addEventListener("pointercancel", endStroke);

  // Choosing a brush keeps the colour; choosing a colour keeps the brush
  // (if the eraser was on, the colour puts you back on the last pen/crayon).
  const setBrush = (name) => {
    brush = name;
    if (name !== "eraser") lastBrush = name;
    updateButtons();
  };
  function setColour(id) {
    drawColour = id;
    if (brush === "eraser") brush = lastBrush;
    updateButtons();
  }
  penButton.addEventListener("click", () => setBrush("pen"));
  crayonButton.addEventListener("click", () => setBrush("crayon"));
  eraserButton.addEventListener("click", () => setBrush("eraser"));

  undoButton.addEventListener("click", () => {
    if (history.length) strokes = history.pop(); // (never removes the default artwork on its own)
    updateButtons();
    rebuildLayer();
    render();
  });

  clearButton.addEventListener("click", () => {
    if (!strokes.length) return;
    remember(); // so Undo can bring it back
    strokes = [];
    updateButtons();
    rebuildLayer();
    render();
  });

  const startDrawing = () => {
    if (bookDrawing.index !== -1) return;
    setPaletteOpen(false);
    bookDrawing.index = index;
    drawing = true;
    resizeCanvas();
    item.classList.add("is-drawing");
    syncCustomising();
    updateButtons();
    status.textContent = "Drawing mode on. Use Done or press Escape to finish.";
    onDrawingChange();
    penButton.focus({ preventScroll: true });
  };

  const stopDrawing = (returnFocus = true) => {
    if (!drawing) return;
    if (current) finishStroke(); // a stroke was in progress: keep it
    drawing = false;
    bookDrawing.index = -1;
    item.classList.remove("is-drawing");
    syncCustomising();
    status.textContent = "Drawing mode off.";
    onDrawingChange();
    if (returnFocus) pencilButton.focus({ preventScroll: true });
  };

  pencilButton.addEventListener("click", startDrawing);
  doneButton.addEventListener("click", () => stopDrawing());

  loadDrawing();
  updateButtons();
  resizeCanvas();

  return {
    isDrawing: () => drawing,
    stopDrawing,
    isPaletteOpen,
    closePalette: () => setPaletteOpen(false),
    contains: (node) => tools.contains(node),
  };
};

const carouselEl = document.getElementById("shelf-carousel");
const trackEl = document.getElementById("sketchbook-track");

if (carouselEl && trackEl && SKETCHBOOKS.length) {
  const viewportEl = carouselEl.querySelector(".carousel-viewport");
  const prevArrow = carouselEl.querySelector(".carousel__arrow--prev");
  const nextArrow = carouselEl.querySelector(".carousel__arrow--next");
  const labelEl = carouselEl.querySelector(".carousel__label");
  const landingEl = document.getElementById("screen-landing");

  let selectedIndex = 0;
  let isMoving = false;

  // Keeps an index inside the collection. It STOPS at either end —
  // there is deliberately no wrap-around.
  const clampIndex = (index) => Math.min(Math.max(index, 0), SKETCHBOOKS.length - 1);

  // How long a slide takes, read from --carousel-duration in styles.css
  // so the speed is only ever set in one place.
  const moveDuration = () => {
    const raw = getComputedStyle(carouselEl).getPropertyValue("--carousel-duration").trim();
    const amount = parseFloat(raw);
    if (Number.isNaN(amount)) return 650;
    return raw.endsWith("ms") ? amount : amount * 1000;
  };

  // ---- Make sure every book has somewhere to open to ----
  // The books that already have a screen in index.html (Works, Works 2,
  // About Me) keep it. Any book added to SKETCHBOOKS without one gets a
  // simple open-book screen built from its openImage.
  SKETCHBOOKS.forEach((book) => {
    if (document.getElementById(`screen-${book.id}`)) return;

    const screen = document.createElement("section");
    screen.id = `screen-${book.id}`;
    screen.className = "screen screen--book";
    screen.hidden = true;

    const back = document.createElement("button");
    back.type = "button";
    back.className = "book__back";
    back.textContent = "← Back to shelf";
    back.addEventListener("click", () => showScreen("landing"));

    const frame = document.createElement("span");
    frame.className = "book__frame";
    const img = document.createElement("img");
    img.className = "book__img";
    img.src = book.openImage;
    img.alt = `An open sketchbook: ${book.title}`;
    frame.appendChild(img);

    screen.append(back, frame);
    landingEl.parentElement.appendChild(screen);
  });

  // One customiser per book (colour + doodle buttons, section 6b). While
  // one of them is in drawing mode, the carousel is locked.
  const customisers = [];
  const isDrawing = () => bookDrawing.index !== -1;
  const onDrawingChange = () => {
    carouselEl.classList.toggle("is-drawing-mode", isDrawing());
    updateArrows();
  };

  // ---- Build the row of books from the array ----
  // .sketchbook-item  = permanent small up/down + tilt (styles.css)
  // .sketchbook-visual = the button; takes the selected scale + hover
  const items = SKETCHBOOKS.map((book, index) => {
    const item = document.createElement("div");
    item.className = "sketchbook-item";

    const visual = document.createElement("button");
    visual.type = "button";
    visual.className = "sketchbook-visual";

    const img = document.createElement("img");
    img.src = book.closedImage;
    img.alt = book.alt || `${book.title} sketchbook, closed`;
    img.addEventListener("load", () => positionTrack(false)); // re-centre once the picture is in

    // The picture sits in an inner "hover" layer, so the hover lift/scale
    // stacks ON TOP of the selected-book scale on .sketchbook-visual
    // instead of replacing it (see styles.css).
    const hoverLayer = document.createElement("span");
    hoverLayer.className = "sketchbook-hover";
    hoverLayer.appendChild(img);

    visual.appendChild(hoverLayer);
    item.appendChild(visual);

    // Cover colour + doodle layers, and the hover buttons (section 6b).
    customisers.push(createBookCustomiser(book, index, item, visual, hoverLayer, onDrawingChange));

    // The book's own title, under its cover. It lives in the same
    // wrapper as the book, so it slides along the track with it, and
    // every book (selected or not) shows its name. It's hidden from
    // screen readers because the book's button already announces the
    // name; clicking it does the same as clicking the book.
    const title = document.createElement("p");
    title.className = "sketchbook-title";
    title.textContent = book.title;
    title.setAttribute("aria-hidden", "true");
    title.addEventListener("click", () => visual.click());
    item.appendChild(title);

    trackEl.appendChild(item);

    visual.addEventListener("click", () => {
      if (isMoving || isDrawing()) return; // drawing on a cover must never open or move a book
      if (index === selectedIndex) {
        showScreen(book.id); // already centred: open it
      } else {
        selectBook(index); // otherwise slide it to the centre first
      }
    });

    return item;
  });

  // Slides the whole track so the selected book's centre is the
  // viewport's centre. animate = false jumps there with no transition
  // (first load, resizing).
  const positionTrack = (animate) => {
    const viewportWidth = viewportEl.clientWidth;
    if (!viewportWidth) return; // the home screen is hidden right now

    const item = items[selectedIndex];
    const bookCentre = item.offsetLeft + item.offsetWidth / 2;
    const x = viewportWidth / 2 - bookCentre;

    if (!animate) trackEl.classList.add("is-instant");
    trackEl.style.transform = `translateX(${x}px)`;
    if (!animate) {
      void trackEl.offsetWidth; // apply it before the transition comes back
      trackEl.classList.remove("is-instant");
    }
  };

  const updateSelected = () => {
    items.forEach((item, index) => {
      const isSelected = index === selectedIndex;
      item.classList.toggle("is-selected", isSelected);
      item.querySelector(".sketchbook-visual").setAttribute(
        "aria-label",
        isSelected
          ? `Open the ${SKETCHBOOKS[index].title} sketchbook`
          : `Slide the ${SKETCHBOOKS[index].title} sketchbook to the centre`
      );
    });
  };

  // Greyed out at the two ends, and while the track is sliding.
  const updateArrows = () => {
    prevArrow.disabled = isMoving || isDrawing() || selectedIndex === 0;
    nextArrow.disabled = isMoving || isDrawing() || selectedIndex === SKETCHBOOKS.length - 1;
  };

  const selectBook = (requestedIndex) => {
    const target = clampIndex(requestedIndex);
    if (isMoving || isDrawing() || target === selectedIndex) return;

    isMoving = true;
    const focusedBefore = document.activeElement;
    selectedIndex = target;

    labelEl.classList.add("is-changing"); // the old name fades out while the track slides
    updateSelected();
    updateArrows();
    positionTrack(true);

    // Once the track has settled: show the new name and re-enable the
    // arrows. A disabled button can't keep keyboard focus, so hand it
    // back to the same arrow if it's still usable, or to the selected
    // book if that arrow has just run out of road.
    setTimeout(() => {
      labelEl.textContent = SKETCHBOOKS[selectedIndex].title;
      labelEl.classList.remove("is-changing");
      isMoving = false;
      updateArrows();

      if (focusedBefore === prevArrow || focusedBefore === nextArrow) {
        if (focusedBefore.disabled) {
          items[selectedIndex].querySelector(".sketchbook-visual").focus();
        } else {
          focusedBefore.focus();
        }
      }
    }, moveDuration());
  };

  prevArrow.addEventListener("click", () => selectBook(selectedIndex - 1));
  nextArrow.addEventListener("click", () => selectBook(selectedIndex + 1));

  // Left/Right arrow keys also move along the row while focus is inside it.
  carouselEl.addEventListener("keydown", (event) => {
    if (isDrawing()) return; // arrow keys are locked while drawing
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectBook(selectedIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectBook(selectedIndex - 1);
    }
  });

  // ---- Trackpad swipe ----
  // A sideways two-finger swipe ANYWHERE on the shelf screen (the whole
  // area under the header, edge to edge, down to the bottom of the window,
  // including the empty background) does exactly what the arrow buttons
  // do: it just calls selectBook(), so the slide, the selected-book
  // enlargement and the timing are the existing ones. Swiping left
  // (content moving left) goes to the NEXT book, right to the previous
  // one; the row still stops at both ends.
  //
  // Recognising a swipe (made forgiving, because real trackpads send lots
  // of small, slightly diagonal wheel events):
  // - An event counts as sideways when its sideways amount is at least
  //   SWIPE_RATIO (60%) of its vertical amount. Only obviously-vertical
  //   events are ignored — and they're left completely alone, so ordinary
  //   vertical movement is never blocked.
  // - Sideways amounts are ADDED UP across the events of one gesture (tiny
  //   values included). The total is only forgotten after SWIPE_TIMEOUT ms
  //   with no events, or if the swipe changes direction. Once it passes
  //   SWIPE_THRESHOLD px, the book changes and the total resets at once.
  // - Wheel values are converted to pixels whatever deltaMode reports.
  // - preventDefault() is used only on sideways events, to stop the browser
  //   treating the swipe as a back/forward gesture.
  //
  // One gesture = one book:
  // - While the carousel is sliding (the arrows' own rule), input is ignored.
  // - After a change, the trackpad's coasting ("momentum") is ignored too:
  //   a fresh swipe is only accepted once the events have stopped for
  //   SWIPE_TIMEOUT ms, or when they clearly speed up again or reverse
  //   direction (momentum only ever fades out in the same direction). So
  //   there's no fixed waiting time — a new swipe works the moment the
  //   slide has finished.
  //
  // Off when: a book is open (this screen is hidden), a drawing is in
  // progress, a colour palette or the Work dropdown is open, or the pointer
  // is on a button, link, menu, swatch or canvas (the books themselves
  // count as the shelf, not as controls). The header and the
  // background-colour button aren't inside this screen at all.
  const SWIPE_THRESHOLD = 15; // px of sideways movement needed
  const SWIPE_RATIO = 0.6; // sideways must be at least this share of the vertical amount
  const SWIPE_TIMEOUT = 180; // ms with no wheel events before an unfinished swipe is forgotten

  let swipeTotal = 0;
  let lastWheelTime = 0;
  let momentumGuard = false; // true after a change, until a genuinely new swipe starts
  let momentumLevel = 0; // how big the recent sideways events were (fades as they fade)
  let lastSwipeSign = 0;

  landingEl.addEventListener(
    "wheel",
    (event) => {
      if (landingEl.hidden || event.ctrlKey) return; // (ctrl + wheel is pinch-zoom)
      if (isDrawing() || customisers.some((customiser) => customiser.isPaletteOpen())) return;
      if (document.getElementById("work-dropdown")?.classList.contains("is-open")) return;
      if (
        event.target.closest(
          "button:not(.sketchbook-visual), a, input, select, textarea, canvas, [role='menu'], [role='toolbar'], .book-tools, .book-draw-bar, .book-swatches"
        )
      ) {
        return;
      }

      // Convert to pixels: deltaMode 1 = lines, 2 = pages.
      const unitX = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1;
      const unitY = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const dx = event.deltaX * unitX;
      const dy = event.deltaY * unitY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // No real sideways movement, or obviously vertical: not ours.
      if (absX < 0.3 || absX < absY * SWIPE_RATIO) return;

      event.preventDefault(); // a sideways swipe on the shelf

      const now = performance.now();
      if (now - lastWheelTime > SWIPE_TIMEOUT) {
        // the previous gesture is over: start completely fresh
        swipeTotal = 0;
        momentumGuard = false;
        momentumLevel = 0;
      }
      lastWheelTime = now;

      const sign = Math.sign(dx);

      // Sliding right now: ignore, but keep tracking the coasting.
      if (isMoving) {
        swipeTotal = 0;
        momentumGuard = true;
        momentumLevel = Math.max(absX, momentumLevel * 0.85);
        lastSwipeSign = sign;
        return;
      }

      // Just after a change: skip the coasting, unless this is clearly a new swipe.
      if (momentumGuard) {
        const isNewSwipe = sign !== lastSwipeSign || (absX >= 4 && absX > momentumLevel * 1.5 + 2);
        momentumLevel = Math.max(absX, momentumLevel * 0.85);
        lastSwipeSign = sign;
        if (!isNewSwipe) return;
        momentumGuard = false;
        swipeTotal = 0;
      }

      // Add it up (a change of direction starts the total again).
      if (sign !== Math.sign(swipeTotal)) swipeTotal = 0;
      swipeTotal += dx;
      momentumLevel = Math.max(absX, momentumLevel * 0.85);
      lastSwipeSign = sign;

      if (Math.abs(swipeTotal) >= SWIPE_THRESHOLD) {
        const direction = swipeTotal > 0 ? 1 : -1;
        swipeTotal = 0; // reset straight away
        momentumGuard = true; // the rest of this swipe's coasting won't count
        selectBook(selectedIndex + direction); // same as the arrow buttons
      }
    },
    { passive: false }
  );

  // The background drawing (section 9) also locks the carousel while it's
  // active; it announces start/stop with this event.
  document.addEventListener("drawing:change", onDrawingChange);

  // Customising: Escape finishes drawing (or closes a palette) before it
  // does anything else — capture phase, like the background switcher — and
  // clicking elsewhere closes an open palette. Leaving the home screen
  // (e.g. via the Work / About buttons) also ends drawing.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;
      const drawingBook = customisers.find((customiser) => customiser.isDrawing());
      const paletteBook = customisers.find((customiser) => customiser.isPaletteOpen());
      if (!drawingBook && !paletteBook) return;
      event.stopImmediatePropagation();
      if (drawingBook) drawingBook.stopDrawing();
      else paletteBook.closePalette();
    },
    true
  );

  document.addEventListener("click", (event) => {
    customisers.forEach((customiser) => {
      if (customiser.isPaletteOpen() && !customiser.contains(event.target)) customiser.closePalette();
    });
  });

  document.addEventListener(
    "screen:shown",
    (event) => {
      if (event.target === landingEl) return;
      customisers.forEach((customiser) => {
        customiser.stopDrawing(false);
        customiser.closePalette();
      });
    },
    true
  );

  // Re-centre (instantly) whenever the window/viewport changes size,
  // when the home screen comes back after an open book, and once the
  // page (images, fonts) has finished loading.
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => positionTrack(false)).observe(viewportEl);
  } else {
    window.addEventListener("resize", () => positionTrack(false));
  }
  landingEl.addEventListener("screen:shown", () => positionTrack(false));
  window.addEventListener("load", () => positionTrack(false));

  updateSelected();
  updateArrows();
  labelEl.textContent = SKETCHBOOKS[selectedIndex].title;
  positionTrack(false);
}

/* -------------------------------------------------------------
   7. BACKGROUND COLOUR SWITCHER (bottom-left corner)
   -------------------------------------------------------------
   A palette button that opens six colour dots. Choosing one sets
   data-bg on <html>; styles.css has an html[data-bg="..."] rule per
   colour that swaps the --page-bg variable (and so the page background,
   which fades over ~420ms). The choice is remembered in localStorage and
   put back on the next visit by a small script in <head> (so there's no
   flash of the default). This changes ONLY the background colour.

   To rename a colour or change the order, edit the list below; to change
   a colour's actual value, edit its --bg-... variable in styles.css.
   ------------------------------------------------------------- */
const BG_STORAGE_KEY = "pageBackground";

const BACKGROUNDS = [
  { id: "cream", label: "Original warm cream" },
  { id: "golden", label: "Warm golden beige" },
  { id: "blush", label: "Soft blush pink" },
  { id: "coral", label: "Coral pink" },
  { id: "bluegrey", label: "Pale blue-grey" },
  { id: "teal", label: "Muted teal" },
];

const bgSwitcherEl = document.getElementById("bg-switcher");

if (bgSwitcherEl) {
  const bgToggle = document.getElementById("bg-toggle");
  const bgSwatches = document.getElementById("bg-swatches");
  const rootEl = document.documentElement;

  // Which colour is in use right now ("cream" if nothing valid is saved).
  const currentBackground = () =>
    BACKGROUNDS.some((bg) => bg.id === rootEl.dataset.bg) ? rootEl.dataset.bg : "cream";

  const markSelected = () => {
    const current = currentBackground();
    bgSwatches.querySelectorAll(".bg-swatch").forEach((swatch) => {
      swatch.setAttribute("aria-pressed", swatch.dataset.bg === current);
    });
  };

  const chooseBackground = (id) => {
    rootEl.dataset.bg = id;
    markSelected();
    try {
      localStorage.setItem(BG_STORAGE_KEY, id);
    } catch (error) {
      // Storage can be blocked (e.g. private browsing) — the colour still
      // changes for this visit, it just won't be remembered.
    }
  };

  BACKGROUNDS.forEach((bg) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "bg-swatch";
    swatch.dataset.bg = bg.id;
    swatch.setAttribute("aria-label", `${bg.label} background`);
    swatch.addEventListener("click", () => chooseBackground(bg.id));
    bgSwatches.appendChild(swatch);
  });

  const isOpen = () => bgSwitcherEl.classList.contains("is-open");

  const setOpen = (open) => {
    bgSwitcherEl.classList.toggle("is-open", open);
    bgToggle.setAttribute("aria-expanded", open);
  };

  bgToggle.addEventListener("click", () => setOpen(!isOpen()));

  // Clicking anywhere outside the switcher closes it.
  document.addEventListener("click", (event) => {
    if (isOpen() && !bgSwitcherEl.contains(event.target)) setOpen(false);
  });

  // Escape closes the dots and returns focus to the button. It runs first
  // (capture phase) and stops there, so it doesn't ALSO close an open
  // sketchbook behind it.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && isOpen()) {
        event.stopImmediatePropagation();
        setOpen(false);
        bgToggle.focus();
      }
    },
    true
  );

  markSelected();
}


/* -------------------------------------------------------------
   8. "WORK" DROPDOWN (in the header)
   -------------------------------------------------------------
   Hovering (or clicking / tapping / pressing Enter or Space on) "Work"
   opens a small menu with Animation and Doodles. Choosing one opens that
   sketchbook through the normal data-open code in section 4 — no second
   copy of the books or the page turn.

   - Mouse: opens on hover and closes shortly after the pointer leaves
     (a short delay, so crossing the small gap into the menu is fine).
     Clicking "Work" toggles it too.
   - Touch: tapping "Work" toggles it (touch never counts as hovering).
   - Keyboard: Enter / Space / ↓ opens it and moves into it; ↑ ↓ (or
     ← →) move between the choices; Home / End jump to first / last;
     Escape closes it and returns to "Work"; tabbing away closes it.
   - Clicking anywhere else closes it.
   ------------------------------------------------------------- */
const workDropdownEl = document.getElementById("work-dropdown");

if (workDropdownEl) {
  const workToggleBtn = document.getElementById("work-toggle");
  const workItems = [...workDropdownEl.querySelectorAll(".nav__menu-item")];

  let closeTimer = 0;
  let ignoreHover = false; // set after a click closes it, until the pointer leaves

  const isWorkMenuOpen = () => workDropdownEl.classList.contains("is-open");

  const setWorkMenuOpen = (open) => {
    workDropdownEl.classList.toggle("is-open", open);
    workToggleBtn.setAttribute("aria-expanded", open);
  };

  const focusWorkItem = (index) => {
    const count = workItems.length;
    workItems[((index % count) + count) % count].focus();
  };

  // Hover: mouse and pen only.
  workDropdownEl.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    clearTimeout(closeTimer);
    if (!ignoreHover) setWorkMenuOpen(true);
  });

  workDropdownEl.addEventListener("pointerleave", (event) => {
    ignoreHover = false;
    if (event.pointerType === "touch") return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setWorkMenuOpen(false), 220);
  });

  // Click / tap / Enter / Space on "Work". (event.detail is 0 when it
  // was the keyboard, so the keyboard user lands inside the menu.)
  workToggleBtn.addEventListener("click", (event) => {
    clearTimeout(closeTimer);
    if (isWorkMenuOpen()) {
      setWorkMenuOpen(false);
      ignoreHover = true;
    } else {
      setWorkMenuOpen(true);
      if (event.detail === 0) focusWorkItem(0);
    }
  });

  workToggleBtn.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setWorkMenuOpen(true);
      focusWorkItem(event.key === "ArrowDown" ? 0 : workItems.length - 1);
    }
  });

  // Moving between the choices.
  workItems.forEach((item, index) => {
    item.addEventListener("keydown", (event) => {
      const moves = { ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: workItems.length - 1 };
      if (event.key in moves) {
        event.preventDefault();
        focusWorkItem(moves[event.key]);
      }
    });

    // Picking one opens the book (section 4 handles that); the menu closes.
    item.addEventListener("click", () => {
      setWorkMenuOpen(false);
      ignoreHover = true;
    });
  });

  // Tabbing out of the menu closes it.
  workDropdownEl.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !workDropdownEl.contains(event.relatedTarget)) setWorkMenuOpen(false);
  });

  // Escape closes just the menu (capture phase, like the other pop-ups),
  // so it doesn't ALSO close an open sketchbook behind it.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && isWorkMenuOpen()) {
        event.stopImmediatePropagation();
        const hadFocus = workDropdownEl.contains(document.activeElement);
        setWorkMenuOpen(false);
        ignoreHover = true;
        if (hadFocus) workToggleBtn.focus();
      }
    },
    true
  );

  // Clicking anywhere else closes it.
  document.addEventListener("click", (event) => {
    if (isWorkMenuOpen() && !workDropdownEl.contains(event.target)) setWorkMenuOpen(false);
  });
}


/* -------------------------------------------------------------
   9. DRAWING ON THE BACKGROUND
   -------------------------------------------------------------
   A small pencil button beside the background-colour button turns on
   background drawing: a transparent <canvas> that fills the whole area
   under the header sits BEHIND the sketchbooks, titles and arrows but on
   top of the background colour, so a drawing survives colour changes and
   always looks like part of the page. It only takes pointer input while
   drawing; the toolbar has the same tools and colours as the sketchbook
   covers (regular pen, crayon, eraser, undo, clear, done).

   While drawing, the carousel is locked (arrows, arrow keys, trackpad
   swipe, opening books) exactly like cover drawing — the lock is the
   shared `bookDrawing.index`, set to -2 here (-1 = nothing being drawn).

   The background starts from its default artwork (default-drawings.js)
   and visitors' edits live in memory only — nothing is saved, so a refresh
   restores the original. Strokes are numbers measured in widths of the
   page, not pixels, and redrawn at the current size (and screen
   sharpness) whenever the window changes, so nothing is blurred or
   stretched.
   ------------------------------------------------------------- */

// A drawing surface: all the stroke-making for one canvas — the smooth
// pen, the grainy crayon, the eraser, undo/clear — drawn from saved stroke
// data. Positions are measured in "page widths" (x and y both divided by
// the canvas WIDTH), so strokes keep their shape when the window resizes.
// (The sketchbook covers have their own copy of this inside
// createBookCustomiser, left exactly as it was.)
//   sizes: brush widths as a fraction of the canvas width
const createStrokeSurface = (canvas, sizes, options = {}) => {
  const ctx = canvas.getContext("2d");

  // How positions map to this canvas. By default the canvas IS the whole
  // page (x and y are measured in page widths from its top-left corner, and
  // one page width = canvas.width pixels). A floating background doodle
  // instead owns a small canvas that shows only part of the page:
  //   options.unit()    device pixels per page width
  //   options.origin    { x, y }: where the canvas's top-left sits, in page widths
  const unit = () => (options.unit ? options.unit() : canvas.width);
  const origin = options.origin || { x: 0, y: 0 };
  const X = (x) => (x - origin.x) * unit();
  const Y = (y) => (y - origin.y) * unit();
  const makeLayer = () => {
    const element = document.createElement("canvas");
    return [element, element.getContext("2d")];
  };
  const [layer, layerCtx] = makeLayer(); // finished strokes
  const [live, liveCtx] = makeLayer(); // the crayon stroke in progress
  const [replay, replayCtx] = makeLayer(); // scratch for redrawing saved crayon strokes
  const [scratch, scratchCtx] = makeLayer(); // where a crayon stroke gets its grain

  const DEFAULT_COLOUR = BOOK_DRAW_COLOURS[0].hex;
  let strokes = [];
  let history = [];
  let current = null;
  let frame = 0;
  let onChange = () => {};

  const hexOf = (stroke) => (/^#[0-9a-f]{6}$/i.test(stroke.c) ? stroke.c : DEFAULT_COLOUR);
  const pixelScale = () => Math.min(window.devicePixelRatio || 1, 2);

  // The rectangle a stroke covers (so crayon work only touches that part).
  const boundsOf = (stroke) => {
    const w = unit();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < stroke.p.length; i += 2) {
      const x = X(stroke.p[i]);
      const y = Y(stroke.p[i + 1]);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const pad = stroke.s * w * 0.75 + 2;
    const x0 = Math.max(0, Math.floor(minX - pad));
    const y0 = Math.max(0, Math.floor(minY - pad));
    const x1 = Math.min(canvas.width, Math.ceil(maxX + pad));
    const y1 = Math.min(canvas.height, Math.ceil(maxY + pad));
    return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
  };

  // REGULAR PEN and ERASER: a smooth, solid, round-capped line.
  const paintStroke = (g, stroke) => {
    const w = unit();
    const pts = stroke.p;
    g.globalCompositeOperation = stroke.t === "eraser" ? "destination-out" : "source-over";
    g.strokeStyle = g.fillStyle = stroke.t === "eraser" ? "#000" : hexOf(stroke);
    g.lineWidth = stroke.s * w;
    g.lineCap = g.lineJoin = "round";

    if (pts.length <= 2) {
      g.beginPath(); // a single tap leaves a dot
      g.arc(X(pts[0]), Y(pts[1]), g.lineWidth / 2, 0, Math.PI * 2);
      g.fill();
      return;
    }
    g.beginPath();
    g.moveTo(X(pts[0]), Y(pts[1]));
    for (let i = 2; i < pts.length - 2; i += 2) {
      g.quadraticCurveTo(
        X(pts[i]),
        Y(pts[i + 1]),
        X((pts[i] + pts[i + 2]) / 2),
        Y((pts[i + 1] + pts[i + 3]) / 2)
      );
    }
    g.lineTo(X(pts[pts.length - 2]), Y(pts[pts.length - 1]));
    g.stroke();
  };

  // CRAYON: flecks of wax scattered along the path (ragged at the edges,
  // with a slow pressure wobble), then paper grain punched out of them.
  // Every random choice comes from the stroke's own seed, so it always
  // redraws identically.
  const newCrayonState = (stroke) => {
    const rand = seededRandom(stroke.k || 1);
    return { rand, phase1: rand() * 6.283, phase2: rand() * 6.283, i: 0, started: false, x: 0, y: 0, carry: 0, dist: 0 };
  };

  const stampCrayon = (g, stroke, st, x, y, extra) => {
    const width = stroke.s * unit();
    const radius = width / 2;
    const pressure = 0.78 + 0.22 * Math.sin(st.dist * 0.05 + st.phase1) * Math.sin(st.dist * 0.017 + st.phase2);
    const flecks = Math.round(40 * pressure * extra);
    for (let n = 0; n < flecks; n++) {
      const angle = st.rand() * 6.283;
      const reach = Math.sqrt(st.rand());
      if (st.rand() < reach * reach * reach * 0.55) continue;
      const size = width * (0.06 + 0.09 * st.rand());
      g.globalAlpha = Math.min(1, (0.5 + 0.5 * st.rand()) * (0.65 + 0.35 * pressure));
      g.fillRect(
        x + Math.cos(angle) * radius * 1.04 * reach - size / 2,
        y + Math.sin(angle) * radius * 1.04 * reach - size / 2,
        size,
        size * (0.7 + 0.6 * st.rand())
      );
    }
    g.globalAlpha = 1;
  };

  const stampCrayonPoints = (g, stroke, st) => {
    const w = unit();
    const pts = stroke.p;
    const step = Math.max(stroke.s * w * 0.18, 0.8);
    g.globalCompositeOperation = "source-over";
    g.fillStyle = hexOf(stroke);
    if (!st.started && pts.length >= 2) {
      st.started = true;
      st.x = X(pts[0]);
      st.y = Y(pts[1]);
      st.i = 2;
      stampCrayon(g, stroke, st, st.x, st.y, 2.2);
    }
    while (st.started && st.i < pts.length) {
      const nx = X(pts[st.i]);
      const ny = Y(pts[st.i + 1]);
      const dx = nx - st.x;
      const dy = ny - st.y;
      const length = Math.hypot(dx, dy);
      let pos = step - st.carry;
      let lastPos = -st.carry;
      while (pos <= length) {
        stampCrayon(g, stroke, st, st.x + (dx * pos) / length, st.y + (dy * pos) / length, 1);
        st.dist += step;
        lastPos = pos;
        pos += step;
      }
      st.carry = length - lastPos;
      st.x = nx;
      st.y = ny;
      st.i += 2;
    }
  };

  // Punch the grain out of the flecks (inside `box`) and lay them on `target`.
  const compositeCrayon = (target, stamps, box) => {
    if (!box.w || !box.h) return;
    scratchCtx.globalCompositeOperation = "source-over";
    scratchCtx.clearRect(box.x, box.y, box.w, box.h);
    scratchCtx.drawImage(stamps, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
    const grain = scratchCtx.createPattern(getCrayonGrain(), "repeat");
    // grain ~1 CSS pixel, lined up with the page (not with this canvas), so a
    // doodle looks the same wherever its own small canvas happens to start
    if (grain && grain.setTransform) {
      grain.setTransform(new DOMMatrix().translate(-origin.x * unit(), -origin.y * unit()).scale(pixelScale()));
    }
    scratchCtx.globalCompositeOperation = "destination-out";
    scratchCtx.fillStyle = grain;
    scratchCtx.fillRect(box.x, box.y, box.w, box.h);
    scratchCtx.globalCompositeOperation = "source-over";
    target.globalCompositeOperation = "source-over";
    target.drawImage(scratch, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
  };

  const paintFull = (g, stroke) => {
    if (stroke.t === "crayon") {
      const box = boundsOf(stroke);
      replayCtx.clearRect(box.x, box.y, box.w, box.h);
      stampCrayonPoints(replayCtx, stroke, newCrayonState(stroke));
      compositeCrayon(g, replay, box);
    } else {
      paintStroke(g, stroke);
    }
  };

  const paintLive = (stroke) => {
    if (stroke.t === "crayon") {
      if (!stroke.st || stroke.stWidth !== canvas.width) {
        liveCtx.clearRect(0, 0, canvas.width, canvas.height);
        stroke.st = newCrayonState(stroke);
        stroke.stWidth = canvas.width;
      }
      stampCrayonPoints(liveCtx, stroke, stroke.st);
      compositeCrayon(ctx, live, boundsOf(stroke));
    } else {
      paintStroke(ctx, stroke);
    }
  };

  const rebuildLayer = () => {
    if (!canvas.width) return;
    layerCtx.globalCompositeOperation = "source-over";
    layerCtx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => paintFull(layerCtx, stroke));
  };

  const render = () => {
    frame = 0;
    if (!canvas.width) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(layer, 0, 0);
    if (current) paintLive(current);
  };
  const scheduleRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  // Match the bitmap to the canvas's size on screen x the screen's pixel
  // density (so lines are sharp on Retina displays), then redraw.
  const resize = () => {
    const scale = pixelScale();
    const width = Math.round(canvas.clientWidth * scale);
    const height = Math.round(canvas.clientHeight * scale);
    if (!width || !height || (width === canvas.width && height === canvas.height)) return;
    [canvas, layer, live, replay, scratch].forEach((element) => {
      element.width = width;
      element.height = height;
    });
    rebuildLayer();
    render();
  };

  const remember = () => {
    history.push(strokes.slice());
    if (history.length > 60) history.shift();
  };

  return {
    onChange: (callback) => (onChange = callback),
    resize,
    render,
    isDrawingStroke: () => Boolean(current),
    hasStrokes: () => strokes.length > 0,
    canUndo: () => history.length > 0, // only the visitor's own actions can be undone
    getStrokes: () => strokes,

    setStrokes(list) {
      strokes = (Array.isArray(list) ? list : [])
        .map((s) => {
          if (s && s.t === "black") return { ...s, t: "pen", c: DEFAULT_COLOUR };
          if (s && s.t === "white") return { ...s, t: "pen", c: "#FFFFFF" };
          return s;
        })
        .filter((s) => s && sizes[s.t] && Array.isArray(s.p) && s.p.length >= 2 && s.p.length % 2 === 0)
        .map((s) => ({
          t: s.t,
          c: /^#[0-9a-f]{6}$/i.test(s.c) ? s.c : DEFAULT_COLOUR,
          s: Number(s.s) || sizes[s.t],
          k: Number(s.k) || 1,
          p: s.p.map(Number),
        }));
      history = [];
      rebuildLayer();
      render();
    },

    begin(tool, colour, x, y) {
      current = { t: tool, c: colour, s: sizes[tool], k: (Math.random() * 4294967296) >>> 0, p: [x, y] };
      scheduleRender();
    },

    extend(x, y) {
      if (!current) return;
      const pts = current.p;
      if (Math.hypot(x - pts[pts.length - 2], y - pts[pts.length - 1]) < 0.0012) return; // too close to matter
      pts.push(x, y);
      scheduleRender();
    },

    // Keeps the stroke in progress.
    end() {
      if (!current) return;
      const stroke = current;
      current = null;
      delete stroke.st;
      remember();
      strokes.push(stroke);
      paintFull(layerCtx, stroke);
      render();
      onChange();
    },

    undo() {
      if (history.length) strokes = history.pop();
      rebuildLayer();
      render();
      onChange();
    },

    clear() {
      if (!strokes.length) return;
      remember(); // so Undo can bring it back
      strokes = [];
      rebuildLayer();
      render();
      onChange();
    },

    resetHistory: () => (history = []),

    // Redraw everything (used when the canvas has moved or been resized).
    rebuild() {
      rebuildLayer();
      render();
    },
  };
};

/* -------------------------------------------------------------
   FLOATING BACKGROUND DOODLES
   -------------------------------------------------------------
   The permanent background artwork is split into separate doodles, and
   each one drifts about on its own, gently: a whale, a fish, a starfish, a
   group of bubbles... Each doodle is its own small <canvas> that keeps its
   exact drawn size, colours and look and starts moving from exactly where
   it is drawn. Moving one is only a CSS transform (translate3d + rotate +
   scaleX), so nothing is re-laid-out or redrawn while they float.

   HOW THE ARTWORK IS SPLIT: strokes that touch, or sit within
   BG_GROUP_GAP of each other, belong to one doodle (so a fish body, eye
   and fin stay together). Groups made only of small round loops are
   treated as bubbles. If a doodle ever gets split wrongly, list which
   strokes belong together in default-drawings.js as
       backgroundGroups: [[0, 1, 2], [3, 4]]      (positions in `background`)
   Each listed group is kept exactly as given (together with any eraser marks
   in it); only strokes that aren't listed are split up automatically.

   MOTION: creatures glide slowly left and right (bigger = slower), drift
   up and down, change vertical direction now and then, tilt a few
   degrees either way, turn round (flip) when they change direction, and
   ease away from the edges of the area under the header — they're always
   kept completely inside it. Bubbles rise, sway sideways at their own
   speed, and when one leaves the top it quietly reappears below the
   bottom edge to rise again. Every doodle has its own speed, delay and
   timing so they never move in step.

   While background drawing is on, everything is paused exactly where it
   is (the eraser follows each doodle's current position, so you can erase
   parts of them); when drawing ends, they carry on from there. With
   "reduce motion" switched on, nothing moves and the artwork is simply
   drawn as one picture, exactly as before.
   ------------------------------------------------------------- */
const BG_GROUP_GAP = 0.025; // page widths (~36px on a 1440px window): strokes closer than this are one doodle
const BG_ART_FACES = -1; // which way the drawn creatures face: -1 = left, 1 = right

const bgSmoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const bgLerp = (a, b, t) => a + (b - a) * t;

// Splits a list of strokes into doodles. Returns [{ indices, bubbles, rect }]
// where rect = { x, y, w, h } is the doodle's box in page widths.
// `explicitGroups` (optional, from default-drawings.js) are fixed drawings: each
// is exactly the strokes listed (positions in `strokes`), never merged with
// anything else. Every stroke NOT listed is split into drawings by closeness.
const groupBackgroundStrokes = (strokes, explicitGroups) => {
  const count = strokes.length;
  const parent = strokes.map((_, i) => i);
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
  };

  // The fixed drawings first (a stroke can only be in one).
  const fixed = [];
  const taken = new Set();
  if (Array.isArray(explicitGroups)) {
    explicitGroups.forEach((group) => {
      const valid = (Array.isArray(group) ? group : []).filter(
        (i) => Number.isInteger(i) && i >= 0 && i < count && !taken.has(i)
      );
      if (!valid.length) return;
      valid.forEach((i) => taken.add(i));
      fixed.push([...valid].sort((x, y) => x - y));
    });
  }

  // Everything else: strokes whose paths come within one grid cell of each
  // other are joined (only among themselves, never into a fixed drawing).
  const cell = BG_GROUP_GAP;
  const owner = new Map();
  strokes.forEach((stroke, i) => {
    if (taken.has(i)) return;
    const visit = (x, y) => {
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const other = owner.get(`${cx + dx},${cy + dy}`);
          if (other !== undefined) union(i, other);
        }
      }
      owner.set(`${cx},${cy}`, i);
    };
    for (let k = 0; k < stroke.p.length; k += 2) {
      const x = stroke.p[k];
      const y = stroke.p[k + 1];
      if (k > 0) {
        const px = stroke.p[k - 2];
        const py = stroke.p[k - 1];
        const steps = Math.floor(Math.hypot(x - px, y - py) / (cell * 0.5));
        for (let t = 1; t <= steps; t++) visit(px + ((x - px) * t) / (steps + 1), py + ((y - py) * t) / (steps + 1));
      }
      visit(x, y);
    }
  });

  const byRoot = new Map();
  strokes.forEach((_, i) => {
    if (taken.has(i)) return;
    const root = find(i);
    if (!byRoot.has(root)) byRoot.set(root, []);
    byRoot.get(root).push(i);
  });
  const allGroups = [...fixed, ...byRoot.values()].sort((x, y) => x[0] - y[0]); // (drawn in their original order)

  const strokeBox = (stroke) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let k = 0; k < stroke.p.length; k += 2) {
      x0 = Math.min(x0, stroke.p[k]);
      x1 = Math.max(x1, stroke.p[k]);
      y0 = Math.min(y0, stroke.p[k + 1]);
      y1 = Math.max(y1, stroke.p[k + 1]);
    }
    return { x0, y0, x1, y1 };
  };

  // A small, closed, roughly round loop (or a dot) is a bubble.
  const isBubbleStroke = (stroke) => {
    if (stroke.t === "eraser") return false;
    const b = strokeBox(stroke);
    const w = b.x1 - b.x0;
    const h = b.y1 - b.y0;
    const big = Math.max(w, h);
    if (big > 0.09) return false;
    if (stroke.p.length <= 2 || big < 0.004) return true; // a dot
    const closed = Math.hypot(stroke.p[0] - stroke.p[stroke.p.length - 2], stroke.p[1] - stroke.p[stroke.p.length - 1]) < big * 0.45;
    const ratio = Math.min(w, h) / big;
    if (!closed || ratio <= 0.6) return false;

    // ...and round: its distance from the middle barely varies. (A starfish
    // or a star is closed and small too, but its points stick out.)
    const cx = (b.x0 + b.x1) / 2;
    const cy = (b.y0 + b.y1) / 2;
    let sum = 0;
    let sumSquares = 0;
    const points = stroke.p.length / 2;
    for (let k = 0; k < stroke.p.length; k += 2) {
      const radius = Math.hypot(stroke.p[k] - cx, stroke.p[k + 1] - cy);
      sum += radius;
      sumSquares += radius * radius;
    }
    const mean = sum / points;
    const spread = Math.sqrt(Math.max(0, sumSquares / points - mean * mean));
    return mean > 0 && spread / mean < 0.18;
  };

  return allGroups
    .map((indices) => {
      // The box covers what is actually drawn (pen / crayon). Eraser marks
      // don't count: any part of one outside the drawing has nothing to erase.
      const drawn = indices.filter((i) => strokes[i].t !== "eraser");
      if (!drawn.length) return null; // only eraser marks: nothing to show
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      let pad = 0;
      drawn.forEach((i) => {
        const b = strokeBox(strokes[i]);
        x0 = Math.min(x0, b.x0);
        y0 = Math.min(y0, b.y0);
        x1 = Math.max(x1, b.x1);
        y1 = Math.max(y1, b.y1);
        pad = Math.max(pad, strokes[i].s * 0.7);
      });
      pad += 0.004;
      const rect = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
      const bubbles = drawn.every((i) => isBubbleStroke(strokes[i])) && Math.max(rect.w, rect.h) < 0.2;
      return { indices, bubbles, rect };
    })
    .filter(Boolean);
};

// Builds one movable canvas per doodle and animates them.
//   host: the element the layer goes in; strokes: the default background
//   strokes; sizes: brush sizes (as the background surface uses).
const createFloatingDoodles = (host, strokes, sizes, explicitGroups) => {
  const container = document.createElement("div");
  container.className = "bg-doodles";
  container.setAttribute("aria-hidden", "true");
  host.insertBefore(container, host.firstChild);

  const dprNow = () => Math.min(window.devicePixelRatio || 1, 2);
  let W = 0; // the layer's width in CSS pixels
  let pageHeight = 0; // its height in page widths

  const doodles = [];
  let made = 0; // how many doodles have been made so far (gives each its own random numbers)

  // Makes one floating doodle from a group of strokes (see groupBackgroundStrokes).
  // quickStart: begin moving soon (used for doodles a visitor has just drawn).
  const makeDoodle = (group, sourceStrokes, quickStart) => {
    const index = made++;
    const canvas = document.createElement("canvas");
    canvas.className = "bg-doodle";
    container.appendChild(canvas);

    const doodle = {
      canvas,
      kind: group.bubbles ? "bubbles" : "creature",
      home: group.rect,
      origin: { x: group.rect.x, y: group.rect.y }, // the canvas's top-left, in page widths
      rect: { w: group.rect.w, h: group.rect.h },
      centre: { x: 0, y: 0 },
      range: { xlo: 0, xhi: 0, ylo: 0, yhi: 0 },
      state: { x: 0, y: 0, vx: 0, vy: 0, flip: 1, rot: 0 },
      t: 0,
    };
    doodle.surface = createStrokeSurface(canvas, sizes, {
      unit: () => W * dprNow(),
      origin: doodle.origin,
    });
    doodle.surface.setStrokes(group.indices.map((i) => sourceStrokes[i]));

    // Each doodle's own character, from its own random numbers.
    const rand = seededRandom(7001 + index * 7919 + ((sourceStrokes[group.indices[0]] || {}).k || 0));
    const diagonal = Math.hypot(group.rect.w, group.rect.h);
    const big = bgSmoothstep(0.06, 0.45, diagonal); // 0 = small, 1 = large
    doodle.rand = rand;
    doodle.delay = quickStart ? bgLerp(0.3, 1.5, rand()) : bgLerp(0.4, 6, rand()); // waits, perfectly still, before it starts
    if (doodle.kind === "bubbles") {
      doodle.sp = bgLerp(0.016, 0.03, rand()); // rise speed, page widths per second
      doodle.drift = bgLerp(0.006, 0.018, rand());
      doodle.driftT = bgLerp(7, 14, rand());
      doodle.phase = rand() * 6.283;
    } else {
      doodle.sp = bgLerp(0.02, 0.0065, big) * bgLerp(0.8, 1.2, rand());
      doodle.maxRot = (bgLerp(6, 2.2, big) * Math.PI) / 180;
      doodle.rotT = bgLerp(7, 15, rand());
      doodle.rotT2 = bgLerp(4, 9, rand());
      doodle.wobble = bgLerp(9, 17, rand());
      doodle.dir = BG_ART_FACES; // starts in the direction it faces, so it never starts flipped
      doodle.nextTurnAt = bgLerp(14, 40, rand());
      doodle.nextVyAt = bgLerp(3, 9, rand());
      doodle.vyTarget = 0;
    }
    doodles.push(doodle);
    return doodle;
  };

  groupBackgroundStrokes(strokes, explicitGroups).forEach((group) => makeDoodle(group, strokes, false));


  // ---- layout (only when the window changes size) ----
  const layoutDoodle = (d) => {
    const dpr = dprNow();
    // Snap the canvas to whole device pixels so it stays perfectly sharp.
    const left = Math.floor(d.home.x * W * dpr) / dpr;
    const top = Math.floor(d.home.y * W * dpr) / dpr;
    const right = Math.ceil((d.home.x + d.home.w) * W * dpr) / dpr;
    const bottom = Math.ceil((d.home.y + d.home.h) * W * dpr) / dpr;
    d.canvas.style.left = `${left}px`;
    d.canvas.style.top = `${top}px`;
    d.canvas.style.width = `${right - left}px`;
    d.canvas.style.height = `${bottom - top}px`;
    d.origin.x = left / W;
    d.origin.y = top / W;
    d.rect.w = (right - left) / W;
    d.rect.h = (bottom - top) / W;
    d.centre.x = d.origin.x + d.rect.w / 2;
    d.centre.y = d.origin.y + d.rect.h / 2;
    d.surface.resize();
    d.surface.rebuild();

    // How far it may move so that its whole box (allowing for its tilt)
    // stays inside the area under the header.
    const tilt = Math.sin(d.maxRot || 0) * Math.max(d.rect.w, d.rect.h) * 0.5 + 0.002;
    const range = {
      xlo: -d.origin.x + tilt,
      xhi: 1 - (d.origin.x + d.rect.w) - tilt,
      ylo: -d.origin.y + tilt,
      yhi: pageHeight - (d.origin.y + d.rect.h) - tilt,
    };
    if (range.xlo > range.xhi) range.xlo = range.xhi = 0;
    if (range.ylo > range.yhi) range.ylo = range.yhi = 0;
    d.range = range;
  };

  const layout = () => {
    W = container.clientWidth;
    const heightPx = container.clientHeight;
    if (!W || !heightPx) return;
    pageHeight = heightPx / W;
    doodles.forEach(layoutDoodle);
    applyTransforms();
  };

  const applyTransforms = () => {
    doodles.forEach((d) => {
      const s = d.state;
      d.canvas.style.transform = `translate3d(${(s.x * W).toFixed(2)}px, ${(s.y * W).toFixed(2)}px, 0) rotate(${s.rot.toFixed(4)}rad) scaleX(${s.flip.toFixed(4)})`;
    });
  };

  // A point on the page -> the same point in the doodle's own (home) frame,
  // undoing its current move, tilt and flip. (Used so the eraser follows it.)
  const toHome = (d, x, y) => {
    const s = d.state;
    const dx = x - d.centre.x - s.x;
    const dy = y - d.centre.y - s.y;
    const cos = Math.cos(-s.rot);
    const sin = Math.sin(-s.rot);
    const flip = Math.abs(s.flip) < 0.05 ? 0.05 * Math.sign(s.flip || 1) : s.flip;
    return [d.centre.x + (dx * cos - dy * sin) / flip, d.centre.y + (dx * sin + dy * cos)];
  };

  // ---- motion ----
  const holds = new Set(); // why the doodles are held still: "drawing", "theme" (all must be released to move)
  let stopped = false;
  let ramp = 0; // 0..1: eases the movement in after the page loads / after a pause
  let lastTime = 0;

  const clampStep = (value, delta, lo, hi) => {
    const next = value + delta;
    if (next > hi && value <= hi) return hi;
    if (next < lo && value >= lo) return lo;
    return next; // (already outside, e.g. after a resize: it just glides back in)
  };

  const moveCreature = (d, dt, m) => {
    const s = d.state;
    const r = d.range;
    d.t += dt;
    const margin = 0.015 + d.sp * 2;
    const roomX = r.xhi - r.xlo > margin * 2;
    const roomY = r.yhi - r.ylo > margin * 2;

    // Turning round: at the edges, and every so often.
    if (roomX) {
      if (d.dir > 0 && s.x > r.xhi - margin) {
        d.dir = -1;
        d.nextTurnAt = d.t + bgLerp(14, 40, d.rand());
      } else if (d.dir < 0 && s.x < r.xlo + margin) {
        d.dir = 1;
        d.nextTurnAt = d.t + bgLerp(14, 40, d.rand());
      } else if (d.t >= d.nextTurnAt) {
        d.dir *= -1;
        d.nextTurnAt = d.t + bgLerp(14, 40, d.rand());
      }
    }
    let targetVx = roomX ? d.dir * d.sp * (1 + 0.3 * Math.sin((2 * Math.PI * d.t) / d.wobble)) : 0;
    if (s.x > r.xhi) targetVx = -d.sp; // outside after a resize: head back in
    if (s.x < r.xlo) targetVx = d.sp;

    // Up and down: a new gentle target every few seconds.
    if (d.t >= d.nextVyAt) {
      d.vyTarget = (d.rand() * 2 - 1) * d.sp * 0.5;
      d.nextVyAt = d.t + bgLerp(4, 12, d.rand());
    }
    if (s.y > r.yhi - margin && d.vyTarget > 0) d.vyTarget = -Math.abs(d.vyTarget) - d.sp * 0.1;
    if (s.y < r.ylo + margin && d.vyTarget < 0) d.vyTarget = Math.abs(d.vyTarget) + d.sp * 0.1;
    let targetVy = roomY ? d.vyTarget : 0;
    if (s.y > r.yhi) targetVy = -d.sp * 0.4;
    if (s.y < r.ylo) targetVy = d.sp * 0.4;

    // Speeds ease towards their targets (this is what makes turns smooth).
    const ease = 1 - Math.exp(-dt / 1.3);
    s.vx += (targetVx - s.vx) * ease;
    s.vy += (targetVy - s.vy) * ease;
    s.x = clampStep(s.x, s.vx * dt * m, r.xlo, r.xhi);
    s.y = clampStep(s.y, s.vy * dt * m, r.ylo, r.yhi);

    // A slow tilt either way, starting from level.
    const tiltIn = bgSmoothstep(0, 4, d.t);
    s.rot = d.maxRot * (0.7 * Math.sin((2 * Math.PI * d.t) / d.rotT) + 0.3 * Math.sin((2 * Math.PI * d.t) / d.rotT2)) * tiltIn;
  };

  const moveBubbles = (d, dt, m) => {
    const s = d.state;
    const r = d.range;
    d.t += dt;
    const rise = d.sp * (1 + 0.2 * Math.sin((2 * Math.PI * d.t) / 6 + d.phase));
    const sway = d.drift * ((2 * Math.PI) / d.driftT) * Math.cos((2 * Math.PI * d.t) / d.driftT);
    s.vy = -rise;
    s.vx = sway;
    s.x = clampStep(s.x, s.vx * dt * m, r.xlo, r.xhi);
    s.y += s.vy * dt * m;

    // Gone off the top: quietly come back in from below the bottom edge.
    if (d.origin.y + d.rect.h + s.y < -0.01) {
      s.y = pageHeight + 0.02 - d.origin.y;
      s.x = Math.min(r.xhi, Math.max(r.xlo, s.x + (d.rand() - 0.5) * 0.12));
    }
  };

  const step = (dt) => {
    if (!W) return;
    const moving = holds.size === 0 && !stopped;
    if (moving) ramp = Math.min(1, ramp + dt / 1.2);
    const m = bgSmoothstep(0, 1, ramp);

    doodles.forEach((d) => {
      if (d.kind === "creature") {
        // (a turn already under way always finishes, even while paused)
        const flipTarget = d.dir === BG_ART_FACES ? 1 : -1;
        d.state.flip += (flipTarget - d.state.flip) * (1 - Math.exp(-dt / 0.2));
      }
      if (!moving) return;
      if (d.delay > 0) {
        d.delay -= dt;
        return;
      }
      if (d.kind === "creature") moveCreature(d, dt, m);
      else moveBubbles(d, dt, m);
    });
    applyTransforms();
  };

  const tick = (now) => {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    step(dt);
  };
  const start = () => {
    lastTime = performance.now();
    requestAnimationFrame(tick);
  };

  return {
    doodles,
    layout,
    toHome,
    step,
    start,

    // Forgets doodles that have been cleared or completely erased (once drawing
    // has ended there's no way to bring them back).
    pruneEmpty() {
      for (let i = doodles.length - 1; i >= 0; i--) {
        if (!doodles[i].surface.hasStrokes()) {
          doodles[i].canvas.remove();
          doodles.splice(i, 1);
        }
      }
    },

    // Turns freshly drawn strokes (a visitor's drawing) into floating
    // doodles that start exactly where they were drawn.
    add(newStrokes) {
      const groups = groupBackgroundStrokes(newStrokes).filter((group) =>
        group.indices.some((i) => newStrokes[i].t !== "eraser") // (a group of only eraser marks has nothing to show)
      );
      const added = groups.map((group) => makeDoodle(group, newStrokes, true));
      if (W) {
        added.forEach(layoutDoodle);
        applyTransforms();
      }
      return added;
    },
    // pause() freezes every doodle exactly where it is; resume() lets them carry
    // on from there (speed eases back in) once nothing else is holding them.
    pause: (reason = "drawing") => holds.add(reason),
    resume: (reason = "drawing") => {
      holds.delete(reason);
      if (holds.size === 0) ramp = 0;
    },
    stopForReducedMotion: () => (stopped = true),
  };
};

// The tools talk to this "board": one visitor-drawing layer (the static
// surface) plus every floating doodle. Pen and crayon go on the visitor
// layer; the eraser works on ALL of them (on each doodle at its current
// position), and Undo / Clear treat them as one drawing.
const createBackgroundBoard = (staticSurface, motion) => {
  const doodles = motion.doodles;
  let actions = []; // each: the surfaces that changed in one action, for Undo
  let live = []; // the surfaces taking part in the stroke being drawn
  let callback = () => {};
  const everyone = () => [staticSurface, ...doodles.map((d) => d.surface)];

  return {
    onChange: (cb) => (callback = cb),
    isDrawingStroke: () => live.length > 0,
    hasStrokes: () => everyone().some((surface) => surface.hasStrokes()),
    canUndo: () => actions.length > 0,

    begin(tool, colour, x, y) {
      live = [{ surface: staticSurface }];
      staticSurface.begin(tool, colour, x, y);
      if (tool === "eraser") {
        doodles.forEach((d) => {
          const [hx, hy] = motion.toHome(d, x, y);
          d.surface.begin(tool, colour, hx, hy);
          live.push({ surface: d.surface, doodle: d });
        });
      }
    },

    extend(x, y) {
      live.forEach((part) => {
        if (part.doodle) {
          const [hx, hy] = motion.toHome(part.doodle, x, y);
          part.surface.extend(hx, hy);
        } else {
          part.surface.extend(x, y);
        }
      });
    },

    end() {
      if (!live.length) return;
      const surfaces = live.map((part) => part.surface);
      live = [];
      surfaces.forEach((surface) => surface.end());
      actions.push(surfaces);
      callback();
    },

    undo() {
      const surfaces = actions.pop();
      if (!surfaces) return;
      surfaces.forEach((surface) => surface.undo());
      callback();
    },

    // When the visitor finishes drawing, what they drew becomes floating
    // doodles of its own, right where it was drawn. (Their Undo history
    // starts afresh, since those strokes now belong to the doodles.)
    absorbVisitorDrawing() {
      const drawn = staticSurface.getStrokes().slice();
      if (!actions.length && !drawn.length) return 0; // nothing changed
      motion.pruneEmpty();
      if (!drawn.length) return 0;
      const added = motion.add(drawn);
      staticSurface.setStrokes([]);
      actions = [];
      callback();
      return added.length;
    },

    clear() {
      const touched = everyone().filter((surface) => surface.hasStrokes());
      if (!touched.length) return;
      touched.forEach((surface) => surface.clear());
      actions.push(touched);
      callback();
    },
  };
};

const backgroundCanvasHost = document.getElementById("main");
const backgroundLandingEl = document.getElementById("screen-landing");

if (backgroundCanvasHost && backgroundLandingEl) {
  // The canvas: first thing inside <main>, so it's under every screen.
  const bgCanvas = document.createElement("canvas");
  bgCanvas.className = "bg-canvas";
  bgCanvas.setAttribute("aria-hidden", "true");
  backgroundCanvasHost.insertBefore(bgCanvas, backgroundCanvasHost.firstChild);

  const brushSizes = {
    pen: 0.0024, // widths of the page: ~3.5px on a 1440px-wide window
    crayon: 0.0046,
    eraser: 0.016,
  };
  // The layer for what a visitor draws (it also holds the whole background
  // artwork when motion is switched off).
  const surface = createStrokeSurface(bgCanvas, brushSizes);

  // ---- the buttons ----
  const root = document.createElement("div");
  root.className = "bg-draw";
  root.id = "bg-draw";

  const toggleButton = makeToolButton("bg-draw__toggle", "Draw on background", "pencil");
  toggleButton.setAttribute("aria-pressed", "false");

  const bar = document.createElement("div");
  bar.className = "bg-draw__bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Draw on the background");
  bar.hidden = true;

  const penButton = makeToolButton("book-tool--pen", BOOK_BRUSHES.pen.label, "pencil", "#221d19");
  const crayonButton = makeToolButton("book-tool--crayon", BOOK_BRUSHES.crayon.label, "pencil", "#fffdf7");
  const eraserButton = makeToolButton("book-tool--eraser", BOOK_BRUSHES.eraser.label, "eraser");
  const undoButton = makeToolButton("book-tool--undo", "Undo", "undo");
  const clearButton = makeToolButton("book-tool--clear", "Clear drawing", "clear");
  const doneButton = makeToolButton("book-tool--done", "Done drawing", "done");
  const brushButtons = { pen: penButton, crayon: crayonButton, eraser: eraserButton };

  const tools = document.createElement("div");
  tools.className = "book-draw-tools";
  tools.append(penButton, crayonButton, eraserButton, undoButton, clearButton, doneButton);

  const colours = document.createElement("div");
  colours.className = "book-draw-colours";
  colours.setAttribute("role", "group");
  colours.setAttribute("aria-label", "Drawing colour");
  const colourButtons = BOOK_DRAW_COLOURS.map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "book-colour";
    button.style.background = option.hex;
    button.dataset.colour = option.id;
    button.setAttribute("aria-label", option.label);
    button.title = option.label;
    button.addEventListener("click", () => setColour(option.id));
    colours.appendChild(button);
    return button;
  });

  bar.append(tools, colours);
  root.append(bar, toggleButton);
  document.body.appendChild(root);

  // ---- state ----
  let active = false;
  let brush = "pen";
  let lastBrush = "pen";
  let drawColour = BOOK_DRAW_COLOURS[0].id;
  let activePointer = null;

  const updateButtons = () => {
    Object.entries(brushButtons).forEach(([name, button]) => button.setAttribute("aria-pressed", name === brush));
    colourButtons.forEach((button) => button.setAttribute("aria-pressed", button.dataset.colour === drawColour));
    undoButton.disabled = !board.canUndo();
    clearButton.disabled = !board.hasStrokes();
  };

  // The background artwork starts as copies of the default doodles (in
  // memory only). With motion on, it's split into separate floating doodles
  // and the tools work on all of them through `board`; with "reduce motion"
  // on it's one still picture on the surface, as it always was.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const defaultBackground = getDefaultStrokes("background");
  let motion = null;
  let board = surface;
  if (!reducedMotion.matches) {
    motion = createFloatingDoodles(backgroundCanvasHost, defaultBackground, brushSizes, DEFAULT_DRAWINGS.backgroundGroups);
    board = createBackgroundBoard(surface, motion);
  } else {
    surface.setStrokes(defaultBackground);
  }

  // Edits are never saved (see DEFAULT DRAWINGS above): just keep the
  // buttons in step.
  board.onChange(() => updateButtons());

  // Someone turning "reduce motion" on while the page is open: stop where they are.
  if (motion && typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) motion.stopForReducedMotion();
    });
  }

  // Keep the layers sized to the area under the header (and sharp).
  const resizeAll = () => {
    surface.resize();
    if (motion) motion.layout();
  };
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resizeAll).observe(bgCanvas);
  window.addEventListener("resize", resizeAll);
  window.addEventListener("load", resizeAll);
  resizeAll();
  if (motion) motion.start();

  // ---- start / stop ----
  const announce = () => document.dispatchEvent(new CustomEvent("drawing:change"));

  const startDrawing = () => {
    if (active || bookDrawing.index !== -1 || backgroundLandingEl.hidden) return;
    if (document.documentElement.dataset.theme === "plain") return; // (the doodles are hidden in the Plain theme)
    active = true;
    bookDrawing.index = -2; // locks the carousel, like cover drawing
    document.documentElement.classList.add("is-bg-drawing");
    toggleButton.setAttribute("aria-pressed", "true");
    bar.hidden = false;
    resizeAll();
    if (motion) motion.pause(); // every doodle freezes exactly where it is
    updateButtons();
    syncThemeButtons();
    announce();
    penButton.focus({ preventScroll: true });
  };

  const stopDrawing = (returnFocus = true) => {
    if (!active) return;
    if (board.isDrawingStroke()) board.end(); // a stroke in progress is kept
    if (motion) board.absorbVisitorDrawing(); // what they drew now floats too
    activePointer = null;
    active = false;
    bookDrawing.index = -1;
    document.documentElement.classList.remove("is-bg-drawing");
    toggleButton.setAttribute("aria-pressed", "false");
    bar.hidden = true;
    if (motion) motion.resume(); // they carry on from where they are
    syncThemeButtons();
    announce();
    if (returnFocus) toggleButton.focus({ preventScroll: true });
  };

  toggleButton.addEventListener("click", () => (active ? stopDrawing() : startDrawing()));
  doneButton.addEventListener("click", () => stopDrawing());

  // ---- tools ----
  const setBrush = (name) => {
    brush = name;
    if (name !== "eraser") lastBrush = name;
    updateButtons();
  };
  // (picking a colour while erasing returns to the last pen/crayon)
  function setColour(id) {
    drawColour = id;
    if (brush === "eraser") brush = lastBrush;
    updateButtons();
  }
  penButton.addEventListener("click", () => setBrush("pen"));
  crayonButton.addEventListener("click", () => setBrush("crayon"));
  eraserButton.addEventListener("click", () => setBrush("eraser"));
  undoButton.addEventListener("click", () => board.undo());
  clearButton.addEventListener("click", () => board.clear());

  // ---- drawing with the pointer ----
  // Pressing anywhere on the shelf screen (the empty background, or on top
  // of a book or title — the drawing still lands behind them) starts a
  // stroke instead of doing whatever that spot normally does. The canvas
  // then captures the pointer so the stroke carries on over anything.
  const pagePoint = (event) => {
    const rect = bgCanvas.getBoundingClientRect();
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.width];
  };

  backgroundLandingEl.addEventListener(
    "pointerdown",
    (event) => {
      if (!active || activePointer !== null) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      activePointer = event.pointerId;
      try {
        bgCanvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // fine — the stroke just ends if the pointer leaves the window
      }
      const [x, y] = pagePoint(event);
      const colour = BOOK_DRAW_COLOURS.find((option) => option.id === drawColour).hex;
      board.begin(brush, colour, x, y);
    },
    true
  );

  bgCanvas.addEventListener("pointermove", (event) => {
    if (!active || event.pointerId !== activePointer) return;
    event.preventDefault();
    const moves = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
    (moves.length ? moves : [event]).forEach((move) => {
      const [x, y] = pagePoint(move);
      board.extend(x, y);
    });
  });

  const endStroke = (event) => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    board.end();
  };
  bgCanvas.addEventListener("pointerup", endStroke);
  bgCanvas.addEventListener("pointercancel", endStroke);

  // The click that follows a stroke must never open a book.
  backgroundLandingEl.addEventListener(
    "click",
    (event) => {
      if (!active) return;
      event.stopPropagation();
      event.preventDefault();
    },
    true
  );

  // Escape finishes drawing (capture phase, like the other pop-ups).
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && active) {
        event.stopImmediatePropagation();
        stopDrawing();
      }
    },
    true
  );

  // Background drawing belongs to the shelf: the pencil button only shows
  // there, and opening a book ends drawing.
  const syncVisibility = () => {
    const onShelf = !backgroundLandingEl.hidden;
    root.hidden = !onShelf;
    if (!onShelf) stopDrawing(false);
  };
  document.addEventListener("screen:shown", syncVisibility, true);
  syncVisibility();

  // ---- BACKGROUND THEME: Ocean (the default) or Plain ----
  // One small Theme button beside the colour and pencil buttons. Clicking it
  // fans the two choices out above it (like the colour picker): Ocean (wave)
  // and Plain (blank page). Plain just hides the doodle layers (CSS:
  // html[data-theme="plain"]) and holds the floating doodles perfectly
  // still, so nothing is deleted or reset: switching back to Ocean shows every
  // doodle where it was and they carry on from there. The background colour
  // is untouched. The choice is remembered like the colour. (Drawing needs
  // the doodles visible, so while the Plain theme is on the pencil is
  // switched off, and while drawing the Theme button is.)
  const THEME_KEY = "pageTheme";
  const themeRoot = document.createElement("div");
  themeRoot.className = "bg-theme";

  const themeOptions = document.createElement("div");
  themeOptions.className = "bg-theme__options";
  themeOptions.setAttribute("role", "group");
  themeOptions.setAttribute("aria-label", "Background theme");
  themeOptions.id = "bg-theme-options";

  const oceanButton = makeToolButton("bg-theme__button", "Ocean theme", "wave");
  oceanButton.title = "Ocean";
  const plainButton = makeToolButton("bg-theme__button", "Plain theme (no doodles)", "plain");
  plainButton.title = "Plain";
  themeOptions.append(oceanButton, plainButton);

  const themeToggle = makeToolButton("bg-theme__toggle", "Change background theme", "theme");
  themeToggle.title = "Theme";
  themeToggle.setAttribute("aria-expanded", "false");
  themeToggle.setAttribute("aria-controls", "bg-theme-options");

  themeRoot.append(themeOptions, themeToggle);
  document.body.appendChild(themeRoot);

  const isPlain = () => document.documentElement.dataset.theme === "plain";
  const isThemeMenuOpen = () => themeRoot.classList.contains("is-open");
  const setThemeMenuOpen = (open) => {
    themeRoot.classList.toggle("is-open", open);
    themeToggle.setAttribute("aria-expanded", open);
  };

  function syncThemeButtons() {
    oceanButton.setAttribute("aria-pressed", !isPlain());
    plainButton.setAttribute("aria-pressed", isPlain());
    themeToggle.disabled = active; // can't switch while drawing
    if (active) setThemeMenuOpen(false);
    toggleButton.disabled = isPlain();
    toggleButton.title = isPlain() ? "Switch to the Ocean theme to draw on the background" : "Draw on background";
  }

  const applyTheme = (name, remember) => {
    const plain = name === "plain";
    if (plain === isPlain() && remember) return;
    if (plain) document.documentElement.dataset.theme = "plain";
    else delete document.documentElement.dataset.theme;
    if (motion) {
      if (plain) motion.pause("theme");
      else motion.resume("theme");
    }
    syncThemeButtons();
    if (remember) {
      try {
        if (plain) localStorage.setItem(THEME_KEY, "plain");
        else localStorage.removeItem(THEME_KEY);
      } catch (error) {
        // blocked: it just won't be remembered
      }
    }
  };

  const chooseTheme = (name) => {
    applyTheme(name, true);
    setThemeMenuOpen(false);
    themeToggle.focus({ preventScroll: true });
  };

  themeToggle.addEventListener("click", () => setThemeMenuOpen(!isThemeMenuOpen()));
  oceanButton.addEventListener("click", () => chooseTheme("ocean"));
  plainButton.addEventListener("click", () => chooseTheme("plain"));

  // Clicking anywhere outside the Theme control closes it.
  document.addEventListener("click", (event) => {
    if (isThemeMenuOpen() && !themeRoot.contains(event.target)) setThemeMenuOpen(false);
  });

  // Escape closes it first (capture phase), without also closing an open book.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && isThemeMenuOpen()) {
        event.stopImmediatePropagation();
        setThemeMenuOpen(false);
        themeToggle.focus({ preventScroll: true });
      }
    },
    true
  );

  applyTheme(isPlain() ? "plain" : "ocean", false); // (a saved Plain theme was already set in <head>)

  updateButtons();
}
