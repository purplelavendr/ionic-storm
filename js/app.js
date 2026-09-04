// View router: landing (identify) -> dashboard (unit/activity list) -> activity.
const State = { view: 'landing', activeActivity: null };

function $(sel, root = document) { return root.querySelector(sel); }

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getActivityMeta(activityId) {
  for (const unit of CONTENT.units) {
    const found = unit.activities.find(a => a.id === activityId);
    if (found) return { activity: found, unit };
  }
  return null;
}

function statusOf(activityId) {
  const p = Storage.getProgress(activityId);
  return p ? p.status : 'not_started';
}

function statusLabel(status) {
  return { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }[status] || 'Not Started';
}

async function init() {
  document.title = CONFIG.siteTitle;
  $('#site-title').textContent = CONFIG.siteTitle;
  $('#site-subtitle').textContent = CONFIG.siteSubtitle;

  await Storage.flushQueue();
  const student = Storage.getStudent();
  if (student) {
    State.view = 'dashboard';
    render();
    await Storage.refreshFromServer(student);
    if (State.view === 'dashboard') render();
  } else {
    render();
  }
}

function render() {
  const app = $('#app');
  app.innerHTML = '';
  if (State.view === 'landing') renderLanding(app);
  else if (State.view === 'dashboard') renderDashboard(app);
  else if (State.view === 'activity') renderActivityView(app);
}

async function renderLanding(app) {
  const div = document.createElement('div');
  div.className = 'landing-card';
  div.innerHTML = `
    <h2>Welcome!</h2>
    <p>Pick your class period, then find your name in the list.</p>
    <div id="landing-body"><p class="muted">Loading class list...</p></div>
  `;
  app.appendChild(div);

  const body = $('#landing-body', div);
  const periodsRes = await Storage.getPeriods();
  if (State.view !== 'landing') return; // student navigated away while loading
  if (!periodsRes.ok || !periodsRes.periods || !periodsRes.periods.length) {
    body.innerHTML = `<p class="feedback incorrect">Couldn't load the class list. Check your connection and reload the page, or ask your teacher to check the site setup.</p>`;
    return;
  }

  const periods = periodsRes.periods;
  body.innerHTML = `
    <form id="identify-form">
      <label>Class Period
        <select id="input-period" required>
          <option value="" disabled selected>Choose your period...</option>
          ${periods.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('')}
        </select>
      </label>
      <label>Your Name
        <select id="input-name" required disabled>
          <option value="" disabled selected>Choose a period first...</option>
        </select>
      </label>
      <label class="fallback-toggle">
        <input type="checkbox" id="use-manual-name"> My name isn't listed
      </label>
      <input type="text" id="input-name-manual" placeholder="Type your full name" style="display:none;">
      <button type="submit" class="button">Continue</button>
    </form>
    <p id="identify-status" class="muted"></p>
  `;

  const periodSelect = $('#input-period', body);
  const nameSelect = $('#input-name', body);
  const manualCheckbox = $('#use-manual-name', body);
  const manualInput = $('#input-name-manual', body);

  periodSelect.addEventListener('change', async () => {
    nameSelect.disabled = true;
    nameSelect.innerHTML = `<option value="" disabled selected>Loading names...</option>`;
    const res = await Storage.getRoster(periodSelect.value);
    const names = (res.ok && res.names) ? res.names.slice().sort() : [];
    nameSelect.innerHTML = `
      <option value="" disabled selected>Choose your name...</option>
      ${names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
    `;
    nameSelect.disabled = false;
  });

  manualCheckbox.addEventListener('change', () => {
    const manual = manualCheckbox.checked;
    nameSelect.style.display = manual ? 'none' : '';
    nameSelect.required = !manual;
    manualInput.style.display = manual ? '' : 'none';
    manualInput.required = manual;
  });

  $('#identify-form', body).addEventListener('submit', async (e) => {
    e.preventDefault();
    const period = periodSelect.value;
    const name = manualCheckbox.checked ? manualInput.value.trim() : nameSelect.value;
    if (!name || !period) return;
    $('#identify-status', body).textContent = 'Loading...';
    await Storage.identify(name, period);
    State.view = 'dashboard';
    render();
  });
}

function renderDashboard(app) {
  const student = Storage.getStudent();

  const header = document.createElement('div');
  header.className = 'dashboard-header';
  header.innerHTML = `
    <div>
      <h2>Hi, ${escapeHtml(student.name)}!</h2>
      <p class="muted">${escapeHtml(student.period)}</p>
    </div>
    <button id="switch-student" class="link-button" type="button">Not you? Switch student</button>
  `;
  app.appendChild(header);

  CONTENT.units.forEach(unit => {
    const section = document.createElement('section');
    section.className = 'unit-card';

    const activitiesHtml = unit.activities.map(act => {
      const status = statusOf(act.id);
      const progress = Storage.getProgress(act.id);
      const scoreText = (status === 'completed' && progress && progress.totalQuestions)
        ? ` — ${progress.score}/${progress.totalQuestions}`
        : '';
      return `
        <li class="activity-row" data-activity-id="${act.id}">
          <div class="activity-info">
            <span class="activity-title">${escapeHtml(act.title)}</span>
            <span class="activity-meta">${escapeHtml(act.description || '')} · ~${act.estimatedMinutes} min</span>
          </div>
          <span class="status-badge status-${status}">${statusLabel(status)}${scoreText}</span>
        </li>
      `;
    }).join('');

    section.innerHTML = `
      <h3>${escapeHtml(unit.title)}</h3>
      <p class="muted">${escapeHtml(unit.description || '')}</p>
      <ul class="activity-list">${activitiesHtml}</ul>
    `;
    app.appendChild(section);
  });

  $('#switch-student').addEventListener('click', () => {
    if (confirm('Switch to a different student on this device? Your progress is saved under your name and will still be here if you come back.')) {
      Storage.clearStudent();
      State.view = 'landing';
      render();
    }
  });

  app.querySelectorAll('.activity-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-activity-id');
      const meta = getActivityMeta(id);
      if (!meta) return;
      State.activeActivity = meta;
      State.view = 'activity';
      render();
    });
  });
}

function renderActivityView(app) {
  const { activity, unit } = State.activeActivity;
  const student = Storage.getStudent();

  const wrap = document.createElement('div');
  wrap.className = 'activity-view';

  const back = document.createElement('button');
  back.className = 'link-button';
  back.type = 'button';
  back.textContent = '← Back to Dashboard';
  back.addEventListener('click', () => { State.view = 'dashboard'; render(); });
  wrap.appendChild(back);

  const contentHost = document.createElement('div');
  contentHost.className = 'activity-content';
  wrap.appendChild(contentHost);
  app.appendChild(wrap);

  const ctx = {
    activity, unit, student,
    getProgress: () => Storage.getProgress(activity.id),
    saveProgress: (record) => Storage.saveProgress(student, activity, unit.id, record)
  };

  if (activity.type === 'review' && window.Activities && window.Activities[activity.id]) {
    window.Activities[activity.id].render(contentHost, ctx);
  } else if (activity.type === 'link') {
    renderLinkActivity(contentHost, ctx);
  } else {
    contentHost.innerHTML = '<p>This activity type is not yet supported.</p>';
  }
}

function renderLinkActivity(host, ctx) {
  const { activity } = ctx;
  const progress = ctx.getProgress();
  const completed = !!(progress && progress.status === 'completed');
  host.innerHTML = `
    <h2>${escapeHtml(activity.title)}</h2>
    <p>${escapeHtml(activity.description || '')}</p>
    <p><a href="${activity.url}" target="_blank" rel="noopener" class="button">Open Simulation ↗</a></p>
    <label class="complete-check">
      <input type="checkbox" id="mark-complete" ${completed ? 'checked' : ''}>
      I finished this simulation
    </label>
  `;
  host.querySelector('#mark-complete').addEventListener('change', async (e) => {
    const record = {
      status: e.target.checked ? 'completed' : 'in_progress',
      score: null,
      totalQuestions: null,
      answers: []
    };
    await ctx.saveProgress(record);
  });
}

document.addEventListener('DOMContentLoaded', init);
