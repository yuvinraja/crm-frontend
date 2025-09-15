import { MainLayout } from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AIAssistant } from "@/components/ai/ai-assistant"

export default function AIPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <AIAssistant />
      </MainLayout>
    </ProtectedRoute>
  )
}
