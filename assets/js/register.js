(function () {
  const STEPS = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'Personal' },
    { n: 3, label: 'Startup' },
    { n: 4, label: 'Team' },
    { n: 5, label: 'Product' },
    { n: 6, label: 'Business' },
    { n: 7, label: 'Documents' },
    { n: 8, label: 'Review' },
  ];
  let current = 1;
  const DIAL_CIRCUMFERENCE = 113; // 2*pi*18, matches header dial radius

  const stepperEl = document.getElementById('stepper');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const dial = document.getElementById('header-dial');
  const dialPct = document.getElementById('header-dial-pct');

  /* ---------- Stepper render ---------- */
  function renderStepper() {
    stepperEl.innerHTML = STEPS.map((s, i) => {
      const state = s.n < current ? 'is-complete' : s.n === current ? 'is-active' : '';
      const dotContent = s.n < current
        ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>'
        : s.n;
      const line = i < STEPS.length - 1 ? `<div class="step-line ${s.n < current ? 'is-complete' : ''}"></div>` : '';
      return `
        <li class="step ${state} flex items-center">
          <button type="button" data-goto="${s.n}" class="flex flex-col items-center gap-1.5 px-1">
            <span class="step-dot">${dotContent}</span>
            <span class="step-label whitespace-nowrap">${s.label}</span>
          </button>
          ${line}
        </li>`;
    }).join('');
  }

  function updateDial() {
    const pct = Math.round((current / STEPS.length) * 100);
    const offset = DIAL_CIRCUMFERENCE - (DIAL_CIRCUMFERENCE * pct) / 100;
    dial.style.strokeDashoffset = offset;
    dialPct.textContent = pct + '%';
  }

  function goTo(step) {
    current = Math.max(1, Math.min(STEPS.length, step));
    document.querySelectorAll('.wizard-step').forEach(sec => {
      sec.classList.toggle('hidden', Number(sec.dataset.step) !== current);
    });
    renderStepper();
    updateDial();
    prevBtn.disabled = current === 1;
    nextBtn.classList.toggle('hidden', current === STEPS.length);
    submitBtn.classList.toggle('hidden', current !== STEPS.length);
    if (current === STEPS.length) buildReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  stepperEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-goto]');
    if (!btn) return;
    const target = Number(btn.dataset.goto);
    goTo(target); // Allow jumping to any step directly during development
  });

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ---------- Validation ---------- */
  function setError(field, message) {
    field.classList.add('is-error');
    field.classList.remove('is-success');
    if (message) {
      const msg = field.querySelector('.error-msg');
      if (msg) msg.textContent = message;
    }
  }
  function setSuccess(field) {
    field.classList.remove('is-error');
    field.classList.add('is-success');
  }

  function validateStep(stepNum) {
    return true; // Bypass all validations during development
  }

  /* ---------- Dynamic team members (Step 4) ---------- */
  const teamContainer = document.getElementById('team-members');
  let teamCount = 0;

  function addTeamMember() {
    teamCount++;
    const id = teamCount;
    const row = document.createElement('div');
    row.className = 'card p-4 relative';
    row.dataset.member = id;
    row.innerHTML = `
      <button type="button" class="remove-member absolute top-3 right-3 text-axslate hover:text-red-600" aria-label="Remove team member">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
      <p class="text-xs font-semibold text-axslate mb-3">Co-founder ${id}</p>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="field"><input type="text" placeholder=" " id="member-${id}-name"><label for="member-${id}-name">Name</label></div>
        <div class="field"><input type="text" placeholder=" " id="member-${id}-designation"><label for="member-${id}-designation">Designation</label></div>
        <div class="field"><input type="email" placeholder=" " id="member-${id}-email"><label for="member-${id}-email">Email</label></div>
        <div class="field"><input type="tel" placeholder=" " id="member-${id}-phone"><label for="member-${id}-phone">Phone number</label></div>
      </div>`;
    teamContainer.appendChild(row);
  }
  document.getElementById('add-team-member').addEventListener('click', addTeamMember);
  teamContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-member');
    if (btn) btn.closest('[data-member]').remove();
  });
  addTeamMember(); // start with one co-founder row

  /* ---------- Business model pills ---------- */
  document.querySelectorAll('input[name="bizModel"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="bizModel"]').forEach(r => {
        r.closest('label').classList.toggle('badge-blue', r.checked);
        r.closest('label').classList.toggle('badge-neutral', !r.checked);
      });
    });
  });

  /* ---------- Generic dropzone + file preview ---------- */
  function wireDropzone(zoneEl, listEl, multiple) {
    const input = zoneEl.querySelector('input[type="file"]');
    ['dragover', 'dragenter'].forEach(evt => zoneEl.addEventListener(evt, e => { e.preventDefault(); zoneEl.classList.add('is-dragover'); }));
    ['dragleave', 'drop'].forEach(evt => zoneEl.addEventListener(evt, e => { e.preventDefault(); zoneEl.classList.remove('is-dragover'); }));
    zoneEl.addEventListener('drop', e => {
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', () => handleFiles(input.files));

    function handleFiles(files) {
      if (!multiple) listEl.innerHTML = '';
      Array.from(files).forEach(file => addFileRow(file, listEl));
    }
  }

  function addFileRow(file, listEl) {
    const row = document.createElement('div');
    row.className = 'file-row';
    const sizeKb = (file.size / 1024).toFixed(0);
    row.innerHTML = `
      <svg class="w-5 h-5 text-axblue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m0 0H6.75A2.25 2.25 0 0 0 4.5 4.5v15A2.25 2.25 0 0 0 6.75 21.75h9a2.25 2.25 0 0 0 2.25-2.25v-9.75m-6-7.5-1.5 1.5"/></svg>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">${file.name}</p>
        <div class="bar-track mt-1.5"><div class="bar-fill" style="width:0%"></div></div>
        <p class="text-xs text-axslate mt-1 progress-label">${sizeKb} KB · uploading…</p>
      </div>
      <button type="button" class="remove-file text-axslate hover:text-red-600 shrink-0" aria-label="Remove file">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>`;
    listEl.appendChild(row);
    row.querySelector('.remove-file').addEventListener('click', () => row.remove());

    const fill = row.querySelector('.bar-fill');
    const label = row.querySelector('.progress-label');
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 30 + 15;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        label.textContent = `${sizeKb} KB · uploaded`;
      }
      fill.style.width = pct + '%';
    }, 220);
  }

  // Step 3 logo dropzone
  (function () {
    const zone = document.getElementById('logo-dropzone');
    const list = document.createElement('div');
    list.className = 'space-y-2 mt-3';
    zone.parentElement.appendChild(list);
    wireDropzone(zone, list, false);
  })();

  // Step 5 product images + video dropzones
  Array.from(document.querySelectorAll('.wizard-step[data-step="5"] .dropzone')).forEach((zone, idx) => {
    const list = document.createElement('div');
    list.className = 'space-y-2 mt-3';
    zone.parentElement.appendChild(list);
    wireDropzone(zone, list, idx === 0); // images = multiple, video = single
  });

  /* ---------- Step 7: document upload cards ---------- */
  const DOCS = [
    { key: 'pitchDeck', label: 'Pitch deck', hint: 'PDF, up to 25MB' },
    { key: 'businessPlan', label: 'Business plan', hint: 'PDF or DOCX, up to 25MB' },
    { key: 'regCertificate', label: 'Company registration certificate', hint: 'PDF, up to 10MB' },
    { key: 'financialDocs', fill: 'Financial documents', hint: 'PDF or XLSX, up to 25MB' },
    { key: 'productBrochure', label: 'Product brochure', hint: 'PDF, up to 15MB' },
  ];
  const docContainer = document.getElementById('doc-uploads');
  DOCS.forEach(doc => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <p class="text-sm font-semibold mb-2">${doc.label || doc.fill}</p>
      <label class="dropzone flex items-center gap-3 p-4 cursor-pointer" data-doc="${doc.key}">
        <svg class="w-6 h-6 text-axblue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3.75 3.75 0 0 1 4.133 6.08A4.5 4.5 0 0 1 17.25 19.5H6.75Z"/></svg>
        <span class="text-sm text-axslate">Drag &amp; drop, or <span class="link">browse</span> · ${doc.hint}</span>
        <input type="file" class="hidden">
      </label>
      <div class="doc-file-list space-y-2 mt-3"></div>`;
    docContainer.appendChild(wrap);
    const zone = wrap.querySelector('.dropzone');
    const list = wrap.querySelector('.doc-file-list');
    wireDropzone(zone, list, false);
  });

  /* ---------- Review (Step 8) ---------- */
  function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }
  function displayOrDash(v) { return v && v.trim() ? v : '<span class="text-axslate-light">—</span>'; }

  function reviewCard(title, stepNum, rows) {
    return `
      <div class="card p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm">${title}</h3>
          <button type="button" data-goto="${stepNum}" class="text-xs font-semibold link">Edit</button>
        </div>
        <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          ${rows.map(([k, v]) => `<div><dt class="text-axslate text-xs">${k}</dt><dd class="font-medium">${displayOrDash(v)}</dd></div>`).join('')}
        </dl>
      </div>`;
  }

  function buildReview() {
    const memberRows = Array.from(document.querySelectorAll('#team-members [data-member]')).map(m => {
      const id = m.dataset.member;
      return `${val(`member-${id}-name`) || 'Unnamed'} — ${val(`member-${id}-designation`) || 'Co-founder'}`;
    }).join('<br>') || '—';

    const bizModel = document.querySelector('input[name="bizModel"]:checked');

    const html = [
      reviewCard('Account', 1, [
        ['Full name', val('fullName')], ['Email', val('accEmail')], ['Mobile', val('mobile')],
      ]),
      reviewCard('Personal', 2, [
        ['Date of birth', val('dob')], ['Gender', val('gender')], ['Country', val('country')],
        ['State', val('state')], ['City', val('city')], ['Occupation', val('occupation')],
      ]),
      reviewCard('Startup', 3, [
        ['Name', val('startupName')], ['Stage', val('startupStage')], ['Industry', val('industry')],
        ['Tagline', val('startupTagline')], ['Business model', bizModel ? bizModel.value : ''],
      ]),
      reviewCard('Team', 4, [
        ['Founder', val('founderName')], ['Team size', val('teamSize')], ['Co-founders', memberRows],
      ]),
      reviewCard('Product', 5, [
        ['Product name', val('productName')], ['Category', val('productCategory')], ['MVP status', val('mvpStatus')],
        ['Demo URL', val('demoUrl')],
      ]),
      reviewCard('Business', 6, [
        ['Legal structure', val('legalStructure')], ['Registration status', val('regStatus')],
        ['Funding status', val('fundingStatus')], ['Employees', val('numEmployees')],
      ]),
      reviewCard('Documents', 7, [
        ['Uploaded files', document.querySelectorAll('#doc-uploads .file-row').length + ' file(s) attached'],
      ]),
    ].join('');
    document.getElementById('review-cards').innerHTML = html;
  }

  /* ---------- Save draft / resume later ---------- */
  function saveDraft(showToast = true) {
    if (showToast) toast({ title: 'Draft saved', message: `Progress kept at Step ${current} · ${STEPS[current - 1].label}.`, type: 'success' });
  }
  document.getElementById('save-draft-top').addEventListener('click', () => saveDraft());
  document.getElementById('save-draft-bottom').addEventListener('click', () => saveDraft());
  document.getElementById('resume-later').addEventListener('click', () => {
    saveDraft(false);
    toast({ title: 'Resume link sent', message: 'We emailed you a link to pick up where you left off.', type: 'info' });
  });

  /* ---------- Submit ---------- */
  submitBtn.addEventListener('click', () => {
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    setTimeout(() => {
      window.location.href = 'success.html';
    }, 1400);
  });

  /* ---------- Init ---------- */
  renderStepper();
  updateDial();
})();
