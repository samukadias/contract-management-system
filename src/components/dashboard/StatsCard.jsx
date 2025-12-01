import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const colorMap = {
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    bgLight: "bg-blue-50"
  },
  green: {
    bg: "bg-green-500",
    text: "text-green-600",
    bgLight: "bg-green-50"
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-600",
    bgLight: "bg-orange-50"
  },
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    bgLight: "bg-purple-50"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, isLoading, progress, progressLabel }) {
  const colors = colorMap[color];

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardContent className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 break-words">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colors.bgLight} flex-shrink-0 ml-3`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
      {progress !== undefined && progress !== null && (
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso de Faturamento</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {progressLabel && (
            <p className="text-xs text-gray-500 mt-2 text-right break-words">{progressLabel}</p>
          )}
        </div>
      )}
    </Card>
  );
}
