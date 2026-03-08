// import { useState, useEffect } from "react";
const { useState, useEffect } = React;

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBx5CNR1aFlWUbhnk0Vn8ZqZOMhbtso8OA",
  authDomain: "site-caffe.firebaseapp.com",
  projectId: "site-caffe",
  storageBucket: "site-caffe.firebasestorage.app",
  messagingSenderId: "580876148754",
  appId: "1:580876148754:web:30639f437f5f7672c5f8cb",
  measurementId: "G-F7T6KM2XEL"
};

const RANKING_FALLBACK_DATA = [
  { id: 1, name: "João Silva", points: 1250, email: "joao@exemplo.com" },
  { id: 2, name: "Maria Oliveira", points: 980, email: "maria@exemplo.com" },
  { id: 3, name: "Pedro Santos", points: 850, email: "pedro@exemplo.com" },
  { id: 4, name: "Ana Beatriz", points: 720, email: "ana@exemplo.com" },
  { id: 5, name: "Lucas Lima", points: 450, email: "lucas@exemplo.com" },
];

// Inicializa Firebase se ainda não foi inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.firestore().enablePersistence().catch(() => {});
}
const db = firebase.firestore();

function GlobalRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  // Efeito para carregar usuário e escutar mudanças
  useEffect(() => {
    console.log("Ranking: Iniciando componente...");
    
    const loadUser = () => {
      const savedUser = localStorage.getItem("loggedInUser");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log("Ranking: Usuário detectado:", user.email);
        setCurrentUser(user);
        const currentPoints = parseInt(localStorage.getItem("userPoints")) || 0;
        syncPointsToFirebase(user, currentPoints);
      } else {
        console.log("Ranking: Nenhum usuário logado");
        setCurrentUser(null);
      }
    };

    loadUser();

    // Listener para o ranking no Firestore
    const unsubscribe = db.collection("ranking")
      .orderBy("points", "desc")
      .limit(10)
      .onSnapshot((snapshot) => {
        console.log("Ranking: Snapshot recebido do Firebase");
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRanking(data);
          setError(null);
        } else {
          console.warn("Ranking: Banco vazio, usando fallbacks");
          setRanking(RANKING_FALLBACK_DATA);
        }
        setLoading(false);
      }, (err) => {
        console.error("Ranking: Erro Firebase:", err);
        setError("Offline");
        setRanking(RANKING_FALLBACK_DATA);
        setLoading(false);
      });

    // Eventos globais do site
    const handlePointsUpdate = (e) => {
      console.log("Ranking: Evento pointsUpdated capturado");
      const savedUser = localStorage.getItem("loggedInUser");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        syncPointsToFirebase(user, e.detail.points || parseInt(localStorage.getItem("userPoints")) || 0);
      }
    };

    const handleStorage = (e) => {
      if (e.key === "loggedInUser") {
        console.log("Ranking: Mudança de login detectada");
        loadUser();
      }
    };

    window.addEventListener("pointsUpdated", handlePointsUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("pointsUpdated", handlePointsUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const syncPointsToFirebase = (user, points) => {
    if (!user || !user.email) return;
    console.log(`Ranking: Sincronizando ${user.email} -> ${points} pts`);
    db.collection("ranking").doc(user.email).set({
      name: user.name,
      email: user.email,
      points: points || 0,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(err => console.error("Ranking: Erro sync:", err));
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      backgroundColor: 'transparent',
      padding: '20px',
      borderRadius: '15px',
      color: '#f1f5f9'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .rank-row { animation: fadeIn 0.4s ease forwards; opacity: 0; }
        .gold-glow { box-shadow: 0 0 15px rgba(212, 163, 115, 0.2); border: 1px solid rgba(212, 163, 115, 0.4) !important; }
        .point-pulse { font-weight: 800; color: #000000ff; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "20px", margin: 0, color: '#000000ff' }}>🏆 Ranking Global</h2>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>
            {error ? "Modo Offline" : "Top Competidores"}
          </p>
        </div>
        {currentUser && (
          <button 
            onClick={() => syncPointsToFirebase(currentUser, parseInt(localStorage.getItem("userPoints")) || 0)}
            style={{ background: "rgba(30, 30, 46, 0.5)", border: "1px solid rgba(61, 61, 95, 0.5)", color: "#000000ff", fontSize: "10px", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Sincronizar
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>Carregando dados...</div>
        ) : (
          <>
            {ranking.slice(0, 5).map((user, index) => {
              const isMe = currentUser && user.email === currentUser.email;
              let medal = "";
              let color = index < 3 ? "#000000ff" : "#64748b";
              if (index === 0) medal = "🥇 ";
              else if (index === 1) medal = "🥈 ";
              else if (index === 2) medal = "🥉 ";

              return (
                <div 
                  key={user.id || user.email || index} 
                  className={`rank-row ${isMe ? 'gold-glow' : ''}`}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "12px 15px", 
                    backgroundColor: isMe ? "rgba(26, 26, 40, 0.6)" : "rgba(26, 26, 40, 0.4)", 
                    borderRadius: "10px",
                    border: isMe ? "1px solid #000000ff" : "1px solid rgba(113, 113, 122, 0.3)",
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontWeight: 'bold', color: color, width: "25px", fontSize: "14px" }}>
                      {medal || `${index + 1}º`}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: isMe ? "#fff" : "#cbd5e1" }}>
                      {user.name} {isMe && "(Você)"}
                    </span>
                  </div>
                  <span className="point-pulse" style={{ fontSize: "14px", color: "#000000ff", fontWeight: "800" }}>
                    {(user.points || 0).toLocaleString('pt-BR')} pts
                  </span>
                </div>
              );
            })}

            {/* Linha "Você" se não estiver no Top 5 */}
            {currentUser && !ranking.slice(0, 5).some(u => u.email === currentUser.email) && (
              <>
                <div style={{ textAlign: 'center', color: '#3d3d5f', fontSize: '10px', margin: '2px 0' }}>•••</div>
                <div 
                  className="rank-row gold-glow"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    padding: "12px 15px", 
                    background: "#1a1a28", 
                    borderRadius: "10px",
                    border: "1px solid #000000ff",
                    animationDelay: "0.3s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, width: "25px", color: "#64748b" }}>?</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#fff" }}>
                      {currentUser.name} (Você)
                    </span>
                  </div>
                  <span className="point-pulse" style={{ fontSize: "13px", color: "#000000ff", fontWeight: "800" }}>
                    {(parseInt(localStorage.getItem("userPoints")) || 0).toLocaleString('pt-BR')} pts
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#3d3d5f' }}>
        Ganhe pontos fazendo pedidos e avaliando produtos
      </p>
    </div>
  );
}

// Inicialização robusta do React
function initRanking() {
  const container = document.getElementById('jsx-ranking-container');
  if (container) {
    console.log("Ranking: Montando componente no container...");
    const root = ReactDOM.createRoot(container);
    root.render(<GlobalRanking />);
  } else {
    // Tenta novamente em 500ms se o container ainda não existir
    console.warn("Ranking: Container não encontrado, tentando novamente em 500ms...");
    setTimeout(initRanking, 500);
  }
}

initRanking();
