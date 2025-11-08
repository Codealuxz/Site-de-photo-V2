import os
import json
import glob

def apply_order_from_json(json_file="order.json", photos_dir="./photos"):
    """
    Lit le fichier order.json et renomme les photos selon l'ordre specifie
    """
    # Verifier que le fichier JSON existe
    if not os.path.exists(json_file):
        print(f"ERREUR: Le fichier {json_file} n'existe pas !")
        print("Veuillez d'abord generer le fichier order.json depuis la page web reorder.html")
        return

    # Charger le JSON
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERREUR lors de la lecture du fichier JSON: {e}")
        return

    order = data.get('order', [])

    if not order:
        print("ERREUR: Le fichier JSON ne contient pas d'ordre de photos !")
        return

    print(f"\n{len(order)} photos a renommer selon l'ordre specifie\n")
    print(f"Date de creation de l'ordre: {data.get('timestamp', 'inconnue')}\n")

    # Afficher un apercu
    print("Apercu des 10 premieres photos :")
    for i, photo_name in enumerate(order[:10], start=1):
        print(f"  {i}. {photo_name}")

    if len(order) > 10:
        print(f"  ... et {len(order) - 10} autres photos")

    print()

    # Demander confirmation
    response = input(f"Voulez-vous renommer ces {len(order)} photos selon cet ordre ? (oui/non): ").strip().lower()

    if response not in ['oui', 'o', 'yes', 'y']:
        print("\nAnnule - aucun fichier renomme")
        return

    print("\nRenommage en cours...\n")

    # Creer un mapping: ancien nom -> nouveau nom
    rename_map = []
    for i, old_name in enumerate(order, start=1):
        old_path = os.path.join(photos_dir, old_name)
        new_path = os.path.join(photos_dir, f"{i}.jpg")

        # Verifier que le fichier source existe
        if not os.path.exists(old_path):
            print(f"ATTENTION: {old_name} n'existe pas, ignore")
            continue

        rename_map.append((old_path, new_path))

    if not rename_map:
        print("ERREUR: Aucun fichier a renommer !")
        return

    # Renommer en deux passes pour eviter les conflits
    # Passe 1: renommer vers des noms temporaires
    temp_map = []
    for i, (old_path, new_path) in enumerate(rename_map):
        temp_name = os.path.join(photos_dir, f"_temp_reorder_{i}.jpg")
        try:
            os.rename(old_path, temp_name)
            temp_map.append((temp_name, new_path))
            print(f"Etape 1: {os.path.basename(old_path)} -> temp_{i}")
        except Exception as e:
            print(f"ERREUR renommage temp {os.path.basename(old_path)}: {e}")

    # Passe 2: renommer vers les noms finaux
    success_count = 0
    error_count = 0

    for temp_path, final_path in temp_map:
        try:
            final_number = os.path.basename(final_path)
            os.rename(temp_path, final_path)
            print(f"Etape 2: {os.path.basename(temp_path)} -> {final_number}")
            success_count += 1
        except Exception as e:
            print(f"ERREUR renommage final {os.path.basename(temp_path)}: {e}")
            error_count += 1

    print(f"\n{'='*60}")
    print(f"TERMINE !")
    print(f"{success_count} photos renommees avec succes")
    if error_count > 0:
        print(f"{error_count} erreur(s)")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("=" * 60)
    print("APPLICATION DE L'ORDRE DES PHOTOS")
    print("=" * 60)
    apply_order_from_json()
    print("\n" + "=" * 60)
    input("\nAppuyez sur Entree pour fermer...")
