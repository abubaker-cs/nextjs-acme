import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// import { fetchLatestInvoices, fetchCardData } from '@/app/lib/data'; // removed fetchRevenue
import { fetchCardData } from '@/app/lib/data'; // Remove fetchLatestInvoices
import { Suspense } from 'react';
import CardWrapper from '@/app/ui/dashboard/cards';
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton } from '@/app/ui/skeletons';


export default async function Page() {

  // const revenue = await fetchRevenue();
  // const latestInvoices = await fetchLatestInvoices();

  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData(); // Wait for the card data to be fetched before rendering the page

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>

        {/* 01 Total Collected Amount */}
        {/* <Card title="Collected" value={totalPaidInvoices} type="collected" /> */}

        {/* 02 Total Pending Amount */}
        {/* <Card title="Pending" value={totalPendingInvoices} type="pending" /> */}
        
        {/* 03 Total Invoices */}
        {/* <Card title="Total Invoices" value={numberOfInvoices} type="invoices" /> */}
        
        {/* 04 Total Customers */}
        {/* <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        /> */}

      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}