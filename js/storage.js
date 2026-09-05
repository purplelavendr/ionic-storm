// Local cache + sync client for student identity and progress.
//
// Every write updates localStorage immediately (so the UI never waits on the
// network) and is best-effort POSTed to the Google Apps Script backend. A
// failed POST is queued and retried on the next page load or interaction.

// Mirrors the backend's normalizeKey() -- used only for the offline fallback below.
function normalizeKeyLocal(name, period) {
  return (name.trim().toLowerCase() + '|' + period.trim().toLowerCase()).replace(/\s+/g, ' ');
}

const StorageKeys = {
  STUDENT: 'ionicstorm_student_v1',
  PROGRESS: 'ionicstorm_progress_v1',
  QUEUE: 'ionicstorm_queue_v1'
};

const Storage = {
  getStudent() {
    return JSON.parse(localStorage.getItem(StorageKeys.STUDENT) || 'null');
  },
  setStudent(student) {
    localStorage.setItem(StorageKeys.STUDENT, JSON.stringify(student));
  },
  clearStudent() {
    localStorage.removeItem(StorageKeys.STUDENT);
  },

  getAllProgress() {
    return JSON.parse(localStorage.getItem(StorageKeys.PROGRESS) || '{}');
  },
  getProgress(activityId) {
    return this.getAllProgress()[activityId] || null;
  },
  setProgressLocal(activityId, record) {
    const all = this.getAllProgress();
    all[activityId] = record;
    localStorage.setItem(StorageKeys.PROGRESS, JSON.stringify(all));
  },

  // Merge rows from the server into the local cache, keeping whichever
  // side (local vs server) was updated most recently for each activity.
  mergeServerProgress(rows) {
    const all = this.getAllProgress();
    (rows || []).forEach(r => {
      const existing = all[r.activityId];
      const serverTime = new Date(r.lastUpdated || 0).getTime();
      const localTime = existing ? new Date(existing.lastUpdated || 0).getTime() : -1;
      if (!existing || serverTime >= localTime) {
        all[r.activityId] = {
          status: r.status,
          score: r.score,
          totalQuestions: r.totalQuestions,
          answers: r.answers || [],
          lastUpdated: r.lastUpdated
        };
      }
    });
    localStorage.setItem(StorageKeys.PROGRESS, JSON.stringify(all));
  },

  getQueue() {
    return JSON.parse(localStorage.getItem(StorageKeys.QUEUE) || '[]');
  },
  setQueue(queue) {
    localStorage.setItem(StorageKeys.QUEUE, JSON.stringify(queue));
  },
  enqueue(op) {
    const queue = this.getQueue();
    queue.push(op);
    this.setQueue(queue);
  },

  // networkError marks a request that never reached the server (offline, DNS,
  // etc.) as opposed to a response the server deliberately sent back with
  // ok:false (e.g. a wrong student ID) -- callers need to tell those apart.
  async apiPost(action, payload) {
    if (!CONFIG.appsScriptUrl) {
      return { ok: false, error: 'not configured', networkError: true };
    }
    try {
      const res = await fetch(CONFIG.appsScriptUrl, {
        method: 'POST',
        // text/plain avoids a CORS preflight, which Apps Script web apps don't handle.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action }, payload))
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: String(err), networkError: true };
    }
  },

  // Returns { ok, student } on success, or { ok: false, error } on a genuine
  // rejection (wrong student ID, missing fields) that should NOT sign the
  // student in. A network failure still signs them in locally (offline
  // fallback) since there's no way to verify anything without the server.
  async identify(name, period, studentId) {
    const res = await this.apiPost('identify', { name, period, studentId });
    if (res.ok) {
      const student = { name, period, studentKey: res.studentKey };
      this.mergeServerProgress(res.progress || []);
      this.setStudent(student);
      return { ok: true, student };
    }
    if (res.networkError) {
      const student = { name, period, studentKey: normalizeKeyLocal(name, period) };
      this.setStudent(student);
      return { ok: true, student, offline: true };
    }
    return { ok: false, error: res.error || 'identify_failed' };
  },

  async saveProgress(student, activity, unitId, record) {
    record.lastUpdated = new Date().toISOString();
    this.setProgressLocal(activity.id, record);

    const payload = {
      studentKey: student.studentKey,
      name: student.name,
      period: student.period,
      unitId,
      activityId: activity.id,
      activityTitle: activity.title,
      status: record.status,
      score: record.score,
      totalQuestions: record.totalQuestions,
      answers: record.answers
    };
    const res = await this.apiPost('saveProgress', payload);
    if (!res.ok) {
      this.enqueue({ action: 'saveProgress', payload });
    }
  },

  async flushQueue() {
    const queue = this.getQueue();
    if (!queue.length) return;
    const remaining = [];
    for (const op of queue) {
      const res = await this.apiPost(op.action, op.payload);
      if (!res.ok) remaining.push(op);
    }
    this.setQueue(remaining);
  },

  async refreshFromServer(student) {
    if (!student || !student.studentKey) return;
    const res = await this.apiPost('getProgress', { studentKey: student.studentKey, period: student.period });
    if (res.ok) this.mergeServerProgress(res.progress || []);
  },

  async getPeriods() {
    return this.apiPost('getPeriods', {});
  },

  async getRoster(period) {
    return this.apiPost('getRoster', { period });
  }
};
