/* Headless smoke test: run app.js against a stub DOM + mock backend,
   render every view and assert the markup has no obvious runtime defects. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const app = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const elements = new Map();
function makeEl(id) {
  const el = {
    id, innerHTML: '', textContent: '', value: '', hidden: false, disabled: false,
    checked: false, placeholder: '', scrollTop: 0, dataset: {}, style: {},
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); }, contains(c) { return this._s.has(c); } },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, remove() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    focus() {}, showModal() {}, close() {}, click() {}, setAttribute() {}, getAttribute() { return null; }
  };
  return el;
}
const doc = {
  documentElement: makeEl('html'), body: makeEl('body'),
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeEl(id)); return elements.get(id); },
  querySelectorAll() { return []; }, querySelector() { return null; },
  addEventListener(type, fn) { (this._h ||= {})[type] = fn; },
  createElement(tag) { return makeEl(tag); }
};

const now = new Date().toISOString();
const mock = {
  '/health': { status: 'ok', version: '3.1.0', gateway_running: true, api_key_configured: false, timestamp: now },
  '/api/config': { success: true, data: { model: 'spark-x2.5-4b', spark_base_url: 'http://127.0.0.1:11434/v1', host: '127.0.0.1', port: 8000, max_tokens: 2048, timeout: 120, custom_base_url: '', custom_model_id: '', embedding_base_url: '', embedding_model: '', theme: 'light', language: 'zh-CN', backup_interval: 3600, backup_keep: 10, auto_backup: true, access_token_required: false } },
  '/api/models': { success: true, data: [{ id: 'spark-x2.5-4b', name: 'Spark-X2.5-4B', provider: 'spark', capability: 'balanced' }, { id: 'spark-x2.5-1.7b', name: 'Spark-X2.5-1.7B', provider: 'spark', capability: 'fast' }] },
  '/api/conversations': { success: true, data: [{ id: 'c1', title: '测试会话', model: 'spark-x2.5-4b', created_at: now, updated_at: now, message_count: 4 }] },
  '/api/conversations/c1': { success: true, data: { id: 'c1', title: '测试会话', model: 'spark-x2.5-4b', messages: [{ role: 'user', content: '你好' }, { role: 'assistant', content: '你好，有什么可以帮你？' }] } },
  '/api/kb': { success: true, data: [{ id: 'd1', name: '资料.pdf', chunks: 3, added_at: now }] },
  '/api/kb/status': { success: true, data: { mode: 'bm25', embeddings_configured: false, docs: 1, chunks: 3, docs_with_vec: 0 } },
  '/api/kb/search': { success: true, data: [{ doc_id: 'd1', name: '资料.pdf', chunk_index: 0, score: 1.24, snippet: '这是一段命中文本', text: '这是一段命中文本' }] },
  '/api/tasks': { success: true, data: [{ id: 't1', title: '准备课程', goal: '准备课程', status: 'done', progress: { done: 2, total: 2 }, created_at: now, updated_at: now }] },
  '/api/tools': { success: true, data: { tools: [{ id: 'file', name: '文件解析', desc: '读取 PDF / Word / Excel', enabled: true }, { id: 'code', name: 'Python 执行', desc: '实验性', enabled: false, experimental: true }], deps: { pypdf: true } } },
  '/api/agents': { success: true, data: [{ id: 'general', name: '通用助手', emoji: '💬', desc: '日常问答' }] },
  '/api/plugins': { success: true, data: [{ name: 'demo', version: '1.0', status: 'loaded', description: '示例插件', loaded: true }] },
  '/api/backup': { success: true, data: [{ id: 'backup_1', timestamp: now, version: '3.1.0', chats: 1, size: 2048 }] },
  '/api/cleanup': { success: true, data: { space: { total: 1048576, chats: 2048 }, disk_free_ratio: 0.7 } },
  '/api/logs': { success: true, data: { logs: [{ time: now, name: 'sparkchat', level: 'INFO', message: '启动成功' }], total: 1, page: 1, page_size: 60 } },
  '/api/config/test': { success: true, data: { ok: true, message: '端点可达' } },
  '/runtime-status.json': {
    backend: 'cuda13', backendLabel: 'CUDA 13.4', engine: 'llama.cpp b12128',
    model: 'Spark-X2.6-4B-Q4_K_M.gguf', displayName: 'Spark-X2.6-4B',
    modelId: 'spark-x2.5-4b', baseUrl: 'http://127.0.0.1:11435/v1',
    ready: true, profile: 'fast'
  }
};

function sseResponse(events) {
  const chunks = events.map(e => 'data: ' + JSON.stringify(e) + '\n\n');
  const stream = new ReadableStream({
    start(c) { chunks.forEach(x => c.enqueue(new TextEncoder().encode(x))); c.close(); }
  });
  return { ok: true, status: 200, body: stream, async json() { return {}; } };
}
async function fetchStub(url) {
  const key = String(url).split('?')[0];
  if (key === '/api/chat/stream') return sseResponse([
    { type: 'meta', conversation_id: 'c1', title: '流式测试', model: 'spark-x2.5-4b' },
    { type: 'delta', delta: '你好，' }, { type: 'delta', delta: '这是流式回复' },
    { type: 'done', conversation_id: 'c1', title: '流式测试' }
  ]);
  const data = mock[key];
  if (!data) return { ok: false, status: 404, async json() { return { detail: { error: 'mock 404' } }; } };
  return { ok: true, status: 200, body: null, async json() { return data; }, async blob() { return {}; } };
}

const store = {};
const sandbox = {
  document: doc, window: {}, console,
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } },
  fetch: fetchStub, TextDecoder, TextEncoder, ReadableStream, AbortController, FormData, Blob, URL,
  setTimeout, clearTimeout, setInterval, clearInterval,
  prompt: () => '重命名', confirm: () => true,
  Date, Math, JSON, String, Number, Array, Object, Error, Promise, RegExp, isNaN, parseInt, parseFloat, encodeURIComponent
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const probe = `
;(async function(){
  await new Promise(r=>setTimeout(r,80));
  const pages=['home','chat','tasks','knowledge','tools','storage','settings'];
  const report=[];
  for(const p of pages){
    PAGE=p; render();
    const html=document.getElementById('content').innerHTML;
    const bad=[];
    if(!html||html.length<100) bad.push('empty');
    if(html.includes('undefined')) bad.push('undefined');
    if(html.includes('[object Object]')) bad.push('[object Object]');
    if(html.includes('NaN')) bad.push('NaN');
    report.push(p+':'+html.length+(bad.length?' ERROR['+bad.join(',')+']':' ok'));
  }
  const right=document.getElementById('right').innerHTML;
  report.push('right:'+right.length+(right.includes('undefined')?' ERROR[undefined]':' ok'));
  const runtimeUI = right.includes('Spark-X2.6-4B') && right.includes('CUDA 13.4') && right.includes('引擎就绪，可以对话');
  report.push('runtime-ui:'+(runtimeUI?'ok':'ERROR[内置模型状态未渲染]'));
  report.push('unix-time:'+(fmt(1793936907.93).includes('2026')?'ok':'ERROR['+fmt(1793936907.93)+']'));
  let sseText='';
  await sse('/api/chat/stream',{message:'x'},ev=>{if(ev.type==='delta')sseText+=ev.delta;},null);
  report.push('sse-delta:'+(sseText==='你好，这是流式回复'?'ok':'ERROR['+sseText+']'));
  report.push('models='+MODELS.length+' sessions='+SESSIONS.length+' docs='+DOCS.length+' tasks='+TASKS.length+' tools='+TOOLS.length);
  console.log(report.join('\\n'));
})().catch(e=>{console.log('FATAL '+e.stack);});
`;

process.on('unhandledRejection', e => console.log('UNHANDLED ' + (e && e.stack || e)));
try { vm.runInContext(app + probe, sandbox, { filename: 'app.js' }); }
catch (e) { console.log('SYNTAX/RUNTIME ' + e.stack); process.exitCode = 1; }
