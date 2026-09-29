// Menu mobile: aggiornamento dello stato accessibile e della classe CSS.
const button = document.querySelector('.menu');
const navigation = document.querySelector('#nav');

button.addEventListener('click', () => {
  const isOpen = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    button.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }
});

// Conteggio una sola volta. I valori finali restano disponibili senza JavaScript.
const numbers = document.querySelector('.numbers');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (numbers && 'IntersectionObserver' in window && !reducedMotion.matches) {
  const formatter = new Intl.NumberFormat(document.documentElement.lang === 'en' ? 'en-GB' : 'it-IT');
  const counters = [...numbers.querySelectorAll('[data-count]')];
  // Il lettore di schermo legge il dato finale, senza gli aggiornamenti animati.
  counters.forEach(counter => {
    const accessibleValue = document.createElement('span');
    accessibleValue.className = 'number-accessible';
    accessibleValue.textContent = counter.textContent;
    counter.before(accessibleValue);
    counter.setAttribute('aria-hidden', 'true');
  });
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    const start = performance.now();
    const duration = 1400;
    const animate = now => {
      const progress = reducedMotion.matches ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(counter => {
        counter.textContent = formatter.format(Math.round(Number(counter.dataset.count) * eased));
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, { threshold: 0.15 });
  observer.observe(numbers.querySelector('.numbers-grid'));
}
