import { useTranslation } from 'react-i18next'
import { History, Plus, RotateCcw, Trash2, Clock } from 'lucide-react'
import { useBackupsState } from '../-use-playground'
import { Section, SectionHeader, TextInput } from '../-components'

export function BackupsTab() {
  const { t } = useTranslation()
  const {
    backups, backupName, setBackupName,
    backupMutation, restoreMutation, deleteMutation,
  } = useBackupsState()

  return (
    <div className="space-y-5">
      {/* Create backup */}
      <Section>
        <SectionHeader icon={Plus} title={t('playground.backups.create')} desc={t('playground.backups.createDesc')} />
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput
              value={backupName}
              onChange={setBackupName}
              placeholder={t('playground.backups.namePlaceholder')}
            />
          </div>
          <button
            onClick={() => { if (backupName.trim()) backupMutation.mutate(backupName.trim()) }}
            disabled={!backupName.trim() || backupMutation.isPending}
            className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 shrink-0"
          >
            {t('playground.backups.createBtn')}
          </button>
        </div>
      </Section>

      {/* Existing backups */}
      <Section>
        <SectionHeader icon={History} title={t('playground.backups.existing')} desc={t('playground.backups.existingDesc')} />
        {(!backups || backups.length === 0) ? (
          <div className="py-8 text-center text-sm text-foreground-muted">
            {t('playground.backups.empty')}
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-background-secondary">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{backup.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted mt-0.5">
                    <Clock size={11} />
                    {new Date(backup.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => restoreMutation.mutate(backup.id)}
                    disabled={restoreMutation.isPending}
                    className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    title={t('playground.backups.restore')}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(backup.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title={t('playground.backups.delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
