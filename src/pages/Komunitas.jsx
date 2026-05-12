import { useState, useEffect } from 'react';
import { Home, Bookmark, Bell, User, AlertCircle, Info, Plus, MessageSquare, X, Send, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Komunitas() {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, openLogin, openRegister, logout } = useAuth();
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const API_URL = 'http://localhost:5000/api';

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error('Gagal memuat data komunitas');
      setPosts(await res.json());
      setShowError(false);
    } catch (err) { setErrorMessage(err.message); setShowError(true); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchPosts(); }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({ content: newPostContent }),
      });
      if (!res.ok) {
        if (res.status===401||res.status===403) { logout(); throw new Error('Sesi berakhir. Silakan login kembali.'); }
        throw new Error('Gagal mengirim postingan');
      }
      setNewPostContent(''); fetchPosts();
    } catch (err) { setErrorMessage(err.message); setShowError(true); }
    finally { setIsPosting(false); }
  };

  const tabs = [
    { id:'Home',          icon:<Home className="w-4 h-4"/>,     label:'Beranda'   },
    { id:'Saved',         icon:<Bookmark className="w-4 h-4"/>, label:'Tersimpan' },
    { id:'Notifications', icon:<Bell className="w-4 h-4"/>,     label:'Notifikasi'},
    { id:'Profile',       icon:<User className="w-4 h-4"/>,     label:'Profil'    },
  ];

  const hues = [180,210,260,310,340,30,60,120];
  const uColor = (n='') => `hsl(${hues[(n.charCodeAt(0)||0)%hues.length]},55%,62%)`;
  const uBg    = (n='') => `hsla(${hues[(n.charCodeAt(0)||0)%hues.length]},55%,62%,0.13)`;
  const uInit  = (n='') => n.charAt(0).toUpperCase();

  const timeAgo = (d) => {
    const s = (Date.now()-new Date(d).getTime())/1000;
    if (s<60) return 'Baru saja';
    if (s<3600) return `${Math.floor(s/60)} menit lalu`;
    if (s<86400) return `${Math.floor(s/3600)} jam lalu`;
    return `${Math.floor(s/86400)} hari lalu`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-8">

      {/* Header */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background:'rgba(22,160,160,0.15)', boxShadow:'0 0 0 1px rgba(22,160,160,0.2)' }}>
            <Shield className="w-5 h-5 text-brand-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text">Ruang Aman</h1>
        </div>
        <p className="text-sm ml-12 max-w-lg" style={{ color:'var(--t-secondary)' }}>
          Komunitas anonim yang bebas dari penghakiman. Bagikan ceritamu dengan aman.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl"
           style={{ background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200"
            style={activeTab===tab.id ? {
              background:'rgba(22,160,160,0.18)', color:'var(--t-brand)',
              boxShadow:'0 0 0 1px rgba(22,160,160,0.2)',
            } : { color:'var(--t-muted)' }}>
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {showError && (
        <div className="flex items-center justify-between p-4 rounded-xl animate-slide-down"
             style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>
          <div className="flex items-center gap-3 text-sm"><AlertCircle className="w-5 h-5"/>{errorMessage}</div>
          <button onClick={() => setShowError(false)}><X className="w-4 h-4 opacity-70 hover:opacity-100"/></button>
        </div>
      )}

      {/* Auth / Post */}
      {!token ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl gap-4"
               style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.18)' }}>
            <div className="flex items-center gap-3 text-sm font-medium text-amber-500">
              <Info className="w-5 h-5"/>Mode Baca — Login untuk berinteraksi
            </div>
            <button onClick={openLogin} className="btn-primary text-xs py-2 px-5 rounded-xl">Login</button>
          </div>
          <div className="glass-card p-8 text-center flex flex-col items-center gap-3"
               style={{ border:'1px dashed rgba(22,160,160,0.25)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                 style={{ background:'rgba(22,160,160,0.12)', boxShadow:'0 0 0 1px rgba(22,160,160,0.2)' }}>
              <Plus className="w-7 h-7 text-brand-400"/>
            </div>
            <h3 className="text-lg font-bold" style={{ color:'var(--t-primary)' }}>Ingin berbagi cerita?</h3>
            <p className="text-sm max-w-sm" style={{ color:'var(--t-secondary)' }}>
              Login untuk membuat post anonim. Identitasmu tetap terjaga — hanya kamu yang tahu.
            </p>
            <button onClick={openRegister} className="btn-primary mt-2 py-2.5 px-7 text-sm rounded-xl">
              Daftar / Login untuk Posting
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleCreatePost} className="glass-card p-5 space-y-3">
          <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
            placeholder="Bagikan ceritamu dengan aman di sini..."
            className="input-field resize-none min-h-[100px] text-sm" required />
          <div className="flex justify-between items-center">
            <p className="text-xs flex items-center gap-1" style={{ color:'var(--t-muted)' }}>
              <Shield className="w-3 h-3"/> Identitasmu tersamarkan
            </p>
            <button type="submit" disabled={isPosting||!newPostContent.trim()}
              className="btn-primary flex items-center gap-2 py-2 px-5 text-sm rounded-xl">
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
              Kirim Anonim
            </button>
          </div>
        </form>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-400"/></div>
        ) : posts.length===0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                 style={{ background:'var(--bg-subtle)' }}>
              <MessageSquare className="w-8 h-8" style={{ color:'var(--t-muted)' }}/>
            </div>
            <h3 className="text-lg font-bold" style={{ color:'var(--t-primary)' }}>Belum ada post</h3>
            <p className="text-sm" style={{ color:'var(--t-secondary)' }}>Jadilah yang pertama berbagi cerita.</p>
          </div>
        ) : posts.map((post,idx) => (
          <div key={post.id} className="glass-card p-5 animate-slide-up" style={{ animationDelay:`${idx*0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                     style={{ background:uBg(post.username), color:uColor(post.username) }}>
                  {uInit(post.username)}
                </div>
                <div>
                  <span className="font-semibold text-sm" style={{ color:uColor(post.username) }}>{post.username}</span>
                  <p className="text-xs" style={{ color:'var(--t-muted)' }}>{timeAgo(post.created_at)}</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-medium"
                   style={{ background:'rgba(22,160,160,0.1)', color:'var(--t-brand)', border:'1px solid rgba(22,160,160,0.15)' }}>
                Anonim
              </div>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap pl-11" style={{ color:'var(--t-primary)' }}>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
