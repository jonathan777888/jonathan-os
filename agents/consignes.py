def analyser_consigne(consigne: str) -> dict:
    """
    Analyse une consigne et retourne une explication simple
    ainsi que les exigences principales.
    """
    if not consigne.strip():
        return {
            "explication": "Aucune consigne fournie.",
            "exigences": []
        }

    exigences = []

    mots_cles = {
        "format": ["format", "tableau", "liste", "pdf", "markdown"],
        "date": ["date", "deadline", "échéance", "demain", "ce soir"],
        "qualité": ["vérifie", "corrige", "améliore", "qualité"],
        "code": ["code", "python", "application", "fonction", "bug"]
    }

    for categorie, mots in mots_cles.items():
        for mot in mots:
            if mot.lower() in consigne.lower():
                exigences.append(f"Attention à l'exigence liée à : {categorie}")
                break

    if not exigences:
        exigences.append("Comprendre clairement la demande avant de produire une réponse.")

    return {
        "explication": "La consigne doit être transformée en actions claires et vérifiables.",
        "exigences": exigences
    }
