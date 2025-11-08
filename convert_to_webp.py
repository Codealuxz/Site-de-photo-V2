import os
import glob
from PIL import Image

def convert_to_webp(photos_dir="./photos", output_dir="./photos_webp", quality=85):
    """
    Convertit toutes les photos du dossier photos en WebP
    et les sauvegarde dans le dossier photos_webp

    Args:
        photos_dir: Dossier source contenant les photos
        output_dir: Dossier de destination pour les fichiers WebP
        quality: Qualite de compression WebP (0-100, defaut: 85)
    """

    # Creer le dossier de destination s'il n'existe pas
    os.makedirs(output_dir, exist_ok=True)

    # Extensions supportees
    extensions = ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.JPG", "*.JPEG", "*.PNG", "*.GIF"]

    # Collecter tous les fichiers
    files_set = set()
    for ext in extensions:
        found = glob.glob(os.path.join(photos_dir, ext))
        for f in found:
            files_set.add(os.path.abspath(f))

    files = sorted(list(files_set))

    print("=" * 60)
    print("CONVERSION EN WEBP")
    print("=" * 60)
    print(f"\nDossier source: {photos_dir}")
    print(f"Dossier destination: {output_dir}")
    print(f"Qualite: {quality}")
    print(f"\n{len(files)} fichiers trouves\n")

    if len(files) == 0:
        print("Aucun fichier a convertir !")
        return

    # Demander confirmation
    response = input(f"Voulez-vous convertir ces {len(files)} fichiers en WebP ? (oui/non): ").strip().lower()

    if response not in ['oui', 'o', 'yes', 'y']:
        print("\nAnnule - aucune conversion effectuee")
        return

    print("\nConversion en cours...\n")

    converted = 0
    errors = 0
    total_size_before = 0
    total_size_after = 0

    for i, file_path in enumerate(files, start=1):
        try:
            # Nom du fichier original
            basename = os.path.basename(file_path)
            name_without_ext = os.path.splitext(basename)[0]

            # Chemin de sortie
            output_path = os.path.join(output_dir, f"{name_without_ext}.webp")

            # Taille du fichier original
            size_before = os.path.getsize(file_path)
            total_size_before += size_before

            # Ouvrir et convertir l'image
            with Image.open(file_path) as img:
                # Convertir en RGB si necessaire (pour les PNG avec transparence)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Creer un fond blanc pour les images avec transparence
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')

                # Sauvegarder en WebP
                img.save(output_path, 'WebP', quality=quality, method=6)

            # Taille du fichier converti
            size_after = os.path.getsize(output_path)
            total_size_after += size_after

            # Calculer le taux de compression
            reduction = ((size_before - size_after) / size_before) * 100 if size_before > 0 else 0

            print(f"{i}/{len(files)}: {basename} -> {name_without_ext}.webp")
            print(f"         {size_before:,} octets -> {size_after:,} octets ({reduction:.1f}% reduction)")

            converted += 1

        except Exception as e:
            print(f"ERREUR avec {basename}: {e}")
            errors += 1

    # Statistiques finales
    print(f"\n{'='*60}")
    print("RESULTATS")
    print(f"{'='*60}")
    print(f"{converted} fichiers convertis avec succes")
    if errors > 0:
        print(f"{errors} erreur(s)")

    print(f"\nTaille totale avant: {total_size_before:,} octets ({total_size_before / (1024*1024):.2f} MB)")
    print(f"Taille totale apres: {total_size_after:,} octets ({total_size_after / (1024*1024):.2f} MB)")

    if total_size_before > 0:
        total_reduction = ((total_size_before - total_size_after) / total_size_before) * 100
        space_saved = total_size_before - total_size_after
        print(f"\nEspace economise: {space_saved:,} octets ({space_saved / (1024*1024):.2f} MB)")
        print(f"Taux de compression global: {total_reduction:.1f}%")

    print(f"\nFichiers WebP sauvegardes dans: {os.path.abspath(output_dir)}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("CONVERTISSEUR D'IMAGES EN WEBP")
    print("=" * 60 + "\n")

    # Parametres par defaut
    source_dir = "./photos"
    dest_dir = "./photos_webp"

    # Demander la qualite
    print("Qualite de compression WebP:")
    print("  - 100: Meilleure qualite (fichiers plus gros)")
    print("  - 85:  Bon equilibre qualite/taille (recommande)")
    print("  - 75:  Qualite correcte (fichiers plus petits)")
    print("  - 50:  Basse qualite (tres petits fichiers)")

    quality_input = input("\nQualite (appuyez sur Entree pour 85): ").strip()

    if quality_input:
        try:
            quality = int(quality_input)
            if quality < 0 or quality > 100:
                print("Qualite invalide, utilisation de 85 par defaut")
                quality = 85
        except ValueError:
            print("Qualite invalide, utilisation de 85 par defaut")
            quality = 85
    else:
        quality = 85

    print()

    convert_to_webp(source_dir, dest_dir, quality)

    input("\nAppuyez sur Entree pour fermer...")
