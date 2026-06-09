import CrosswordEditor from '@/components/admin/CrosswordEditor'

export default function NewCrosswordPage() {
  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>новый кроссворд</h1>
      <CrosswordEditor draftId="new" />
    </div>
  )
}
