// ============================================
// TEACHER DASHBOARD
// Task Assignment + Progress Tracking
// ============================================
import { AppState, navigate } from '../app.js';
import { buildShell } from '../utils/shell.js';
import { showToast } from '../utils/toast.js';
import { READING_TYPES, getLearningStatsForStudent } from '../mockData.js';

export function renderTeacherDashboard(container, activeTab = 'teacher') {
  // นำ NAV มาสร้างไว้ข้างในนี้แทน
  const NAV = [
      { section: 'ชั้นเรียน' },
      { id: 'teacher', icon: '🏠', label: 'ภาพรวม' },
      { id: 'tasks', icon: '📋', label: 'จัดการงาน', badge: AppState.tasks.length },
      { id: 'shared', icon: '🤝', label: 'ข้อมูลที่แบ่งปัน' },
      { section: 'นักเรียน' },
      { id: 'my-class', icon: '👥', label: 'ชั้นเรียนของฉัน' },
      { id: 'reports', icon: '📊', label: 'รายงาน' },
      { section: 'เครื่องมือ' },
      { id: 'library', icon: '📚', label: 'คลังสื่อการเรียนรู้' },
  ];

    const user = AppState.currentUser;
    const tasks = AppState.tasks;
    const students = AppState.students;
    const getStats = (studentId) => AppState.learningStats.find(item => item.studentId === studentId) ?? getLearningStatsForStudent(studentId);
    const getTodayLessons = (studentId) => {
        const stats = getStats(studentId);
        return stats.records[stats.records.length - 1]?.lessons ?? 0;
    };
    const todayLessonTotal = students.reduce((sum, student) => sum + getTodayLessons(student.id), 0);
    const weeklyLessonTotal = students.reduce((sum, student) => {
        const stats = getStats(student.id);
        return sum + stats.records.slice(-7).reduce((total, record) => total + record.lessons, 0);
    }, 0);

    const completedTasks = tasks.filter(t =>
        Object.values(t.status).every(s => s === 'completed')
    ).length;
    const pendingTotal = tasks.reduce((acc, t) =>
        acc + Object.values(t.status).filter(s => s === 'pending').length, 0
    );

    let pageTitle = 'แดชบอร์ดครู';
    let pageSubtitle = 'จัดการงานและติดตามพัฒนาการของนักเรียน';
    let bodyHTML = '';

    if (activeTab === 'teacher') {
        bodyHTML = `
      <!-- WELCOME BANNER -->
      <div class="welcome-banner anim-slide-up">
        <div class="welcome-text">
          <h2>สวัสดี ${user.name.split(' ').pop()}! 👩‍🏫</h2>
          <p>มีงานที่ยังไม่เสร็จ <strong>${pendingTotal} รายการ</strong> ในชั้นเรียน คุณสามารถมอบหมายสื่อใหม่หรือตรวจสอบพัฒนาการของนักเรียนได้ด้านล่าง</p>
          <div style="margin-top:var(--space-5);display:flex;gap:var(--space-3);">
            <button class="btn btn-primary" id="newTaskBtn">➕ มอบหมายงาน</button>
            <button class="btn btn-ghost" style="border-color:rgba(255,255,255,0.3);color:#fff;" id="viewSharedBtn">🤝 ข้อมูลที่แบ่งปัน</button>
          </div>
        </div>
        <div class="welcome-emoji">📋</div>
      </div>

      <!-- STATS -->
      <div class="grid grid-4" style="margin-bottom:var(--space-8);">
        <div class="stat-card anim-slide-up" style="animation-delay:0.1s">
          <div class="stat-icon" style="background:#D1FAE5;">👥</div>
          <div class="stat-value">${students.length}</div>
          <div class="stat-label">นักเรียนทั้งหมด</div>
          <div class="stat-trend trend-up">↑ เพิ่มใหม่ 2 คนในภาคเรียนนี้</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.15s">
          <div class="stat-icon" style="background:#FFF0E6;">📋</div>
          <div class="stat-value">${tasks.length}</div>
          <div class="stat-label">งานที่กำลังดำเนินการ</div>
          <div class="stat-trend">สัปดาห์นี้</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.2s">
          <div class="stat-icon" style="background:#DBEAFE;">✅</div>
          <div class="stat-value">${completedTasks}</div>
          <div class="stat-label">เสร็จสมบูรณ์แล้ว</div>
          <div class="stat-trend trend-up">↑ พัฒนาการดีมาก!</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.25s">
          <div class="stat-icon" style="background:#EDE9FE;">📚</div>
          <div class="stat-value">${todayLessonTotal}</div>
          <div class="stat-label">บทเรียนที่เรียนวันนี้</div>
          <div class="stat-trend trend-up">รวมสัปดาห์นี้ ${weeklyLessonTotal} บท</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.3s">
          <div class="stat-icon" style="background:#FEE2E2;">⚠️</div>
          <div class="stat-value">${students.filter(s => s.riskLevel === 'high').length}</div>
          <div class="stat-label">นักเรียนที่ควรดูแลเป็นพิเศษ</div>
          <div class="stat-trend trend-down">ควรให้ความสนใจ</div>
        </div>
      </div>

      <!-- CLASS PERFORMANCE CHART -->
      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:var(--space-6);margin-bottom:var(--space-8);">
        <div class="card anim-slide-up" style="animation-delay:0.35s">
          <div class="card-header">
            <span style="font-weight:700;color:var(--navy-900);">📊 ภาพรวมผลการเรียนของชั้นเรียน</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="classPerformanceChart"></canvas>
          </div>
        </div>

        <div class="card anim-slide-up" style="animation-delay:0.4s">
          <div class="card-header">
            <span style="font-weight:700;color:var(--navy-900);">👥 ภาพรวมนักเรียน</span>
          </div>
          <div style="padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);">
            ${students.map(s => `
              <div style="display:flex;align-items:center;gap:var(--space-3);">
                <div class="avatar avatar-sm" style="background:var(--navy-100);font-size:16px;">${s.avatar}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:var(--text-xs);font-weight:700;color:var(--navy-900);">${s.name}</div>
                  <div class="progress-track" style="height:6px;margin-top:4px;">
                    <div class="progress-fill" style="width:${s.progress}%;background:${s.riskLevel === 'high' ? 'var(--danger)' : s.riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)'};"></div>
                  </div>
                  <div style="font-size:10px;color:var(--slate-500);margin-top:3px;">วันนี้เรียน ${getTodayLessons(s.id)} บท</div>
                </div>
                <div style="font-size:var(--text-xs);font-weight:700;color:var(--navy-800);white-space:nowrap;">${s.progress}%</div>
                <span class="badge ${s.riskLevel === 'high' ? 'badge-danger' : s.riskLevel === 'medium' ? 'badge-warning' : 'badge-success'}">${s.riskLevel === 'high' ? 'สูง' : s.riskLevel === 'medium' ? 'ปานกลาง' : 'ต่ำ'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    } else if (activeTab === 'tasks') {
        pageTitle = 'จัดการงาน';
        pageSubtitle = 'สร้าง มอบหมาย และติดตามกิจกรรมการเรียนรู้';
        bodyHTML = `
      <!-- TASK TABLE -->
      <div class="card anim-slide-up" style="animation-delay:0.1s;margin-bottom:var(--space-8);">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <span class="section-title-dot"></span>
            <span style="font-size:var(--text-base);font-weight:700;color:var(--navy-900);">📚 กระดานมอบหมายงาน</span>
          </div>
          <button class="btn btn-primary btn-sm" id="newTaskBtn2">➕ สร้างงานใหม่</button>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table" id="taskTable">
            <thead>
              <tr>
                <th style="width:40%">งาน / สื่อการเรียน</th>
                <th>ประเภทการอ่าน</th>
                <th>ระดับ</th>
                <th>มอบหมายให้</th>
                <th>กำหนดส่ง</th>
                <th>ความคืบหน้า</th>
                <th>การทำงาน</th>
              </tr>
            </thead>
            <tbody id="taskTableBody">
              ${tasks.map(t => renderTaskRow(t, students)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    } else if (activeTab === 'my-class') {
        pageTitle = 'ชั้นเรียนของฉัน';
        pageSubtitle = 'รายชื่อนักเรียนและระดับความเสี่ยงด้านการเรียนรู้';
        bodyHTML = `
      <div class="card anim-slide-up" style="animation-delay:0.1s; margin-bottom:var(--space-8);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">👥 ภาพรวมและระดับความเสี่ยงของนักเรียน</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);">
          ${students.map(s => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-lg);border-left:4px solid ${s.riskLevel === 'high' ? 'var(--danger)' : s.riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)'};">
              <div style="display:flex;align-items:center;gap:var(--space-4);">
                <div style="width:48px;height:48px;border-radius:50%;background:var(--navy-100);display:flex;align-items:center;justify-content:center;font-size:24px;">${s.avatar}</div>
                <div>
                  <div style="font-weight:700;color:var(--navy-900);font-size:var(--text-sm);">${s.name}</div>
                  <div style="font-size:var(--text-xs);color:var(--slate-500);">${s.grade} · อายุ ${s.age} ปี</div>
                </div>
              </div>
              <div style="display:flex;gap:var(--space-6);align-items:center;">
                <div style="text-align:right;">
                  <div style="font-size:var(--text-xs);color:var(--slate-500);">ความก้าวหน้าโดยรวม</div>
                  <div style="font-weight:700;color:var(--navy-900);">${s.progress}%</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:var(--text-xs);color:var(--slate-500);">เรียนต่อเนื่อง</div>
                  <div style="font-weight:700;color:var(--navy-900);">${s.streak} วัน</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:var(--text-xs);color:var(--slate-500);">บทเรียนวันนี้</div>
                  <div style="font-weight:700;color:var(--navy-900);">${getTodayLessons(s.id)} บท</div>
                </div>
                <span class="badge ${s.riskLevel === 'high' ? 'badge-danger' : s.riskLevel === 'medium' ? 'badge-warning' : 'badge-success'}">ความเสี่ยง${s.riskLevel === 'high' ? 'สูง' : s.riskLevel === 'medium' ? 'ปานกลาง' : 'ต่ำ'}</span>
                <button class="btn btn-ghost btn-sm view-insights-btn">🤝 ดูข้อมูลที่แบ่งปัน</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    } else if (activeTab === 'reports') {
        pageTitle = 'รายงานผลการเรียนของชั้นเรียน';
        pageSubtitle = 'วิเคราะห์ความก้าวหน้าและตัวชี้วัดด้านพัฒนาการ';
        bodyHTML = `
      <div class="card anim-slide-up" style="animation-delay:0.1s; margin-bottom:var(--space-8);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📊 ผลการเรียนและข้อมูลเชิงลึกของชั้นเรียน</span>
        </div>
        <div class="chart-canvas-wrap" style="height:350px;">
          <canvas id="classPerformanceChart"></canvas>
        </div>
      </div>
      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.2s;">
        ${students.map(s => {
            const stats = getStats(s.id);
            const today = stats.records[stats.records.length - 1]?.lessons ?? 0;
            const pct = Math.min(Math.round((today / stats.dailyGoal) * 100), 100);
            return `
              <div class="stat-card">
                <div class="stat-icon" style="background:#DBEAFE;">${s.avatar}</div>
                <div class="stat-value">${today}/${stats.dailyGoal}</div>
                <div class="stat-label">${s.name.split(' ')[0]} เรียนวันนี้</div>
                <div class="progress-track" style="margin-top:var(--space-3);">
                  <div class="progress-fill" style="width:${pct}%;background:var(--accent);"></div>
                </div>
              </div>
            `;
        }).join('')}
      </div>
    `;
    } else if (activeTab === 'library') {
        pageTitle = 'คลังสื่อการเรียนรู้';
        pageSubtitle = 'เข้าถึงสื่อการสอน ใบงาน และคู่มือฝึกทักษะ';
        bodyHTML = `
      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.1s;">
        <div class="card" style="padding:var(--space-5);">
          <div style="font-size:32px;margin-bottom:var(--space-3);">📖</div>
          <div style="font-weight:700;color:var(--navy-900);">แบบฝึกเสียงผสม</div>
          <div style="font-size:var(--text-xs);color:var(--slate-500);margin-top:2px;">บทเรียนพยัญชนะและการจำเสียงประกอบการอ่าน</div>
          <button class="btn btn-primary btn-sm btn-full lib-preview-btn" style="margin-top:var(--space-4);" data-name="แบบฝึกเสียงผสม">ดูตัวอย่างแบบฝึก</button>
        </div>
        <div class="card" style="padding:var(--space-5);">
          <div style="font-size:32px;margin-bottom:var(--space-3);">🌈</div>
          <div style="font-weight:700;color:var(--navy-900);">แบบฝึกสระเสียงยาว</div>
          <div style="font-size:var(--text-xs);color:var(--slate-500);margin-top:2px;">เกมจับคู่สระและเสียงประกอบคำ</div>
          <button class="btn btn-primary btn-sm btn-full lib-preview-btn" style="margin-top:var(--space-4);" data-name="แบบฝึกสระเสียงยาว">ดูตัวอย่างเกม</button>
        </div>
        <div class="card" style="padding:var(--space-5);">
          <div style="font-size:32px;margin-bottom:var(--space-3);">🧩</div>
          <div style="font-weight:700;color:var(--navy-900);">เกมสะกดคำ</div>
          <div style="font-size:var(--text-xs);color:var(--slate-500);margin-top:2px;">กิจกรรมสะกดคำและเรียงประโยคสั้น</div>
          <button class="btn btn-primary btn-sm btn-full lib-preview-btn" style="margin-top:var(--space-4);" data-name="เกมสะกดคำ">ดูตัวอย่างกิจกรรม</button>
        </div>
      </div>
    `;
    }

    // Include the assign modal container in bodyHTML so modal functions continue to work
    bodyHTML += `
    <!-- ASSIGN MODAL -->
    <div class="modal-overlay hidden" id="assignModal">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <div class="modal-title">➕ มอบหมายงานใหม่</div>
            <div class="modal-sub">เลือกนักเรียนและสื่อการเรียน</div>
          </div>
          <button class="modal-close" id="assignClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="assign-form">
            <div class="form-group">
              <label class="form-label">ชื่องาน</label>
              <input class="form-input" id="newTaskTitle" type="text" placeholder="เช่น การออกเสียง บทที่ 4 — เสียงผสม" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
              <div class="form-group">
                <label class="form-label">ประเภทการอ่าน</label>
                <select class="form-input" id="newTaskType">
                  ${READING_TYPES.map(type => `<option>${type}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">กำหนดส่ง</label>
                <input class="form-input" id="newTaskDue" type="date" min="${new Date().toISOString().split('T')[0]}" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">มอบหมายให้นักเรียน</label>
              <div class="student-checkbox-group">
                ${students.map(s => `
                  <label class="student-checkbox">
                    <input type="checkbox" value="${s.id}" />
                    <span class="student-checkbox-name">${s.avatar} ${s.name} – ${s.grade}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost btn-sm" id="assignCancel">ยกเลิก</button>
          <button class="btn btn-primary btn-sm" id="assignConfirm">✅ มอบหมายงาน</button>
        </div>
      </div>
    </div>
  `;

    buildShell(container, {
        role: 'teacher',
        user,
        navItems: NAV,
        activeItem: activeTab,
        pageTitle,
        pageSubtitle,
        bodyHTML,
    });

    initClassChart();
    setupTeacherEvents();

    // Additional dynamic event listeners
    container.querySelectorAll('.view-insights-btn').forEach(btn => {
        btn.addEventListener('click', () => navigate('shared'));
    });

    container.querySelectorAll('.lib-preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('เปิดสื่อการเรียนแล้ว', `โหลดสื่อ "${btn.dataset.name}" เรียบร้อยแล้ว`, 'info');
        });
    });
}

function renderTaskRow(t, students) {
    const assignedStudents = t.assigned.map(id => students.find(s => s.id === id)).filter(Boolean);
    const doneCount = Object.values(t.status).filter(s => s === 'completed').length;
    const totalCount = t.assigned.length;
    const pct = Math.round((doneCount / totalCount) * 100);

    return `
    <tr>
      <td>
        <div style="font-weight:600;color:var(--navy-900);">${t.title}</div>
      </td>
      <td><span class="badge badge-info">${t.type}</span></td>
      <td><span style="font-size:var(--text-xs);color:var(--slate-600);">${t.level}</span></td>
      <td>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${assignedStudents.map(s => `<span class="student-pill">${s.avatar} ${s.name.split(' ')[0]}</span>`).join('')}
        </div>
      </td>
      <td style="font-size:var(--text-xs);color:var(--slate-600);">${t.dueDate}</td>
      <td>
        <div style="min-width:120px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10px;color:var(--slate-500);">เสร็จ ${doneCount}/${totalCount}</span>
            <span style="font-size:10px;font-weight:700;color:${pct === 100 ? 'var(--success)' : pct > 50 ? 'var(--warning)' : 'var(--danger)'};">${pct}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${pct}%;background:${pct === 100 ? 'var(--success)' : pct > 50 ? 'var(--warning)' : 'var(--danger)'}"></div>
          </div>
        </div>
      </td>
      <td>
        <div style="display:flex;gap:var(--space-2);">
          <button class="assign-btn view-task-btn" data-id="${t.id}" style="background:var(--slate-100);color:var(--slate-700);">👁 ดู</button>
          <button class="assign-btn edit-task-btn" data-id="${t.id}">✏️ แก้ไข</button>
        </div>
      </td>
    </tr>
  `;
}

function initClassChart() {
    const ctx = document.getElementById('classPerformanceChart');
    if (!ctx) return;

    const students = AppState.students;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: students.map(s => s.name.split(' ')[0]),
            datasets: [
                {
                    label: 'ความก้าวหน้า %',
                    data: students.map(s => s.progress),
                    backgroundColor: students.map(s =>
                        s.riskLevel === 'high' ? 'rgba(239,68,68,0.8)' :
                            s.riskLevel === 'medium' ? 'rgba(245,158,11,0.8)' :
                                'rgba(16,185,129,0.8)'
                    ),
                    borderRadius: 8, borderSkipped: false,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0A1628',
                    callbacks: { label: ctx => ` ความก้าวหน้า: ${ctx.raw}%` },
                },
            },
            scales: {
                x: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => v + '%', color: '#94A3B8', font: { family: 'Noto Sans Thai', size: 11 } } },
                y: { grid: { display: false }, ticks: { color: '#374359', font: { family: 'Noto Sans Thai', size: 12, weight: '600' } } },
            },
        },
    });
}

function setupTeacherEvents() {
    const openModal = () => document.getElementById('assignModal').classList.remove('hidden');
    const closeModal = () => document.getElementById('assignModal').classList.add('hidden');

    document.getElementById('newTaskBtn')?.addEventListener('click', openModal);
    document.getElementById('newTaskBtn2')?.addEventListener('click', openModal);
    document.getElementById('assignClose')?.addEventListener('click', closeModal);
    document.getElementById('assignCancel')?.addEventListener('click', closeModal);

    document.getElementById('assignConfirm')?.addEventListener('click', () => {
        const title = document.getElementById('newTaskTitle').value.trim();
        const type = document.getElementById('newTaskType').value;
        const due = document.getElementById('newTaskDue').value;
        const selectedStudents = [...document.querySelectorAll('.student-checkbox input:checked')].map(cb => cb.value);

        if (!title || !due || selectedStudents.length === 0) {
            showToast('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบและเลือกนักเรียนอย่างน้อย 1 คน', 'danger');
            return;
        }

        const newTask = {
            id: `T${Date.now()}`, title, type, level: 'กำหนดเอง', dueDate: due,
            assigned: selectedStudents,
            status: Object.fromEntries(selectedStudents.map(id => [id, 'pending'])),
        };
        AppState.tasks.unshift(newTask);
        const tbody = document.getElementById('taskTableBody');
        if (tbody) tbody.insertAdjacentHTML('afterbegin', renderTaskRow(newTask, AppState.students));
        closeModal();
        showToast('มอบหมายงานสำเร็จ! ✅', `มอบหมาย "${title}" ให้นักเรียน ${selectedStudents.length} คนแล้ว`, 'success');
    });

    document.getElementById('viewSharedBtn')?.addEventListener('click', () => navigate('shared'));
}
