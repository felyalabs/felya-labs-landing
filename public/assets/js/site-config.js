export const mobileNavigation = {
  selectors: {
    container: 'header details',
    links: 'a'
  }
};

export const signupForm = {
  selectors: {
    form: '#signup-form',
    email: 'input[name="email"]',
    submit: 'button[type="submit"]',
    status: '#signup-status'
  },
  labels: {
    pendingButton: 'Joining...',
    pendingStatus: 'Submitting...',
    fallbackButton: 'Join waitlist'
  },
  request: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    credentials: 'omit',
    referrerPolicy: 'no-referrer'
  }
};

export const sponsorMarquee = {
  selectors: {
    container: '.sponsor-marquee',
    track: '.sponsor-marquee__track',
    group: '.sponsor-marquee__group'
  },
  css: {
    distanceProperty: '--sponsor-marquee-distance'
  }
};

export const galleryCarousel = {
  selectors: {
    track: '#carouselTrack',
    previousButton: '#prevBtn',
    nextButton: '#nextBtn',
    dots: '[data-carousel-dot]'
  },
  transition: 'transform 0.5s ease-in-out'
};

export const videoCover = {
  selectors: {
    cover: '[data-video-cover]'
  }
};
