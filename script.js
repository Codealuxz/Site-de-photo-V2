// Liste des images (chargée automatiquement)
let images = [];

// Fonction pour obtenir le nombre de colonnes selon la largeur d'écran
function getColumnCount() {
  const width = window.innerWidth;
  if (width <= 768) return 1;
  if (width <= 1024) return 2;
  return 3;
}

// Variables pour les colonnes
let columns = [];

// Fonction pour créer le layout en colonnes
function createGallery() {
  const content = document.querySelector('.content');
  const columnCount = getColumnCount();

  // Créer le nombre de colonnes nécessaires
  columns = [];
  for (let i = 0; i < columnCount; i++) {
    const col = document.createElement('div');
    col.className = 'gallery-column';
    content.appendChild(col);
    columns.push(col);
  }
}

// Fonction pour ajouter une seule image à la galerie
function addImageToGallery(imageName, index) {
  if (columns.length === 0) return;

  const columnCount = columns.length;

  // Créer un conteneur pour l'image
  const container = document.createElement('div');
  container.className = 'img-container';
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px) scale(0.9)';
  container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  // Créer l'image
  const img = document.createElement('img');
  img.src = `./photos_webp/${imageName}`;
  img.alt = imageName;
  img.loading = 'lazy'; // Lazy loading pour de meilleures performances

  // Ajouter l'événement de clic pour ouvrir le lightbox
  container.addEventListener('click', () => {
    openLightbox(index);
  });

  // Ajouter l'image au conteneur
  container.appendChild(img);

  // Ajouter le conteneur à la colonne appropriée (rotation)
  const columnIndex = index % columnCount;
  columns[columnIndex].appendChild(container);

  // Animation d'apparition
  setTimeout(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0) scale(1)';
  }, 10);
}

// Recharger la galerie lors du redimensionnement
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const content = document.querySelector('.content');
    const currentColumnCount = content.children.length;
    const newColumnCount = getColumnCount();

    // Recréer la galerie uniquement si le nombre de colonnes change
    if (currentColumnCount !== newColumnCount) {
      content.innerHTML = '';
      createGallery();

      // Réafficher toutes les images chargées
      images.forEach((imageName, index) => {
        addImageToGallery(imageName, index);
      });
    }
  }, 250);
});

// Variables pour le lightbox
let currentImageIndex = 0;
let lightbox = null;
let lightboxImg = null;

// Créer le lightbox
function createLightbox() {
  lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  // Image du lightbox
  lightboxImg = document.createElement('img');
  lightbox.appendChild(lightboxImg);

  // Bouton fermer
  const closeBtn = document.createElement('div');
  closeBtn.className = 'lightbox-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.appendChild(closeBtn);

  // Bouton précédent
  const prevBtn = document.createElement('div');
  prevBtn.className = 'lightbox-nav lightbox-prev';
  prevBtn.textContent = '‹';
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPreviousImage();
  });
  lightbox.appendChild(prevBtn);

  // Bouton suivant
  const nextBtn = document.createElement('div');
  nextBtn.className = 'lightbox-nav lightbox-next';
  nextBtn.textContent = '›';
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNextImage();
  });
  lightbox.appendChild(nextBtn);

  // Fermer en cliquant sur le fond
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.body.appendChild(lightbox);

  // Navigation au clavier
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPreviousImage();
    if (e.key === 'ArrowRight') showNextImage();
  });
}

// Ouvrir le lightbox
function openLightbox(index) {
  currentImageIndex = index;
  lightboxImg.src = `./photos_webp/${images[currentImageIndex]}`;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Désactiver le scroll
}

// Fermer le lightbox
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Réactiver le scroll
}

// Image précédente
function showPreviousImage() {
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  lightboxImg.src = `./photos_webp/${images[currentImageIndex]}`;
}

// Image suivante
function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length;
  lightboxImg.src = `./photos_webp/${images[currentImageIndex]}`;
}

// Fonction pour vérifier si une image existe
function imageExists(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
}

// Charger les images automatiquement (1.webp, 2.webp, 3.webp, ...)
async function loadImages() {
  const loadingContainer = document.getElementById('loading');

  // Créer les colonnes de la galerie
  createGallery();
  createLightbox();

  // Cacher le message de chargement après avoir créé la structure
  if (loadingContainer) {
    loadingContainer.classList.add('hidden');
  }

  let index = 1;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 5; // Arrêter après 5 échecs consécutifs

  while (consecutiveFailures < maxConsecutiveFailures) {
    const imagePath = `./photos_webp/${index}.webp`;
    const exists = await imageExists(imagePath);

    if (exists) {
      const imageName = `${index}.webp`;
      images.push(imageName);

      // Ajouter l'image immédiatement à la galerie
      addImageToGallery(imageName, images.length - 1);

      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
    }

    index++;
  }
}

// Charger la galerie quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  loadImages();
});
