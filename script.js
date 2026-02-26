/* ============================================================
   GuiDev Portfolio â€” script.js
   All interactive features: particles, cursor, typing, scroll,
   animations, navbar, mobile menu, form validation
   ============================================================ */

'use strict';

/* ===== LOADING SCREEN ===== */
(function initLoader() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  document.body.classList.add('loading');

  // Hide loading screen after animation finishes (~2.2s)
  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('hidden');
      document.body.classList.remove('loading');

      // Trigger hero fade-ins after loader hides
      document.querySelectorAll('#hero .fade-in').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 150);
      });

      // Start counter animation
      animateCounters();
    }, 2400);
  });
})();


/* ===== PARTICLE BACKGROUND ===== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const CONFIG = {
    count: 80,
    maxRadius: 2.5,
    minRadius: 0.5,
    speed: 0.3,
    colors: ['rgba(124,58,237,', 'rgba(37,99,235,', 'rgba(167,139,250,', 'rgba(96,165,250,'],
    connectDistance: 130,
    mouseRepelRadius: 100,
    mouseRepelForce: 0.8,
  };

  let mouse = { x: -999, y: -999 };

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomColor() {
    const c = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    const a = (Math.random() * 0.5 + 0.2).toFixed(2);
    return c + a + ')';
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
      r: Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius,
      color: randomColor(),
      alpha: Math.random() * 0.6 + 0.2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDistance) {
          const opacity = (1 - dist / CONFIG.connectDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function update(p) {
    // Mouse repulsion
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CONFIG.mouseRepelRadius && dist > 0) {
      const force = (CONFIG.mouseRepelRadius - dist) / CONFIG.mouseRepelRadius;
      p.vx += (dx / dist) * force * CONFIG.mouseRepelForce * 0.05;
      p.vy += (dy / dist) * force * CONFIG.mouseRepelForce * 0.05;
    }

    // Damping
    p.vx *= 0.99;
    p.vy *= 0.99;

    // Clamp speed
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > CONFIG.speed * 3) {
      p.vx = (p.vx / speed) * CONFIG.speed * 3;
      p.vy = (p.vy / speed) * CONFIG.speed * 3;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Bounce off edges
    if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
    if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { update(p); drawParticle(p); });
    connectParticles();
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', init);
})();

/* ===== NAVBAR SCROLL EFFECT ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ===== MOBILE HAMBURGER MENU ===== */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
})();

/* ===== TYPING EFFECT ===== */
(function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'Desenvolvedor de Bots para Discord',
    'Especialista em Sistemas Automatizados',
    'Especialista em Integração de APIs',
    'Especialista em Automação de Comunidades',
    'Desenvolvedor de Sistemas para VTC',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let typingSpeed = 80;

  function type() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 2000; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400; // pause before next phrase
    }

    setTimeout(type, typingSpeed);
  }

  // Start typing after loader
  setTimeout(type, 2800);
})();

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===== SCROLL REVEAL ANIMATIONS ===== */
(function initScrollReveal() {
  const revealItems = document.querySelectorAll('.scroll-reveal');
  if (!revealItems.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...entry.target.parentElement.querySelectorAll('.scroll-reveal')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealItems.forEach(item => observer.observe(item));
})();

/* ===== SKILL BARS ANIMATION ===== */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ===== COUNTER ANIMATION ===== */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const duration = 2000;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, stepTime);
  });
}


// ===== CAROUSEL INTELIGENTE =====

const carousel = document.querySelector(".carousel");
const track = document.querySelector(".carousel-track");

let position = 0;
let direction = 1; // 1 = direita | -1 = esquerda
let speed = 0.5;
let isHovering = false;

function animateCarousel() {
  if (!isHovering) {
    position += speed * direction;

    const maxScroll = track.scrollWidth - carousel.offsetWidth;

    if (position >= maxScroll) direction = -1;
    if (position <= 0) direction = 1;
  } else {
    // suavização
    position += (targetPosition - position) * 0.08;
  }

  track.style.transform = `translateX(-${position}px)`;
  requestAnimationFrame(animateCarousel);
}

let targetPosition = 0;

// Só ativa animação no desktop
if (window.innerWidth > 768) {

  animateCarousel();

  carousel.addEventListener("mousemove", (e) => {
    isHovering = true;

    const rect = carousel.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = mouseX / rect.width;

    const maxScroll = track.scrollWidth - carousel.offsetWidth;
    targetPosition = maxScroll * percent;
  });

  carousel.addEventListener("mouseleave", () => {
    isHovering = false;
  });

}


// ===== LIGHTBOX =====

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".lightbox-close");

document.querySelectorAll(".carousel-item img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "auto";
}

closeBtn.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (e) => {
  if (e.target !== lightboxImg) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
  }
});





/* ===== CONTACT FORM VALIDATION ===== */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (field) field.classList.add('error');
    if (error) error.textContent = message;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (field) field.classList.remove('error');
    if (error) error.textContent = '';
  }

  function validateForm() {
    let valid = true;

    // Name
    const name = document.getElementById('name').value.trim();
    if (!name) {
      showError('name', 'Por favor digite seu nome.');
      valid = false;
    } else if (name.length < 2) {
      showError('name', 'O nome deve ter pelo menos 2 caracteres.');
      valid = false;
    } else {
      clearError('name');
    }

    // Email
    const email = document.getElementById('email').value.trim();
    if (!email) {
      showError('email', 'Por favor insira seu e-mail.');
      valid = false;
    } else if (!emailRegex.test(email)) {
      showError('email', 'Por favor, insira um endereço de e-mail válido.');
      valid = false;
    } else {
      clearError('email');
    }

    // Phone
    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
      showError('phone', 'Por favor insira seu telefone.');
      valid = false;
    } else if (!phoneRegex.test(phone)) {
      showError('phone', 'Por favor insira um telefone válido.');
      valid = false;
    } else {
      clearError('phone');
    }

    // Message
    const message = document.getElementById('message').value.trim();
    if (!message) {
      showError('message', 'Por favor, descreva seu projeto.');
      valid = false;
    } else if (message.length < 10) {
      showError('message', 'A mensagem deve ter pelo menos 10 caracteres.');
      valid = false;
    } else {
      clearError('message');
    }

    return valid;
  }

  // Live validation on blur
  ['name', 'email', 'phone', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearError(id));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // sempre bloqueia redirecionamento

    if (!validateForm()) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg> Enviando...
    `;
    btn.disabled = true;

    const formData = new FormData(form);

    try {
      const response = await fetch("https://formsubmit.co/ajax/contato@guidevbot.com.br", {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (response.ok) {
        form.reset();

        const success = document.getElementById('form-success');
        if (success) {
          success.style.display = 'flex';
          setTimeout(() => success.style.display = 'none', 5000);
        }
      } else {
        alert("Erro ao enviar. Tente novamente.");
      }

    } catch (error) {
      alert("Erro ao enviar. Verifique sua conexão.");
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
  });


})();

/* ===== ACTIVE NAV LINK ON SCROLL ===== */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) link.classList.add('active');
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
})();

/* ===== CONSOLE EASTER EGG ===== */
console.log('%c{GUi.Dev}', 'color:#7c3aed;font-size:2rem;font-weight:900;font-family:monospace;');
console.log('%cCode. Create. Automate.', 'color:#60a5fa;font-size:1rem;font-family:monospace;');
console.log('%c\nLooking for a skilled Discord bot developer?\nContact: contato@guidevbot.com.br', 'color:#94a3b8;font-size:0.85rem;');
