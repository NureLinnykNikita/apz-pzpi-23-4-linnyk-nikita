import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../i18n/locale';
import { adminApi } from '../../api/endpoints';
import { Card, Button, Input, Select, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import { useAuthStore } from '../../store/auth.store';
import type { Role } from '../../types';

const ROLES: Role[] = ['user', 'admin', 'contentManager', 'moderator'];

export function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin/users', search, roleFilter, page],
    queryFn: () => adminApi.getUsers({ search: search || undefined, role: (roleFilter as Role) || undefined, page, limit: 20 }).then(r => r.data),
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => adminApi.updateUser(userId, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin/users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin/users'] }); setConfirmDelete(null); },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 64, textAlign: 'center' }}>
        <Icons.Shield size={48} stroke="var(--lb-danger)" />
        <h2 className="lb-h2" style={{ color: 'var(--lb-danger)', margin: 0 }}>{t('admin.accessForbidden')}</h2>
        <p style={{ color: 'var(--lb-text-muted)', fontSize: 14, margin: 0 }}>{t('admin.accessForbiddenDesc')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <h1 className="lb-h1">{t('admin.users')}</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder={t('admin.search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          options={[
            { value: '', label: t('admin.allRoles') },
            ...ROLES.map(r => ({ value: r, label: r })),
          ]}
          style={{ width: 160 }}
        />
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 140px 130px 80px', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--lb-line)', background: 'var(--lb-panel-soft)' }}>
          {[t('settings.username'), t('settings.email'), t('admin.role'), t('admin.createdAt'), t('admin.actions')].map(h => (
            <span key={h} className="lb-eyebrow">{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : (data?.data ?? []).length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>{t('admin.noData')}</div>
        ) : (
          (data?.data ?? []).map((user, idx) => {
            const isSelf = user.userId === currentUser?.userId;
            return (
            <div
              key={user.userId}
              style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 140px 130px 80px', gap: 12, padding: '12px 20px', borderBottom: idx < (data?.data.length ?? 0) - 1 ? '1px solid var(--lb-line)' : 'none', alignItems: 'center', background: isSelf ? 'var(--lb-accent-tint)' : undefined }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {user.username}
                {isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--lb-accent)', fontWeight: 600, letterSpacing: '0.05em' }}>YOU</span>}
              </span>
              <span
                title={user.email}
                style={{ fontSize: 13, color: 'var(--lb-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}
              >{user.email}</span>
              {isSelf ? (
                <span style={{ fontSize: 12, color: 'var(--lb-text-muted)', padding: '5px 8px' }}>{user.role}</span>
              ) : (
                <Select
                  value={user.role}
                  onChange={e => updateRole.mutate({ userId: user.userId, role: e.target.value as Role })}
                  options={ROLES.map(r => ({ value: r, label: r }))}
                  style={{ padding: '5px 8px', fontSize: 12 }}
                />
              )}
              <span style={{ fontSize: 12, color: 'var(--lb-text-muted)', fontFamily: 'var(--lb-font-mono)' }}>
                {formatDate(user.createdAt, i18n.language)}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {!isSelf && (confirmDelete === user.userId ? (
                  <>
                    <button onClick={() => deleteUser.mutate(user.userId)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-danger)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>
                      {t('admin.yes')}
                    </button>
                    <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)', fontSize: 11, cursor: 'pointer' }}>
                      {t('admin.no')}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(user.userId)} style={{ padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Icons.Trash size={14} stroke="var(--lb-danger)" />
                  </button>
                ))}
              </div>
            </div>
            );
          })
        )}
      </Card>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <span style={{ fontSize: 13, color: 'var(--lb-text-muted)' }}>{page} / {Math.ceil(data.total / 20)}</span>
          <Button variant="ghost" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
