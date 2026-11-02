(() => {
  'use strict';
  const qs = (s, parent = document) => parent.querySelector(s);
  const qsa = (s, parent = document) => [...parent.querySelectorAll(s)];
  const progress = qs('.reading-progress');
  const sections = qsa('section[id]');
  const tocLinks = qsa('.toc a');
  let scheduled = false;
  function updateReading() {
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, scrollY / total * 100)) : 0}%`;
    let current = sections[0]?.id;
    for (const section of sections) if (section.getBoundingClientRect().top < 190) current = section.id;
    for (const link of tocLinks) {
      const active = link.hash === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { requestAnimationFrame(updateReading); scheduled = true; } }, {passive:true});
  addEventListener('resize', updateReading);
  updateReading();

  const demo = qs('.case');
  qsa('[data-case]').forEach(button => button.addEventListener('click', () => {
    const good = button.dataset.case === 'complete';
    demo.classList.toggle('good', good);
    qsa('[data-case]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    qs('#case-code').textContent = good ? '(540 + 210) / (25 + 40 + 540 + 210)\n× 100' : '(540 + 210) / 540\n× 100';
    qs('#case-value').textContent = good ? '92.02%' : '138.89%';
    qs('#case-verdict').textContent = good ? '分母正确' : '超过了 100%';
    qs('#case-explanation').textContent = good ? '先把总收入算清楚：25 + 40 + 540 + 210 = 815。Code 得到了正确答案。' : 'Code 正确执行了计算。但 540 只是 4G 收入，模型在调用前就选错了分母。';
  }));

  const resultData = {
    overall:{label:'总体',values:[66.24,66.67,67.92,69.75],gain:3.51},
    vstar:{label:'V*Bench',values:[84.29,81.68,84.82,86.91],gain:2.62},
    chartqa:{label:'ChartQA',values:[85.48,82.20,85.36,87.72],gain:2.24},
    mathvista:{label:'MathVista',values:[65.10,66.90,67.70,68.90],gain:3.80},
    wemath:{label:'WeMath',values:[57.30,60.34,58.79,60.57],gain:3.27},
    charxiv:{label:'CharXiv',values:[31.40,35.80,37.20,38.40],gain:7.00}
  };
  qsa('[data-dataset]').forEach(button => button.addEventListener('click', () => {
    const data = resultData[button.dataset.dataset];
    qsa('[data-dataset]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    qsa('[data-result-row]').forEach((row,i) => {
      qs('.bar-fill',row).style.width = `${data.values[i]}%`;
      qs('.bar-value',row).textContent = `${data.values[i].toFixed(2)}%`;
    });
    qs('#result-gain-value').textContent = `+${data.gain.toFixed(2)}`;
    qs('#result-context').textContent = `${data.label} · LF25 相比原始 High`;
    qs('#result-announcement').textContent = `${data.label}正确率：原始 High ${data.values[0]}%，随机筛选 ${data.values[1]}%，LF50 ${data.values[2]}%，LF25 ${data.values[3]}%。LF25 提高 ${data.gain.toFixed(2)} 个百分点。`;
  }));

  const dialog = qs('#figure-dialog');
  let lastTrigger;
  qsa('.zoom-button').forEach(button => button.addEventListener('click', () => {
    lastTrigger = button;
    const img = qs('img', button);
    qs('#dialog-image').src = img.src;
    qs('#dialog-image').alt = img.alt;
    qs('#dialog-original').href = img.src;
    qs('#dialog-title').textContent = button.dataset.title || '论文原图';
    const caption = qs('figcaption',button.closest('figure'));
    qs('#dialog-caption').textContent = caption?.textContent.trim() || img.alt;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  qs('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close', () => {document.body.classList.remove('dialog-open');lastTrigger?.focus({preventScroll:true});});

  const citation = 'Hu, Kaiwen; Lee, Hyunin; Suh, Joseph; Chang, Serina; Shao, Shuai; Zhang, Yong; Park, Namyong; Luo, Xiaoqiang; Simon, Luke; Sojoudi, Somayeh. Think Twice Before Calling Tools: How Pre-Call Reasoning in SFT Shapes Tool-Use Retention under RL. Manuscript.';
  qs('#copy-citation').addEventListener('click', async () => {
    try {await navigator.clipboard.writeText(citation); qs('#cite-feedback').textContent = '引用信息已复制。';}
    catch {qs('#citation-fallback').hidden=false;qs('#citation-fallback').textContent=citation;qs('#cite-feedback').textContent='可在下方选中并复制引用信息。';}
  });
})();
