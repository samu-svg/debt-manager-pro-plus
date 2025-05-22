
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const DashboardCard = ({
  title,
  value,
  description,
  icon,
  footer,
  className
}: DashboardCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="w-8 h-8">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {footer && <div className="mt-4 text-sm">{footer}</div>}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
