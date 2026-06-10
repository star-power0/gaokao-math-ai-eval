// Application Logic for Gaokao Math AI grading report

const QUESTIONS_META = [
  { id: 1, type: "单选题", score: 5, key: "B", desc: "样本数据 6, 8, 4, 5, 12 的中位数" },
  { id: 2, type: "单选题", score: 5, key: "A", desc: "平面向量共线及系数求解" },
  { id: 3, type: "单选题", score: 5, key: "C", desc: "三角函数集合交集计算" },
  { id: 4, type: "单选题", score: 5, key: "D", desc: "对数函数切线方程计算" },
  { id: 5, type: "单选题", score: 5, key: "D", desc: "抛物线焦点距离计算" },
  { id: 6, type: "单选题", score: 5, key: "B", desc: "函数最大值求参数 a" },
  { id: 7, type: "单选题", score: 5, key: "B", desc: "一百零八塔等差数列分组求公差 d" },
  { id: 8, type: "单选题", score: 5, key: "A", desc: "空间坐标随机取点求数学期望" },
  { id: 9, type: "多选题", score: 6, key: "ACD", desc: "复数共轭、模、平方及实数性判定" },
  { id: 10, type: "多选题", score: 6, key: "BC", desc: "空间中线线角与二面角距离最值" },
  { id: 11, type: "多选题", score: 6, key: "BCD", desc: "三个单位圆的相交弦长极值" },
  { id: 12, type: "填空题", score: 5, key: "√66/6", desc: "双曲线离心率计算" },
  { id: 13, type: "填空题", score: 5, key: "θ = 3π/2 , f(2\pi/3) = 1", desc: "三角函数偶函数与区间单调性求值" },
  { id: 14, type: "填空题", score: 5, key: "³√(3/2)", desc: "等差/等比混合数列公比 q 最大值" },
  { id: 15, type: "解答题", score: 13, key: "(1) 见证明 (2) 1", desc: "直三棱柱中的线面平行证明与线面角距离求值" },
  { id: 16, type: "解答题", score: 15, key: "(1) cos A = 1/3 (2) 3√5", desc: "解三角形余弦定理及向量法求线段长度" },
  { id: 17, type: "解答题", score: 15, key: "(1) 见分布列 (2)(i) (1-p)ᵏ (ii) 见证明", desc: "投篮概率独立性及几何分布、条件概率证明" },
  { id: 18, type: "解答题", score: 17, key: "(1) x²/4 + y²/3 = 1 (2)(i) √5x - 2y + √5 = 0 (ii) 4√3", desc: "椭圆方程求解、Vieta 定理联立直线及夹角最值" },
  { id: 19, type: "解答题", score: 17, key: "(1) (0, 3/2) (2) 见证明 (3)(i) 见证明 (ii) 见证明", desc: "导数综合压轴题：集合定义、奇偶性证明及构造法单调性证明" }
];

document.addEventListener("DOMContentLoaded", () => {
  // Check if data is loaded
  if (typeof GAOKAO_DATA === "undefined") {
    console.error("GAOKAO_DATA is not defined. Make sure data.js is loaded.");
    return;
  }

  initNavigation();
  initDashboard();
  initModelDetails();
  initQuestionComparison();
});

// View switching logic
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetView = item.getAttribute("data-target");
      
      navItems.forEach(i => i.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));

      item.classList.add("active");
      document.getElementById(targetView).classList.add("active");
    });
  });

  // Dark/Light Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", newTheme);

    const icon = themeToggle.querySelector("i");
    if (newTheme === "light") {
      icon.setAttribute("data-lucide", "moon");
      themeToggle.querySelector("span").textContent = "深色模式";
    } else {
      icon.setAttribute("data-lucide", "sun");
      themeToggle.querySelector("span").textContent = "浅色模式";
    }
    lucide.createIcons();
    
    // Re-render chart with new styles
    updateChartTheme(newTheme);
  });
}

let scoreChart = null;

function updateChartTheme(theme) {
  if (!scoreChart) return;
  const isLight = theme === "light";
  const gridColor = isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
  const textColor = isLight ? "#2d3748" : "#a0aec0";
  
  scoreChart.options.scales.x.grid.color = gridColor;
  scoreChart.options.scales.y.grid.color = gridColor;
  scoreChart.options.scales.x.ticks.color = textColor;
  scoreChart.options.scales.y.ticks.color = textColor;
  scoreChart.update();
}

// Render Dashboard View
function initDashboard() {
  const models = GAOKAO_DATA.models;
  
  // Calculate Stats
  const scores = models.map(m => m.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  document.getElementById("avgScore").textContent = avgScore;
  document.getElementById("maxScore").textContent = maxScore;
  document.getElementById("minScore").textContent = minScore;

  // Render Leaderboard Table
  const tableBody = document.getElementById("leaderboardBody");
  tableBody.innerHTML = "";

  // Sort models by score desc
  const sortedModels = [...models].sort((a, b) => b.score - a.score);

  sortedModels.forEach((model, idx) => {
    const tr = document.createElement("tr");
    
    let rankBadgeClass = "rank-other";
    if (model.rank === 1) rankBadgeClass = "rank-1";
    else if (model.rank === 3) rankBadgeClass = "rank-3";

    tr.innerHTML = `
      <td><span class="rank-badge ${rankBadgeClass}">${model.rank}</span></td>
      <td><span class="model-name-link" data-id="${model.id}">${model.name}</span></td>
      <td style="font-weight: 600; font-size: 15px; color: hsl(var(--accent-cyan));">${model.score}</td>
      <td class="comment-cell" title="${model.comment}">${model.comment}</td>
    `;

    // Add click handler to view details
    tr.querySelector(".model-name-link").addEventListener("click", () => {
      showModelDetails(model.id);
    });

    tableBody.appendChild(tr);
  });

  // Initialize Score Chart
  const ctx = document.getElementById("scoreChart").getContext("2d");
  const chartLabels = models.map(m => m.name);
  const chartData = models.map(m => m.score);

  scoreChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: chartLabels,
      datasets: [{
        label: "官方标准得分",
        data: chartData,
        backgroundColor: "rgba(0, 242, 254, 0.4)",
        borderColor: "rgba(0, 242, 254, 1)",
        borderWidth: 1.5,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(160, 21, 250, 0.5)",
        hoverBorderColor: "rgba(160, 21, 250, 1)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 90,
          max: 150,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: { color: "#2d3748", font: { family: "Outfit" } }
        },
        x: {
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: { color: "#2d3748", font: { family: "Outfit" } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#151c2c",
          titleFont: { family: "Outfit", weight: "bold" },
          bodyFont: { family: "Inter" },
          borderColor: "rgba(0, 242, 254, 0.2)",
          borderWidth: 1
        }
      }
    }
  });

  // Render Full Report Markdown
  const reportBody = document.getElementById("reportContainer");
  reportBody.innerHTML = marked.parse(GAOKAO_DATA.report);
  renderMathInElement(reportBody, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false }
    ],
    throwOnError: false
  });
}

// Jump to Model Details View
function showModelDetails(modelId) {
  const detailsTab = document.querySelector('[data-target="modelView"]');
  detailsTab.click();

  const selectButton = document.querySelector(`.select-button[data-id="${modelId}"]`);
  if (selectButton) selectButton.click();
}

// Render Model Details View
function initModelDetails() {
  const models = GAOKAO_DATA.models;
  const listPanel = document.getElementById("modelsList");

  listPanel.innerHTML = "";

  models.forEach((model, idx) => {
    const btn = document.createElement("button");
    btn.className = "select-button";
    btn.setAttribute("data-id", model.id);
    btn.innerHTML = `
      <span>${model.name}</span>
      <span style="font-size: 13px; color: hsl(var(--accent-cyan));">${model.score}分</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".select-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderSingleModelDetails(model);
    });

    listPanel.appendChild(btn);

    // Click the first model by default
    if (idx === 0) btn.click();
  });
}

function renderSingleModelDetails(model) {
  document.getElementById("modelNameTitle").textContent = model.name;
  document.getElementById("modelRankBadge").textContent = `Rank ${model.rank}`;
  document.getElementById("modelScoreValue").textContent = `${model.score}分`;
  document.getElementById("modelCommentText").textContent = model.comment;

  // Deductions List
  const dBox = document.getElementById("modelDeductionsList");
  dBox.innerHTML = "";

  const keys = Object.keys(model.deductions);
  if (keys.length === 0) {
    dBox.innerHTML = `<span class="deduction-badge no-deduction"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> 无扣分（数学正确满分）</span>`;
  } else {
    keys.forEach(k => {
      const v = model.deductions[k];
      dBox.innerHTML += `<span class="deduction-badge"><i data-lucide="minus-circle" style="width: 14px; height: 14px;"></i> ${k} (-${v}分)</span>`;
    });
  }
  lucide.createIcons();

  // Load Answer Markdown Content
  const ansBox = document.getElementById("modelAnswerBody");
  ansBox.innerHTML = marked.parse(model.content);
  
  // Render LaTeX math expressions
  renderMathInElement(ansBox, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false }
    ],
    throwOnError: false
  });
}

// Helper: Extract single question markdown text from model's full text
function extractQuestionSection(markdown, qNum) {
  // Handle various header formats in markdown
  const patterns = [
    new RegExp("(?:第" + qNum + "题|#### " + qNum + "\\.|" + qNum + "\\s*题|第" + qNum + "题|### " + qNum + ")(.*?)(?=### 第|#### |## 三|## 四|## 五|$)", "si")
  ];
  for (let p of patterns) {
    let m = markdown.match(p);
    if (m) {
      return m[1].trim();
    }
  }
  
  // Fallback search
  const lines = markdown.split("\n");
  let found = false;
  let qText = [];
  for (let l of lines) {
    const norm = l.trim().toLowerCase();
    if (norm.startsWith("### 第" + qNum + "题") || norm.startsWith("#### " + qNum + ".") || norm.startsWith("### " + qNum + " ") || norm.startsWith("### " + qNum + "题") || norm.startsWith("#### 第" + qNum + "题")) {
      found = true;
      continue;
    }
    if (found) {
      if (norm.startsWith("###") || norm.startsWith("####") || norm.startsWith("##")) {
        break;
      }
      qText.push(l);
    }
  }
  if (found) return qText.join("\n").trim();

  return "*未找到该题的完整解答。请参阅模型全卷回答。*";
}

// Render Question Comparison View
function initQuestionComparison() {
  const listPanel = document.getElementById("questionsList");
  listPanel.innerHTML = "";

  QUESTIONS_META.forEach((q, idx) => {
    const btn = document.createElement("button");
    btn.className = "select-button";
    btn.setAttribute("data-id", q.id);
    btn.innerHTML = `
      <span>第 ${q.id} 题</span>
      <span style="font-size: 11px; opacity: 0.6;">${q.type}</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll("#questionsList .select-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderQuestionComparison(q);
    });

    listPanel.appendChild(btn);
    if (idx === 0) btn.click();
  });
}

function renderQuestionComparison(q) {
  document.getElementById("questionTitleText").textContent = `第 ${q.id} 题 - ${q.desc}`;
  document.getElementById("questionKeyBadge").textContent = `标准答案: ${q.key}`;
  document.getElementById("questionScoreBadge").textContent = `分值: ${q.score}分`;

  // Render question description / official text (can extract from report if present)
  const descBox = document.getElementById("questionTextDisplay");
  descBox.innerHTML = `<strong>题型</strong>: ${q.type} | <strong>分值</strong>: ${q.score}分<br><strong>官方标准解答/参考值</strong>: ${q.key}`;

  // Models side-by-side dropdown selectors
  const selA = document.getElementById("compareModelA");
  const selB = document.getElementById("compareModelB");

  selA.innerHTML = "";
  selB.innerHTML = "";

  GAOKAO_DATA.models.forEach((m, idx) => {
    const optA = document.createElement("option");
    optA.value = m.id;
    optA.textContent = m.name;
    selA.appendChild(optA);

    const optB = document.createElement("option");
    optB.value = m.id;
    optB.textContent = m.name;
    // Default select second model for B
    if (idx === 1) optB.selected = true;
    selB.appendChild(optB);
  });

  // Change handlers
  const renderBoxes = () => {
    const idA = selA.value;
    const idB = selB.value;
    const modA = GAOKAO_DATA.models.find(m => m.id === idA);
    const modB = GAOKAO_DATA.models.find(m => m.id === idB);

    renderComparisonBox("compareBoxA", modA, q);
    renderComparisonBox("compareBoxB", modB, q);
  };

  selA.onchange = renderBoxes;
  selB.onchange = renderBoxes;

  // Render first time
  renderBoxes();
}

function renderComparisonBox(containerId, model, q) {
  const box = document.getElementById(containerId);
  const rawText = extractQuestionSection(model.content, q.id);
  
  // Status check: did this model lose points on this question?
  // We can check if the question key (e.g. Q14 or Q15(2)) exists in deductions
  const isDeducted = Object.keys(model.deductions).some(k => k.startsWith(`Q${q.id}`));
  const deductVal = model.deductions[`Q${q.id}`] || (model.deductions[`Q${q.id}(1)`] + model.deductions[`Q${q.id}(2)`]) || 0;
  
  let statusHtml = "";
  if (isDeducted) {
    statusHtml = `<div class="performance-status fail"><i data-lucide="x-circle" style="width: 14px; height: 14px; vertical-align: middle;"></i> 扣 ${deductVal} 分（在该题或其子问中被扣分）</div>`;
  } else {
    statusHtml = `<div class="performance-status success"><i data-lucide="check-circle" style="width: 14px; height: 14px; vertical-align: middle;"></i> 拿满分（或完全符合本题官方标准）</div>`;
  }

  box.querySelector(".comparison-content").innerHTML = marked.parse(rawText) + statusHtml;
  
  // Math render
  renderMathInElement(box.querySelector(".comparison-content"), {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false }
    ],
    throwOnError: false
  });
  
  lucide.createIcons();
}
