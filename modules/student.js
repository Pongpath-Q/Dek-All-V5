// ============================================
// STUDENT DASHBOARD
// Hybrid Scanning + Task Overview + Rewards
// ============================================
import { AppState, navigate } from '../app.js';
import { buildShell } from '../utils/shell.js';
import { showToast } from '../utils/toast.js';
import { getLearningStatsForStudent, getRiskMeta, getTasksForStudent } from '../mockData.js';

const NAV = [
    { section: 'การเรียนรู้' },
    { id: 'student', icon: '📷', label: 'สแกนใบงาน' },
    { id: 'tasks', icon: '📋', label: 'งานของฉัน', badge: null },
    { id: 'quiz', icon: '🎮', label: 'เกมทดสอบ' },
    { section: 'ความก้าวหน้า' },
    { id: 'rewards', icon: '🏆', label: 'รางวัล' },
    { id: 'profile', icon: '👤', label: 'โปรไฟล์ของฉัน' },
];

export function renderStudentDashboard(container, activeTab = 'student') {
    const user = AppState.currentUser;
    const profile = AppState.students.find(s => s.id === user.id) ?? AppState.students[0];
    const myTasks = getTasksForStudent(profile.id);
    const pendingCount = myTasks.filter(t => t.status[profile.id] === 'pending').length;
    const completedCount = myTasks.filter(t => t.status[profile.id] === 'completed').length;
    const risk = getRiskMeta(profile.riskLevel);
    const scanMeta = AppState.scanSessions;
    const learningStats = AppState.learningStats.find(item => item.studentId === profile.id) ?? getLearningStatsForStudent(profile.id);
    const todayLearning = learningStats.records[learningStats.records.length - 1] ?? { date: '-', lessons: 0, sessions: 0 };
    const weeklyLessons = learningStats.records.slice(-7).reduce((sum, record) => sum + record.lessons, 0);

    // Inject live pending badge into nav
    const navItems = NAV.map(item =>
        item.id === 'tasks' ? { ...item, badge: pendingCount || null } : item
    );

    let pageTitle = 'พื้นที่สำหรับนักเรียน';
    let pageSubtitle = `สวัสดี ${profile.name.split(' ')[0]} — พร้อมเรียนรู้หรือยัง?`;
    let bodyHTML = '';

    // ──────────────────────────────────────────
    // TAB: HYBRID SCAN (home)
    // ──────────────────────────────────────────
    if (activeTab === 'student') {
        bodyHTML = `
      <!-- HERO BANNER -->
      <div class="welcome-banner anim-slide-up" style="margin-bottom:var(--space-8);">
        <div class="welcome-text">
          <h2>สแกนใบงานอัจฉริยะ 📷</h2>
          <p>วางใบงานให้อยู่ในกรอบกล้องด้านล่าง ระบบ AI จะอ่าน ตรวจคะแนน และบันทึกความก้าวหน้าให้ทันที</p>
          <div style="margin-top:var(--space-4);display:flex;gap:var(--space-3);flex-wrap:wrap;">
            <span class="badge badge-info">วันนี้สแกน ${scanMeta.todayCount}/${scanMeta.dailyGoal} ครั้ง</span>
            <span class="badge badge-success">วันนี้เรียน ${todayLearning.lessons}/${learningStats.dailyGoal} บท</span>
            <span class="badge ${risk.badge}">ความก้าวหน้า ${profile.progress}%</span>
          </div>
        </div>
        <div class="welcome-emoji">📄</div>
      </div>

      <!-- SCAN INTERFACE -->
      <div class="card anim-slide-up" style="animation-delay:0.15s;max-width:560px;margin:0 auto var(--space-8);">
        <div class="card-header" style="justify-content:center;">
          <span style="font-weight:700;color:var(--navy-900);">📷 สแกนใบงานของคุณ</span>
        </div>
        <div style="padding:var(--space-6) var(--space-5);display:flex;flex-direction:column;align-items:center;gap:var(--space-6);">
          <!-- Camera Frame -->
          <div class="scan-camera-frame" id="scanFrame">
            <video class="scan-video hidden" id="scanVideo" autoplay playsinline muted></video>
            <img class="scan-preview hidden" id="scanPreview" alt="ตัวอย่างใบงานที่เลือก" />
            <canvas class="scan-canvas hidden" id="scanCanvas"></canvas>
            <div class="scan-corner scan-corner-tl"></div>
            <div class="scan-corner scan-corner-tr"></div>
            <div class="scan-corner scan-corner-bl"></div>
            <div class="scan-corner scan-corner-br"></div>
            <div class="scan-line" id="scanLine"></div>
            <div class="scan-frame-inner" id="scanPlaceholder">
              <div style="font-size:48px;opacity:0.35;margin-bottom:var(--space-3);">📄</div>
              <div style="font-size:var(--text-sm);color:rgba(255,255,255,0.72);text-align:center;line-height:1.5;">
                เปิดกล้องหรือเลือกรูปใบงาน<br>
                <span style="font-size:var(--text-xs);color:rgba(255,255,255,0.52);">วางใบงานให้เต็มกรอบก่อนกดถ่าย</span>
              </div>
            </div>
            <div class="scan-status hidden" id="scanStatus">กำลังสแกน…</div>
          </div>
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;justify-content:center;">
            <button class="btn btn-primary" id="scanBtn" style="min-width:180px;padding:var(--space-4) var(--space-8);font-size:var(--text-base);">
              📷 ถ่ายและสแกน
            </button>
            <button class="btn btn-ghost" id="startCameraBtn" type="button">เปิดกล้อง</button>
            <label class="btn btn-ghost" for="worksheetUpload" style="cursor:pointer;">อัปโหลดรูป</label>
            <input class="hidden" id="worksheetUpload" type="file" accept="image/*" capture="environment" />
          </div>
          <p id="cameraHint" style="font-size:var(--text-xs);color:var(--slate-500);text-align:center;margin:0;">
            หากเบราว์เซอร์ไม่อนุญาตกล้อง ให้ใช้อัปโหลดรูปใบงานแทนได้
          </p>
        </div>
      </div>

      <!-- QUICK STATS -->
      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.25s;">
        <div class="stat-card">
          <div class="stat-icon" style="background:#EDE9FE;">📚</div>
          <div class="stat-value">${todayLearning.lessons}</div>
          <div class="stat-label">บทเรียนวันนี้</div>
          <div class="stat-trend trend-up">รวมสัปดาห์นี้ ${weeklyLessons} บท</div>
        </div>
      </div>

      <div class="learning-days anim-slide-up" style="animation-delay:0.3s;">
        ${learningStats.records.slice(-5).map(record => {
            const pct = Math.min(Math.round((record.lessons / learningStats.dailyGoal) * 100), 100);
            return `
              <div class="learning-day">
                <div class="learning-day-date">${record.date.slice(5)}</div>
                <div class="progress-track">
                  <div class="progress-fill" style="width:${pct}%;background:var(--accent);"></div>
                </div>
                <div class="learning-day-count">${record.lessons} บท</div>
              </div>
            `;
        }).join('')}
      </div>

      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.35s;">
        <div class="stat-card">
          <div class="stat-icon" style="background:#FFF0E6;">🔥</div>
          <div class="stat-value">${profile.streak}</div>
          <div class="stat-label">เรียนต่อเนื่อง</div>
          <div class="stat-trend trend-up">↑ ทำต่อไปนะ!</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#DBEAFE;">📋</div>
          <div class="stat-value">${pendingCount}</div>
          <div class="stat-label">งานที่ยังไม่เสร็จ</div>
          <div class="stat-trend">${pendingCount > 0 ? 'อย่าลืมทำงานนะ!' : 'ทำครบแล้ว! 🎉'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#D1FAE5;">✅</div>
          <div class="stat-value">${profile.progress}%</div>
          <div class="stat-label">ความก้าวหน้าโดยรวม</div>
          <div class="stat-trend trend-up">↑ ทำเสร็จแล้ว ${completedCount} งาน</div>
        </div>
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: MY TASKS
    // ──────────────────────────────────────────
    } else if (activeTab === 'tasks') {
        pageTitle = 'งานของฉัน';
        pageSubtitle = 'งานที่ได้รับมอบหมายจากครู';
        bodyHTML = `
      <div class="card anim-slide-up" style="animation-delay:0.1s;margin-bottom:var(--space-8);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📋 งานที่ได้รับมอบหมาย</span>
          <div style="display:flex;gap:var(--space-2);">
            <span class="badge badge-warning">รอทำ ${pendingCount}</span>
            <span class="badge badge-success">เสร็จแล้ว ${completedCount}</span>
          </div>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);">
          ${myTasks.length === 0
            ? `<p style="color:var(--slate-500);font-size:var(--text-sm);text-align:center;padding:var(--space-8);">ยังไม่มีงานที่ได้รับมอบหมาย กลับมาตรวจสอบภายหลังได้เลย!</p>`
            : myTasks.map(t => {
                const done = t.status[profile.id] === 'completed';
                return `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-lg);border-left:4px solid ${done ? 'var(--success)' : 'var(--accent)'};">
                    <div>
                      <div style="font-weight:700;color:var(--navy-900);font-size:var(--text-sm);">${t.title}</div>
                      <div style="font-size:var(--text-xs);color:var(--slate-500);margin-top:2px;">
                        ${t.type} &nbsp;·&nbsp; กำหนดส่ง ${t.dueDate}
                      </div>
                    </div>
                    <div style="display:flex;gap:var(--space-3);align-items:center;flex-shrink:0;">
                      <span class="badge ${done ? 'badge-success' : 'badge-warning'}">${done ? '✅ เสร็จแล้ว' : '⏳ รอทำ'}</span>
                      ${!done ? `<button class="btn btn-primary btn-sm scan-task-btn" data-title="${t.title}">📷 สแกน</button>` : ''}
                    </div>
                  </div>
                `;
              }).join('')
          }
        </div>
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: REWARDS
    // ──────────────────────────────────────────
    } else if (activeTab === 'quiz') {
        pageTitle = 'เกมแบบทดสอบ';
        pageSubtitle = 'ฝึกอ่านแบบเล่นเกม เลือกคำตอบให้ถูกเพื่อสะสมดาว';

        const quizQuestions = [
            { icon: '🔤', category: 'พยัญชนะ', prompt: 'ตัวอักษรใดคือพยัญชนะไทย', choices: ['ก', 'า', 'ไ'], answer: 'ก' },
            { icon: '🌈', category: 'สระ', prompt: 'ข้อใดเป็นสระเสียงยาว', choices: ['ะ', 'า', 'ิ'], answer: 'า' },
            { icon: '🧩', category: 'สะกดคำ', prompt: 'คำว่า “บ้าน” สะกดด้วยตัวสะกดใด', choices: ['น', 'ก', 'ม'], answer: 'น' },
            { icon: '💬', category: 'อ่านประโยค', prompt: 'ประโยคใดเรียงคำถูกต้อง', choices: ['ฉัน อ่าน หนังสือ', 'อ่าน ฉัน หนังสือ', 'หนังสือ ฉัน อ่าน'], answer: 'ฉัน อ่าน หนังสือ' },
        ];

        bodyHTML = `
      <div class="quiz-shell anim-slide-up">
        <div class="quiz-scoreboard">
          <div>
            <div class="quiz-kicker">Reading Quest</div>
            <h2>ภารกิจนักอ่านตัวน้อย</h2>
            <p>ตอบคำถามให้ถูกเพื่อปลดล็อกดาว และบันทึกเป็นบทเรียนของวันนี้</p>
          </div>
          <div class="quiz-score">
            <span id="quizScore">0</span>
            <small>/ ${quizQuestions.length} ดาว</small>
          </div>
        </div>
        <div class="quiz-grid">
          ${quizQuestions.map((q, index) => `
            <div class="quiz-card" data-answer="${q.answer}" data-index="${index}">
              <div class="quiz-card-top">
                <span class="quiz-icon">${q.icon}</span>
                <span class="badge badge-info">${q.category}</span>
              </div>
              <div class="quiz-prompt">${q.prompt}</div>
              <div class="quiz-choices">
                ${q.choices.map(choice => `<button class="quiz-choice" type="button" data-choice="${choice}">${choice}</button>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="quiz-complete hidden" id="quizComplete">
          <strong>เก่งมาก!</strong> บันทึกเพิ่มให้วันนี้แล้ว 1 บทเรียน
        </div>
      </div>
    `;

    } else if (activeTab === 'rewards') {
        pageTitle = 'รางวัล';
        pageSubtitle = 'รับเหรียญรางวัลจากการทำงานและการสแกนให้สำเร็จ';

        const badges = [
            {
                emoji: '🔥',
                name: 'ดาวแห่งความต่อเนื่อง',
                desc: `เรียนต่อเนื่อง ${profile.streak} วัน`,
                unlocked: profile.streak >= 3,
                badge: 'badge-success',
            },
            {
                emoji: '📷',
                name: 'นักสแกนมือทอง',
                desc: `วันนี้สแกน ${scanMeta.todayCount}/${scanMeta.dailyGoal} ครั้ง`,
                unlocked: scanMeta.todayCount >= scanMeta.dailyGoal,
                badge: 'badge-warning',
            },
            {
                emoji: '🌟',
                name: 'ยอดนักเรียนรู้',
                desc: `ความก้าวหน้าโดยรวม ${profile.progress}%`,
                unlocked: profile.progress >= 70,
                badge: 'badge-info',
            },
            {
                emoji: '✅',
                name: 'แชมป์ทำงาน',
                desc: `ทำเสร็จแล้ว ${completedCount} งาน`,
                unlocked: completedCount >= 2,
                badge: 'badge-success',
            },
            {
                emoji: '🧠',
                name: 'ฮีโร่ผู้มีสมาธิ',
                desc: 'ทำเกมแบบทดสอบให้สำเร็จ',
                unlocked: todayLearning.lessons >= 1,
                badge: 'badge-info',
            },
            {
                emoji: '📖',
                name: 'หนอนหนังสือ',
                desc: 'ทำงานอ่านให้สำเร็จ',
                unlocked: myTasks.some(t => t.status[profile.id] === 'completed'),
                badge: 'badge-warning',
            },
        ];

        bodyHTML = `
      <!-- PROGRESS SUMMARY -->
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">🏆 ความคืบหน้าเหรียญรางวัล</span>
          <span class="badge badge-info">ปลดล็อก ${badges.filter(b => b.unlocked).length}/${badges.length}</span>
        </div>
        <div style="padding:var(--space-4) var(--space-5);">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
            <span style="font-size:var(--text-xs);color:var(--slate-500);">ความคืบหน้าการสะสม</span>
            <span style="font-size:var(--text-xs);font-weight:700;color:var(--navy-900);">${Math.round((badges.filter(b => b.unlocked).length / badges.length) * 100)}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${Math.round((badges.filter(b => b.unlocked).length / badges.length) * 100)}%;background:var(--accent);"></div>
          </div>
        </div>
      </div>

      <!-- BADGE GRID -->
      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.1s;">
        ${badges.map((b, i) => `
          <div class="card" style="padding:var(--space-5);text-align:center;animation-delay:${0.1 + i * 0.05}s;opacity:${b.unlocked ? 1 : 0.5};">
            <div style="font-size:40px;margin-bottom:var(--space-3);${b.unlocked ? '' : 'filter:grayscale(1);'}">${b.emoji}</div>
            <div style="font-weight:700;color:var(--navy-900);font-size:var(--text-sm);">${b.name}</div>
            <div style="font-size:var(--text-xs);color:var(--slate-500);margin-top:var(--space-1);">${b.desc}</div>
            <span class="badge ${b.unlocked ? b.badge : 'badge-info'}" style="margin-top:var(--space-3);">${b.unlocked ? 'ปลดล็อกแล้ว 🎉' : 'ยังล็อกอยู่ 🔒'}</span>
          </div>
        `).join('')}
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: MY PROFILE
    // ──────────────────────────────────────────
    } else if (activeTab === 'profile') {
        pageTitle = 'โปรไฟล์ของฉัน';
        pageSubtitle = 'ข้อมูลการเรียนรู้และสรุปความก้าวหน้าของคุณ';
        bodyHTML = `
      <!-- PROFILE CARD -->
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">👤 ${profile.name}</span>
          <span class="badge ${risk.badge}">ความเสี่ยง${risk.label}</span>
        </div>
        <div style="padding:var(--space-5);">
          <div style="display:flex;align-items:center;gap:var(--space-5);margin-bottom:var(--space-6);">
            <div style="width:72px;height:72px;border-radius:50%;background:var(--navy-100);display:flex;align-items:center;justify-content:center;font-size:36px;">${profile.avatar}</div>
            <div>
              <div style="font-weight:700;color:var(--navy-900);font-size:var(--text-lg);">${profile.name}</div>
              <div style="font-size:var(--text-sm);color:var(--slate-500);">${profile.grade} · อายุ ${profile.age} ปี</div>
              <div style="font-size:var(--text-xs);color:var(--slate-400);margin-top:2px;">${user.email}</div>
            </div>
          </div>
          <div style="margin-bottom:var(--space-5);">
            <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
              <span style="font-size:var(--text-xs);color:var(--slate-500);">ความก้าวหน้าโดยรวม</span>
              <span style="font-size:var(--text-xs);font-weight:700;color:var(--navy-900);">${profile.progress}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${profile.progress}%;background:${risk.color};"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- STATS STRIP -->
      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.1s;margin-bottom:var(--space-6);">
        <div class="stat-card">
          <div class="stat-icon" style="background:#FFF0E6;">🔥</div>
          <div class="stat-value">${profile.streak}</div>
          <div class="stat-label">เรียนต่อเนื่อง</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#D1FAE5;">✅</div>
          <div class="stat-value">${completedCount}</div>
          <div class="stat-label">งานที่ทำเสร็จ</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#DBEAFE;">📷</div>
          <div class="stat-value">${scanMeta.todayCount}</div>
          <div class="stat-label">สแกนวันนี้</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#EDE9FE;">📚</div>
          <div class="stat-value">${todayLearning.lessons}</div>
          <div class="stat-label">บทเรียนวันนี้</div>
        </div>
      </div>

      <!-- LEARNING GOALS -->
      <div class="card anim-slide-up" style="animation-delay:0.2s;">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">🎯 เป้าหมายประจำวัน</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);">
          ${[
            { label: 'เป้าหมายการสแกนประจำวัน', current: scanMeta.todayCount, goal: scanMeta.dailyGoal, icon: '📷', color: 'var(--accent)' },
            { label: 'เป้าหมายบทเรียนประจำวัน', current: todayLearning.lessons, goal: learningStats.dailyGoal, icon: '📚', color: 'var(--info)' },
            { label: 'การทำงานให้เสร็จ', current: completedCount, goal: myTasks.length, icon: '📋', color: 'var(--success)' },
            { label: 'เป้าหมายเรียนต่อเนื่อง', current: profile.streak, goal: 7, icon: '🔥', color: 'var(--warning)' },
          ].map(g => {
            const pct = Math.min(Math.round((g.current / g.goal) * 100), 100);
            return `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                  <div style="display:flex;align-items:center;gap:var(--space-2);">
                    <span>${g.icon}</span>
                    <span style="font-size:var(--text-sm);font-weight:700;color:var(--navy-900);">${g.label}</span>
                  </div>
                  <span style="font-size:var(--text-xs);color:var(--slate-500);">${g.current}/${g.goal}</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width:${pct}%;background:${g.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    }

    buildShell(container, {
        role: 'student',
        user: profile,
        navItems,
        activeItem: activeTab,
        pageTitle,
        pageSubtitle,
        bodyHTML,
    });

    setupStudentEvents(profile);
}

// ──────────────────────────────────────────
// SCAN LOGIC + EVENT WIRING
// ──────────────────────────────────────────
function setupStudentEvents(profile) {
    const scanBtn = document.getElementById('scanBtn');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const uploadInput = document.getElementById('worksheetUpload');
    const scanFrame = document.getElementById('scanFrame');
    const scanLine = document.getElementById('scanLine');
    const scanStatus = document.getElementById('scanStatus');
    const scanVideo = document.getElementById('scanVideo');
    const scanCanvas = document.getElementById('scanCanvas');
    const scanPreview = document.getElementById('scanPreview');
    const scanPlaceholder = document.getElementById('scanPlaceholder');
    const cameraHint = document.getElementById('cameraHint');
    let scanning = false;
    let uploadedImageUrl = null;

    const addLessonForToday = () => {
        let stats = AppState.learningStats.find(item => item.studentId === profile.id);
        if (!stats) {
            stats = { studentId: profile.id, dailyGoal: 3, records: [] };
            AppState.learningStats.push(stats);
        }

        const today = new Date().toISOString().slice(0, 10);
        let record = stats.records.find(item => item.date === today);
        if (!record) {
            record = { date: today, lessons: 0, sessions: 0 };
            stats.records.push(record);
        }

        record.lessons += 1;
        record.sessions += 1;
    };

    const stopCamera = () => {
        window.dekallCameraStream?.getTracks().forEach(track => track.stop());
        window.dekallCameraStream = null;
    };

    const setPlaceholderVisible = (visible) => {
        scanPlaceholder?.classList.toggle('hidden', !visible);
    };

    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia || !scanVideo) {
            showToast('เปิดกล้องไม่ได้', 'เบราว์เซอร์นี้ไม่รองรับกล้อง กรุณาอัปโหลดรูปใบงานแทน', 'warning');
            return;
        }

        try {
            stopCamera();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            window.dekallCameraStream = stream;
            scanVideo.srcObject = stream;
            scanVideo.classList.remove('hidden');
            scanPreview?.classList.add('hidden');
            scanCanvas?.classList.add('hidden');
            setPlaceholderVisible(false);
            if (cameraHint) cameraHint.textContent = 'กล้องพร้อมแล้ว วางใบงานให้อยู่ในกรอบแล้วกดถ่ายและสแกน';
        } catch {
            showToast('ต้องอนุญาตการใช้กล้อง', 'ไม่สามารถเปิดกล้องได้ กรุณาตรวจสิทธิ์กล้องหรือใช้อัปโหลดรูป', 'warning');
            if (cameraHint) cameraHint.textContent = 'เปิดกล้องไม่สำเร็จ ใช้อัปโหลดรูปใบงานแทนได้';
        }
    };

    const drawSourceToCanvas = () => {
        if (!scanCanvas) return false;
        const context = scanCanvas.getContext('2d');
        if (!context) return false;

        if (scanVideo && scanVideo.srcObject && scanVideo.videoWidth > 0) {
            scanCanvas.width = scanVideo.videoWidth;
            scanCanvas.height = scanVideo.videoHeight;
            context.drawImage(scanVideo, 0, 0, scanCanvas.width, scanCanvas.height);
            scanCanvas.classList.remove('hidden');
            scanVideo.classList.add('hidden');
            return true;
        }

        if (scanPreview && !scanPreview.classList.contains('hidden') && scanPreview.complete) {
            scanCanvas.width = scanPreview.naturalWidth || 1280;
            scanCanvas.height = scanPreview.naturalHeight || 960;
            context.drawImage(scanPreview, 0, 0, scanCanvas.width, scanCanvas.height);
            scanCanvas.classList.remove('hidden');
            return true;
        }

        return false;
    };

    const runScan = (taskTitle = null) => {
        if (scanning) return;

        if (!drawSourceToCanvas()) {
            showToast('ยังไม่มีภาพใบงาน', 'เปิดกล้องหรืออัปโหลดรูปก่อนกดถ่ายและสแกน', 'warning');
            return;
        }

        scanning = true;
        scanFrame?.classList.add('scanning');
        scanLine?.classList.add('active');
        scanStatus?.classList.remove('hidden');
        if (scanBtn) { scanBtn.disabled = true; scanBtn.textContent = '⏳ กำลังสแกน…'; }

        setTimeout(() => {
            scanFrame?.classList.remove('scanning');
            scanLine?.classList.remove('active');
            scanStatus?.classList.add('hidden');
            if (scanBtn) { scanBtn.disabled = false; scanBtn.textContent = '📷 ถ่ายและสแกน'; }
            scanning = false;

            AppState.scanSessions.todayCount = Math.min(
                AppState.scanSessions.todayCount + 1,
                AppState.scanSessions.dailyGoal
            );
            AppState.scanSessions.lastScan = new Date().toISOString();
            addLessonForToday();

            showToast(
                'สแกนสำเร็จ ✅',
                taskTitle
                    ? `ถ่ายภาพและส่งงาน "${taskTitle}" เรียบร้อยแล้ว`
                    : 'ถ่ายภาพใบงานและบันทึกผลสแกนเรียบร้อยแล้ว',
                'success'
            );
        }, 1800);
    };

    startCameraBtn?.addEventListener('click', startCamera);
    scanBtn?.addEventListener('click', () => runScan());

    uploadInput?.addEventListener('change', () => {
        const file = uploadInput.files?.[0];
        if (!file || !scanPreview) return;
        if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
        uploadedImageUrl = URL.createObjectURL(file);
        scanPreview.src = uploadedImageUrl;
        scanPreview.classList.remove('hidden');
        scanVideo?.classList.add('hidden');
        scanCanvas?.classList.add('hidden');
        setPlaceholderVisible(false);
        stopCamera();
        if (cameraHint) cameraHint.textContent = 'โหลดรูปใบงานแล้ว กดถ่ายและสแกนเพื่อบันทึกผล';
    });

    if (!scanBtn) stopCamera();

    document.querySelectorAll('.scan-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigate('student');
            setTimeout(() => runScan(btn.dataset.title), 300);
        });
    });

    const answered = new Set();
    let quizScore = 0;
    const scoreEl = document.getElementById('quizScore');
    const completeEl = document.getElementById('quizComplete');
    document.querySelectorAll('.quiz-card').forEach(card => {
        card.querySelectorAll('.quiz-choice').forEach(choiceBtn => {
            choiceBtn.addEventListener('click', () => {
                const index = card.dataset.index;
                if (answered.has(index)) return;

                const isCorrect = choiceBtn.dataset.choice === card.dataset.answer;
                if (isCorrect) quizScore += 1;
                choiceBtn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
                if (!isCorrect) {
                    card.querySelector(`[data-choice="${card.dataset.answer}"]`)?.classList.add('is-correct');
                }
                answered.add(index);
                if (scoreEl) scoreEl.textContent = String(quizScore);

                if (answered.size === document.querySelectorAll('.quiz-card').length) {
                    addLessonForToday();
                    completeEl?.classList.remove('hidden');
                    showToast('ทำแบบทดสอบสำเร็จ 🎮', 'บันทึกเพิ่มเป็นบทเรียนของวันนี้แล้ว', 'success');
                }
            });
        });
    });
}
