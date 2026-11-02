# Website designs

Exported from the **Raj Durbar Website** design canvas on claude.ai
(<https://claude.ai/artifact/EU2JrL8puTmDTZwuaFEh1m>, last edited 17 Oct 2026).
These are the reference for building `web/`.

Open **[index.html](index.html)** in a browser to see every board side by side, or open
a single page directly. Pages need JavaScript; open them straight from disk or any static server.

| Area | Phone | Desktop / tablet |
|---|---|---|
| Home | [home-phone](home-phone.html) | [home-desktop](home-desktop.html) |
| Menu | [menu-phone](menu-phone.html) | [menu-desktop](menu-desktop.html) |
| Book a table | [book-a-table-phone](book-a-table-phone.html) | [book-a-table-desktop](book-a-table-desktop.html) |
| Our story | [our-story-phone](our-story-phone.html) | [our-story-desktop](our-story-desktop.html) |
| Find us | [find-us-phone](find-us-phone.html) | [find-us-desktop](find-us-desktop.html) |
| Staff bookings | [staff-bookings-phone](staff-bookings-phone.html) | [staff-bookings-desktop-tablet](staff-bookings-desktop-tablet.html) |
| Staff sign in | | [staff-sign-in-tablet](staff-sign-in-tablet.html) |

Opened states: [phone menu](phone-menu-opened.html), [offers panel](offers-panel-opened.html),
[add a booking](add-a-booking-opened.html), [edit a booking](edit-a-booking-opened.html).

Earlier style explorations: [B · Prayer Flag](b-prayer-flag-bright-modern.html),
[B on a phone, large text](b-on-a-phone-large-text.html),
[C · Street & Thali](c-street-thali-bold-playful.html).

`shared/` holds the fonts (Cormorant Garamond and Jost for the chosen design, plus
Bricolage Grotesque, DM Sans and Anton for the explorations; licenses in
[FONT-LICENSES.txt](shared/FONT-LICENSES.txt)), React, and the design runtime the pages load. Files are named by content hash and
shared between pages, so don't edit them by hand; re-export from the canvas instead.
