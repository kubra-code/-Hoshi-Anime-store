<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(query = {}) {
  router.push({ path: '/', query })
}
</script>

<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="footer-col brand-col">
        <img src="/logo.png" alt="Hoshi Anime Store" class="footer-logo" />
        <p>وجهتك الأولى لكل منتجات الأنمي في مصر — فيجرز، تيشيرتات، إكسسوارات وأكتر.</p>
      </div>

      <div class="footer-col">
        <h4>روابط سريعة</h4>
        <a href="#" @click.prevent="goHome()">الرئيسية</a>
        <a href="#" @click.prevent="goHome()">كل المنتجات</a>
        <a href="#" @click.prevent="goHome({ sale: 'true' })">العروض</a>
      </div>

      <div class="footer-col">
        <h4>تابعنا</h4>
        <div class="socials">
          <a href="https://www.instagram.com/hoshi_anime_store" target="_blank" rel="noopener" aria-label="إنستجرام" class="social-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.8"></rect>
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"></circle>
              <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"></circle>
            </svg>
          </a>
          <a href="https://www.facebook.com/HoshiAnimeStores" target="_blank" rel="noopener" aria-label="فيسبوك" class="social-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8.5h2.5V5.3c-.43-.06-1.9-.19-3.6-.19-3.57 0-6 2.24-6 6.35v3.04H3.5V18h3.4v10h4.1V18h3.27l.52-3.5H11V10.9c0-.94.25-1.9 2-1.9Z" fill="currentColor"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 Hoshi Anime Store. جميع الحقوق محفوظة.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 60px;
  background: var(--surface);
  border-top: 2px solid var(--accent);
}

.footer-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 32px;
}

.footer-col h4 {
  margin: 0 0 14px;
  font-size: 0.95rem;
  font-weight: 800;
}

.footer-col a {
  display: block;
  color: var(--muted);
  font-size: 0.88rem;
  margin-bottom: 10px;
}
.footer-col a:hover {
  color: var(--accent);
}

.brand-col p {
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.7;
  max-width: 320px;
  margin: 0;
}

.footer-logo {
  height: 34px;
  margin-bottom: 14px;
  display: block;
}

.socials {
  display: flex;
  gap: 10px;
}
.social-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.15s ease;
}
.social-icon svg {
  width: 18px;
  height: 18px;
}
.social-icon:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding: 16px 32px;
  text-align: center;
}
.footer-bottom p {
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
}

@media (max-width: 700px) {
  .footer-main {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .brand-col p {
    margin: 0 auto;
  }
  .socials {
    justify-content: center;
  }
}
</style>