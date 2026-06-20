// ============================================
// DEK ALL — Login Screen
// ============================================
import { users } from './mockData.js';
import { showToast } from './utils/toast.js';

const DEMO_PASSWORD = 'demo123';

export function renderLogin(container, onLogin) {
    container.innerHTML = `
        <main class="login-page">
            <section class="login-hero">
                <div class="login-brand">
                    <img class="brand-logo" src="./assets/dek-all-logo.png" alt="Dek All logo" />
                    <div>
                        <div class="login-brand-name">Dek All</div>
                        <div class="login-brand-subtitle">แพลตฟอร์มการเรียนรู้</div>
                    </div>
                </div>
                <div class="login-hero-content">
                    <span class="login-kicker">เรียนรู้ · เติบโต · เชื่อมต่อ</span>
                    <h1>พื้นที่การเรียนรู้สำหรับทุกคน</h1>
                    <p>เชื่อมต่อครู ผู้ปกครอง นักเรียน และผู้เชี่ยวชาญ พร้อมติดตามพัฒนาการในที่เดียว</p>
                    <div class="login-feature-list">
                        <span>✓ จัดการงานและบทเรียน</span>
                        <span>✓ ติดตามความก้าวหน้า</span>
                        <span>✓ วิเคราะห์ข้อมูลการเรียนรู้</span>
                    </div>
                </div>
            </section>

            <section class="login-panel">
                <form class="login-card" id="loginForm">
                    <div class="login-heading">
                        <img class="login-mobile-logo" src="./assets/dek-all-logo.png" alt="Dek All logo" />
                        <h2>เข้าสู่ระบบ</h2>
                        <p>เลือกประเภทผู้ใช้งานและกรอกข้อมูลเพื่อดำเนินการต่อ</p>
                    </div>

                    <fieldset class="role-options">
                        <legend>เข้าสู่ระบบในฐานะ</legend>
                        ${renderRoleOption('teacher', '👩‍🏫', 'ครู')}
                        ${renderRoleOption('parent', '👨‍👦', 'ผู้ปกครอง')}
                        ${renderRoleOption('student', '🧒', 'นักเรียน')}
                        ${renderRoleOption('expert', '🏥', 'ผู้เชี่ยวชาญ')}
                    </fieldset>

                    <div class="form-group">
                        <label class="form-label" for="loginEmail">อีเมล</label>
                        <input class="form-input login-input" id="loginEmail" type="email"
                            autocomplete="username" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="loginPassword">รหัสผ่าน</label>
                        <div class="password-field">
                            <input class="form-input login-input" id="loginPassword" type="password"
                                value="${DEMO_PASSWORD}" autocomplete="current-password" required />
                            <button class="password-toggle" id="passwordToggle" type="button">แสดง</button>
                        </div>
                    </div>

                    <button class="btn btn-primary btn-full login-submit" type="submit">
                        เข้าสู่ระบบ <span>→</span>
                    </button>
                    <p class="login-demo-note">
                        บัญชีสาธิตจะเปลี่ยนอีเมลตามบทบาท · รหัสผ่าน:
                        <strong>${DEMO_PASSWORD}</strong>
                    </p>
                </form>
            </section>
        </main>
    `;

    const form = container.querySelector('#loginForm');
    const emailInput = container.querySelector('#loginEmail');
    const passwordInput = container.querySelector('#loginPassword');
    const passwordToggle = container.querySelector('#passwordToggle');

    const syncDemoEmail = () => {
        emailInput.value = users[form.elements.loginRole.value].email;
    };

    container.querySelectorAll('input[name="loginRole"]')
        .forEach(input => input.addEventListener('change', syncDemoEmail));
    syncDemoEmail();

    passwordToggle.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        passwordToggle.textContent = isHidden ? 'ซ่อน' : 'แสดง';
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        const role = form.elements.loginRole.value;
        const email = emailInput.value.trim().toLowerCase();

        if (email !== users[role].email.toLowerCase() || passwordInput.value !== DEMO_PASSWORD) {
            showToast('เข้าสู่ระบบไม่สำเร็จ', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'danger');
            return;
        }

        sessionStorage.setItem('dekall-session', JSON.stringify({ role, email }));
        showToast('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${users[role].name}`, 'success');
        onLogin(role);
    });
}

function renderRoleOption(value, icon, label) {
    return `
        <label class="role-option">
            <input type="radio" name="loginRole" value="${value}" ${value === 'teacher' ? 'checked' : ''} />
            <span class="role-option-content">
                <span class="role-option-icon">${icon}</span>
                <span>${label}</span>
            </span>
        </label>
    `;
}
