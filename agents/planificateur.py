def creer_plan(consigne: str, exigences: list) -> list:
    """
    Crée un plan d'action simple à partir de la consigne.
    """
    plan = [
        "Lire attentivement la consigne.",
        "Identifier le résultat attendu.",
        "Lister les exigences importantes.",
        "Découper le travail en petites étapes.",
        "Produire une première version.",
        "Vérifier la qualité avec une checklist."
    ]

    if exigences:
        plan.append("Comparer le résultat final avec chaque exigence détectée.")

    return plan
