/*
 * purah_optimized.js
 *
 * Este arquivo contém toda a lógica de interação do advertorial
 * PURAH. O código foi modularizado e otimizado para não bloquear
 * a renderização. Carrega elementos pesados sob demanda através
 * do IntersectionObserver, atualiza contadores em intervalos e
 * gerencia a visibilidade de CTAs dinâmicos. Tudo foi pensado
 * para melhorar a experiência de leitura e impulsionar
 * conversões, mantendo baixo o consumo de dados em redes lentas.
 */

(function () {
  // Atualiza o relógio no ticker de notícias
  function pad2(n) { return n < 10 ? '0' + n : n; }
  function updateClock() {
    const now = new Date();
    const h = document.getElementById('bn-hour');
    const m = document.getElementById('bn-minute');
    const s = document.getElementById('bn-second');
    if (!h || !m || !s) return;
    h.textContent = pad2(now.getHours());
    m.textContent = pad2(now.getMinutes());
    s.textContent = pad2(now.getSeconds());
  }
  function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Atualiza a barra de progresso de leitura
  function updateScrollProgress() {
    const progressEl = document.getElementById('scroll-progress');
    const labelEl = document.getElementById('progress-label');
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY / total;
    if (progressEl) progressEl.style.width = (scrolled * 100) + '%';
    if (labelEl) labelEl.textContent = Math.round(scrolled * 100) + '% lido';
    // Exibir CTA flutuante
    const floatingCta = document.getElementById('floating-cta');
    const scrollTopBtn = document.getElementById('scroll-top');
    const whatsappBtn = document.getElementById('whatsapp-support');
    if (floatingCta) {
      if (window.scrollY > 800) {
        floatingCta.style.display = 'block';
      } else {
        floatingCta.style.display = 'none';
      }
    }
    if (scrollTopBtn) {
      scrollTopBtn.style.display = window.scrollY > 800 ? 'flex' : 'none';
    }
    if (whatsappBtn) {
      whatsappBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }
  }

  // Atualiza contador de visitantes
  function updateViewerCount() {
    const viewerEl = document.getElementById('viewer-count');
    if (viewerEl) {
      const count = Math.floor(Math.random() * 30) + 15;
      viewerEl.textContent = count + ' pessoas estão vendo esta oferta agora';
    }
  }

  // Atualiza contagem regressiva
  let remaining = 15 * 60; // 15 minutos em segundos
  function updateCountdown() {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');
    const timerEl = document.getElementById('countdown-timer');
    const floatingEl = document.getElementById('floating-countdown');
    if (timerEl) timerEl.textContent = minutes + ':' + seconds;
    if (floatingEl) floatingEl.textContent = minutes + ':' + seconds;
    document.title = '(' + minutes + ':' + seconds + ') ' + document.title.replace(/^\(\d{2}:\d{2}\)\s*/, '');
    if (remaining > 0) remaining--;
  }

  // Exibe toast de compra com nomes aleatórios
  const buyers = ['Maria (SP)', 'Ana (RJ)', 'Cláudia (MG)', 'Patrícia (BA)', 'Luciana (PR)', 'Fernanda (PE)'];
  function showPurchaseToast() {
    const toastEl = document.getElementById('purchase-toast');
    if (!toastEl) return;
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    toastEl.textContent = buyer + ' acabou de comprar PURAH';
    toastEl.classList.remove('hidden');
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
      toastEl.classList.add('hidden');
    }, 5000);
  }

  // Redução de estoque
  function reduceStock() {
    const stockEl = document.getElementById('stock-number');
    if (!stockEl) return;
    let stock = parseInt(stockEl.textContent.trim(), 10);
    if (isNaN(stock)) stock = 24;
    if (stock > 7) {
      stock--;
      stockEl.textContent = stock;
    }
  }

  // Exit intent modal
  let exitShown = false;
  function showExitModal() {
    if (exitShown) return;
    const modal = document.getElementById('exit-modal');
    if (modal) {
      modal.classList.remove('hidden');
      exitShown = true;
    }
  }

  // Copiar cupom
  function handleCouponCopy() {
    const couponBtn = document.getElementById('copy-coupon');
    const couponCode = document.getElementById('coupon-code');
    const couponToast = document.getElementById('coupon-toast');
    if (!couponBtn || !couponCode || !couponToast) return;
    couponBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(couponCode.textContent).then(() => {
          couponToast.classList.remove('hidden');
          setTimeout(() => {
            couponToast.classList.add('hidden');
          }, 2000);
        });
      }
    });
  }

  // Atualizar data atual no elemento #data-hoje
  function updateDate() {
    const dateEl = document.getElementById('data-hoje');
    if (!dateEl) return;
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    dateEl.textContent = `${dia}/${mes}/${ano}`;
    dateEl.setAttribute('datetime', `${ano}-${mes}-${dia}`);
  }

  // Geolocalização para cidade
  function updateCity() {
    const citySpan = document.getElementById('user-city');
    const noticeEl = document.getElementById('shipping-notice');
    if (!citySpan || !noticeEl) return;
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data && data.city) {
          citySpan.textContent = data.city;
          noticeEl.classList.remove('hidden');
        }
      })
      .catch(() => { /* silencioso */ });
  }

  // Lazy load comments via IntersectionObserver
  function initComments() {
    const placeholder = document.getElementById('comments-placeholder');
    const template = document.getElementById('comments-template');
    if (!placeholder || !template) return;
    function loadComments() {
      const clone = template.content.cloneNode(true);
      placeholder.replaceWith(clone);
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadComments();
            obs.disconnect();
          }
        });
      }, { rootMargin: '200px 0px', threshold: 0 });
      observer.observe(placeholder);
    } else {
      loadComments();
    }
  }

  // Lazy load Lottie animations
  function initLottie() {
    const players = document.querySelectorAll('lottie-player');
    players.forEach(player => {
      const src = player.getAttribute('src');
      if (src) {
        player.setAttribute('data-src', src);
        player.removeAttribute('src');
      }
    });
    function loadPlayer(player) {
      const dataSrc = player.getAttribute('data-src');
      if (dataSrc && !player.getAttribute('src')) {
        player.setAttribute('src', dataSrc);
      }
    }
    if ('IntersectionObserver' in window) {
      const lottieObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadPlayer(entry.target);
            lottieObs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px', threshold: 0.1 });
      players.forEach(p => lottieObs.observe(p));
    } else {
      players.forEach(loadPlayer);
    }
  }

  // Animação de barras de resultados (vertical e horizontal)
  function initBars() {
    const targets = document.querySelectorAll('[data-target]');
    function setBar(el) {
      const pct = el.getAttribute('data-target');
      if (!pct) return;
      // Se o elemento tem um ancestral com altura pequena (h-4), trate como barra horizontal
      const horizontal = el.closest('.h-4');
      if (horizontal) {
        el.style.width = pct;
      } else {
        el.style.height = pct;
      }
    }
    if ('IntersectionObserver' in window) {
      const barObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setBar(entry.target);
            barObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      targets.forEach(el => barObs.observe(el));
    } else {
      targets.forEach(setBar);
    }
  }

  // Event handlers para scroll top e exit modal
  function initButtons() {
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    const exitClose = document.getElementById('exit-close');
    if (exitClose) {
      exitClose.addEventListener('click', () => {
        const modal = document.getElementById('exit-modal');
        if (modal) modal.classList.add('hidden');
      });
    }
    // Exit intent
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) {
        showExitModal();
      }
    });
  }

  // Carrega player de áudio sob demanda (WaveSurfer)
  function initAudio() {
    let wavesurferInstance;
    const playBtn = document.getElementById('play-btn');
    const audioElement = document.getElementById('audio-element');
    const audioTime = document.getElementById('audio-time');
    const playbackRateBtn = document.getElementById('playback-rate');
    const speeds = [1, 1.25, 1.5, 2];
    let speedIdx = 0;
    function loadWaveSurfer(callback) {
      if (window.WaveSurfer) {
        callback();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js';
      script.onload = callback;
      document.head.appendChild(script);
    }
    function initialiseWaveSurfer() {
      if (wavesurferInstance) return;
      if (!audioElement.src && audioElement.dataset && audioElement.dataset.src) {
        audioElement.src = audioElement.dataset.src;
        try { audioElement.load(); } catch(e) {}
      }
      loadWaveSurfer(() => {
        wavesurferInstance = WaveSurfer.create({
          container: '#waveform',
          waveColor: '#f9b7b7',
          progressColor: '#d32f2f',
          height: 50,
          cursorWidth: 0,
          barWidth: 2,
          barGap: 2,
          media: audioElement
        });
        wavesurferInstance.on('audioprocess', () => {
          const curr = wavesurferInstance.getCurrentTime();
          if (audioTime) audioTime.textContent = `${Math.floor(curr/60)}:${String(Math.floor(curr % 60)).padStart(2,'0')}`;
        });
        wavesurferInstance.on('ready', () => {
          const duration = wavesurferInstance.getDuration();
          if (audioTime) audioTime.textContent = `${Math.floor(duration/60)}:${String(Math.floor(duration % 60)).padStart(2,'0')}`;
        });
        document.getElementById('waveform').addEventListener('click', () => {
          wavesurferInstance.playPause();
          if (playBtn) playBtn.textContent = wavesurferInstance.isPlaying() ? '❚❚' : '▶︎';
        });
      });
    }
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        initialiseWaveSurfer();
        if (wavesurferInstance) {
          wavesurferInstance.playPause();
          playBtn.textContent = wavesurferInstance.isPlaying() ? '❚❚' : '▶︎';
        }
      });
    }
    if (playbackRateBtn) {
      playbackRateBtn.addEventListener('click', () => {
        initialiseWaveSurfer();
        if (wavesurferInstance) {
          speedIdx = (speedIdx + 1) % speeds.length;
          wavesurferInstance.setPlaybackRate(speeds[speedIdx]);
          playbackRateBtn.textContent = speeds[speedIdx].toFixed(2) + 'x';
        }
      });
    }
  }

  // Inicialização principal
  function init() {
    startClock();
    updateScrollProgress();
    updateViewerCount();
    updateDate();
    updateCity();
    handleCouponCopy();
    initComments();
    initLottie();
    initBars();
    initButtons();
    initAudio();
    // Eventos globais
    window.addEventListener('scroll', updateScrollProgress);
    // Contadores e timers
    setInterval(updateViewerCount, 7000);
    setInterval(updateCountdown, 1000);
    setTimeout(showPurchaseToast, 8000);
    setInterval(showPurchaseToast, 25000);
    setInterval(reduceStock, 20000);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();