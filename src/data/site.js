const responsiveImageWidths = [640, 768, 960, 1200, 1440, 1600, 1920, 2048, 2400, 2560, 3000, 3200, 3568];
const imageSrc = (directory, fileName) => `assets/images/${directory}/${fileName}.webp`;
const imageSrcset = (directory, fileStem, widths = responsiveImageWidths) =>
  widths.map((width) => [imageSrc(directory, `${fileStem}-${width}`), width]);

export const brand = {
  name: 'FELYA LABS',
  logo: {
    src: 'assets/images/brand/felya-labs-logo/felya-labs-logo-307.webp',
    width: 307,
    height: 108
  }
};

export const navLinks = [
  { href: '#main', label: 'PATON I' },
  { href: '#about', label: 'About' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' }
];

export const legalLinks = [
  { href: 'terms.html', label: 'Terms & Conditions' },
  { href: 'privacy.html', label: 'Privacy Policy' },
  { href: 'impressum.html', label: 'Impressum' }
];

export const socialLinks = [
  {
    id: 'linkedin',
    href: 'https://linkedin.com/company/felya-labs',
    label: 'FELYA LABS on LinkedIn'
  },
  {
    id: 'instagram',
    href: 'https://instagram.com/felya_labs/',
    label: 'FELYA LABS on Instagram'
  },
  {
    id: 'github',
    href: 'https://github.com/felyalabs/',
    label: 'FELYA LABS on GitHub'
  },
  {
    id: 'youtube',
    href: 'https://youtube.com/watch?v=230vny1l3fE',
    label: 'FELYA LABS prototype video on YouTube'
  }
];

export const gloveImage = {
  src: 'assets/images/hero/affinity-felya/affinity_Felya.webp',
  srcset: [
    ...imageSrcset('hero/affinity-felya', 'affinity_Felya', [640, 768, 960, 1200]),
    ['assets/images/hero/affinity-felya/affinity_Felya.webp', 1301]
  ],
  sizes: '(min-width: 768px) 560px, 270px',
  width: 1301,
  height: 1446,
  alt: 'Close-up of the FELYA LABS haptic glove with blue finger mechanisms over a fabric glove.'
};

const waitlistFormAction = 'https://submit-form.com/5I3xX6ZMl';

export const waitlistForm = {
  action: waitlistFormAction,
  origin: new URL(waitlistFormAction).origin
};

export const teamImage = {
  src: 'assets/images/about/team-4/team_4-3568.webp',
  srcset: imageSrcset('about/team-4', 'team_4'),
  sizes: '(min-width: 1344px) 568px, (min-width: 768px) calc((100vw - 12rem) / 2), calc(100vw - 4rem)',
  width: 3568,
  height: 2585,
  alt: 'Four FELYA LABS team members holding and wearing haptic glove prototypes.'
};

export const sponsors = [
  {
    src: 'assets/images/sponsors/igus/igus-logo-192.webp',
    width: 192,
    height: 100,
    className: 'h-7'
  },
  {
    src: 'assets/images/sponsors/innohub/innohub-192.webp',
    width: 192,
    height: 93,
    className: 'h-8'
  },
  {
    src: 'assets/images/sponsors/knipex/knipex-logo-192.webp',
    width: 192,
    height: 92,
    className: 'h-8'
  },
  {
    src: 'assets/images/sponsors/coco/coco-logo-192.webp',
    width: 192,
    height: 69,
    className: 'h-7 brightness-[15] hover:brightness-100 hover:duration-0'
  },
  {
    src: 'assets/images/sponsors/wuerth/wuerth-logo-192.webp',
    width: 192,
    height: 87,
    className: 'h-7'
  },
  {
    src: 'assets/images/sponsors/fidlock/fidlock-logo-192.webp',
    width: 192,
    height: 40,
    className: 'h-5'
  },
  {
    src: 'assets/images/sponsors/th-koeln/th-koeln-logo-192.webp',
    width: 192,
    height: 104,
    className: 'h-8'
  },
  {
    src: 'assets/images/sponsors/solingen/solingen-logo-192.webp',
    width: 192,
    height: 88,
    className: 'h-7'
  }
];

const wideImageSizes = '(min-width: 1228px) 1100px, (min-width: 768px) calc(100vw - 8rem), calc(100vw - 4rem)';

export const gallerySlides = [
  {
    src: 'assets/images/gallery/paton-sketch/paton-sketch.webp',
    srcset: imageSrcset('gallery/paton-sketch', 'paton-sketch'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    alt: 'Blueprint-style diagram showing a human operator controlling a robotic arm, with motion commands sent to the robot and haptic feedback returned to the person.'
  },
  {
    src: 'assets/images/gallery/remote-humanoid/remote-humanoid.webp',
    srcset: imageSrcset('gallery/remote-humanoid', 'remote-humanoid'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    alt: 'Blueprint-style diagram labeled Embodied telepresence, showing a robot handing a rose to a person wearing a VR headset and haptic glove.'
  },
  {
    src: 'assets/images/gallery/roboglove-chicken/roboglove-chicken.webp',
    srcset: imageSrcset('gallery/roboglove-chicken', 'roboglove-chicken'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    alt: 'Blueprint-style diagram showing a robotic arm interacting with an object while a haptic glove controls the remote movement.'
  },
  {
    src: 'assets/images/gallery/immersive-glove/immersive-glove.webp',
    srcset: imageSrcset('gallery/immersive-glove', 'immersive-glove'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    alt: 'Blueprint-style diagram captioned Touch another reality, showing a VR user holding a detailed haptic glove.'
  },
  {
    src: 'assets/images/gallery/haptic-feedback/haptic-feedback.webp',
    srcset: imageSrcset('gallery/haptic-feedback', 'haptic-feedback'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    alt: 'Blueprint-style diagram captioned Haptic Feedback, showing a haptic glove mirroring the motion of another hand.'
  },
  {
    src: 'assets/images/gallery/your-hands-your-arms/your-hands-your-arms.webp',
    srcset: imageSrcset('gallery/your-hands-your-arms', 'your-hands-your-arms'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    alt: 'Blueprint-style diagram captioned Your hands. Your arms. Anywhere on Earth, showing a VR user remotely controlling robotic arms.'
  }
];

export const video = {
  title: 'FELYA LABS prototype video',
  width: 1280,
  height: 720,
  preload: 'none',
  cover: {
    src: 'assets/images/videoCover/Interface_of_Craft_Thumbnail.png',
    poster: 'assets/images/videoCover/Interface_of_Craft_Thumbnail-1200.webp',
    srcset: imageSrcset('videoCover', 'Interface_of_Craft_Thumbnail'),
    sizes: wideImageSizes,
    width: 3584,
    height: 2012,
    label: 'Play prototype video'
  },
  sources: [
    {
      src: 'assets/video/roboglove-interface/av1/640.webm',
      type: 'video/webm; codecs="av01.0.05M.08.0.111.01.01.01.0, opus"',
      media: '(max-width: 640px)',
      width: 640
    },
    {
      src: 'assets/video/roboglove-interface/av1/768.webm',
      type: 'video/webm; codecs="av01.0.05M.08.0.111.01.01.01.0, opus"',
      media: '(max-width: 768px)',
      width: 768
    },
    {
      src: 'assets/video/roboglove-interface/av1/960.webm',
      type: 'video/webm; codecs="av01.0.05M.08.0.111.01.01.01.0, opus"',
      media: '(max-width: 960px)',
      width: 960
    },
    {
      src: 'assets/video/roboglove-interface/av1/1200.webm',
      type: 'video/webm; codecs="av01.0.05M.08.0.111.01.01.01.0, opus"',
      media: '(max-width: 1200px)',
      width: 1200
    },
    {
      src: 'assets/video/roboglove-interface/av1/1280.webm',
      type: 'video/webm; codecs="av01.0.05M.08.0.111.01.01.01.0, opus"',
      width: 1280
    },
    {
      src: 'assets/video/roboglove-interface/h264/640.mp4',
      type: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
      media: '(max-width: 640px)',
      width: 640
    },
    {
      src: 'assets/video/roboglove-interface/h264/768.mp4',
      type: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
      media: '(max-width: 768px)',
      width: 768
    },
    {
      src: 'assets/video/roboglove-interface/h264/960.mp4',
      type: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
      media: '(max-width: 960px)',
      width: 960
    },
    {
      src: 'assets/video/roboglove-interface/h264/1200.mp4',
      type: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
      media: '(max-width: 1200px)',
      width: 1200
    },
    {
      src: 'assets/video/roboglove-interface/RoboGlove - Interface of Craft.mp4',
      type: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
      width: 1280
    }
  ],
  fallbackText: 'Your browser does not support embedded video.'
};
