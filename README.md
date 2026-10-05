# Valmo RTO Prototype · Team Shooters (IIT Kanpur)

Clickable prototype for our Meesho DICE Challenge S3 Business Track entry (Valmo RTO case).

**Live demo:** https://chitts28.github.io/Meesho-DICE-Challenge-3.0/

## Start here: ▶ Live demo (one order, every side)
Four short stories. Each follows **one shared order** across every side it touches: the buyer's phone, the Valmo rider app, the LMDC hub tablet, a Valmo Point shop, a backup receiver and a nearby buyer. Every tap moves the parcel, writes to a live **Valmo control log**, lights up the leak points it fixes, and ends with **what that parcel costs Valmo today vs with our fix**.

| # | Story | Solution | Problem (deck) |
|---|---|---|---|
| 1 | Priya, a repeat refuser: warning → ₹70 advance → 8 am choice → refusal with photo → seal check → resold 1 km away | Commit-to-COD | P1 door refusal · P2 back to seller |
| 2 | Arjun, a normal COD buyer: nothing changes except one morning card | Commit-to-COD | Guardrail: no friction for normal buyers |
| 3 | Priya won't be home: backup neighbour with consent + code, or a Valmo Point 600 m away | Sure-Meet | P4 genuine unreachability |
| 4 | Nobody answers the door: honest rider passes the verified-attempt gate (+₹3); a skipping rider is caught | Sure-Meet | P3 fake attempts · P4 |

A **guided tour** highlights what to tap at each step (switch it off to explore freely). The **Impact** tab rolls up to Valmo scale (17% → ~14% RTO, ~₹440 Cr net a year, ₹84.8 → ₹78.1 per delivered order) with a stress test over the deck's sensitivity grid.

## Also included
**Screen library:** every wireframe screen from the deck, by role, for both solutions. Orange dashed outline = what is new on that screen; the side panel shows *Today* vs *What's new* and the survey number behind it.

## Tech
Plain HTML, CSS and JavaScript. No build step, no backend, no tracking. Sample data only (order #MS-90214, kurti size M, ₹349, rider Ramesh). Demo codes: backup 7316, Valmo Point 4821.

Team: Chitransh Gangwar, Atharva Katiyar, Abhay Kumar.
