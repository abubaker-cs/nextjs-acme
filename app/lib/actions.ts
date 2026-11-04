'use server';

// Note: Any functions included in this file that are not used will be 
// automatically removed from the final application bundle.

// Import the Zod library for schema validation
import { z } from 'zod';

// Import the revalidatePath function from Next.js to revalidate the cache for a specific path
import { revalidatePath } from 'next/cache';

// Import the redirect function from Next.js to handle redirection after form submission
import { redirect } from 'next/navigation';

// Import the Postgres library for database interactions
import postgres from 'postgres';

// Create a Postgres client using the connection URL from environment variables
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce
    .number()
    .finite()
    .positive()
    .refine((amount) => {
      const cents = amount * 100;
      return (
        Number.isSafeInteger(Math.round(cents)) &&
        Math.abs(cents - Math.round(cents)) < 1e-7
      );
    }, 'Enter a valid amount with at most two decimal places.'),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});


// Create a new Zod schema for the invoice creation form, omitting the 'id' and 'date' fields
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Define a function to handle the creation of a new invoice
export async function createInvoice(formData: FormData) {

    const { customerId, amount, status } = CreateInvoice.parse({
    
        // Extract the values from the FormData object and validate them using the Zod schema
        customerId: formData.get('customerId'),
        
        // Coerce the amount to a number using z.coerce.number() in the schema
        amount: formData.get('amount'),
        
        // Validate the status using the Zod enum
        status: formData.get('status'),
    
    });

// Convert the amount to cents (assuming the input is in dollars):
const amountInCents = Math.round(amount * 100);

// Create a new date with the format "YYYY-MM-DD" for the invoice's creation date:
const date = new Date().toISOString().split('T')[0];

// Insert the new invoice into the database using the Postgres client
await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

// Revalidate the cache for the '/dashboard/invoices' path to ensure that the new invoice is reflected in the UI  
// Once the database has been updated, the /dashboard/invoices path will be revalidated, 
// and fresh data will be fetched from the server.
revalidatePath('/dashboard/invoices');

// Redirect the user to the '/dashboard/invoices' page after successfully creating the invoice
redirect('/dashboard/invoices');

  // Test it out:
    //   console.log(rawFormData);
    //   console.log(typeof rawFormData.amount);

}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = Math.round(amount * 100);
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}