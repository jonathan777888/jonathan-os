def verifier_qualite(consigne: str, exigences: list, plan: list) -> dict:
    """
    Vérifie si l'analyse contient les éléments essentiels.
    """
    checklist = {
        "Consigne présente": bool(consigne.strip()),
        "Exigences détectées": len(exigences) > 0,
        "Plan créé": len(plan) > 0,
        "Étapes claires": all(isinstance(etape, str) and len(etape) > 5 for etape in plan)
    }

    score = sum(checklist.values())
    total = len(checklist)

    verdict = "Validé" if score == total else "À améliorer"

    return {
        "checklist": checklist,
        "score": f"{score}/{total}",
        "verdict": verdict
    }
