/**
 * 就诊记录列表页：读取 data/visits.json 并渲染表格。
 * 纯原生 JS，不引入框架——本实验的重点是工作流与 Git，不是前端技术栈。
 */
const tbody = document.getElementById('rows');
const countEl = document.getElementById('count');

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

function render(list) {
  countEl.textContent = String(list.length);
  tbody.innerHTML = list.length
    ? list.map(rowHtml).join('')
    : '<tr><td colspan="7" class="empty">暂无就诊记录</td></tr>';
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
  .then(render)
  .catch((err) => showError(err.message));
