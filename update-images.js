const fs = require('fs');
const path = require('path');

const photosDir = './photos';
const scriptFile = './script.js';

// Lire le contenu du dossier photos
fs.readdir(photosDir, (err, files) => {
  if (err) {
    console.error('❌ Erreur lors de la lecture du dossier photos:', err);
    return;
  }

  // Filtrer uniquement les fichiers image
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const images = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });

  // Lire le fichier script.js
  fs.readFile(scriptFile, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Erreur lors de la lecture de script.js:', err);
      return;
    }

    // Créer la nouvelle liste d'images
    const imagesList = images.map(img => `  '${img}'`).join(',\n');
    const newImagesArray = `// Liste des images dans le dossier photos\nconst images = [\n${imagesList}\n];`;

    // Remplacer l'ancienne liste par la nouvelle
    const regex = /\/\/ Liste des images dans le dossier photos\nconst images = \[[\s\S]*?\];/;
    const newData = data.replace(regex, newImagesArray);

    // Écrire le fichier mis à jour
    fs.writeFile(scriptFile, newData, 'utf8', err => {
      if (err) {
        console.error('❌ Erreur lors de l\'écriture de script.js:', err);
        return;
      }
      console.log(`✅ Liste des images mise à jour: ${images.length} images trouvées`);
      console.log('📝 Fichier script.js mis à jour');
    });
  });
});
