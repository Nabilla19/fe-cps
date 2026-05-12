import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, MessageSquare, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ users: 0, posts: 0 });
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, postsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/posts`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers })
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Yakin ingin menghapus postingan ini?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`YAKIN INGIN MENGHAPUS USER ${username}? Ini akan menghapus semua data (post & mood) miliknya!`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
      else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-rose-500" />
            <span className="gradient-text" style={{ backgroundImage: 'linear-gradient(to right, #f43f5e, #fb923c)' }}>Admin Panel</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--t-secondary)' }}>Moderasi komunitas dan pantau statistik aplikasi.</p>
        </div>
        <button onClick={fetchData} className="btn-ghost p-2 rounded-xl" title="Refresh Data">
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: 'var(--t-brand)' }} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/10">
            <Users className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--t-secondary)' }}>Total Pengguna</p>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-500/10">
            <MessageSquare className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--t-secondary)' }}>Total Postingan</p>
            <p className="text-3xl font-bold">{stats.posts}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Manajemen Pengguna</h2>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
        ) : users.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--t-muted)' }}>Belum ada pengguna terdaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ color: 'var(--t-primary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--t-secondary)' }}>
                  <th className="py-3 px-2 text-sm font-semibold">ID</th>
                  <th className="py-3 px-2 text-sm font-semibold">Username</th>
                  <th className="py-3 px-2 text-sm font-semibold">Role</th>
                  <th className="py-3 px-2 text-sm font-semibold">Tgl Daftar</th>
                  <th className="py-3 px-2 text-sm font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-2 text-sm">{u.id}</td>
                    <td className="py-3 px-2 text-sm font-medium">@{u.username}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs" style={{ color: 'var(--t-secondary)' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button onClick={() => handleDeleteUser(u.id, u.username)} 
                              className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                              title="Hapus Pengguna"
                              disabled={u.role === 'admin'}
                              style={{ opacity: u.role === 'admin' ? 0.3 : 1, cursor: u.role === 'admin' ? 'not-allowed' : 'pointer' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Moderasi Safe Space</h2>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
        ) : posts.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--t-muted)' }}>Belum ada postingan di komunitas.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="p-4 rounded-xl border flex justify-between gap-4" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">ID: {post.id}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--t-primary)' }}>@{post.username}</span>
                    <span className="text-xs" style={{ color: 'var(--t-muted)' }}>{new Date(post.created_at).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--t-secondary)' }}>{post.content}</p>
                </div>
                <button onClick={() => handleDeletePost(post.id)} className="shrink-0 text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg self-start transition-colors" title="Hapus Postingan">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
