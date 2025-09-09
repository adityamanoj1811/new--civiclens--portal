"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LifecycleStep } from "@/lib/mock-data"
import { CheckCircle, Clock, AlertCircle, User, FileText } from "lucide-react"
import { format } from "date-fns"

interface IssueLifecycleTimelineProps {
  lifecycle: LifecycleStep[]
  className?: string
}

export function IssueLifecycleTimeline({ lifecycle, className }: IssueLifecycleTimelineProps) {
  const getStepIcon = (step: LifecycleStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-chart-2" />
      case "current":
        return <Clock className="h-5 w-5 text-primary" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStepColor = (step: LifecycleStep) => {
    switch (step.status) {
      case "completed":
        return "text-chart-2"
      case "current":
        return "text-primary"
      case "pending":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const getConnectorColor = (index: number) => {
    const currentStep = lifecycle[index]
    const nextStep = lifecycle[index + 1]

    if (currentStep.status === "completed") {
      return "bg-chart-2"
    } else if (currentStep.status === "current") {
      return "bg-primary"
    }
    return "bg-border"
  }

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader className="card-professional-content pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Issue Lifecycle</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="card-professional-content pt-0">
        <div className="space-y-6">
          {lifecycle.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < lifecycle.length - 1 && (
                <div
                  className={cn(
                    "absolute left-6 top-12 w-0.5 h-6 transition-colors duration-200",
                    getConnectorColor(index),
                  )}
                />
              )}

              {/* Step Content */}
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-200",
                    step.status === "completed" && "bg-chart-2/10 border-chart-2",
                    step.status === "current" && "bg-primary/10 border-primary",
                    step.status === "pending" && "bg-muted border-border",
                  )}
                >
                  {getStepIcon(step)}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={cn("font-semibold", getStepColor(step))}>{step.step}</h4>
                    <Badge
                      variant={
                        step.status === "completed" ? "default" : step.status === "current" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {step.status === "completed"
                        ? "Completed"
                        : step.status === "current"
                          ? "In Progress"
                          : "Pending"}
                    </Badge>
                  </div>

                  {/* Timestamp */}
                  {step.timestamp && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(step.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  )}

                  {/* Assigned To */}
                  {step.assignedTo && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span>Assigned to {step.assignedTo}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {step.notes && (
                    <p className="text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2 mt-2">{step.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
