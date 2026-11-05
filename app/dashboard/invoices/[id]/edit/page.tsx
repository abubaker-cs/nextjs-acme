import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  
  // Await the route parameters
  const params = await props.params;
  
  // Extract the invoice ID from the route parameters
  const id = params.id;

  // Fetch the invoice and customers in parallel
  const [invoice, customers] = await Promise.all([

    // Fetch the invoice by ID
    fetchInvoiceById(id),

    // Fetch the customers for the dropdown
    fetchCustomers(),

  ]);

  // 404 Error Handling: If the invoice is not found, trigger a 404 error page.
  // To show error UI to the user, create a not-found.tsx file inside the /edit folder.
  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}