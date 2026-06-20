// ============================================
// EXPERT DASHBOARD
// Student progress monitoring + Parent chat
// ============================================
import { AppState, navigate } from '../app.js';
import { buildShell } from '../utils/shell.js';
import { showToast } from '../utils/toast.js';
import { getRiskMeta, getStudentById, getTasksForStudent } from '../mockData.js';

const NAV = [
    { section: 'การติดตาม' },
    { id: 'expert', icon: '🏥', label: 'ภาพรวม' },
    { id: 'expert-students', icon: '📈', label: 'ติดตามนักเรียน' },
    { section: 'การสื่อสาร' },
    { id: 'expert-messages', icon: '💬', label: 'แชทผู้ปกครอง' },
];

export function renderExpertDashboard(container, activeTab = 'expert') {
    const user = AppState.currentUser;
    const students = AppState.students;
    const watchedStudent = getStudentById(user.assignedStudentId) ?? students[0];
    const parent = AppState.users?.parent ?? { name: 'ผู้ปกครอง', avatar: '👨‍👦' };
    const risk = getRiskMeta(watchedStudent.riskLevel);
    const tasks = getTasksForStudent(watchedStudent.id);
    const completedTasks = tasks.filter(t => t.status[watchedStudent.id] === 'completed').length;
    const atRiskCount = students.filter(s => s.riskLevel !== 'low').length;

    let pageTitle = 'แดชบอร์ดผู้เชี่ยวชาญ';
    let pageSubtitle = 'ติดตามผลนักเรียนและประสานงานกับผู้ปกครอง';
    let bodyHTML = '';

    if (activeTab === 'expert') {
        bodyHTML = `
      <div class="welcome-banner anim-slide-up" style="margin-bottom:var(--space-8);">
        <div class="welcome-text">
          <h2>สวัสดี ${user.name.split(' ')[0]}! 🏥</h2>
          <p>วันนี้มีนักเรียนที่ควรติดตามใกล้ชิด <strong>${atRiskCount} คน</strong> และสามารถพูดคุยกับผู้ปกครองเพื่อวางแผนการดูแลต่อเนื่องได้ทันที</p>
          <div style="margin-top:var(--space-5);display:flex;gap:var(--space-3);flex-wrap:wrap;">
            <button class="btn btn-primary" id="expertTrackBtn">📈 ติดตามนักเรียน</button>
            <button class="btn btn-ghost" style="border-color:rgba(255,255,255,0.3);color:#fff;" id="expertChatBtn">💬 แชทผู้ปกครอง</button>
          </div>
        </div>
        <div class="welcome-emoji">🏥</div>
      </div>

      <div class="grid grid-4" style="margin-bottom:var(--space-8);">
        <div class="stat-card anim-slide-up" style="animation-delay:0.1s;">
          <div class="stat-icon" style="background:#DBEAFE;">👥</div>
          <div class="stat-value">${students.length}</div>
          <div class="stat-label">นักเรียนที่ดูแล</div>
          <div class="stat-trend">ในระบบติดตาม</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.15s;">
          <div class="stat-icon" style="background:#FEF3C7;">⚠️</div>
          <div class="stat-value">${atRiskCount}</div>
          <div class="stat-label">ต้องติดตามต่อ</div>
          <div class="stat-trend trend-down">ระดับปานกลางขึ้นไป</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.2s;">
          <div class="stat-icon" style="background:#D1FAE5;">✅</div>
          <div class="stat-value">${completedTasks}/${tasks.length}</div>
          <div class="stat-label">งานของ ${watchedStudent.name.split(' ')[0]}</div>
          <div class="stat-trend trend-up">อัปเดตล่าสุดวันนี้</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.25s;">
          <div class="stat-icon" style="background:#EDE9FE;">🧠</div>
          <div class="stat-value">${AppState.ldScreening.confidence}%</div>
          <div class="stat-label">ความมั่นใจ AI</div>
          <div class="stat-trend">จากรายงานคัดกรอง</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:var(--space-6);margin-bottom:var(--space-8);">
        <div class="card anim-slide-up" style="animation-delay:0.3s;">
          <div class="card-header">
            <span style="font-weight:700;color:var(--navy-900);">📌 เคสที่ต้องติดตาม</span>
            <span class="badge ${risk.badge}">ความเสี่ยง${risk.label}</span>
          </div>
          <div style="padding:var(--space-5);">
            <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5);">
              <div class="avatar" style="width:64px;height:64px;background:var(--navy-100);font-size:32px;">${watchedStudent.avatar}</div>
              <div>
                <div style="font-weight:800;color:var(--navy-900);">${watchedStudent.name}</div>
                <div style="font-size:var(--text-xs);color:var(--slate-500);">${watchedStudent.grade} · เรียนต่อเนื่อง ${watchedStudent.streak} วัน</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);">
              <div style="padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-md);">
                <div style="font-size:var(--text-xs);color:var(--slate-500);">ความก้าวหน้า</div>
                <div style="font-weight:800;color:var(--navy-900);font-size:var(--text-lg);">${watchedStudent.progress}%</div>
              </div>
              <div style="padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-md);">
                <div style="font-size:var(--text-xs);color:var(--slate-500);">ทักษะที่ควรเน้น</div>
                <div style="font-weight:800;color:var(--navy-900);font-size:var(--text-sm);">การอ่าน</div>
              </div>
              <div style="padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-md);">
                <div style="font-size:var(--text-xs);color:var(--slate-500);">นัดติดตาม</div>
                <div style="font-weight:800;color:var(--navy-900);font-size:var(--text-sm);">อีก 2 สัปดาห์</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card anim-slide-up" style="animation-delay:0.35s;">
          <div class="card-header">
            <span style="font-weight:700;color:var(--navy-900);">💬 ผู้ปกครอง</span>
          </div>
          <div style="padding:var(--space-5);">
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
              <div class="avatar avatar-sm" style="background:var(--navy-100);">${parent.avatar}</div>
              <div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--navy-900);">${parent.name}</div>
                <div style="font-size:var(--text-xs);color:var(--slate-500);">ผู้ปกครองของ ${watchedStudent.name}</div>
              </div>
            </div>
            <p style="font-size:var(--text-sm);color:var(--slate-600);line-height:1.6;margin-bottom:var(--space-4);">แนะนำให้ส่งแผนฝึกอ่านวันละ 15 นาที พร้อมติดตามความล้าระหว่างทำกิจกรรม</p>
            <button class="btn btn-primary btn-sm btn-full" id="expertChatBtn2">เริ่มแชท</button>
          </div>
        </div>
      </div>
    `;
    } else if (activeTab === 'expert-students') {
        pageTitle = 'ติดตามผลของนักเรียน';
        pageSubtitle = 'ดูระดับความเสี่ยง ความก้าวหน้า และคำแนะนำรายคน';
        bodyHTML = `
      <div class="card anim-slide-up" style="margin-bottom:var(--space-8);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📈 รายชื่อนักเรียนที่ติดตาม</span>
          <span class="badge badge-info">อัปเดตวันนี้</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);">
          ${students.map(student => {
            const meta = getRiskMeta(student.riskLevel);
            const studentTasks = getTasksForStudent(student.id);
            const done = studentTasks.filter(t => t.status[student.id] === 'completed').length;
            return `
              <div class="expert-student-row" style="border-left-color:${meta.color};">
                <div style="display:flex;align-items:center;gap:var(--space-4);">
                  <div class="avatar" style="width:48px;height:48px;background:var(--navy-100);font-size:24px;">${student.avatar}</div>
                  <div>
                    <div style="font-weight:700;color:var(--navy-900);font-size:var(--text-sm);">${student.name}</div>
                    <div style="font-size:var(--text-xs);color:var(--slate-500);">${student.grade} · อายุ ${student.age} ปี</div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
                    <span style="font-size:var(--text-xs);color:var(--slate-500);">ความก้าวหน้า ${student.progress}%</span>
                    <span style="font-size:var(--text-xs);color:var(--slate-500);">งาน ${done}/${studentTasks.length}</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width:${student.progress}%;background:${meta.color};"></div>
                  </div>
                </div>
                <div style="display:flex;gap:var(--space-2);align-items:center;justify-content:flex-end;">
                  <span class="badge ${meta.badge}">ความเสี่ยง${meta.label}</span>
                  <button class="btn btn-ghost btn-sm expert-note-btn" data-name="${student.name}">บันทึกคำแนะนำ</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    } else if (activeTab === 'expert-messages') {
        pageTitle = 'แชทกับผู้ปกครอง';
        pageSubtitle = `ประสานการดูแล ${watchedStudent.name} กับผู้ปกครอง`;
        bodyHTML = `
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">💬 สนทนากับ ${parent.name}</span>
          <span class="badge badge-success">ออนไลน์</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);max-height:380px;overflow-y:auto;" id="expertMessageThread">
          <div style="align-self:flex-start;max-width:75%;">
            <div style="background:var(--slate-100);padding:var(--space-3) var(--space-4);border-radius:0 var(--radius-lg) var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:var(--navy-900);line-height:1.5;">
              สวัสดีครับ ช่วงนี้อเล็กซ์ยังอ่านเสียงผสมได้ช้าอยู่ ควรฝึกอะไรเพิ่มเติมไหมครับ
            </div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:4px;padding-left:4px;">${parent.name} · 18 มิ.ย.</div>
          </div>
          <div style="align-self:flex-end;max-width:75%;">
            <div style="background:var(--accent);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg) 0 var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:#fff;line-height:1.5;">
              แนะนำฝึกแยกเสียงต้น-กลาง-ท้ายวันละ 10-15 นาที และหยุดพักทันทีถ้าเริ่มล้า เดี๋ยวฉันส่งชุดคำถามติดตามให้ค่ะ
            </div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:4px;text-align:right;padding-right:4px;">คุณ · 18 มิ.ย.</div>
          </div>
        </div>
        <div style="padding:var(--space-4) var(--space-5);border-top:1px solid var(--slate-100);display:flex;gap:var(--space-3);">
          <input class="form-input" id="expertMsgInput" placeholder="พิมพ์ข้อความถึงผู้ปกครอง…" style="flex:1;" />
          <button class="btn btn-primary btn-sm" id="expertSendMsgBtn">ส่ง ✉️</button>
        </div>
      </div>
    `;
    }

    buildShell(container, {
        role: 'expert',
        user,
        navItems: NAV,
        activeItem: activeTab,
        pageTitle,
        pageSubtitle,
        bodyHTML,
    });

    setupExpertEvents();
}

function setupExpertEvents() {
    document.getElementById('expertTrackBtn')?.addEventListener('click', () => navigate('expert-students'));
    document.getElementById('expertChatBtn')?.addEventListener('click', () => navigate('expert-messages'));
    document.getElementById('expertChatBtn2')?.addEventListener('click', () => navigate('expert-messages'));

    document.querySelectorAll('.expert-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('บันทึกคำแนะนำแล้ว', `เพิ่มบันทึกติดตามสำหรับ ${btn.dataset.name}`, 'success');
        });
    });

    const sendBtn = document.getElementById('expertSendMsgBtn');
    const msgInput = document.getElementById('expertMsgInput');
    sendBtn?.addEventListener('click', () => {
        const text = msgInput?.value.trim();
        if (!text) return;

        const thread = document.getElementById('expertMessageThread');
        if (thread) {
            const bubble = document.createElement('div');
            bubble.style.cssText = 'align-self:flex-end;max-width:75%;';
            bubble.innerHTML = `
              <div style="background:var(--accent);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg) 0 var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:#fff;line-height:1.5;">${text}</div>
              <div style="font-size:10px;color:var(--slate-400);margin-top:4px;text-align:right;padding-right:4px;">คุณ · เมื่อสักครู่</div>
            `;
            thread.appendChild(bubble);
            thread.scrollTop = thread.scrollHeight;
        }
        if (msgInput) msgInput.value = '';
        showToast('ส่งข้อความแล้ว ✉️', 'ส่งข้อความถึงผู้ปกครองแล้ว', 'success');
    });

    msgInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('expertSendMsgBtn')?.click();
    });
}
