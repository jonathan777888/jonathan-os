def analyser_consigne(consigne: str) -> dict:
    """
    Agent consignes :
    - simplifie la consigne
    - extrait les exigences importantes
    - détecte les points de vigilance
    """
    if not consigne.strip():
        return {
            "explication": "Aucune consigne n'a été fournie.",
            "exigences": [],
            "points_vigilance": ["Ajouter une consigne avant de lancer l'analyse."]
        }

    texte = consigne.lower()

    exigences = []
    points_vigilance = []

    if any(mot in texte for mot in ["tableau", "liste", "format", "markdown", "pdf"]):
        exigences.append("Respecter le format demandé.")
        points_vigilance.append("Vérifier que la réponse finale utilise le bon format.")

    if any(mot in texte for mot in ["code", "python", "application", "fonction", "programme"]):
        exigences.append("Produire une solution technique claire.")
        points_vigilance.append("Vérifier que le code est lisible et testable.")

    if any(mot in texte for mot in ["corrige", "améliore", "vérifie", "qualité"]):
        exigences.append("Contrôler la qualité du résultat final.")
        points_vigilance.append("Relire la réponse avec une checklist qualité.")

    if any(mot in texte for mot in ["ce soir", "demain", "deadline", "urgent", "échéance"]):
        exigences.append("Respecter la contrainte de temps.")
        points_vigilance.append("Prioriser une version simple mais fonctionnelle.")

    if not exigences:
        exigences.append("Comprendre la demande et produire une réponse claire.")
        points_vigilance.append("Ne pas répondre trop vite : bien identifier le résultat attendu.")

    return {
        "explication": "La consigne doit être transformée en actions simples, organisées et vérifiables.",
        "exigences": exigences,
        "points_vigilance": points_vigilance
    }
