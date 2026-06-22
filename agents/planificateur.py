def creer_plan(consigne: str, exigences: list) -> list:
    """
    Agent planificateur :
    transforme la consigne en plan d'action.
    """
    if not consigne.strip():
        return ["Ajouter une consigne avant de créer un plan."]

    plan = [
        "Lire la consigne attentivement.",
        "Identifier le résultat attendu.",
        "Repérer les contraintes importantes.",
        "Découper le travail en petites étapes.",
        "Construire une première version simple.",
        "Vérifier que chaque exigence est respectée.",
        "Améliorer la clarté et la qualité finale."
    ]

    if exigences:
        plan.append("Comparer le résultat final avec la liste des exigences détectées.")

    return plan
