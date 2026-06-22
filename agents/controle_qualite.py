def verifier_qualite(consigne: str, exigences: list, plan: list) -> dict:
    """
    Agent contrôle qualité :
    vérifie que l'analyse est complète.
    """
    checklist = {
        "Consigne présente": bool(consigne.strip()),
        "Exigences détectées": len(exigences) > 0,
        "Plan d'action créé": len(plan) > 0,
        "Plan suffisamment détaillé": len(plan) >= 5,
        "Résultat vérifiable": len(exigences) > 0 and len(plan) > 0
    }

    score = sum(checklist.values())
    total = len(checklist)

    if score == total:
        verdict = "Validé"
    elif score >= 3:
        verdict = "Correct, mais à améliorer"
    else:
        verdict = "À retravailler"

    return {
        "checklist": checklist,
        "score": f"{score}/{total}",
        "verdict": verdict
    }
