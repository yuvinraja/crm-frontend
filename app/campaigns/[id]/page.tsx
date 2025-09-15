import { MainLayout } from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { CampaignDetails } from "@/components/campaigns/campaign-details"

interface CampaignDetailsPageProps {
  params: {
    id: string
  }
}

export default function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  return (
    <ProtectedRoute>
      <MainLayout>
        <CampaignDetails campaignId={params.id} />
      </MainLayout>
    </ProtectedRoute>
  )
}
