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
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// const FormSchema = z.object({
//   id: z.string(),
//   customerId: z.string({
//     invalid_type_error: 'Please select a customer.',
//   }),
//   amount: z.coerce
//     .number()
//     .finite()
//     .positive()
//     .refine((amount) => {
//       const cents = amount * 100;
//       return (
//         Number.isSafeInteger(Math.round(cents)) &&
//         Math.abs(cents - Math.round(cents)) < 1e-7
//       );
//     }, 'Enter a valid amount with at most two decimal places.'),
//   status: z.enum(['pending', 'paid']),
//   date: z.string(),
// });


// Create a new Zod schema for the invoice creation form, omitting the 'id' and 'date' fields
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// Define a function to handle the creation of a new invoice
export async function createInvoice(prevState: State, formData: FormData) {

  // Validate form fields using Zod
  // safeParse() will return an object containing either a success or error field.
  // This will help handle validation more gracefully without having put this logic inside the try/catch block.
  const validatedFields = CreateInvoice.safeParse({

    // Extract the values from the FormData object and validate them using the Zod schema
    customerId: formData.get('customerId'),

    // Coerce the amount to a number using z.coerce.number() in the schema
    amount: formData.get('amount'),
    
    // Validate the status using the Zod enum
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  // If validatedFields isn't successful, we return the function early with the error messages from Zod.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

    // const { customerId, amount, status } = CreateInvoice.parse({
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // });


  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;

  // Convert the amount to cents (assuming the input is in dollars):
  const amountInCents = amount * 100;

  // Create a new date with the format "YYYY-MM-DD" for the invoice's creation date:
  const date = new Date().toISOString().split('T')[0];

// const amountInCents = Math.round(amount * 100);
// const date = new Date().toISOString().split('T')[0];

// Insert the new invoice into the database using the Postgres client
// Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

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

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

  // Simulate a database error for demonstration purposes
  throw new Error('Failed to Delete Invoice');

  // Unreachable code block: The following code will not be executed due to the error thrown above.
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
  
}