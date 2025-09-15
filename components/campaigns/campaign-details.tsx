/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Users, CheckCircle, XCircle, MessageSquare, Target } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Campaign {
  _id: string
  name: string
  segmentId: string
  message: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface CampaignStats {
  audienceSize: number
  sent: number
  failed: number
  pending: number
}

interface CommunicationLog {
  _id: string
  customerId: string
  campaignId: string
  deliveryStatus: "PENDING" | "SENT" | "FAILED"
  vendorResponse?: {
    messageId?: string
    timestamp?: string
    errorMessage?: string
  }
  createdAt: string
  updatedAt: string
}

interface CampaignDetailsProps {
  campaignId: string
}

export function CampaignDetails({ campaignId }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCampaignDetails()
  }, [campaignId])

  const fetchCampaignDetails = async () => {
    try {
      const [campaignData, statsData, logsData] = await Promise.all([
        api.campaigns.getById(campaignId),
        api.campaigns.getStats(campaignId),
        api.communications.getByCampaign(campaignId),
      ])

      setCampaign(campaignData)
      setStats(statsData)
      setLogs(logsData)
    } catch (error) {
      toast({
        title: "Failed to load campaign",
        description: "Unable to fetch campaign details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "PENDING":
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!campaign || !stats) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
        <p className="text-muted-foreground mb-4">The campaign you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    )
  }

  const successRate = stats.audienceSize > 0 ? ((stats.sent / stats.audienceSize) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground font-playfair">{campaign.name}</h1>
          <p className="text-muted-foreground mt-2">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.audienceSize}</div>
            <p className="text-xs text-muted-foreground">customers targeted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successfully Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">{successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">delivery failures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">in queue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Campaign Message */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Message</CardTitle>
              <CardDescription>The message sent to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{campaign.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Info */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Campaign ID</Label>
              <p className="font-mono text-sm">{campaign._id}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Created By</Label>
              <p className="text-sm">{campaign.createdBy}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Created At</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{new Date(campaign.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Target Segment</Label>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{campaign.segmentId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Logs</CardTitle>
          <CardDescription>Detailed delivery status for each customer ({logs.length} records)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Message ID</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-sm">{log.customerId}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.deliveryStatus)}
                        <Badge className={getStatusColor(log.deliveryStatus)}>{log.deliveryStatus}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.vendorResponse?.timestamp
                        ? new Date(log.vendorResponse.timestamp).toLocaleString()
                        : new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.vendorResponse?.messageId || "-"}</TableCell>
                    <TableCell className="text-sm text-red-600">{log.vendorResponse?.errorMessage || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ className, children, ...props }: any) {
  return (
    <label className={`text-xs text-muted-foreground ${className || ""}`} {...props}>
      {children}
    </label>
  )
}
