/**
 * 就诊记录列表页：读取 data/visits.json 并渲染表格。
 * 纯原生 JS，不引入框架——本实验的重点是工作流与 Git，不是前端技术栈。
 */
const tbody = document.getElementById('rows');
const countEl = document.getElementById('count');
const deptEl = document.getElementById('filter-dept');
const kwEl = document.getElementById('filter-kw');
const resetEl = document.getElementById('filter-reset');
const hintEl = document.getElementById('filter-hint');

let allVisits = [];

const STATUS_CLASS = {
  '已就诊': 'ok',
  '待就诊': 'wait',
  '已取消': 'cancel',
};

/** 转义 HTML，避免数据里的尖括号破坏结构 */
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

/** 2026-11-13T08:35:00 → 2026-11-13 08:35 */
function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
    + `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function rowHtml(visit) {
  const cls = STATUS_CLASS[visit.status] || '';
  return `
    <tr>
      <td class="visit-no">${esc(visit.visit_no)}</td>
      <td>${esc(visit.patient_name)}</td>
      <td>${esc(visit.department)}</td>
      <td class="diagnosis">${esc(visit.diagnosis)}</td>
      <td>${esc(formatTime(visit.visit_time))}</td>
      <td><span class="pill ${cls}">${esc(visit.status)}</span></td>
      <td class="col-action">
        <a class="btn" href="visit.html?id=${encodeURIComponent(visit.id)}">查看</a>
      </td>
    </tr>`;
}

/** 按就诊时间倒序（最近的排前面）；不改动传入数组 */
function sortByVisitTimeDesc(list) {
  return [...list].sort(
    (a, b) => new Date(b.visit_time).getTime() - new Date(a.visit_time).getTime(),
  );
}

function render(list) {
  const rows = sortByVisitTimeDesc(list);
  countEl.textContent = String(list.length);
  tbody.innerHTML = rows.length
    ? rows.map(rowHtml).join('')
    : '<tr><td colspan="7" class="empty">没有符合条件的就诊记录</td></tr>';
  hintEl.textContent = list.length === allVisits.length
    ? ''
    : `筛选后 ${list.length} / ${allVisits.length} 条`;
}

/** 按科室 + 关键词过滤；关键词匹配患者姓名或就诊号 */
function applyFilter() {
  const dept = deptEl.value;
  const kw = kwEl.value.trim().toLowerCase();
  const filtered = allVisits.filter((v) => {
    const deptOk = !dept || v.department === dept;
    const kwOk = !kw
      || v.patient_name.toLowerCase().includes(kw)
      || v.visit_no.toLowerCase().includes(kw);
    return deptOk && kwOk;
  });
  render(filtered);
}

function fillDepartments(list) {
  const departments = [...new Set(list.map((v) => v.department))].sort(
    (a, b) => a.localeCompare(b, 'zh-Hans-CN'),
  );
  deptEl.innerHTML = ['<option value="">全部科室</option>']
    .concat(departments.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`))
    .join('');
}

function bindFilters() {
  deptEl.addEventListener('change', applyFilter);
  kwEl.addEventListener('input', applyFilter);
  resetEl.addEventListener('click', () => {
    deptEl.value = '';
    kwEl.value = '';
    applyFilter();
  });
}

function showError(message) {
  countEl.textContent = '0';
  tbody.innerHTML = `<tr><td colspan="7" class="empty error">加载失败：${esc(message)}</td></tr>`;
}

async function load() {
  const res = await fetch('data/visits.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

load()
  .then((list) => {
    allVisits = list;
    fillDepartments(list);
    bindFilters();
    render(list);
  })
  .catch((err) => showError(err.message));
