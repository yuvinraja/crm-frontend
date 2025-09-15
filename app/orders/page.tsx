import { MainLayout } from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrderList } from "@/components/orders/order-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-playfair">Order Management</h1>
              <p className="text-muted-foreground mt-2">Track and manage customer orders</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Order
            </Button>
          </div>
          <OrderList />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
