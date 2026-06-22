import streamlit as st

from agents.consignes import analyser_consigne
from agents.planificateur import creer_plan
from agents.controle_qualite import verifier_qualite


st.set_page_config(
    page_title="Jonathan OS",
    page_icon="🧠",
    layout="centered"
)

st.title("Jonathan OS")
st.subheader("Assistant d'agents IA pour comprendre, planifier et vérifier les consignes")

consigne = st.text_area(
    "Colle ta consigne ici :",
    height=180,
    placeholder="Exemple : Crée un plan de projet pour construire une application IA..."
)

if st.button("Analyser la consigne"):
    analyse = analyser_consigne(consigne)
    plan = creer_plan(consigne, analyse["exigences"])
    qualite = verifier_qualite(consigne, analyse["exigences"], plan)

    st.header("1. Explication simple")
    st.write(analyse["explication"])

    st.header("2. Exigences détectées")
    for exigence in analyse["exigences"]:
        st.markdown(f"- {exigence}")

    st.header("3. Plan d'action")
    for index, etape in enumerate(plan, start=1):
        st.markdown(f"{index}. {etape}")

    st.header("4. Contrôle qualité")
    for point, valide in qualite["checklist"].items():
        symbole = "✅" if valide else "❌"
        st.markdown(f"{symbole} {point}")

    st.subheader(f"Score : {qualite['score']}")
    st.subheader(f"Verdict : {qualite['verdict']}")
