import os
import glob
import re

def number_new_photos(photos_dir="./photos"):
    """
    Numérote les fichiers non numérotés en continuant la séquence
    après les fichiers déjà numérotés (1.jpg, 2.jpg, etc.)

    Ne touche PAS aux fichiers déjà numérotés.
    """

    # Extensions supportées
    extensions = ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp", "*.JPG", "*.JPEG", "*.PNG", "*.GIF", "*.WEBP"]

    # Collecter tous les fichiers
    all_files = set()
    for ext in extensions:
        found = glob.glob(os.path.join(photos_dir, ext))
        for f in found:
            all_files.add(os.path.abspath(f))

    all_files = sorted(list(all_files))

    print("=" * 60)
    print("NUMEROTATION DES NOUVELLES PHOTOS")
    print("=" * 60)
    print(f"\nDossier: {photos_dir}")
    print(f"{len(all_files)} fichiers trouvés au total\n")

    if len(all_files) == 0:
        print("Aucun fichier trouvé !")
        return

    # Séparer les fichiers déjà numérotés des autres
    numbered_files = {}  # {numero: chemin}
    unnumbered_files = []

    for file_path in all_files:
        basename = os.path.basename(file_path)
        name_without_ext = os.path.splitext(basename)[0]

        # Vérifier si le nom est juste un numéro (1, 2, 3, etc.)
        if re.match(r'^\d+$', name_without_ext):
            num = int(name_without_ext)
            numbered_files[num] = file_path
        else:
            unnumbered_files.append(file_path)

    print(f"Fichiers déjà numérotés: {len(numbered_files)}")
    print(f"Fichiers à numéroter: {len(unnumbered_files)}\n")

    if len(unnumbered_files) == 0:
        print("Aucun fichier à numéroter !")
        return

    # Trouver le prochain numéro disponible
    if numbered_files:
        max_number = max(numbered_files.keys())
        next_number = max_number + 1
    else:
        next_number = 1

    print(f"Prochain numéro disponible: {next_number}\n")
    print("Aperçu des fichiers qui seront numérotés:\n")

    # Afficher un aperçu
    preview_count = min(10, len(unnumbered_files))
    for i, file_path in enumerate(unnumbered_files[:preview_count]):
        old_name = os.path.basename(file_path)
        new_number = next_number + i
        print(f"  {old_name} -> {new_number}.jpg")

    if len(unnumbered_files) > preview_count:
        print(f"  ... et {len(unnumbered_files) - preview_count} autres fichiers")

    print()

    # Demander confirmation
    response = input(f"Voulez-vous numéroter ces {len(unnumbered_files)} fichiers ? (oui/non): ").strip().lower()

    if response not in ['oui', 'o', 'yes', 'y']:
        print("\nAnnulé - aucun fichier renommé")
        return

    print("\nNumérotation en cours...\n")

    # Créer la liste des renommages
    rename_pairs = []
    for i, old_path in enumerate(unnumbered_files):
        new_number = next_number + i
        ext = os.path.splitext(old_path)[1]
        new_path = os.path.join(photos_dir, f"{new_number}.jpg")
        rename_pairs.append((old_path, new_path))

    # Renommer en deux passes pour éviter les conflits
    # Passe 1: renommer vers des noms temporaires
    temp_map = []
    for i, (old_path, new_path) in enumerate(rename_pairs):
        temp_name = os.path.join(photos_dir, f"_temp_number_{i}.jpg")
        try:
            os.rename(old_path, temp_name)
            temp_map.append((temp_name, new_path, os.path.basename(old_path)))
            print(f"Étape 1: {os.path.basename(old_path)} -> temp_{i}")
        except Exception as e:
            print(f"ERREUR renommage temp {os.path.basename(old_path)}: {e}")

    # Passe 2: renommer vers les noms finaux
    success_count = 0
    error_count = 0

    for temp_path, final_path, original_name in temp_map:
        try:
            final_number = os.path.splitext(os.path.basename(final_path))[0]
            os.rename(temp_path, final_path)
            print(f"Étape 2: {original_name} -> {final_number}.jpg")
            success_count += 1
        except Exception as e:
            print(f"ERREUR renommage final {original_name}: {e}")
            error_count += 1

    print(f"\n{'='*60}")
    print("RÉSULTATS")
    print(f"{'='*60}")
    print(f"{success_count} fichiers renommés avec succès")
    if error_count > 0:
        print(f"{error_count} erreur(s)")

    print(f"\nNuméros utilisés: {next_number} à {next_number + success_count - 1}")
    print(f"Total de photos numérotées: {len(numbered_files) + success_count}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NUMEROTATION DES NOUVELLES PHOTOS")
    print("=" * 60 + "\n")

    number_new_photos()

    input("\nAppuyez sur Entrée pour fermer...")
