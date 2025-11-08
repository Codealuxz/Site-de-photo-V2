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

// Intersection Observer pour lazy loading optimisé
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    }
  });
}, {
  rootMargin: '50px', // Commencer à charger 50px avant que l'image soit visible
  threshold: 0.01
});

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

  // Créer l'image avec lazy loading optimisé
  const img = document.createElement('img');

  // Charger immédiatement les 6 premières images, lazy load pour le reste
  if (index < 6) {
    img.src = `./photos_webp/${imageName}`;
  } else {
    img.dataset.src = `./photos_webp/${imageName}`;
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'; // Placeholder transparent
    imageObserver.observe(img);
  }

  img.alt = imageName;
  img.loading = 'lazy';
  img.decoding = 'async'; // Décodage asynchrone

  // Ajouter l'événement de clic pour ouvrir le lightbox
  container.addEventListener('click', () => {
    openLightbox(index);
  }, { passive: true });

  // Ajouter l'image au conteneur
  container.appendChild(img);

  // Ajouter le conteneur à la colonne appropriée (rotation)
  const columnIndex = index % columnCount;
  columns[columnIndex].appendChild(container);

  // Animation d'apparition optimisée avec requestAnimationFrame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0) scale(1)';
    });
  });
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

// Fonction optimisée pour vérifier si une image existe (utilise HEAD request)
function imageExists(imagePath) {
  return new Promise((resolve) => {
    fetch(imagePath, { method: 'HEAD' })
      .then(response => resolve(response.ok))
      .catch(() => resolve(false));
  });
}

// Charger les images automatiquement avec détection par batch
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
  const maxConsecutiveFailures = 5;
  const batchSize = 10; // Vérifier 10 images en parallèle

  while (consecutiveFailures < maxConsecutiveFailures) {
    // Créer un batch de vérifications en parallèle
    const checks = [];
    for (let i = 0; i < batchSize; i++) {
      const currentIndex = index + i;
      const imagePath = `./photos_webp/${currentIndex}.webp`;
      checks.push({ index: currentIndex, promise: imageExists(imagePath) });
    }

    // Vérifier toutes les images du batch en parallèle
    const results = await Promise.all(checks.map(c => c.promise));

    // Traiter les résultats
    let foundInBatch = false;
    for (let i = 0; i < results.length; i++) {
      if (results[i]) {
        const imageName = `${checks[i].index}.webp`;
        images.push(imageName);
        addImageToGallery(imageName, images.length - 1);
        foundInBatch = true;
        consecutiveFailures = 0;
      } else if (!foundInBatch && i > 0) {
        consecutiveFailures++;
      }
    }

    // Si aucune image trouvée dans le batch, arrêter
    if (!foundInBatch) {
      break;
    }

    index += batchSize;

    // Petit délai pour ne pas surcharger le navigateur
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

// Charger la galerie quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  loadImages();
});
