import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/endpoints';
import { Card, Button } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import { useAuthStore } from '../../store/auth.store';

export function AdminBackupPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportData();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `langbang-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    setImportSuccess('');
    try {
      await adminApi.importData(file);
      setImportSuccess(t('admin.importSuccess'));
    } catch {
      setImportError(t('admin.importError'));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 64, textAlign: 'center' }}>
        <Icons.Shield size={48} stroke="var(--lb-danger)" />
        <h2 className="lb-h2" style={{ color: 'var(--lb-danger)', margin: 0 }}>{t('admin.accessForbidden')}</h2>
        <p style={{ color: 'var(--lb-text-muted)', fontSize: 14, margin: 0 }}>{t('admin.accessForbiddenDesc')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 640, animation: 'fadeIn 0.2s ease' }}>
      <h1 className="lb-h1">{t('admin.backup')}</h1>

      {/* Export */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--lb-radius-md)', background: 'var(--lb-accent-tint)', border: '1px solid var(--lb-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Download size={20} stroke="var(--lb-accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t('admin.export')}</div>
            <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginBottom: 16 }}>{t('admin.exportDesc')}</div>
            <Button onClick={handleExport} disabled={exporting}>
              <Icons.Download size={14} />
              {exporting ? t('common.loading') : t('admin.exportBtn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Import */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--lb-radius-md)', background: 'rgba(196,106,74,0.1)', border: '1px solid var(--lb-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Upload size={20} stroke="var(--lb-secondary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t('admin.import')}</div>
            <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginBottom: 16 }}>{t('admin.importDesc')}</div>

            {importSuccess && (
              <div style={{ padding: '8px 12px', background: 'rgba(168,196,162,0.15)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-success)', fontSize: 13, marginBottom: 12 }}>
                {importSuccess}
              </div>
            )}
            {importError && (
              <div style={{ padding: '8px 12px', background: 'rgba(215,114,96,0.1)', border: '1px solid var(--lb-danger)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-danger)', fontSize: 13, marginBottom: 12 }}>
                {importError}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
              <Icons.Upload size={14} />
              {importing ? t('common.loading') : t('admin.importBtn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card style={{ background: 'var(--lb-panel-soft)' }}>
        <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: 'var(--lb-text)', marginBottom: 8 }}>Backup format</div>
          <p style={{ margin: 0 }}>
            The export file contains all courses, lessons, exercises, languages, and achievements in JSON format.
            User data and passwords are not included for security reasons.
            Use import to restore this data on another environment.
          </p>
        </div>
      </Card>
    </div>
  );
}
