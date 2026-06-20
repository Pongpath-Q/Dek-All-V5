// ============================================
// PARENT DASHBOARD
// LD Screening + AI Insights + Progress View
// ============================================
import { AppState, navigate } from '../app.js';
import { buildShell } from '../utils/shell.js';
import { showToast } from '../utils/toast.js';
import { getLearningStatsForStudent, getRiskMeta, getStudentById, getTasksForStudent } from '../mockData.js';

const NAV = [
    { section: 'หน้าหลัก' },
    { id: 'parent', icon: '🏠', label: 'ภาพรวม' },
    { id: 'screening', icon: '🧠', label: 'คัดกรอง LD' },
    { id: 'risk-assessment', icon: '📝', label: 'คำถามประเมินความเสี่ยง' },
    { id: 'progress', icon: '📈', label: 'ความก้าวหน้า' },
    { section: 'การสื่อสาร' },
    { id: 'shared', icon: '🤝', label: 'ข้อมูลที่แบ่งปัน' },
    { id: 'messages', icon: '💬', label: 'ข้อความ' },
];

export function renderParentDashboard(container, activeTab = 'parent') {
    const user = AppState.currentUser;
    const child = getStudentById(user.childId) ?? AppState.students[0];
    const risk = getRiskMeta(child.riskLevel);
    const screening = AppState.ldScreening;
    const insights = AppState.aiInsights;
    const timeline = AppState.progressTimeline;
    const myTasks = getTasksForStudent(child.id);
    const completedTasks = myTasks.filter(t => t.status[child.id] === 'completed').length;
    const learningStats = AppState.learningStats.find(item => item.studentId === child.id) ?? getLearningStatsForStudent(child.id);
    const todayLearning = learningStats.records[learningStats.records.length - 1] ?? { date: '-', lessons: 0, sessions: 0 };
    const weeklyLessons = learningStats.records.slice(-7).reduce((sum, record) => sum + record.lessons, 0);

    let pageTitle = 'แดชบอร์ดผู้ปกครอง';
    let pageSubtitle = `ติดตามเส้นทางการเรียนรู้ของ ${child.name}`;
    let bodyHTML = '';

    // ──────────────────────────────────────────
    // TAB: OVERVIEW
    // ──────────────────────────────────────────
    if (activeTab === 'parent') {
        bodyHTML = `
      <!-- WELCOME BANNER -->
      <div class="welcome-banner anim-slide-up" style="margin-bottom:var(--space-8);">
        <div class="welcome-text">
          <h2>สวัสดี ${user.name.split(' ')[0]}! 👨‍👦</h2>
          <p>${child.name} เรียนต่อเนื่องมาแล้ว <strong>${child.streak} วัน</strong> และมีพัฒนาการที่ดี ตรวจสอบข้อมูลเชิงลึกจาก AI วันนี้ได้ด้านล่าง</p>
          <div style="margin-top:var(--space-5);display:flex;gap:var(--space-3);">
            <button class="btn btn-primary" id="viewScreeningBtn">🧠 รายงาน LD</button>
            <button class="btn btn-ghost" style="border-color:rgba(255,255,255,0.3);color:#fff;" id="viewRiskAssessmentBtn">📝 ประเมินความเสี่ยง</button>
            <button class="btn btn-ghost" style="border-color:rgba(255,255,255,0.3);color:#fff;" id="viewProgressBtn">📈 ดูความก้าวหน้า</button>
          </div>
        </div>
        <div class="welcome-emoji">👨‍👦</div>
      </div>

      <!-- STATS ROW -->
      <div class="grid grid-4" style="margin-bottom:var(--space-8);">
        <div class="stat-card anim-slide-up" style="animation-delay:0.1s;">
          <div class="stat-icon" style="background:#D1FAE5;">📈</div>
          <div class="stat-value">${child.progress}%</div>
          <div class="stat-label">ความก้าวหน้าโดยรวม</div>
          <div class="stat-trend trend-up">↑ ${insights.weeklyChange} ในสัปดาห์นี้</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.15s;">
          <div class="stat-icon" style="background:#FFF0E6;">🔥</div>
          <div class="stat-value">${child.streak}</div>
          <div class="stat-label">เรียนต่อเนื่อง</div>
          <div class="stat-trend trend-up">↑ ทำได้ดีมาก!</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.2s;">
          <div class="stat-icon" style="background:#DBEAFE;">✅</div>
          <div class="stat-value">${completedTasks}/${myTasks.length}</div>
          <div class="stat-label">งานที่ทำเสร็จ</div>
          <div class="stat-trend">ภาคเรียนนี้</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.25s;">
          <div class="stat-icon" style="background:#EDE9FE;">📚</div>
          <div class="stat-value">${todayLearning.lessons}/${learningStats.dailyGoal}</div>
          <div class="stat-label">บทเรียนวันนี้</div>
          <div class="stat-trend trend-up">สัปดาห์นี้ ${weeklyLessons} บท</div>
        </div>
        <div class="stat-card anim-slide-up" style="animation-delay:0.3s;">
          <div class="stat-icon" style="background:#EDE9FE;">🧠</div>
          <div class="stat-value">${screening.confidence}%</div>
          <div class="stat-label">ความมั่นใจของ AI</div>
          <div class="stat-trend">คะแนนการคัดกรอง</div>
        </div>
      </div>

      <!-- AI INSIGHTS + CHILD PROFILE -->
      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:var(--space-6);margin-bottom:var(--space-8);">
        <!-- AI Insights Card -->
        <div class="card anim-slide-up" style="animation-delay:0.3s;">
          <div class="card-header">
            <span style="font-weight:700;color:var(--navy-900);">🤖 ข้อมูลการเรียนรู้จาก AI</span>
            <span class="badge badge-success">อัปเดตวันนี้</span>
          </div>
          <div style="padding:var(--space-5);">
            <p style="font-size:var(--text-sm);color:var(--slate-600);line-height:1.6;margin-bottom:var(--space-4);">${insights.headline}</p>
            <div style="display:flex;flex-direction:column;gap:var(--space-3);">
              ${insights.highlights.map(h => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) var(--space-4);background:var(--slate-50);border-radius:var(--radius-md);">
                  <span style="font-size:var(--text-xs);color:var(--slate-500);">${h.label}</span>
                  <span class="badge ${h.badge}">${h.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Child Profile Card -->
        <div class="card anim-slide-up" style="animation-delay:0.35s;">
          <div class="card-header">
            <span style="font-weight:700;color:var(--navy-900);">👤 ${child.name}</span>
            <span class="badge ${risk.badge}">ความเสี่ยง${risk.label}</span>
          </div>
          <div style="padding:var(--space-5);">
            <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5);">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--navy-100);display:flex;align-items:center;justify-content:center;font-size:32px;">${child.avatar}</div>
              <div>
                <div style="font-weight:700;color:var(--navy-900);">${child.name}</div>
                <div style="font-size:var(--text-xs);color:var(--slate-500);">${child.grade} · อายุ ${child.age} ปี</div>
              </div>
            </div>
            <div style="margin-bottom:var(--space-4);">
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
                <span style="font-size:var(--text-xs);color:var(--slate-500);">ความก้าวหน้าโดยรวม</span>
                <span style="font-size:var(--text-xs);font-weight:700;color:var(--navy-900);">${child.progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${child.progress}%;background:${risk.color};"></div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%;" id="viewScreeningBtn2">📋 ดูรายงานฉบับเต็ม</button>
          </div>
        </div>
      </div>

      <div class="card anim-slide-up" style="animation-delay:0.4s;margin-bottom:var(--space-8);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📚 สถิติการเรียนรายวัน</span>
          <span class="badge badge-info">วันนี้ ${todayLearning.lessons} บท</span>
        </div>
        <div class="learning-days" style="padding:var(--space-5);">
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
      </div>

      <!-- RECENT TASKS -->
      <div class="card anim-slide-up" style="animation-delay:0.5s;">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📋 งานที่ได้รับมอบหมายล่าสุด</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);">
          ${myTasks.slice(0, 3).map(t => {
            const done = t.status[child.id] === 'completed';
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) var(--space-4);background:var(--slate-50);border-radius:var(--radius-md);border-left:4px solid ${done ? 'var(--success)' : 'var(--warning)'};">
                <div>
                  <div style="font-size:var(--text-sm);font-weight:700;color:var(--navy-900);">${t.title}</div>
                  <div style="font-size:var(--text-xs);color:var(--slate-500);">กำหนดส่ง ${t.dueDate}</div>
                </div>
                <div style="display:flex;gap:var(--space-2);align-items:center;">
                  <span class="badge badge-info">${t.type}</span>
                  <span class="badge ${done ? 'badge-success' : 'badge-warning'}">${done ? 'เสร็จแล้ว' : 'รอทำ'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: LD SCREENING
    // ──────────────────────────────────────────
    } else if (activeTab === 'screening') {
        pageTitle = 'รายงานการคัดกรอง LD';
        pageSubtitle = `การประเมิน ${child.name} โดยใช้ AI ช่วยวิเคราะห์`;

        const statusColor = screening.overallStatus === 'review' ? 'var(--warning)' : 'var(--success)';
        const statusBadge = screening.overallStatus === 'review' ? 'badge-warning' : 'badge-success';

        bodyHTML = `
      <!-- SCREENING HEADER CARD -->
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">🧠 สรุปผลการคัดกรองด้วย AI</span>
          <span class="badge ${statusBadge}">${screening.overallStatus === 'review' ? 'ควรทบทวน' : 'ปกติ'}</span>
        </div>
        <div style="padding:var(--space-5);">
          <div style="display:flex;align-items:center;gap:var(--space-5);margin-bottom:var(--space-5);">
            <div style="text-align:center;padding:var(--space-4) var(--space-6);background:var(--slate-50);border-radius:var(--radius-lg);border:2px solid ${statusColor};">
              <div style="font-size:var(--text-3xl);font-weight:800;color:${statusColor};">${screening.confidence}%</div>
              <div style="font-size:var(--text-xs);color:var(--slate-500);margin-top:4px;">ความมั่นใจของ AI</div>
            </div>
            <div style="flex:1;">
              <p style="font-size:var(--text-sm);color:var(--slate-600);line-height:1.6;margin-bottom:var(--space-3);">${screening.summary}</p>
              <div style="font-size:var(--text-xs);color:var(--slate-400);">ประเมินล่าสุด: ${screening.lastAssessed}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- DOMAIN SCORES -->
      <div class="card anim-slide-up" style="animation-delay:0.1s;margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📊 ผลคะแนนแยกตามทักษะ</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-5);">
          ${screening.domains.map(d => {
            const domainBadge = d.flag === 'high' ? 'badge-danger' : d.flag === 'medium' ? 'badge-warning' : 'badge-success';
            const domainColor = d.flag === 'high' ? 'var(--danger)' : d.flag === 'medium' ? 'var(--warning)' : 'var(--success)';
            return `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <span style="font-size:20px;">${d.icon}</span>
                    <span style="font-size:var(--text-sm);font-weight:700;color:var(--navy-900);">${d.name}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <span style="font-size:var(--text-sm);font-weight:800;color:${domainColor};">${d.score}</span>
                    <span class="badge ${domainBadge}">${getRiskMeta(d.flag).label}</span>
                  </div>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width:${d.score}%;background:${domainColor};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="padding:0 var(--space-5) var(--space-5);">
          <div class="chart-canvas-wrap" style="height:220px;">
            <canvas id="domainRadarChart"></canvas>
          </div>
        </div>
      </div>

      <!-- RECOMMENDATIONS -->
      <div class="card anim-slide-up" style="animation-delay:0.2s;">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">✅ คำแนะนำ</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);">
          ${screening.recommendations.map((rec, i) => `
            <div style="display:flex;align-items:flex-start;gap:var(--space-4);padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-md);">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:800;color:#fff;flex-shrink:0;">${i + 1}</div>
              <p style="font-size:var(--text-sm);color:var(--slate-700);line-height:1.5;margin:0;">${rec}</p>
            </div>
          `).join('')}
          <button class="btn btn-primary btn-sm" style="margin-top:var(--space-2);align-self:flex-start;" id="shareReportBtn">🤝 แบ่งปันกับครู</button>
        </div>
      </div>
    `;


    // ──────────────────────────────────────────
    // TAB: RISK ASSESSMENT QUESTIONS
    // ──────────────────────────────────────────
    } else if (activeTab === 'risk-assessment') {
        pageTitle = 'คำถามประเมินความเสี่ยง';
        pageSubtitle = `แบบประเมินเบื้องต้นสำหรับผู้ปกครองของ ${child.name}`;

        const questions = [
            'อ่านออกเสียงคำใหม่ได้ยากกว่าที่คาดเมื่อเทียบกับวัย',
            'สับสนตัวอักษรหรือเสียงที่คล้ายกันบ่อย',
            'ใช้เวลาทำการบ้านด้านการอ่านนานกว่าปกติ',
            'หลีกเลี่ยงกิจกรรมที่ต้องอ่านหรือเขียน',
            'จำคำสั่งหลายขั้นตอนพร้อมกันได้ยาก',
            'เสียสมาธิง่ายระหว่างทำใบงาน',
        ];

        bodyHTML = `
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📝 แบบประเมินความเสี่ยงเบื้องต้น</span>
          <span class="badge badge-info">สำหรับผู้ปกครอง</span>
        </div>
        <div style="padding:var(--space-5);">
          <p style="font-size:var(--text-sm);color:var(--slate-600);line-height:1.6;margin-bottom:var(--space-5);">ตอบจากพฤติกรรมที่สังเกตเห็นในช่วง 2 สัปดาห์ที่ผ่านมา ผลนี้เป็นข้อมูลประกอบการติดตาม ไม่ใช่การวินิจฉัยทางการแพทย์</p>
          <div id="riskQuestionList" style="display:flex;flex-direction:column;gap:var(--space-4);">
            ${questions.map((question, index) => `
              <div class="risk-question" data-question="${index}">
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--navy-900);line-height:1.5;">${index + 1}. ${question}</div>
                <div class="risk-options">
                  <label><input type="radio" name="risk-q-${index}" value="0" checked /> ไม่ค่อยพบ</label>
                  <label><input type="radio" name="risk-q-${index}" value="1" /> บางครั้ง</label>
                  <label><input type="radio" name="risk-q-${index}" value="2" /> บ่อยครั้ง</label>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:var(--space-5);display:flex;gap:var(--space-3);flex-wrap:wrap;">
            <button class="btn btn-primary" id="calculateRiskBtn">คำนวณผลประเมิน</button>
            <button class="btn btn-ghost" id="shareRiskBtn">ส่งผลให้ผู้เชี่ยวชาญ</button>
          </div>
        </div>
      </div>

      <div class="card anim-slide-up" style="animation-delay:0.12s;">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📊 ผลประเมินล่าสุด</span>
        </div>
        <div class="risk-result-layout">
          <div id="riskScoreBox" style="text-align:center;padding:var(--space-5);background:var(--slate-50);border-radius:var(--radius-lg);border:2px solid var(--slate-100);">
            <div style="font-size:28px;font-weight:800;color:var(--navy-900);" id="riskScoreValue">0</div>
            <div style="font-size:var(--text-xs);color:var(--slate-500);">คะแนนจาก 12</div>
          </div>
          <div>
            <div id="riskResultTitle" style="font-weight:800;color:var(--navy-900);margin-bottom:var(--space-2);">ยังไม่ได้คำนวณ</div>
            <p id="riskResultText" style="font-size:var(--text-sm);color:var(--slate-600);line-height:1.6;margin:0;">กดปุ่มคำนวณหลังตอบคำถามครบ ระบบจะแนะนำขั้นตอนถัดไปให้เหมาะกับระดับความเสี่ยง</p>
          </div>
        </div>
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: PROGRESS
    // ──────────────────────────────────────────
    } else if (activeTab === 'progress') {
        pageTitle = 'ไทม์ไลน์ความก้าวหน้า';
        pageSubtitle = `พัฒนาการเรียนรู้ของ ${child.name} ตามช่วงเวลา`;
        bodyHTML = `
      <!-- TREND CHART -->
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📈 ความก้าวหน้าตามช่วงเวลา</span>
          <span class="badge badge-success">↑ ${insights.weeklyChange} ในสัปดาห์นี้</span>
        </div>
        <div class="chart-canvas-wrap" style="padding:var(--space-4);">
          <canvas id="progressLineChart"></canvas>
        </div>
      </div>

      <div class="card anim-slide-up" style="animation-delay:0.05s;margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📚 จำนวนบทเรียนที่เรียนในแต่ละวัน</span>
          <span class="badge badge-success">รวม ${weeklyLessons} บท</span>
        </div>
        <div class="learning-days" style="padding:var(--space-5);">
          ${learningStats.records.slice(-7).map(record => {
              const pct = Math.min(Math.round((record.lessons / learningStats.dailyGoal) * 100), 100);
              return `
                <div class="learning-day">
                  <div class="learning-day-date">${record.date.slice(5)}</div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width:${pct}%;background:var(--success);"></div>
                  </div>
                  <div class="learning-day-count">${record.lessons} บท</div>
                </div>
              `;
          }).join('')}
        </div>
      </div>

      <!-- TASK PROGRESS -->
      <div class="card anim-slide-up" style="animation-delay:0.1s;margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">📋 ความคืบหน้าของงาน</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);">
          ${myTasks.map(t => {
            const done = t.status[child.id] === 'completed';
            return `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                  <span style="font-size:var(--text-sm);font-weight:700;color:var(--navy-900);">${t.title}</span>
                  <div style="display:flex;gap:var(--space-2);">
                    <span class="badge badge-info">${t.type}</span>
                    <span class="badge ${done ? 'badge-success' : 'badge-warning'}">${done ? 'เสร็จแล้ว' : 'รอทำ'}</span>
                  </div>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width:${done ? 100 : 0}%;background:${done ? 'var(--success)' : 'var(--slate-200)'};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- MONTHLY SUMMARY STATS -->
      <div class="grid grid-3 anim-slide-up" style="animation-delay:0.2s;">
        <div class="stat-card">
          <div class="stat-icon" style="background:#D1FAE5;">🎯</div>
          <div class="stat-value">${timeline.overall[timeline.overall.length - 1]}%</div>
          <div class="stat-label">คะแนนรวมปัจจุบัน</div>
          <div class="stat-trend trend-up">↑ จาก ${timeline.overall[0]}% ในเดือนมกราคม</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#DBEAFE;">📖</div>
          <div class="stat-value">${timeline.reading[timeline.reading.length - 1]}%</div>
          <div class="stat-label">คะแนนการอ่าน</div>
          <div class="stat-trend trend-up">↑ กำลังพัฒนาขึ้น</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#EDE9FE;">🧩</div>
          <div class="stat-value">${todayLearning.lessons}</div>
          <div class="stat-label">บทเรียนวันนี้</div>
          <div class="stat-trend trend-up">เป้าหมาย ${learningStats.dailyGoal} บท</div>
        </div>
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: SHARED INSIGHTS
    // ──────────────────────────────────────────
    } else if (activeTab === 'shared') {
        pageTitle = 'ข้อมูลที่แบ่งปัน';
        pageSubtitle = 'บันทึกและข้อสังเกตที่ครูแบ่งปัน';
        bodyHTML = `
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">🤝 บันทึกจากครู</span>
          <span class="badge badge-info">ใหม่ 2 รายการ</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);">
          ${[
            { from: 'คุณครูซาราห์ เฉิน', emoji: '👩‍🏫', date: '2026-06-18', note: `${child.name} มีพัฒนาการด้านสระและการสะกดคำดีขึ้น โปรดส่งเสริมให้ฝึกฝนทุกวันต่อไป`, type: 'badge-success', label: 'พัฒนาการดี' },
            { from: 'คุณครูซาราห์ เฉิน', emoji: '👩‍🏫', date: '2026-06-14', note: 'โปรดทบทวนใบงานการออกเสียงที่ส่งกลับบ้านเมื่อวันพฤหัสบดี การฝึกอ่านออกเสียงทุกวันอย่างสม่ำเสมอจะช่วยได้มาก', type: 'badge-warning', label: 'ควรดำเนินการ' },
          ].map(item => `
            <div style="padding:var(--space-4);background:var(--slate-50);border-radius:var(--radius-lg);border-left:4px solid var(--accent);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <span style="font-size:20px;">${item.emoji}</span>
                  <span style="font-size:var(--text-xs);font-weight:700;color:var(--navy-900);">${item.from}</span>
                </div>
                <div style="display:flex;gap:var(--space-2);align-items:center;">
                  <span class="badge ${item.type}">${item.label}</span>
                  <span style="font-size:var(--text-xs);color:var(--slate-400);">${item.date}</span>
                </div>
              </div>
              <p style="font-size:var(--text-sm);color:var(--slate-600);line-height:1.5;margin:0;">${item.note}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // ──────────────────────────────────────────
    // TAB: MESSAGES
    // ──────────────────────────────────────────
    } else if (activeTab === 'messages') {
        pageTitle = 'ข้อความ';
        pageSubtitle = 'สื่อสารกับครูและผู้เชี่ยวชาญโดยตรง';
        bodyHTML = `
      <div class="card anim-slide-up" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <span style="font-weight:700;color:var(--navy-900);">💬 สนทนากับครูและผู้เชี่ยวชาญ</span>
        </div>
        <div style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4);max-height:360px;overflow-y:auto;" id="messageThread">
          <div style="align-self:flex-start;max-width:75%;">
            <div style="background:var(--slate-100);padding:var(--space-3) var(--space-4);border-radius:0 var(--radius-lg) var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:var(--navy-900);line-height:1.5;">
              สวัสดี David! วันนี้ ${child.name} ทำกิจกรรมฝึกออกเสียงได้ดีมาก ฝากฝึกอ่านก่อนนอนต่อไปนะคะ
            </div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:4px;padding-left:4px;">คุณครู Chen · 17 มิ.ย.</div>
          </div>
          <div style="align-self:flex-end;max-width:75%;">
            <div style="background:var(--accent);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg) 0 var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:#fff;line-height:1.5;">
              ขอบคุณครับ เราฝึกอ่านกันทุกคืน สัปดาห์นี้มีเรื่องใดที่ควรเน้นเป็นพิเศษไหมครับ
            </div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:4px;text-align:right;padding-right:4px;">คุณ · 17 มิ.ย.</div>
          </div>
          <div style="align-self:flex-start;max-width:75%;">
            <div style="background:var(--slate-100);padding:var(--space-3) var(--space-4);border-radius:0 var(--radius-lg) var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:var(--navy-900);line-height:1.5;">
              เน้นการผสมเสียงพยัญชนะคู่ ch, sh และ th นะคะ ครูอัปโหลดใบงานไว้ในเมนูงานแล้ว
            </div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:4px;padding-left:4px;">คุณครู Chen · 18 มิ.ย.</div>
          </div>
          <div style="align-self:flex-start;max-width:75%;">
            <div style="background:#ECFDF5;padding:var(--space-3) var(--space-4);border-radius:0 var(--radius-lg) var(--radius-lg) var(--radius-lg);font-size:var(--text-sm);color:var(--navy-900);line-height:1.5;">
              ดิฉันเป็นผู้เชี่ยวชาญด้านการเรียนรู้ค่ะ หากต้องการส่งผลคำถามประเมินความเสี่ยง สามารถส่งมาให้ช่วยดูแผนติดตามต่อได้เลย
            </div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:4px;padding-left:4px;">ดร.มีนา · 18 มิ.ย.</div>
          </div>
        </div>
        <div style="padding:var(--space-4) var(--space-5);border-top:1px solid var(--slate-100);display:flex;gap:var(--space-3);">
          <input class="form-input" id="msgInput" placeholder="เขียนข้อความ…" style="flex:1;" />
          <button class="btn btn-primary btn-sm" id="sendMsgBtn">ส่ง ✉️</button>
        </div>
      </div>
    `;
    }

    buildShell(container, {
        role: 'parent',
        user,
        navItems: NAV,
        activeItem: activeTab,
        pageTitle,
        pageSubtitle,
        bodyHTML,
    });

    // Init charts and events after DOM is ready
    if (activeTab === 'screening') initDomainChart(screening);
    if (activeTab === 'progress') initProgressChart(timeline);
    setupParentEvents();
}

// ──────────────────────────────────────────
// CHART: Domain Radar (Screening tab)
// ──────────────────────────────────────────
function initDomainChart(screening) {
    const ctx = document.getElementById('domainRadarChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: screening.domains.map(d => d.name),
            datasets: [{
                label: 'คะแนน',
                data: screening.domains.map(d => d.score),
                backgroundColor: 'rgba(59,130,246,0.15)',
                borderColor: 'rgba(59,130,246,0.8)',
                borderWidth: 2,
                pointBackgroundColor: screening.domains.map(d =>
                    d.flag === 'high' ? 'rgba(239,68,68,0.9)' :
                    d.flag === 'medium' ? 'rgba(245,158,11,0.9)' :
                    'rgba(16,185,129,0.9)'
                ),
                pointRadius: 5,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0, max: 100,
                    ticks: { stepSize: 25, font: { size: 10, family: 'Noto Sans Thai' }, color: '#94A3B8' },
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    pointLabels: { font: { size: 11, family: 'Noto Sans Thai', weight: '600' }, color: '#374359' },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0A1628',
                    callbacks: { label: ctx => ` คะแนน: ${ctx.raw}` },
                },
            },
        },
    });
}

// ──────────────────────────────────────────
// CHART: Progress Line (Progress tab)
// ──────────────────────────────────────────
function initProgressChart(timeline) {
    const ctx = document.getElementById('progressLineChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeline.labels,
            datasets: [
                {
                    label: 'คะแนนรวม',
                    data: timeline.overall,
                    borderColor: 'rgba(59,130,246,0.9)',
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(59,130,246,0.9)',
                },
                {
                    label: 'การอ่าน',
                    data: timeline.reading,
                    borderColor: 'rgba(16,185,129,0.8)',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(16,185,129,0.8)',
                },
                {
                    label: 'สระ',
                    data: timeline.vowels,
                    borderColor: 'rgba(245,158,11,0.8)',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(245,158,11,0.8)',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { font: { family: 'Noto Sans Thai', size: 11 }, color: '#374359', boxWidth: 12 },
                },
                tooltip: {
                    backgroundColor: '#0A1628',
                    callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` },
                },
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { color: '#94A3B8', font: { family: 'Noto Sans Thai', size: 11 } },
                },
                y: {
                    min: 0, max: 100,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { callback: v => v + '%', color: '#94A3B8', font: { family: 'Noto Sans Thai', size: 11 } },
                },
            },
        },
    });
}

// ──────────────────────────────────────────
// EVENT HANDLERS
// ──────────────────────────────────────────
function setupParentEvents() {
    document.getElementById('viewScreeningBtn')?.addEventListener('click', () => navigate('screening'));
    document.getElementById('viewScreeningBtn2')?.addEventListener('click', () => navigate('screening'));
    document.getElementById('viewProgressBtn')?.addEventListener('click', () => navigate('progress'));
    document.getElementById('viewRiskAssessmentBtn')?.addEventListener('click', () => navigate('risk-assessment'));

    document.getElementById('shareReportBtn')?.addEventListener('click', () => {
        showToast('แบ่งปันรายงานแล้ว 🤝', 'ส่งสรุปผลการคัดกรอง LD ให้คุณครูซาราห์ เฉินแล้ว', 'success');
    });


    document.getElementById('calculateRiskBtn')?.addEventListener('click', () => {
        const values = [...document.querySelectorAll('#riskQuestionList input[type="radio"]:checked')]
            .map(input => Number(input.value));
        const score = values.reduce((sum, value) => sum + value, 0);
        const scoreValue = document.getElementById('riskScoreValue');
        const scoreBox = document.getElementById('riskScoreBox');
        const resultTitle = document.getElementById('riskResultTitle');
        const resultText = document.getElementById('riskResultText');

        let title = 'ความเสี่ยงต่ำ';
        let text = 'ติดตามต่อเนื่องและรักษากิจวัตรการอ่านวันละเล็กน้อย หากมีพฤติกรรมเพิ่มขึ้นให้ประเมินซ้ำ';
        let border = 'var(--success)';

        if (score >= 8) {
            title = 'ควรปรึกษาผู้เชี่ยวชาญ';
            text = 'พบสัญญาณหลายด้าน แนะนำส่งผลประเมินให้ผู้เชี่ยวชาญและนัดติดตามเพื่อวางแผนช่วยเหลือ';
            border = 'var(--danger)';
        } else if (score >= 4) {
            title = 'ควรติดตามใกล้ชิด';
            text = 'มีสัญญาณบางด้าน แนะนำฝึกอ่านอย่างสม่ำเสมอและประเมินซ้ำใน 2 สัปดาห์';
            border = 'var(--warning)';
        }

        if (scoreValue) scoreValue.textContent = score;
        if (scoreBox) scoreBox.style.borderColor = border;
        if (resultTitle) resultTitle.textContent = title;
        if (resultText) resultText.textContent = text;
        showToast('คำนวณผลประเมินแล้ว', `${title} · คะแนน ${score}/12`, score >= 8 ? 'warning' : 'success');
    });

    document.getElementById('shareRiskBtn')?.addEventListener('click', () => {
        showToast('ส่งผลให้ผู้เชี่ยวชาญแล้ว', 'ผู้เชี่ยวชาญจะเห็นข้อมูลประกอบการติดตามนักเรียน', 'success');
    });

    const sendBtn = document.getElementById('sendMsgBtn');
    const msgInput = document.getElementById('msgInput');
    sendBtn?.addEventListener('click', () => {
        const text = msgInput?.value.trim();
        if (!text) return;

        const thread = document.getElementById('messageThread');
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
        showToast('ส่งข้อความแล้ว ✉️', 'ระบบจะแจ้งเตือนคุณครูซาราห์ เฉิน', 'success');
    });

    msgInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('sendMsgBtn')?.click();
    });
}
