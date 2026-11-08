'use strict';
/* Spark Chat 工作台 · 样式沿用 SparkChat_工作台优化版.html
   数据层改为对接便携版本地 FastAPI 服务（同源 /api/*），无模拟数据。
   源码：web-frontend-lite/，构建产物：frontend/index.html */

/* 图标统一来自 Morphicons 兼容的 Lucide outline 集（24×24，MIT/ISC）。 */
const PATHS = {
  spark: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4m2-2h-4"/><circle cx="4" cy="20" r="2"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  chat: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092a10 10 0 1 0-4.777-4.719"/>',
  task: '<path d="M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  power: '<path d="M12 2v10m6.4-5.4a9 9 0 1 1-12.77.04"/>',
  stop: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  cpu: '<path d="M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2"/><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="8" height="8" x="8" y="8" rx="1"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  plus: '<path d="M5 12h14m-7-7v14"/>',
  arrow: '<path d="M5 12h14m-7-7l7 7l-7 7"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939"/>',
  menu: '<path d="M4 5h16M4 12h16M4 19h16"/>',
  upload: '<path d="M12 3v12m5-7l-5-5l-5 5m14 7v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  file: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>',
  trash: '<path d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9a9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5m5 4a9 9 0 0 1-9 9a9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  'chevron-right': '<path d="m9 18l6-6l-6-6"/>',
  'external-link': '<path d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
};
const icon = n => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (PATHS[n] || PATHS.spark) + '</svg>';
const icons = () => document.querySelectorAll('[data-icon]').forEach(e => { e.innerHTML = icon(e.dataset.icon); });
const $ = id => document.getElementById(id);
// 预览面板运行在别的端口时，相对 /api 会打到预览服务器（返回 501），
// 这时把 API 指回本机 8000；直接从 8000 打开则保持同源相对路径。
const API_BASE = (() => {
  try { if (location.port && location.port !== '8000') return location.protocol + '//127.0.0.1:8000'; }
  catch (e) { /* noop */ }
  return '';
})();
const url = p => /^https?:\/\//.test(p) ? p : API_BASE + p;
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = v => {
  if (!v) return '';
  let value = v;
  if (typeof v === 'number' || /^\d+(\.\d+)?$/.test(String(v))) {
    value = Number(v);
    // 后端使用 Unix 秒，JavaScript Date 使用毫秒。
    if (value < 1000000000000) value *= 1000;
  }
  const d = new Date(value);
  return isNaN(d) ? String(v) : d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
};
function toast(msg) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.tid); toast.tid = setTimeout(() => { t.hidden = true; }, 3800); }
function notice(msg) { $('noticeText').textContent = msg || ''; $('notice').hidden = !msg; }

const NAVS = [['home', 'home', '工作台'], ['chat', 'chat', '对话'], ['tasks', 'task', '智能任务'], ['knowledge', 'book', '知识库'], ['tools', 'tool', '工具中心'], ['storage', 'db', '数据维护']];
const FEATURES = [
  ['chat', 'chat', '自由对话', '解释知识、梳理思路，逐字流式输出与多轮上下文。'],
  ['tasks', 'task', '智能任务', '把目标拆成可执行步骤，实时查看进度与最终报告。'],
  ['knowledge', 'book', '本地知识库', '导入 PDF / Word / Excel / 文本，离线检索自己的资料。'],
  ['tools', 'tool', '工具中心', '文件解析、数据概览、知识库检索与文档生成，按需开关。']
];
const TEMPLATES = [
  ['写作润色', '请帮我润色以下文字，保持原意，使语言更清晰、自然：\n'],
  ['学习讲解', '请用通俗易懂的语言解释以下知识点，并给出一个生活中的例子：\n'],
  ['内容总结', '请将以下内容整理为核心观点、关键依据和后续行动：\n'],
  ['计划制定', '请根据以下目标制定一个循序渐进、可执行的学习计划：\n']
];
const SUGGESTIONS = ['用通俗的语言解释机器学习', '帮我润色一段工作总结', '为我整理一份学习计划'];

let PAGE = 'home', CURRENT = null, CHAT = [], SELMODEL = '', GENERATING = false, CTRL = null, TASKCTRL = null;
let TOKEN = (() => { try { return localStorage.getItem('spark-access-token') || ''; } catch { return ''; } })();
let CFG = {}, MODELS = [], SESSIONS = [], AGENTS = [], TOOLS = [], DEPS = {}, DOCS = [], KBSTAT = {}, TASKS = [], BACKUPS = [], SPACE = {}, PLUGINS = [], LOGS = [], HEALTH = null, RUNTIME = null, ONLINE = false, TASK_EVENTS = [];

/* ---------- 后端通信 ---------- */
function errOf(j, status) {
  const d = j && j.detail;
  if (d && typeof d === 'object') return d.error || d.message || d.msg || ('请求失败 (' + status + ')');
  if (typeof d === 'string' && d) return d;
  return (j && (j.error || j.message)) || ('请求失败 (' + status + ')');
}
async function api(path, opts) {
  const o = Object.assign({}, opts || {}), h = Object.assign({}, o.headers || {});
  if (TOKEN) h.Authorization = 'Bearer ' + TOKEN;
  if (o.json !== undefined) { h['Content-Type'] = 'application/json'; o.body = JSON.stringify(o.json); delete o.json; }
  let r;
  try { r = await fetch(url(path), Object.assign({}, o, { headers: h })); }
  catch (e) { ONLINE = false; updateTop(); throw new Error('无法连接本地服务，请确认 SparkChat.exe 已启动'); }
  let j = {}; try { j = await r.json(); } catch (e) { /* 非 JSON 响应 */ }
  if (r.status === 401) { needToken(); throw new Error('访问令牌无效，请在「偏好设置」中填写'); }
  if (!r.ok || (j && j.success === false)) throw new Error(errOf(j, r.status));
  ONLINE = true; updateTop();
  return (j && j.data !== undefined) ? j.data : j;
}
async function sse(path, payload, onEvent, signal, method) {
  const h = { 'Content-Type': 'application/json' };
  if (TOKEN) h.Authorization = 'Bearer ' + TOKEN;
  const m = method || 'POST';
  let r = await fetch(url(path), { method: m, headers: h, body: m === 'GET' ? undefined : JSON.stringify(payload || {}), signal });
  if (r.status === 405 && m !== 'GET') {
    r = await fetch(url(path), { method: 'GET', headers: TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {}, signal });
  }
  if (r.status === 401) { needToken(); throw new Error('访问令牌无效'); }
  if (!r.ok || !r.body) throw new Error('流式连接失败 (' + r.status + ')');
  const reader = r.body.getReader(), dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buf = (buf + dec.decode(chunk.value, { stream: true })).replace(/\r\n/g, '\n');
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, i); buf = buf.slice(i + 2);
        const line = block.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === '[DONE]') continue;
        try { onEvent(JSON.parse(raw)); } catch (e) { /* 忽略心跳与非 JSON 行 */ }
      }
    }
  } finally { try { reader.releaseLock(); } catch (e) { /* noop */ } }
}
function needToken() {
  notice('服务要求访问令牌：请打开「偏好设置」，在“访问令牌”中填入启动日志里的令牌后重试。');
  toast('需要访问令牌');
}

/* ---------- 数据加载 ---------- */
function normalizeModels(v) {
  const arr = Array.isArray(v) ? v : (v && Array.isArray(v.models) ? v.models : []);
  return arr.map(x => typeof x === 'string'
    ? { id: x, name: x, provider: '', capability: '' }
    : { id: x.id || x.model_id || x.name, name: x.name || x.id, provider: x.provider || '', capability: x.capability || '' });
}
async function refreshCore() {
  const [h, c, m, s, rs] = await Promise.allSettled([
    api('/health'), api('/api/config'), api('/api/models'), api('/api/conversations'), api('/runtime-status.json')
  ]);
  if (h.status === 'fulfilled') { HEALTH = h.value; ONLINE = true; } else ONLINE = false;
  if (c.status === 'fulfilled') CFG = c.value || {};
  if (m.status === 'fulfilled') MODELS = normalizeModels(m.value);
  if (s.status === 'fulfilled') SESSIONS = Array.isArray(s.value) ? s.value : [];
  // 启动器生成的状态文件；不存在时后端会回退 index.html，api() 会得到 {}，这里安全忽略
  if (rs.status === 'fulfilled' && rs.value && rs.value.displayName) RUNTIME = rs.value;
  if (!SELMODEL) SELMODEL = CFG.model || 'spark-x2.5-4b';
  updateTop();
  if (!ONLINE) notice('本地服务未连接。请双击「启动 Spark Chat（内置模型版）.bat」后刷新本页。');
  else if (RUNTIME && !RUNTIME.ready) notice('内置推理引擎尚未就绪，首次加载 3.3 GB 模型约需 1–2 分钟。');
  else if (CFG.access_token_required && !TOKEN) notice('服务已开启访问令牌保护。如请求失败，请在「偏好设置」中填写令牌。');
  else notice('');
}
const refreshSessions = async () => { try { SESSIONS = await api('/api/conversations'); } catch (e) { /* 保留旧数据 */ } };
const refreshKB = async () => { const [a, b] = await Promise.allSettled([api('/api/kb'), api('/api/kb/status')]); if (a.status === 'fulfilled') DOCS = Array.isArray(a.value) ? a.value : []; if (b.status === 'fulfilled') KBSTAT = b.value || {}; };
const refreshTasks = async () => { try { TASKS = await api('/api/tasks'); } catch (e) { /* noop */ } };
const refreshTools = async () => { try { const r = await api('/api/tools'); TOOLS = (r && r.tools) || []; DEPS = (r && r.deps) || {}; } catch (e) { /* noop */ } };
const refreshAgents = async () => { try { AGENTS = await api('/api/agents'); } catch (e) { /* noop */ } };
const refreshPlugins = async () => { try { PLUGINS = await api('/api/plugins'); } catch (e) { /* noop */ } };
const refreshBackups = async () => { try { BACKUPS = await api('/api/backup'); } catch (e) { /* noop */ } };
const refreshSpace = async () => { try { const r = await api('/api/cleanup'); SPACE = (r && r.space) || r || {}; } catch (e) { /* noop */ } };
const refreshLogs = async (q) => { try { const r = await api('/api/logs?page=1&page_size=60&level=all&search=' + encodeURIComponent(q || '')); LOGS = (r && r.logs) || []; } catch (e) { /* noop */ } };

/* ---------- 通用渲染 ---------- */
function modelName(id) {
  if (RUNTIME && RUNTIME.displayName) return RUNTIME.displayName;
  const m = MODELS.find(x => x.id === id); return m ? m.name : (id || 'Spark-X2.6-4B');
}
function updateTop() {
  const el = $('topState'); if (!el) return;
  const label = (RUNTIME && RUNTIME.ready) ? '内置引擎 · ' + (RUNTIME.backendLabel || '本地')
    : (ONLINE ? '服务在线' : '服务未连接');
  el.innerHTML = '<span class="dot ' + (ONLINE ? 'green' : '') + '"></span>' + label;
}
function renderHistory() {
  const list = SESSIONS.slice(0, 5);
  const items = list.length
    ? list.map(x => '<div class="history-item' + (CURRENT === x.id ? ' active' : '') + '"><button data-session="' + esc(x.id) + '" title="' + esc(x.title || '新对话') + '">' + icon('chat') + '<span class="history-title">' + esc(x.title || '新对话') + '</span></button>' +
        '<button class="history-del" data-del-session="' + esc(x.id) + '" title="删除该会话" aria-label="删除会话">' + icon('x') + '</button></div>').join('')
    : '<div class="history-empty">还没有会话，点上方按钮新建</div>';
  $('history').innerHTML = '<button class="history-new" id="newChatSide">' + icon('plus') + '新建对话</button>' + items;
}
function renderRight() {
  const m = MODELS.find(x => x.id === SELMODEL) || MODELS[0] || {};
  const cur = SESSIONS.find(x => x.id === CURRENT);
  const ready = RUNTIME ? RUNTIME.ready : ONLINE;
  const engine = RUNTIME ? String(RUNTIME.engine || 'llama.cpp').replace(/\s*\(.*$/, '') : 'OpenAI 兼容服务';
  const backend = RUNTIME ? (RUNTIME.backendLabel || '本地推理') : '外部服务';
  const listen = (CFG.host || '127.0.0.1') + ':' + (CFG.port || 8000);
  $('right').innerHTML = `
    <section class="panel model-panel">
      <div class="model-head"><h2>模型与运行状态</h2><span class="chip">LOCAL</span></div>
      <div class="model-identity">
        <div class="model-symbol" data-icon="cpu"></div>
        <div><div class="model-name">${esc(RUNTIME ? RUNTIME.displayName : (m.name || 'Spark-X2.6-4B'))}</div>
        <div class="model-version">${RUNTIME ? '4B 参数 · Q4_K_M 量化' : '本机 OpenAI 兼容服务'}</div></div>
      </div>
      <div class="model-status"><span class="dot ${ready ? 'green' : ''}" id="stateDot"></span><b id="stateText">${(RUNTIME && RUNTIME.ready) ? '引擎就绪，可以对话' : (ONLINE ? '引擎加载中' : '服务未连接')}</b></div>
      <p class="model-description" id="stateDesc">${RUNTIME ? '本地离线推理，无需安装 Ollama。' : '推理端点 ' + esc(CFG.spark_base_url || 'http://127.0.0.1:11434/v1')}</p>
      <select class="search" id="modelSel" aria-label="选择模型">
        ${MODELS.length ? MODELS.map(x => '<option value="' + esc(x.id) + '"' + (x.id === SELMODEL ? ' selected' : '') + '>' + esc(RUNTIME && RUNTIME.displayName ? RUNTIME.displayName : x.name) + '</option>').join('') : '<option value="">加载中…</option>'}
      </select>
      <div class="model-actions"><button class="btn primary" id="testConn">${icon('power')}测试连接</button>
        <button class="icon-btn" id="refreshAll" title="刷新状态" aria-label="刷新状态">${icon('refresh')}</button></div>
      <div class="memory">
        <label>当前会话 <small>本地自动保存</small></label>
        <strong>${esc(cur ? (cur.title || '新对话') : '新对话')}</strong>
        <small>共 ${SESSIONS.length} 个本地会话</small>
      </div>
      <div class="specs">
        <div><span>推理引擎</span><b title="${esc(engine)}">${esc(engine)}</b></div>
        <div><span>计算设备</span><b title="${esc(backend)}">${esc(backend)}</b></div>
        <div><span>本地服务</span><b>${esc(listen)}</b></div>
      </div>
    </section>
    <div class="privacy">${icon('shield')}<span>模型、会话与资料均保存在本机，不会上传到云端。</span></div>`;
}
function render() {
  const views = { home, chat, tasks: tasksPage, knowledge, tools: toolsPage, storage, settings };
  $('content').innerHTML = (views[PAGE] || home)();
  $('crumb').textContent = '/ ' + ((NAVS.find(n => n[0] === PAGE) || [, , '偏好设置'])[2]);
  $('nav').innerHTML = NAVS.map(n => '<button data-page="' + n[0] + '" class="' + (PAGE === n[0] ? 'active' : '') + '">' + icon(n[1]) + n[2] + (n[0] === 'tasks' ? '<span class="tag">Agent</span>' : '') + '</button>').join('');
  renderHistory(); renderRight(); icons();
  if ($('chatLog')) $('chatLog').scrollTop = $('chatLog').scrollHeight;
  if ($('taskEvents')) renderTaskEvents();
}
function go(p) { if (GENERATING) stopGeneration(); PAGE = p; render(); $('sidebar').classList.remove('open'); $('backdrop').classList.remove('open'); }

/* ---------- 页面 ---------- */
function composer() {
  return `<div class="composer">
    <textarea id="prompt" aria-label="输入问题" placeholder="告诉我你想了解什么，或需要处理什么文字…"></textarea>
    <div class="composer-bottom">
      <div class="composer-left"><button class="icon-btn" id="attach" aria-label="导入资料">${icon('plus')}</button>
        <span>Enter 发送 · Shift + Enter 换行 · <span id="composerModel">${esc(modelName(SELMODEL))}</span></span></div>
      <div><button class="btn outline" id="stop" hidden>停止生成</button>
        <button class="btn primary" id="send">${icon('send')}发送问题</button></div>
    </div></div>`;
}
function home() {
  return `<div class="home-hero">
      <section class="hero"><div class="eyebrow">SPARK · LOCAL AI WORKSPACE</div><h1>今天，让灵感<em>更进一步。</em></h1>
      <p>从一个问题开始。模型在本机推理，会话与资料留在本地。</p></section>
      ${composer()}
      <div class="suggestions">${SUGGESTIONS.map(s => '<button data-suggest="' + esc(s) + '">' + esc(s) + '</button>').join('')}</div>
    </div>
    <div class="section-head"><h2>探索你的智能工作空间</h2><span>从想法到行动</span></div>
    <div class="features">${FEATURES.map(x => `<button class="feature" data-page="${x[0]}"><span class="feature-icon">${icon(x[1])}</span><div><strong>${x[2]}</strong><p>${x[3]}</p></div><span class="arrow">${icon('chevron-right')}</span></button>`).join('')}</div>
    <div class="section-head"><h2>最近会话</h2><span>保存在 data/chats</span></div>
    <div class="recent">${SESSIONS.length ? SESSIONS.slice(0, 3).map(s => `<div class="recent-item"><div class="round">${icon('chat')}</div>
      <div><strong>${esc(s.title || '新对话')}</strong><small>${fmt(s.updated_at || s.created_at)} · ${esc(s.message_count || 0)} 条消息</small></div>
      <button data-session="${esc(s.id)}">继续对话 ${icon('external-link')}</button></div>`).join('') : '<div class="empty-recent">还没有会话。在上方输入第一个问题，开始对话吧。</div>'}</div>`;
}
function chat() {
  const s = SESSIONS.find(x => x.id === CURRENT);
  // 早期失败请求可能留下空 assistant 消息，不渲染成只有标题的空气泡。
  const messages = CHAT.filter(m => m.role === 'user' || String(m.content || m.text || '').trim());
  return `<div class="section-head" style="margin-top:0"><div><div class="eyebrow">LOCAL CONVERSATION</div>
      <h1 class="page-title">${esc(s ? (s.title || '新对话') : '开始一段新对话')}</h1></div>
      <div class="row"><button class="btn outline" id="renameChat">重命名</button><button class="btn outline" id="newChat">${icon('plus')}新对话</button></div></div>
    <div class="chat-log" id="chatLog">${messages.length ? messages.map(m => `<div class="message ${esc(m.role)}"><small>${m.role === 'user' ? '你' : 'Spark Chat'}</small>${esc(m.content || m.text || '')}</div>`).join('') : '<div class="info">消息由本地服务保存。选择右侧模型后即可开始对话；Enter 发送，Shift + Enter 换行。</div>'}</div>
    ${composer()}`;
}
function tasksPage() {
  return `<div class="eyebrow">SMART TASKS</div><h1 class="page-title">把目标拆成下一步</h1>
    <p class="lead">描述目标，由端侧模型自动规划步骤、逐步执行并输出报告。</p>
    <section class="panel"><label for="taskGoal">你想完成什么？</label>
      <textarea class="search" id="taskGoal" rows="3" placeholder="例如：准备一节面向大三学生的机器学习课程"></textarea>
      <div class="row"><button class="btn primary" id="runTask">${icon('task')}创建并运行任务</button>
        <button class="btn outline" id="stopTask" hidden>停止</button>
        <span class="small">任务会调用已启用的工具，进度实时推送</span></div>
      <div id="taskEvents"></div></section>
    <div class="section-head"><h2>任务记录</h2><span>${TASKS.length} 个任务</span></div>
    <div class="panel">${TASKS.length ? TASKS.map(t => `<div class="file-row"><div><strong>${esc(t.title || '新任务')}</strong>
      <small>${esc(t.status || 'draft')} · ${esc((t.progress && t.progress.done) || 0)}/${esc((t.progress && t.progress.total) || 0)} 步 · ${fmt(t.updated_at)}</small></div>
      <button class="btn outline" data-task="${esc(t.id)}">查看</button></div>`).join('') : '<div class="info">还没有任务。输入一个目标试试。</div>'}</div>`;
}
function docRows() {
  return DOCS.length ? DOCS.map(d => `<div class="file-row"><div><strong>${esc(d.name || d.id)}</strong>
    <small>${esc(d.chunks != null ? d.chunks + ' 个分块 · ' : '')}${fmt(d.added_at)}</small></div>
    <button class="btn outline" data-del-doc="${esc(d.id)}">删除</button></div>`).join('')
    : '<div class="info">还没有资料。点击「导入资料」添加 PDF、Word、Excel 或文本文件。</div>';
}
function knowledge() {
  return `<div class="eyebrow">PERSONAL KNOWLEDGE</div><h1 class="page-title">让资料，触手可及</h1>
    <p class="lead">导入本地文件后自动切块；默认 BM25 关键词检索，配置 Embedding 后升级为语义混合检索。</p>
    <div class="row"><button class="btn primary" id="import">${icon('upload')}导入资料</button>
      <button class="btn outline" id="kbReindex">重建索引</button>
      <span class="small">${esc(KBSTAT.mode === 'hybrid' ? '混合检索' : 'BM25 关键词检索')} · ${esc(KBSTAT.docs || DOCS.length)} 份资料 · ${esc(KBSTAT.chunks || 0)} 个分块</span></div>
    <input class="search" id="fileSearch" aria-label="检索知识库" placeholder="输入关键词，检索本地资料…">
    <div class="section-head"><h2>检索结果</h2><span>离线检索</span></div>
    <div class="panel search-results" id="searchResults"><div class="info">输入关键词开始检索。</div></div>
    <div class="section-head"><h2>已入库资料</h2><span>保存在 data/kb</span></div>
    <div class="panel" id="filesList">${docRows()}</div>`;
}
function toolsPage() {
  return `<div class="eyebrow">EVERYDAY TOOLS</div><h1 class="page-title">让日常工作更顺手</h1>
    <p class="lead">开关智能体可调用的能力，或使用内置模板与本地文本统计。</p>
    <div class="section-head" style="margin-top:0"><h2>能力开关</h2><span>即时生效</span></div>
    <div class="panel">${TOOLS.length ? TOOLS.map(t => `<div class="form-row"><div>${esc(t.name || t.id)}
      <small>${esc(t.desc || t.description || (t.id === 'code' ? '实验性 Python 执行，默认关闭' : ''))}${t.experimental ? ' · 实验性' : ''}</small></div>
      <input type="checkbox" data-tool="${esc(t.id)}" ${t.enabled ? 'checked' : ''} aria-label="${esc(t.name || t.id)}"></div>`).join('') : '<div class="info">工具列表加载中…</div>'}</div>
    <div class="section-head"><h2>常用模板</h2><span>一键带入对话</span></div>
    <div class="features">${TEMPLATES.map(x => `<button class="feature" data-template="${esc(x[1])}"><span class="feature-icon">${icon('spark')}</span><div><strong>${x[0]}</strong><p>将模板带入对话，补充你的内容</p></div></button>`).join('')}</div>
    <section class="panel" style="margin-top:20px"><h3>文本统计 · 浏览器本地计算</h3>
      <textarea class="search" id="countText" rows="4" placeholder="粘贴文本，即时查看统计"></textarea>
      <div id="countResult" style="color:var(--purple)">0 字符 · 0 个非空白字符 · 0 段</div></section>`;
}
function storage() {
  const cats = SPACE && typeof SPACE === 'object' ? SPACE : {};
  const bytes = n => ((n || 0) / 1024 / 1024).toFixed(2) + ' MB';
  return `<div class="eyebrow">LOCAL DATA</div><h1 class="page-title">你的数据，由你管理</h1>
    <p class="lead">配置、会话、任务、知识库与备份都保存在 U 盘的 data/ 目录。</p>
    <div class="stat"><div>占用空间<strong>${bytes(cats.total)}</strong></div>
      <div>会话<strong>${SESSIONS.length}</strong></div><div>资料<strong>${DOCS.length}</strong></div>
      <div>备份<strong>${BACKUPS.length}</strong></div></div>
    <section class="panel"><h3>备份与恢复</h3>
      <div class="row"><button class="btn primary" id="createBackup">${icon('plus')}创建备份</button>
        <button class="btn outline" id="exportCfg">导出配置</button>
        <button class="btn outline" id="importCfg">导入配置</button></div>
      <div class="divider"></div>
      ${BACKUPS.length ? BACKUPS.map(b => `<div class="file-row"><div><strong>${esc(b.id)}</strong>
        <small>${fmt(b.timestamp)} · ${bytes(b.size)} · ${esc(b.chats || 0)} 个会话</small></div>
        <div class="row"><button class="btn outline" data-restore="${esc(b.id)}">恢复</button>
        <button class="btn outline" data-del-backup="${esc(b.id)}">删除</button></div></div>`).join('') : '<div class="info">还没有备份。</div>'}</section>
    <section class="panel" style="margin-top:20px"><h3>空间清理</h3>
      <div class="form-row"><div>缓存与临时文件<small>清理 data/cache、data/temp 与轮转日志</small></div>
        <button class="btn outline" id="doCleanup">立即清理</button></div>
      <div class="form-row"><div>运行日志<small>查看服务日志，可按级别筛选</small></div>
        <div class="row"><input class="search" style="width:150px;margin:0" id="logSearch" placeholder="搜索日志…">
        <button class="btn outline" id="loadLogs">查看</button><button class="btn outline" id="exportLogs">导出</button></div></div>
      <div class="logbox" id="logBox">${LOGS.length ? LOGS.map(l => '<div>' + esc((l.time || '') + ' [' + (l.level || '') + '] ' + (l.message || '')) + '</div>').join('') : '点击「查看」加载日志。'}</div></section>`;
}
const CFG_FIELDS = [
  ['model', '默认模型', '对话与任务默认使用的模型', 'select-model'],
  ['spark_base_url', '端侧推理端点', 'Ollama / vLLM / LM Studio 的 OpenAI 兼容地址', 'text'],
  ['host', '监听地址', '改为 0.0.0.0 可供局域网访问，重启生效', 'text'],
  ['port', '服务端口', '重启生效', 'number'],
  ['max_tokens', '最大生成长度', '单次回复的 token 上限', 'number'],
  ['timeout', '请求超时（秒）', '模型响应超时时间', 'number'],
  ['custom_base_url', '自定义端点 URL', '留空则不启用', 'text'],
  ['custom_model_id', '自定义模型 ID', '与 URL 同时填写才生效', 'text'],
  ['embedding_base_url', 'Embedding 端点', '配置后知识库升级为语义混合检索', 'text'],
  ['embedding_model', 'Embedding 模型', '留空则使用 BM25', 'text'],
  ['theme', '界面主题', 'light / dark', 'text'],
  ['language', '语言', 'zh-CN / en-US', 'text'],
  ['backup_interval', '自动备份间隔（秒）', '0 表示关闭', 'number'],
  ['backup_keep', '保留备份数', '超出后自动清理旧备份', 'number']
];
function settings() {
  const rows = CFG_FIELDS.map(([key, label, hint, type]) => {
    const val = CFG[key] == null ? '' : CFG[key];
    let field;
    if (type === 'select-model') field = `<select id="cfg_${key}">${MODELS.map(m => '<option value="' + esc(m.id) + '"' + (m.id === (val || SELMODEL) ? ' selected' : '') + '>' + esc(m.name) + '</option>').join('')}</select>`;
    else field = `<input id="cfg_${key}" type="${type === 'number' ? 'number' : 'text'}" value="${esc(val)}">`;
    return `<div class="form-row"><div>${label}<small>${hint}</small></div>${field}</div>`;
  }).join('');
  return `<div class="eyebrow">PREFERENCES</div><h1 class="page-title">打造你的使用习惯</h1>
    <p class="lead">让界面适应你，也让端侧推理与资源使用清晰可控。</p>
    <section class="panel"><h3>连接与模型</h3><div class="setting-grid">${rows}</div>
      <div class="form-row"><div>自动备份<small>按设定周期自动备份配置</small></div>
        <input type="checkbox" id="cfg_auto_backup" ${CFG.auto_backup ? 'checked' : ''} aria-label="自动备份"></div>
      <div class="form-row"><div>访问令牌<small>局域网模式必填；仅保存在本浏览器，随请求发送</small></div>
        <input type="password" id="cfg_token" value="${esc(TOKEN)}" placeholder="启动日志中的令牌"></div>
      <div class="row" style="margin-top:18px"><button class="btn primary" id="saveCfg">保存设置</button>
        <button class="btn outline" id="themeSettings">切换深浅主题</button></div>
      <div class="info" style="margin-top:16px">修改监听地址或端口后需重启 Spark Chat 才会生效；端侧模型本身无需任何 API Key。</div></section>
    <section class="panel" style="margin-top:20px"><h3>已装载插件</h3>
      ${Array.isArray(PLUGINS) && PLUGINS.length ? PLUGINS.map(p => `<div class="form-row"><div>${esc(p.name)} <span class="badge">${esc(p.version || 'v')}</span><small>${esc(p.description || '')}</small></div>
        <span class="badge">${esc(p.status || (p.loaded ? '已装载' : '未装载'))}${p.error ? ' · ' + esc(p.error) : ''}</span></div>`).join('') : '<div class="info">暂无插件信息。把 *.py 放到 exe 同级 plugins/ 目录后重启即可装载。</div>'}</section>
    <section class="panel" style="margin-top:20px"><h3>内置人格</h3>
      ${AGENTS.length ? AGENTS.map(a => `<div class="form-row"><div>${esc(a.emoji || '')} ${esc(a.name)}<small>${esc(a.desc || '')}</small></div><span class="badge">${esc(a.id)}</span></div>`).join('') : '<div class="info">人格列表加载中…</div>'}</section>`;
}

/* ---------- 对话 ---------- */
function appendMsg(role, text) {
  const log = $('chatLog'); if (!log) return null;
  const empty = log.querySelector('.info'); if (empty) empty.remove();
  const d = document.createElement('div'); d.className = 'message ' + role;
  d.innerHTML = '<small>' + (role === 'user' ? '你' : 'Spark Chat') + '</small>';
  const span = document.createElement('span'); span.textContent = text; d.appendChild(span);
  log.appendChild(d); log.scrollTop = log.scrollHeight;
  return span;
}
function setGeneratingUI(on) {
  const send = $('send'), stop = $('stop'), ta = $('prompt');
  if (send) send.disabled = on;
  if (stop) stop.hidden = !on;
  if (ta) ta.placeholder = on ? '正在生成，可点击「停止生成」…' : '告诉我你想了解什么，或需要处理什么文字…';
}
async function openSession(id) {
  CURRENT = id; CHAT = [];
  try { const c = await api('/api/conversations/' + encodeURIComponent(id)); CHAT = (c && c.messages) || []; if (c && c.model) SELMODEL = c.model; }
  catch (e) { toast(e.message); }
  PAGE = 'chat'; render();
}
async function newChat() {
  try {
    const c = await api('/api/conversations', { method: 'POST', json: {} });
    CURRENT = (c && c.id) || null;
    await refreshSessions();
  } catch (e) { CURRENT = null; }
  CHAT = []; PAGE = 'chat'; render();
  const p = $('prompt'); if (p) p.focus();
}
function setPrompt(v) { if (PAGE !== 'chat') { PAGE = 'chat'; CHAT = []; render(); } const p = $('prompt'); if (p) { p.value = v; p.focus(); } }
function stopGeneration() { if (CTRL) { try { CTRL.abort(); } catch (e) { /* noop */ } } GENERATING = false; setGeneratingUI(false); }
async function send() {
  if (GENERATING) return;
  const ta = $('prompt'); const text = ta ? ta.value.trim() : '';
  if (!text) return toast('先写下你的问题吧。');
  if (PAGE !== 'chat') { PAGE = 'chat'; CHAT = []; render(); }
  const uSpan = appendMsg('user', text); if (!uSpan) return;
  const aSpan = appendMsg('assistant', '');
  ta.value = '';
  GENERATING = true; setGeneratingUI(true);
  CTRL = new AbortController();
  const payload = { message: text, model: SELMODEL || undefined };
  if (CURRENT) payload.conversation_id = CURRENT;
  let full = '', streamErr = '';
  try {
    await sse('/api/chat/stream', payload, ev => {
      if (ev.type === 'meta') { CURRENT = ev.conversation_id || CURRENT; }
      else if (ev.type === 'delta') { full += ev.delta || ev.text || ''; if (aSpan) aSpan.textContent = full; if ($('chatLog')) $('chatLog').scrollTop = $('chatLog').scrollHeight; }
      else if (ev.type === 'done') { CURRENT = ev.conversation_id || CURRENT; }
      else if (ev.type === 'error') { streamErr = ev.message || ev.code || '生成失败'; }
      else if (ev.type === 'text' || ev.type === 'activity') { full += ev.text || ''; if (aSpan) aSpan.textContent = full; }
    }, CTRL.signal);
    if (streamErr) throw new Error(streamErr);
    await refreshSessions();
    if (CURRENT) await openSession(CURRENT);
  } catch (e) {
    if (e.name !== 'AbortError') { toast(e.message); if (!full && aSpan) aSpan.textContent = '（生成失败：' + e.message + '）'; }
  } finally {
    GENERATING = false; CTRL = null; setGeneratingUI(false);
    // 对话完成后保持输入框聚焦，避免每轮都要再点一次
    const p = $('prompt');
    if (p && PAGE === 'chat') { p.focus(); p.setSelectionRange(p.value.length, p.value.length); }
  }
}

/* ---------- 智能任务 ---------- */
function renderTaskEvents() {
  const box = $('taskEvents'); if (!box) return;
  box.innerHTML = TASK_EVENTS.slice(-80).map(e => {
    if (e.type === 'status') return '<div class="event"><b>状态</b> ' + esc(e.status || '') + (e.model ? ' · ' + esc(e.model) : '') + '</div>';
    if (e.type === 'plan') return '<div class="event ok"><b>计划已生成</b> ' + esc((e.plan || []).map(p => p.name).join(' → ')) + '</div>';
    if (e.type === 'step') return '<div class="event"><b>步骤 ' + esc((e.index != null ? e.index + 1 : '?')) + '</b> ' + esc(e.name || '') + ' · ' + esc(e.status || '') + '</div>';
    if (e.type === 'text' || e.type === 'activity') return '<div class="event"><pre>' + esc(e.text || '') + '</pre></div>';
    if (e.type === 'report' || e.type === 'done') return '<div class="event ok"><b>任务报告</b><pre>' + esc(e.text || e.report || e.output || '') + '</pre></div>';
    if (e.type === 'error') return '<div class="event err"><b>错误</b> ' + esc(e.message || e.code || '') + '</div>';
    return '<div class="event small"><pre>' + esc(JSON.stringify(e)) + '</pre></div>';
  }).join('');
  box.scrollTop = box.scrollHeight;
}
async function runTask() {
  if (TASKCTRL) return;
  const goal = $('taskGoal') ? $('taskGoal').value.trim() : '';
  if (!goal) return toast('请先描述任务目标。');
  TASK_EVENTS = []; renderTaskEvents();
  const btn = $('runTask'); if (btn) btn.disabled = true;
  const stop = $('stopTask'); if (stop) stop.hidden = false;
  TASKCTRL = new AbortController();
  try {
    const fd = new FormData();
    fd.append('title', goal.slice(0, 24)); fd.append('goal', goal);
    fd.append('agent', 'general'); fd.append('model', SELMODEL || 'auto');
    const t = await api('/api/tasks', { method: 'POST', body: fd });
    const id = t && (t.id || t.task_id);
    if (!id) throw new Error('任务创建失败');
    await sse('/api/tasks/' + encodeURIComponent(id) + '/run/stream', {}, ev => { TASK_EVENTS.push(ev); renderTaskEvents(); }, TASKCTRL.signal);
    await refreshTasks();
    toast('任务执行结束');
  } catch (e) {
    if (e.name !== 'AbortError') { TASK_EVENTS.push({ type: 'error', message: e.message }); renderTaskEvents(); toast(e.message); }
  } finally {
    TASKCTRL = null; if (btn) btn.disabled = false; if (stop) stop.hidden = true;
  }
}

/* ---------- 知识库 / 工具 / 数据维护 ---------- */
async function uploadFiles(files) {
  if (!files || !files.length) return;
  const fd = new FormData(); [...files].forEach(f => fd.append('files', f));
  try {
    const r = await api('/api/kb/upload', { method: 'POST', body: fd });
    const n = r && (r.added != null ? r.added : (Array.isArray(r) ? r.length : files.length));
    toast('已导入 ' + n + ' 份资料');
    await refreshKB(); PAGE = 'knowledge'; render();
  } catch (e) { toast(e.message); }
}
async function kbSearch(q) {
  const box = $('searchResults'); if (!box) return;
  if (!q.trim()) { box.innerHTML = '<div class="info">输入关键词开始检索。</div>'; return; }
  box.innerHTML = '<div class="small">检索中…</div>';
  try {
    const r = await api('/api/kb/search?q=' + encodeURIComponent(q) + '&top=8&mode=auto');
    const hits = Array.isArray(r) ? r : (r && (r.hits || r.results)) || [];
    box.innerHTML = hits.length ? hits.map(h => `<div class="file-row"><div><strong>${esc(h.name || h.doc_id)} <span class="badge">${esc((h.score || 0).toFixed ? h.score.toFixed(2) : h.score)}</span></strong>
      <small>第 ${esc((h.chunk_index != null ? h.chunk_index + 1 : 1))} 块 · ${esc(h.doc_id || '')}</small>
      <div class="small" style="margin-top:6px">${esc(h.snippet || (h.text || '').slice(0, 160))}</div></div></div>`).join('')
      : '<div class="info">没有找到匹配内容。</div>';
  } catch (e) { box.innerHTML = '<div class="info">' + esc(e.message) + '</div>'; }
}
async function saveSettings() {
  const patch = {};
  CFG_FIELDS.forEach(([key, , , type]) => {
    const el = $('cfg_' + key); if (!el) return;
    patch[key] = type === 'number' ? Number(el.value) : el.value;
  });
  patch.auto_backup = !!($('cfg_auto_backup') && $('cfg_auto_backup').checked);
  try {
    await api('/api/config', { method: 'POST', json: patch });
    const tk = $('cfg_token'); TOKEN = tk ? tk.value.trim() : TOKEN;
    try { localStorage.setItem('spark-access-token', TOKEN); } catch (e) { /* noop */ }
    toast('设置已保存'); await refreshCore(); render();
  } catch (e) { toast(e.message); }
}
async function download(path, name, method) {
  const h = TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {};
  const r = await fetch(url(path), { method: method || 'POST', headers: h });
  if (!r.ok) throw new Error('导出失败 (' + r.status + ')');
  const b = await r.blob(), u = URL.createObjectURL(b), a = document.createElement('a');
  a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000);
}
function confirmBox(title, text) {
  return new Promise(resolve => {
    $('confirmTitle').textContent = title; $('confirmText').textContent = text;
    const d = $('confirmDialog'), ok = $('confirmOk'), cancel = $('confirmCancel');
    const done = v => { d.close(); ok.removeEventListener('click', yes); cancel.removeEventListener('click', no); resolve(v); };
    const yes = () => done(true), no = () => done(false);
    ok.addEventListener('click', yes); cancel.addEventListener('click', no);
    d.showModal();
  });
}
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('spark-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); } catch (e) { /* noop */ }
}

/* ---------- 事件 ---------- */
document.addEventListener('click', async e => {
  const n = e.target.closest('[data-page],[data-suggest],[data-session],[data-template],[data-del-doc],[data-del-session],[data-task],[data-restore],[data-del-backup]');
  if (n) {
    if (n.dataset.page) return go(n.dataset.page);
    if (n.dataset.suggest || n.dataset.template) return setPrompt(n.dataset.suggest || n.dataset.template);
    if (n.dataset.session) return openSession(n.dataset.session);
    if (n.dataset.task) {
      try { const t = await api('/api/tasks/' + encodeURIComponent(n.dataset.task)); toast((t && (t.title || '任务')) + ' · ' + (t && t.status || '')); }
      catch (err) { toast(err.message); }
      return;
    }
    if (n.dataset.delSession) {
      const sid = n.dataset.delSession;
      if (!await confirmBox('删除会话', '确定删除这个会话及其全部消息？此操作不可撤销。')) return;
      try {
        await api('/api/conversations/' + encodeURIComponent(sid), { method: 'DELETE' });
        if (CURRENT === sid) { CURRENT = null; CHAT = []; }
        await refreshSessions(); render(); toast('会话已删除');
      } catch (err) { toast(err.message); }
      return;
    }
    if (n.dataset.delDoc) {
      if (!await confirmBox('删除资料', '确定从知识库删除这份资料？此操作不可撤销。')) return;
      try { await api('/api/kb/' + encodeURIComponent(n.dataset.delDoc), { method: 'DELETE' }); toast('资料已删除'); await refreshKB(); render(); } catch (err) { toast(err.message); }
      return;
    }
    if (n.dataset.restore) {
      if (!await confirmBox('恢复备份', '将用该备份覆盖当前配置与会话，确定继续？')) return;
      try { await api('/api/backup/restore', { method: 'POST', json: { backup_id: n.dataset.restore } }); toast('备份已恢复'); await refreshCore(); render(); } catch (err) { toast(err.message); }
      return;
    }
    if (n.dataset.delBackup) {
      if (!await confirmBox('删除备份', '确定删除这个备份文件？')) return;
      try { await api('/api/backup/' + encodeURIComponent(n.dataset.delBackup), { method: 'DELETE' }); toast('备份已删除'); await refreshBackups(); render(); } catch (err) { toast(err.message); }
      return;
    }
  }
  const id = e.target.closest('button') ? e.target.closest('button').id : '';
  switch (id) {
    case 'send': send(); break;
    case 'stop': stopGeneration(); toast('已停止生成'); break;
    case 'newChat': case 'newChatSide': newChat(); break;
    case 'renameChat': {
      if (!CURRENT) return toast('请先开始一段对话');
      const s = SESSIONS.find(x => x.id === CURRENT);
      const t = prompt('重命名会话', s ? s.title : '');
      if (t && t.trim()) { try { await api('/api/conversations/' + encodeURIComponent(CURRENT), { method: 'PATCH', json: { title: t.trim() } }); await refreshSessions(); render(); } catch (err) { toast(err.message); } }
      break;
    }
    case 'attach': toast('选择文件后将导入本地知识库'); $('fileInput').click(); break;
    case 'import': $('fileInput').click(); break;
    case 'kbReindex': try { const r = await api('/api/kb/reindex', { method: 'POST', json: {} }); toast(r && r.ok === false ? '索引重建失败' : '索引已重建'); await refreshKB(); render(); } catch (err) { toast(err.message); } break;
    case 'runTask': runTask(); break;
    case 'stopTask': if (TASKCTRL) { try { TASKCTRL.abort(); } catch (err) { /* noop */ } } break;
    case 'testConn': {
      toast('正在测试连接…');
      try { const r = await api('/api/config/test', { method: 'POST', json: { model: SELMODEL } }); toast((r && r.ok ? '连接正常：' : '连接失败：') + (r && r.message || '')); }
      catch (err) { toast(err.message); }
      break;
    }
    case 'refreshAll': await refreshCore(); await Promise.allSettled([refreshKB(), refreshTools(), refreshTasks(), refreshAgents(), refreshPlugins(), refreshBackups(), refreshSpace()]); render(); toast('状态已刷新'); break;
    case 'createBackup': try { const r = await api('/api/backup', { method: 'POST', json: { include_chats: true } }); toast('备份已创建：' + ((r && r.backup_id) || '')); await refreshBackups(); render(); } catch (err) { toast(err.message); } break;
    case 'exportCfg': try { await download('/api/config/export', 'spark-chat-config.json'); toast('配置已导出'); } catch (err) { toast(err.message); } break;
    case 'exportLogs': try { await download('/api/logs/export', 'spark-chat-logs.txt', 'GET'); toast('日志已导出'); } catch (err) { toast(err.message); } break;
    case 'importCfg': {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
      inp.onchange = async () => {
        if (!inp.files || !inp.files[0]) return;
        const fd = new FormData(); fd.append('file', inp.files[0]);
        try { await api('/api/config/import', { method: 'POST', body: fd }); toast('配置已导入'); await refreshCore(); render(); } catch (err) { toast(err.message); }
      };
      inp.click(); break;
    }
    case 'doCleanup': {
      if (!await confirmBox('清理空间', '将清理缓存、临时文件与日志，确定继续？')) return;
      try { await api('/api/cleanup', { method: 'POST', json: { cache: true, temp: true, logs: true, chat_days: 0 } }); toast('清理完成'); await refreshSpace(); render(); } catch (err) { toast(err.message); }
      break;
    }
    case 'loadLogs': await refreshLogs($('logSearch') ? $('logSearch').value : ''); render(); break;
    case 'saveCfg': saveSettings(); break;
    case 'theme': case 'themeSettings': toggleTheme(); break;
    case 'menu': $('sidebar').classList.toggle('open'); $('backdrop').classList.toggle('open'); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.target.id === 'prompt' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'fileSearch') {
    clearTimeout(window.__kbTimer);
    window.__kbTimer = setTimeout(() => kbSearch(e.target.value), 350);
  }
  if (e.target.id === 'countText') {
    const t = e.target.value;
    $('countResult').textContent = t.length + ' 字符 · ' + t.replace(/\s/g, '').length + ' 个非空白字符 · ' + t.split(/\n+/).filter(x => x.trim()).length + ' 段';
  }
});
document.addEventListener('change', async e => {
  if (e.target.id === 'modelSel') { SELMODEL = e.target.value; renderRight(); const c = $('composerModel'); if (c) c.textContent = modelName(SELMODEL); }
  if (e.target.dataset && e.target.dataset.tool) {
    try { await api('/api/tools', { method: 'POST', json: { id: e.target.dataset.tool, enabled: e.target.checked } }); toast('工具状态已更新'); }
    catch (err) { e.target.checked = !e.target.checked; toast(err.message); }
  }
});
$('fileInput').onchange = e => { uploadFiles(e.target.files); e.target.value = ''; };
$('backdrop').onclick = () => { $('sidebar').classList.remove('open'); $('backdrop').classList.remove('open'); };

(async function boot() {
  try { if (localStorage.getItem('spark-theme') === 'dark') document.documentElement.classList.add('dark'); } catch (e) { /* noop */ }
  render();
  await refreshCore();
  render();
  await Promise.allSettled([refreshKB(), refreshTools(), refreshTasks(), refreshAgents(), refreshPlugins(), refreshBackups(), refreshSpace()]);
  render();
})();
