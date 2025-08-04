/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from '@/db/db'
import { formatNumber, formatCurrency } from "@/lib/formatter";

export default async function AdminDashboard() {
  const [salesData, userData] = await Promise.all([
 getSalesData(), getUserData()
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      <DashboardCard title="Sales" subtitle={`${formatNumber(salesData.numerOfSales)} orders`} body={formatCurrency(salesData.amount)} />
      <DashboardCard title="Customers" subtitle={ `${formatCurrency(userData.averageValuePerUser)} Average Value`} body={formatNumber(userData.userCount)} />
     
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

async function getSalesData(){
 const data = await db.order.aggregate({
    _sum: {pricePaidInCents: true},
    _count: true
  })

  return{
    amount: (data._sum.pricePaidInCents || 0 )/100,
    numerOfSales: data._count
  }
}

async function getUserData(){
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    
    db.order.aggregate({
    _sum: {pricePaidInCents: true}
    }),
  ])

  return {
    userCount, averageValuePerUser: userCount === 0 ? 0: (orderData._sum.pricePaidInCents || 0)
/ userCount / 100  }
}

async function getProductData(){
  db.product.count({where: {isAvailableForPurchase: true}})
  db.product.count({where: {isAvailableForPurchase: false}})
}
function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
