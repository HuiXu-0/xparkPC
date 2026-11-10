/* Spark Chat · GitHub Pages 界面展示层
 *
 * 仅用于 preview/index.html 这份静态副本：
 *  - 覆盖 window.fetch，提供一组纯内存示例数据，让界面在没有任何后端时也能完整显示；
 *  - 不修改产品源码，不调用真实模型，不向任何服务器发送请求，不读写用户文件；
 *  - 刷新页面即恢复初始示例数据。
 */
(function () {
  'use strict';

  var nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  var enc = new TextEncoder();
  var NOW = Date.now();
  var HOUR = 3600000;
  var DAY = 86400000;
  var NOTE = '\n\n（界面演示示例，非模型真实输出）';

  function json(data, status) {
    return new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  function text(data, type) {
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': type || 'text/plain; charset=utf-8' }
    });
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function ok(extra) { return json(Object.assign({ ok: true }, extra || {})); }

  /* ---------------- 示例数据 ---------------- */
  var DB = {
    config: {
      model: 'spark-x2.6-4b',
      spark_base_url: 'http://127.0.0.1:8000/v1',
      host: '127.0.0.1', port: 8000,
      max_tokens: 512, timeout: 120,
      custom_base_url: '', custom_model_id: '',
      embedding_base_url: '', embedding_model: '',
      theme: 'light', language: 'zh-CN',
      backup_interval: 0, backup_keep: 5,
      auto_backup: true
    },
    runtime: {
      displayName: 'Spark-X2.6-4B Q4_K_M',
      engine: 'llama.cpp b12128',
      backendLabel: 'Vulkan · RTX 5070 Ti',
      profile: '内置推理',
      baseUrl: 'http://127.0.0.1:8000/v1',
      ready: true
    },
    models: [
      { id: 'spark-x2.6-4b', name: 'Spark-X2.6-4B Q4_K_M', provider: '内置', capability: '端侧离线对话' }
    ],
    sessions: [
      {
        id: 'd8f2c1a9b001', title: '端侧模型部署笔记',
        created_at: NOW - 2 * DAY, updated_at: NOW - 2 * HOUR, message_count: 4,
        messages: [
          { role: 'user', content: '帮我梳理一下在 Windows 上离线部署 4B 模型的要点。' },
          { role: 'assistant', content: '可以分成四步：\n1. 准备 GGUF 权重与匹配的推理运行时；\n2. 确认显卡驱动与 Vulkan / CUDA 后端可用；\n3. 设置上下文长度，注意显存占用；\n4. 启动本地服务，用浏览器访问工作台。\n\n完整版里这些步骤都由项目内置，双击启动脚本即可。' },
          { role: 'user', content: '上下文开到多大比较合适？' },
          { role: 'assistant', content: '在 12GB 显存上，32768 tokens 是本机实测能稳定运行的一档，显存占用约 10GB。再往上需要量化 KV cache 或做显存卸载。' }
        ]
      },
      {
        id: 'c40e7b512ab2', title: '周报润色与要点提炼',
        created_at: NOW - 3 * DAY, updated_at: NOW - 26 * HOUR, message_count: 2,
        messages: [
          { role: 'user', content: '把这周的工作总结润色成三点，语气简洁一些。' },
          { role: 'assistant', content: '1. 完成内置推理链路改造，模型改为本机 GPU 加载；\n2. 前端工作台重构，统一图标与视觉层次；\n3. 补齐会话增删、流式输出与上下文管理。' }
        ]
      },
      {
        id: 'a1c93d4e77b0', title: '知识库检索测试',
        created_at: NOW - 5 * DAY, updated_at: NOW - 4 * DAY, message_count: 2,
        messages: [
          { role: 'user', content: '从导入的资料里找出关于量化格式的说明。' },
          { role: 'assistant', content: '检索到 Q4_K_M 相关段落：这是兼顾体积与精度的常用量化档位，适合在消费级显卡上运行 4B 级别模型。' }
        ]
      },
      {
        id: 'b7f0182cd493', title: '机器学习概念速览',
        created_at: NOW - 8 * DAY, updated_at: NOW - 7 * DAY, message_count: 2,
        messages: [
          { role: 'user', content: '用通俗的语言解释机器学习' },
          { role: 'assistant', content: '机器学习就像让电脑从大量例子里自己总结规律，而不是由人把每条规则写死。你给它很多「题目 + 答案」，它调整内部参数，之后遇到新题目也能给出合理答案。' }
        ]
      }
    ],
    docs: [
      { id: 'doc-01', name: 'Spark-X2.6 模型说明.md', chunks: 12, added_at: NOW - 6 * DAY },
      { id: 'doc-02', name: 'llama.cpp 后端对照表.csv', chunks: 5, added_at: NOW - 4 * DAY },
      { id: 'doc-03', name: '项目部署记录.txt', chunks: 8, added_at: NOW - 1 * DAY }
    ],
    kbstat: { mode: 'bm25', docs: 3, chunks: 25 },
    tasks: [
      { id: 'task-01', title: '准备一节端侧模型入门课', status: 'done', progress: { done: 3, total: 3 }, updated_at: NOW - 2 * DAY },
      { id: 'task-02', title: '整理本周前端改动清单', status: 'draft', progress: { done: 1, total: 4 }, updated_at: NOW - 5 * HOUR }
    ],
    tools: [
      { id: 'file', name: '文件解析', desc: '读取 PDF / Word / Excel / 文本', enabled: true },
      { id: 'kb', name: '知识库检索', desc: '在本地资料中检索相关段落', enabled: true },
      { id: 'stats', name: '数据概览', desc: '对表格数据做基础统计', enabled: true },
      { id: 'doc', name: '文档生成', desc: '把结果整理成 Markdown 报告', enabled: false },
      { id: 'code', name: 'Python 执行', desc: '实验性能力，默认关闭', enabled: false, experimental: true }
    ],
    agents: [
      { id: 'general', name: '通用助手', desc: '日常问答、整理与写作' },
      { id: 'tutor', name: '讲解导师', desc: '把复杂概念拆成易懂步骤' },
      { id: 'writer', name: '写作搭档', desc: '润色、改写与结构化输出' }
    ],
    plugins: [
      { name: '本地知识库', version: 'v1.2', description: '离线切块与检索', status: '已装载' },
      { name: '文本统计', version: 'v1.0', description: '字符 / 段落即时统计', status: '已装载' }
    ],
    backups: [
      { id: 'backup-2026-11-08', timestamp: NOW - 2 * DAY, size: 2.4 * 1024 * 1024, chats: 4 }
    ],
    logs: [
      { time: '10:24:31', level: 'INFO', message: '内置引擎就绪 · Vulkan0 · 显存 6735 MiB' },
      { time: '10:24:33', level: 'INFO', message: '模型 Spark-X2.6-4B Q4_K_M 加载完成' },
      { time: '10:25:02', level: 'INFO', message: '会话 d8f2c1a9b001 已保存' }
    ],
    space: { total: 18.6 * 1024 * 1024, cache: 4.2 * 1024 * 1024, chats: 1.1 * 1024 * 1024, kb: 6.8 * 1024 * 1024 }
  };

  /* ---------------- 模拟流式响应 ---------------- */
  function stream(events, signal) {
    var i = 0, timer = null, closed = false;
    var body = new ReadableStream({
      start: function (controller) {
        var step = function () {
          if (closed) return;
          if ((signal && signal.aborted) || i >= events.length) {
            closed = true;
            try { controller.close(); } catch (e) { /* noop */ }
            return;
          }
          var ev = events[i++];
          try { controller.enqueue(enc.encode('data: ' + JSON.stringify(ev) + '\n\n')); }
          catch (e) { closed = true; return; }
          timer = setTimeout(step, 45);
        };
        timer = setTimeout(step, 120);
      },
      cancel: function () { closed = true; if (timer) clearTimeout(timer); }
    });
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' }
    });
  }

  function replyFor(msg) {
    var q = String(msg || '');
    if (/你好|您好|hello|hi\b|在吗/i.test(q)) {
      return '你好！我是 Spark Chat —— 一个把模型、推理引擎和会话都留在本机的桌面工作台。\n\n完整版里，这句话会交给内置的 Spark-X2.6-4B（Q4_K_M）在你的显卡上离线推理，并以流式方式逐字输出；会话保存在项目 data/ 目录，不会上传到云端。\n\n你现在可以试试左侧「最近会话」、知识库、智能任务，或者切换深浅主题。';
    }
    if (/机器学习|解释|什么是|原理/.test(q)) {
      return '机器学习就是让程序从大量例子里自己总结规律，而不是由人把每条规则写死。\n\n打个比方：教小孩认水果，与其背「圆形、红色、有柄」这些规则，不如给他看很多苹果和橘子，让他自己发现区别。模型训练做的事类似——用大量样本不断调整内部参数，之后遇到没见过的输入也能给出合理判断。';
    }
    if (/润色|总结|提炼|改写|文案/.test(q)) {
      return '可以。一个稳妥的润色顺序是：\n\n1. 先删掉重复和口头语，保留事实与结论；\n2. 把长句拆成「观点 + 依据」的短句；\n3. 统一时态、称谓和标点；\n4. 最后按重要程度重排，把结论放到开头。\n\n把原文贴给我，我就可以按这个结构帮你改一遍。';
    }
    if (/计划|学习|安排|步骤/.test(q)) {
      return '一份可执行的学习计划，建议先定「能拿去用的产出」，再倒推每周任务：\n\n第 1 周：跑通环境，完成一次最小可用示例；\n第 2 周：理解核心概念，做一份自己的笔记；\n第 3 周：做一个小项目，把知识点串起来；\n第 4 周：复盘并整理成可展示的成果。\n\n每周留一个可验证的交付物，比单纯堆学时更有效。';
    }
    return '收到，我看到你输入的是：「' + q.slice(0, 80) + '」。\n\n这是 GitHub Pages 上的静态界面展示：页面布局、会话、流式输出和各个功能页都可以点开体验，但不会调用本地模型。真实推理需要下载完整项目，双击「启动 Spark Chat（内置模型版）.bat」，由本机显卡上的 Spark-X2.6-4B 完成。';
  }

  function chunks(s, n) {
    var chars = Array.from(s), out = [];
    for (var i = 0; i < chars.length; i += n) out.push(chars.slice(i, i + n).join(''));
    return out;
  }

  function getSession(id) { return DB.sessions.find(function (s) { return s.id === id; }); }
  function sessionList() {
    return DB.sessions.map(function (s) {
      return { id: s.id, title: s.title, created_at: s.created_at, updated_at: s.updated_at, message_count: s.messages.length };
    });
  }
  function newId() { return 'demo' + Math.random().toString(36).slice(2, 10); }

  /* ---------------- 请求路由 ---------------- */
  function handle(method, path, body, signal) {
    var M = method.toUpperCase();

    if (/(^|\/)health$/.test(path)) return json({ ok: true, status: 'ok', engine: 'demo' });
    if (/runtime-status\.json$/.test(path)) return json(DB.runtime);
    if (/\/api\/models$/.test(path)) return json(DB.models);

    if (/\/api\/config\/export$/.test(path)) return text(JSON.stringify(DB.config, null, 2), 'application/json; charset=utf-8');
    if (/\/api\/config\/import$/.test(path)) return ok();
    if (/\/api\/config\/test$/.test(path)) return json({ ok: true, message: '界面展示模式：模拟连接正常' });
    if (/\/api\/config$/.test(path)) {
      if (M === 'POST') { Object.assign(DB.config, body || {}); return ok(); }
      return json(DB.config);
    }

    if (/\/api\/conversations$/.test(path)) {
      if (M === 'POST') {
        var s = { id: newId(), title: '新对话', created_at: Date.now(), updated_at: Date.now(), messages: [] };
        DB.sessions.unshift(s);
        return json({ id: s.id, title: s.title });
      }
      return json(sessionList());
    }
    var cm = path.match(/\/api\/conversations\/([^/?]+)/);
    if (cm) {
      var sess = getSession(decodeURIComponent(cm[1]));
      if (!sess) return json({ error: '会话不存在' }, 404);
      if (M === 'DELETE') {
        DB.sessions = DB.sessions.filter(function (x) { return x.id !== sess.id; });
        return ok();
      }
      if (M === 'PATCH' || M === 'PUT') {
        if (body && body.title) sess.title = String(body.title).slice(0, 60);
        sess.updated_at = Date.now();
        return ok();
      }
      return json({ id: sess.id, title: sess.title, model: DB.config.model, messages: clone(sess.messages) });
    }

    if (/\/api\/chat\/stream$/.test(path)) {
      var msg = String((body && body.message) || '');
      var cur = (body && body.conversation_id) ? getSession(body.conversation_id) : null;
      if (!cur) {
        cur = { id: newId(), title: msg.slice(0, 24) || '新对话', created_at: Date.now(), updated_at: Date.now(), messages: [] };
        DB.sessions.unshift(cur);
      }
      cur.title = cur.title || msg.slice(0, 24) || '新对话';
      cur.messages.push({ role: 'user', content: msg });
      var answer = replyFor(msg) + NOTE;
      cur.messages.push({ role: 'assistant', content: answer });
      cur.updated_at = Date.now();
      var events = [{ type: 'meta', conversation_id: cur.id }]
        .concat(chunks(answer, 3).map(function (d) { return { type: 'delta', delta: d }; }))
        .concat([{ type: 'done', conversation_id: cur.id }]);
      return stream(events, signal);
    }

    if (/\/api\/kb\/search/.test(path)) {
      var q = decodeURIComponent((path.split('q=')[1] || '').split('&')[0] || '');
      return json({ hits: DB.docs.slice(0, 2).map(function (d, i) {
        return { name: d.name, doc_id: d.id, score: 0.92 - i * 0.17, chunk_index: i,
          snippet: '示例检索结果：与「' + q + '」相关的资料片段，展示知识库页面的结果显示样式。' };
      }) });
    }
    if (/\/api\/kb\/upload$/.test(path)) return json({ added: 1, ok: true });
    if (/\/api\/kb\/reindex$/.test(path)) return ok();
    if (/\/api\/kb\/status$/.test(path)) return json(DB.kbstat);
    if (/\/api\/kb\/[^/?]+$/.test(path)) return ok();
    if (/\/api\/kb$/.test(path)) return json(clone(DB.docs));

    if (/\/api\/tasks\/[^/]+\/run\/stream$/.test(path)) {
      return stream([
        { type: 'status', status: 'running', model: 'spark-x2.6-4b' },
        { type: 'plan', plan: [{ name: '理解目标' }, { name: '整理资料' }, { name: '生成报告' }] },
        { type: 'step', index: 0, name: '理解目标', status: 'done' },
        { type: 'step', index: 1, name: '整理资料', status: 'done' },
        { type: 'step', index: 2, name: '生成报告', status: 'done' },
        { type: 'report', text: '任务报告（界面演示示例）：这里展示智能任务页的实时步骤与最终报告样式，完整版由本机模型实际执行。' },
        { type: 'done' }
      ], signal);
    }
    if (/\/api\/tasks$/.test(path)) {
      if (M === 'POST') {
        var tid = newId();
        DB.tasks.unshift({ id: tid, title: (body && body.title) || '新任务', status: 'draft', progress: { done: 0, total: 3 }, updated_at: Date.now() });
        return json({ id: tid });
      }
      return json(clone(DB.tasks));
    }
    var tm = path.match(/\/api\/tasks\/([^/?]+)/);
    if (tm) {
      var t = DB.tasks.find(function (x) { return x.id === tm[1]; }) || DB.tasks[0];
      return json(clone(t));
    }

    if (/\/api\/tools$/.test(path)) {
      if (M === 'POST') return ok();
      return json({ tools: clone(DB.tools), deps: {} });
    }
    if (/\/api\/agents$/.test(path)) return json(clone(DB.agents));
    if (/\/api\/plugins$/.test(path)) return json(clone(DB.plugins));
    if (/\/api\/backup\/restore$/.test(path)) return ok();
    if (/\/api\/backup$/.test(path)) {
      if (M === 'POST') return json({ backup_id: 'backup-' + newId() });
      return json(clone(DB.backups));
    }
    if (/\/api\/backup\/[^/?]+$/.test(path)) return ok();
    if (/\/api\/logs\/export$/.test(path)) {
      return text(DB.logs.map(function (l) { return l.time + ' [' + l.level + '] ' + l.message; }).join('\n'));
    }
    if (/\/api\/logs/.test(path)) return json({ logs: clone(DB.logs) });
    if (/\/api\/cleanup$/.test(path)) {
      if (M === 'GET') return json({ space: DB.space });
      return ok();
    }

    return ok();
  }

  /* ---------------- 拦截 fetch ---------------- */
  window.fetch = function (input, init) {
    var opts = init || {};
    var raw = typeof input === 'string' ? input : (input && input.url) || '';
    var path = raw;
    try { path = new URL(raw, location.href).pathname + new URL(raw, location.href).search; }
    catch (e) { /* 保持原值 */ }
    var urlObj;
    try { urlObj = new URL(raw, location.href); } catch (e) { urlObj = null; }

    // 只接管应用自身接口；其它请求（若将来出现）交回浏览器
    if (!/^\/api\/|^\/health$|runtime-status\.json$/.test(path)) {
      if (nativeFetch) return nativeFetch(input, init);
      return Promise.resolve(json({}));
    }

    var method = opts.method || (input && input.method) || 'GET';
    var signal = opts.signal || (input && input.signal) || null;
    var body = null;
    var rawBody = opts.body;
    if (typeof rawBody === 'string') {
      try { body = JSON.parse(rawBody); } catch (e) { body = null; }
    }
    if (urlObj && urlObj.searchParams.get('q') && /\/api\/kb\/search/.test(path)) {
      // 检索词在 URL 上，handle 会解析
    }
    return Promise.resolve(handle(method, path, body, signal));
  };

  /* ---------------- 演示标识 ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var badge = document.createElement('div');
    badge.textContent = '界面展示 · 示例数据';
    badge.title = 'GitHub Pages 静态预览，不连接本地模型；点击可隐藏';
    badge.setAttribute('style', [
      'position:fixed', 'right:18px', 'bottom:16px', 'z-index:9999',
      'padding:6px 12px', 'border-radius:999px', 'font:12px/1.4 -apple-system,"Segoe UI","Microsoft YaHei",sans-serif',
      'color:#5a45cd', 'background:rgba(241,238,255,.94)', 'border:1px solid rgba(109,90,224,.28)',
      'box-shadow:0 4px 14px rgba(43,38,80,.14)', 'cursor:pointer', 'user-select:none'
    ].join(';'));
    badge.onclick = function () { badge.remove(); };
    document.body.appendChild(badge);
  });
})();
