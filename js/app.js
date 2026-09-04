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

function renderLanding(app) {
  const div = document.createElement('div');
  div.className = 'landing-card';
  div.innerHTML = `
    <h2>Welcome!</h2>
    <p>Enter your name and class period to get started. Use the exact same name and period every time so your progress is saved and can be found again.</p>
    <form id="identify-form">
      <label>Full Name
        <input type="text" id="input-name" required autocomplete="name">
      </label>
      <label>Class Period
        <input type="text" id="input-period" required placeholder="e.g. Period 3">
      </label>
      <button type="submit" class="button">Continue</button>
    </form>
    <p id="identify-status" class="muted"></p>
  `;
  app.appendChild(div);

  $('#identify-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#input-name').value.trim();
    const period = $('#input-period').value.trim();
    if (!name || !period) return;
    $('#identify-status').textContent = 'Loading...';
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
