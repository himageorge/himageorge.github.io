// ── PRAIRIE JOURNAL CAROUSEL ──
const carouselPhotos = [
  { src: 'assets/dashboard1.png', alt: 'Dashboard' },
  { src: 'assets/journals.jpeg',  alt: 'Journals'  },
  { src: 'assets/pop-up.jpeg',    alt: 'Pop-up'    },
];
let carouselIndex = 0;

function openCarousel(index) {
  carouselIndex = index;
  updateCarousel();
  const modal = document.getElementById('modal-prairie-gallery');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function carouselStep(dir) {
  carouselIndex = (carouselIndex + dir + carouselPhotos.length) % carouselPhotos.length;
  updateCarousel();
}

function updateCarousel() {
  const img = document.getElementById('carouselImg');
  const counter = document.getElementById('carouselCounter');
  if (img) { img.src = carouselPhotos[carouselIndex].src; img.alt = carouselPhotos[carouselIndex].alt; }
  if (counter) counter.textContent = (carouselIndex + 1) + ' / ' + carouselPhotos.length;
}

// ── PEEK MODALS ──
function openModal(type) {
  if (type === 'gallery') {
    const grid = document.getElementById('galleryGrid');
    if (grid) {
      grid.innerHTML = '';
      document.querySelectorAll('.drawing-thumb').forEach(img => {
        const clone = img.cloneNode(true);
        clone.style.filter = 'none';
        clone.style.opacity = '1';
        clone.style.width = '100%';
        grid.appendChild(clone);
      });
    }
  }
  const modal = document.getElementById('modal-' + type);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(type) {
  const modal = document.getElementById('modal-' + type);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', e => {
    const gallery = document.getElementById('modal-prairie-gallery');
    if (!gallery || !gallery.classList.contains('open')) return;
    if (e.key === 'ArrowRight') carouselStep(1);
    if (e.key === 'ArrowLeft')  carouselStep(-1);
  });
});
