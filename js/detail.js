/**
 * 就诊详情页：从 ?id= 读取就诊记录 id，渲染详情与处方摘要。
 */
const STATUS_CLASS = {
  '已就诊': 'ok',
  '待就诊': 'wait',
  '已取消': 'cancel',
};

const fieldsEl = document.getElementById('fields');
const prescEl = document.getElementById('prescription-box');
const statusEl = document.getElementById('status');
const titleEl = document.getElementById('page-title');
const subEl = document.getElementById('page-sub');
const noEl = document.getElementById('visit-no');

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
    + `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function field(label, value, full = false) {
  return `<div${full ? ' class="full"' : ''}>
      <dt>${esc(label)}</dt>
      <dd>${esc(value)}</dd>
    </div>`;
}

function renderDetail(v) {
  document.title = `${v.patient_name} 的就诊详情 · 示范市第一人民医院`;
  titleEl.textContent = `${v.patient_name} · ${v.department}`;
  subEl.textContent = `${v.doctor} 医师 · ${formatTime(v.visit_time)}`;
  noEl.textContent = v.visit_no;

  const cls = STATUS_CLASS[v.status] || '';
  statusEl.innerHTML = `<span class="pill ${cls}">${esc(v.status)}</span>`;

  fieldsEl.innerHTML = [
    field('患者姓名', v.patient_name),
    field('性别 / 年龄', `${v.gender} / ${v.age} 岁`),
    field('科室', v.department),
    field('接诊医生', `${v.doctor} 医师`),
    field('就诊时间', formatTime(v.visit_time)),
    field('费用合计', `¥ ${Number(v.fee).toFixed(2)}`),
    field('主诉', v.chief_complaint, true),
    field('诊断', v.diagnosis, true),
    field('医嘱', v.note, true),
  ].join('');

  if (!v.prescription || v.prescription.length === 0) {
    prescEl.innerHTML = '<p class="muted">本次就诊暂无处方记录。</p>';
    return;
  }

  const rows = v.prescription.map((p) => `
    <tr>
      <td>${esc(p.name)}</td>
      <td>${esc(p.spec)}</td>
      <td>${esc(p.usage)}</td>
    </tr>`).join('');

  prescEl.innerHTML = `
    <table class="prescription">
      <thead>
        <tr><th>药品</th><th>规格</th><th>用法用量</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function showError(message) {
  titleEl.textContent = '未找到就诊记录';
  subEl.textContent = '';
  fieldsEl.innerHTML = '';
  statusEl.innerHTML = '';
  prescEl.innerHTML = `<p class="muted">${esc(message)}</p>`;
}

async function init() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    showError('缺少就诊记录编号（URL 中需要带 ?id=）。');
    return;
  }
  try {
    const res = await fetch('data/visits.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    const record = list.find((item) => item.id === id);
    if (!record) {
      showError(`没有找到编号为 ${id} 的就诊记录。`);
      return;
    }
    renderDetail(record);
  } catch (err) {
    showError(`加载失败：${err.message}`);
  }
}

init();
