(function () {
    'use strict';

    /* --- Mobile navigation ------------------------------------------------ */
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('primaryNav');

    function closeNav() {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-locked');
    }

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('nav-locked', open);
        });

        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeNav();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNav();
        });

        // The menu is desktop-irrelevant: never leave it latched open on resize.
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1024 && nav.classList.contains('is-open')) {
                closeNav();
            }
        });
    }

    /* --- Masthead background on scroll ------------------------------------ */
    var masthead = document.getElementById('masthead');

    function syncMasthead() {
        masthead.classList.toggle('is-stuck', window.scrollY > 60);
    }

    if (masthead) {
        syncMasthead();
        window.addEventListener('scroll', syncMasthead, { passive: true });
    }

    /* --- Upcoming event popup ---------------------------------------------- */
    var eventPopup = document.getElementById('eventPopup');
    var dismissEventPopup = document.getElementById('dismissEventPopup');

    function selectFeaturedEvent(events, now) {
        var futureEvents = events
            .filter(function (event) { return event.start >= now; })
            .sort(function (a, b) { return a.start - b.start; });

        if (futureEvents.length) {
            return { event: futureEvents[0], label: 'Upcoming event' };
        }

        var pastEvents = events
            .filter(function (event) { return event.start < now; })
            .sort(function (a, b) { return b.start - a.start; });

        return pastEvents.length ? { event: pastEvents[0], label: 'Last event' } : null;
    }

    if (eventPopup && dismissEventPopup) {
        fetch('events.html')
            .then(function (response) {
                if (!response.ok) throw new Error('Events calendar returned ' + response.status);
                return response.text();
            })
            .then(function (html) {
                var calendar = new DOMParser().parseFromString(html, 'text/html');
                var events = Array.prototype.slice.call(
                    calendar.querySelectorAll('.event[data-event-start]')
                ).map(function (element) {
                    return {
                        id: element.dataset.eventStart,
                        start: new Date(element.dataset.eventStart),
                        displayDate: element.dataset.eventDisplay,
                        location: element.dataset.eventLocation,
                        title: element.querySelector('h3').textContent.trim()
                    };
                }).filter(function (event) {
                    return !Number.isNaN(event.start.getTime());
                });
                var featured = selectFeaturedEvent(events, new Date());

                if (!featured) return;

                var eventPopupKey = 'dismissed-event-' + featured.event.id;
                if (localStorage.getItem(eventPopupKey) === 'true') return;

                document.getElementById('eventPopupLabel').textContent = featured.label;
                document.getElementById('eventPopupTitle').textContent = featured.event.title;
                document.getElementById('eventPopupDate').textContent = featured.event.displayDate;
                document.getElementById('eventPopupLocation').textContent = featured.event.location;

                var eventPopupTimer;

                function showEventPopup() {
                    window.clearTimeout(eventPopupTimer);
                    eventPopup.hidden = false;
                    window.requestAnimationFrame(function () {
                        eventPopup.classList.add('is-visible');
                    });
                    window.removeEventListener('scroll', showEventPopup);
                }

                function hideEventPopup() {
                    localStorage.setItem(eventPopupKey, 'true');
                    eventPopup.classList.remove('is-visible');
                    eventPopup.hidden = true;
                }

                eventPopupTimer = window.setTimeout(showEventPopup, 4000);
                window.addEventListener('scroll', showEventPopup, { once: true, passive: true });
                dismissEventPopup.addEventListener('click', hideEventPopup);
                eventPopup.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') hideEventPopup();
                });
            })
            .catch(function (error) {
                console.error('Unable to load the featured event popup.', error);
            });
    }

    /* --- Reveal on scroll -------------------------------------------------- */
    var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    function reveal(el) {
        el.classList.add('is-visible');
    }

    if ('IntersectionObserver' in window) {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    reveal(entry.target);
                    revealer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

        revealables.forEach(function (el) { revealer.observe(el); });

        // Instant jumps (hash links, restored scroll) can skip observer callbacks,
        // so anything already scrolled past is revealed unconditionally.
        window.addEventListener('scroll', function () {
            revealables.forEach(function (el) {
                if (!el.classList.contains('is-visible') &&
                    el.getBoundingClientRect().top < window.innerHeight) {
                    reveal(el);
                    revealer.unobserve(el);
                }
            });
        }, { passive: true });
    } else {
        revealables.forEach(reveal);
    }

    /* --- Scrollspy --------------------------------------------------------- */
    var navLinks = Array.prototype.slice.call(
        document.querySelectorAll('.nav-links a[href^="#"]')
    );
    var sections = navLinks
        .map(function (link) { return document.querySelector(link.getAttribute('href')); })
        .filter(Boolean);

    function syncActive() {
        var marker = window.scrollY + window.innerHeight * 0.32;
        var atBottom =
            window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
        var current = atBottom ? sections[sections.length - 1] : null;

        if (!atBottom) {
            sections.forEach(function (section) {
                if (section.offsetTop <= marker) current = section;
            });
        }

        navLinks.forEach(function (link) {
            link.classList.toggle(
                'is-active',
                current !== null && link.getAttribute('href') === '#' + current.id
            );
        });
    }

    if (sections.length) {
        syncActive();
        window.addEventListener('scroll', syncActive, { passive: true });
        window.addEventListener('resize', syncActive);
    }
})();
