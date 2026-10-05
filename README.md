# Valmo RTO Prototype · Team Shooters (IIT Kanpur)

Clickable prototype for our Meesho DICE Challenge S3 Business Track entry (Valmo RTO case).

**Live demo:** https://chitts28.github.io/valmo-rto-prototype/ 

It turns the wireframes in our Round 2 deck into working screens, shown from every side each solution touches.

| Solution | Problem it targets | Roles you can click through |
|---|---|---|
| **1 · Commit-to-COD** | Buyers who *won't* take the parcel (refusals) | Customer (serial refuser or normal buyer), Rider app, LMDC hub tablet, Nearby resale buyer |
| **2 · Sure-Meet** | Buyers who *can't* be met (not home, unreachable, fake attempts) | Customer, Rider app, Valmo Point shop app, Backup receiver SMS |

## How to use
- Pick a solution tab, then a role under **View as**.
- Tap the buttons inside the phone: replies, payments, OTP entry, photo capture, seal check and the rider's live checklist all work.
- **Orange dashed outline** = what is new on that screen. The side panel shows *Today* vs *What's new* and the survey data behind it.
- Grey **Demo** buttons simulate the next real-world event (for example, the rider arriving).
- Valmo Point demo code: **4821**.

## Tech
Plain HTML, CSS and JavaScript. No build step, no backend, no tracking. Open `index.html` locally or via GitHub Pages.
All names, orders and amounts are sample data for one order (Priya, Kanpur, kurti size M, ₹349, rider Ramesh). No real payments, messages or calls are made.

Team: Chitransh Gangwar, Atharva Katiyar, Abhay Kumar.
