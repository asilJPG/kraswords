import ThemeForm from '@/components/admin/ThemeForm'

export default function NewThemePage() {
  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>новая тема</h1>
      <ThemeForm mode="create" />
    </div>
  )
}
