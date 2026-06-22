import streamlit as st

from agents.consignes import analyser_consigne
from agents.planificateur import creer_plan
from agents.controle_qualite import verifier_qualite


st.set_page_config(
    page_title="Jonathan OS",
    page_icon="🧠",
    layout="wide"
)

st.title("🧠 Jonathan OS")
st.caption("Système d'agents pour comprendre les consignes, planifier le travail et contrôler la qualité.")

with st.sidebar:
    st.header("Agents disponibles")
    st.success("Agent consignes")
    st.success("Agent planificateur")
    st.success("Agent contrôle qualité")

    st.divider()

    st.subheader("Objectif MVP")
    st.write(
        "Transformer une consigne en explication claire, exigences, plan d'action "
        "et checklist qualité."
    )

st.header("1. Entrer une consigne")

consigne = st.text_area(
    "Colle ta consigne ici :",
    height=180,
    placeholder="Exemple : Crée un plan de projet pour construire une application IA avec Python, une interface simple, des tests et une checklist qualité."
)

col1, col2 = st.columns([1, 1])

with col1:
    analyser = st.button("Analyser avec Jonathan OS", type="primary")

with col2:
    exemple = st.button("Utiliser un exemple")

if exemple:
    consigne = (
        "Crée un plan de projet pour construire une application IA avec Python, "
        "une interface simple, des tests et une checklist qualité. Le résultat doit être clair, "
        "structuré et utilisable dans un portfolio GitHub."
    )

if analyser or exemple:
    analyse = analyser_consigne(consigne)
    plan = creer_plan(consigne, analyse["exigences"])
    qualite = verifier_qualite(consigne, analyse["exigences"], plan)

    st.divider()

    tab1, tab2, tab3, tab4 = st.tabs([
        "Explication",
        "Exigences",
        "Plan d'action",
        "Contrôle qualité"
    ])

    with tab1:
        st.subheader("Explication simple")
        st.write(analyse["explication"])

        st.subheader("Consigne analysée")
        st.info(consigne if consigne.strip() else "Aucune consigne fournie.")

    with tab2:
        st.subheader("Exigences détectées")
        for exigence in analyse["exigences"]:
            st.markdown(f"- {exigence}")

        st.subheader("Points de vigilance")
        for point in analyse["points_vigilance"]:
            st.warning(point)

    with tab3:
        st.subheader("Plan d'action")
        for index, etape in enumerate(plan, start=1):
            st.markdown(f"**{index}.** {etape}")

    with tab4:
        st.subheader("Checklist qualité")

        for point, valide in qualite["checklist"].items():
            if valide:
                st.success(f"✅ {point}")
            else:
                st.error(f"❌ {point}")

        st.metric("Score qualité", qualite["score"])
        st.subheader(f"Verdict : {qualite['verdict']}")

    st.divider()
    st.success("Analyse terminée avec Jonathan OS.")
