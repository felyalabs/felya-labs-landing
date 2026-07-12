import {
  galleryCarousel,
  mobileNavigation,
  signupForm,
  sponsorMarquee,
  videoCover
} from './site-config.js';

export {
  galleryCarousel,
  mobileNavigation,
  signupForm,
  sponsorMarquee,
  videoCover
} from './site-config.js';

export function onDocumentReady(callback) {
  if (typeof document === 'undefined') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
}

export function initMobileNavigation({ root = document, config = mobileNavigation } = {}) {
  const container = root.querySelector(config.selectors.container);
  if (!container) return;

  container.querySelectorAll(config.selectors.links).forEach((link) => {
    link.addEventListener('click', () => {
      container.removeAttribute('open');
    });
  });
}

export function setSignupStatus(statusElement, message, state = 'idle') {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

export function initSignupForm({ root = document, config = signupForm } = {}) {
  const form = root.querySelector(config.selectors.form);
  if (!form) return;

  const emailInput = form.querySelector(config.selectors.email);
  const submitButton = form.querySelector(config.selectors.submit);
  const status = root.querySelector(config.selectors.status);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!emailInput || !submitButton || !status) return;
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submitButton.textContent = config.labels.pendingButton;
    setSignupStatus(status, config.labels.pendingStatus, 'idle');

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        ...config.request,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        form.reset();
        setSignupStatus(status, form.dataset.successMessage, 'success');
      } else {
        setSignupStatus(status, form.dataset.errorMessage, 'error');
      }
    } catch {
      setSignupStatus(status, form.dataset.errorMessage, 'error');
    } finally {
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
      submitButton.textContent = submitButton.dataset.label || config.labels.fallbackButton;
    }
  });
}

export function initSponsorMarquee({ root = document, config = sponsorMarquee } = {}) {
  const container = root.querySelector(config.selectors.container);
  const track = root.querySelector(config.selectors.track);
  const group = root.querySelector(config.selectors.group);
  if (!container || !track || !group) return;

  const updateDistance = () => {
    container.style.removeProperty(config.css.distanceProperty);
    const distance = group.scrollWidth;
    if (!distance) return;

    const requiredGroups = Math.ceil(container.clientWidth / distance) + 1;
    while (track.children.length < requiredGroups) {
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    container.style.setProperty(config.css.distanceProperty, `${distance}px`);
  };

  updateDistance();
  window.addEventListener('load', updateDistance);
  window.addEventListener('resize', updateDistance);

  return updateDistance;
}

export function initGalleryCarousel({ root = document, config = galleryCarousel } = {}) {
  const track = root.querySelector(config.selectors.track);
  const previousButton = root.querySelector(config.selectors.previousButton);
  const nextButton = root.querySelector(config.selectors.nextButton);
  const dots = Array.from(root.querySelectorAll(config.selectors.dots));
  if (!track || !previousButton || !nextButton) return;

  let slides = Array.from(track.children);
  if (!slides.length) return;
  const slideCount = slides.length;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  firstClone.alt = '';
  lastClone.alt = '';

  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  slides = Array.from(track.children);

  let currentIndex = 1;
  let isTransitioning = false;
  track.style.transform = 'translateX(-100%)';

  const activeSlideIndex = () => {
    if (currentIndex === 0) return slideCount - 1;
    if (currentIndex === slides.length - 1) return 0;
    return currentIndex - 1;
  };

  const updateDots = () => {
    dots.forEach((dot, index) => {
      const isActive = index === activeSlideIndex();
      dot.dataset.active = String(isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const updateCarousel = (instant = false) => {
    track.style.transition = instant ? 'none' : config.transition;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  };

  nextButton.addEventListener('click', () => {
    if (isTransitioning) return;

    isTransitioning = true;
    currentIndex++;
    updateCarousel();
  });

  previousButton.addEventListener('click', () => {
    if (isTransitioning) return;

    isTransitioning = true;
    currentIndex--;
    updateCarousel();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (isTransitioning || index === activeSlideIndex()) return;

      isTransitioning = true;
      currentIndex = index + 1;
      updateCarousel();
    });
  });

  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    if (currentIndex === slides.length - 1) {
      currentIndex = 1;
      updateCarousel(true);
    }

    if (currentIndex === 0) {
      currentIndex = slides.length - 2;
      updateCarousel(true);
    }
  });

  updateDots();
}

export function initVideoCover({ root = document, config = videoCover } = {}) {
  const covers = Array.from(root.querySelectorAll(config.selectors.cover));
  if (!covers.length) return;

  const loadVideoSources = (video) => {
    if (video.dataset.videoLoaded === 'true') return;

    video.querySelectorAll('source[data-src]').forEach((source) => {
      source.src = source.dataset.src;
      delete source.dataset.src;
    });
    video.dataset.videoLoaded = 'true';
    video.load();
  };

  covers.forEach((cover) => {
    const targetId = cover.dataset.videoTarget;
    const video = targetId ? document.getElementById(targetId) : cover.parentElement?.querySelector('video');
    if (!video) return;

    const hideCover = () => {
      cover.hidden = true;
    };

    cover.hidden = false;
    cover.addEventListener('click', () => {
      loadVideoSources(video);
      hideCover();
      const playRequest = video.play();
      if (playRequest) {
        playRequest.catch(() => {});
      }
    });
    video.addEventListener('play', hideCover, { once: true });
  });
}

export function initSite(root = document) {
  initMobileNavigation({ root });
  initSignupForm({ root });
  initSponsorMarquee({ root });
  initGalleryCarousel({ root });
  initVideoCover({ root });
}

if (typeof document !== 'undefined') {
  onDocumentReady(() => initSite());
}
