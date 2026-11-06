THE WEDDING MAYHEM — LEADERBOARD SETUP

Files
- the_wedding_mayhem_full_game_prototype_v5.html
- the_wedding_mayhem_leaderboard_backend.gs

Scoring
Yuki: 10 / 20 / 30 / 40 points as the pet streak grows; the designated special spot adds 50.
Kai: 25 points for the first catch, 50 for the second consecutive catch, 75 for the third and later consecutive catches; every fifth consecutive catch adds 150; long jumps (>360 game pixels) add 25.
Titles:
0–199 Cat Assistant
200–499 Wedding Helper
500–899 Certified Cat Wrangler
900–1,399 Master of Mayhem
1,400+ Wedding Legend

Google Apps Script setup
1. Create a new Google Apps Script project at https://script.google.com/
2. Replace the starter code with the contents of the .gs file.
3. Save the project.
4. Deploy > New deployment > Web app.
5. Execute as: Me. Who has access: Anyone.
6. Deploy, authorize, and copy the Web app URL ending in /exec.
7. In the HTML file, find: const LEADERBOARD_URL = "";
8. Paste the /exec URL between the quotes. Save the HTML file and republish it.

The first request creates a separate spreadsheet named "The Wedding Mayhem — Leaderboard" in the Google account that owns the Apps Script deployment. This is separate from the wedding RSVP spreadsheet.

Important limitations
- This is a casual guest leaderboard, not a cheat-proof competition. Browser-submitted scores can be manipulated. The backend checks score consistency, caps totals, throttles repeated submissions per nickname and retains only each nickname's best score, but it cannot prove the game was played honestly.
- Nicknames are public on the leaderboard. Ask guests not to use sensitive or identifying information.
- Google Apps Script web apps can have quotas and access restrictions. Test deployment from a separate browser/device before launch.
