import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Create target directory if not exists
os.makedirs("/Users/mac/development/medi/thesis_assets", exist_ok=True)

# Set global styles
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10

def draw_system_architecture():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    # Title
    ax.text(5, 5.6, "MediConnect Full-Stack System Architecture", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1e293b')

    # Styles
    box_props_client = dict(boxstyle="round,pad=0.5", fc="#eff6ff", ec="#3b82f6", lw=1.5)
    box_props_server = dict(boxstyle="round,pad=0.5", fc="#f0fdf4", ec="#22c55e", lw=1.5)
    box_props_db = dict(boxstyle="round,pad=0.5", fc="#faf5ff", ec="#a855f7", lw=1.5)
    box_props_cache = dict(boxstyle="round,pad=0.5", fc="#fffbeb", ec="#f59e0b", lw=1.5)

    # 1. Client Layer
    ax.text(2, 4, "React Client (Frontend)\n(Vite + TanStack Router)", 
            ha='center', va='center', fontweight='bold', bbox=box_props_client)
    ax.text(2, 2.7, "UI Views:\n- Schematic SVG Map\n- Facility Directory\n- Editable Emergency Card\n- Triage Assistant UI", 
            ha='center', va='center', fontsize=9, bbox=dict(boxstyle="round,pad=0.4", fc="#ffffff", ec="#cbd5e1", lw=1))

    # 2. Local Cache
    ax.text(2, 1, "HTML5 localStorage\n(Offline Cache Store)", 
            ha='center', va='center', fontweight='bold', bbox=box_props_cache)

    # 3. Server Layer
    ax.text(6.5, 4, "Node.js & Express API Server\n(Docker / Render.com)", 
            ha='center', va='center', fontweight='bold', bbox=box_props_server)
    ax.text(6.5, 2.7, "Backend Modules:\n- Haversine Geospatial Filter\n- Rule-based Triage Engine\n- Wait-time Update Router\n- Zod Schema Validator", 
            ha='center', va='center', fontsize=9, bbox=dict(boxstyle="round,pad=0.4", fc="#ffffff", ec="#cbd5e1", lw=1))

    # 4. Database Layer
    ax.text(6.5, 1, "Firebase Firestore Database\n(with In-Memory Fallback)", 
            ha='center', va='center', fontweight='bold', bbox=box_props_db)

    # Draw Arrows with descriptions
    # Client <-> Server
    ax.annotate("", xy=(5.2, 4), xytext=(3.3, 4), arrowprops=dict(arrowstyle="<->", lw=1.5, color='#475569'))
    ax.text(4.25, 4.2, "REST HTTP API\n(JSON)", ha='center', va='center', fontsize=8, color='#475569')

    # Server <-> DB
    ax.annotate("", xy=(6.5, 1.4), xytext=(6.5, 2.1), arrowprops=dict(arrowstyle="<->", lw=1.5, color='#475569'))
    ax.text(7.2, 1.7, "Firestore SDK", ha='left', va='center', fontsize=8, color='#475569')

    # Client <-> Cache
    ax.annotate("", xy=(2, 1.4), xytext=(2, 2.1), arrowprops=dict(arrowstyle="<->", lw=1.5, color='#475569'))
    ax.text(2.6, 1.7, "Local State Sync", ha='left', va='center', fontsize=8, color='#475569')

    # Network Status Line (dashed)
    ax.plot([4.25, 4.25], [0.5, 5.0], color="#94a3b8", linestyle="--", lw=1)
    ax.text(4.25, 0.3, "Network Boundary", ha='center', va='center', fontsize=8, fontweight='bold', color='#64748b')

    plt.tight_layout()
    plt.savefig("/Users/mac/development/medi/thesis_assets/system_architecture.png", bbox_inches='tight')
    plt.close()

def draw_triage_tree():
    fig, ax = plt.subplots(figsize=(11, 7), dpi=300)
    ax.axis('off')
    ax.set_xlim(-1, 10)
    ax.set_ylim(-1, 8)

    # Styles
    style_root = dict(boxstyle="round,pad=0.5", fc="#eff6ff", ec="#2563eb", lw=1.5)
    style_question = dict(boxstyle="round,pad=0.4", fc="#fffbeb", ec="#d97706", lw=1.5)
    style_emergency = dict(boxstyle="round,pad=0.4", fc="#fef2f2", ec="#dc2626", lw=1.5)
    style_recommend = dict(boxstyle="round,pad=0.4", fc="#f0fdf4", ec="#16a34a", lw=1.5)

    # Draw nodes
    # Root
    ax.text(0, 3.5, "Triage Entry Point\n(triage_root)", ha='center', va='center', fontweight='bold', bbox=style_root)

    # Level 1 choices
    choices = [
        ("Chest Pain /\nDifficulty Breathing", 6.5, style_emergency, "Stroke Emergency:\nCall 999"),
        ("Child / Baby\nIllness", 5, style_emergency, "Paediatric Emergency:\nCall 999"),
        ("Pregnancy /\nMaternity", 3.5, style_emergency, "Maternity Emergency:\nCall 999"),
        ("Toothache /\nDental Emergency", 2, style_recommend, "Dental Urgency:\nUrgent Care / NHS 111"),
        ("Mental Health\nCrisis", 0.5, style_recommend, "Psychiatric Crisis:\nCrisis Line / Urgent Care"),
        ("Medication Question\n/ Refill", -0.5, style_recommend, "Pharmacy:\nLate-night Pharmacist"),
    ]

    for label, y, style, out_text in choices:
        # Arrow
        ax.annotate("", xy=(3, y), xytext=(1.2, 3.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#64748b'))
        # Choice label
        ax.text(1.9, (y + 3.5)/2 + 0.1, label, ha='center', va='center', fontsize=7.5, color='#475569',
                bbox=dict(boxstyle="round,pad=0.1", fc="#ffffff", ec="#e2e8f0", alpha=0.9))
        # Outcome Box
        ax.text(4.5, y, out_text, ha='center', va='center', fontsize=8, bbox=style)

    # Minor Injury choice (leads to nested node)
    y_minor = 7.5
    ax.annotate("", xy=(3, y_minor), xytext=(1.2, 3.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#64748b'))
    ax.text(1.8, (y_minor + 3.5)/2, "Minor Injury /\nSudden Illness", ha='center', va='center', fontsize=7.5, color='#475569',
            bbox=dict(boxstyle="round,pad=0.1", fc="#ffffff", ec="#e2e8f0", alpha=0.9))
    
    # Nested Question Node
    ax.text(4.5, y_minor, "Injury Assessment\n(triage_injury_triage)", ha='center', va='center', fontweight='bold', bbox=style_question)

    # Sub choices from Injury Assessment
    ax.annotate("", xy=(8, 7.8), xytext=(5.7, 7.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#64748b'))
    ax.text(6.7, 7.8, "Yes (Heavy bleeding\n/ unconscious)", ha='center', va='center', fontsize=7, color='#475569',
            bbox=dict(boxstyle="round,pad=0.1", fc="#ffffff", ec="#e2e8f0", alpha=0.9))
    ax.text(8.8, 7.8, "Emergency A&E:\nCall 999", ha='center', va='center', fontsize=8, bbox=style_emergency)

    ax.annotate("", xy=(8, 6.8), xytext=(5.7, 7.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#64748b'))
    ax.text(6.7, 7.0, "No", ha='center', va='center', fontsize=7, color='#475569',
            bbox=dict(boxstyle="round,pad=0.1", fc="#ffffff", ec="#e2e8f0", alpha=0.9))
    ax.text(8.8, 6.8, "Urgent Care:\nGP or Walk-in clinic", ha='center', va='center', fontsize=8, bbox=style_recommend)

    # Title
    ax.text(4.5, -1, "MediConnect Symptom Triage Decision Flow Graph", 
            ha='center', va='center', fontsize=12, fontweight='bold', color='#1e293b')

    plt.tight_layout()
    plt.savefig("/Users/mac/development/medi/thesis_assets/triage_decision_tree.png", bbox_inches='tight')
    plt.close()

def draw_offline_flowchart():
    fig, ax = plt.subplots(figsize=(8, 7), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 8)

    # Title
    ax.text(4, 7.6, "Offline-First State Transition Flowchart", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#1e293b')

    box_start = dict(boxstyle="darrow,pad=0.4", fc="#eff6ff", ec="#2563eb", lw=1.5)
    box_dec = dict(boxstyle="sawtooth,pad=0.5", fc="#fffbeb", ec="#d97706", lw=1.5) # Diamond / Decision shape simulation
    box_action = dict(boxstyle="round,pad=0.5", fc="#f0fdf4", ec="#16a34a", lw=1.5)
    box_alert = dict(boxstyle="round,pad=0.5", fc="#fef2f2", ec="#dc2626", lw=1.5)

    # Start Event
    ax.text(4, 6.6, "HTTP Request Initiated / App Load", ha='center', va='center', fontweight='bold', bbox=box_start)
    
    # Arrow down
    ax.annotate("", xy=(4, 5.2), xytext=(4, 6.1), arrowprops=dict(arrowstyle="->", lw=1.5, color='#475569'))

    # Decision Node
    ax.text(4, 4.6, "Is Network Connection\nAvailable? (online)", ha='center', va='center', fontweight='bold', bbox=box_dec)

    # Path 1: Yes (Online)
    ax.annotate("", xy=(6.5, 4.6), xytext=(5.5, 4.6), arrowprops=dict(arrowstyle="->", lw=1.5, color='#22c55e'))
    ax.text(6.0, 4.8, "YES", ha='center', va='center', fontsize=8, color='#16a34a', fontweight='bold')
    
    ax.text(6.5, 3.2, "1. Fetch live data from Express Server\n2. Save data to local localStorage\n3. Poll for updates every 60s\n4. Show green status indicators", 
            ha='left', va='center', fontsize=8, bbox=box_action)

    # Path 2: No (Offline / Low Signal)
    ax.annotate("", xy=(1.5, 4.6), xytext=(2.5, 4.6), arrowprops=dict(arrowstyle="->", lw=1.5, color='#ef4444'))
    ax.text(2.0, 4.8, "NO", ha='center', va='center', fontsize=8, color='#dc2626', fontweight='bold')
    
    ax.text(1.5, 3.2, "1. Stop server-side fetch calls\n2. Load cached data from localStorage\n3. Filter out nearest 5 facilities only\n4. Display amber offline warning banner", 
            ha='right', va='center', fontsize=8, bbox=box_alert)

    # Reconnect Loop
    ax.annotate("", xy=(4, 1.8), xytext=(6.5, 2.2), arrowprops=dict(arrowstyle="->", lw=1.2, color='#475569'))
    ax.annotate("", xy=(4, 1.8), xytext=(1.5, 2.2), arrowprops=dict(arrowstyle="->", lw=1.2, color='#475569'))
    ax.text(4, 1.8, "Update UI & Map Views", ha='center', va='center', fontweight='bold', bbox=dict(boxstyle="round,pad=0.4", fc="#f8fafc", ec="#94a3b8", lw=1.5))

    # Loop back arrow from bottom to top
    ax.annotate("", xy=(4, 6.2), xytext=(4, 1.4), arrowprops=dict(arrowstyle="->", lw=1, color='#94a3b8', connectionstyle="arc3,rad=-1.2"))
    ax.text(7.6, 3.8, "Triggered on network state change event", ha='center', va='center', fontsize=7, rotation=90, color='#64748b')

    plt.tight_layout()
    plt.savefig("/Users/mac/development/medi/thesis_assets/offline_handling_flowchart.png", bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    draw_system_architecture()
    draw_triage_tree()
    draw_offline_flowchart()
    print("SUCCESS: 3 thesis diagrams generated successfully!")
