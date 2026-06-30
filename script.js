
// ── PEEK MODALS ──
function openModal(type) {
  if (type === 'prairie-gallery') {
    const thumb = document.querySelector('.project-photos video');
    const v = document.querySelector('#modal-prairie-gallery video');
    if (thumb) thumb.pause();
    if (v) { v.currentTime = 0; v.play(); }
  }
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
  if (type === 'prairie-gallery') {
    const v = document.querySelector('#modal-prairie-gallery video');
    if (v) v.pause();
  }
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
        const id = overlay.id.replace('modal-', '');
        closeModal(id);
      }
    });
  });

});
