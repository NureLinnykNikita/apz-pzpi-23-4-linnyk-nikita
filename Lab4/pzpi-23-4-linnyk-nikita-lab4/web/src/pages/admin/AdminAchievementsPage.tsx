import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { achievementsApi, adminApi } from '../../api/endpoints';
import { Card, Button, Input, Modal, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import { useAuthStore } from '../../store/auth.store';
import type { Achievement } from '../../types';

const CONDITION_TYPES = ['exercises_completed', 'points_earned', 'streak_days', 'courses_completed'];

const emptyForm = {
  code: '', title: '', description: '', category: '',
  conditionType: 'exercises_completed', conditionValue: '10',
};

export function AdminAchievementsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [grantOpen, setGrantOpen] = useState<Achievement | null>(null);
  const [grantUserId, setGrantUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ userId: string; username: string; email: string } | null>(null);
  const [grantError, setGrantError] = useState('');
  const [grantSuccess, setGrantSuccess] = useState('');

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsApi.getAll().then(r => r.data.achievements),
  });

  // Search users — only for admin, enabled when modal is open and there's a search term
  const { data: userResults = [] } = useQuery({
    queryKey: ['admin/users', userSearch],
    queryFn: () => adminApi.getUsers({ search: userSearch, limit: 8 }).then(r => r.data.data),
    enabled: isAdmin && grantOpen !== null && userSearch.trim().length >= 2,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: Achievement) => {
    setEditing(a);
    setForm({
      code: a.code,
      title: a.title,
      description: a.description,
      category: a.category,
      conditionType: a.conditionType,
      conditionValue: String(a.conditionValue),
    });
    setModalOpen(true);
  };

  const closeGrant = () => {
    setGrantOpen(null);
    setGrantUserId('');
    setUserSearch('');
    setSelectedUser(null);
    setGrantError('');
    setGrantSuccess('');
  };

  const createMutation = useMutation({
    mutationFn: () => achievementsApi.create({
      code: form.code, title: form.title, description: form.description,
      category: form.category, conditionType: form.conditionType,
      conditionValue: Number(form.conditionValue),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['achievements'] }); setModalOpen(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: () => achievementsApi.update(editing!.achievementId, {
      title: form.title, description: form.description,
      category: form.category, conditionType: form.conditionType,
      conditionValue: Number(form.conditionValue),
    } as Partial<Achievement>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['achievements'] }); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => achievementsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['achievements'] }); setConfirmDelete(null); },
  });

  const grantMutation = useMutation({
    mutationFn: () => achievementsApi.grant(grantUserId.trim(), grantOpen!.achievementId),
    onSuccess: () => {
      setGrantSuccess('Achievement granted successfully');
      setTimeout(() => closeGrant(), 1500);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setGrantError(msg || 'Failed to grant achievement');
    },
  });

  const selectUser = (u: { userId: string; username: string; email: string }) => {
    setSelectedUser(u);
    setGrantUserId(u.userId);
    setUserSearch('');
    setGrantError('');
  };

  const field = (key: keyof typeof form) => (
    <input
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ width: '100%', background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-text)', fontFamily: 'var(--lb-font-sans)', fontSize: 14, padding: '9px 12px', outline: 'none', boxSizing: 'border-box' }}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="lb-h1">{t('admin.achievements')}</h1>
        <Button size="sm" onClick={openCreate}>
          <Icons.Plus size={14} />{t('admin.create')}
        </Button>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 80px 120px', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--lb-line)', background: 'var(--lb-panel-soft)' }}>
            {['Code', t('admin.title'), t('admin.category'), 'Value', t('admin.actions')].map(h => (
              <span key={h} className="lb-eyebrow">{h}</span>
            ))}
          </div>

          {achievements.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>{t('admin.noData')}</div>
          ) : achievements.map((a, idx) => (
            <div
              key={a.achievementId}
              style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 80px 120px', gap: 12, padding: '12px 20px', borderBottom: idx < achievements.length - 1 ? '1px solid var(--lb-line)' : 'none', alignItems: 'center' }}
            >
              <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-accent)' }}>{a.code}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 2 }}>{a.description}</div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--lb-text-muted)' }}>{a.category}</span>
              <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 13 }}>{a.conditionValue}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => openEdit(a)}
                  title="Edit"
                  style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}
                >
                  <Icons.Edit size={14} stroke="var(--lb-accent)" />
                </button>
                <button
                  onClick={() => setGrantOpen(a)}
                  title="Grant to user"
                  style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}
                >
                  <Icons.Check size={14} stroke="var(--lb-success)" />
                </button>
                {confirmDelete === a.achievementId ? (
                  <>
                    <button onClick={() => deleteMutation.mutate(a.achievementId)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-danger)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>{t('admin.yes')}</button>
                    <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)', fontSize: 11, cursor: 'pointer' }}>{t('admin.no')}</button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(a.achievementId)}
                    style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}
                  >
                    <Icons.Trash size={14} stroke="var(--lb-danger)" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={(editing ? t('admin.edit') : t('admin.create')) + ' achievement'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!editing && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', display: 'block', marginBottom: 6 }}>Code</label>
              {field('code')}
            </div>
          )}
          {(['title', 'description', 'category'] as const).map(f => (
            <div key={f}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', display: 'block', marginBottom: 6 }}>{t(`admin.${f}`)}</label>
              {field(f)}
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', display: 'block', marginBottom: 6 }}>Condition type</label>
            <select
              value={form.conditionType}
              onChange={e => setForm(f => ({ ...f, conditionType: e.target.value }))}
              style={{ width: '100%', background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-text)', fontFamily: 'var(--lb-font-sans)', fontSize: 14, padding: '9px 12px', outline: 'none' }}
            >
              {CONDITION_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>
          </div>
          <Input label="Condition value" type="number" value={form.conditionValue} onChange={e => setForm(f => ({ ...f, conditionValue: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('admin.cancel')}</Button>
            <Button
              onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              disabled={!form.code || !form.title || createMutation.isPending || updateMutation.isPending}
            >
              {t('admin.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Grant modal */}
      <Modal
        open={grantOpen !== null}
        onClose={closeGrant}
        title={t('admin.grantAchievement')}
      >
        {grantOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Achievement badge */}
            <div style={{ padding: '10px 14px', background: 'var(--lb-panel-soft)', borderRadius: 'var(--lb-radius-sm)', fontSize: 13 }}>
              <span style={{ fontFamily: 'var(--lb-font-mono)', color: 'var(--lb-accent)', marginRight: 10 }}>{grantOpen.code}</span>
              {grantOpen.title}
            </div>

            {/* Selected user preview */}
            {selectedUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(168,196,162,0.12)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)' }}>
                <Icons.User size={16} stroke="var(--lb-success)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedUser.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--lb-text-muted)' }}>{selectedUser.email}</div>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setGrantUserId(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <Icons.X size={14} stroke="var(--lb-text-muted)" />
                </button>
              </div>
            )}

            {/* User search — admin only */}
            {isAdmin && !selectedUser && (
              <div style={{ position: 'relative' }}>
                <Input
                  label={t('admin.searchUsers')}
                  placeholder={t('admin.searchUsers')}
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setGrantError(''); }}
                />
                {userResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', zIndex: 10, maxHeight: 200, overflowY: 'auto', marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    {userResults.map(u => (
                      <button
                        key={u.userId}
                        onClick={() => selectUser(u)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--lb-line)', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <Icons.User size={14} stroke="var(--lb-text-muted)" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lb-text)' }}>{u.username}</div>
                          <div style={{ fontSize: 11, color: 'var(--lb-text-muted)' }}>{u.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* UUID input — always available, labelled as "or manual" for admins */}
            {!selectedUser && (
              <Input
                label={isAdmin ? t('admin.orEnterUuid') : t('admin.userId')}
                value={grantUserId}
                onChange={e => { setGrantUserId(e.target.value); setGrantError(''); }}
                placeholder="User UUID"
              />
            )}

            {grantError && (
              <div style={{ padding: '8px 12px', background: 'rgba(215,114,96,0.12)', border: '1px solid var(--lb-danger)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-danger)', fontSize: 13 }}>
                {grantError}
              </div>
            )}
            {grantSuccess && (
              <div style={{ padding: '8px 12px', background: 'rgba(168,196,162,0.15)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-success)', fontSize: 13 }}>
                {grantSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" onClick={closeGrant}>{t('admin.cancel')}</Button>
              <Button
                onClick={() => { setGrantError(''); grantMutation.mutate(); }}
                disabled={!grantUserId.trim() || grantMutation.isPending}
              >
                {t('admin.grantAchievement')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
