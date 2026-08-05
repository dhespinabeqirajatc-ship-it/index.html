const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".nav-button");

const runChainButton = document.getElementById("run-chain");
const refreshReportButton = document.getElementById("refresh-report");
const resetDemoButton = document.getElementById("reset-demo");

const globalStatus = document.getElementById("global-status");
const chainSummary = document.getElementById("chain-summary");
const connectionSummary = document.getElementById("connection-summary");
const reportSummary = document.getElementById("report-summary");
const activityLog = document.getElementById("activity-log");
const activityTime = document.getElementById("activity-time");
const reportAlert = document.getElementById("report-alert");
const toast = document.getElementById("toast");

const state = {
  running: false,
  chainComplete: false,
  reportUpdateAvailable: false,
  reportRefreshed: false,
  completedConnections: 0
};

const titles = {
  "chain-view": "Refresh connections chain",
  "spreadsheet-view": "Connected spreadsheet",
  "report-view": "Tax report"
};

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetView = button.dataset.view;

    navButtons.forEach((navButton) => navButton.classList.remove("active"));
    views.forEach((view) => view.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(targetView).classList.add("active");
    document.getElementById("page-title").textContent = titles[targetView];
  });
});

function setPill(element, text, className) {
  element.textContent = text;
  element.className = className;
}

function setGlobalStatus(text, type) {
  setPill(globalStatus, text, `status-pill status-${type}`);
}

function updateWorkflowStep(stepName, status) {
  const step = document.querySelector(`[data-step="${stepName}"]`);
  const statusElement = step.querySelector(".step-status");

  step.classList.remove("is-running", "is-complete");
  statusElement.className = "step-status";

  if (status === "running") {
    step.classList.add("is-running");
    statusElement.classList.add("status-running", "spinner");
    statusElement.textContent = "Running";
  } else if (status === "complete") {
    step.classList.add("is-complete");
    statusElement.classList.add("status-complete");
    statusElement.textContent = "Complete";
  } else {
    statusElement.classList.add("status-not-started");
    statusElement.textContent = "Not started";
  }
}

function updateConnection(connectionName, status) {
  const item = document.querySelector(`[data-connection="${connectionName}"]`);
  const statusElement = item.querySelector(".connection-status");

  statusElement.className = "connection-status";

  if (status === "running") {
    statusElement.classList.add("status-running", "spinner");
    statusElement.textContent = "Refreshing";
  } else if (status === "complete") {
    statusElement.classList.add("status-complete");
    statusElement.textContent = "Complete";
  } else {
    statusElement.classList.add("status-not-started");
    statusElement.textContent = "Not started";
  }
}

function addLog(message) {
  const item = document.createElement("li");
  item.innerHTML = `<span class="log-dot"></span>${message}`;
  activityLog.prepend(item);
  activityTime.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

function updateConnectionSummary() {
  connectionSummary.textContent = `${state.completedConnections} / 3`;
}

function updateSpreadsheetValues() {
  const values = {
    "sheet-revenue": "€13.1M",
    "sheet-revenue-var": "+5.6%",
    "sheet-margin": "18.6%",
    "sheet-margin-var": "+1.4 pts",
    "sheet-opex": "€4.7M",
    "sheet-opex-var": "-2.1%",
    "sheet-period": "July"
  };

  Object.entries(values).forEach(([id, value]) => {
    const cell = document.getElementById(id);
    cell.textContent = value;
    cell.classList.remove("changed");
    void cell.offsetWidth;
    cell.classList.add("changed");
  });

  document.getElementById("sheet-refresh-label").textContent =
    "Last refreshed: Just now";
}

async function runConnection(stepName, logText, duration = 1100) {
  updateWorkflowStep(stepName, "running");
  updateConnection(stepName, "running");
  addLog(logText);

  await wait(duration);

  updateWorkflowStep(stepName, "complete");
  updateConnection(stepName, "complete");
  state.completedConnections += 1;
  updateConnectionSummary();
}

async function runChain() {
  if (state.running || state.chainComplete) return;

  state.running = true;
  runChainButton.disabled = true;
  refreshReportButton.disabled = true;

  setGlobalStatus("Chain running", "running");
  chainSummary.textContent = "Running";
  reportSummary.textContent = "Current";

  activityLog.innerHTML = "";
  updateWorkflowStep("start", "running");
  addLog("Chain run started.");

  await wait(700);
  updateWorkflowStep("start", "complete");

  await runConnection("erp", "Importing the latest ERP actuals.");
  await runConnection("forecast", "Refreshing the connected forecast model.");
  await runConnection("fx", "Updating FX rates and validating data.", 950);

  updateWorkflowStep("publish", "running");
  addLog("Publishing refreshed values to connected documents.");
  await wait(1100);

  updateSpreadsheetValues();
  updateWorkflowStep("publish", "complete");

  state.running = false;
  state.chainComplete = true;
  state.reportUpdateAvailable = true;

  chainSummary.textContent = "Complete";
  reportSummary.textContent = "Update available";
  setGlobalStatus("Chain complete", "complete");

  reportAlert.classList.remove("hidden");
  refreshReportButton.disabled = false;

  addLog("Chain completed. Updated report data is available.");
  showToast("Chain completed successfully.");
}

function refreshReport() {
  if (!state.reportUpdateAvailable || state.reportRefreshed) return;

  refreshReportButton.disabled = true;
  refreshReportButton.classList.add("spinner");
  refreshReportButton.lastChild.textContent = " Refreshing";

  window.setTimeout(() => {
    const reportValues = {
      "report-period": "July 2026",
      "report-revenue": "€13.1M",
      "report-margin": "18.6%",
      "report-opex": "€4.7M",
      "report-revenue-note": "+5.6% month over month",
      "report-margin-note": "+1.4 points",
      "report-opex-note": "-2.1% month over month",
      "report-version": "Version 2 · 31 July 2026"
    };

    Object.entries(reportValues).forEach(([id, value]) => {
      document.getElementById(id).textContent = value;
    });

    document.getElementById("report-summary-copy").textContent =
      "July performance improved following stronger commercial activity and disciplined cost management. Revenue increased to €13.1 million and operating margin expanded to 18.6%.";

    document.getElementById("report-commentary").textContent =
      "Revenue growth was driven by higher recurring sales and improved conversion in the enterprise segment. Operating expenses decreased slightly, contributing to a 1.4-point improvement in operating margin.";

    document.querySelectorAll(".report-metric").forEach((metric) => {
      metric.classList.remove("changed");
      void metric.offsetWidth;
      metric.classList.add("changed");
    });

    state.reportRefreshed = true;
    state.reportUpdateAvailable = false;

    reportSummary.textContent = "Refreshed";
    reportAlert.classList.add("hidden");
    setGlobalStatus("Report refreshed", "complete");

    refreshReportButton.classList.remove("spinner");
    refreshReportButton.innerHTML = '<span class="button-icon">✓</span>Report refreshed';

    addLog("Management report refreshed with July values.");
    showToast("Report refreshed with the latest linked data.");
  }, 1100);
}

function resetDemo() {
  state.running = false;
  state.chainComplete = false;
  state.reportUpdateAvailable = false;
  state.reportRefreshed = false;
  state.completedConnections = 0;

  ["start", "erp", "forecast", "fx", "publish"].forEach((step) =>
    updateWorkflowStep(step, "not-started")
  );

  ["erp", "forecast", "fx"].forEach((connection) =>
    updateConnection(connection, "not-started")
  );

  const sheetValues = {
    "sheet-revenue": "€12.4M",
    "sheet-revenue-var": "0.0%",
    "sheet-margin": "17.2%",
    "sheet-margin-var": "0.0 pts",
    "sheet-opex": "€4.8M",
    "sheet-opex-var": "0.0%",
    "sheet-period": "June"
  };

  Object.entries(sheetValues).forEach(([id, value]) => {
    const cell = document.getElementById(id);
    cell.textContent = value;
    cell.classList.remove("changed");
  });

  const reportValues = {
    "report-period": "June 2026",
    "report-revenue": "€12.4M",
    "report-margin": "17.2%",
    "report-opex": "€4.8M",
    "report-revenue-note": "No change",
    "report-margin-note": "No change",
    "report-opex-note": "No change",
    "report-version": "Version 1 · 30 June 2026"
  };

  Object.entries(reportValues).forEach(([id, value]) => {
    document.getElementById(id).textContent = value;
  });

  document.getElementById("report-summary-copy").textContent =
    "Revenue and operating margin remained stable during June, with performance broadly in line with the previous reporting period.";

  document.getElementById("report-commentary").textContent =
    "Results were consistent with the prior month. Management continues to monitor commercial momentum and operating cost discipline.";

  document.querySelectorAll(".report-metric").forEach((metric) =>
    metric.classList.remove("changed")
  );

  document.getElementById("sheet-refresh-label").textContent =
    "Last refreshed: Yesterday, 17:42";

  activityLog.innerHTML =
    '<li><span class="log-dot"></span>Demo is ready.</li>';
  activityTime.textContent = "Waiting to start";

  chainSummary.textContent = "Not started";
  updateConnectionSummary();
  reportSummary.textContent = "Current";

  setGlobalStatus("Ready", "idle");
  reportAlert.classList.add("hidden");

  runChainButton.disabled = false;
  refreshReportButton.disabled = true;
  refreshReportButton.classList.remove("spinner");
  refreshReportButton.innerHTML =
    '<span class="button-icon">↻</span>Refresh report';

  showToast("Demo reset.");
}

if (runChainButton) runChainButton.addEventListener("click", runChain);
refreshReportButton.addEventListener("click", refreshReport);
resetDemoButton.addEventListener("click", resetDemo);



const workivaStartButton = document.getElementById("workiva-start");
const backToExecuteButton = document.getElementById("back-to-execute");
const chainRuntimeScreen = document.getElementById("chain-runtime-screen");
const chainRunScreen = document.getElementById("chain-run-screen");
const workivaNodes = [...document.querySelectorAll(".graph-node")];
const workivaLines = [...document.querySelectorAll(".graph-line")];
let workivaRunActive = false;
let workivaRunTimer = null;

function setWorkivaScreen(screen) {
  if (!chainRuntimeScreen || !chainRunScreen) return;
  chainRuntimeScreen.classList.toggle("hidden", screen !== "runtime");
  chainRunScreen.classList.toggle("hidden", screen !== "run");
}

function resetWorkivaGraph() {
  workivaNodes.forEach((node) => node.classList.remove("running", "complete"));
  workivaLines.forEach((line) => line.classList.remove("complete"));
  const icon = document.getElementById("run-overall-icon");
  if (icon) {
    icon.className = "run-overall pending";
    icon.textContent = "•";
  }
  const ended = document.getElementById("run-ended");
  const duration = document.getElementById("run-duration");
  if (ended) ended.textContent = "Running";
  if (duration) duration.textContent = "Duration 0 seconds";
}

async function runWorkivaChain() {
  if (workivaRunActive) return;

  const folder = document.getElementById("folder-name").value.trim();
  const option = document.getElementById("refresh-option").value;

  if (!folder || !option) {
    showToast("Enter a folder and choose which connections to refresh.");
    return;
  }

  workivaRunActive = true;
  resetWorkivaGraph();
  setWorkivaScreen("run");

  const started = new Date();
  document.getElementById("run-started").textContent =
    `Started at ${started.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"})}`;

  const overall = document.getElementById("run-overall-icon");
  overall.className = "run-overall running";
  overall.textContent = "…";

  workivaRunTimer = window.setInterval(() => {
    const seconds = Math.max(1, Math.round((Date.now() - started.getTime()) / 1000));
    document.getElementById("run-duration").textContent = `Duration ${seconds} seconds`;
  }, 500);

  for (let i = 0; i < workivaNodes.length; i += 1) {
    const node = workivaNodes[i];
    node.classList.add("running");
    await wait(i === 0 ? 700 : 950);
    node.classList.remove("running");
    node.classList.add("complete");

    if (i < workivaLines.length) {
      workivaLines[i].classList.add("complete");
    }
  }

  window.clearInterval(workivaRunTimer);
  const ended = new Date();
  const seconds = Math.max(1, Math.round((ended.getTime() - started.getTime()) / 1000));

  overall.className = "run-overall complete";
  overall.textContent = "✓";
  document.getElementById("run-ended").textContent =
    `Ended at ${ended.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"})}`;
  document.getElementById("run-duration").textContent = `Duration ${seconds} seconds`;

  // Keep the rest of the original demo synchronized.
  updateSpreadsheetValues();
  state.chainComplete = true;
  state.reportUpdateAvailable = true;
  reportAlert.classList.remove("hidden");
  refreshReportButton.disabled = false;
  reportSummary.textContent = "Update available";

  workivaRunActive = false;
  showToast("Chain completed. All nodes are green.");
}

if (workivaStartButton) {
  workivaStartButton.addEventListener("click", runWorkivaChain);
}

if (backToExecuteButton) {
  backToExecuteButton.addEventListener("click", () => {
    if (workivaRunActive) return;
    setWorkivaScreen("runtime");
  });
}


const wsRows = [
  ["Entity","Currency","Currency code","Stat. enacted rate","Opening deferred rate","Closing deferred rate","Group allocation","Name","",""],
  ["CN60","Company currency","CNY","0.25","0.25","0.25","APAC","Inperia Shanghai Co Ltd","",""],
  ["DE61","Company currency","EUR","0.323","0.323","0.323","EMEA","Inperia Germany GmbH","",""],
  ["FR68","Company currency","EUR","0.25","0.25","0.25","EMEA","PMDE Inperia BV","",""],
  ["GB62","Company currency","GBP","0.25","0.25","0.25","EMEA","Inperia UK Ltd.","",""],
  ["HK64","Functional currency","USD","0.165","0.165","0.165","APAC","Inperia Hong Kong Ltd.","",""],
  ["HK81","Functional currency","USD","0.165","0.165","0.165","APAC","ITEC Hong Kong Ltd.","",""],
  ["HU63","Company currency","HUF","0.09","0.09","0.09","EMEA","Inperia Hungary Kft.","",""],
  ["IN68","Company currency","INR","0.3713","0.3822","0.3713","APAC","Inperia B.V. India","",""],
  ["IT68","Company currency","EUR","0.24","0.24","0.24","EMEA","Inperia B.V. Italy","",""],
  ["JP68","Company currency","JPY","0.35","0.35","0.35","APAC","Inperia B.V. Japan","",""],
  ["KR68","Company currency","KRW","0.19","0.19","0.19","APAC","Inperia B.V. Korea Branch","",""],
  ["MX68","Company currency","MXN","0.3","0.3","0.3","Americas","Inperia B.V. Sin Tipo de Sociedad","",""],
  ["MY61","Functional currency","USD","0.24","0.24","0.24","APAC","Inperia Malaysia Sdn. Bhd.","",""],
  ["MY69","Functional currency","USD","0.24","0.24","0.24","APAC","Inperia R&D Malaysia Sdn. Bhd.","",""],
  ["NL60","Functional currency","USD","0.258","0.258","0.258","NL","Inperia B.V.","",""],
  ["PH62","Functional currency","USD","0.25","0.05","0.05","APAC","Inperia Philippines Inc.","",""],
  ["PH67","Company currency","PHP","0.25","0.25","0.25","APAC","Laguna Ventures, Inc.","",""],
  ["PH69","Functional currency","USD","0.25","0.25","0.25","APAC","Semiconductors Philippines, Inc.","",""],
  ["SE63","Company currency","SEK","0.206","0.206","0.206","EMEA","Inperia Sweden branch","",""],
  ["SG61","Company currency","SGD","0.17","0.17","0.17","APAC","Inperia Singapore Pte Ltd.","",""],
  ["TW63","Company currency","TWD","0.2","0.2","0.2","APAC","Inperia Taiwan Co Ltd.","",""],
  ["US60","Company currency","USD","0.22","0.22","0.22","Americas","Inperia USA Inc.","",""]
];

function renderWorkivaGrid() {
  const body = document.getElementById("ws-grid-body");
  if (!body) return;
  body.innerHTML = "";
  const totalRows = 32;

  for (let r = 0; r < totalRows; r += 1) {
    const tr = document.createElement("tr");
    const number = document.createElement("th");
    number.className = "row-num";
    number.textContent = r + 1;
    tr.appendChild(number);

    const row = wsRows[r] || Array(10).fill("");
    row.forEach((value, c) => {
      const td = document.createElement("td");
      td.textContent = value;
      td.dataset.row = r;
      td.dataset.col = c;
      if (r === 0 && c === 0) td.classList.add("active-cell");
      tr.appendChild(td);
    });

    body.appendChild(tr);
  }
}

let wsRefreshing = false;

async function refreshSpreadsheetConnection(connectionKey = "s4h") {
  if (wsRefreshing) return;
  wsRefreshing = true;

  const card = document.querySelector(`[data-ws-connection="${connectionKey}"]`);
  const button = card?.querySelector(".connection-refresh");
  const last = card?.querySelector(".connection-last");
  const popup = document.getElementById("ws-refresh-toast");
  const progress = document.getElementById("ws-progress-bar");
  const text = document.getElementById("ws-toast-text");

  if (button) {
    button.classList.add("refreshing");
    button.textContent = "↻";
    button.setAttribute("aria-label", "Refreshing connection");
  }

  if (last) {
    last.innerHTML = '<b class="green-dot" style="background:#fff;border:1px solid #aaa;color:#aaa">○</b> Refreshing connection…';
  }

  popup?.classList.remove("hidden");
  if (text) text.textContent = "Refreshing Connection";
  if (progress) progress.style.width = "0%";

  const stages = [14, 29, 46, 63, 79, 92, 100];
  for (const value of stages) {
    await wait(360);
    if (progress) progress.style.width = `${value}%`;
  }

  const updates = [
    [2, 3, "0.326"],
    [2, 4, "0.326"],
    [2, 5, "0.326"],
    [8, 4, "0.3890"],
    [8, 5, "0.3785"],
    [15, 3, "0.261"],
    [15, 4, "0.261"],
    [15, 5, "0.261"],
    [22, 3, "0.225"],
    [22, 4, "0.225"],
    [22, 5, "0.225"]
  ];

  updates.forEach(([row, col, value]) => {
    const cell = document.querySelector(`#ws-grid-body td[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.textContent = value;
      cell.classList.remove("cell-updated");
      void cell.offsetWidth;
      cell.classList.add("cell-updated");
    }
  });

  const now = new Date();
  if (last) {
    last.innerHTML = `<b class="green-dot">✓</b> Last refreshed:<br>${now.toLocaleDateString("en-GB", {month:"long", day:"numeric"})}, ${now.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"})} by Demo User`;
  }

  if (button) {
    button.classList.remove("refreshing");
    button.setAttribute("aria-label", "Connection refresh complete");
  }

  if (text) text.textContent = "Connection refreshed";
  await wait(800);
  popup?.classList.add("hidden");

  wsRefreshing = false;
  showToast("Connection refreshed and spreadsheet values updated.");
}

renderWorkivaGrid();

document.getElementById("ws-toast-close")?.addEventListener("click", () => {
  document.getElementById("ws-refresh-toast")?.classList.add("hidden");
});

// The Chain run automatically starts the visible spreadsheet refresh near completion.
const originalRunWorkivaChain = runWorkivaChain;
runWorkivaChain = async function() {
  if (workivaRunActive) return;
  const promise = originalRunWorkivaChain();
  await wait(4200);
  if (!wsRefreshing) refreshSpreadsheetConnection("s4h");
  return promise;
};


const wrEntities = ["DE61","FR68","GB62","HK64","HK81","HU63","IN68","IT68","JP68","KR68","MX68","MY61","MY69","NL60","NL62","PH62","PH67","SE63","SG61","TW63","US60","US67","0","0","0","0"];
const wrValues = [
  ["—","—","—","—","—","—","—","—","—","—","—"],
  ["—","—","428,870","—","428,870","—","428,870","(17,496,778)","(17,067,908)","—","—"],
  ["—","—","138,159","—","138,159","—","138,159","(2,137)","136,022","—","—"],
  ["—","—","22,703","—","22,703","—","22,703","(47,370)","(24,668)","—","—"],
  ["—","—","14,479","—","14,479","—","14,479","(553,085)","(538,606)","—","—"],
  ["—","—","186,482","—","186,482","—","186,482","(2,072)","184,410","—","—"],
  ["—","—","457,946","—","457,946","—","457,946","(65,539)","392,407","—","—"],
  ["—","—","685,120","—","685,120","—","685,120","—","685,120","—","—"],
  ["—","—","99,670","—","99,670","—","99,670","(43,589)","56,081","—","—"],
  ["—","—","—","—","—","—","—","—","—","—","—"],
  ["—","1,885,405","9,088,156","—","10,973,561","—","10,973,561","(18,630,386)","(7,656,824)","—","(4,000,000)"],
  ["—","—","—","—","—","—","—","—","—","—","—"],
  ["9,656,705","487,821","699,082","—","10,843,608","—","10,843,608","(420,206,382)","(409,362,773)","(3,291,935)","—"],
  ["—","—","—","—","—","(15,419,248)","(15,419,248)","207,680,329","192,261,081","—","—"],
  ["—","744,521","—","—","744,521","—","744,521","(615,089)","129,432","—","—"],
  ["—","—","—","—","—","—","—","(921,323)","(921,323)","—","—"],
  ["—","—","—","—","—","—","—","—","—","—","—"],
  ["—","131,595","—","—","131,595","—","131,595","(14,235)","117,360","—","—"],
  ["—","328,508","—","—","328,508","—","328,508","(1,565,672)","(1,237,164)","—","—"],
  ["—","2,402,215","—","—","2,402,215","—","2,402,215","(2,954,983)","(552,769)","—","—"],
  ["135","—","—","—","135","—","135","—","135","—","—"],
  ["—","—","—","—","—","—","—","—","—","—","—"],
];

function renderWorkivaReportGrid() {
  const body = document.getElementById("wr-grid-body");
  if (!body) return;
  body.innerHTML = "";

  const totalRows = 34;
  for (let r = 0; r < totalRows; r += 1) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.className = "row-num";
    th.textContent = r + 1;
    tr.appendChild(th);

    for (let c = 0; c < 16; c += 1) {
      const td = document.createElement("td");
      td.dataset.row = r;
      td.dataset.col = c;

      if (r === 1 && c === 0) {
        td.textContent = "Navigation";
        td.className = "header-dark";
      } else if (r === 2 && c === 0) {
        td.textContent = "DTA/DTL";
        td.style.background = "#58e1df";
        td.style.textAlign = "center";
        td.style.fontWeight = "700";
      } else if (r === 3 && c >= 3) {
        td.textContent = c === 10 ? "YTD" : "";
        td.className = "header-dark";
      } else if (r === 5 && c === 0) {
        td.textContent = "Year";
        td.className = "header-dark";
      } else if (r === 5 && c === 3) {
        td.textContent = "Entity";
        td.className = "header-light linked";
      } else if (r === 5 && c >= 4) {
        const headers = ["DTA-NOL","DTA-Timing","DTA-Credits","Total DTA","UTP","Total DTA (after UTP netting)","DTL","Net DTA(DTL) Before VA","Unrecognized NOL","Unrecognized Timing","Unrecognized Credits","DTL"];
        td.textContent = headers[c - 4] || "";
        td.className = "header-light linked";
      } else if (r === 7 && c === 0) {
        td.textContent = "2025";
      } else if (r === 8 && c === 0) {
        td.textContent = "Q";
        td.className = "header-dark";
      } else if (r === 9 && c === 0) {
        td.textContent = "Q4";
      } else if (r >= 7 && r < 7 + wrEntities.length && c === 3) {
        td.textContent = wrEntities[r - 7];
        td.className = "text linked";
      } else if (r >= 7 && r < 7 + wrEntities.length && c >= 4 && c <= 14) {
        td.textContent = (wrValues[r - 7] || [])[c - 4] || "—";
        td.className = "linked";
        if ([7, 9, 11, 12, 14].includes(c)) td.classList.add("green");
      }

      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
}

let wrUpdateAvailable = false;
let wrApplied = false;

function makeReportUpdateAvailable() {
  wrUpdateAvailable = true;
  document.getElementById("wr-link-indicator")?.classList.remove("hidden");
  document.getElementById("wr-update-card")?.classList.remove("hidden");
  const publish = document.getElementById("wr-publish-button");
  if (publish) {
    publish.disabled = false;
    publish.classList.add("update-ready");
  }
}

function applyReportUpdates() {
  if (!wrUpdateAvailable) return;

  const changes = [
    [8, 7, "452,810"],
    [8, 9, "452,810"],
    [8, 12, "(16,998,112)"],
    [8, 13, "(16,545,302)"],
    [17, 5, "151,240"],
    [17, 7, "151,240"],
    [17, 13, "136,995"],
    [26, 5, "2,518,920"],
    [26, 7, "2,518,920"],
    [26, 13, "(435,880)"]
  ];

  changes.forEach(([row, col, value]) => {
    const cell = document.querySelector(`#wr-grid-body td[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.textContent = value;
      cell.classList.remove("changed");
      void cell.offsetWidth;
      cell.classList.add("changed");
    }
  });

  wrUpdateAvailable = false;
  document.getElementById("wr-link-indicator")?.classList.add("hidden");
  document.getElementById("wr-update-card")?.classList.add("hidden");

  const publish = document.getElementById("wr-publish-button");
  if (publish) {
    publish.disabled = true;
    publish.classList.remove("update-ready");
  }

  const toast = document.getElementById("wr-update-toast");
  toast?.classList.remove("hidden");
  window.setTimeout(() => toast?.classList.add("hidden"), 2500);

  state.reportUpdateAvailable = false;
  state.reportRefreshed = true;
  reportSummary.textContent = "Refreshed";
  reportAlert.classList.add("hidden");
  refreshReportButton.disabled = true;
  showToast("Linked report figures updated.");
}

renderWorkivaReportGrid();

document.getElementById("wr-link-indicator")?.addEventListener("click", () => {
  document.getElementById("wr-update-card")?.scrollIntoView({behavior:"smooth", block:"center"});
});

document.getElementById("wr-apply-update")?.addEventListener("click", applyReportUpdates);
document.getElementById("wr-publish-button")?.addEventListener("click", applyReportUpdates);

// Sync the report update indicator with the spreadsheet connection refresh.
const originalRefreshSpreadsheetConnection = refreshSpreadsheetConnection;
refreshSpreadsheetConnection = async function(connectionKey = "s4h") {
  const result = await originalRefreshSpreadsheetConnection(connectionKey);
  makeReportUpdateAvailable();
  return result;
};

// Also sync with the older report-refresh control if it is called programmatically.
if (refreshReportButton) {
  refreshReportButton.addEventListener("click", () => {
    if (wrUpdateAvailable) applyReportUpdates();
  });
}


// Compatibility override: the current spreadsheet uses a generated Workiva grid.
updateSpreadsheetValues = function() {
  const updates = [
    [2, 3, "0.326"],
    [2, 4, "0.326"],
    [2, 5, "0.326"],
    [8, 4, "0.3890"],
    [8, 5, "0.3785"]
  ];

  updates.forEach(([row, col, value]) => {
    const cell = document.querySelector(`#ws-grid-body td[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.textContent = value;
  });
};


// Version 8: replace the original Start listener with one reliable end-to-end workflow.
// The original listener was attached before the spreadsheet/report wrappers were defined.
(function installEndToEndChainStart() {
  const existingStart = document.getElementById("workiva-start");
  if (!existingStart) return;

  const coordinatedStart = existingStart.cloneNode(true);
  existingStart.replaceWith(coordinatedStart);

  coordinatedStart.addEventListener("click", async () => {
    if (workivaRunActive || wsRefreshing) return;

    coordinatedStart.disabled = true;

    try {
      // Run the chain nodes first.
      await originalRunWorkivaChain();

      // Refresh every connection automatically; there is no manual refresh action.
      await refreshSpreadsheetConnection("s4h");
      await refreshSpreadsheetConnection("overview");
      await refreshSpreadsheetConnection("sheet1");

      // Ensure the report clearly exposes the linked update and Publish action.
      makeReportUpdateAvailable();
      showToast("Chain complete. Connections refreshed and report updates are ready to publish.");
    } finally {
      coordinatedStart.disabled = false;
    }
  });
})();



const demoGuide = document.getElementById("demo-guide");
const demoGuideTitle = document.getElementById("demo-guide-title");
const demoGuideMessage = document.getElementById("demo-guide-message");
const demoGuideAction = document.getElementById("demo-guide-action");
const demoGuideClose = document.getElementById("demo-guide-close");
let demoGuideTarget = null;

function clearDemoTabAttention() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.remove("demo-attention");
  });
}

function showDemoGuide(targetView, title, message, actionLabel) {
  demoGuideTarget = targetView;
  clearDemoTabAttention();

  if (demoGuideTitle) demoGuideTitle.textContent = title;
  if (demoGuideMessage) demoGuideMessage.textContent = message;
  if (demoGuideAction) demoGuideAction.textContent = actionLabel;

  const targetButton = document.querySelector(`.nav-button[data-view="${targetView}"]`);
  targetButton?.classList.add("demo-attention");
  demoGuide?.classList.remove("hidden");
}

function hideDemoGuide() {
  demoGuide?.classList.add("hidden");
  clearDemoTabAttention();
  demoGuideTarget = null;
}

function openGuidedTab() {
  if (!demoGuideTarget) return;
  const targetButton = document.querySelector(`.nav-button[data-view="${demoGuideTarget}"]`);
  targetButton?.click();
  hideDemoGuide();
}

demoGuideAction?.addEventListener("click", openGuidedTab);
demoGuideClose?.addEventListener("click", hideDemoGuide);

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === demoGuideTarget) hideDemoGuide();
  });
});

// Observe the coordinated workflow and provide the next-step instructions.
let pendingReportGuide = false;
let spreadsheetHasBeenOpened = false;

// Keep the existing message calls as internal workflow signals,
// but do not render the legacy dark toast.
showToast = function(message) {
  if (message.includes("All nodes are green") || message.includes("Chain completed")) {
    window.setTimeout(() => {
      showDemoGuide(
        "spreadsheet-view",
        "Chain execution complete",
        "Select the Spreadsheet tab to watch the connections refresh and review the updated cell values.",
        "Open Spreadsheet"
      );
    }, 350);
    return;
  }

  if (
    message.includes("spreadsheet values updated") ||
    message.includes("Connections refreshed")
  ) {
    pendingReportGuide = true;

    const spreadsheetIsOpen =
      document.getElementById("spreadsheet-view")?.classList.contains("active");

    if (spreadsheetIsOpen) {
      window.setTimeout(() => {
        showDemoGuide(
          "report-view",
          "Connections refreshed",
          "The spreadsheet connections are refreshed. Select the Report tab to review and publish the linked tax-report updates.",
          "Open Report"
        );
        pendingReportGuide = false;
      }, 350);
    }
  }
};

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "spreadsheet-view") {
      spreadsheetHasBeenOpened = true;

      if (pendingReportGuide) {
        window.setTimeout(() => {
          showDemoGuide(
            "report-view",
            "Connections refreshed",
            "The spreadsheet connections are refreshed. Select the Report tab to review and publish the linked tax-report updates.",
            "Open Report"
          );
          pendingReportGuide = false;
        }, 500);
      }
    }
  });
});

