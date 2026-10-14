# The Styling Studio — v6 (plain HTML / CSS / JS)

Files: index.html, style.css, script.js, assets.js (embedded photos), images/ (same photos as files)

## Putting it on Wix Studio (recommended)
1. Upload this whole folder to a free host (GitHub Pages / Netlify). Keep the file names and the images/ folder.
2. In Wix Studio: Add -> Embed Code -> "Embed a site" (iframe), paste the hosted link to index.html.
3. Make the iframe wide and about 900px tall (the page scrolls inside it).
Not tested inside a real Wix site yet — do one trial on a free Wix account before recording.
Login, database and payments are NOT connected (they are simulated).

## Where to edit things (open script.js and search for the word in quotes)
- Starting garments, photos, names ......... "initialGarments"
- Shoe / accessory drawer items ............ "accessoryDrawer" and "shoeDrawer"
- Client name, fit profile, preferences .... "const client" , "fitProfile", "preferences"
- Colours ................................... "swatches"
- Body silhouette photo and text ............ "bodySilhouette"
- Mood board photos ......................... "moodBoard"
- Chat start messages / simulated replies ... "initialMessages", "simulatedReplies"
- Movement presets (sway, weight ...) ....... "motionPresets"
- Starting credits .......................... "credits: 105"
- Credit costs .............................. "spend(2)" upload, "spend(5)" review, "spend(3)" save look
- Top-up packs and prices ................... "PACKS"
- Colours / spacing of the page ............. style.css (end of file = new parts)
Most content can also be edited with no code: click "Staff" at the top right.
Staff edits live until the page is reloaded (nothing is saved to a server).

## Photos
- Photos in images/ were generated with AI. The buyer's brief says real product photos only.
  Replace them (Staff -> Replace photo, or swap the files in images/ and assets.js).
- Tie, watch, belt, shoes and mood board photos load from Unsplash (internet needed).
- Shoes: use a photo where both shoes are level, side by side.
- Photos on a plain light/grey background get cut out automatically. Busy backgrounds stay as a
  rectangle (the app says "Original background kept").

## v6 changes (found on the live Wix test)
- Narrow centre column (iframe ~1280px wide): garment details now stack, no more overlapping sliders.
- Mobile tab bar moved to the TOP (it used to sit at the bottom of the iframe, out of sight).

## Wix iframe settings that work best
- Desktop: iframe full width, height 2400px, no left/right margin, section background #0b0a09.
- Mobile: iframe width 375 (X = 0, do not drag it sideways), height 2500px.
- Delete the template footer text ("(c) 2035 by Business Name ...") before sharing.
