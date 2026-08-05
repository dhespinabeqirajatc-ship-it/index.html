# Connected Reporting Interactive Demo

A self-contained HTML/CSS/JavaScript demo that simulates:

- Starting a Workiva-style Chain
- Connection statuses changing from Not started to Refreshing to Complete
- Spreadsheet values updating
- A report showing an update-available state
- Report values changing after a manual refresh
- Resetting the entire demo

## Files

- `index.html` — application markup
- `styles.css` — responsive styling
- `app.js` — demo state and interactions

## Run locally

Open `index.html` directly in a browser, or serve the folder with a local web server.

Example with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Open the repository's **Settings**.
4. Select **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select your main branch and the `/root` folder.
7. Save the configuration.
8. GitHub will display the published URL after deployment.

## Customisation

### Change the displayed figures

Edit the `updateSpreadsheetValues()` and `refreshReport()` functions in `app.js`.

### Change workflow timings

Edit the `wait(...)` durations inside `runChain()` and `runConnection()`.

### Add screenshot backgrounds

You can add screenshots to an `assets` folder and use them as CSS background images. Keep interactive buttons and status elements as HTML overlays.

### Connect to a real platform

Do not put API secrets in this front-end repository. A live integration should use a secure backend or serverless function to handle authentication and API calls.

## Disclaimer

This project is a simulated demonstration and is not an official Workiva product.


## Version 2 changes

The Chain tab now mirrors the supplied Workiva screenshots more closely:

- Workiva-style dark-blue left navigation
- Runtime-input execution page
- Pre-filled folder name
- Connection refresh selection
- Start button
- Run-details header
- Dotted chain canvas
- Vertical nodes that progress one by one
- Completed nodes and connectors turn green
- Back To Execute control


## Version 3 spreadsheet changes

The Spreadsheet tab now follows the supplied Workiva screenshots:

- Workiva-style title bar, menu tabs, and editing ribbon
- Left spreadsheet/document navigation tree
- Entity Registration grid with realistic tax-pack values
- Incoming and Outgoing connection tabs
- Connection cards with refresh controls and last-refreshed details
- Refreshing spinner and bottom-right progress notification
- Selected cell values visibly change and highlight after refresh
- The Chain run automatically triggers the first spreadsheet connection refresh


## Version 4 report changes

The Report tab now follows the supplied Workiva screenshots:

- Workiva-style open document tabs and editing ribbon
- Consolidated-report spreadsheet canvas
- Left report outline with DTA/DTL sections
- Right-side Link properties panel showing source and destination
- Green linked-update icon appears after a connection refresh
- Publish button becomes highlighted when linked updates are available
- Apply Updates or Publish updates the linked report cells
- Changed figures briefly highlight
- The full demo now runs in sequence: Chain → Connection refresh → Linked report update


## Version 5 header change

- Removed the “Financial Reporting Workflow” eyebrow title
- Renamed “Monthly close chain” to “Refresh connections chain?”


## Version 6 interaction and colour changes

- Spreadsheet connection refresh controls are now display-only
- Users can no longer manually start a spreadsheet refresh
- Refresh begins automatically when the Chain executes
- Connection progress, timestamps, and cell changes still update automatically
- Purple accents were replaced with Workiva-style blue


## Version 7 report naming changes

- Renamed the report view from “Management report” to “Tax report”
- Removed the “Tax note (1)” document tab from the report header
- Renamed the remaining open report tab to “Tax report”


## Version 8 workflow fixes

- Renamed the Chain to “Refresh connections chain”
- Fixed the Start-button event sequence
- Starting the Chain now automatically refreshes all three spreadsheet connections
- Each connection shows refreshing progress and receives a new timestamp
- Spreadsheet values change during the automatic refresh
- The Tax report linked-update indicator appears after refresh
- The Publish button becomes enabled and highlighted
- Publishing applies and highlights the updated report figures


## Version 9 guided navigation

- After the Chain completes, an instruction prompts the user to select the Spreadsheet tab
- The Spreadsheet tab is highlighted until opened
- After the connections finish refreshing, another instruction prompts the user to select the Report tab
- The Report tab is highlighted until opened
- Each instruction includes a direct button that opens the correct tab


## Version 10 guidance and popup changes

- Removed the dark confirmation popups after Chain execution, connection refresh, and report publishing
- The Chain completion prompt only directs the user to Spreadsheet
- The Report prompt is held until the user opens Spreadsheet
- Spreadsheet then directs the user to Report after the connections are refreshed
- The Chain tab no longer directs the user straight to Report


## Version 11 header cleanup

- Removed the visible “Ready” status badge
- Removed the visible “Reset demo” button
- The Chain, Spreadsheet, Report, and guided navigation workflow remain unchanged


## Version 12 Chain input change

- Replaced the selected Chain execution option “Outgoing Connections” with “Incoming Connections”


## Version 13 language fix

- Connection refresh dates and times now always display in English
- The display no longer follows the browser's Greek locale
